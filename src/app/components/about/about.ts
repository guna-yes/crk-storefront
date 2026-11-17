import { Component, computed, inject } from '@angular/core';
import { GalleryStore } from '../../services/gallery-store.service';
import { resolveImageUrl } from '../../services/api.service';
import { Reveal } from '../../directives/reveal.directive';
import { whatsappLink } from '../../shared/contact.constants';

const FALLBACK_PHOTOS = [
  { src: 'about/workshop.jpg', alt: 'A craftsman planing wood in the workshop' },
  { src: 'about/craftsman.jpg', alt: 'Marking and shaping a wooden board' },
  { src: 'about/cutting.jpg', alt: 'Cutting timber to size' },
];

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Reveal],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  private readonly aboutItems = inject(GalleryStore).section('about');

  /** Admin-managed photos when present, otherwise the built-in sample photos. */
  readonly photos = computed(() => {
    const own = this.aboutItems()
      .slice(0, 3)
      .map((i) => ({
        src: resolveImageUrl(i.imageUrl) ?? '',
        alt: i.title || 'CRK Homes workshop',
      }));
    return own.length ? own : FALLBACK_PHOTOS;
  });

  readonly ownerWhatsappUrl = whatsappLink('Hi Suhail! I would like to know more about CRK Homes.');
  readonly whatsappUrl = whatsappLink('Hi! I would like to know more about CRK Homes.');
  readonly points = [
    { title: 'Solid wood', text: 'Teak, sheesham and mango wood - real timber, not particle board.' },
    { title: 'Made to order', text: 'Tell us the size, wood and finish. We build it for your home.' },
    { title: 'Finished by hand', text: 'Every piece is sanded, polished and checked by our craftsmen.' },
  ];
}
