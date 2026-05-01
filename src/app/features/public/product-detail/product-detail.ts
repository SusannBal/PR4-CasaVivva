import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { RatingStars } from '../../../shared/rating-stars/rating-stars';
import { ProductCard } from '../../../shared/product-card/product-card';
import { CartService } from '../../../core/services/cart.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReviewService } from '../../../core/services/review.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ReviewForm } from '../../../shared/review-form/review-form';
import { ReviewList } from '../../../shared/review-list/review-list';
import { Review } from '../../../core/models/review.model';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, SkeletonModule, RatingStars, ProductCard, ToastModule, ReviewForm, ReviewList, TooltipModule],
  providers: [MessageService],
  templateUrl: './product-detail.html'
})
export class ProductDetail implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  supabaseService = inject(SupabaseService);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  quantity = signal<number>(1);
  addingToCart = signal(false);

  private cartService = inject(CartService);
  private messageService = inject(MessageService);
  
  private reviewService = inject(ReviewService);
  favoriteService = inject(FavoriteService);

  reviews = signal<Review[]>([]);
  hasReviewed = signal(false);
  hasPurchased = signal(false);
  loadingReviews = signal(true);

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.loading.set(true);
      const id = params['id'];

      const prod = await this.productService.getProductById(id);

      if (!prod) {
        this.router.navigate(['/catalogo']);
        return;
      }

      this.product.set(prod);
      await this.loadReviews(prod.id);

      if (prod.category_id) {
        const related = await this.productService.getRelatedProducts(
          prod.id,
          prod.category_id,
          3
        );
        this.relatedProducts.set(related);
      }

      this.loading.set(false);
      window.scrollTo({ top: 0 });
    });
  }

  async loadReviews(productId: string) {
    this.loadingReviews.set(true);
    const [reviews, reviewed, purchased] = await Promise.all([
      this.reviewService.getReviewsByProduct(productId),
      this.reviewService.hasReviewed(productId),
      this.reviewService.hasPurchased(productId)
    ]);
    this.reviews.set(reviews);
    this.hasReviewed.set(reviewed);
    this.hasPurchased.set(purchased);
    this.loadingReviews.set(false);
  }

  async onReviewSubmitted() {
    const p = this.product();
    if (!p) return;
    await this.loadReviews(p.id);
    const updated = await this.productService.getProductById(p.id);
    if (updated) this.product.set(updated);
  }

  incrementQuantity() {
    const max = this.product()?.stock ?? 1;
    if (this.quantity() < max) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  async addToCart() {
    const p = this.product();
    if (!p) return;

    this.addingToCart.set(true);

    const success = await this.cartService.addItem(
      p.id,
      this.quantity(),
      `/producto/${p.id}`
    );

    this.addingToCart.set(false);

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Agregado al carrito',
        detail: `${p.name} x${this.quantity()}`,
        life: 2500
      });
    }
  }

  async toggleFavorite() {
    if (!this.supabaseService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    const product = this.product();
    if (!product) return;

    await this.favoriteService.toggleFavorite(product);
  }
}