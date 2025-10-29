import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AddProductModal from '../modals/products/AddProducts'; 
import EditProductModal from '../modals/products/EditProducts';
import { addProducts, deleteProduct, editProduct, getAllCategories, getAllProducts } from '../../api/adminApi';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  productName: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  status: 'active' | 'inactive';
}

interface Category {
  _id: string;
  name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
  message: string;
}

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });

  // Fetch products with search and pagination
  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setIsLoading(true);
      const response = await getAllProducts(page, search);
      if (response && response.products) {
        const validatedProducts = response.products.map((product: any) => ({
          _id: product._id,
          productName: product.productName,
          categoryId: product.categoryId?._id || product.categoryId,
          categoryName: product.categoryId?.name || 'Uncategorized',
          price: product.price,
          status: product.status === 'active' || product.status === 'inactive' ? product.status : 'active'
        }));
        setProducts(validatedProducts);
        setPagination(response.pagination);
        toast.success(response.message || 'Products loaded successfully');
      } else {
        console.error('Unexpected response structure:', response);
        setProducts([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: 0,
          hasNext: false,
          hasPrev: false,
          limit: 10
        });
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10
      });
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage, searchTerm);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Optimistic UI update
      const previousProducts = [...products];
      const previousPagination = { ...pagination };
      
      setProducts(prev => prev.filter(product => product._id !== id));
      setPagination(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - 1
      }));

      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        
        // If this was the last item on the page and not the first page, go to previous page
        if (products.length === 1 && pagination.currentPage > 1) {
          fetchProducts(pagination.currentPage - 1, searchTerm);
        } else {
          fetchProducts(pagination.currentPage, searchTerm);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        // Revert UI if deletion fails
        setProducts(previousProducts);
        setPagination(previousPagination);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (productData: Product) => { 
    try {
      await editProduct(productData._id, productData);
      // Refresh current page to reflect changes
      fetchProducts(pagination.currentPage, searchTerm);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const product = products.find(p => p._id === id);
      if (product) {
        const updatedStatus: 'active' | 'inactive' = product.status === 'active' ? 'inactive' : 'active';
        const updatedProduct: Product = {
          ...product,
          status: updatedStatus
        };
        await editProduct(id, updatedProduct);
        // Refresh current page to reflect status change
        fetchProducts(pagination.currentPage, searchTerm);
        toast.success(`Product ${updatedStatus} successfully`);
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleAddProduct = async (productData: any) => {    
    try {
      const response = await addProducts(productData);
      if (response && response.product) {
        // Refresh the current page to show the new product
        fetchProducts(pagination.currentPage, searchTerm);
        setIsAddModalOpen(false);
        toast.success('Product added successfully');
      } else {
        console.error('Unexpected response structure:', response);
        toast.error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response && response.categories) {
        setCategories(response.categories);
      } else {
        console.error('Unexpected response structure:', response);
        setCategories([]);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error('Failed to load categories');
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(1, '');
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Products</h2>
        <p className="text-slate-600">Manage your product inventory</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, category, or price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Product Button */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name
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
                {products.length > 0 ? (
                  products.map((product) => (
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
                        <button
                          onClick={() => toggleStatus(product._id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {searchTerm ? 'No products found matching your search' : 'No products found. Add your first product!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing {products.length} of {pagination.totalProducts} products
                {searchTerm && ` for "${searchTerm}"`}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`p-2 rounded-lg border ${
                    pagination.hasPrev
                      ? 'text-slate-600 border-slate-300 hover:bg-slate-50'
                      : 'text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {generatePageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`p-2 rounded-lg border ${
                    pagination.hasNext
                      ? 'text-slate-600 border-slate-300 hover:bg-slate-50'
                      : 'text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Clear Search */}
          {searchTerm && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProduct}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        onEdit={handleEditProduct}
        product={editingProduct}
        categories={categories}
      />
    </div>
  );
};

export default Products;