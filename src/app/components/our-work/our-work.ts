import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { GalleryStore } from '../../services/gallery-store.service';
import { GalleryItem } from '../../models/gallery.model';
import { resolveImageUrl } from '../../services/api.service';
import { Reveal } from '../../directives/reveal.directive';
import { Icon } from '../icon/icon';
import { Lightbox } from '../lightbox/lightbox';

const AUTO_SCROLL_MS = 5000;
const PAUSE_AFTER_TOUCH_MS = 8000;

@Component({
  selector: 'app-our-work',
  standalone: true,
  imports: [Reveal, Icon, Lightbox],
  templateUrl: './our-work.html',
  styleUrl: './our-work.css',
})
export class OurWork implements OnInit, OnDestroy {
  private readonly gallery = inject(GalleryStore);

  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;

  readonly items = this.gallery.section('work');
  readonly loaded = this.gallery.loaded;
  readonly viewing = signal<number | null>(null);

  readonly images = computed(() =>
    this.items().map((item) => ({
      src: this.media(item) ?? '',
      alt: item.title || 'Our work',
      type: item.mediaType,
    })),
  );

  private timer?: ReturnType<typeof setInterval>;
  private resumeAt = 0;

  ngOnInit(): void {
    this.timer = setInterval(() => this.advance(), AUTO_SCROLL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  photo(item: GalleryItem): string | null {
    return resolveImageUrl(item.imageUrl);
  }

  media(item: GalleryItem): string | null {
    return resolveImageUrl(item.mediaType === 'video' ? item.videoUrl : item.imageUrl);
  }

  open(index: number): void {
    this.viewing.set(index);
  }

  /** Called when the visitor touches, drags or hovers the strip. */
  userActive(): void {
    this.resumeAt = Date.now() + PAUSE_AFTER_TOUCH_MS;
  }

  scrollBy(direction: 1 | -1): void {
    this.userActive();
    const el = this.track.nativeElement;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    el.scrollBy({ left: direction * (first.getBoundingClientRect().width + 16), behavior: 'smooth' });
  }

  private advance(): void {
    if (Date.now() < this.resumeAt || this.viewing() !== null) return;
    const el = this.track.nativeElement;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first || el.scrollWidth <= el.clientWidth) return;
    const step = first.getBoundingClientRect().width + 16;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
  }
}
