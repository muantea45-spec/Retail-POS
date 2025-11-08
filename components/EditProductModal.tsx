import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { XMarkIcon } from './icons';

interface EditProductModalProps {
  product: Product | null;
  onUpdateProduct: (product: Product) => void;
  onClose: () => void;
  categories: string[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onUpdateProduct, onClose, categories }) => {
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name);
      setMrp(product.mrp.toString());
      setCategory(product.category);
      setError('');
    }
  }, [product]);

  if (!product) {
    return null;
  }

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

    onUpdateProduct({ ...product, name, mrp: mrpValue, category });
    onClose();
  };
  
  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative"
        onClick={e => e.stopPropagation()}
      >
         <button 
            onClick={onClose} 
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close modal"
        >
            <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <input
              id="edit-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
              list="categories-list-edit"
            />
             <datalist id="categories-list-edit">
                {categories.map((cat) => <option key={cat} value={cat} />)}
            </datalist>
          </div>
          <div>
            <label htmlFor="edit-mrp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
            <input
              id="edit-mrp"
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500"
              min="0.01"
              step="0.01"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4 pt-2">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
