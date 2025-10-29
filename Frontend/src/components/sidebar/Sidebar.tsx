import { useState } from 'react';
import { Users, Package, Layers, ShoppingCart, Menu, X, LayoutDashboard } from 'lucide-react';
import Dashboard from '../pages/Dashboard';
import UserTable from '../pages/UserTable';
import Products from '../pages/Products';
import OrderTable from '../pages/OrderTable';
import Category from '../pages/Category';

type TabId = 'dashboard' | 'users' | 'products' | 'category' | 'orders';

interface MenuItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'category', label: 'Category', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingCart }
  ];

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard  />;
      case 'users':
        return <UserTable />;
      case 'products':
        return <Products />;
      case 'category':
        return <Category />;
      case 'orders':
        return <OrderTable />;
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`bg-slate-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} relative`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isOpen && <h1 className="text-xl font-bold">Food Delivery Admin Panel</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item: MenuItem) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                    aria-current={activeTab === item.id ? 'page' : undefined}
                  >
                    <Icon size={20} />
                    {isOpen && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <p className="font-medium">Admin User</p>
                <p className="text-xs text-slate-400">admin@example.com</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-slate-50 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;