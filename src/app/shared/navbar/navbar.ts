import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { FavoriteService } from '../../core/services/favorite.service';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, ButtonModule, TooltipModule, BadgeModule],
    templateUrl: './navbar.html'
})
export class Navbar {
  auth = inject(AuthService);
  cartService = inject(CartService);
  favoriteService = inject(FavoriteService);
  private router = inject(Router);

  readonly isAdmin = this.auth.isAdmin;

  menuOpen = signal(false);
  mobileMenuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  navigateTo(path: string) {
    this.closeMenu();
    this.router.navigate([path]);
  }

  logout() {
    this.closeMenu();
    this.auth.signOut();
  }
}