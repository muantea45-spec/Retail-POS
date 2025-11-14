import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import BillDetails from './BillDetails';
import { ListBulletIcon, DownloadIcon } from './icons';
import BaBuLog from './BaBuLog';

// Make jspdf and html2canvas available in the scope
declare const jspdf: any;
declare const html2canvas: any;

interface SalesLogProps {
  sales: Sale[];
  onClearCustomerDebt: (customer: { name: string; address: string; }) => void;
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


const SalesLog: React.FC<SalesLogProps> = ({ sales, onClearCustomerDebt }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid'>('all');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  const overallTotalDebt = useMemo(() => {
    return sales
      .filter(sale => sale.status === 'not_paid')
      .reduce((acc, sale) => acc + sale.finalTotal, 0);
  }, [sales]);

  const handleDownloadPdf = (saleId: number, receiptNo: string) => {
    const input = document.getElementById(`bill-container-${saleId}`);
    if (!input) return;

    const root = window.document.documentElement;
    const wasDark = root.classList.contains('dark');
    
    // Force light mode for capture
    if (wasDark) {
      root.classList.remove('dark');
    }

    const { jsPDF } = jspdf;

    // Temporarily apply a fixed width for consistent rendering to help html2canvas.
    const originalWidth = input.style.width;
    input.style.width = '302px'; // Approx 80mm at 96dpi, a common receipt width.
    
    html2canvas(input, { 
        scale: 3, // Increased scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff', // Explicitly set background to white
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Use a standard receipt paper width (80mm) for better proportions
      const pdfWidth = 80;
      const canvasAspectRatio = canvas.height / canvas.width;
      const pdfHeight = pdfWidth * canvasAspectRatio;

      // Create a PDF with a custom page size to fit the entire bill on one page
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${receiptNo}.pdf`);
    }).finally(() => {
        // Restore original styles and theme
        input.style.width = originalWidth;
        if (wasDark) {
            root.classList.add('dark');
        }
    });
  };

  const groupedSales = useMemo((): GroupedSales => {
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Logs</h2>
        {activeTab === 'unpaid' && overallTotalDebt > 0 && (
            <div className="text-left sm:text-right">
                <p className="text-slate-500 dark:text-slate-400">Overall Total Debt</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">₹{overallTotalDebt.toFixed(2)}</p>
            </div>
        )}
      </div>

      <div className="mb-4 border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            All Sales
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`${
              activeTab === 'unpaid'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
          >
            Debts (BA BU)
          </button>
        </nav>
      </div>

      {activeTab === 'all' && (
        <>
            {sales.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow">
                <ListBulletIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
                <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">No sales have been recorded yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
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
                                                  <div key={sale.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                                      <div id={`bill-container-${sale.id}`} className="bg-white dark:bg-slate-800 printable-receipt p-6">
                                                          <BillDetails sale={sale} />
                                                      </div>
                                                      <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 p-3 flex justify-between items-center gap-4">
                                                          <div>
                                                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                                  {sale.date.toLocaleTimeString()} &mdash; {sale.items.length} item(s)
                                                              </p>
                                                              {sale.status === 'not_paid' && (
                                                                  <span className="mt-1 inline-block text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-2 py-1 rounded-full">UNPAID</span>
                                                              )}
                                                          </div>
                                                          <div className="flex items-center gap-4">
                                                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                                                  ₹{sale.finalTotal.toFixed(2)}
                                                              </p>
                                                              <button
                                                                  onClick={() => handleDownloadPdf(sale.id, sale.receiptNo)}
                                                                  className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md transition-colors text-sm flex-shrink-0"
                                                                  title="Download as PDF"
                                                              >
                                                                  <DownloadIcon className="w-4 h-4 mr-2" />
                                                                  <span>PDF</span>
                                                              </button>
                                                          </div>
                                                      </div>
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
        </>
      )}
      
      {activeTab === 'unpaid' && <BaBuLog sales={sales} onClearDebt={onClearCustomerDebt} />}
    </div>
  );
};

export default SalesLog;