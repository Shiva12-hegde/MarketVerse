import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, Package, Clock } from 'lucide-react';
import api from '../../api/client';
import ProductCard from '../../components/product/ProductCard';
import { formatPrice, orderStatusLabel, orderStatusColor } from '../../utils/format';

export default function BuyerDashboard() {
  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      try {
        const r = await api.get('/orders/my');
        return r.data.orders;
      } catch {
        const local = JSON.parse(localStorage.getItem('orders') || '[]');
        return local.map((o) => ({
          _id: o._id,
          orderNumber: `ORD-${o._id.slice(-6).toUpperCase()}`,
          status: 'pending',
          createdAt: Number(o._id) || Date.now(),
          total: o.summary?.total || 0,
          items: o.items || [],
        }));
      }
    },
  });

  const { data: personalized } = useQuery({
    queryKey: ['personalized'],
    queryFn: async () => {
      try {
        const r = await api.get('/ai/personalized');
        return r.data.products;
      } catch {
        const { mockProducts } = await import('../../api/mockData');
        return mockProducts.slice(0, 4);
      }
    },
  });

  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Buyer Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShoppingBag, label: 'Total Orders', value: orders?.length || 0, color: 'bg-blue-50 text-blue-600' },
          { icon: Clock, label: 'Pending', value: orders?.filter((o) => o.status === 'pending').length || 0, color: 'bg-yellow-50 text-yellow-600' },
          { icon: Package, label: 'Completed', value: orders?.filter((o) => o.status === 'completed').length || 0, color: 'bg-green-50 text-green-600' },
          { icon: Heart, label: 'Wishlist', value: '—', color: 'bg-red-50 text-red-600', link: '/wishlist' },
        ].map(({ icon: Icon, label, value, color, link }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-5">
            {link ? (
              <Link to={link}>
                <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </Link>
            ) : (
              <>
                <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link to="/buyer/orders" className="text-sm text-brand-600 hover:text-brand-700">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order._id} to={`/buyer/orders/${order._id}`} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-300">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items · {formatPrice(order.total)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColor[order.status]}`}>
                  {orderStatusLabel[order.status]}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {personalized?.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recommended for You</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {personalized.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
