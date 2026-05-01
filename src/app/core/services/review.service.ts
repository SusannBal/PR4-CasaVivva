import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Review } from '../models/review.model';

export interface CreateReviewData {
  productId: string;
  rating: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private supabase = inject(SupabaseService);

  /**
   * Obtiene las reseñas de un producto (con datos del usuario)
   */
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    const { data, error } = await this.supabase.client
      .from('reviews')
      .select('*, user:profiles(full_name, email)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data as Review[]) ?? [];
  }

  /**
   * Crea una nueva reseña
   */
  async createReview(data: CreateReviewData): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'Debés iniciar sesión para dejar una reseña' };

    const { error } = await this.supabase.client
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id: data.productId,
        rating: data.rating,
        comment: data.comment ?? null
      });

    if (error) {
      if (error.code === '23505') {
        return { error: 'Ya dejaste una reseña para este producto' };
      }
      return { error: 'Error al guardar la reseña' };
    }

    return { error: null };
  }

  /**
   * Verifica si el usuario ya reseñó el producto
   */
  async hasReviewed(productId: string): Promise<boolean> {
    const user = this.supabase.user();
    if (!user) return false;

    const { data } = await this.supabase.client
      .from('reviews')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    return !!data;
  }

  /**
   * Verifica si el usuario compró el producto
   * (tiene alguna orden entregada con ese producto)
   */
  async hasPurchased(productId: string): Promise<boolean> {
    const user = this.supabase.user();
    if (!user) return false;

    const { data } = await this.supabase.client
      .from('orders')
      .select('id, items:order_items!inner(product_id)')
      .eq('user_id', user.id)
      .eq('status', 'entregado')
      .eq('order_items.product_id', productId)
      .maybeSingle();

    return !!data;
  }

  /**
   * Elimina la reseña del usuario para un producto
   */
  async deleteReview(productId: string): Promise<{ error: string | null }> {
    const user = this.supabase.user();
    if (!user) return { error: 'No autenticado' };

    const { error } = await this.supabase.client
      .from('reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    return { error: error ? 'Error al eliminar la reseña' : null };
  }
}
