import { Component, computed, inject } from '@angular/core';
import { CatalogStore } from '../../services/catalog-store.service';
import { Product } from '../../models/product.model';
import { resolveImageUrl } from '../../services/api.service';
import { Reveal } from '../../directives/reveal.directive';
import { Icon } from '../icon/icon';
import { iconForCategory } from '../../shared/category-icon';

@Component({
  selector: 'app-our-work',
  standalone: true,
  imports: [Reveal, Icon],
  templateUrl: './our-work.html',
  styleUrl: './our-work.css',
})
export class OurWork {
  private readonly store = inject(CatalogStore);

  readonly pieces = computed(() => this.store.products().filter((product) => product.featured));

  photo(product: Product): string | null {
    return resolveImageUrl(product.imageUrl);
  }

  categoryIcon(product: Product) {
    return iconForCategory(product.category);
  }
}
