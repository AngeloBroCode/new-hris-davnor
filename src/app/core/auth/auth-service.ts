import { Service, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LOCAL_STORAGE } from '@core/config/tokens';
import { User } from '../../shared/models/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Service()
export class AuthService {
  private readonly _router = inject(Router);
  private readonly _localStorage = inject(LOCAL_STORAGE);
  private readonly _http = inject(HttpClient);

  private readonly _currentUser = signal<User | null>(null);
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._currentUser());

  setUser(user: User): void {
    this._currentUser.set(user);
  }

  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response: any = await firstValueFrom(
        this._http.post('http://172.16.0.23:8080/api/auth/Login', {
          username: username,
          password: password,
          isMobile: false,
        })
      );

      let token = response?.token || response?.accesstoken || response?.jwt || response?.jwttoken || response?.bearertoken || response?.idtoken;
      
      if (!token && typeof response === 'string' && response.trim()) {
        token = response.trim();
      }

      if (token) {
        this._localStorage?.setItem('token', token);
        this._localStorage?.setItem('user', JSON.stringify(response));

        const firstName = response?.firstname || response?.fname || response?.empfname;
        const lastName = response?.lastname || response?.lname || response?.emplname;
        const fullName = response?.fullname || response?.employeename || response?.name;
        
        const displayName = [firstName, lastName].filter(Boolean).join(' ') || fullName || username;

        this.setUser({
          id: response?.id || '1',
          name: displayName,
          email: username,
          role: response?.position || 'admin',
          avatar: response?.avatar || '',
          phoneNumber: response?.phoneNumber || response?.phone || '',
          status: response?.status || 'active',
          createdAt: response?.createdAt ? new Date(response.createdAt) : new Date(),
        });
        
        return { success: true };
      }

      const message = response?.message || response?.error || response?.errormessage || (typeof response === 'string' ? response : 'Login failed');
      return { success: false, message };
    } catch (error: any) {
      let msg = 'Cannot reach the server. Please check your connection and try again.';
      if (error instanceof HttpErrorResponse) {
        if (error.status !== 0) {
           msg = error.error?.message || error.error?.error || error.error?.title || (typeof error.error === 'string' ? error.error : 'Invalid username or password.');
        }
      }
      return { success: false, message: msg };
    }
  }

  logout(): Promise<boolean> {
    this._currentUser.set(null);
    this._localStorage?.removeItem('token');
    return this._router.navigate(['/login']);
  }
}
