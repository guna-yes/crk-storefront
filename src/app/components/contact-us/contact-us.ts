import { Component } from '@angular/core';
import { Icon } from '../icon/icon';
import { Reveal } from '../../directives/reveal.directive';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  STORE_LOCATIONS,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from '../../shared/contact.constants';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [Icon, Reveal],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.css',
})
export class ContactUs {
  readonly stores = STORE_LOCATIONS;
  readonly whatsappUrl = whatsappLink("Hi! I'd like to know more about your furniture.");
  readonly whatsappDisplay = WHATSAPP_DISPLAY;
  readonly instagramUrl = INSTAGRAM_URL;
  readonly instagramHandle = INSTAGRAM_HANDLE;
}
