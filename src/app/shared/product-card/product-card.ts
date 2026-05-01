import { Component, input, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { RatingStars } from '../rating-stars/rating-stars';
import { FavoriteService } from '../../core/services/favorite.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ButtonModule, ToastModule, RatingStars],
  providers: [MessageService],
  templateUrl: './product-card.html'
})
export class ProductCard {
  product = input.required<Product>();

  private cartService = inject(CartService);
  private messageService = inject(MessageService);
  favoriteService = inject(FavoriteService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  adding = signal(false);

  async addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.adding.set(true);

    const success = await this.cartService.addItem(
      this.product().id,
      1,
      `/producto/${this.product().id}`
    );

    this.adding.set(false);

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: '¡Agregado!',
        detail: this.product().name,
        life: 2000
      });
    }
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.product().id);
  }

  async onToggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.supabase.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    await this.favoriteService.toggleFavorite(this.product());
  }
}