import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
    templateUrl: './login.html'
})
export class Login {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    errorMessage = signal<string>('');

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    loading = this.auth.loading;

    async submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage.set('');
        const { email, password } = this.form.getRawValue();
        const { error } = await this.auth.signIn(email, password);

        if (error) {
            this.errorMessage.set(this.translateError(error.message));
        } else {
            this.router.navigate(['/']);
        }
    }

    private translateError(msg: string): string {
        if (msg.includes('Invalid login credentials')) return 'Email o contraseña incorrectos';
        if (msg.includes('Email not confirmed')) return 'Por favor verificá tu email primero';
        return 'Error al iniciar sesión. Intentalo de nuevo.';
    }
}