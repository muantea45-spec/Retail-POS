import React, { useState } from 'react';
import { CartItem, Customer } from '../types';
import { TrashIcon, PlusIcon, MinusIcon, ArrowLeftIcon } from './icons';

interface CheckoutProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onUpdateDiscount: (productId: number, discount: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
  onBackToSale: () => void;
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
  uniqueCustomers: Customer[];
}

const Checkout: React.FC<CheckoutProps> = ({
  items,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onCheckout,
  onBackToSale,
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
  uniqueCustomers,
}) => {
  const hasItemDiscounts = items.some(item => item.discount > 0);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);
    if (value) {
      const filtered = uniqueCustomers.filter(c =>
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        c.phone.includes(value)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerAddress(customer.address);
    setCustomerPhone(customer.phone);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={onBackToSale} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 mr-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Checkout</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side: Order Summary & Customer Details */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Order Summary</h3>
          <div className="max-h-80 overflow-y-auto pr-2 space-y-4 border-b dark:border-slate-700 pb-4 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex flex-col space-y-2 border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className={item.discount > 0 ? 'line-through' : ''}>₹{item.mrp.toFixed(2)}</span>
                        {item.discount > 0 && <span className="ml-2 font-bold text-primary-600">₹{item.price.toFixed(2)}</span>}
                        </p>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="ml-3 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors flex-shrink-0">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <label htmlFor={`checkout-discount-${item.id}`} className="text-xs text-slate-500 dark:text-slate-400 mr-2">Disc %</label>
                        <input
                        id={`checkout-discount-${item.id}`}
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
                        disabled={item.quantity >= item.stock}
                        className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div>
              <h3 className="text-xl font-bold mb-4">Customer Details</h3>
              <div className="space-y-3 relative">
                  <input 
                    type="text" 
                    placeholder="Name or Phone" 
                    value={customerName} 
                    onChange={handleNameChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow click
                    className="w-full p-3 text-base border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" 
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto bottom-full mb-1">
                      {suggestions.map((customer, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(customer)}
                          className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <p className="font-semibold">{customer.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{customer.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="text" placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-3 text-base border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" />
                  <input type="text" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-3 text-base border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500" />
              </div>
          </div>
        </div>

        {/* Right side: Final Price & Checkout */}
        <div className="md:sticky md:top-24 h-fit">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Final Bill</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 text-lg">
                <span>Subtotal (MRP)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {(hasItemDiscounts || billDiscount > 0) && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 text-lg">
                      <span>Item Discounts</span>
                      <span className="text-green-600">- ₹{(subtotal - itemsTotal).toFixed(2)}</span>
                  </div>
              )}
              <div className="flex justify-between items-center text-lg">
                <label htmlFor="bill-discount" className="text-slate-600 dark:text-slate-300">Bill Discount (%)</label>
                <input
                  id="bill-discount"
                  type="number"
                  value={billDiscount.toString()}
                  onChange={(e) => onUpdateBillDiscount(parseInt(e.target.value, 10))}
                  className="w-24 p-2 text-right border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex justify-between text-3xl font-bold text-slate-900 dark:text-white pt-4 border-t dark:border-slate-700">
                <span>Grand Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full bg-primary-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-xl"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
