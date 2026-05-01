import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './admin-layout.html'
})
export class AdminLayout {
  supabase = inject(SupabaseService);
  private router = inject(Router);
  sidebarOpen = signal(false);

  navItems = [
    { label: 'Dashboard', icon: 'pi-home', route: '/admin' },
    { label: 'Productos', icon: 'pi-box', route: '/admin/productos' },
    { label: 'Pedidos', icon: 'pi-shopping-bag', route: '/admin/pedidos' },
    { label: 'Categorías', icon: 'pi-tags', route: '/admin/categorias' }
  ];

  async signOut() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
