import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Sale } from '../types';
import { WhatsAppIcon, DownloadIcon } from './icons';
import BillDetails from './BillDetails';

// Make jspdf and html2canvas available in the scope
declare const jspdf: any;
declare const html2canvas: any;

interface BillSummaryProps {
  sale: Sale;
  onNewSale: () => void;
}

const BillSummary: React.FC<BillSummaryProps> = ({ sale, onNewSale }) => {
  const billRef = useRef<HTMLDivElement>(null);

  const generateBillText = useCallback(() => {
    let text = '--- FC Store ---\n';
    text += 'Sanpoh Kawn, N. Vanlaiphai\n';
    text += 'Ph: +91 8787747469 / +919383180834\n\n';
    text += `Receipt No: ${sale.receiptNo}\n`;
    text += `Date: ${sale.date.toLocaleString()}\n\n`;
    
    if (sale.customerName || sale.customerAddress || sale.customerPhone) {
        text += '--- Customer Details ---\n';
        if (sale.customerName) text += `Name: ${sale.customerName}\n`;
        if (sale.customerAddress) text += `Address: ${sale.customerAddress}\n`;
        if (sale.customerPhone) text += `Phone: ${sale.customerPhone}\n`;
        text += '\n';
    } else {
        text += '--- Customer Details ---\nName:\nAddress:\nPhone:\n\n';
    }

    text += '--- Items ---\n'
    sale.items.forEach(item => {
      const quantityText = item.quantity > 1 ? ` x${item.quantity}` : '';
      text += `${item.name}${quantityText} - ₹${(item.price * item.quantity).toFixed(2)}`;
      const discounts = [];
      if (item.discount > 0) {
        discounts.push(`${item.discount}% off`);
      }
      if (item.manualDiscount && item.manualDiscount > 0) {
        discounts.push(`₹${item.manualDiscount.toFixed(2)} off`);
      }
      if (discounts.length > 0) {
          text += ` (${discounts.join(', ')} of MRP ₹${item.mrp.toFixed(2)})\n`;
      } else {
          text += '\n';
      }
    });
    text += '\n-------------------\n';
    text += `Subtotal: ₹${sale.subtotal.toFixed(2)}\n`;
    if (sale.subtotal !== sale.itemsTotal) {
      text += `Items Total: ₹${sale.itemsTotal.toFixed(2)}\n`;
    }
    if (sale.billDiscount > 0) {
      text += `Bill Discount: ${sale.billDiscount}%\n`;
    }
    if (sale.billManualDiscount && sale.billManualDiscount > 0) {
        text += `Bill Discount (Flat): -₹${sale.billManualDiscount.toFixed(2)}\n`;
    }
    text += `Grand Total: ₹${sale.finalTotal.toFixed(2)}\n\n`;
    if (sale.status === 'not_paid') {
      text += '--- STATUS: UNPAID ---\n\n';
    }
    text += 'KAN LAWM E';
    return text;
  }, [sale]);

  const [billText, setBillText] = useState(generateBillText);
  
  useEffect(() => {
    setBillText(generateBillText());
  }, [generateBillText, sale]);

  const handleDownloadPdf = () => {
    const input = billRef.current;
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
      pdf.save(`Bill-${sale.receiptNo}.pdf`);
    }).finally(() => {
        // Restore original styles and theme
        input.style.width = originalWidth;
        if (wasDark) {
            root.classList.add('dark');
        }
    });
  };
  
  const encodedBillText = encodeURIComponent(billText);
  const whatsappLink = `https://wa.me/?text=${encodedBillText}`;

  return (
    <div className="max-w-2xl mx-auto bill-summary-container">
        <div ref={billRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8 printable-receipt">
            <BillDetails sale={sale} />
        </div>
      
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 no-print sticky bottom-0">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Share & Export Bill</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                    onClick={handleDownloadPdf}
                    className="w-full inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    <span>PDF</span>
                </button>
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    <WhatsAppIcon className="w-5 h-5 mr-2" />
                    <span>WhatsApp</span>
                </a>
            </div>
            <div>
                <label htmlFor="bill-text-area" className="block text-sm text-slate-500 dark:text-slate-400 mb-2">You can also customize the message for WhatsApp before sharing:</label>
                <textarea
                    id="bill-text-area"
                    value={billText}
                    onChange={e => setBillText(e.target.value)}
                    rows={8}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    aria-label="Editable bill message"
                />
            </div>
        </div>
    </div>
  );
};

export default BillSummary;