import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { CatalogStore } from '../../services/catalog-store.service';
import { FurnitureViewer } from '../furniture-viewer/furniture-viewer';
import { Icon } from '../icon/icon';
import { Reveal } from '../../directives/reveal.directive';
import { whatsappLink } from '../../shared/contact.constants';

interface ShowcaseCategory {
  key: string;
  label: string;
  category: string;
  color: string;
  description: string;
  cta: string;
  isCustom?: boolean;
}

const SHOWCASE_CATEGORIES: ShowcaseCategory[] = [
  {
    key: 'sofa',
    label: 'Sofas',
    category: 'Sofa',
    color: '#8b5a2b',
    description:
      'Three-seaters, sectionals, and lounge sets - cushioned and framed in solid wood.',
    cta: 'Browse Sofas',
  },
  {
    key: 'dining',
    label: 'Dining Tables',
    category: 'Dining',
    color: '#8a5c34',
    description: 'Tables and chair sets sized for your family, in the wood and finish you choose.',
    cta: 'Browse Dining',
  },
  {
    key: 'bed',
    label: 'Beds',
    category: 'Bed',
    color: '#c9a37b',
    description: 'Bed frames from single to king size, with matching headboards and storage.',
    cta: 'Browse Beds',
  },
  {
    key: 'custom',
    label: 'Customised Furniture',
    category: 'Wardrobe',
    color: '#e0ac54',
    description:
      'Have something specific in mind? We build sofas, wardrobes, and full interiors to your exact requirement.',
    cta: 'Chat with us',
    isCustom: true,
  },
];

@Component({
  selector: 'app-what-we-do',
  standalone: true,
  imports: [FurnitureViewer, Icon, Reveal],
  templateUrl: './what-we-do.html',
  styleUrl: './what-we-do.css',
})
export class WhatWeDo implements OnDestroy {
  private readonly store = inject(CatalogStore);

  readonly categories = SHOWCASE_CATEGORIES;
  readonly activeKey = signal(SHOWCASE_CATEGORIES[0].key);
  readonly activeCategory = computed(
    () => this.categories.find((item) => item.key === this.activeKey()) ?? this.categories[0],
  );

  private readonly itemRefs = viewChildren<ElementRef<HTMLElement>>('categoryItem');
  private observer?: IntersectionObserver;
  private readonly ratios = new Map<Element, number>();
  private static readonly THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

  constructor() {
    effect(() => {
      const elements = this.itemRefs();
      if (elements.length && !this.observer && typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              this.ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
            }

            let bestTarget: Element | null = null;
            let bestRatio = 0;
            for (const [target, ratio] of this.ratios) {
              if (ratio > bestRatio) {
                bestRatio = ratio;
                bestTarget = target;
              }
            }

            if (bestTarget) {
              const index = elements.findIndex((ref) => ref.nativeElement === bestTarget);
              if (index >= 0) {
                this.activeKey.set(this.categories[index].key);
              }
            }
          },
          { threshold: WhatWeDo.THRESHOLDS },
        );
        elements.forEach((ref) => this.observer?.observe(ref.nativeElement));
      }
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  selectCategory(item: ShowcaseCategory): void {
    if (item.isCustom) {
      window.open(
        whatsappLink("Hi! I'm interested in a custom furniture order. Could we discuss the details?"),
        '_blank',
        'noopener',
      );
      return;
    }

    this.store.setCategoryFilter(item.category);
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
  }
}
