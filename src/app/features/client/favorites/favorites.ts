import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FavoriteService } from '../../../core/services/favorite.service';
import { ProductCard } from '../../../shared/product-card/product-card';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, ButtonModule, ProductCard],
  templateUrl: './favorites.html'
})
export class Favorites {
  favoriteService = inject(FavoriteService);
}
