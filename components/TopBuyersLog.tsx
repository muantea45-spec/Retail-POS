import React, { useMemo } from 'react';
import { Sale } from '../types';
import { TrophyIcon } from './icons';

interface TopCustomersProps {
  sales: Sale[];
}

type BuyerData = {
  name: string;
  phone: string;
  totalSpent: number;
  totalTransactions: number;
};

const TopCustomers: React.FC<TopCustomersProps> = ({ sales }) => {

  const topBuyers = useMemo((): BuyerData[] => {
    const buyersMap = new Map<string, BuyerData>();

    sales.forEach(sale => {
      const name = sale.customerName?.trim();
      const phone = sale.customerPhone?.trim();

      if (name && phone) {
        const key = `${name.toLowerCase()}|${phone}`;
        const existing = buyersMap.get(key) || { 
            name, 
            phone, 
            totalSpent: 0,
            totalTransactions: 0
        };
        
        existing.totalSpent += sale.finalTotal;
        existing.totalTransactions += 1;
        
        buyersMap.set(key, existing);
      }
    });

    return Array.from(buyersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Top Customers</h2>
      {topBuyers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow">
          <TrophyIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">No customer sales have been recorded yet.</p>
          <p className="mt-1 text-sm text-slate-400">Make sure to add customer details during checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topBuyers.map((buyer, index) => (
            <div 
              key={buyer.phone}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 flex items-center space-x-4"
            >
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-12">
                    <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">#{index + 1}</span>
                    {index < 3 && (
                        <TrophyIcon className={`w-6 h-6 mt-1 ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-slate-400' :
                            'text-yellow-600'
                        }`} />
                    )}
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{buyer.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{buyer.phone}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{buyer.totalTransactions} transactions</p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-xl font-bold text-primary-600">₹{buyer.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">Total Spent</p>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCustomers;