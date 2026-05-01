import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepperModule } from 'primeng/stepper';
import { CartService } from '../../../core/services/cart.service';
import { OrderService, CheckoutData } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    SelectButtonModule,
    StepperModule
  ],
  templateUrl: './checkout.html'
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // Estado del stepper
  activeStep = signal(0);

  // Datos del formulario
  fullName = signal('');
  phone = signal('');
  address = signal('');
  city = signal('');
  notes = signal('');
  paymentMethod = signal<'tarjeta' | 'qr' | 'contra_entrega'>('tarjeta');

  // Estado del proceso
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed
  cartService_ = this.cartService;
  shipping = 30;
  freeShipping = computed(() => this.cartService.subtotal() >= 500);
  shippingCost = computed(() => this.freeShipping() ? 0 : this.shipping);
  total = computed(() => this.cartService.subtotal() + this.shippingCost());

  paymentOptions = [
    { label: 'Tarjeta', value: 'tarjeta', icon: 'pi-credit-card' },
    { label: 'QR / Banco', value: 'qr', icon: 'pi-qrcode' },
    { label: 'Contra entrega', value: 'contra_entrega', icon: 'pi-money-bill' }
  ];

  ngOnInit() {
    // Si el carrito está vacío, redirigir
    if (this.cartService.isEmpty()) {
      this.router.navigate(['/carrito']);
      return;
    }

    // Pre-llenar datos del perfil
    const profile = this.auth.profile();
    if (profile?.full_name) this.fullName.set(profile.full_name);
    if (profile?.phone) this.phone.set(profile.phone);
  }

  isStep1Valid(): boolean {
    return !!(this.fullName() && this.phone() && this.address() && this.city());
  }

  setPaymentMethod(val: string) {
    this.paymentMethod.set(val as any);
  }

  nextStep() {
    if (this.activeStep() === 0 && !this.isStep1Valid()) {
      this.error.set('Por favor completá todos los campos obligatorios');
      return;
    }
    this.error.set(null);
    this.activeStep.update(s => s + 1);
  }

  prevStep() {
    this.activeStep.update(s => s - 1);
  }

  async confirmOrder() {
    if (!this.isStep1Valid()) return;

    this.loading.set(true);
    this.error.set(null);

    const checkoutData: CheckoutData = {
      shipping_address: this.address(),
      shipping_city: this.city(),
      shipping_phone: this.phone(),
      notes: this.notes() || undefined,
      payment_method: this.paymentMethod()
    };

    const { orderId, error } = await this.orderService.createOrder(
      this.cartService.items(),
      checkoutData
    );

    if (error || !orderId) {
      this.loading.set(false);
      this.error.set(error || 'Error desconocido al crear el pedido');
      return;
    }

    // Vaciar el carrito
    await this.cartService.clearCart();

    // Redirigir a la confirmación
    this.router.navigate(['/pedido-confirmado', orderId]);
  }
}
