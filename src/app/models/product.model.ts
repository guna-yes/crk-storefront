export interface Product {
  id: string;
  name: string;
  category: string;
  wood: string;
  finish: string;
  price: number;
  stock: number;
  deliveryDays: number;
  dimensions: string;
  description: string;
  color: string;
  featured: boolean;
  imageUrl: string | null;
}

export const PRODUCT_CATEGORIES = ['Sofa', 'Dining', 'Bed', 'Chair', 'Wardrobe'] as const;
