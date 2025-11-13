import React, { useMemo, useState } from 'react';
import { Sale, Product } from '../types';
import { TrophyIcon } from './icons';

type ItemSaleData = {
  productId: number;
  name: string;
  quantitySold: number;
  totalRevenue: number;
};

type BuyerData = {
  name: string;
  phone: string;
  totalSpent: number;
  totalTransactions: number;
};

type ItemSortConfig = {
    key: keyof ItemSaleData;
    direction: 'ascending' | 'descending';
};

interface DashboardProps {
    sales: Sale[];
    products: Product[];
}

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
};

const Dashboard: React.FC<DashboardProps> = ({ sales, products }) => {
    const [activeTab, setActiveTab] = useState<'performance' | 'customers'>('performance');
    const [itemSortConfig, setItemSortConfig] = useState<ItemSortConfig>({ key: 'totalRevenue', direction: 'descending' });
    const [selectedPeriod, setSelectedPeriod] = useState('all-time');

    const filterOptions = useMemo(() => {
        const months = new Map<string, string>();
        const weeks = new Map<string, { start: Date, end: Date }>();

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
            if (!months.has(monthKey)) {
                months.set(monthKey, saleDate.toLocaleString('default', { month: 'long', year: 'numeric' }));
            }
            const startOfWeek = getStartOfWeek(saleDate);
            const weekKey = startOfWeek.toISOString().split('T')[0];
            if (!weeks.has(weekKey)) {
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                weeks.set(weekKey, { start: startOfWeek, end: endOfWeek });
            }
        });
        
        const sortedMonths = Array.from(months.entries()).sort((a,b) => b[0].localeCompare(a[0]));
        const sortedWeeks = Array.from(weeks.entries()).sort((a, b) => b[0].localeCompare(a[0]));

        return { months: sortedMonths, weeks: sortedWeeks };
    }, [sales]);

    const filteredSales = useMemo(() => {
        if (selectedPeriod === 'all-time') return sales;
        if (selectedPeriod.startsWith('month-')) {
            const [_, year, month] = selectedPeriod.split('-');
            return sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate.getFullYear() === parseInt(year) && saleDate.getMonth() + 1 === parseInt(month);
            });
        }
        if (selectedPeriod.startsWith('week-')) {
            const weekKey = selectedPeriod.substring(5);
            const week = filterOptions.weeks.find(([key]) => key === weekKey);
            if (!week) return [];
            const startDate = week[1].start;
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            return sales.filter(sale => {
                const saleDate = new Date(sale.date);
                return saleDate >= startDate && saleDate < endDate;
            });
        }
        return sales;
    }, [sales, selectedPeriod, filterOptions.weeks]);

    const itemSalesData = useMemo(() => {
        const itemSalesMap = new Map<number, { quantitySold: number; totalRevenue: number }>();

        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const itemExisting = itemSalesMap.get(item.id) || { quantitySold: 0, totalRevenue: 0 };
                itemExisting.quantitySold += item.quantity;
                itemExisting.totalRevenue += item.price * item.quantity;
                itemSalesMap.set(item.id, itemExisting);
            });
        });

        const itemData: ItemSaleData[] = [];
        products.forEach(product => {
            const saleData = itemSalesMap.get(product.id) || { quantitySold: 0, totalRevenue: 0 };
            itemData.push({
                productId: product.id,
                name: product.name,
                ...saleData
            });
        });
        
        return itemData;
    }, [filteredSales, products]);
    
    const topBuyers = useMemo((): BuyerData[] => {
        const buyersMap = new Map<string, BuyerData>();

        filteredSales.forEach(sale => {
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
    }, [filteredSales]);


    const sortedItems = useMemo(() => {
        return [...itemSalesData].sort((a, b) => {
            if (a[itemSortConfig.key] < b[itemSortConfig.key]) return itemSortConfig.direction === 'ascending' ? -1 : 1;
            if (a[itemSortConfig.key] > b[itemSortConfig.key]) return itemSortConfig.direction === 'ascending' ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [itemSalesData, itemSortConfig]);

    const requestSort = (key: keyof ItemSaleData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (itemSortConfig.key === key && itemSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setItemSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof ItemSaleData) => {
        if (itemSortConfig.key === key) {
            return itemSortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return null;
    };

    const totalRevenue = itemSalesData.reduce((acc, item) => acc + item.totalRevenue, 0);
    const totalItemsSold = itemSalesData.reduce((acc, item) => acc + item.quantitySold, 0);
    const uniqueProductsSoldCount = itemSalesData.filter(item => item.quantitySold > 0).length;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Dashboard</h2>
              <div className="w-full sm:w-auto">
                <select 
                  id="period-filter"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full sm:w-64 p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="all-time">All Time</option>
                  {filterOptions.months.length > 0 && <optgroup label="By Month">
                    {filterOptions.months.map(([key, label]) => <option key={key} value={`month-${key}`}>{label}</option>)}
                  </optgroup>}
                  {filterOptions.weeks.length > 0 && <optgroup label="By Week">
                    {filterOptions.weeks.map(([key, { start }]) => (
                      <option key={key} value={`week-${key}`}>
                        Week of {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </option>
                    ))}
                  </optgroup>}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Total Revenue</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Total Items Sold</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalItemsSold}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Unique Products Sold</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{uniqueProductsSoldCount}</p>
                </div>
            </div>

             <div>
                <div className="mb-4 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`${
                                activeTab === 'performance'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            Product Performance
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`${
                                activeTab === 'customers'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            Top Customers
                        </button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'performance' && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md">
                            <h3 className="p-4 text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Product Performance</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer" onClick={() => requestSort('name')}>Product <span className="text-slate-400">{getSortIndicator('name')}</span></th>
                                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer text-right" onClick={() => requestSort('quantitySold')}>Qty Sold <span className="text-slate-400">{getSortIndicator('quantitySold')}</span></th>
                                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer text-right" onClick={() => requestSort('totalRevenue')}>Revenue <span className="text-slate-400">{getSortIndicator('totalRevenue')}</span></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedItems.filter(i => i.quantitySold > 0 || i.totalRevenue > 0).length > 0 ? sortedItems.map((item) => (
                                            <tr key={item.productId} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">{item.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300 text-right">{item.quantitySold}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300 text-right">₹{item.totalRevenue.toFixed(2)}</td>
                                            </tr>
                                        )) : (
                                        <tr><td colSpan={3} className="text-center p-8 text-slate-500 dark:text-slate-400">No product sales data for this period.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'customers' && (
                        <div>
                            {topBuyers.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow">
                                <TrophyIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
                                <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">No customer sales for this period.</p>
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;