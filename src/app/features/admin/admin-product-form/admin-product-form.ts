import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { StorageService } from '../../../core/services/storage.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Category } from '../../../core/models/category.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-product-form',
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    ToggleSwitchModule,
    MessageModule,
    ToastModule,
    CommonModule
  ],
  providers: [MessageService],
  templateUrl: './admin-product-form.html'
})
export class AdminProductForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private categoryService = inject(CategoryService);
  private storageService = inject(StorageService);
  private messageService = inject(MessageService);

  // Estado del formulario
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  loading = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);
  categories = signal<Category[]>([]);

  // Campos del formulario
  name = signal('');
  description = signal('');
  price = signal<number>(0);
  stock = signal<number>(0);
  categoryId = signal<string | null>(null);
  active = signal(true);
  imageUrl = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const cats = await this.categoryService.listCategories();
    this.categories.set(cats);

    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.productId.set(id);
      await this.loadProduct(id);
    }
  }

  async loadProduct(id: string) {
    this.loading.set(true);
    const { data } = await this.supabase.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      this.name.set(data.name);
      this.description.set(data.description ?? '');
      this.price.set(data.price);
      this.stock.set(data.stock);
      this.categoryId.set(data.category_id);
      this.active.set(data.active);
      this.imageUrl.set(data.image_url);
      this.imagePreview.set(data.image_url);
    }
    this.loading.set(false);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.error.set('Solo se aceptan imágenes JPG, PNG o WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede superar los 5MB');
      return;
    }

    this.selectedFile.set(file);
    this.error.set(null);

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.imageUrl.set(null);
  }

  async onSubmit() {
    if (!this.name() || this.price() <= 0) {
      this.error.set('Nombre y precio son obligatorios');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // ── Validar nombre duplicado ──
    const nombreBusqueda = this.name().trim();
    let queryNombre = this.supabase.client
      .from('products')
      .select('id, name')
      .ilike('name', nombreBusqueda);

    if (this.isEditMode() && this.productId()) {
      queryNombre = queryNombre.neq('id', this.productId()!);
    }

    const { data: duplicadosNombre } = await queryNombre;
    if (duplicadosNombre && duplicadosNombre.length > 0) {
      this.loading.set(false);
      this.error.set(`Ya existe un producto con el nombre "${duplicadosNombre[0].name}". Por favor, usa un nombre diferente.`);
      return;
    }

    // ── Validar imagen duplicada (si se seleccionó un archivo nuevo) ──
    if (this.selectedFile()) {
      const archivoNombre = this.selectedFile()!.name.toLowerCase();
      const archivoTamano = this.selectedFile()!.size;

      let queryImg = this.supabase.client
        .from('products')
        .select('id, name, image_url')
        .not('image_url', 'is', null);

      if (this.isEditMode() && this.productId()) {
        queryImg = queryImg.neq('id', this.productId()!);
      }

      const { data: productosConImg } = await queryImg;
      if (productosConImg) {
        const imgDuplicada = productosConImg.find((p: any) => {
          if (!p.image_url) return false;
          const urlParts = p.image_url.split('/');
          const nombreEnStorage = urlParts[urlParts.length - 1].toLowerCase();
          // Comparar por nombre original del archivo (sin timestamp)
          const partes = nombreEnStorage.split('_');
          const nombreOriginal = partes.length > 1 ? partes.slice(1).join('_') : nombreEnStorage;
          return nombreOriginal === archivoNombre;
        });

        if (imgDuplicada) {
          this.loading.set(false);
          this.error.set(`La imagen "${archivoNombre}" ya está asignada al producto "${imgDuplicada.name}". Usa una imagen diferente.`);
          return;
        }
      }
    }

    let finalImageUrl = this.imageUrl();

    // Subir imagen si hay una nueva seleccionada
    if (this.selectedFile()) {
      this.uploading.set(true);
      const { url, error: uploadError } = await this.storageService.uploadProductImage(
        this.selectedFile()!,
        this.productId() ?? undefined
      );
      this.uploading.set(false);

      if (uploadError) {
        this.error.set(uploadError);
        this.loading.set(false);
        return;
      }
      finalImageUrl = url;
    }

    const productData = {
      name: this.name(),
      description: this.description() || null,
      price: this.price(),
      stock: this.stock(),
      category_id: this.categoryId(),
      active: this.active(),
      image_url: finalImageUrl,
      updated_at: new Date().toISOString()
    };

    let error;

    if (this.isEditMode()) {
      ({ error } = await this.supabase.client
        .from('products')
        .update(productData)
        .eq('id', this.productId()!));
    } else {
      ({ error } = await this.supabase.client
        .from('products')
        .insert(productData));
    }

    this.loading.set(false);

    if (error) {
      this.error.set('Error al guardar el producto');
      return;
    }

    this.router.navigate(['/admin/productos']);
  }

  get categoryOptions() {
    return this.categories().map(c => ({ label: c.name, value: c.id }));
  }
}
