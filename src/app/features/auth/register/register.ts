import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, MessageModule],
    templateUrl: './register.html'
})
export class Register {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    errorMessage = signal<string>('');
    successMessage = signal<string>('');

    form = this.fb.nonNullable.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
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
        this.successMessage.set('');

        const { email, password, fullName } = this.form.getRawValue();
        const { error } = await this.auth.signUp(email, password, fullName);

        if (error) {
            this.errorMessage.set(this.translateError(error.message));
            return;
        }

        this.successMessage.set('¡Cuenta creada! Revisá tu email para confirmar (te redirigimos en 3 seg)');
        setTimeout(() => this.router.navigate(['/login']), 3000);
    }

    private translateError(msg: string): string {
        if (msg.includes('already registered')) return 'Este email ya está registrado';
        if (msg.includes('weak password')) return 'La contraseña es muy débil';
        return 'Error al crear cuenta. Intentalo de nuevo.';
    }
}