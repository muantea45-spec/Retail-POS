import React from 'react';
import { Sale } from '../types';
import { XMarkIcon, CheckBadgeIcon } from './icons';

interface DebtData {
  name: string;
  totalDebt: number;
  unpaidSales: Sale[];
}

interface ClearDebtModalProps {
  debtData: DebtData;
  onClose: () => void;
  onConfirm: () => void;
}

const ClearDebtModal: React.FC<ClearDebtModalProps> = ({ debtData, onClose, onConfirm }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 no-print"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clear-debt-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Close modal"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-6">
            <div className="flex items-center space-x-3">
                <CheckBadgeIcon className="w-10 h-10 text-green-500" />
                <div>
                    <h2 id="clear-debt-title" className="text-2xl font-bold text-slate-900 dark:text-white">Confirm Debt Settlement</h2>
                    <p className="text-slate-500 dark:text-slate-400">Please confirm you want to clear this debt.</p>
                </div>
            </div>
          
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Customer:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{debtData.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Total Amount:</span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">₹{debtData.totalDebt.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Receipts to be marked as paid:</h3>
                <ul className="text-xs text-slate-500 dark:text-slate-400 max-h-32 overflow-y-auto space-y-1 pr-2">
                    {debtData.unpaidSales.map(sale => (
                        <li key={sale.id} className="flex justify-between">
                            <span>Receipt <span className="font-mono">{sale.receiptNo}</span></span>
                            <span>₹{sale.finalTotal.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex justify-end space-x-4 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <CheckBadgeIcon className="w-5 h-5 mr-2" />
            Confirm Settlement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDebtModal;