import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ProductService, ProductFilters } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-catalog',
  imports: [
    RouterLink,
    FormsModule,
    InputTextModule,
    SelectModule,
    SliderModule,
    ButtonModule,
    CheckboxModule,
    PaginatorModule,
    SkeletonModule,
    ProductCard
  ],
  templateUrl: './catalog.html'
})
export class Catalog implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Estado de datos
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  totalCount = signal<number>(0);
  loading = signal<boolean>(true);

  // Filtros (signals individuales)
  selectedCategoryId = signal<string | null>(null);
  minRating = signal<number>(0);
  priceRange = signal<number[]>([0, 1500]);
  searchTerm = signal<string>('');
  sortBy = signal<'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('name');

  // Paginación
  currentPage = signal<number>(1);
  perPage = 12;

  // Debounce timer
  private searchTimeout: any;

  // Opciones de ordenamiento
  sortOptions = [
    { label: 'Nombre (A-Z)', value: 'name' },
    { label: 'Precio: menor a mayor', value: 'price-asc' },
    { label: 'Precio: mayor a menor', value: 'price-desc' },
    { label: 'Mejor valorados', value: 'rating' },
    { label: 'Más nuevos', value: 'newest' }
  ];

  // Texto del paginador
  totalPages = computed(() => Math.ceil(this.totalCount() / this.perPage));
  paginatorFirst = computed(() => (this.currentPage() - 1) * this.perPage);

  async ngOnInit() {
    // Cargar categorías
    const cats = await this.categoryService.listCategories();
    this.categories.set(cats);

    // Si la URL tiene ?categoria=slug, aplicar filtro
    const categorySlug = this.route.snapshot.queryParams['categoria'];
    if (categorySlug) {
      const cat = cats.find(c => c.slug === categorySlug);
      if (cat) this.selectedCategoryId.set(cat.id);
    }

    // Cargar productos
    await this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);

    const filters: ProductFilters = {
      categoryId: this.selectedCategoryId() ?? undefined,
      minPrice: this.priceRange()[0],
      maxPrice: this.priceRange()[1],
      minRating: this.minRating() > 0 ? this.minRating() : undefined,
      search: this.searchTerm() || undefined,
      sortBy: this.sortBy()
    };

    const result = await this.productService.listProducts(
      filters,
      this.currentPage(),
      this.perPage
    );

    this.products.set(result.products);
    this.totalCount.set(result.totalCount);
    this.loading.set(false);
  }

  /** Reaplica filtros volviendo a la página 1 */
  applyFilters() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  /** Filtro por categoría desde el sidebar */
  selectCategory(categoryId: string | null) {
    this.selectedCategoryId.set(categoryId);
    this.applyFilters();
  }

  /** Búsqueda con debounce */
  onSearchInput() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  /** Cambio de orden */
  onSortChange() {
    this.applyFilters();
  }

  /** Limpiar todos los filtros */
  clearFilters() {
    this.selectedCategoryId.set(null);
    this.minRating.set(0);
    this.priceRange.set([0, 1500]);
    this.searchTerm.set('');
    this.sortBy.set('name');
    this.currentPage.set(1);
    this.loadProducts();
  }

  /** Cambio de página */
  onPageChange(event: any) {
    this.currentPage.set(event.page + 1);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}