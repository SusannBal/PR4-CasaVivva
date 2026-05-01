import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-confirmation',
  imports: [RouterLink, ButtonModule],
  templateUrl: './order-confirmation.html'
})
export class OrderConfirmation implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  async ngOnInit() {
    const orderId = this.route.snapshot.params['id'];
    const order = await this.orderService.getOrderById(orderId);
    this.order.set(order);
    this.loading.set(false);
  }
}
