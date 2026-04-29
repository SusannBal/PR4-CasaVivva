import { Product } from './product.model';

export interface Favorite {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;

    product?: Product;
}