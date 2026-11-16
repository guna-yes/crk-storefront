import { Component } from '@angular/core';
import { SiteNav } from './components/site-nav/site-nav';
import { Landing } from './components/landing/landing';
import { Story } from './components/story/story';
import { About } from './components/about/about';
import { OurWork } from './components/our-work/our-work';
import { ContactUs } from './components/contact-us/contact-us';
import { WhatsappFab } from './components/whatsapp-fab/whatsapp-fab';
import { SiteFooter } from './components/site-footer/site-footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SiteNav, Landing, Story, About, OurWork, ContactUs, SiteFooter, WhatsappFab],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
