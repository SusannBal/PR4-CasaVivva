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
    
    // 1. Registro en Supabase Auth
    const { data, error: authError } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) {
      this._loading.set(false);
      return { data, error: authError };
    }

    // 2. Si el registro fue exitoso y tenemos un usuario, crear perfil manual por si no hay trigger
    if (data.user) {
      const { error: profileError } = await this.supabase.client
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: 'cliente' // Por defecto
        });
      
      if (profileError) {
        console.error('Error creando perfil manual:', profileError);
        // No bloqueamos el flujo, pero lo logueamos
      }
    }

    this._loading.set(false);
    return { data, error: null };
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

  /**
   * Actualiza los datos del perfil del usuario
   */
  async updateProfile(data: {
    full_name?: string;
    phone?: string;
  }): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'No autenticado' };

    const { error } = await this.supabase.client
      .from('profiles')
      .update({ ...data })
      .eq('id', user.id);

    if (error) return { error: 'Error al actualizar el perfil' };

    // Actualizar el signal local sin recargar
    this._profile.update(p => p ? { ...p, ...data } : p);

    return { error: null };
  }
}