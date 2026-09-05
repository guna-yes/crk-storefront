import { Component, ElementRef, ViewChild, computed, input, output, signal } from '@angular/core';
import { Product } from '../../models/product.model';
import { FurnitureViewer } from '../furniture-viewer/furniture-viewer';
import { Icon } from '../icon/icon';
import { whatsappLink } from '../../shared/contact.constants';
import { resolveImageUrl } from '../../services/api.service';

type ModalSlide = 'photo' | 'model';

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

  @ViewChild('track') private track?: ElementRef<HTMLDivElement>;

  readonly activeSlide = signal(0);

  readonly photoUrl = computed(() => resolveImageUrl(this.product().imageUrl));

  readonly slides = computed<ModalSlide[]>(() =>
    this.photoUrl() ? ['photo', 'model'] : ['model'],
  );

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

  onTrackScroll(event: Event): void {
    const el = event.target as HTMLDivElement;
    if (!el.clientWidth) return;
    this.activeSlide.set(Math.round(el.scrollLeft / el.clientWidth));
  }

  goToSlide(index: number): void {
    const el = this.track?.nativeElement;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, this.slides().length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }
}
