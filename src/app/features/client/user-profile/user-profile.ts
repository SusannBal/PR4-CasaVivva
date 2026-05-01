import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  imports: [RouterLink, FormsModule, DatePipe, ButtonModule, InputTextModule, MessageModule],
  templateUrl: './user-profile.html'
})
export class UserProfile implements OnInit {
  auth = inject(AuthService);

  fullName = signal('');
  phone = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit() {
    const profile = this.auth.profile();
    if (profile) {
      this.fullName.set(profile.full_name ?? '');
      this.phone.set(profile.phone ?? '');
    }
  }

  async onSave() {
    if (!this.fullName().trim()) {
      this.error.set('El nombre no puede estar vacío');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const { error } = await this.auth.updateProfile({
      full_name: this.fullName().trim(),
      phone: this.phone().trim() || undefined
    });

    this.loading.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.success.set(true);
      setTimeout(() => this.success.set(false), 3000);
    }
  }
}
