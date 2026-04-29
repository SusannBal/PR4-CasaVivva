import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [ButtonModule, RouterLink],
  template: `
    <section class="bg-vivva-cream py-20">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold text-vivva-primary mb-4">
          Diseña el hogar que siempre quisiste
        </h1>
        <p class="text-lg text-vivva-stone mb-8 max-w-xl mx-auto">
          Decoración, textiles y muebles con estilo, a precios accesibles.
        </p>
        <p-button label="Ver catálogo" icon="pi pi-arrow-right" iconPos="right" routerLink="/catalogo" />

        @if (auth.isAuthenticated()) {
          <div class="mt-8 p-4 bg-white rounded-lg inline-block">
            <p class="text-sm text-vivva-stone">
              👋 Hola, <strong class="text-vivva-primary">{{ auth.profile()?.full_name }}</strong>
              @if (auth.isAdmin()) {
                <span class="ml-2 px-2 py-0.5 bg-vivva-primary text-white text-xs rounded">ADMIN</span>
              }
            </p>
          </div>
        }
      </div>
    </section>
  `
})
export class Home {
  auth = inject(AuthService);
}
