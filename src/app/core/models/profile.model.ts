export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: 'cliente' | 'admin';
    created_at: string;
}