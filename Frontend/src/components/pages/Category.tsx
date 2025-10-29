import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import AddCategoryModal from '../modals/category/AddCategory';
import EditCategoryModal from '../modals/category/EditCategory';
import { addCategory, deleteCategory, editCategory, getAllCategories } from '../../api/adminApi';

interface Category {
  _id: string; // Changed to string to match typical MongoDB IDs
  name: string;
  description: string;
}

const Category: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Filtered categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response && response.categories) {
        setCategories(response.categories);
      } else {
        console.error('Unexpected response structure:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // ✅ Add new category
  const handleAddCategory = async (categoryData: { name: string; description: string }) => {
    try {
      const response = await addCategory(categoryData);
      if (response && response.category) {
        setCategories(prev => [...prev, response.category]);
        setIsAddModalOpen(false);
      } else {
        console.error('Unexpected add category response:', response);
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  // ✅ Edit category - FIXED: Use _id instead of id
  const handleEditCategory = async (categoryData: Category) => {
    try {
      const response = await editCategory(categoryData._id, categoryData);
      if (response && response.category) {
        setCategories(prev =>
          prev.map(category =>
            category._id === categoryData._id ? { ...category, ...categoryData } : category
          )
        );
        setIsEditModalOpen(false);
        setEditingCategory(null);
      } else {
        console.error('Unexpected edit category response:', response);
      }
    } catch (error) {
      console.error('Error editing category:', error);
    }
  };

  // ✅ Delete category - FIXED: Use _id instead of id
  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      // ✅ Optimistic UI update
      const previousCategories = [...categories];
      setCategories(prev => prev.filter(cat => cat._id !== category._id));

      try {
        await deleteCategory(category._id);
        console.log("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);
        // ❌ Revert UI if deletion fails
        setCategories(previousCategories);
        alert("Failed to delete category. Please try again.");
      }
    }
  };


  // ✅ Handle edit button click
  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchCategories();
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
            placeholder="Search categories..."
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
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50 transition-colors"> {/* FIXED: Use _id for key */}
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
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Showing {filteredCategories.length} of {categories.length} categories</span>
      </div>

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