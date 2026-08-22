import { Component, computed, input, output } from '@angular/core';
import { Product } from '../../models/product.model';
import { FurnitureViewer } from '../furniture-viewer/furniture-viewer';
import { Icon } from '../icon/icon';
import { whatsappLink } from '../../shared/contact.constants';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [FurnitureViewer, Icon],
  templateUrl: './product-modal.html',
  styleUrl: './product-modal.css',
})
export class ProductModal {
  product = input.required<Product>();

  closed = output<void>();
  enquire = output<string>();

  readonly whatsappUrl = computed(() => {
    const p = this.product();
    return whatsappLink(
      `Hi! I'm interested in the ${p.name} (${this.formatPrice(p.price)}). Could you share more details?`,
    );
  });

  formatPrice(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
