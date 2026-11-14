import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Lead, NewLead } from '../models/lead.model';
import { GalleryItem } from '../models/gallery.model';

export const API_ORIGIN = 'https://crk-furnitures-api.onrender.com';
const BASE_URL = `${API_ORIGIN}/api`;

export function resolveImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return imageUrl.startsWith('/') ? `${API_ORIGIN}${imageUrl}` : imageUrl;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${BASE_URL}/products`);
  }

  getGallery(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${BASE_URL}/gallery`);
  }

  createLead(lead: NewLead): Observable<Lead> {
    return this.http.post<Lead>(`${BASE_URL}/leads`, lead);
  }
}
