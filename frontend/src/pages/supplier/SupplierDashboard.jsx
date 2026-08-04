import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingBag, TrendingUp, Star, Plus, AlertTriangle,
  ArrowRight, ArrowUpRight, IndianRupee, Eye
} from 'lucide-react';
import api from '../../api/client';

const statusColors = {
  pending:           'badge-yellow',
  preparing:         'badge-blue',
  ready_for_dispatch:'badge-blue',
  shipped:           'badge-blue',
  completed:         'badge-green',
  cancelled:         'badge-red',
};

function StatCard({ label, value, icon: Icon, color, change, prefix = '' }) {
  return (
    <div className="stat-card animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value ?? '—'}
          </p>
          {change != null && (
            <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              <ArrowUpRight className={`h-3 w-3 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% vs last month
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function RevenueBar({ month, revenue, max }) {
  const pct = max > 0 ? (revenue / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs font-semibold text-gray-700">₹{(revenue / 1000).toFixed(1)}k</p>
      <div className="relative h-24 w-8 rounded-t bg-gray-100">
        <div
          className="absolute bottom-0 left-0 right-0 rounded-t bg-brand-600 transition-all duration-700"
          style={{ height: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-gray-500">{month}</p>
    </div>
  );
}

export default function SupplierDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['supplier-products'],
    queryFn: () => api.get('/products/supplier/mine').then((r) => r.data.products),
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['supplier-orders'],
    queryFn: () => api.get('/orders/supplier/incoming').then((r) => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['supplier-profile'],
    queryFn: () => api.get('/suppliers/profile').then((r) => r.data.supplier),
  });

  const orders = ordersData?.orders || [];
  const totalRevenue = orders
    .filter((o) => ['completed', 'shipped'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const lowStock = (products || []).filter((p) => p.stock <= 10 && p.isActive);
  const topProducts = [...(products || [])].sort((a, b) => b.salesCount - a.salesCount).slice(0, 3);

  // Build last 6 months revenue bars (mock from orders)
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthOrders = orders.filter((o) => {
      const od = new Date(o.createdAt);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    });
    return {
      month: MONTHS[d.getMonth()],
      revenue: monthOrders.reduce((s, o) => s + o.total, 0),
    };
  });
  const maxRev = Math.max(...monthlyData.map((m) => m.revenue), 1);

  const isLoading = productsLoading || ordersLoading;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's your business overview.</p>
        </div>
        <Link
          to="/supplier/products/new"
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={products?.length}
          icon={Package}
          color="bg-brand-100 text-brand-700"
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          label="Total Revenue"
          value={totalRevenue}
          icon={IndianRupee}
          color="bg-success-50 text-success-600"
          prefix="₹"
        />
        <StatCard
          label="Avg. Rating"
          value={profile?.rating ? profile.rating.toFixed(1) : '—'}
          icon={Star}
          color="bg-accent-50 text-accent-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/supplier/orders" className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1,2,3].map((i) => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state border-0 py-10">
              <ShoppingBag className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="table-container border-0 rounded-none">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Order</th>
                    <th className="table-th">Buyer</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o._id} className="table-row">
                      <td className="table-td font-mono text-xs text-gray-500">
                        #{o.orderNumber?.slice(-8)}
                      </td>
                      <td className="table-td">{o.buyer?.name || 'Buyer'}</td>
                      <td className="table-td font-semibold">₹{o.total?.toLocaleString('en-IN')}</td>
                      <td className="table-td">
                        <span className={statusColors[o.status] || 'badge-gray'}>
                          {o.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick actions + low stock */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/supplier/products/new" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <Plus className="h-4 w-4" /> Add New Product
              </Link>
              <Link to="/supplier/orders" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <ShoppingBag className="h-4 w-4" /> Manage Orders
              </Link>
              <Link to="/supplier/profile" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <Eye className="h-4 w-4" /> Edit Profile
              </Link>
              <Link to="/supplier/inventory" className="flex items-center gap-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors">
                <TrendingUp className="h-4 w-4" /> Inventory
              </Link>
            </div>
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="card border-warning-500/30 bg-warning-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-warning-500" />
                <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
                <span className="badge-yellow ml-auto">{lowStock.length}</span>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 4).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-gray-700">{p.name}</span>
                    <span className={`font-bold ${p.stock === 0 ? 'text-danger-600' : 'text-warning-500'}`}>
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/supplier/inventory" className="mt-3 block text-xs text-brand-600 hover:text-brand-700">
                View inventory →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Monthly Revenue (Last 6 Months)</h2>
        {totalRevenue === 0 ? (
          <p className="text-sm text-gray-400 py-4">No revenue data yet. Start getting orders!</p>
        ) : (
          <div className="flex items-end gap-4">
            {monthlyData.map((m) => (
              <RevenueBar key={m.month} month={m.month} revenue={m.revenue} max={maxRev} />
            ))}
          </div>
        )}
      </div>

      {/* Best selling */}
      {topProducts.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Best Selling Products</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  #{i + 1}
                </span>
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.salesCount} sold · ₹{p.price?.toLocaleString('en-IN')}</p>
                </div>
                <Link to={`/supplier/products/${p._id}/edit`} className="text-xs text-brand-600 hover:underline">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
