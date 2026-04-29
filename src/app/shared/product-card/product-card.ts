import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../core/models/product.model';
import { RatingStars } from '../rating-stars/rating-stars';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ButtonModule, RatingStars],
  templateUrl: './product-card.html'
})
export class ProductCard {
  product = input.required<Product>();
}