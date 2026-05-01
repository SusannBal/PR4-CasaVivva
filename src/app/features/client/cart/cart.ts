import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, ButtonModule],
  templateUrl: './cart.html'
})
export class Cart {
  cartService = inject(CartService);

  shipping = 30; // Bs. fijo por ahora

  total = computed(() =>
    this.cartService.subtotal() + (this.cartService.isEmpty() ? 0 : this.shipping)
  );

  freeShipping = computed(() => this.cartService.subtotal() >= 500);
  finalTotal = computed(() =>
    this.freeShipping()
      ? this.cartService.subtotal()
      : this.cartService.subtotal() + this.shipping
  );

  async increment(cartItemId: string, currentQty: number) {
    await this.cartService.updateQuantity(cartItemId, currentQty + 1);
  }

  async decrement(cartItemId: string, currentQty: number) {
    if (currentQty <= 1) {
      await this.cartService.removeItem(cartItemId);
    } else {
      await this.cartService.updateQuantity(cartItemId, currentQty - 1);
    }
  }

  async remove(cartItemId: string) {
    await this.cartService.removeItem(cartItemId);
  }
}
