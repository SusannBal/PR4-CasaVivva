import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../navbar/navbar';
import { Footer } from '../../footer/footer';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, Navbar, Footer],
    template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `
})
export class MainLayout { }