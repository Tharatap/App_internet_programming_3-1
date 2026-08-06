/**
 * Domain types for the parts of the shop backed by the Express API (server/)
 * beyond the product catalogue — addresses, orders, notifications, coupons.
 */

export interface Address {
  id: number;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  district: string;
  province: string;
  postcode: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id'>;

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  orderNumber: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode: string | null;
  total: number;
  status: OrderStatus;
  shipRecipient: string;
  shipPhone: string;
  shipAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  title: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  minSpend: number;
  expiresAt: string | null;
}
