import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { RatingStars } from '../../../shared/rating-stars/rating-stars';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ButtonModule, TagModule, SkeletonModule, RatingStars, ProductCard],
  templateUrl: './product-detail.html'
})
export class ProductDetail implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  quantity = signal<number>(1);

  async ngOnInit() {
    // Escuchar cambios de :id en la URL
    this.route.params.subscribe(async params => {
      this.loading.set(true);
      const id = params['id'];

      const prod = await this.productService.getProductById(id);

      if (!prod) {
        this.router.navigate(['/catalogo']);
        return;
      }

      this.product.set(prod);

      // Cargar relacionados
      if (prod.category_id) {
        const related = await this.productService.getRelatedProducts(
          prod.id,
          prod.category_id,
          4
        );
        this.relatedProducts.set(related);
      }

      this.loading.set(false);
      window.scrollTo({ top: 0 });
    });
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

  /** Placeholder — Fase 4 conecta el carrito real */
  addToCart() {
    alert('Funcionalidad de carrito disponible en Fase 4');
  }

  /** Placeholder — Fase 6 conecta los favoritos reales */
  toggleFavorite() {
    alert('Funcionalidad de favoritos disponible en Fase 6');
  }
}