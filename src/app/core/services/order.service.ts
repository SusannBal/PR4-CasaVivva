import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem } from '../models/cart-item.model';
import { Order } from '../models/order.model';

export interface CheckoutData {
    shipping_address: string;
    shipping_city: string;
    shipping_phone: string;
    notes?: string;
    payment_method: 'tarjeta' | 'qr' | 'contra_entrega';
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    private supabase = inject(SupabaseService);

    /**
     * Crea un pedido completo desde el carrito
     * 1. Inserta la orden
     * 2. Inserta los order_items (con precio actual)
     * 3. Devuelve el ID del pedido creado
     */
    async createOrder(
        cartItems: CartItem[],
        checkoutData: CheckoutData
    ): Promise<{ orderId: string | null; error: string | null }> {
        if (!this.supabase.isAuthenticated()) {
            return { orderId: null, error: 'Debes iniciar sesión' };
        }

        if (cartItems.length === 0) {
            return { orderId: null, error: 'El carrito está vacío' };
        }

        const userId = this.supabase.user()!.id;

        // Calcular total
        const total = cartItems.reduce((acc, item) => {
            return acc + (item.product?.price ?? 0) * item.quantity;
        }, 0);

        // 1. Crear la orden
        const { data: orderData, error: orderError } = await this.supabase.client
            .from('orders')
            .insert({
                user_id: userId,
                total,
                status: 'confirmado',
                payment_status: 'pagado',
                shipping_address: checkoutData.shipping_address,
                shipping_city: checkoutData.shipping_city,
                shipping_phone: checkoutData.shipping_phone,
                notes: checkoutData.notes || null
            })
            .select('id')
            .single();

        if (orderError) {
            console.error('Error creando orden:', orderError);
            return { orderId: null, error: 'Error al crear el pedido' };
        }

        const orderId = orderData.id;

        // 2. Crear los order_items
        const orderItems = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            product_name: item.product?.name ?? 'Producto',
            quantity: item.quantity,
            price_at_purchase: item.product?.price ?? 0
        }));

        const { error: itemsError } = await this.supabase.client
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Error creando items del pedido:', itemsError);
            // La orden ya fue creada, intentar eliminarla
            await this.supabase.client.from('orders').delete().eq('id', orderId);
            return { orderId: null, error: 'Error al procesar los productos del pedido' };
        }

        return { orderId, error: null };
    }

    /**
     * Obtiene un pedido por ID con sus items
     */
    async getOrderById(orderId: string): Promise<Order | null> {
        const { data, error } = await this.supabase.client
            .from('orders')
            .select('*, user:profiles(full_name, email), items:order_items(*)')
            .eq('id', orderId)
            .single();

        if (error) return null;
        return data as Order;
    }

    /**
     * Lista todos los pedidos del usuario autenticado
     */
    async getMyOrders(): Promise<Order[]> {
        const { data } = await this.supabase.client
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('user_id', this.supabase.user()!.id)
            .order('created_at', { ascending: false });

        return (data as Order[]) || [];
    }
}