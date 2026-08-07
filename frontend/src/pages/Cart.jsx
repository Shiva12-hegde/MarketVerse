import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, discountedPrice, calculateCartTotals } from '../utils/format';
import { getProductImage, handleImageError } from '../utils/imageFallback';
import Button from '../components/ui/Button';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { cart, fetchCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const summary = calculateCartTotals(cart);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please register or login to place an order', 'info');
      navigate('/register?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  if (!summary.items.length) {
    return (
      <div className="container-app py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold">Your cart is empty</h2>
        <p className="mb-6 text-gray-500">Browse our marketplace to find products</p>
        <Link to="/marketplace"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart ({summary.itemCount} items)</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {summary.items.map((item) => {
            if (!item.product) return null;
            const price = discountedPrice(item.product.price, item.product.discount);
            return (
              <div key={item.product._id} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                <img
                  src={getProductImage(item.product)}
                  onError={(e) => handleImageError(e, item.product?.category)}
                  alt={item.product.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <Link to={`/products/${item.product._id}`} className="font-medium text-gray-900 hover:text-brand-600">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500">{item.product.supplier?.businessName}</p>
                  <p className="mt-1 font-semibold">{formatPrice(price)}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1.5 hover:bg-gray-50">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1.5 hover:bg-gray-50">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product._id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatPrice(price * item.quantity)}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 h-fit">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax (18% GST)</span><span>{formatPrice(summary.tax)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>{formatPrice(summary.total)}</span>
            </div>
          </div>
          <Button onClick={handleCheckout} className="w-full mt-6" size="lg">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
