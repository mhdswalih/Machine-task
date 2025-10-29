import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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

const UserTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Filtered users based on search term
  const filteredUsers = users.filter((user) => {
    const name = user.name || '';
    const email = user.email || '';
    const phone = user.phone || '';

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)
    );
  });

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response && response.users) {
        const cleanedUsers = response.users.map((user: any) => ({
          _id: user._id,
          name: user.name || 'No Name',
          email: user.email || 'No Email',
          phone: user.phone || 'No Phone',
        }));
        setUsers(cleanedUsers);
        toast.success('Users loaded successfully');
      } else {
        console.error('Unexpected response structure:', response);
        setUsers([]);
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Add new user
  const handleAddUser = async (userData: { name: string; email: string; phone: string }) => {
    try {
      const response = await addUser(userData as IUser);
      if (response && response.user) {
        const newUser: User = response.user;
        setUsers((prev) => [...prev, newUser]);
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
        setUsers((prev) =>
          prev.map((user) =>
            user._id === editingUser._id ? { ...user, ...userData } : user
          )
        );
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
  const handleDelete = async(id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter((user) => user._id !== id));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
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
              placeholder="Search users..."
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
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
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>Showing {filteredUsers.length} of {users.length} users</span>
        </div>
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