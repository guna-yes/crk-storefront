import { Component, computed, inject, signal } from '@angular/core';
import { SiteNav } from './components/site-nav/site-nav';
import { WhatWeDo } from './components/what-we-do/what-we-do';
import { Catalog } from './components/catalog/catalog';
import { OurWork } from './components/our-work/our-work';
import { ContactUs } from './components/contact-us/contact-us';
import { SiteFooter } from './components/site-footer/site-footer';
import { ProductModal } from './components/product-modal/product-modal';
import { EnquiryForm } from './components/enquiry-form/enquiry-form';
import { CatalogStore } from './services/catalog-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SiteNav,
    WhatWeDo,
    Catalog,
    OurWork,
    ContactUs,
    SiteFooter,
    ProductModal,
    EnquiryForm,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly store = inject(CatalogStore);

  readonly openProductId = signal<string | null>(null);
  readonly enquiryProductId = signal<string | null>(null);

  readonly openProduct = computed(
    () => this.store.products().find((p) => p.id === this.openProductId()) ?? null,
  );
  readonly enquiryProduct = computed(
    () => this.store.products().find((p) => p.id === this.enquiryProductId()) ?? null,
  );

  viewProduct(id: string): void {
    this.openProductId.set(id);
  }

  closeProduct(): void {
    this.openProductId.set(null);
  }

  startEnquiry(id: string): void {
    this.enquiryProductId.set(id);
    this.openProductId.set(null);
  }

  closeEnquiry(): void {
    this.enquiryProductId.set(null);
  }
}
