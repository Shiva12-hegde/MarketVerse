import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Heart, User, MapPin } from 'lucide-react';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
  }`;

export default function BuyerSidebar() {
  return (
    <nav className="space-y-1 rounded-xl border border-gray-200 bg-white p-3">
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Buyer</p>
      <NavLink to="/buyer" end className={linkClass}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
      <NavLink to="/buyer/orders" className={linkClass}><ShoppingBag className="h-4 w-4" /> Orders</NavLink>
      <NavLink to="/wishlist" className={linkClass}><Heart className="h-4 w-4" /> Wishlist</NavLink>
      <NavLink to="/cart" className={linkClass}><Package className="h-4 w-4" /> Cart</NavLink>
      <NavLink to="/buyer/profile" className={linkClass}><User className="h-4 w-4" /> Profile</NavLink>
      <NavLink to="/buyer/addresses" className={linkClass}><MapPin className="h-4 w-4" /> Addresses</NavLink>
    </nav>
  );
}
