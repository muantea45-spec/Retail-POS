export interface Product {
  id: number;
  name: string;
  mrp: number; // Maximum Retail Price
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // in percentage
  price: number; // final price after discount
}
