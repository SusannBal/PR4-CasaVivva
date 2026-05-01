import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase = inject(SupabaseService);

  private readonly BUCKET = 'product-images';

  /**
   * Sube una imagen y retorna la URL pública
   */
  async uploadProductImage(
    file: File,
    productId?: string
  ): Promise<{ url: string | null; error: string | null }> {

    // Generar nombre único para evitar colisiones
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = productId
      ? `${productId}_${timestamp}.${ext}`
      : `temp_${timestamp}.${ext}`;

    const filePath = `products/${fileName}`;

    const { error: uploadError } = await this.supabase.client
      .storage
      .from(this.BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Error subiendo imagen:', uploadError);
      return { url: null, error: 'Error al subir la imagen' };
    }

    // Obtener URL pública
    const { data } = this.supabase.client
      .storage
      .from(this.BUCKET)
      .getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  }

  /**
   * Elimina una imagen por su URL
   */
  async deleteProductImage(imageUrl: string): Promise<void> {
    // Extraer el path desde la URL pública
    const bucketPath = `${this.BUCKET}/`;
    const idx = imageUrl.indexOf(bucketPath);
    if (idx === -1) return;

    const filePath = imageUrl.substring(idx + bucketPath.length);

    await this.supabase.client
      .storage
      .from(this.BUCKET)
      .remove([filePath]);
  }
}
