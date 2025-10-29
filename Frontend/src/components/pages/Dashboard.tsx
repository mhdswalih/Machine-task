import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Dashboard as fetchDashboardApi } from '../../api/adminApi';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface Metric {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  trend: number;
  isPositive: boolean;
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetchDashboardApi();
      console.log(response, 'THIS IS DASHBOARD DATA');
      setDashboardData(response as DashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Prepare metrics data when dashboardData is available
  const metrics: Metric[] = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      trend: 12, // You can calculate this from your data if available
      isPositive: true
    },
    {
      title: 'Total Products',
      value: dashboardData.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      trend: 8,
      isPositive: true
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      trend: -3,
      isPositive: false
    },
    {
      title: 'Total Revenue',
      value: `$${dashboardData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      trend: 15,
      isPositive: true
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
          <p className="text-slate-600 mb-4">Unable to load dashboard data</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Welcome to your admin dashboard</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.isPositive ? (
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                    ) : (
                      <TrendingDown size={16} className="text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.isPositive ? '+' : ''}{metric.trend}% from last month
                    </span>
                  </div>
                </div>
                <div className={`${metric.color} rounded-lg p-3`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;