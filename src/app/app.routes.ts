import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
    // Públicas (con layout)
    {
        path: '',
        loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            {
                path: '',
                loadComponent: () => import('./features/public/home/home').then(m => m.Home)
            },
            {
                path: 'catalogo',
                loadComponent: () => import('./features/public/catalog/catalog').then(m => m.Catalog)
            },

            // Auth (solo accesible si NO estás logueado)
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
        ]
    },

    // Cliente protegido (placeholder - los implementamos en fases siguientes)
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login) // temporal
    },

    // Admin protegido (placeholder)
    {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login) // temporal
    },

    // 404
    { path: '**', redirectTo: '' }
];