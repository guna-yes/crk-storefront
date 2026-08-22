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
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    name: 'Anantapur Store',
    lines: ['Shop No: 25/643-24-16, 17', 'Penukonda Road, Anantapur', 'Andhra Pradesh - 515001'],
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
