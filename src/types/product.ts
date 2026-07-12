/**
 * Core domain types for the Chaje Electric shop (Phase 1 — mock data only).
 */

/** A product category shown in the horizontal category rail on Home. */
export interface Category {
  id: string;
  /** Thai display name, e.g. "แอร์" */
  name: string;
  /** lucide-react-native icon name resolved in CategoryIcon. */
  icon: CategoryIconName;
}

export type CategoryIconName =
  | 'airVent'
  | 'refrigerator'
  | 'tv'
  | 'washingMachine'
  | 'fan'
  | 'cookingPot'
  | 'microwave'
  | 'grid';

/** Per-branch stock availability shown on the product detail screen. */
export interface BranchStock {
  id: string;
  /** Branch name, e.g. "สาขาสุขุมวิท" */
  name: string;
  inStock: boolean;
}

/** A single product record. */
export interface Product {
  id: string;
  name: string;
  categoryId: string;
  /** Current selling price in THB. */
  price: number;
  /** Original price before discount (undefined when not on sale). */
  originalPrice?: number;
  /** Placeholder image urls. Empty array => skeleton grey block. */
  images: string[];
  /** Short marketing description. */
  description: string;
  rating: number;
  reviewCount: number;
  /** Energy-saving percentage badge, e.g. 94 => "ประหยัดไฟ 94%". */
  energySavingPercent?: number;
  /** Whether the product currently has stock (affects opacity + label). */
  inStock: boolean;
  /** True when part of the flash-sale ("ลดกระหน่ำ") section. */
  isFlashSale?: boolean;
  /** Monthly installment amount in THB (undefined when not offered). */
  installmentPerMonth?: number;
  /** Key spec sheet rendered as simple key/value rows. */
  specs: {
    power: string;
    suitableRoom: string;
    warranty: string;
  };
  branchStock: BranchStock[];
}

/** A product plus a quantity, used by the cart. */
export interface CartItem {
  product: Product;
  quantity: number;
  /** Whether the row is checked for checkout. */
  selected: boolean;
}
