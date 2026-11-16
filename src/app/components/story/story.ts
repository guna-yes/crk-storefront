import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { GalleryStore } from '../../services/gallery-store.service';
import { resolveImageUrl } from '../../services/api.service';
import { Icon } from '../icon/icon';

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

/** Scroll progress (0..1) at which each phase of the story starts/ends. */
const INTRO_END = 0.04; // card holds still, then starts to grow
const EXPAND_END = 0.16; // card has grown to full screen
const CURTAIN_START = 0.86; // curtains begin to close
const CURTAIN_END = 0.97; // curtains fully closed

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const ease = (t: number) => t * t * (3 - 2 * t);

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [Icon],
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

  /** 0 = rounded card, 1 = full screen. */
  readonly expansion = computed(() =>
    ease(clamp((this.progress() - INTRO_END) / (EXPAND_END - INTRO_END))),
  );

  /** 0 = curtains open, 1 = closed. */
  readonly curtain = computed(() =>
    ease(clamp((this.progress() - CURTAIN_START) / (CURTAIN_END - CURTAIN_START))),
  );

  private readonly chapterProgress = computed(() =>
    clamp((this.progress() - EXPAND_END) / (CURTAIN_START - EXPAND_END)),
  );

  readonly active = computed(() =>
    Math.min(this.chapters.length - 1, Math.floor(this.chapterProgress() * this.chapters.length)),
  );

  readonly nextLabel = computed(() => {
    const next = this.chapters[this.active() + 1];
    return next ? next.title : 'Who we are';
  });

  readonly nextPhoto = computed(() => this.photos()[this.active() + 1] ?? null);

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
    const el = this.track.nativeElement;
    const rect = el.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    this.viewport.set({ w: window.innerWidth, h: window.innerHeight });
    this.progress.set(distance > 0 ? clamp(-rect.top / distance) : 0);
  }

  /** Local position within chapter i (outside 0..1 when inactive). */
  private local(i: number): number {
    return this.chapterProgress() * this.chapters.length - i;
  }

  // ---- navigation -------------------------------------------------------

  /** Scroll so that chapter i is centred on screen. */
  goTo(i: number): void {
    const el = this.track.nativeElement;
    const rect = el.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    const target =
      i >= this.chapters.length
        ? 1
        : EXPAND_END + (CURTAIN_START - EXPAND_END) * ((Math.max(0, i) + 0.5) / this.chapters.length);
    window.scrollTo({ top: window.scrollY + rect.top + target * distance, behavior: 'smooth' });
  }

  // ---- styles -----------------------------------------------------------

  frameStyle(): Record<string, string> {
    const { w: vw, h: vh } = this.viewport();
    const mobile = vw <= 720;
    const e = this.expansion();
    const w0 = Math.min(vw * 0.92, 1100);
    const h0 = mobile ? vh * 0.62 : Math.min(vh * 0.72, 640);
    const mt0 = vh * (mobile ? 0.1 : 0.08);
    const r0 = Math.min(36, Math.max(20, vw * 0.04));
    return {
      width: `${w0 + (vw - w0) * e}px`,
      height: `${h0 + (vh - h0) * e}px`,
      'margin-top': `${mt0 * (1 - e)}px`,
      'border-radius': `${r0 * (1 - e)}px`,
      'box-shadow': e > 0.9 ? 'none' : '',
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

  layerStyle(i: number): Record<string, string> {
    const l = this.local(i);
    const fadeIn = i === 0 ? 1 : clamp(l / 0.3);
    const fadeOut = i === this.chapters.length - 1 ? 1 : clamp((1 - l) / 0.3);
    const opacity = Math.min(fadeIn, fadeOut);
    const t = clamp(l);
    // New photo slides up from below; a light zoom pulse marks each change.
    const pulse = 1 + 0.06 * Math.max(0, 1 - fadeIn);
    return {
      opacity: String(opacity),
      transform: `translateY(${(1 - fadeIn) * 7}%)`,
      '--zoom': String((1.1 - 0.1 * t) * pulse),
      'z-index': String(i + 1),
      visibility: opacity <= 0.01 ? 'hidden' : 'visible',
    };
  }

  textStyle(i: number): Record<string, string> {
    const l = this.local(i);
    const fadeIn = i === 0 ? 1 : clamp((l - 0.1) / 0.25);
    const fadeOut = i === this.chapters.length - 1 ? 1 : clamp((0.95 - l) / 0.2);
    const opacity = Math.min(fadeIn, fadeOut);
    return {
      opacity: String(opacity),
      transform: `translateY(${(1 - fadeIn) * 28}px)`,
    };
  }

  /** Navigation overlay fades in once the card is nearly full screen. */
  navStyle(): Record<string, string> {
    const open = 1 - clamp(this.curtain() * 2.5);
    return { opacity: String(clamp((this.expansion() - 0.75) / 0.25) * open) };
  }
}
