import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { AdminService, DashboardStats } from '../../../core/services/admin.service';
import { Order } from '../../../core/models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, TagModule, CommonModule, FormsModule, DatePickerModule, ChartModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);
  loading = signal(true);
  dateRange: Date[] | null = null;

  // Gráfico de barras — ingresos por día
  chartData: any = null;
  chartOptions: any = null;

  // Gráfico de dona — pedidos por estado
  donutData: any = null;
  donutOptions: any = null;

  async ngOnInit() {
    const [s, orders, revenueByDay, ordersByStatus] = await Promise.all([
      this.adminService.getDashboardStats(),
      this.adminService.getRecentOrders(5),
      this.adminService.getRevenueByDay(),
      this.adminService.getOrdersByStatus()
    ]);
    this.stats.set(s);
    this.recentOrders.set(orders);
    this.buildBarChart(revenueByDay);
    this.buildDonutChart(ordersByStatus);
    this.loading.set(false);
  }

  buildBarChart(data: { date: string; total: number }[]) {
    const labels = data.map(d => {
      const [, month, day] = d.date.split('-');
      return `${day}/${month}`;
    });
    const values = data.map(d => d.total);
    const maxVal = Math.max(...values);

    const bgColors = values.map(v => {
      const alpha = maxVal > 0 ? 0.2 + (v / maxVal) * 0.7 : 0.2;
      return `rgba(42, 92, 57, ${alpha})`;
    });
    const borderColors = values.map(v => {
      const alpha = maxVal > 0 ? 0.5 + (v / maxVal) * 0.5 : 0.3;
      return `rgba(42, 92, 57, ${alpha})`;
    });

    this.chartData = {
      labels,
      datasets: [{
        label: 'Ingresos (Bs.)',
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx: any) => ` Bs. ${ctx.parsed.y.toFixed(2)}` }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af', font: { size: 10 }, maxRotation: 45 }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { color: '#9ca3af', font: { size: 11 }, callback: (v: number) => `Bs. ${v}` },
          beginAtZero: true
        }
      }
    };
  }

  buildDonutChart(data: { status: string; count: number }[]) {
    if (!data.length) return;

    const LABEL_MAP: Record<string, string> = {
      pendiente:   'Pendiente',
      confirmado:  'Confirmado',
      enviado:     'Enviado',
      entregado:   'Entregado',
      cancelado:   'Cancelado'
    };
    const COLOR_MAP: Record<string, string> = {
      pendiente:   '#F59E0B',
      confirmado:  '#3B82F6',
      enviado:     '#8B5CF6',
      entregado:   '#10B981',
      cancelado:   '#EF4444'
    };

    const labels = data.map(d => LABEL_MAP[d.status] ?? d.status);
    const values = data.map(d => d.count);
    const colors = data.map(d => COLOR_MAP[d.status] ?? '#9CA3AF');

    this.donutData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8
      }]
    };

    this.donutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#6B7280',
            font: { size: 12, weight: 'bold' },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} pedidos`
          }
        }
      }
    };
  }

  getStatusSeverity(status: string) {
    const map: Record<string, 'warn' | 'info' | 'secondary' | 'success' | 'danger'> = {
      pendiente:  'warn',
      confirmado: 'info',
      enviado:    'secondary',
      entregado:  'success',
      cancelado:  'danger'
    };
    return map[status] ?? 'secondary';
  }
}
