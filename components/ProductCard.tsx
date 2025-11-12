import React from 'react';
import { Product } from '../types';
import { PencilIcon } from './icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  isInCart: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onEditProduct, isInCart }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex flex-col justify-between transition-shadow hover:shadow-lg">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{product.name}</h3>
            <button 
                onClick={() => onEditProduct(product)}
                className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 -mt-1 -mr-1"
                aria-label={`Edit ${product.name}`}
            >
                <PencilIcon className="w-5 h-5" />
            </button>
        </div>
        <div className="flex justify-between items-baseline mb-4 mt-2">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">₹{product.mrp.toFixed(2)}</p>
        </div>
      </div>
      <button
        onClick={() => onAddToCart(product)}
        disabled={isInCart}
        className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-md hover:bg-primary-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isInCart ? 'Added to Cart' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;