import { Component } from '@angular/core';
import { Reveal } from '../../directives/reveal.directive';
import { whatsappLink } from '../../shared/contact.constants';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Reveal],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  readonly whatsappUrl = whatsappLink('Hi! I would like to know more about CRK Furnitures.');
  readonly points = [
    { title: 'Solid wood', text: 'Teak, sheesham and mango wood - real timber, not particle board.' },
    { title: 'Made to order', text: 'Tell us the size, wood and finish. We build it for your home.' },
    { title: 'Finished by hand', text: 'Every piece is sanded, polished and checked by our craftsmen.' },
  ];
}
