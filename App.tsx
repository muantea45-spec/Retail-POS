import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, CartItem, Sale, Customer } from './types';
import { INITIAL_PRODUCTS } from './constants';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import BillSummary from './components/BillSummary';
import EditProductModal from './components/EditProductModal';
import AddProductForm from './components/AddProductForm';
import SalesLog from './components/SalesLog';
import Dashboard from './components/Dashboard';
import TopCustomers from './components/TopBuyersLog';
import Checkout from './components/Checkout';
import { PlusIcon, SunIcon, MoonIcon, ListBulletIcon, ShoppingCartIcon, ChartBarIcon, TrophyIcon } from './components/icons';

type View = 'sale' | 'checkout' | 'bill' | 'log' | 'dashboard' | 'top-customers';

function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [billManualDiscount, setBillManualDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [view, setView] = useState<View>('sale');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [salesLog, setSalesLog] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark' ? 'dark' : 'light';
    }
    if (typeof window !== 'undefined') {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // On initial load, check if the URL contains a shared bill.
  useEffect(() => {
    const handleUrlBill = () => {
        const hash = window.location.hash;
        if (hash.startsWith('#bill=')) {
            try {
                const encodedData = hash.substring(6); // remove '#bill='
                const jsonData = atob(encodedData);
                const sharedSale: Sale = JSON.parse(jsonData);

                // Re-hydrate the date object from the JSON string
                if (sharedSale.date) {
                    sharedSale.date = new Date(sharedSale.date);
                }

                // Basic validation of the parsed object
                if (sharedSale.id && sharedSale.items && typeof sharedSale.finalTotal === 'number') {
                    setCurrentSale(sharedSale);
                    setView('bill');
                    // Clean the URL hash to avoid re-triggering on refresh
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                } else {
                    console.error("Parsed sale data from URL is invalid.");
                }

            } catch (error) {
                console.error("Failed to parse shared bill data from URL:", error);
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }
    handleUrlBill();
  }, []); // Empty dependency array ensures this runs only once on mount.


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) return prevItems;
      return [...prevItems, { ...product, quantity: 1, discount: 0, manualDiscount: 0, price: product.mrp }];
    });
  }, []);

  const handleRemoveItem = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [handleRemoveItem]);

  const handleUpdateDiscount = useCallback((productId: number, discount: number) => {
    const newDiscount = Math.max(0, Math.min(100, isNaN(discount) ? 0 : discount));
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === productId) {
          const newPrice = (item.mrp * (1 - newDiscount / 100)) - (item.manualDiscount || 0);
          return { ...item, discount: newDiscount, price: Math.max(0, newPrice) };
        }
        return item;
      })
    );
  }, []);

  const handleUpdateManualDiscount = useCallback((productId: number, manualDiscount: number) => {
    const newManualDiscount = Math.max(0, isNaN(manualDiscount) ? 0 : manualDiscount);
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          const newPrice = (item.mrp * (1 - (item.discount || 0) / 100)) - newManualDiscount;
          return { ...item, manualDiscount: newManualDiscount, price: Math.max(0, newPrice) };
        }
        return item;
      })
    );
  }, []);
  
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setBillDiscount(0);
    setBillManualDiscount(0);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
  }, []);

  const { subtotal, itemsTotal, finalTotal } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalAfterPercentage = itemsTotal * (1 - billDiscount / 100);
    const finalTotal = Math.max(0, totalAfterPercentage - billManualDiscount);
    return { subtotal, itemsTotal, finalTotal };
  }, [cartItems, billDiscount, billManualDiscount]);

  const handleProceedToCheckout = () => {
    if (cartItems.length > 0) {
      setView('checkout');
    }
  };

  const handleCheckout = useCallback(() => {
    if (cartItems.length > 0) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      // Filter sales for the current month and year to get the correct sequence number
      const salesInCurrentMonth = salesLog.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getFullYear() === year && (saleDate.getMonth() + 1) === month;
      });
      const nextReceiptNumber = salesInCurrentMonth.length + 1;

      const receiptNo = `FC/${year}/${String(month).padStart(2, '0')}/${String(nextReceiptNumber).padStart(4, '0')}`;
      
      const newSale: Sale = {
        id: Date.now(),
        receiptNo,
        date: new Date(),
        items: cartItems,
        subtotal,
        itemsTotal,
        finalTotal,
        billDiscount,
        billManualDiscount,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        customerPhone: customerPhone.trim(),
      };
      setSalesLog(prev => [newSale, ...prev]);
      setCurrentSale(newSale);
      setView('bill');
    }
  }, [cartItems, subtotal, itemsTotal, finalTotal, billDiscount, billManualDiscount, customerName, customerAddress, customerPhone, salesLog]);

  const handleNewSale = useCallback(() => {
    handleClearCart();
    setCurrentSale(null);
    setView('sale');
  }, [handleClearCart]);

  const handleAddProduct = useCallback((newProductData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
        const newProduct: Product = {
            ...newProductData,
            id: Math.max(...prevProducts.map(p => p.id), 0) + 1,
        };
        return [...prevProducts, newProduct];
    });
    setIsAddProductOpen(false);
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setCartItems(prevItems => {
        const newCartItems: CartItem[] = [];
        for (const item of prevItems) {
            if (item.id === updatedProduct.id) {
                const newPrice = updatedProduct.mrp * (1 - item.discount / 100) - (item.manualDiscount || 0);
                if (item.quantity >= 1) {
                    const newCartItem: CartItem = {
                      ...updatedProduct,
                      quantity: item.quantity,
                      discount: item.discount,
                      manualDiscount: item.manualDiscount || 0,
                      price: newPrice,
                    };
                    newCartItems.push(newCartItem);
                }
            } else {
                newCartItems.push(item);
            }
        }
        return newCartItems;
    });
  }, []);
  
  const handleUpdateBillDiscount = useCallback((discount: number) => {
    setBillDiscount(Math.max(0, Math.min(100, isNaN(discount) ? 0 : discount)));
  }, []);

  const handleUpdateBillManualDiscount = useCallback((discount: number) => {
    setBillManualDiscount(Math.max(0, isNaN(discount) ? 0 : discount));
  }, []);


  const uniqueCustomers = useMemo((): Customer[] => {
    const customers = new Map<string, Customer>();
    salesLog.forEach(sale => {
      const name = sale.customerName?.trim();
      const phone = sale.customerPhone?.trim();
      if (name && phone) {
        const key = `${name.toLowerCase()}|${phone}`;
        if (!customers.has(key)) {
          customers.set(key, {
            name,
            phone,
            address: sale.customerAddress?.trim() || '',
          });
        }
      }
    });
    return Array.from(customers.values());
  }, [salesLog]);

  const renderView = () => {
    switch(view) {
        case 'sale':
            return (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <ProductList 
                          products={products} 
                          cartItems={cartItems}
                          onAddToCart={handleAddToCart}
                          onEditProduct={setEditingProduct}
                      />
                    </div>
                    <div className="hidden lg:block">
                       <Cart 
                          items={cartItems}
                          onUpdateQuantity={handleUpdateQuantity}
                          onUpdateDiscount={handleUpdateDiscount}
                          onRemoveItem={handleRemoveItem}
                          onClearCart={handleClearCart}
                          subtotal={subtotal}
                          onProceedToCheckout={handleProceedToCheckout}
                       />
                    </div>
                </div>

                {/* Mobile Checkout Bar */}
                {cartItems.length > 0 && (
                  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20 p-3">
                    <div className="container mx-auto flex items-center justify-between gap-4">
                        <div className="text-sm">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{cartItems.length} item(s)</p>
                            <p className="text-lg font-bold text-primary-600">₹{finalTotal.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={handleProceedToCheckout}
                          className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Checkout
                        </button>
                    </div>
                  </div>
                )}
              </>
            );
        case 'checkout':
            return <Checkout
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdateDiscount={handleUpdateDiscount}
                onUpdateManualDiscount={handleUpdateManualDiscount}
                onRemoveItem={handleRemoveItem}
                subtotal={subtotal}
                itemsTotal={itemsTotal}
                finalTotal={finalTotal}
                billDiscount={billDiscount}
                billManualDiscount={billManualDiscount}
                onUpdateBillDiscount={handleUpdateBillDiscount}
                onUpdateBillManualDiscount={handleUpdateBillManualDiscount}
                customerName={customerName}
                customerAddress={customerAddress}
                customerPhone={customerPhone}
                setCustomerName={setCustomerName}
                setCustomerAddress={setCustomerAddress}
                setCustomerPhone={setCustomerPhone}
                uniqueCustomers={uniqueCustomers}
                onCheckout={handleCheckout}
                onBackToSale={() => setView('sale')}
            />;
        case 'bill':
            return currentSale ? (
                <BillSummary 
                    sale={currentSale}
                    onNewSale={handleNewSale}
                />
            ) : null;
        case 'log':
            return <SalesLog sales={salesLog} />;
        case 'dashboard':
            return <Dashboard sales={salesLog} products={products} />;
        case 'top-customers':
            return <TopCustomers sales={salesLog} />;
        default:
            return null;
    }
  }
  
  // Add padding-bottom to main content to avoid being obscured by the mobile checkout bar
  const mainContentPadding = view === 'sale' && cartItems.length > 0 ? 'pb-24 lg:pb-8' : 'pb-8';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start sm:items-center">
          <div>
            <button onClick={handleNewSale} className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">FC Store</h1>
            </button>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Sanpoh Kawn, N. Vanlaiphai</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Ph: +91 8787747469 / +919383180834</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>

            {(view === 'sale' || view === 'checkout') && (
              <>
                <button
                    onClick={() => setView('log')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="View Sales Log"
                >
                    <ListBulletIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setView('dashboard')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="View Dashboard"
                >
                    <ChartBarIcon className="w-6 h-6" />
                </button>
                 <button
                    onClick={() => setView('top-customers')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="View Top Customers"
                >
                    <TrophyIcon className="w-6 h-6" />
                </button>
              </>
            )}
            {(view !== 'sale' && view !== 'checkout') && (
                 <button
                    onClick={handleNewSale}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Go to Sales Screen"
                >
                    <ShoppingCartIcon className="w-6 h-6" />
                </button>
            )}

            {view === 'sale' && (
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                aria-label="Add new product"
              >
                <PlusIcon className="w-5 h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Product</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
            {view === 'bill' && (
              <button
                onClick={handleNewSale}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                New Sale
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className={`container mx-auto p-4 sm:p-6 lg:p-8 ${mainContentPadding}`}>
        {renderView()}
      </main>

      <EditProductModal 
        product={editingProduct}
        onUpdateProduct={handleUpdateProduct}
        onClose={() => setEditingProduct(null)}
      />
      
      {isAddProductOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30 no-print" 
            onClick={() => setIsAddProductOpen(false)}
            aria-hidden="true"
        ></div>
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-40 transform transition-transform duration-300 ease-in-out no-print ${isAddProductOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-title"
      >
        <AddProductForm 
            onAddProduct={handleAddProduct}
            onClose={() => setIsAddProductOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;