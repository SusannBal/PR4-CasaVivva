import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './my-orders.html'
})
export class MyOrders implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  private readonly stepOrder = ['pendiente', 'confirmado', 'enviado', 'entregado'];

  async ngOnInit() {
    const orders = await this.orderService.getMyOrders();
    this.orders.set(orders);
    this.loading.set(false);
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      pendiente: 'warn',
      confirmado: 'info',
      enviado: 'secondary',
      entregado: 'success',
      cancelado: 'danger'
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string) {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      enviado: 'En camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return map[status] ?? status;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isStepReached(currentStatus: string, step: string): boolean {
    if (currentStatus === 'cancelado') return false;
    const currentIdx = this.stepOrder.indexOf(currentStatus);
    const stepIdx = this.stepOrder.indexOf(step);
    return stepIdx <= currentIdx;
  }

  getStepNumber(step: string): number {
    return this.stepOrder.indexOf(step) + 1;
  }

  getStepLabel(step: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pedido',
      confirmado: 'Confirmado',
      enviado: 'En camino',
      entregado: 'Entregado'
    };
    return map[step] ?? step;
  }
}
