import React, { useState, useMemo } from 'react';
import { Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './constants';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import BillSummary from './components/BillSummary';
import { StoreIcon } from './components/icons';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isBillFinalized, setIsBillFinalized] = useState<boolean>(false);
  const [finalizedBill, setFinalizedBill] = useState<CartItem[]>([]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevItems.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prevItems;
      } else {
        return [...prevItems, { ...product, quantity: 1, discount: 0, price: product.mrp }];
      }
    });
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    setCartItems(prevItems => {
      const productInStock = products.find(p => p.id === productId);
      if (!productInStock) return prevItems;

      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      
      if (newQuantity > productInStock.stock) {
        // Optionally alert user: Not enough stock
        return prevItems.map(item =>
          item.id === productId ? { ...item, quantity: productInStock.stock } : item
        );
      }
      
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleUpdateDiscount = (productId: number, discount: number) => {
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
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Update inventory
    setProducts(prevProducts => {
      return prevProducts.map(product => {
        const cartItem = cartItems.find(item => item.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
    });

    setFinalizedBill([...cartItems]);
    setIsBillFinalized(true);
  };

  const handleNewSale = () => {
    setCartItems([]);
    setFinalizedBill([]);
    setIsBillFinalized(false);
  };

  const handleAddNewProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...productData,
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };
  
  const { subtotal, total } = useMemo(() => {
    const currentBill = isBillFinalized ? finalizedBill : cartItems;
    const sub = currentBill.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { subtotal: sub, total: sub };
  }, [cartItems, isBillFinalized, finalizedBill]);

  return (
    <div className="font-sans antialiased text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <StoreIcon className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold tracking-tight">Simple POS</h1>
            </div>
            {isBillFinalized && (
               <button
                onClick={handleNewSale}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                New Sale
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {isBillFinalized ? (
          <BillSummary 
            items={finalizedBill}
            subtotal={subtotal}
            total={total}
            onNewSale={handleNewSale}
          />
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <ProductList 
                products={products}
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                onAddProduct={handleAddNewProduct}
              />
            </div>
            <div className="lg:col-span-1 mt-8 lg:mt-0">
               <Cart 
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckout}
                  subtotal={subtotal}
                  total={total}
                  onUpdateDiscount={handleUpdateDiscount}
                />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;