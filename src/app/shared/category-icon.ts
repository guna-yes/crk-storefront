import { IconName } from '../components/icon/icon';

const CATEGORY_ICONS: Record<string, IconName> = {
  Sofa: 'sofa',
  Dining: 'dining',
  Bed: 'bed',
  Chair: 'chair',
  Wardrobe: 'wardrobe',
};

export function iconForCategory(category: string): IconName {
  return CATEGORY_ICONS[category] ?? 'box';
}
