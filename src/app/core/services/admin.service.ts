import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderStatus } from '../models/order.model';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private supabase = inject(SupabaseService);

  /**
   * Estadísticas generales del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [ordersResult, todayResult, productsResult, lowStockResult] =
      await Promise.all([
        // Todos los pedidos
        this.supabase.client
          .from('orders')
          .select('total, status, created_at'),

        // Pedidos de hoy
        this.supabase.client
          .from('orders')
          .select('total')
          .gte('created_at', today.toISOString()),

        // Total de productos activos
        this.supabase.client
          .from('products')
          .select('id', { count: 'exact' })
          .eq('active', true),

        // Productos con stock bajo (< 5)
        this.supabase.client
          .from('products')
          .select('id', { count: 'exact' })
          .lt('stock', 5)
          .eq('active', true)
      ]);

    const orders = ordersResult.data ?? [];
    const todayOrders = todayResult.data ?? [];

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter((o: any) => o.status === 'pendiente').length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + Number(o.total), 0),
      todayRevenue: todayOrders.reduce((sum: number, o: any) => sum + Number(o.total), 0),
      totalProducts: productsResult.count ?? 0,
      lowStockProducts: lowStockResult.count ?? 0
    };
  }

  /**
   * Últimos pedidos para el dashboard
   */
  async getRecentOrders(limit = 5): Promise<Order[]> {
    const { data } = await this.supabase.client
      .from('orders')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data as Order[]) ?? [];
  }

  /**
   * Lista todos los pedidos con filtro por estado y/o usuario
   */
  async getAllOrders(status?: OrderStatus, userId?: string): Promise<Order[]> {
    let query = this.supabase.client
      .from('orders')
      .select('*, user:profiles(full_name, email), items:order_items(*)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as Order[]) ?? [];
  }

  /**
   * Cambia el estado de un pedido
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    paymentStatus?: 'pendiente' | 'pagado' | 'reembolsado'
  ): Promise<{ error: string | null }> {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { error } = await this.supabase.client
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    return { error: error ? 'Error al actualizar el pedido' : null };
  }
}
