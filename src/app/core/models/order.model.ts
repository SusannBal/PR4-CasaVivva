export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
export type PaymentStatus = 'pendiente' | 'pagado' | 'reembolsado';

export interface OrderUser {
    full_name?: string;
    email?: string;
}

export interface Order {
    id: string;
    user_id: string;
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    shipping_address: string;
    shipping_city: string;
    shipping_phone: string;
    notes: string | null;
    created_at: string;
    updated_at: string;

    user?: OrderUser;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    quantity: number;
    price_at_purchase: number;
    created_at: string;
}