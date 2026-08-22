import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly api = inject(ApiService);

  private readonly _products = signal<Product[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly categoryFilter = signal<string>('All');

  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly filteredProducts = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.categoryFilter();
    return this._products().filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesTerm =
        !term ||
        [product.name, product.category, product.wood].some((field) =>
          field.toLowerCase().includes(term),
        );
      return matchesCategory && matchesTerm;
    });
  });

  readonly featuredProduct = computed(
    () => this._products().find((product) => product.featured) ?? this._products()[0] ?? null,
  );

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);

    this.api.getProducts().subscribe({
      next: (products) => {
        this._products.set(products ?? []);
        this._loading.set(false);
      },
      error: () => {
        this._error.set("We couldn't load the catalog right now. Please try again shortly.");
        this._loading.set(false);
      },
    });
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setCategoryFilter(category: string): void {
    this.categoryFilter.set(category);
  }
}
