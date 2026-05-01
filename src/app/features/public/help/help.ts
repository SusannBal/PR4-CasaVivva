import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

interface Faq {
  category: string;
  q: string;
  a: string;
}

@Component({
  selector: 'app-help',
  imports: [RouterLink, FormsModule, ButtonModule],
  templateUrl: './help.html'
})
export class Help {
  openFaq: number | null = null;
  activeCategory = signal('todas');

  appointmentForm = {
    name: '',
    email: '',
    phone: '',
    date: '',
    topic: '',
    message: ''
  };

  appointmentSent = signal(false);
  contactSent = signal(false);

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  categories = ['todas', 'envíos', 'pagos', 'devoluciones', 'productos', 'cuenta'];

  faqs: Faq[] = [
    // Envíos
    {
      category: 'envíos',
      q: '¿Cuánto tarda el envío en llegar?',
      a: 'Tarija: 1-2 días hábiles. Cochabamba, La Paz, Santa Cruz: 3-4 días hábiles. Otras ciudades: 4-6 días hábiles. Los tiempos pueden variar según el courier disponible en tu zona.'
    },
    {
      category: 'envíos',
      q: '¿Hacen envíos a todo Bolivia?',
      a: 'Sí, enviamos a las 9 ciudades principales de Bolivia. Para zonas rurales o poblaciones pequeñas, consultanos por WhatsApp y verificamos la disponibilidad.'
    },
    {
      category: 'envíos',
      q: '¿Cómo hago seguimiento a mi pedido?',
      a: 'Una vez despachado tu pedido, te enviamos el código de seguimiento del courier por correo. También podés ver el estado en "Mis pedidos" dentro de tu cuenta.'
    },
    {
      category: 'envíos',
      q: '¿El envío tiene costo?',
      a: 'En compras mayores a Bs. 500 el envío es gratis. Para compras menores, el costo varía según la ciudad de destino y se muestra antes de confirmar el pedido.'
    },
    // Pagos
    {
      category: 'pagos',
      q: '¿Qué métodos de pago aceptan?',
      a: 'Aceptamos: tarjeta de débito/crédito, QR (código de pago), billetera digital (Tigo Money, Bolivianet), y pago contra entrega en ciudades habilitadas.'
    },
    {
      category: 'pagos',
      q: '¿Es seguro pagar en línea?',
      a: 'Sí. Todos los pagos están cifrados con SSL. No guardamos datos de tarjetas en nuestros servidores. Usamos pasarelas de pago certificadas.'
    },
    {
      category: 'pagos',
      q: '¿Puedo pagar contra entrega?',
      a: 'Sí, disponible en Tarija, Cochabamba, La Paz y Santa Cruz. Al momento de finalizar tu compra seleccionás "Pago contra entrega" y listo.'
    },
    // Devoluciones
    {
      category: 'devoluciones',
      q: '¿Cómo hago una devolución?',
      a: 'Tenés 30 días desde la entrega para devolver el producto. Escribinos por WhatsApp con tu número de pedido y coordinamos el retiro sin costo adicional.'
    },
    {
      category: 'devoluciones',
      q: '¿En qué casos se acepta una devolución?',
      a: 'Aceptamos devoluciones si: el producto llegó dañado, es diferente a lo descrito, o simplemente no te convenció. El producto debe estar en su embalaje original.'
    },
    {
      category: 'devoluciones',
      q: '¿Cuánto tarda el reembolso?',
      a: 'Una vez que recibimos el producto, procesamos el reembolso en 3-5 días hábiles al mismo método de pago original.'
    },
    // Productos
    {
      category: 'productos',
      q: '¿Los productos son como aparecen en las fotos?',
      a: 'Trabajamos para que las fotos representen fielmente cada producto. Los colores pueden variar levemente según la calibración de tu pantalla. En la descripción indicamos las medidas exactas.'
    },
    {
      category: 'productos',
      q: '¿Tienen garantía los productos?',
      a: 'Sí. Todos los muebles y artículos de decoración tienen garantía de 6 meses por defectos de fabricación. Textiles y accesorios tienen 30 días.'
    },
    {
      category: 'productos',
      q: '¿Puedo ver el producto antes de comprarlo?',
      a: 'Somos una tienda 100% online. Sin embargo, podés agendar una videollamada con nuestro equipo para ver el producto en detalle y hacer consultas antes de comprar.'
    },
    {
      category: 'cuenta',
      q: '¿Cómo creo mi cuenta?',
      a: 'Hacé clic en "Unirme" en el menú principal, ingresá tu nombre, correo y contraseña. En segundos ya tenés tu cuenta activa y podés empezar a comprar.'
    },
    {
      category: 'cuenta',
      q: '¿Olvidé mi contraseña, qué hago?',
      a: 'En la pantalla para iniciar sesión, hacé clic en "¿Olvidaste tu contraseña?". Te enviamos un enlace de recuperación a tu correo en menos de 1 minuto.'
    },
    {
      category: 'cuenta',
      q: '¿Puedo comprar sin crear una cuenta?',
      a: 'Por el momento es necesario tener una cuenta para finalizar tu compra. Esto permite que puedas hacer seguimiento de tus pedidos y guardar tus favoritos. Crear una cuenta es gratis y tarda 30 segundos.'
    }
  ];

  get filteredFaqs(): Faq[] {
    if (this.activeCategory() === 'todas') return this.faqs;
    return this.faqs.filter(f => f.category === this.activeCategory());
  }

  toggleFaq(i: number) {
    this.openFaq = this.openFaq === i ? null : i;
    // Reset cuando cambia categoría
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.openFaq = null;
  }

  sendAppointment() {
    // Simulación — en producción conectar con backend/email
    this.appointmentSent.set(true);
    this.appointmentForm = { name: '', email: '', phone: '', date: '', topic: '', message: '' };
    setTimeout(() => this.appointmentSent.set(false), 5000);
  }

  sendContact() {
    this.contactSent.set(true);
    this.contactForm = { name: '', email: '', subject: '', message: '' };
    setTimeout(() => this.contactSent.set(false), 5000);
  }

  categoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      todas: 'Todas',
      'envíos': 'Envíos',
      pagos: 'Pagos',
      devoluciones: 'Devoluciones',
      productos: 'Productos',
      cuenta: 'Mi cuenta'
    };
    return labels[cat] ?? cat;
  }

  scrollToContact(event: Event) {
    event.preventDefault();
    const el = document.getElementById('contacto');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
