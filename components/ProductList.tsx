import React, { useState } from 'react';
import { Product, CartItem } from '../types';
import ProductCard from './ProductCard';
import AddProductForm from './AddProductForm';
import { PlusIcon } from './icons';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartItems: CartItem[];
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, cartItems, onAddProduct }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleFormSubmit = (productData: Omit<Product, 'id'>) => {
    onAddProduct(productData);
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {showAddForm && (
        <AddProductForm
          onAddProduct={handleFormSubmit}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map(product => {
          const cartItem = cartItems.find(item => item.id === product.id);
          const availableStock = product.stock - (cartItem?.quantity || 0);
          return (
             <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart}
              availableStock={availableStock}
            />
          )
        })}
      </div>
    </div>
  );
};

export default ProductList;
