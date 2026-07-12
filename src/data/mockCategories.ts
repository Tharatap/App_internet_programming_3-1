import { Category } from '@/types/product';

/** Product categories shown in the horizontal rail on the Home screen. */
export const mockCategories: Category[] = [
  { id: 'air', name: 'แอร์', icon: 'airVent' },
  { id: 'fridge', name: 'ตู้เย็น', icon: 'refrigerator' },
  { id: 'tv', name: 'ทีวี', icon: 'tv' },
  { id: 'washer', name: 'เครื่องซักผ้า', icon: 'washingMachine' },
  { id: 'fan', name: 'พัดลม', icon: 'fan' },
  { id: 'ricecooker', name: 'หม้อหุงข้าว', icon: 'cookingPot' },
  { id: 'microwave', name: 'ไมโครเวฟ', icon: 'microwave' },
];
