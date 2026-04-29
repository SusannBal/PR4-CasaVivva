import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session = signal<Session | null>(null);

  // Estado público reactivo
  readonly session = this._session.asReadonly();
  readonly user = computed(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this._session());

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Sincronizar sesión al iniciar
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session.set(session);
    });

    // Escuchar cambios de auth
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
    });
  }

  /** Acceso al cliente crudo de Supabase para queries personalizadas */
  get client(): SupabaseClient {
    return this.supabase;
  }
}