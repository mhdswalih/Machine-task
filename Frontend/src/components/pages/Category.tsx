import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AddCategoryModal from '../modals/category/AddCategory';
import EditCategoryModal from '../modals/category/EditCategory';
import { addCategory, deleteCategory, editCategory, getAllCategories } from '../../api/adminApi';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface CategoriesResponse {
  categories: Category[];
  pagination: PaginationInfo;
  message: string;
}

const Category: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCategories: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch categories with search and pagination
  const fetchCategories = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    try {
      const response = await getAllCategories(page, search);
      if (response && response.categories) {
        setCategories(response.categories);
        setPagination(response.pagination);
        toast.success(response.message || 'Categories loaded successfully');
      } else {
        setCategories([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCategories: 0,
          hasNext: false,
          hasPrev: false,
          limit: 10
        });
        toast.error('No categories found');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCategories: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10
      });
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCategories(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCategories(newPage, searchTerm);
    }
  };

  // ✅ Add new category
  const handleAddCategory = async (categoryData: { name: string; description: string }) => {
    try {
      const response = await addCategory(categoryData);
      if (response && response.category) {
        // Refresh the current page to show the new category
        fetchCategories(pagination.currentPage, searchTerm);
        setIsAddModalOpen(false);
        toast.success(response.message || 'Category added successfully');
      } else {
        toast.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  // ✅ Edit category
  const handleEditCategory = async (categoryData: Category) => {
    try {
      const response = await editCategory(categoryData._id, categoryData);
      if (response && response.category) {
        // Refresh the current page to reflect changes
        fetchCategories(pagination.currentPage, searchTerm);
        setIsEditModalOpen(false);
        setEditingCategory(null);
        toast.success(response.message || 'Category updated successfully');
      } else {
        console.error('Unexpected edit category response:', response);
        toast.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error editing category:', error);
      toast.error('Failed to update category');
    }
  };

  // ✅ Delete category
  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      // ✅ Optimistic UI update
      const previousCategories = [...categories];
      const previousPagination = { ...pagination };
      
      setCategories(prev => prev.filter(cat => cat._id !== category._id));
      setPagination(prev => ({
        ...prev,
        totalCategories: prev.totalCategories - 1
      }));

      try {
        await deleteCategory(category._id);
        toast.success('Category deleted successfully');
        
        // If this was the last item on the page and not the first page, go to previous page
        if (categories.length === 1 && pagination.currentPage > 1) {
          fetchCategories(pagination.currentPage - 1, searchTerm);
        } else {
          fetchCategories(pagination.currentPage, searchTerm);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        // ❌ Revert UI if deletion fails
        setCategories(previousCategories);
        setPagination(previousPagination);
        toast.error('Failed to delete category. Please try again.');
      }
    }
  };

  // ✅ Handle edit button click
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchCategories(1, '');
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Categories</h2>
        <p className="text-slate-600">Manage your product categories</p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Category Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-1/3">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3 text-sm font-medium text-slate-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {category.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Edit category"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  {searchTerm ? 'No categories found matching your search' : 'No categories found'}
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
            Showing {categories.length} of {pagination.totalCategories} categories
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
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
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

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        onEdit={handleEditCategory}
        category={editingCategory}
      />
    </div>
  );
};

export default Category;