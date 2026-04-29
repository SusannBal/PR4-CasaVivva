import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private supabase = inject(SupabaseService);

    async listCategories(): Promise<Category[]> {
        const { data, error } = await this.supabase.client
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error listando categorías:', error);
            return [];
        }

        return (data as Category[]) || [];
    }

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        const { data } = await this.supabase.client
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        return data as Category | null;
    }
}