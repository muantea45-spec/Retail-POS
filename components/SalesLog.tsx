import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import BillDetails from './BillDetails';
import { ListBulletIcon } from './icons';

interface SalesLogProps {
  sales: Sale[];
}

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', options).format(date);

interface DayData {
  total: number;
  count: number;
  sales: Sale[];
}
interface MonthData {
  total: number;
  count: number;
  days: Record<string, DayData>;
}
type GroupedSales = Record<string, MonthData>;


const SalesLog: React.FC<SalesLogProps> = ({ sales }) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const groupedSales = useMemo((): GroupedSales => {
    // FIX: Replaced reduce with a for...of loop to avoid complex type inference issues with the nested data structure.
    const acc: GroupedSales = {};
    for (const sale of sales) {
        const monthKey = formatDate(sale.date, { year: 'numeric', month: 'long' }); // "July 2024"
        const dayKey = sale.date.toISOString().split('T')[0]; // "2024-07-31"

        if (!acc[monthKey]) {
            acc[monthKey] = { total: 0, count: 0, days: {} };
        }
        if (!acc[monthKey].days[dayKey]) {
            acc[monthKey].days[dayKey] = { total: 0, count: 0, sales: [] };
        }
        
        acc[monthKey].days[dayKey].sales.push(sale);
        acc[monthKey].days[dayKey].total += sale.finalTotal;
        acc[monthKey].days[dayKey].count += 1;

        acc[monthKey].total += sale.finalTotal;
        acc[monthKey].count += 1;
    }
    return acc;
  }, [sales]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonth(prev => (prev === monthKey ? null : monthKey));
    setExpandedDay(null); // Collapse day when month is toggled
  };
  
  const toggleDay = (dayKey: string) => {
    setExpandedDay(prev => (prev === dayKey ? null : dayKey));
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Sales Log</h2>
      {sales.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow">
          <ListBulletIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">No sales have been recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* FIX: Replaced Object.entries with Object.keys to fix type inference. */}
          {Object.keys(groupedSales).map((monthKey) => {
            const monthData = groupedSales[monthKey];
            return (
            <div key={monthKey} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                <button
                    onClick={() => toggleMonth(monthKey)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    aria-expanded={expandedMonth === monthKey}
                >
                    <div>
                        <p className="font-bold text-xl text-slate-800 dark:text-slate-200">{monthKey}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           {monthData.count} sale(s) this month
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="font-bold text-lg text-primary-600">
                            ₹{monthData.total.toFixed(2)}
                        </span>
                        <svg className={`w-5 h-5 text-slate-500 transform transition-transform ${expandedMonth === monthKey ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
                {expandedMonth === monthKey && (
                    <div className="px-4 pb-4 space-y-2">
                        {/* FIX: Replaced Object.entries with Object.keys to fix type inference. */}
                        {Object.keys(monthData.days).sort((dayA, dayB) => dayB.localeCompare(dayA)).map((dayKey) => {
                           const dayData = monthData.days[dayKey];
                           return (
                           <div key={dayKey} className="bg-slate-50 dark:bg-slate-900/50 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => toggleDay(dayKey)}
                                    className="w-full text-left p-3 flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors"
                                    aria-expanded={expandedDay === dayKey}
                                >
                                    <div>
                                        <p className="font-semibold text-primary-600">
                                            {formatDate(new Date(dayKey), { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {dayData.count} sale(s)
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-semibold text-md text-slate-700 dark:text-slate-300">
                                            ₹{dayData.total.toFixed(2)}
                                        </span>
                                        <svg className={`w-4 h-4 text-slate-400 transform transition-transform ${expandedDay === dayKey ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                {expandedDay === dayKey && (
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                      <div className="space-y-4">
                                        {dayData.sales.map(sale => (
                                          <div key={sale.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                             <div className="flex justify-between items-center mb-4">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                  {sale.date.toLocaleTimeString()} &mdash; {sale.items.length} item(s)
                                                </p>
                                                 <p className="font-bold text-slate-800 dark:text-slate-200">
                                                  ₹{sale.finalTotal.toFixed(2)}
                                                </p>
                                             </div>
                                            <BillDetails sale={sale} />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                )}
                           </div>
                        )})}
                    </div>
                )}
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default SalesLog;
