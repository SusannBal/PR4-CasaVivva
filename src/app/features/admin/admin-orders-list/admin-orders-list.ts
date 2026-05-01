import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminService } from '../../../core/services/admin.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-orders-list',
  imports: [RouterLink, FormsModule, TagModule, SelectModule, ButtonModule, InputTextModule, CommonModule],
  templateUrl: './admin-orders-list.html'
})
export class AdminOrdersList implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  loading = signal(true);
  statusFilter = signal<string>('');
  clientEmailFilter = signal<string | null>(null);
  clientIdFilter = signal<string | null>(null);
  searchTerm = signal<string>('');
  cityFilter = signal<string>('');
  paymentFilter = signal<string>('');

  // Computed que filtra los pedidos localmente
  displayedOrders = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const city = this.cityFilter();
    const payment = this.paymentFilter();

    return this.orders().filter(o => {
      const matchSearch = !term || 
        o.id.toLowerCase().includes(term) ||
        o.user?.full_name?.toLowerCase().includes(term) ||
        o.user?.email?.toLowerCase().includes(term) ||
        o.shipping_city?.toLowerCase().includes(term);
        
      const matchCity = !city || o.shipping_city === city;
      const matchPayment = !payment || o.payment_status === payment;

      return matchSearch && matchCity && matchPayment;
    });
  });

  cityOptions = computed(() => {
    const cities = Array.from(new Set(this.orders().map(o => o.shipping_city).filter(Boolean)));
    return [
      { label: 'Todas las ciudades', value: '' },
      ...cities.map(c => ({ label: c, value: c }))
    ];
  });

  paymentOptions = [
    { label: 'Cualquier pago', value: '' },
    { label: 'Pagado', value: 'pagado' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Reembolsado', value: 'reembolsado' }
  ];

  statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Enviado', value: 'enviado' },
    { label: 'Entregado', value: 'entregado' },
    { label: 'Cancelado', value: 'cancelado' }
  ];

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      if (params['user_id']) {
        this.clientIdFilter.set(params['user_id']);
        this.clientEmailFilter.set(params['cliente'] || 'Cliente seleccionado');
      } else {
        this.clientIdFilter.set(null);
        this.clientEmailFilter.set(null);
      }
      await this.loadOrders();
    });
  }

  async loadOrders() {
    this.loading.set(true);
    const status = this.statusFilter() as OrderStatus || undefined;
    const userId = this.clientIdFilter() || undefined;
    
    const orders = await this.adminService.getAllOrders(status, userId);
    this.orders.set(orders);
    this.loading.set(false);
  }

  clearClientFilter() {
    this.router.navigate(['/admin/pedidos']);
  }

  getStatusSeverity(status: string) {
    const map: Record<string, "warn" | "info" | "secondary" | "success" | "danger"> = {
      pendiente: 'warn',
      confirmado: 'info',
      enviado: 'secondary',
      entregado: 'success',
      cancelado: 'danger'
    };
    return map[status] ?? 'secondary';
  }
}
