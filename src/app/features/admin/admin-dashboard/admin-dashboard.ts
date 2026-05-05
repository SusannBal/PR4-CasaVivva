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

  // Datos del gráfico
  chartData: any = null;
  chartOptions: any = null;

  async ngOnInit() {
    const [s, orders, revenueByDay] = await Promise.all([
      this.adminService.getDashboardStats(),
      this.adminService.getRecentOrders(5),
      this.adminService.getRevenueByDay()
    ]);
    this.stats.set(s);
    this.recentOrders.set(orders);
    this.buildChart(revenueByDay);
    this.loading.set(false);
  }

  buildChart(data: { date: string; total: number }[]) {
    const labels = data.map(d => {
      const [, month, day] = d.date.split('-');
      return `${day}/${month}`;
    });

    const values = data.map(d => d.total);
    const maxVal = Math.max(...values);

    // Color degradado: días con más ventas más oscuros
    const bgColors = values.map(v => {
      const intensity = maxVal > 0 ? v / maxVal : 0;
      const alpha = 0.2 + intensity * 0.7;
      return `rgba(42, 92, 57, ${alpha})`;
    });
    const borderColors = values.map(v => {
      const intensity = maxVal > 0 ? v / maxVal : 0;
      const alpha = 0.5 + intensity * 0.5;
      return `rgba(42, 92, 57, ${alpha})`;
    });

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Ingresos (Bs.)',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` Bs. ${ctx.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#9ca3af',
            font: { size: 10 },
            maxRotation: 45
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            color: '#9ca3af',
            font: { size: 11 },
            callback: (v: number) => `Bs. ${v}`
          },
          beginAtZero: true
        }
      }
    };
  }

  getStatusSeverity(status: string) {
    const map: Record<string, 'warn' | 'info' | 'secondary' | 'success' | 'danger'> = {
      pendiente: 'warn',
      confirmado: 'info',
      enviado: 'secondary',
      entregado: 'success',
      cancelado: 'danger'
    };
    return map[status] ?? 'secondary';
  }
}
