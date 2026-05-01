import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';
import { Order } from '../../../core/models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TagModule, CommonModule, FormsModule, DatePickerModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);
  loading = signal(true);
  dateRange: Date[] | null = null;

  async ngOnInit() {
    const [s, orders] = await Promise.all([
      this.adminService.getDashboardStats(),
      this.adminService.getRecentOrders(5)
    ]);
    this.stats.set(s);
    this.recentOrders.set(orders);
    this.loading.set(false);
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
