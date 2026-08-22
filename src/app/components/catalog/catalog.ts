import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogStore } from '../../services/catalog-store.service';
import { ProductCard } from '../product-card/product-card';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [FormsModule, ProductCard, Icon],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private readonly store = inject(CatalogStore);

  readonly filteredProducts = this.store.filteredProducts;
  readonly searchTerm = this.store.searchTerm;
  readonly categoryFilter = this.store.categoryFilter;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  readonly openProduct = output<string>();

  onSearch(term: string): void {
    this.store.setSearchTerm(term);
  }

  onCategoryChange(category: string): void {
    this.store.setCategoryFilter(category);
  }

  retry(): void {
    this.store.loadProducts();
  }
}
