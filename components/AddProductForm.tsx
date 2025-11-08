import React, { useState } from 'react';
import { Product } from '../types';
import { XMarkIcon } from './icons';

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  categories: string[];
  onClose: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, categories, onClose }) => {
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mrp || !category.trim()) {
      setError('All fields are required.');
      return;
    }
    const mrpValue = parseFloat(mrp);
    if (isNaN(mrpValue) || mrpValue <= 0) {
      setError('Please enter a valid MRP.');
      return;
    }

    onAddProduct({ name, mrp: mrpValue, category });
    // Parent component will handle closing the sidebar.
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
        <h2 id="add-product-title" className="text-xl font-bold text-slate-900 dark:text-white">Add New Product</h2>
         <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close panel"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="p-6 flex-grow overflow-y-auto">
        <div className="space-y-4">
            <div>
                <label htmlFor="new-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="e.g., Classic Lays Chips"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            <div>
                <label htmlFor="new-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <input
                  id="new-category"
                  type="text"
                  placeholder="e.g., Biscuits & Snacks"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500"
                  list="categories-list"
                />
                <datalist id="categories-list">
                    {categories.map((cat) => <option key={cat} value={cat} />)}
                </datalist>
            </div>
            <div>
                <label htmlFor="new-mrp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
                <input
                  id="new-mrp"
                  type="number"
                  placeholder="e.g., 20"
                  value={mrp}
                  onChange={(e) => setMrp(e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500"
                  min="0.01"
                  step="0.01"
                />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto flex-shrink-0 -mx-6 -mb-6">
           <div className="flex justify-end space-x-3">
             <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
              >
                Add Product
              </button>
           </div>
        </footer>
      </form>
    </div>
  );
};

export default AddProductForm;