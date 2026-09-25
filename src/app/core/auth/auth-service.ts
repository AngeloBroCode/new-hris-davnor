import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@core/config/tokens';
import { User } from '../../shared/models/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── API Configuration ───────────────────────────────────────────────────────
const API_BASE_URL = 'http://172.16.0.23:8080';
const LOGIN_ENDPOINT = '/api/auth/Login';

// ─── Storage keys ────────────────────────────────────────────────────────────
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const USERNAME_KEY = 'username';

// ─── Flexible field-name matching (normalized: lowercase, no _ or -) ─────────
const TOKEN_KEYS = ['token', 'accesstoken', 'jwt', 'jwttoken', 'bearertoken', 'idtoken'];
const FIRST_NAME_KEYS = ['firstname', 'fname', 'givenname', 'empfname', 'employeefirstname'];
const LAST_NAME_KEYS = ['lastname', 'lname', 'surname', 'familyname', 'emplname', 'employeelastname'];
const FULL_NAME_KEYS = ['fullname', 'employeename', 'empname', 'displayname', 'completename', 'name'];
const POSITION_KEYS = [
  'positiontitle', 'position', 'positionname', 'designation',
  'jobtitle', 'empposition', 'rolename', 'role',
];
const MESSAGE_KEYS = ['message', 'error', 'errormessage', 'detail', 'title'];
const EIC_KEYS = ['eic', 'usereic', 'employeeeic', 'empeic'];
const SUCCESS_FLAGS = ['success', 'issuccess', 'succeeded', 'isauthenticated', 'authenticated'];
const CONTAINER_KEYS = ['data', 'result', 'payload', 'response', 'user', 'employee', 'userinfo', 'details'];

const ERROR_TEXT = /invalid|incorrect|wrong|fail|denied|unauthor|not\s*found|no\s*record|error|expired|lock/i;

// ─── Public types ────────────────────────────────────────────────────────────

export interface LoginResult {
  /** True when the credentials were accepted. */
  authenticated: boolean;
  /** The token that was stored, when the API returned one. */
  token: string | null;
  /** Message from the API, used for the on-screen error when the login failed. */
  message: string | null;
  /** The untouched response body, for anything the rest of the app needs. */
  raw: unknown;
}

/** Shown by pages that need the signed-in employee's EIC when the session has none. */
export const EIC_MISSING_MESSAGE =
  'Your employee EIC was not found in your login session. Sign out and sign in again, or contact your HR administrator.';

@Service()
export class AuthService {
  private readonly _router = inject(Router);
  private readonly _localStorage = inject(LOCAL_STORAGE);
  private readonly _http = inject(HttpClient);

  private readonly _currentUser = signal<User | null>(null);
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._currentUser());

  // ─── Public API ──────────────────────────────────────────────────────────

  setUser(user: User): void {
    this._currentUser.set(user);
  }

  /**
   * Authenticates against POST /api/Accounts/Login using the DtoUserCredentials
   * schema (username, password). The response is interpreted flexibly, following
   * the same pattern as the old HRIS project.
   */
  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response: unknown = await firstValueFrom(
        this._http.post(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
          username,
          password,
          isMobile: false,
        })
      );

      const result = this.interpret(response);

      if (result.authenticated) {
        this.persist(result, response, username);
        this.setUser(this.buildUserFromResponse(response, username));
        return { success: true };
      }

      return { success: false, message: result.message ?? 'Invalid username or password.' };
    } catch (error: unknown) {
      return { success: false, message: this.describeHttpError(error) };
    }
  }

  logout(): Promise<boolean> {
    this._currentUser.set(null);
    if (this._localStorage) {
      this._localStorage.removeItem(TOKEN_KEY);
      this._localStorage.removeItem(USER_KEY);
      this._localStorage.removeItem(USERNAME_KEY);
    }
    return this._router.navigate(['/login']);
  }

  /** Returns the stored auth token, or null when not logged in. */
  getToken(): string | null {
    return this._localStorage?.getItem(TOKEN_KEY) ?? null;
  }

  /** Returns true when a token exists in storage. */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * The signed-in employee's EIC, or null when the login response has none.
   */
  getEic(): string | null {
    if (!this.isLoggedIn()) return null;
    const raw = this.readStoredUser();
    return this.findDeep(raw, EIC_KEYS);
  }

  /**
   * Re-hydrate the in-memory user from localStorage when the page is
   * refreshed. Called by the auth guard to avoid losing the session on
   * navigation or hard refresh.
   */
  restoreSession(): boolean {
    if (this._currentUser()) return true;

    const token = this._localStorage?.getItem(TOKEN_KEY);
    if (!token) return false;

    const raw = this.readStoredUser();
    const username = this._localStorage?.getItem(USERNAME_KEY) ?? '';

    this.setUser(this.buildUserFromResponse(raw, username));
    return true;
  }

  // ─── Response interpretation (ported from old HRIS) ──────────────────────

  /** Decide whether a 200 response actually represents a successful login. */
  private interpret(response: unknown): LoginResult {
    const bare = this.bareString(response);
    const bareIsRejection = bare !== null && ERROR_TEXT.test(bare);

    const token = this.pick(response, TOKEN_KEYS) ?? (bareIsRejection ? null : bare);
    const message = this.pick(response, MESSAGE_KEYS) ?? bare;

    // An explicit success/failure flag always wins.
    const flag = this.successFlag(response);
    if (flag === false) {
      return { authenticated: false, token: null, message, raw: response };
    }
    if (token) {
      return { authenticated: true, token, message, raw: response };
    }
    if (flag === true) {
      return { authenticated: true, token: null, message, raw: response };
    }

    // No token and no flag: fall back to the message, if it reads like a rejection.
    if (message && ERROR_TEXT.test(message)) {
      return { authenticated: false, token: null, message, raw: response };
    }

    // HTTP 200 with nothing that looks like a rejection — treat it as signed in.
    console.warn(
      '[Auth] Login succeeded but no token was found in the response. Response was:',
      response
    );
    return { authenticated: true, token: null, message, raw: response };
  }

  // ─── Persistence helpers ─────────────────────────────────────────────────

  private persist(result: LoginResult, response: unknown, username: string): void {
    if (!this._localStorage) return;

    this._localStorage.setItem(TOKEN_KEY, result.token ?? 'authenticated');
    this._localStorage.setItem(USERNAME_KEY, username);

    if (response && typeof response === 'object') {
      this._localStorage.setItem(USER_KEY, JSON.stringify(response));
    }
  }

  private readStoredUser(): unknown {
    const stored = this._localStorage?.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Build a User object from the login response using flexible key matching.
   * This adapts whatever the API returns to the app's User interface.
   */
  private buildUserFromResponse(raw: unknown, username: string): User {
    const firstName = this.pick(raw, FIRST_NAME_KEYS);
    const lastName = this.pick(raw, LAST_NAME_KEYS);
    const fullName = this.pick(raw, FULL_NAME_KEYS);
    const position = this.pick(raw, POSITION_KEYS);

    const fromParts = [firstName, lastName].filter(Boolean).join(' ').trim();
    const displayName = fromParts || fullName || username || 'User';

    const eic = this.findDeep(raw, EIC_KEYS);

    return {
      id: eic || this.pick(raw, ['id', 'userid', 'empid', 'employeeid']) || '1',
      name: displayName,
      email: this.pick(raw, ['email', 'emailaddress', 'empemail']) || username,
      role: (position as User['role']) || 'admin',
      avatar: this.pick(raw, ['avatar', 'photo', 'profilepicture', 'image']) || '',
      phoneNumber: this.pick(raw, ['phonenumber', 'phone', 'mobile', 'contactnumber']) || '',
      status: 'active',
      createdAt: new Date(),
    };
  }

  // ─── HTTP error helper ───────────────────────────────────────────────────

  private describeHttpError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong. Please try again.';
    }

    if (error.status === 0) {
      return 'Cannot reach the server. Please check your connection and try again.';
    }

    if (error.status === 401 || error.status === 400) {
      return this.messageFrom(error.error) ?? 'Invalid username or password.';
    }

    return this.messageFrom(error.error) ?? 'Something went wrong. Please try again.';
  }

  private messageFrom(payload: unknown): string | null {
    if (typeof payload === 'string' && payload.trim()) return payload;
    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      for (const key of ['message', 'error', 'errorMessage', 'title', 'detail']) {
        const value = record[key];
        if (typeof value === 'string' && value.trim()) return value;
      }
    }
    return null;
  }

  // ─── Flexible key-matching utilities (from old HRIS) ─────────────────────

  private bareString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  /**
   * Find the first candidate key in the payload, matching key names loosely
   * (case and separators ignored). Looks at the top level first, then one
   * level down into the usual wrapper objects.
   */
  private pick(payload: unknown, candidates: string[]): string | null {
    if (!payload || typeof payload !== 'object') return null;

    const direct = this.pickFrom(payload as Record<string, unknown>, candidates);
    if (direct) return direct;

    const record = payload as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (!CONTAINER_KEYS.includes(this.normalize(key))) continue;
      const nested = record[key];
      if (nested && typeof nested === 'object') {
        const value = this.pickFrom(nested as Record<string, unknown>, candidates);
        if (value) return value;
      }
    }
    return null;
  }

  /** Like pick(), but searches the whole payload up to 5 levels deep. */
  private findDeep(value: unknown, candidates: string[], depth = 0): string | null {
    if (depth > 5 || value === null || value === undefined) return null;

    if (typeof value === 'string') {
      const text = value.trim();
      if (!text.startsWith('{') && !text.startsWith('[')) return null;
      try {
        return this.findDeep(JSON.parse(text), candidates, depth + 1);
      } catch {
        return null;
      }
    }

    if (typeof value !== 'object') return null;

    const direct = this.pickFrom(value as Record<string, unknown>, candidates);
    if (direct) return direct;

    for (const child of Object.values(value as Record<string, unknown>)) {
      const nested = this.findDeep(child, candidates, depth + 1);
      if (nested) return nested;
    }
    return null;
  }

  private pickFrom(record: Record<string, unknown>, candidates: string[]): string | null {
    const byNormalizedKey = new Map<string, unknown>();
    for (const key of Object.keys(record)) {
      byNormalizedKey.set(this.normalize(key), record[key]);
    }

    for (const candidate of candidates) {
      const value = byNormalizedKey.get(candidate);
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number') return String(value);
    }
    return null;
  }

  private successFlag(response: unknown): boolean | null {
    if (!response || typeof response !== 'object') return null;
    const record = response as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (SUCCESS_FLAGS.includes(this.normalize(key)) && typeof record[key] === 'boolean') {
        return record[key] as boolean;
      }
    }
    return null;
  }

  private normalize(key: string): string {
    return key.toLowerCase().replace(/[_-]/g, '');
  }
}
