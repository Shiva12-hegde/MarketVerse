import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, User, BarChart3 } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function SupplierSidebar() {
  return (
    <nav className="space-y-1 rounded-xl border border-gray-200 bg-white p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Supplier</p>
      <NavLink to="/supplier" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
      <NavLink to="/supplier/products" className={linkClass}><Package className="h-4 w-4" /> Products</NavLink>
      <NavLink to="/supplier/products/new" className={linkClass}><Package className="h-4 w-4" /> Add Product</NavLink>
      <NavLink to="/supplier/orders" className={linkClass}><ShoppingBag className="h-4 w-4" /> Orders</NavLink>
      <NavLink to="/supplier/profile" className={linkClass}><User className="h-4 w-4" /> Business Profile</NavLink>
      <NavLink to="/supplier/analytics" className={linkClass}><BarChart3 className="h-4 w-4" /> Analytics</NavLink>
    </nav>
  );
}
