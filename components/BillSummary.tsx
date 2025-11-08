import React from 'react';
import { CartItem } from '../types';
import { WhatsAppIcon, MessageIcon } from './icons';

interface BillSummaryProps {
  items: CartItem[];
  subtotal: number;
  total: number;
  onNewSale: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({ items, subtotal, total, onNewSale }) => {
  const generateBillText = () => {
    let text = '--- Your Bill ---\n\n';
    items.forEach(item => {
      text += `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`;
      if (item.discount > 0) {
        text += ` (${item.discount}% off MRP $${item.mrp.toFixed(2)})\n`;
      } else {
        text += '\n';
      }
    });
    text += '\n-------------------\n';
    text += `Subtotal: $${subtotal.toFixed(2)}\n`;
    text += `Total: $${total.toFixed(2)}\n\n`;
    text += 'Thank you for your purchase!';
    return text;
  };

  const billText = generateBillText();
  const encodedBillText = encodeURIComponent(billText);

  const whatsappLink = `https://wa.me/?text=${encodedBillText}`;
  const smsLink = `sms:?&body=${encodedBillText}`;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8">
      <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-primary-600">Bill Finalized</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Thank you for your order!</p>
      </div>

      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-start text-slate-700 dark:text-slate-300">
            <div>
              <span>{item.name} <span className="text-sm text-slate-500 dark:text-slate-400">x{item.quantity}</span></span>
              {item.discount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400">{item.discount}% discount applied</p>
              )}
            </div>
            <div className="text-right">
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                {item.discount > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-through">${(item.mrp * item.quantity).toFixed(2)}</p>
                )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-2xl font-bold text-slate-900 dark:text-white mt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Share Bill</h3>
        <div className="flex justify-center space-x-4">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-40"
          >
            <WhatsAppIcon className="w-5 h-5 mr-2" />
            WhatsApp
          </a>
          <a
            href={smsLink}
            className="inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-40"
          >
            <MessageIcon className="w-5 h-5 mr-2" />
            Text
          </a>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;