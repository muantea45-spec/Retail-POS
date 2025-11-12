import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, CartItem, Sale } from './types';
import { INITIAL_PRODUCTS } from './constants';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import BillSummary from './components/BillSummary';
import EditProductModal from './components/EditProductModal';
import AddProductForm from './components/AddProductForm';
import SalesLog from './components/SalesLog';
import { PlusIcon, SunIcon, MoonIcon, ListBulletIcon, ShoppingCartIcon } from './components/icons';

type View = 'sale' | 'bill' | 'log';

function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState(0);
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

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.stock <= 0) return; // Safeguard
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) return prevItems;
      return [...prevItems, { ...product, quantity: 1, discount: 0, price: product.mrp }];
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.min(newQuantity, product.stock) }
          : item
      )
    );
  }, [products, handleRemoveItem]);

  const handleUpdateDiscount = useCallback((productId: number, discount: number) => {
    const newDiscount = Math.max(0, Math.min(100, isNaN(discount) ? 0 : discount));
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === productId) {
          const newPrice = item.mrp * (1 - newDiscount / 100);
          return { ...item, discount: newDiscount, price: newPrice };
        }
        return item;
      })
    );
  }, []);
  
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setBillDiscount(0);
    setCustomerName('');
    setCustomerAddress('');
    setCustomerPhone('');
  }, []);

  const { subtotal, itemsTotal, finalTotal } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = itemsTotal * (1 - billDiscount / 100);
    return { subtotal, itemsTotal, finalTotal };
  }, [cartItems, billDiscount]);

  const handleCheckout = useCallback(() => {
    if (cartItems.length > 0) {
      // Create and record the sale
      const newSale: Sale = {
        id: Date.now(),
        date: new Date(),
        items: cartItems,
        subtotal,
        itemsTotal,
        finalTotal,
        billDiscount,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        customerPhone: customerPhone.trim(),
      };
      setSalesLog(prev => [newSale, ...prev]);
      setCurrentSale(newSale);
      
      // Decrement stock
      setProducts(prevProducts => {
        const productsMap = new Map(prevProducts.map(p => [p.id, p]));
        cartItems.forEach(item => {
          const product = productsMap.get(item.id);
          if (product) {
            productsMap.set(item.id, { ...product, stock: product.stock - item.quantity });
          }
        });
        return Array.from(productsMap.values());
      });
      setView('bill');
    }
  }, [cartItems, subtotal, itemsTotal, finalTotal, billDiscount, customerName, customerAddress, customerPhone]);

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

  // FIX: Broke the map().filter() chain to help TypeScript's type inference, which was causing errors with `updatedProduct`.
  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setCartItems(prevItems => {
        // FIX: Refactored to use reduce for better type safety and to resolve inference issues.
        // FIX: Cast the initial value for `reduce` to fix TypeScript's type inference. This resolves multiple errors.
        return prevItems.reduce((acc, item) => {
            if (item.id === updatedProduct.id) {
                const newPrice = updatedProduct.mrp * (1 - item.discount / 100);
                const newQuantity = Math.min(item.quantity, updatedProduct.stock);
                if (newQuantity >= 1) {
                    const newCartItem: CartItem = {
                      ...updatedProduct,
                      quantity: newQuantity,
                      discount: item.discount, // Preserve original discount
                      price: newPrice,
                    };
                    acc.push(newCartItem);
                }
            } else {
                acc.push(item);
            }
            return acc;
        }, [] as CartItem[]);
    });
  }, []);
  
  const handleUpdateCategory = useCallback((oldCategory: string, newCategory: string) => {
    const trimmedNewCategory = newCategory.trim();
    if (!trimmedNewCategory || categories.includes(trimmedNewCategory)) return;
    setProducts(prev => prev.map(p => p.category === oldCategory ? { ...p, category: trimmedNewCategory } : p));
    setCartItems(prev => prev.map(item => item.category === oldCategory ? { ...item, category: trimmedNewCategory } : item));
  }, [categories]);

  const handleUpdateBillDiscount = useCallback((discount: number) => {
    setBillDiscount(Math.max(0, Math.min(100, isNaN(discount) ? 0 : discount)));
  }, []);

  const renderView = () => {
    switch(view) {
        case 'sale':
            return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                    <ProductList 
                        products={products} 
                        cartItems={cartItems}
                        onAddToCart={handleAddToCart}
                        onEditProduct={setEditingProduct}
                        onUpdateCategory={handleUpdateCategory}
                    />
                    </div>
                    <div>
                    <Cart 
                        items={cartItems}
                        onUpdateQuantity={handleUpdateQuantity}
                        onUpdateDiscount={handleUpdateDiscount}
                        onRemoveItem={handleRemoveItem}
                        onClearCart={handleClearCart}
                        onCheckout={handleCheckout}
                        subtotal={subtotal}
                        itemsTotal={itemsTotal}
                        finalTotal={finalTotal}
                        billDiscount={billDiscount}
                        onUpdateBillDiscount={handleUpdateBillDiscount}
                        customerName={customerName}
                        customerAddress={customerAddress}
                        customerPhone={customerPhone}
                        setCustomerName={setCustomerName}
                        setCustomerAddress={setCustomerAddress}
                        setCustomerPhone={setCustomerPhone}
                    />
                    </div>
                </div>
            );
        case 'bill':
            return currentSale ? (
                <BillSummary 
                    sale={currentSale}
                    // FIX: Changed onNewSale to the correct handler handleNewSale.
                    onNewSale={handleNewSale}
                />
            ) : null;
        case 'log':
            return <SalesLog sales={salesLog} />;
        default:
            return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">FC Store</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Sanpoh Kawn, N. Vanlaiphai</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Ph: 8787747469 / 9383180834</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>

            {view === 'sale' && (
                <button
                    onClick={() => setView('log')}
                    className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="View Sales Log"
                >
                    <ListBulletIcon className="w-6 h-6" />
                </button>
            )}
            {(view === 'log' || view === 'bill') && (
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
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <EditProductModal 
        product={editingProduct}
        onUpdateProduct={handleUpdateProduct}
        onClose={() => setEditingProduct(null)}
        categories={categories}
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
            categories={categories}
            onClose={() => setIsAddProductOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
