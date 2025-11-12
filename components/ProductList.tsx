import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { PencilIcon } from './icons';

interface ProductListProps {
  products: Product[];
  categories: string[];
  cartItems: { id: number }[];
  onAddToCart: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onUpdateCategory: (oldCategory: string, newCategory: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, categories, cartItems, onAddToCart, onEditProduct, onUpdateCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryInputValue, setCategoryInputValue] = useState('');

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
      .filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [products, searchTerm, selectedCategory]);
  
  const groupedProducts = useMemo(() => {
    // FIX: Replaced reduce with a for...of loop to avoid complex type inference issues.
    const acc: Record<string, Product[]> = {};
    for (const product of filteredProducts) {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
    }
    return acc;
  }, [filteredProducts]);

  const cartItemIds = useMemo(() => new Set(cartItems.map(item => item.id)), [cartItems]);

  const handleEditCategoryClick = (category: string) => {
    setEditingCategory(category);
    setCategoryInputValue(category);
  };

  const handleCategorySave = () => {
    if (editingCategory && categoryInputValue.trim() && editingCategory !== categoryInputValue.trim()) {
        onUpdateCategory(editingCategory, categoryInputValue.trim());
    }
    setEditingCategory(null);
  };

  return (
    <div>
        <div className="mb-4 sticky top-20 z-10 bg-slate-50 dark:bg-slate-900 py-2 space-y-3">
            <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${selectedCategory === 'All' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex-shrink-0 ${selectedCategory === category ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {category}
                </button>
              ))}
            </div>
        </div>
      
        {Object.keys(groupedProducts).length > 0 ? (
            Object.entries(groupedProducts).sort(([catA], [catB]) => catA.localeCompare(catB)).map(([category, items]) => (
                <div key={category} className="mb-8">
                    <div className="flex items-center mb-4 pb-2 border-b-2 border-primary-500">
                      {editingCategory === category ? (
                        <input
                          type="text"
                          value={categoryInputValue}
                          onChange={(e) => setCategoryInputValue(e.target.value)}
                          onBlur={handleCategorySave}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCategorySave();
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                          className="text-2xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none focus:ring-0 border-0 p-0"
                          autoFocus
                        />
                      ) : (
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center group">
                          {category}
                          <button 
                            onClick={() => handleEditCategoryClick(category)}
                            className="ml-3 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-primary-600 dark:hover:text-primary-400 transition-opacity"
                            aria-label={`Edit category ${category}`}
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                        </h2>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {items.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={onAddToCart}
                                onEditProduct={onEditProduct}
                                isInCart={cartItemIds.has(product.id)}
                            />
                        ))}
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-10">
                <p className="text-slate-500 dark:text-slate-400">No products found.</p>
            </div>
        )}
    </div>
  );
};

export default ProductList;
