import { useEffect, useState } from 'react';
import { Search, Package, ShoppingCart, Users } from 'lucide-react';
import { createOrder, getAllProducts, getAllUsers } from '../../api/adminApi';
import OrderModal from '../modals/order/OrderModal';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  productName: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  status: 'active' | 'inactive';
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

const OrderTable = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch products and users from API
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const [productsResponse, usersResponse] = await Promise.all([
        getAllProducts(),
        getAllUsers()
      ]);

      console.log('Products Response:', productsResponse);
      console.log('Users Response:', usersResponse);

      if (productsResponse && productsResponse.products) {
        const validatedProducts = productsResponse.products.map((product: any) => ({
          _id: product._id,
          productName: product.productName,
          categoryId: product.categoryId?._id || product.categoryId,
          categoryName: product.categoryId?.name || 'Uncategorized',
          price: product.price,
          status: product.status === 'active' || product.status === 'inactive' ? product.status : 'active'
        }));
        console.log('Processed Products:', validatedProducts);
        setProducts(validatedProducts);
        toast.success('Products and users loaded successfully');
      } else {
        setError('Unexpected response structure from server');
        setProducts([]);
        toast.error('Failed to load products');
      }

      if (usersResponse && usersResponse.users) {
        const cleanedUsers = usersResponse.users.map((user: any) => ({
          _id: user._id,
          name: user.name || 'No Name',
          email: user.email || 'No Email',
          phone: user.phone || 'No Phone',
        }));
        setUsers(cleanedUsers);
        
        // Set default selected user to first user if available
        if (cleanedUsers.length > 0) {
          setSelectedUserId(cleanedUsers[0]._id);
        }
      }

    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
      toast.error('Failed to load products and users');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.categoryName && product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    product.categoryId.toString().includes(searchTerm) ||
    product.price.toString().includes(searchTerm) ||
    product.status.toLowerCase().includes(searchTerm)
  );

  // Handle order button click
  const handleOrder = (product: Product) => {
    if (!selectedUserId && users.length > 0) {
      toast.error('Please select a user first');
      return;
    }
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  // Handle order confirmation
  const handleConfirmOrder = async (orderData: { 
    productId: string; 
    quantity: number; 
    totalAmount: number;
    userId: string;
  }) => {
    try {
      await createOrder(orderData);
      toast.success(`Order placed successfully!\nQuantity: ${orderData.quantity}\nTotal: $${orderData.totalAmount.toFixed(2)}`);
      setIsOrderModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  // Get status color
  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get selected user name
  const getSelectedUserName = (): string => {
    const user = users.find(u => u._id === selectedUserId);
    return user ? `${user.name} (${user.email})` : 'No user selected';
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Products</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Order Products</h2>
        <p className="text-slate-600">Browse available products and place orders</p>
      </div>

      {/* User Selection */}
      {users.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Select User</h3>
                <p className="text-sm text-slate-600">Choose a user to place orders for</p>
              </div>
            </div>
            
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
          </div>
          
          {selectedUserId && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Selected User:</strong> {getSelectedUserName()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Debug Info - Shows product count */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Debug Info:</strong> {products.length} products loaded, {users.length} users loaded
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Refresh Button */}
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Package size={20} />
          <span>Refresh Products</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products Available</h3>
            <p className="text-slate-600 mb-4">There are no products to display. Please check if products exist in your database.</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {product.productName.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-3 text-sm font-medium text-slate-900">{product.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {product.categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleOrder(product)}
                          disabled={product.status === 'inactive' || !selectedUserId}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          title={!selectedUserId ? 'Please select a user first' : ''}
                        >
                          <ShoppingCart size={16} />
                          <span>Order</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No products match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Showing {filteredProducts.length} of {products.length} products</span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmOrder}
        product={selectedProduct}
        userId={selectedUserId}
        userName={getSelectedUserName()}
      />
    </div>
  );
};

export default OrderTable;