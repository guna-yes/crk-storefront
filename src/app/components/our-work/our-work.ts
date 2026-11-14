import { Component, inject } from '@angular/core';
import { GalleryStore } from '../../services/gallery-store.service';
import { GalleryItem } from '../../models/gallery.model';
import { resolveImageUrl } from '../../services/api.service';
import { Reveal } from '../../directives/reveal.directive';

@Component({
  selector: 'app-our-work',
  standalone: true,
  imports: [Reveal],
  templateUrl: './our-work.html',
  styleUrl: './our-work.css',
})
export class OurWork {
  private readonly gallery = inject(GalleryStore);

  readonly items = this.gallery.items;
  readonly loaded = this.gallery.loaded;

  photo(item: GalleryItem): string | null {
    return resolveImageUrl(item.imageUrl);
  }
}
