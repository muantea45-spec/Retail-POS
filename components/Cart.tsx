import React from 'react';
import { CartItem } from '../types';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from './icons';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onUpdateDiscount: (productId: number, discount: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  subtotal: number;
}

const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onUpdateDiscount, 
  onRemoveItem, 
  onClearCart, 
  onProceedToCheckout, 
  subtotal,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md sticky top-24 flex flex-col h-full lg:max-h-[calc(100vh-8rem)]">
      <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cart</h2>
        {items.length > 0 && (
          <button 
            onClick={onClearCart} 
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            aria-label="Clear all items from cart"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-10 flex-grow flex flex-col justify-center items-center">
          <ShoppingCartIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty.</p>
        </div>
      ) : (
        <>
          {/* Scrollable Item List */}
          <div className="flex-grow min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex flex-col space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            <span className={item.discount > 0 ? 'line-through' : ''}>₹{item.mrp.toFixed(2)}</span>
                            {item.discount > 0 && <span className="ml-2 font-bold text-primary-600">₹{item.price.toFixed(2)}</span>}
                          </p>
                      </div>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="ml-3 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label htmlFor={`discount-${item.id}`} className="text-xs text-slate-500 dark:text-slate-400 mr-2">Disc %</label>
                      <input
                        id={`discount-${item.id}`}
                        type="number"
                        value={item.discount.toString()}
                        onChange={(e) => onUpdateDiscount(item.id, parseInt(e.target.value, 10))}
                        className="w-16 p-1 text-center border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-md">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md"><MinusIcon className="w-4 h-4" /></button>
                      <span className="px-3 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Fixed Footer with Checkout button */}
          <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t border-slate-200 dark:border-slate-700">
             <div className="space-y-3">
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={onProceedToCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;