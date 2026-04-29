import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-recover-password',
    imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, MessageModule],
    templateUrl: './recover-password.html'
})
export class RecoverPassword {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);

    errorMessage = signal<string>('');
    successMessage = signal<string>('');

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]]
    });

    loading = this.auth.loading;

    async submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.errorMessage.set('');
        this.successMessage.set('');

        const { email } = this.form.getRawValue();
        const { error } = await this.auth.resetPassword(email);

        if (error) {
            this.errorMessage.set('No pudimos enviar el email. Verificá la dirección.');
        } else {
            this.successMessage.set('¡Listo! Revisá tu correo para restablecer la contraseña.');
            this.form.reset();
        }
    }
}