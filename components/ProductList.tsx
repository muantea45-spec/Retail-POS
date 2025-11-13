import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  cartItems: { id: number }[];
  onAddToCart: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, cartItems, onAddToCart, onEditProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm]);
  
  const cartItemIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

  return (
    <div>
        <div className="mb-4 sticky top-20 z-10 bg-slate-50 dark:bg-slate-900 py-2 space-y-3">
            <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
        </div>
      
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map(product => (
                  <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={onAddToCart}
                      onEditProduct={onEditProduct}
                      isInCart={cartItemIds.has(product.id)}
                  />
              ))}
          </div>
        ) : (
            <div className="text-center py-10">
                <p className="text-slate-500 dark:text-slate-400">No products found.</p>
            </div>
        )}
    </div>
  );
};

export default ProductList;