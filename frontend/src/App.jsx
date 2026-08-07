import { Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Layout, { DashboardLayout } from './components/layout/Layout';
import BuyerSidebar from './components/layout/BuyerSidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Categories from './pages/Categories';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Bill from './pages/Bill';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrders from './pages/buyer/BuyerOrders';
import BuyerProfile from './pages/buyer/BuyerProfile';
import BuyerAddresses from './pages/buyer/BuyerAddresses';
import Wishlist from './pages/buyer/Wishlist';
import SupplierLayout from './pages/supplier/SupplierLayout';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import SupplierProducts from './pages/supplier/SupplierProducts';
import SupplierProductForm from './pages/supplier/SupplierProductForm';
import AdminDashboard from './pages/admin/AdminDashboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false } },
});

function NotFound() {
  return <div className="container-app py-24 text-center"><h1 className="text-3xl">Page not found</h1><p className="mt-2 text-gray-500">The page you requested does not exist.</p></div>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider><CartProvider><ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="categories" element={<Categories />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<ProtectedRoute roles={['buyer', 'admin']}><Checkout /></ProtectedRoute>} />
            <Route path="bill/:orderId" element={<Bill />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route element={<ProtectedRoute roles={['buyer', 'admin']}><DashboardLayout sidebar={<BuyerSidebar />} /></ProtectedRoute>}>
              <Route path="buyer" element={<BuyerDashboard />} />
              <Route path="buyer/orders" element={<BuyerOrders />} />
              <Route path="buyer/orders/:id" element={<BuyerOrders />} />
              <Route path="buyer/profile" element={<BuyerProfile />} />
              <Route path="buyer/addresses" element={<BuyerAddresses />} />
              <Route path="buyer/wishlist" element={<Wishlist />} />
            </Route>
          </Route>
          <Route path="supplier" element={<SupplierLayout />}>
            <Route index element={<SupplierDashboard />} />
            <Route path="products" element={<SupplierProducts />} />
            <Route path="products/new" element={<SupplierProductForm />} />
            <Route path="products/:id/edit" element={<SupplierProductForm />} />
            <Route path="inventory" element={<SupplierProducts />} />
            <Route path="analytics" element={<SupplierDashboard />} />
            <Route path="orders" element={<SupplierDashboard />} />
            <Route path="profile" element={<SupplierDashboard />} />
          </Route>
          <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider></CartProvider></AuthProvider>
    </QueryClientProvider>
  );
}
