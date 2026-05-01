import { Component, input, output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-review-form',
  imports: [FormsModule, ButtonModule, TextareaModule, MessageModule],
  templateUrl: './review-form.html'
})
export class ReviewForm {
  private reviewService = inject(ReviewService);

  productId = input.required<string>();
  submitted = output<void>();

  rating = signal(0);
  hoverRating = signal(0);
  comment = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  setRating(r: number) {
    this.rating.set(r);
  }

  setHover(r: number) {
    this.hoverRating.set(r);
  }

  clearHover() {
    this.hoverRating.set(0);
  }

  starClass(star: number): string {
    const active = this.hoverRating() || this.rating();
    return star <= active
      ? 'pi pi-star-fill text-yellow-500'
      : 'pi pi-star text-vivva-stone/30';
  }

  async onSubmit() {
    if (this.rating() === 0) {
      this.error.set('Por favor seleccioná una valoración');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { error } = await this.reviewService.createReview({
      productId: this.productId(),
      rating: this.rating(),
      comment: this.comment() || undefined
    });

    this.loading.set(false);

    if (error) {
      this.error.set(error);
      return;
    }

    // Notificar al padre para que recargue las reseñas
    this.submitted.emit();

    // Reset formulario
    this.rating.set(0);
    this.comment.set('');
  }
}
