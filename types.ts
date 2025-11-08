export interface Product {
  id: number;
  name: string;
  mrp: number; // Maximum Retail Price
  stock: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // Discount percentage (0-100)
  price: number; // Calculated price after discount
}
