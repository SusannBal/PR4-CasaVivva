import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-about',
  imports: [RouterLink, ButtonModule],
  templateUrl: './about.html'
})
export class About {
  values = [
    {
      icon: 'pi-heart',
      title: 'Diseño con propósito',
      description: 'Cada pieza que seleccionamos tiene historia y función. No vendemos decoración, vendemos ambientes.'
    },
    {
      icon: 'pi-shield',
      title: 'Calidad garantizada',
      description: '30 días de devolución sin preguntas. Si no te convence, te devolvemos el dinero.'
    },
    {
      icon: 'pi-users',
      title: 'Atención real',
      description: 'Somos un equipo pequeño que responde cada consulta. Sin bots, sin respuestas automáticas.'
    },
    {
      icon: 'pi-map-marker',
      title: 'Orgullo boliviano',
      description: 'Nacimos en Tarija y entregamos en todo Bolivia. Apoyamos a artesanos locales.'
    }
  ];
}
