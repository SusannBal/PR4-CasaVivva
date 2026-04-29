import { Profile } from './profile.model';

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    comment: string | null;
    created_at: string;

    user?: Profile;
}