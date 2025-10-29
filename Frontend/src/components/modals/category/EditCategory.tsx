import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Use a consistent interface that matches your main component
interface Category {
  _id: string; // Changed to match main component
  name: string;
  description: string;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: Category) => void;
  category: Category | null;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, onClose, onEdit, category }) => {
  const [formData, setFormData] = useState<Category>({
    _id: '', // Changed to match main component
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when category data changes
  useEffect(() => {
    if (category) {
      setFormData({
        _id: category._id, // Changed to match main component
        name: category.name || '',
        description: category.description || ''
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      description: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onEdit({
          _id: formData._id, // Changed to match main component
          name: formData.name.trim(),
          description: formData.description.trim()
        });
        handleClose();
      } catch (error) {
        console.error('Error updating category:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({ _id: '', name: '', description: '' }); // Changed to match main component
    setErrors({ name: '', description: '' });
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

  if (!isOpen || !category) return null;

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
            <h3 className="text-xl font-semibold text-slate-900">Edit Category</h3>
            <p className="text-sm text-slate-600 mt-1">Update category information</p>
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
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Enter category name"
              maxLength={50}
            />
            <div className="flex justify-between mt-1">
              {errors.name ? (
                <p className="text-sm text-red-500">{errors.name}</p>
              ) : (
                <div /> // Empty div for spacing
              )}
              <span className="text-xs text-slate-500">
                {formData.name.length}/50
              </span>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              disabled={isSubmitting}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none disabled:bg-slate-50 disabled:text-slate-500 ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
              placeholder="Enter category description"
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-sm text-red-500">{errors.description}</p>
              ) : (
                <div /> // Empty div for spacing
              )}
              <span className="text-xs text-slate-500">
                {formData.description.length}/500
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;