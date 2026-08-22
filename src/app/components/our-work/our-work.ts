import { Component, computed, inject } from '@angular/core';
import { CatalogStore } from '../../services/catalog-store.service';
import { Product } from '../../models/product.model';
import { resolveImageUrl } from '../../services/api.service';
import { Reveal } from '../../directives/reveal.directive';

@Component({
  selector: 'app-our-work',
  standalone: true,
  imports: [Reveal],
  templateUrl: './our-work.html',
  styleUrl: './our-work.css',
})
export class OurWork {
  private readonly store = inject(CatalogStore);

  readonly pieces = computed(() => this.store.products().filter((product) => product.featured));

  photo(product: Product): string | null {
    return resolveImageUrl(product.imageUrl);
  }
}
