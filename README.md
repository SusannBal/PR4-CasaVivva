# 🏡 Casa Vivva - Plataforma de E-commerce Profesional

Un portal de comercio electrónico moderno y escalable desarrollado con **Angular**, diseñado para ofrecer una experiencia de usuario fluida e intuitiva. Integra un catálogo de productos, carrito de compras, gestión de usuarios y un panel de administración completo, todo respaldado por **Supabase** y **PrimeNG**.

---

## 🎯 Resumen del Proyecto

Casa Vivva es una *Single Page Application (SPA)* estructurada bajo los mejores estándares de desarrollo en Angular (Standalone Components, Arquitectura Modular). La plataforma está dividida en tres áreas principales:
1. **Área Pública (`public`):** Catálogo, detalle de productos, carrito de compras y páginas informativas.
2. **Área de Cliente (`client` & `auth`):** Gestión de perfil, autenticación, favoritos (wishlist), historial de órdenes y proceso de *checkout*.
3. **Área de Administración (`admin`):** Panel de control para la gestión del inventario (productos, categorías) y seguimiento de pedidos.

---

## 🚀 Características Principales y Módulos

### 🛍️ Experiencia del Cliente (UX/UI)
*   **Catálogo Responsivo:** Uso de tarjetas de productos reutilizables (`product-card`) adaptables a dispositivos móviles y escritorio.
*   **Gestión del Carrito:** Carrito de compras reactivo sincronizado en tiempo real.
*   **Favoritos y Reseñas:** Sistema de *Rating Stars*, reseñas de productos (`review-form`, `review-list`) y lista de deseos.
*   **Checkout y Órdenes:** Flujo completo de compra, confirmación de pedido y visualización del detalle de historial de órdenes (`my-orders`, `order-detail`).

### ⚙️ Panel de Administración (Backoffice)
*   **Dashboard:** Visión general de las ventas e inventario (`admin-dashboard`).
*   **Gestión de Catálogo:** Creación y edición de productos y categorías (`admin-product-form`, `admin-categories`).
*   **Gestión de Pedidos:** Listado de órdenes y actualización de estados de envío (`admin-orders-list`, `admin-order-manage`).

### 🔒 Autenticación y Seguridad
*   **Registro y Login:** Flujos completos incluyendo recuperación de contraseña (`recover-password`).
*   **Protección de Rutas (Guards):** 
    *   `AuthGuard`: Protege rutas exclusivas de clientes.
    *   `AdminGuard`: Restringe el acceso al panel de administración.
    *   `GuestGuard`: Evita que usuarios logueados accedan a las páginas de login/registro.

---

## 🏗️ Arquitectura y Tecnologías

### Tech Stack
*   **Framework:** Angular 21 (Standalone Components)
*   **UI Library:** PrimeNG y Tailwind CSS (Responsive Design)
*   **Backend as a Service (BaaS):** Supabase (PostgreSQL, Auth, Storage)
*   **Programación Reactiva:** RxJS para el manejo del estado global (Carrito, Usuario).

### Estructura de Directorios (Feature-Sliced Design)
El proyecto está organizado siguiendo una arquitectura limpia y modular:

```text
src/app/
├── core/               # Lógica global y state management
│   ├── models/         # Interfaces TS (product.model, cart-item.model, etc.)
│   ├── services/       # Comunicación con Supabase (auth.service, cart.service, etc.)
│   └── guards/         # Protección de rutas (auth.guard, admin.guard)
├── features/           # Módulos perezosos (Lazy Loaded)
│   ├── admin/          # Todo el panel de administración
│   ├── auth/           # Login, Registro, Recuperación
│   ├── client/         # Perfil, Carrito, Checkout, Pedidos
│   └── public/         # Home, Catálogo, Detalle de Producto, About
└── shared/             # UI Components reutilizables
    ├── layouts/        # Estructuras principales (Navbar, Footer, MainLayout)
    ├── product-card/   # Tarjetas de productos
    ├── rating-stars/   # Componente visual de calificación
    └── review-*/       # Formularios y listas de reseñas
```

---

## 💻 Instalación y Ejecución Local

Para levantar el proyecto en tu entorno de desarrollo:

1. **Asegúrate de tener instalado** Node.js y Angular CLI.
2. **Clona el repositorio** e ingresa a la carpeta del proyecto.
3. **Instala las dependencias:**
   ```bash
   npm install
   ```
4. **Configura las variables de entorno:**
   Asegúrate de tener el archivo `src/environments/environment.ts` con tus credenciales de Supabase.
5. **Inicia el servidor local:**
   ```bash
   npm start
   ```
   > 🌐 La aplicación estará disponible en `http://localhost:4200`

---

## 📦 Compilación y Despliegue

Para construir la versión optimizada para producción (AOT, minificación de CSS/JS, Tree-shaking):

```bash
npm run build
```
Los archivos compilados se generarán en la carpeta `dist/` y estarán listos para ser desplegados en plataformas como Vercel, Netlify o Firebase Hosting.
