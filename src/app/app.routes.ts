import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [

  // ── Públicas ──────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/public/home/home').then(m => m.Home)
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./features/public/catalog/catalog').then(m => m.Catalog)
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./features/public/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'nosotros',
    loadComponent: () =>
      import('./features/public/about/about').then(m => m.About)
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('./features/public/help/help').then(m => m.Help)
  },

  // ── Auth (solo si NO está logueado) ───────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'recuperar',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/recover-password/recover-password').then(m => m.RecoverPassword)
  },

  // ── Cliente (requiere login) ───────────────────────────────
  {
    path: 'carrito',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'pedido-confirmado/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/order-confirmation/order-confirmation').then(m => m.OrderConfirmation)
  },
  {
    path: 'mis-pedidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/my-orders/my-orders').then(m => m.MyOrders)
  },
  {
    path: 'mis-pedidos/:id',                           // ← detalle
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/order-detail/order-detail').then(m => m.OrderDetail)
  },
  {
    path: 'favoritos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/favorites/favorites').then(m => m.Favorites)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/user-profile/user-profile').then(m => m.UserProfile)
  },

  // ── Admin con rutas hijas ──────────────────────────────────
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/admin-products-list/admin-products-list').then(m => m.AdminProductsList)
      },
      {
        path: 'productos/nuevo',
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form').then(m => m.AdminProductForm)
      },
      {
        path: 'productos/:id',
        loadComponent: () =>
          import('./features/admin/admin-product-form/admin-product-form').then(m => m.AdminProductForm)
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./features/admin/admin-orders-list/admin-orders-list').then(m => m.AdminOrdersList)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () =>
          import('./features/admin/admin-order-manage/admin-order-manage').then(m => m.AdminOrderManage)
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/admin-categories/admin-categories').then(m => m.AdminCategories)
      }
    ]
  },

  // ── 404 ───────────────────────────────────────────────────
  {
    path: '**',
    loadComponent: () =>
      import('./features/public/not-found/not-found').then(m => m.NotFound)
  }
];