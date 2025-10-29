import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string; // Changed from id: number
  productName: string; // Changed from name: string
  categoryId: string; // Changed from categoryId: number
  price: number;
  status: 'active' | 'inactive';
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  product: Product | null;
  categories: Category[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  product, 
  categories 
}) => {
  const [formData, setFormData] = useState<Product>({
    _id: '', // Changed from id: 0
    productName: '', // Changed from name: ''
    categoryId: '', // Changed from categoryId: 0
    price: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when product data changes
  useEffect(() => {
    if (product) {
      setFormData({
        _id: product._id,
        productName: product.productName || '',
        categoryId: product.categoryId || (categories.length > 0 ? categories[0]._id : ''),
        price: product.price || 0,
        status: product.status || 'active'
      });
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof Product]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Product> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (formData.productName.trim().length < 2) {
      newErrors.productName = 'Product name must be at least 2 characters long';
    }

    // if (formData.price <= 0) {
    //   newErrors.price = 'Price must be greater than 0';
    // }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onEdit(formData);
        handleClose();
      } catch (error) {
        console.error('Error updating product:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      _id: '',
      productName: '',
      categoryId: '',
      price: 0,
      status: 'active'
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Edit Product</h3>
            <p className="text-sm text-slate-600 mt-1">Update product information</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-slate-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.productName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Enter product name"
              maxLength={100}
            />
            <div className="flex justify-between mt-1">
              {errors.productName ? (
                <p className="text-sm text-red-500">{errors.productName}</p>
              ) : (
                <div />
              )}
              <span className="text-xs text-slate-500">
                {formData.productName.length}/100
              </span>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isSubmitting || categories.length === 0}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.categoryId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
            )}
            {categories.length === 0 && (
              <p className="mt-1 text-sm text-orange-500">No categories available</p>
            )}
          </div>

          {/* Price and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={isSubmitting}
                min="0"
                step="0.01"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || categories.length === 0}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;