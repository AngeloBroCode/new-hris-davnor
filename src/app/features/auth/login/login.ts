import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { svglGithubDark, svglGoogle } from '@ng-icons/svgl';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCard } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { AuthLayout } from '../layout';
import { AuthService } from '@core/auth/auth-service';

@Component({
  selector: 'adm-login',
  imports: [
    HlmButtonImports,
    NgIcon,
    HlmFieldImports,
    HlmInputImports,
    HlmCheckboxImports,
    HlmLabelImports,
    HlmSpinnerImports,
    HlmCheckboxImports,
    HlmInputGroupImports,
    TranslocoModule,
    HlmCard,
    RouterLink,
    AuthLayout,
    FormField,
    FormRoot,
  ],
  providers: [
    provideIcons({
      svglGithubDark,
      lucideEye,
      lucideEyeOff,
      svglGoogle,
    }),
  ],
  templateUrl: './login.html',
})
export default class Login {
  // ==========================================
  // Services
  // ==========================================

  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _authService = inject(AuthService);

  // ==========================================
  // State
  // ==========================================

  protected readonly showPassword = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly loginModel = signal({
    username: '',
    password: '',
  });

  protected readonly loginForm = form(
    this.loginModel,
    (schema) => {
      required(schema.username);
      required(schema.password);
    },
    {
      submission: {
        action: async () => this.onLogin(),
      },
    }
  );

  // ==========================================
  // Private Methods
  // ==========================================

  async onLogin(): Promise<void> {
    this.serverError.set(null);
    const { username, password } = this.loginModel();

    const result = await this._authService.login(username, password);

    if (result.success) {
      void this._router.navigateByUrl(this.returnUrl());
    } else {
      this.serverError.set(result.message || 'Login failed.');
    }
  }

  /**
   * Where to go after signing in: the page the login guard sent us from, when
   * it is an in-app path, otherwise the dashboard.
   */
  private returnUrl(): string {
    const target = this._route.snapshot.queryParamMap.get('returnUrl') ?? '';
    const inApp = target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\');
    return inApp && !target.startsWith('/login') ? target : '/dashboard';
  }
}
