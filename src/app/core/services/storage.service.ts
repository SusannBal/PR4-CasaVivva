import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private supabase = inject(SupabaseService);

  private readonly BUCKET = 'product-images';

  /**
   * Returns the bucket name for external access.
   */
  getBucketName(): string {
    return this.BUCKET;
  }

  /**
   * Calcula el hash SHA-256 del contenido de un archivo.
   * Permite detectar imágenes duplicadas aunque tengan distinto nombre.
   */
  async computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Sube una imagen y retorna la URL pública.
   * Usa el hash SHA-256 del contenido como nombre de archivo,
   * lo que permite detectar imágenes duplicadas en el frontend.
   */
  async uploadProductImage(
    file: File,
    productId?: string
  ): Promise<{ url: string | null; error: string | null; hash?: string }> {

    // Generar nombre basado en el hash del contenido del archivo
    const ext = file.name.split('.').pop();
    const hash = await this.computeFileHash(file);
    const fileName = `${hash}.${ext}`;

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

    return { url: data.publicUrl, error: null, hash };
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
