import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Sparkles, Bell, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import AISearchBar from '../search/AISearchBar';

export default function Navbar() {
  const { user, isAuthenticated, isBuyer, isSupplier, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLink = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app">
        <div className="flex min-h-16 items-center justify-between gap-4 py-2 md:min-h-24 md:py-1">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Market<span className="text-brand-600">Verse</span>
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <AISearchBar />
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            <NavLink to="/marketplace" className={navLink}>Marketplace</NavLink>
            <NavLink to="/categories" className={navLink}>Categories</NavLink>
            {isSupplier && <NavLink to="/supplier" className={navLink}>Supplier Hub</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navLink}>Admin</NavLink>}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && isBuyer && (
              <>
                <Link to="/wishlist" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to="/cart" className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="group relative">
                <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                </button>
                <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                  {isBuyer && (
                    <>
                      <Link to="/buyer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                      <Link to="/buyer/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                    </>
                  )}
                  {isSupplier && (
                    <Link to="/supplier" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Supplier Dashboard</Link>
                  )}
                  <Link to="/buyer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                  Register
                </Link>
              </div>
            )}

            <button className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-200 py-4 lg:hidden">
            <AISearchBar />
            <nav className="mt-4 flex flex-col gap-2">
              <NavLink to="/marketplace" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Marketplace</NavLink>
              <NavLink to="/categories" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Categories</NavLink>
              {!isAuthenticated && (
                <NavLink to="/login" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Login</NavLink>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
