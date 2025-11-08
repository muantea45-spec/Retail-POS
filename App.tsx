import React, { useState, useMemo, useCallback } from 'react';
import { Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import BillSummary from './components/BillSummary';
import EditProductModal from './components/EditProductModal';
import AddProductForm from './components/AddProductForm';
import { PlusIcon } from './components/icons';

type View = 'sale' | 'bill';

function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [view, setView] = useState<View>('sale');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  const handleAddToCart = useCallback((product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems; // Already in cart, do nothing. Button should be disabled anyway.
      }
      return [
        ...prevItems,
        { ...product, quantity: 1, discount: 0, price: product.mrp }
      ];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

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
  
  const handleRemoveItem = useCallback((productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setBillDiscount(0);
  }, []);

  const handleCheckout = useCallback(() => {
    if (cartItems.length > 0) {
      setView('bill');
    }
  }, [cartItems.length]);

  const handleNewSale = useCallback(() => {
    handleClearCart();
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
    setIsAddProductOpen(false); // Close sidebar on success
  }, []);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    // Also update in cart if it exists
    setCartItems(prevItems => prevItems.map(item => {
        if (item.id === updatedProduct.id) {
            const newPrice = updatedProduct.mrp * (1 - item.discount / 100);
            return { ...item, ...updatedProduct, price: newPrice };
        }
        return item;
    }));
  }, []);
  
  const handleUpdateCategory = useCallback((oldCategory: string, newCategory: string) => {
    const trimmedNewCategory = newCategory.trim();
    if (!trimmedNewCategory || categories.includes(trimmedNewCategory)) {
        // Silently fail if new category is empty or already exists to prevent accidental merges.
        return;
    }
    setProducts(prev => prev.map(p => p.category === oldCategory ? { ...p, category: trimmedNewCategory } : p));
    setCartItems(prev => prev.map(item => item.category === oldCategory ? { ...item, category: trimmedNewCategory } : item));
  }, [categories]);

  const handleUpdateBillDiscount = useCallback((discount: number) => {
    setBillDiscount(Math.max(0, Math.min(100, isNaN(discount) ? 0 : discount)));
  }, []);

  const { subtotal, itemsTotal, finalTotal } = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);
    const itemsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = itemsTotal * (1 - billDiscount / 100);
    return { subtotal, itemsTotal, finalTotal };
  }, [cartItems, billDiscount]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600">FC Store</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Sanpoh Kawn, N. Vanlaiphai</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Ph: 8787747469 / 9383180834</p>
          </div>
          <div className="flex items-center space-x-4 flex-shrink-0">
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
        {view === 'sale' ? (
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
              />
            </div>
          </div>
        ) : (
          <BillSummary 
            items={cartItems}
            subtotal={subtotal}
            itemsTotal={itemsTotal}
            billDiscount={billDiscount}
            finalTotal={finalTotal}
            onNewSale={handleNewSale}
          />
        )}
      </main>

      <EditProductModal 
        product={editingProduct}
        onUpdateProduct={handleUpdateProduct}
        onClose={() => setEditingProduct(null)}
        categories={categories}
      />
      
      {/* Add Product Sidebar */}
      {isAddProductOpen && (
        <div 
            className="fixed inset-0 bg-black/60 z-30" 
            onClick={() => setIsAddProductOpen(false)}
            aria-hidden="true"
        ></div>
      )}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isAddProductOpen ? 'translate-x-0' : 'translate-x-full'}`}
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