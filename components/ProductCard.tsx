import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  availableStock: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, availableStock }) => {
  const isOutOfStock = product.stock <= 0;
  const canAddToCart = availableStock > 0 && !isOutOfStock;

  return (
    <div className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ${isOutOfStock ? 'opacity-50' : 'hover:shadow-xl'}`}>
      {isOutOfStock && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          Out of Stock
        </div>
      )}
      <img src={product.imageUrl} alt={product.name} className="w-full h-32 sm:h-40 object-cover"/>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-slate-900 dark:text-white flex-grow">{product.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {product.stock > 0 ? `${product.stock} in stock` : 'Unavailable'}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-slate-900 dark:text-white">${product.mrp.toFixed(2)}</span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!canAddToCart}
            className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors duration-200 ${
              canAddToCart
                ? 'bg-primary-600 hover:bg-primary-700'
                : 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;