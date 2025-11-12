export interface Product {
  id: number;
  name: string;
  mrp: number; // Maximum Retail Price
  category: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // in percentage
  price: number; // final price after discount
}

export interface Sale {
  id: number; // Using timestamp for simplicity
  date: Date;
  items: CartItem[];
  subtotal: number;
  itemsTotal: number;
  billDiscount: number;
  finalTotal: number;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
}