import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Favorite } from '../models/favorite.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private supabase = inject(SupabaseService);

  private _favorites = signal<Favorite[]>([]);
  private _loading = signal(false);

  readonly favorites = this._favorites.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Set de IDs para lookup O(1)
  readonly favoriteIds = computed(() =>
    new Set(this._favorites().map(f => f.product_id))
  );

  readonly favoriteCount = computed(() => this._favorites().length);

  constructor() {
    // Cargar favoritos al autenticarse
    effect(() => {
      const user = this.supabase.user();
      if (user) {
        this.loadFavorites();
      } else {
        this._favorites.set([]);
      }
    });
  }

  async loadFavorites() {
    const user = this.supabase.user();
    if (!user) return;

    this._loading.set(true);

    const { data } = await this.supabase.client
      .from('favorites')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    this._favorites.set((data as Favorite[]) ?? []);
    this._loading.set(false);
  }

  /**
   * Toggle: agrega si no está, quita si está
   */
  async toggleFavorite(product: Product): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'Debés iniciar sesión para guardar favoritos' };

    if (this.isFavorite(product.id)) {
      return await this.removeFavorite(product.id);
    } else {
      return await this.addFavorite(product.id);
    }
  }

  private async addFavorite(productId: string): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'No autenticado' };

    const { data, error } = await this.supabase.client
      .from('favorites')
      .insert({ user_id: user.id, product_id: productId })
      .select('*, product:products(*)')
      .single();

    if (error) return { error: 'Error al guardar el favorito' };

    this._favorites.update(favs => [data as Favorite, ...favs]);
    return { error: null };
  }

  private async removeFavorite(productId: string): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'No autenticado' };

    const { error } = await this.supabase.client
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) return { error: 'Error al eliminar el favorito' };

    this._favorites.update(favs => favs.filter(f => f.product_id !== productId));
    return { error: null };
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().has(productId);
  }
}
