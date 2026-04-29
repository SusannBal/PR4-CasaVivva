import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-bold text-vivva-primary mb-8">Nuestro Catálogo</h1>
      
      @if (loading()) {
        <div class="flex justify-center py-20">
          <p class="text-vivva-stone">Cargando productos...</p>
        </div>
      } @else if (products().length === 0) {
        <div class="text-center py-20">
          <p class="text-vivva-stone">No se encontraron productos.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          @for (p of products(); track p.id) {
            <div class="bg-white p-4 rounded-xl border border-vivva-stone/10 shadow-sm hover:shadow-md transition-shadow">
              <div class="aspect-square bg-vivva-cream rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                @if (p.image_url) {
                  <img [src]="p.image_url" [alt]="p.name" class="w-full h-full object-cover">
                } @else {
                  <i class="pi pi-image text-3xl text-vivva-stone/30"></i>
                }
              </div>
              <h3 class="font-semibold text-vivva-primary">{{ p.name }}</h3>
              <p class="text-sm text-vivva-stone line-clamp-2 mt-1 h-10">{{ p.description }}</p>
              <div class="flex items-center justify-between mt-4">
                <span class="text-xl font-bold text-vivva-primary">Bs. {{ p.price }}</span>
                <span class="text-xs text-vivva-stone bg-vivva-cream px-2 py-1 rounded">Stock: {{ p.stock }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class Catalog implements OnInit {
  private supabase = inject(SupabaseService);
  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    this.loading.set(true);
    const { data, error } = await this.supabase.client
      .from('products')
      .select('*, category:categories(*)')
      .eq('active', true);

    if (error) {
      console.error('❌ Error cargando productos:', error);
    } else {
      this.products.set(data as Product[] || []);
    }
    this.loading.set(false);
  }
}
