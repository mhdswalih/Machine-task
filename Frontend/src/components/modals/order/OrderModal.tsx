import React, { useState } from 'react';
import { X, Plus, Minus, Package, DollarSign, Tag, Info, User } from 'lucide-react';

interface Product {
  _id: string;
  productName: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  status: 'active' | 'inactive';
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: { 
    productId: string; 
    quantity: number; 
    totalAmount: number;
    userId: string;
  }) => void;
  product: Product | null;
  userId: string;
  userName: string;
}

const OrderModal: React.FC<OrderModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  product, 
  userId,
  userName 
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset quantity when modal opens with new product
  React.useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  const handleIncrease = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const calculateTotal = (): number => {
    return product ? product.price * quantity : 0;
  };

  const handleSubmit = async () => {
    if (!product || !userId) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        productId: product._id,
        quantity: quantity,
        totalAmount: calculateTotal(),
        userId: userId
      });
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setIsSubmitting(false);
    onClose();
  };

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
            <h3 className="text-xl font-semibold text-slate-900">Place Order</h3>
            <p className="text-sm text-slate-600 mt-1">Confirm your product order</p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Order For User
            </h4>
            <p className="text-sm text-blue-700">{userName}</p>
          </div>

          {/* Product Details */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Product Details
            </h4>
            
            <div className="space-y-3">
              {/* Product Name */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-700">Product Name:</span>
                <span className="text-sm text-slate-900 text-right font-semibold">
                  {product.productName}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Tag size={16} />
                  Category:
                </span>
                <span className="text-sm text-slate-600 text-right">
                  {product.categoryName || 'Uncategorized'}
                </span>
              </div>

              {/* Unit Price */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <DollarSign size={16} />
                  Unit Price:
                </span>
                <span className="text-sm text-slate-600 text-right">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <Info size={16} />
                  Status:
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  product.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quantity
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isSubmitting}
                  className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  disabled={isSubmitting}
                  className="w-20 px-3 py-2 text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                />
                
                <button
                  onClick={handleIncrease}
                  disabled={isSubmitting}
                  className="w-10 h-10 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-slate-500">Unit Price</div>
                <div className="text-sm font-semibold text-slate-900">
                  ${product.price.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-slate-200 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Subtotal ({quantity} items):</span>
                <span className="font-medium text-slate-900">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Tax (10%):</span>
                <span className="font-medium text-slate-900">
                  ${(calculateTotal() * 0.1).toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-base border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-900">Total Amount:</span>
                <span className="font-bold text-blue-600 text-lg">
                  ${(calculateTotal() * 1.1).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                This order will be processed immediately for {userName}. You will receive a confirmation email with order details.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || product.status === 'inactive'}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <DollarSign size={16} />
                Confirm Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;