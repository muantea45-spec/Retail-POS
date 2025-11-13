import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Sale } from '../types';
import { WhatsAppIcon, MessageIcon, DownloadIcon, LinkIcon, PrintIcon } from './icons';
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
      text += `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`;
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
    text += 'KAN LAWM E';
    return text;
  }, [sale]);

  const [billText, setBillText] = useState(generateBillText);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    setBillText(generateBillText());
  }, [generateBillText, sale]);


  const handleDownloadPdf = () => {
    const input = billRef.current;
    if (!input) return;

    const { jsPDF } = jspdf;
    
    html2canvas(input, { 
        scale: 2, // Higher scale for better quality
        useCORS: true,
        // These options help capture the full height of the element, even if it's scrollable
        windowHeight: input.scrollHeight,
        scrollY: -window.scrollY
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to maintain aspect ratio for a standard A4 width
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create a PDF with a custom page size to fit the entire bill on one page
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bill-${sale.receiptNo}.pdf`);
    });
  };
  
  const handleCopyLink = () => {
    try {
        const jsonSale = JSON.stringify(sale);
        const encodedSale = btoa(jsonSale); // Base64 encode
        const url = `${window.location.origin}${window.location.pathname}#bill=${encodedSale}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
    } catch (e) {
        console.error("Failed to copy link:", e);
        alert("Could not copy link to clipboard.");
    }
  };

  const handlePrint = () => {
    window.print();
  }

  const encodedBillText = encodeURIComponent(billText);
  const whatsappLink = `https://wa.me/?text=${encodedBillText}`;
  const smsLink = `sms:?&body=${encodedBillText}`;

  return (
    <div className="max-w-2xl mx-auto bill-summary-container">
        <div ref={billRef} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 sm:p-8 printable-receipt">
            <BillDetails sale={sale} />
        </div>
      
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 no-print sticky bottom-0">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Customize & Share Bill</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Edit the message below before sharing, or create a shareable link.</p>
            <textarea
                value={billText}
                onChange={e => setBillText(e.target.value)}
                rows={10}
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                aria-label="Editable bill message"
            />
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <WhatsAppIcon className="w-5 h-5 mr-2" />
                <span>WhatsApp</span>
            </a>
            <a
                href={smsLink}
                className="inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <MessageIcon className="w-5 h-5 mr-2" />
                <span>Text</span>
            </a>
            <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <DownloadIcon className="w-5 h-5 mr-2" />
                <span>PDF</span>
            </button>
            <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <LinkIcon className="w-5 h-5 mr-2" />
                <span>{linkCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <PrintIcon className="w-5 h-5 mr-2" />
                <span>Print</span>
            </button>
            </div>
        </div>
    </div>
  );
};

export default BillSummary;