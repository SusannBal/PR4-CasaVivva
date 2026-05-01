import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/product.model';

export interface ProductFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    search?: string;
    sortBy?: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export interface ProductListResponse {
    products: Product[];
    totalCount: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private supabase = inject(SupabaseService);

    /**
     * Lista productos con filtros y paginación
     */
    async listProducts(
        filters: ProductFilters = {},
        page: number = 1,
        perPage: number = 12
    ): Promise<ProductListResponse> {
        let query = this.supabase.client
            .from('products')
            .select('*, category:categories(*)', { count: 'exact' })
            .eq('active', true);

        // Filtros
        if (filters.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }
        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }
        if (filters.minRating !== undefined) {
            query = query.gte('rating_avg', filters.minRating);
        }
        if (filters.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        // Ordenamiento
        switch (filters.sortBy) {
            case 'price-asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price-desc':
                query = query.order('price', { ascending: false });
                break;
            case 'rating':
                query = query.order('rating_avg', { ascending: false });
                break;
            case 'newest':
                query = query.order('created_at', { ascending: false });
                break;
            case 'name':
            default:
                query = query.order('name', { ascending: true });
        }

        // Paginación
        const from = (page - 1) * perPage;
        const to = from + perPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error listando productos:', error);
            return { products: [], totalCount: 0 };
        }

        return {
            products: (data as Product[]) || [],
            totalCount: count || 0
        };
    }

    /**
     * Obtiene un producto por ID con su categoría
     */
    async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase.client
            .from('products')
            .select('*, category:categories(*)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error obteniendo producto:', error);
            return null;
        }

        return data as Product;
    }

    /**
     * Productos destacados (los mejor valorados)
     */
    async getFeaturedProducts(limit: number = 3): Promise<Product[]> {
        const { data } = await this.supabase.client
            .from('products')
            .select('*')
            .eq('active', true)
            .order('rating_avg', { ascending: false })
            .order('rating_count', { ascending: false })
            .limit(limit);

        return (data as Product[]) || [];
    }

    /**
     * Productos relacionados (misma categoría, completa con otros si faltan)
     */
    async getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
        let { data } = await this.supabase.client
            .from('products')
            .select('*')
            .eq('active', true)
            .eq('category_id', categoryId)
            .neq('id', productId)
            .limit(limit);

        let products = (data as Product[]) || [];

        // Si no hay suficientes en la misma categoría, completamos con otros productos
        if (products.length < limit) {
            const excludeIds = [productId, ...products.map(p => p.id)];
            
            const { data: moreData } = await this.supabase.client
                .from('products')
                .select('*')
                .eq('active', true)
                .not('id', 'in', `(${excludeIds.join(',')})`)
                .limit(limit - products.length);
                
            if (moreData) {
                products = [...products, ...(moreData as Product[])];
            }
        }

        return products;
    }
}