import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './order-detail.html'
})
export class OrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);

  private readonly stepOrder = ['pendiente', 'confirmado', 'enviado', 'entregado'];

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const order = await this.orderService.getOrderById(id);

    if (!order) {
      this.router.navigate(['/mis-pedidos']);
      return;
    }

    this.order.set(order);
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

  isStepReached(currentStatus: string, step: string): boolean {
    if (currentStatus === 'cancelado') return false;
    return this.stepOrder.indexOf(step) <= this.stepOrder.indexOf(currentStatus);
  }

  isCurrentStep(currentStatus: string, step: string): boolean {
    return currentStatus === step;
  }

  getStepIcon(step: string): string {
    const map: Record<string, string> = {
      pendiente: 'pi-clock',
      confirmado: 'pi-check',
      enviado: 'pi-truck',
      entregado: 'pi-home'
    };
    return map[step] ?? 'pi-circle';
  }

  getStepLabel(step: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pedido recibido',
      confirmado: 'Pedido confirmado',
      enviado: 'En camino',
      entregado: 'Entregado'
    };
    return map[step] ?? step;
  }

  getStepDescription(step: string): string {
    const map: Record<string, string> = {
      pendiente: 'Tu pedido fue registrado y está siendo revisado.',
      confirmado: 'El pedido fue confirmado y está siendo preparado.',
      enviado: 'Tu pedido está en camino hacia la dirección indicada.',
      entregado: '¡Tu pedido fue entregado exitosamente!'
    };
    return map[step] ?? '';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
