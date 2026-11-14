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
];

const INTRO_SHARE = 0.14;
const clamp = (n: number) => Math.min(1, Math.max(0, n));

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
  private ticking = false;

  readonly photos = computed(() =>
    this.gallery.items().map((item) => resolveImageUrl(item.imageUrl)),
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
    const el = this.track.nativeElement;
    const rect = el.getBoundingClientRect();
    const distance = rect.height - window.innerHeight;
    this.progress.set(distance > 0 ? clamp(-rect.top / distance) : 0);
  }

  /** Local 0..1 position within chapter i (can be outside 0..1 when inactive). */
  private local(i: number): number {
    return this.chapterProgress() * this.chapters.length - i;
  }

  private chapterProgress(): number {
    return clamp((this.progress() - INTRO_SHARE) / (1 - INTRO_SHARE));
  }

  frameStyle(): Record<string, string> {
    const t = clamp((this.progress() - 0.03) / (INTRO_SHARE - 0.03));
    return {
      opacity: String(t),
      transform: `translateY(${(1 - t) * 60}px) scale(${0.9 + 0.1 * t})`,
    };
  }

  introStyle(): Record<string, string> {
    const p = clamp(this.progress() / (INTRO_SHARE * 0.8));
    return {
      opacity: String(1 - p),
      transform: `translateY(${-p * 40}px) scale(${1 - p * 0.06})`,
    };
  }

  layerStyle(i: number): Record<string, string> {
    const l = this.local(i);
    const fadeIn = i === 0 ? 1 : clamp(l / 0.3);
    const fadeOut = i === this.chapters.length - 1 ? 1 : clamp((1 - l) / 0.3);
    const opacity = Math.min(fadeIn, fadeOut);
    const t = clamp(l);
    return {
      opacity: String(opacity),
      '--zoom': String(1.14 - 0.14 * t),
      'z-index': String(i + 1),
      visibility: opacity <= 0.01 ? 'hidden' : 'visible',
    };
  }

  textStyle(i: number): Record<string, string> {
    const l = this.local(i);
    const fadeIn = clamp((l - 0.1) / 0.25);
    const fadeOut = i === this.chapters.length - 1 ? 1 : clamp((0.95 - l) / 0.2);
    const opacity = Math.min(fadeIn, fadeOut);
    return {
      opacity: String(opacity),
      transform: `translateY(${(1 - fadeIn) * 28}px)`,
    };
  }
}
