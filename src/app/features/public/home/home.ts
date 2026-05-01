import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ButtonModule, CarouselModule, ProductCard],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  nosotrosSlides = [
    { type: 'about' },
    { type: 'features' }
  ];

  async ngOnInit() {
    this.featuredProducts.set(await this.productService.getFeaturedProducts(3));
    this.categories.set(await this.categoryService.listCategories());
  }
}