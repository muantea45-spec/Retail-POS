import React, { useMemo, useState } from 'react';
import { Sale, Product } from '../types';

type ItemSaleData = {
  productId: number;
  name: string;
  quantitySold: number;
  totalRevenue: number;
  currentStock: number;
};

type SortConfig = {
    key: keyof ItemSaleData;
    direction: 'ascending' | 'descending';
};

interface DashboardProps {
    sales: Sale[];
    products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, products }) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalRevenue', direction: 'descending' });

    const itemSalesData = useMemo((): ItemSaleData[] => {
        const salesMap = new Map<number, { quantitySold: number; totalRevenue: number }>();

        sales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = salesMap.get(item.id) || { quantitySold: 0, totalRevenue: 0 };
                existing.quantitySold += item.quantity;
                existing.totalRevenue += item.price * item.quantity;
                salesMap.set(item.id, existing);
            });
        });

        const productsMap = new Map<number, Product>(products.map(p => [p.id, p]));
        const allProductIds = new Set([...salesMap.keys(), ...productsMap.keys()]);
        
        const data: ItemSaleData[] = [];
        allProductIds.forEach(id => {
            const product = productsMap.get(id);
            if (product) {
                 const saleData = salesMap.get(id) || { quantitySold: 0, totalRevenue: 0 };
                 data.push({
                     productId: id,
                     name: product.name,
                     quantitySold: saleData.quantitySold,
                     totalRevenue: saleData.totalRevenue,
                     currentStock: product.stock,
                 });
            }
        });

        return data;
    }, [sales, products]);

    const sortedItems = useMemo(() => {
        let sortableItems = [...itemSalesData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                // Secondary sort by name for consistent ordering
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }
        return sortableItems;
    }, [itemSalesData, sortConfig]);

    const requestSort = (key: keyof ItemSaleData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof ItemSaleData) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const totalRevenue = itemSalesData.reduce((acc, item) => acc + item.totalRevenue, 0);
    const totalItemsSold = itemSalesData.reduce((acc, item) => acc + item.quantitySold, 0);
    const uniqueProductsSoldCount = itemSalesData.filter(item => item.quantitySold > 0).length;

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Sales Dashboard</h2>
            
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

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer" onClick={() => requestSort('name')}>
                                Product Name <span className="text-slate-400">{getSortIndicator('name')}</span>
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer text-right" onClick={() => requestSort('quantitySold')}>
                                Qty Sold <span className="text-slate-400">{getSortIndicator('quantitySold')}</span>
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer text-right" onClick={() => requestSort('totalRevenue')}>
                                Total Revenue <span className="text-slate-400">{getSortIndicator('totalRevenue')}</span>
                            </th>
                            <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 uppercase cursor-pointer text-right" onClick={() => requestSort('currentStock')}>
                                Stock Left <span className="text-slate-400">{getSortIndicator('currentStock')}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-slate-500 dark:text-slate-400">
                                    No product data to display. Add some products and make a sale!
                                </td>
                            </tr>
                        ) : (
                            sortedItems.map((item) => (
                                <tr key={item.productId} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">{item.name}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 text-right">{item.quantitySold}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 text-right">₹{item.totalRevenue.toFixed(2)}</td>
                                    <td className={`p-4 text-right font-medium ${item.currentStock <= 0 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {item.currentStock}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
