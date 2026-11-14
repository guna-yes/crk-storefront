export type GallerySection = 'story' | 'about' | 'work';

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  order: number;
  section: GallerySection;
  imageUrl: string;
}
