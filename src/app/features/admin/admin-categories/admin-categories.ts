import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { CategoryService } from '../../../core/services/category.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Category } from '../../../core/models/category.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule, ButtonModule, InputTextModule, DialogModule, MessageModule, CommonModule],
  templateUrl: './admin-categories.html'
})
export class AdminCategories implements OnInit {
  private categoryService = inject(CategoryService);
  private supabase = inject(SupabaseService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  showDialog = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  editingId = signal<string | null>(null);

  // Formulario
  catName = signal('');
  catSlug = signal('');
  catIcon = signal('pi-tag');

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    this.loading.set(true);
    const cats = await this.categoryService.listCategories();
    this.categories.set(cats);
    this.loading.set(false);
  }

  openNew() {
    this.editingId.set(null);
    this.catName.set('');
    this.catSlug.set('');
    this.catIcon.set('pi-tag');
    this.error.set(null);
    this.showDialog.set(true);
  }

  openEdit(cat: Category) {
    this.editingId.set(cat.id);
    this.catName.set(cat.name);
    this.catSlug.set(cat.slug);
    this.catIcon.set(cat.icon ?? 'pi-tag');
    this.error.set(null);
    this.showDialog.set(true);
  }

  // Genera slug automáticamente desde el nombre
  onNameInput() {
    if (!this.editingId()) {
      this.catSlug.set(
        this.catName()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  }

  async saveCategory() {
    if (!this.catName() || !this.catSlug()) {
      this.error.set('Nombre y slug son obligatorios');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const data = {
      name: this.catName(),
      slug: this.catSlug(),
      icon: this.catIcon()
    };

    let error;
    if (this.editingId()) {
      ({ error } = await this.supabase.client
        .from('categories').update(data).eq('id', this.editingId()!));
    } else {
      ({ error } = await this.supabase.client
        .from('categories').insert(data));
    }

    this.saving.set(false);

    if (error) {
      this.error.set(error.code === '23505'
        ? 'Ya existe una categoría con ese slug'
        : 'Error al guardar la categoría');
      return;
    }

    this.showDialog.set(false);
    await this.loadCategories();
  }

  async deleteCategory(cat: Category) {
    if (!confirm(`¿Eliminar "${cat.name}"? Los productos quedarán sin categoría.`)) return;

    await this.supabase.client.from('categories').delete().eq('id', cat.id);
    await this.loadCategories();
  }
}
