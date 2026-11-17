import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { GalleryStore } from '../../services/gallery-store.service';
import { resolveImageUrl } from '../../services/api.service';

interface Chapter {
  title: string;
  line: string;
}

const CHAPTERS: Chapter[] = [
  { title: 'Sofas', line: 'Deep, comfortable seating, framed in solid wood.' },
  { title: 'Dining tables', line: 'Made for family meals, in the wood and finish you choose.' },
  { title: 'Beds', line: 'Sturdy frames and headboards, built to last for years.' },
  { title: 'Made to order', line: 'Wardrobes, interiors, or your own design - built to your size.' },
  { title: 'Curtains', line: 'Made-to-measure curtains and blinds to finish your room.' },
];

/** Share of the scroll used by the cards; the rest closes the curtains. */
const CARDS_END = 0.84;
const CURTAIN_START = 0.88;
const CURTAIN_END = 0.98;
const PEEK = 58;
const BOTTOM_GAP = 28;

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (t: number) => t * t * (3 - 2 * t);

@Component({
  selector: 'app-story',
  standalone: true,
  templateUrl: './story.html',
  styleUrl: './story.css',
})
export class Story implements OnInit {
  private readonly gallery = inject(GalleryStore);

  @ViewChild('track', { static: true }) track!: ElementRef<HTMLElement>;

  readonly chapters = CHAPTERS;
  readonly progress = signal(0);
  private readonly viewport = signal({ w: 1280, h: 800 });
  private ticking = false;

  private readonly storyItems = this.gallery.section('story');

  readonly photos = computed(() =>
    this.storyItems().map((item) => resolveImageUrl(item.imageUrl)),
  );

  /** 0 .. chapters-1: which card is in front (fractional while sliding). */
  private readonly t = computed(() => clamp(this.progress() / CARDS_END) * (CHAPTERS.length - 1));

  readonly active = computed(() => Math.min(CHAPTERS.length - 1, Math.round(this.t())));

  /** 0 = curtains open, 1 = closed. */
  readonly curtain = computed(() =>
    ease(clamp((this.progress() - CURTAIN_START) / (CURTAIN_END - CURTAIN_START))),
  );

  ngOnInit(): void {
    this.update();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  }

  private update(): void {
    const rect = this.track.nativeElement.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    this.viewport.set({ w: window.innerWidth, h: window.innerHeight });
    this.progress.set(distance > 0 ? clamp(-rect.top / distance) : 0);
  }

  /** Scroll so that card i is fully in front. */
  goTo(i: number): void {
    const rect = this.track.nativeElement.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    const clamped = Math.max(0, Math.min(i, CHAPTERS.length));
    const target =
      clamped >= CHAPTERS.length ? 1 : (clamped / (CHAPTERS.length - 1)) * CARDS_END;
    window.scrollTo({ top: window.scrollY + rect.top + target * distance, behavior: 'smooth' });
  }

  cardStyle(i: number): Record<string, string> {
    const t = this.t();
    const cardsHeight = this.viewport().h - 84;
    const rest = cardsHeight - PEEK - BOTTOM_GAP;
    const ahead = i - t; // how many cards this one still has to travel
    // The next card peeks at the bottom; cards further ahead wait off-screen.
    const y =
      ahead <= 0
        ? 0
        : ahead <= 1
          ? (1 - ease(1 - ahead)) * rest
          : rest + Math.min(1, ahead - 1) * (PEEK + BOTTOM_GAP + 40);
    const covered = Math.max(0, t - i);
    const scale = covered > 1 ? 0.94 - 0.03 * Math.min(1, covered - 1) : 1 - 0.06 * clamp(covered);
    return {
      transform: `translateY(${y}px) scale(${scale})`,
      '--dim': String(0.55 * clamp(covered)),
      'z-index': String(i + 1),
    };
  }

  curtainStyle(side: 'left' | 'right'): Record<string, string> {
    const c = this.curtain();
    const dir = side === 'left' ? -1 : 1;
    return {
      transform: `translateX(${dir * (1 - c) * 101}%)`,
      visibility: c <= 0.001 ? 'hidden' : 'visible',
    };
  }
}
