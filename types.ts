// FIX: Removed a self-import of `CartItem` which was causing a name collision with the local declaration.
// FIX: Removed a self-import of `Product` from this file as it was causing a name collision and breaking type inference.

export interface Product {
  id: number;
  name: string;
  mrp: number; // Maximum Retail Price
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // in percentage
  manualDiscount?: number; // flat amount
  price: number; // final price after discount
}

export interface Sale {
  id: number; // Using timestamp for simplicity
  receiptNo: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  itemsTotal: number;
  billDiscount: number;
  billManualDiscount?: number;
  finalTotal: number;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  status: 'paid' | 'not_paid';
}

export interface Customer {
  name: string;
  address: string;
  phone: string;
}