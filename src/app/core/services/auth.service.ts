import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private _profile = signal<Profile | null>(null);
  private _loading = signal<boolean>(false);

  // Estado público
  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = this.supabase.isAuthenticated;
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly isClient = computed(() => this._profile()?.role === 'cliente');

  constructor() {
    // Cuando cambia la sesión, cargar el perfil
    effect(() => {
      const session = this.supabase.session();
      if (session) {
        this.loadProfile(session.user.id);
      } else {
        this._profile.set(null);
      }
    });
  }

  /** Carga el perfil completo desde la tabla profiles */
  private async loadProfile(userId: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error);
      return;
    }
    this._profile.set(data as Profile);
  }

  /** Registrar nuevo usuario */
  async signUp(email: string, password: string, fullName: string) {
    this._loading.set(true);
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    this._loading.set(false);
    return { data, error };
  }

  /** Iniciar sesión */
  async signIn(email: string, password: string) {
    this._loading.set(true);
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    this._loading.set(false);
    return { data, error };
  }

  /** Cerrar sesión */
  async signOut() {
    this._loading.set(true);
    await this.supabase.client.auth.signOut();
    this._loading.set(false);
    this.router.navigate(['/']);
  }

  /** Recuperar contraseña - envía email */
  async resetPassword(email: string) {
    this._loading.set(true);
    const { data, error } = await this.supabase.client.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/login` }
    );
    this._loading.set(false);
    return { data, error };
  }
}