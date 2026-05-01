import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductService } from '../../../core/services/product.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Product } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-products-list',
  imports: [RouterLink, ButtonModule, TagModule, ConfirmDialogModule, ToastModule, CommonModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-products-list.html'
})
export class AdminProductsList implements OnInit {
  private productService = inject(ProductService);
  private supabase = inject(SupabaseService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  products = signal<Product[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadProducts();
  }

  async loadProducts() {
    this.loading.set(true);

    // Admin ve todos los productos, incluso inactivos
    const { data } = await this.supabase.client
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });

    this.products.set((data as Product[]) ?? []);
    this.loading.set(false);
  }

  confirmDelete(product: Product) {
    this.confirmService.confirm({
      message: `¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteProduct(product)
    });
  }

  async deleteProduct(product: Product) {
    const { error } = await this.supabase.client
      .from('products')
      .delete()
      .eq('id', product.id);

    if (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar el producto'
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: `"${product.name}" eliminado correctamente`
      });
      await this.loadProducts();
    }
  }

  async toggleActive(product: Product) {
    await this.supabase.client
      .from('products')
      .update({ active: !product.active })
      .eq('id', product.id);
    await this.loadProducts();
  }
}
