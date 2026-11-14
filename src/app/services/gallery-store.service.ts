import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { GalleryItem, GallerySection } from '../models/gallery.model';

@Injectable({ providedIn: 'root' })
export class GalleryStore {
  private readonly api = inject(ApiService);

  readonly items = signal<GalleryItem[]>([]);
  readonly loaded = signal(false);

  section(section: GallerySection) {
    return computed(() => this.items().filter((i) => i.section === section));
  }

  constructor() {
    this.api.getGallery().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }
}
