import React, { useState } from 'react';
import { Product } from '../types';

interface AddProductFormProps {
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onCancel }) => {
  const [name, setName] = useState('');
  const [mrp, setMrp] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mrp || !stock) {
      alert('Please fill out at least Name, MRP, and Stock.');
      return;
    }

    const finalImageUrl = imageUrl.trim() || `https://picsum.photos/seed/${name.trim().replace(/\s+/g, '-')}/400`;

    onAddProduct({
      name: name.trim(),
      mrp: parseFloat(mrp),
      stock: parseInt(stock, 10),
      imageUrl: finalImageUrl,
    });
  };
  
  const formInputStyle = "w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
          <input
            id="productName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputStyle}
            placeholder="e.g., Organic Bananas"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="productMrp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">MRP ($)</label>
            <input
              id="productMrp"
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 1.99"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="productStock" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
            <input
              id="productStock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={formInputStyle}
              placeholder="e.g., 100"
              min="0"
              step="1"
              required
            />
          </div>
        </div>
         <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL (Optional)</label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={formInputStyle}
            placeholder="Leave blank for a random image"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
