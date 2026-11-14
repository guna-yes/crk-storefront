import { Component, HostListener, OnDestroy, OnInit, input, output, signal } from '@angular/core';
import { Icon } from '../icon/icon';

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const clampScale = (n: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [Icon],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
})
export class Lightbox implements OnInit, OnDestroy {
  images = input.required<{ src: string; alt: string }[]>();
  start = input<number>(0);
  closed = output<void>();

  readonly index = signal(0);
  readonly scale = signal(1);
  readonly rotation = signal(0);
  readonly tx = signal(0);
  readonly ty = signal(0);
  readonly dragging = signal(false);

  private pointers = new Map<number, { x: number; y: number }>();
  private pinchStart = 0;
  private pinchScale = 1;
  private lastTap = 0;

  ngOnInit(): void {
    this.index.set(this.start());
    document.body.classList.add('menu-open-lock');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-open-lock');
  }

  current(): { src: string; alt: string } {
    return this.images()[this.index()];
  }

  transform(): string {
    return `translate(${this.tx()}px, ${this.ty()}px) rotate(${this.rotation()}deg) scale(${this.scale()})`;
  }

  reset(): void {
    this.scale.set(1);
    this.rotation.set(0);
    this.tx.set(0);
    this.ty.set(0);
  }

  go(delta: number): void {
    const n = this.images().length;
    this.index.set((this.index() + delta + n) % n);
    this.reset();
  }

  zoom(factor: number): void {
    const next = clampScale(this.scale() * factor);
    this.scale.set(next);
    if (next === 1) {
      this.tx.set(0);
      this.ty.set(0);
    }
  }

  rotate(deg: number): void {
    this.rotation.update((r) => r + deg);
  }

  close(): void {
    this.closed.emit();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15);
  }

  onPointerDown(event: PointerEvent): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 2) {
      this.pinchStart = this.pinchDistance();
      this.pinchScale = this.scale();
    } else {
      this.dragging.set(true);
      const now = Date.now();
      if (now - this.lastTap < 300) {
        this.scale() > 1 ? this.reset() : this.scale.set(2.5);
      }
      this.lastTap = now;
    }
  }

  onPointerMove(event: PointerEvent): void {
    const prev = this.pointers.get(event.pointerId);
    if (!prev) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 2 && this.pinchStart > 0) {
      this.scale.set(clampScale(this.pinchScale * (this.pinchDistance() / this.pinchStart)));
    } else if (this.scale() > 1) {
      this.tx.update((v) => v + event.clientX - prev.x);
      this.ty.update((v) => v + event.clientY - prev.y);
    }
  }

  onPointerUp(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.pinchStart = 0;
    if (this.pointers.size === 0) {
      this.dragging.set(false);
      if (this.scale() <= 1) {
        this.tx.set(0);
        this.ty.set(0);
      }
    }
  }

  private pinchDistance(): number {
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  @HostListener('window:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape': this.close(); break;
      case 'ArrowRight': this.go(1); break;
      case 'ArrowLeft': this.go(-1); break;
      case '+': case '=': this.zoom(1.3); break;
      case '-': this.zoom(1 / 1.3); break;
      case 'r': case 'R': this.rotate(90); break;
    }
  }
}
