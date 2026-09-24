import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
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
  private readonly _authService = inject(AuthService);

  // ==========================================
  // State
  // ==========================================

  protected readonly showPassword = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly loginModel = signal({
    username: 'admin',
    password: 'admin',
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
      this._router.navigate(['/dashboard']);
    } else {
      this.serverError.set(result.message || 'Login failed.');
    }
  }
}
