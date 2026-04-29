import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive, ButtonModule, MenuModule, TooltipModule],
    templateUrl: './navbar.html'
})
export class Navbar {
    auth = inject(AuthService);

    userMenuItems: MenuItem[] = [
        {
            label: 'Mi perfil',
            icon: 'pi pi-user',
            routerLink: '/perfil'
        },
        {
            label: 'Mis pedidos',
            icon: 'pi pi-shopping-bag',
            routerLink: '/mis-pedidos'
        },
        {
            label: 'Mis favoritos',
            icon: 'pi pi-heart',
            routerLink: '/favoritos'
        },
        { separator: true },
        {
            label: 'Panel admin',
            icon: 'pi pi-cog',
            routerLink: '/admin',
            visible: this.auth.isAdmin()
        },
        { separator: true },
        {
            label: 'Cerrar sesión',
            icon: 'pi pi-sign-out',
            command: () => this.auth.signOut()
        }
    ];
}