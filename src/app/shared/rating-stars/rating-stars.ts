import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.html'
})
export class RatingStars {
  // Inputs (Angular 17+ signals)
  rating = input<number>(0);
  count = input<number>(0);
  size = input<'sm' | 'md' | 'lg'>('sm');
  showCount = input<boolean>(true);

  // Calcula cuántas estrellas llenas, medias y vacías
  fullStars = computed(() => Math.floor(this.rating()));
  hasHalfStar = computed(() => this.rating() % 1 >= 0.5);
  emptyStars = computed(() => 5 - this.fullStars() - (this.hasHalfStar() ? 1 : 0));

  // Tamaño del ícono según el size
  iconSize = computed(() => {
    switch (this.size()) {
      case 'lg': return '1.5rem';
      case 'md': return '1.1rem';
      default: return '0.85rem';
    }
  });
}