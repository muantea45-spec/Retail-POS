import React from 'react';
import { CartItem } from '../types';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from './icons';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onUpdateDiscount: (productId: number, discount: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  subtotal: number;
  itemsTotal: number;
  finalTotal: number;
  billDiscount: number;
  onUpdateBillDiscount: (discount: number) => void;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  setCustomerName: (name: string) => void;
  setCustomerAddress: (address: string) => void;
  setCustomerPhone: (phone: string) => void;
}

const Cart: React.FC<CartProps> = ({ 
  items, 
  onUpdateQuantity, 
  onUpdateDiscount, 
  onRemoveItem, 
  onClearCart, 
  onCheckout, 
  subtotal, 
  itemsTotal,
  finalTotal,
  billDiscount,
  onUpdateBillDiscount,
  customerName,
  customerAddress,
  customerPhone,
  setCustomerName,
  setCustomerAddress,
  setCustomerPhone,
}) => {
  const hasItemDiscounts = items.some(item => item.discount > 0);
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 sticky top-24">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
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
        <div className="text-center py-10">
          <ShoppingCartIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-2">
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
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-md">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md"><MinusIcon className="w-4 h-4" /></button>
                      <span className="px-3 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} 
                        disabled={item.quantity >= item.stock}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Stock: {item.stock}</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Customer Details</h3>
                <div className="space-y-2">
                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                    <input type="text" placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                    <input type="text" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal (MRP)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
             {(hasItemDiscounts || billDiscount > 0) && (
                 <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Items Total</span>
                    <span>₹{itemsTotal.toFixed(2)}</span>
                </div>
             )}
            <div className="flex justify-between items-center">
              <label htmlFor="bill-discount" className="text-slate-600 dark:text-slate-300">Bill Discount (%)</label>
              <input
                id="bill-discount"
                type="number"
                value={billDiscount.toString()}
                onChange={(e) => onUpdateBillDiscount(parseInt(e.target.value, 10))}
                className="w-20 p-1 text-right border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-sm focus:ring-primary-500 focus:border-primary-500"
                min="0"
                max="100"
              />
            </div>
            <div className="flex justify-between text-2xl font-bold text-slate-900 dark:text-white pt-2">
              <span>Grand Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Finalize Bill
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;