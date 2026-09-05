import { Component, OnDestroy, signal } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [Icon],
  templateUrl: './site-nav.html',
  styleUrl: './site-nav.css',
})
export class SiteNav implements OnDestroy {
  readonly menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.syncBodyScroll();
  }

  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.syncBodyScroll();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('menu-open-lock');
  }

  private syncBodyScroll(): void {
    document.body.classList.toggle('menu-open-lock', this.menuOpen());
  }
}
