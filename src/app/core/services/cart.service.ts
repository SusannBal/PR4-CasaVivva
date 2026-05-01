import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
    private supabase = inject(SupabaseService);
    private router = inject(Router);

    // Estado del carrito
    private _items = signal<CartItem[]>([]);
    private _loading = signal<boolean>(false);

    // Público readonly
    readonly items = this._items.asReadonly();
    readonly loading = this._loading.asReadonly();

    // Computed
    readonly itemCount = computed(() =>
        this._items().reduce((acc, item) => acc + item.quantity, 0)
    );

    readonly subtotal = computed(() =>
        this._items().reduce((acc, item) => {
            const price = item.product?.price ?? 0;
            return acc + price * item.quantity;
        }, 0)
    );

    readonly isEmpty = computed(() => this._items().length === 0);

    /**
     * Carga el carrito del usuario desde Supabase.
     * Se llama al hacer login o al iniciar la app si hay sesión.
     */
    async loadCart() {
        if (!this.supabase.isAuthenticated()) {
            this._items.set([]);
            return;
        }

        this._loading.set(true);

        const { data, error } = await this.supabase.client
            .from('cart_items')
            .select('*, product:products(*)')
            .eq('user_id', this.supabase.user()!.id)
            .order('created_at', { ascending: true });

        if (!error) {
            this._items.set((data as CartItem[]) || []);
        }

        this._loading.set(false);
    }

    /**
     * Agrega un producto al carrito.
     * - Si ya existe, incrementa la cantidad.
     * - Si el usuario no está logueado, redirige al login.
     */
    async addItem(productId: string, quantity: number = 1, returnUrl?: string): Promise<boolean> {
        if (!this.supabase.isAuthenticated()) {
            this.router.navigate(['/login'], {
                queryParams: { returnUrl: returnUrl || '/carrito' }
            });
            return false;
        }

        const userId = this.supabase.user()!.id;
        const existingItem = this._items().find(i => i.product_id === productId);

        if (existingItem) {
            // Ya está en el carrito → incrementar cantidad
            return await this.updateQuantity(existingItem.id, existingItem.quantity + quantity);
        }

        // Nuevo item
        const { data, error } = await this.supabase.client
            .from('cart_items')
            .insert({ user_id: userId, product_id: productId, quantity })
            .select('*, product:products(*)')
            .single();

        if (error) {
            console.error('Error agregando al carrito:', error);
            return false;
        }

        this._items.update(items => [...items, data as CartItem]);
        return true;
    }

    /**
     * Actualiza la cantidad de un item
     */
    async updateQuantity(cartItemId: string, newQuantity: number): Promise<boolean> {
        if (newQuantity < 1) {
            return await this.removeItem(cartItemId);
        }

        const { error } = await this.supabase.client
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', cartItemId);

        if (error) {
            console.error('Error actualizando cantidad:', error);
            return false;
        }

        this._items.update(items =>
            items.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            )
        );

        return true;
    }

    /**
     * Elimina un item del carrito
     */
    async removeItem(cartItemId: string): Promise<boolean> {
        const { error } = await this.supabase.client
            .from('cart_items')
            .delete()
            .eq('id', cartItemId);

        if (error) {
            console.error('Error eliminando del carrito:', error);
            return false;
        }

        this._items.update(items => items.filter(item => item.id !== cartItemId));
        return true;
    }

    /**
     * Vacía el carrito completo (después de una compra)
     */
    async clearCart(): Promise<void> {
        if (!this.supabase.isAuthenticated()) return;

        await this.supabase.client
            .from('cart_items')
            .delete()
            .eq('user_id', this.supabase.user()!.id);

        this._items.set([]);
    }

    /**
     * Verifica si un producto ya está en el carrito
     */
    isInCart(productId: string): boolean {
        return this._items().some(item => item.product_id === productId);
    }

    /**
     * Obtiene la cantidad de un producto en el carrito
     */
    getQuantityInCart(productId: string): number {
        return this._items().find(i => i.product_id === productId)?.quantity ?? 0;
    }
}