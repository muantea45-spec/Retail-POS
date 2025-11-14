import React, { useMemo, useState } from 'react';
import { Sale } from '../types';
import { UsersIcon, CheckBadgeIcon } from './icons';
import ClearDebtModal from './ClearDebtModal';

interface BaBuLogProps {
  sales: Sale[];
  onClearDebt: (customer: { name: string; address: string; }) => void;
}

type DebtData = {
  name: string;
  phone: string;
  address: string;
  totalDebt: number;
  unpaidSales: Sale[];
};

const BaBuLog: React.FC<BaBuLogProps> = ({ sales, onClearDebt }) => {
  const [clearingDebtFor, setClearingDebtFor] = useState<DebtData | null>(null);

  const customerDebts = useMemo((): DebtData[] => {
    const debtMap = new Map<string, DebtData>();

    const unpaidSales = sales.filter(sale => sale.status === 'not_paid');

    for (const sale of unpaidSales) {
      const name = sale.customerName?.trim();
      const address = sale.customerAddress?.trim();

      if (name && address) {
        const key = `${name.toLowerCase()}|${address.toLowerCase()}`;
        const existing = debtMap.get(key) || { 
            name, 
            phone: sale.customerPhone?.trim() || '', 
            address: address,
            totalDebt: 0,
            unpaidSales: [],
        };
        
        existing.totalDebt += sale.finalTotal;
        existing.unpaidSales.push(sale);
        
        debtMap.set(key, existing);
      }
    }

    return Array.from(debtMap.values()).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [sales]);

  const handleConfirmClearDebt = () => {
    if (clearingDebtFor) {
      onClearDebt({ name: clearingDebtFor.name, address: clearingDebtFor.address });
      setClearingDebtFor(null);
    }
  };

  return (
    <>
      {customerDebts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow">
          <UsersIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">No outstanding debts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {customerDebts.map((customer) => (
            <div 
              key={`${customer.name}-${customer.address}`}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{customer.name}</p>
                  {customer.phone && <p className="text-sm text-slate-500 dark:text-slate-400">{customer.phone}</p>}
                  <p className="text-sm text-slate-500 dark:text-slate-400">{customer.address}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex-grow sm:flex-grow-0 text-left sm:text-right">
                        <p className="text-xs text-red-500">Total Debt</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-500">₹{customer.totalDebt.toFixed(2)}</p>
                    </div>
                    <button
                        onClick={() => setClearingDebtFor(customer)}
                        className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex-shrink-0"
                    >
                        <CheckBadgeIcon className="w-5 h-5 mr-2" />
                        Settle Debt
                    </button>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-2">
                <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Unpaid Bills:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  {customer.unpaidSales.map(sale => (
                    <li key={sale.id} className="flex justify-between">
                      <span>
                        Receipt <span className="font-mono">{sale.receiptNo}</span> on {sale.date.toLocaleDateString()}
                      </span>
                      <span className="font-semibold">₹{sale.finalTotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      {clearingDebtFor && (
        <ClearDebtModal
          debtData={clearingDebtFor}
          onClose={() => setClearingDebtFor(null)}
          onConfirm={handleConfirmClearDebt}
        />
      )}
    </>
  );
};

export default BaBuLog;