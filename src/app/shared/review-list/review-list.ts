import { Component, input, output, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Review } from '../../core/models/review.model';
import { ReviewService } from '../../core/services/review.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { RatingStars } from '../rating-stars/rating-stars';

@Component({
  selector: 'app-review-list',
  imports: [ButtonModule, RatingStars],
  templateUrl: './review-list.html'
})
export class ReviewList {
  private reviewService = inject(ReviewService);
  supabase = inject(SupabaseService);

  reviews = input.required<Review[]>();
  productId = input.required<string>();
  deleted = output<void>();

  async onDelete(productId: string) {
    if (!confirm('¿Eliminar tu reseña?')) return;
    const { error } = await this.reviewService.deleteReview(productId);
    if (!error) {
      this.deleted.emit();
    }
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
