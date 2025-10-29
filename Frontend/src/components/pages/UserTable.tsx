import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import AddUserModal from '../modals/user/AddUser';
import EditUserModal from '../modals/user/EditUser';
import { addUser, deleteUser, editUser, getAllUsers } from '../../api/adminApi';
import type { IUser } from '../../types/AddUser';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
  message: string;
}

const UserTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch users with search and pagination
  const fetchUsers = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    try {
      const response = await getAllUsers(page, search);
      if (response && response.users) {
        const cleanedUsers = response.users.map((user: any) => ({
          _id: user._id,
          name: user.name || 'No Name',
          email: user.email || 'No Email',
          phone: user.phone || 'No Phone',
        }));
        setUsers(cleanedUsers);
        setPagination(response.pagination);
        toast.success(response.message || 'Users loaded successfully');
      } else {
        console.error('Unexpected response structure:', response);
        setUsers([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false,
          limit: 10
        });
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false,
        limit: 10
      });
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, searchTerm);
    }
  };

  useEffect(() => {
    fetchUsers(1, '');
  }, []);

  // ✅ Add new user
  const handleAddUser = async (userData: { name: string; email: string; phone: string }) => {
    try {
      const response = await addUser(userData as IUser);
      if (response && response.user) {
        // Refresh the current page to show the new user
        fetchUsers(pagination.currentPage, searchTerm);
        setIsAddModalOpen(false);
        toast.success('User added successfully');
      } else {
        console.error('Unexpected add user response:', response);
        toast.error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  // ✅ Edit user
  const handleEditUser = async (userData: { _id: string; name: string; email: string; phone: string }) => {
    try {
      if (editingUser) {
        await editUser(userData._id, userData as IUser);
        // Refresh the current page to reflect changes
        fetchUsers(pagination.currentPage, searchTerm);
        setIsEditModalOpen(false);
        setEditingUser(null);
        toast.success('User updated successfully');
      }
    } catch (error) {
      console.error('Error editing user:', error);
      toast.error('Failed to update user');
    }
  };

  // ✅ Delete user
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // ✅ Optimistic UI update
      const previousUsers = [...users];
      const previousPagination = { ...pagination };
      
      setUsers(prev => prev.filter(user => user._id !== id));
      setPagination(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1
      }));

      try {
        await deleteUser(id);
        toast.success('User deleted successfully');
        
        // If this was the last item on the page and not the first page, go to previous page
        if (users.length === 1 && pagination.currentPage > 1) {
          fetchUsers(pagination.currentPage - 1, searchTerm);
        } else {
          fetchUsers(pagination.currentPage, searchTerm);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        // ❌ Revert UI if deletion fails
        setUsers(previousUsers);
        setPagination(previousPagination);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
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

  return (
    <>
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Users</h2>
          <p className="text-slate-600">Manage your user accounts</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add User Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add User</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {(user.name || 'N').charAt(0).toUpperCase()}
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-900">{user.name || 'No Name'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.email || 'No Email'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.phone || 'No Phone'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          aria-label="Edit user"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
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
              Showing {users.length} of {pagination.totalUsers} users
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
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
        onEdit={handleEditUser}
        user={editingUser}
      />
    </>
  );
};

export default UserTable;