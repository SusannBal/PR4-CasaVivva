import { Category } from "./category.model";

export interface Product {
    id: string;
    category_id: string | null;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    image_url: string | null;
    rating_avg: number;
    rating_count: number;
    active: boolean;
    created_at: string;
    updated_at: string;

    // Relaciones opcionales (cuando se hace JOIN)
    category?: Category;
}