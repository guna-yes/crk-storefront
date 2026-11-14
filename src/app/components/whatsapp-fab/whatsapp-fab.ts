import { Component } from '@angular/core';
import { Icon } from '../icon/icon';
import { whatsappLink } from '../../shared/contact.constants';

@Component({
  selector: 'app-whatsapp-fab',
  standalone: true,
  imports: [Icon],
  template: `
    <a class="fab" [href]="url" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
      <app-icon name="whatsapp" [size]="28" />
      <span class="label">Chat with us</span>
    </a>
  `,
  styleUrl: './whatsapp-fab.css',
})
export class WhatsappFab {
  readonly url = whatsappLink("Hi! I'd like to know more about your furniture.");
}
