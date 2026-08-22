import { Component, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { Reveal } from '../../directives/reveal.directive';
import { resolveImageUrl } from '../../services/api.service';
import { Icon } from '../icon/icon';
import { iconForCategory } from '../../shared/category-icon';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [Reveal, Icon],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<Product>();

  open = output<string>();

  get photo(): string | null {
    return resolveImageUrl(this.product().imageUrl);
  }

  get categoryIcon() {
    return iconForCategory(this.product().category);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
