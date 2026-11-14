export const WHATSAPP_NUMBER = '918555808771';
export const WHATSAPP_DISPLAY = '+91 85558 08771';
export const INSTAGRAM_URL = 'https://www.instagram.com/crkhomefurniture?igsh=ZTB6eXJ6dHlqNjdk';
export const INSTAGRAM_HANDLE = '@crkhomefurniture';

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export interface StoreLocation {
  name: string;
  lines: string[];
  mapUrl?: string;
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    name: 'Anantapur Store',
    lines: [
      '37-33-1, Bellary - Uravakonda - Anantapur Rd',
      'Near Mayuri Tiles, Industrial Estate, Pilligundla',
      'Anantapur, Narayanapuram',
      'Andhra Pradesh - 515004',
    ],
    mapUrl: 'https://maps.app.goo.gl/fAZuL7A9Mgic1UHU8',
  },
  {
    name: 'Dharmavaram Store',
    lines: [
      'Main Road, Opp. Market Yard',
      'Dharmavaram, Anantapur Dist',
      'Andhra Pradesh - 515671',
    ],
  },
];
