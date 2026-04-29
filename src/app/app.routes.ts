import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    // Públicas
    {
        path: '',
        loadComponent: () => import('./features/public/home/home').then(m => m.Home)
    },
    {
        path: 'catalogo',
        loadComponent: () => import('./features/public/catalog/catalog').then(m => m.Catalog)
    },
    {
        path: 'producto/:id',
        loadComponent: () => import('./features/public/product-detail/product-detail').then(m => m.ProductDetail)
    },

    // Auth
    {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    },
    {
        path: 'registro',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
    },
    {
        path: 'recuperar',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/recover-password/recover-password').then(m => m.RecoverPassword)
    },

    // Cliente (placeholders)
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/public/home/home').then(m => m.Home)
    },

    // Admin (placeholder)
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/public/home/home').then(m => m.Home)
    },

    // 404
    { path: '**', redirectTo: '' }
];