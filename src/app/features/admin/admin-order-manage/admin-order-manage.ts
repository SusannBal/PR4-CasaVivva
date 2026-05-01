import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { AdminService } from '../../../core/services/admin.service';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-order-manage',
  imports: [RouterLink, FormsModule, ButtonModule, SelectModule, TagModule, MessageModule, CommonModule],
  templateUrl: './admin-order-manage.html'
})
export class AdminOrderManage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private orderService = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);
  saving = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  newStatus = signal<string>('');
  newPaymentStatus = signal<string>('');

  statusOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Enviado', value: 'enviado' },
    { label: 'Entregado', value: 'entregado' },
    { label: 'Cancelado', value: 'cancelado' }
  ];

  paymentOptions = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'Reembolsado', value: 'reembolsado' }
  ];

  async ngOnInit() {
    const id = this.route.snapshot.params['id'];
    const o = await this.orderService.getOrderById(id);
    this.order.set(o);
    this.newStatus.set(o?.status ?? 'pendiente');
    this.newPaymentStatus.set(o?.payment_status ?? 'pendiente');
    this.loading.set(false);
  }

  async saveChanges() {
    const o = this.order();
    if (!o) return;

    this.saving.set(true);
    this.error.set(null);

    const { error } = await this.adminService.updateOrderStatus(
      o.id,
      this.newStatus() as OrderStatus,
      this.newPaymentStatus() as any
    );

    this.saving.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.success.set(true);
      // Recargar el pedido
      const updated = await this.orderService.getOrderById(o.id);
      this.order.set(updated);
      setTimeout(() => this.success.set(false), 3000);
    }
  }

  getStatusSeverity(status: string) {
    const map: Record<string, "warn" | "info" | "secondary" | "success" | "danger"> = {
      pendiente: 'warn', confirmado: 'info',
      enviado: 'secondary', entregado: 'success', cancelado: 'danger'
    };
    return map[status] ?? 'secondary';
  }

  printReceipt() {
    window.print();
  }

  viewHistory() {
    const o = this.order();
    if (!o?.user?.email) {
      this.router.navigate(['/admin/pedidos']);
      return;
    }
    // Navega a la lista de pedidos con el ID del cliente como query param para filtrar
    this.router.navigate(['/admin/pedidos'], {
      queryParams: { user_id: o.user_id, cliente: o.user.email }
    });
  }
}
