import React from 'react';
import { Sale } from '../types';

interface BillDetailsProps {
    sale: Sale;
}

const BillDetails: React.FC<BillDetailsProps> = ({ sale }) => {
    return (
        <>
            <div className="text-center pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-600">FC Store</h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Sanpoh Kawn, N. Vanlaiphai</p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Ph: +91 8787747469 / +919383180834</p>
                <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 mt-2">
                    <span className="font-mono">Receipt: {sale.receiptNo}</span>
                    <span>{sale.date.toLocaleString()}</span>
                </div>
            </div>

            <div className="mb-6 text-sm">
                {sale.customerName || sale.customerAddress || sale.customerPhone ? (
                     <div className="space-y-1">
                        {sale.customerName && (
                            <div className="flex">
                                <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Customer Name:</span>
                                <span className="text-slate-800 dark:text-slate-200">{sale.customerName}</span>
                            </div>
                        )}
                        {sale.customerAddress && (
                            <div className="flex">
                                <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Address:</span>
                                <span className="text-slate-800 dark:text-slate-200">{sale.customerAddress}</span>
                            </div>
                        )}
                         {sale.customerPhone && (
                            <div className="flex">
                                <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Phone Number:</span>
                                <span className="text-slate-800 dark:text-slate-200">{sale.customerPhone}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex items-end mb-2">
                            <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Customer Name:</span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-5"></div>
                        </div>
                        <div className="flex items-end mb-2">
                            <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Address:</span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-5"></div>
                        </div>
                         <div className="flex items-end">
                            <span className="font-semibold w-28 text-slate-600 dark:text-slate-400">Phone Number:</span>
                            <div className="flex-1 border-b border-dotted border-slate-400 h-5"></div>
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {sale.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-slate-700 dark:text-slate-300 border-b border-dashed border-slate-200 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                        <div>
                            <span>{item.name} <span className="text-sm text-slate-500 dark:text-slate-400">x{item.quantity}</span></span>
                            {item.discount > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400">{item.discount}% discount applied</p>
                            )}
                            {item.manualDiscount && item.manualDiscount > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400">₹{item.manualDiscount.toFixed(2)} discount applied</p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                            {item.discount > 0 && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-through">₹{(item.mrp * item.quantity).toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{sale.subtotal.toFixed(2)}</span>
                </div>
                {(sale.subtotal !== sale.itemsTotal) && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Items Total</span>
                        <span className="font-medium">₹{sale.itemsTotal.toFixed(2)}</span>
                    </div>
                )}
                {sale.billDiscount > 0 && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Bill Discount (%)</span>
                        <span className="font-medium">-{sale.billDiscount}%</span>
                    </div>
                )}
                {sale.billManualDiscount && sale.billManualDiscount > 0 && (
                     <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Bill Discount (Flat)</span>
                        <span className="font-medium">- ₹{sale.billManualDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    <span>Grand Total</span>
                    <span>₹{sale.finalTotal.toFixed(2)}</span>
                </div>
            </div>
        </>
    );
};

export default BillDetails;