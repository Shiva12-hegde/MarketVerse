import { useQuery } from '@tanstack/react-query';
import { BarChart3, IndianRupee, Package, ShoppingBag, Users } from 'lucide-react';
import api from '../../api/client';

function Metric({ icon: Icon, label, value, accent }) {
  return <div className="stat-card"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold">{value ?? '—'}</p></div><div className={`rounded-xl p-3 ${accent}`}><Icon className="h-5 w-5" /></div></div></div>;
}

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/admin/dashboard').then((r) => r.data) });
  const stats = data?.stats;
  if (isLoading) return <div className="container-app py-10"><div className="skeleton h-40 w-full" /></div>;
  if (isError) return <div className="container-app py-10 text-danger-600">Unable to load platform analytics.</div>;
  return <main className="container-app py-8"><div className="mb-7"><p className="text-sm font-semibold text-brand-600">PLATFORM CONTROL</p><h1 className="text-3xl">Admin dashboard</h1><p className="mt-1 text-gray-500">A live overview of marketplace health and growth.</p></div><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={IndianRupee} label="GMV" value={`₹${(stats?.gmv || 0).toLocaleString('en-IN')}`} accent="bg-success-50 text-success-600" /><Metric icon={Users} label="Active users" value={stats?.totalUsers?.toLocaleString()} accent="bg-brand-50 text-brand-600" /><Metric icon={Package} label="Active products" value={stats?.totalProducts?.toLocaleString()} accent="bg-purple-50 text-purple-600" /><Metric icon={ShoppingBag} label="Total orders" value={stats?.totalOrders?.toLocaleString()} accent="bg-accent-50 text-accent-600" /></section><section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="card p-5"><h2 className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-brand-600" />Monthly revenue</h2><div className="mt-5 space-y-3">{data?.monthlyRevenue?.length ? data.monthlyRevenue.map((item) => <div key={`${item._id.year}-${item._id.month}`} className="flex items-center justify-between text-sm"><span>{item._id.month}/{item._id.year}</span><strong>₹{item.revenue.toLocaleString('en-IN')}</strong></div>) : <p className="text-sm text-gray-500">No revenue has been recorded yet.</p>}</div></div><div className="card p-5"><h2 className="text-lg">Top products</h2><div className="mt-5 space-y-3">{data?.topProducts?.map((product) => <div key={product._id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium">{product.name}</span><span className="shrink-0 text-gray-500">{product.salesCount || 0} sold</span></div>)}</div></div></section></main>;
}
