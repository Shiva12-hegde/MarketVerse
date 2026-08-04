import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { calculateCartTotals, formatPrice } from '../utils/format';
import Input, { Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  useEffect(() => { fetchCart(); }, [fetchCart]);
  const summary = calculateCartTotals(cart);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const shippingAddress = {
        fullName: data.fullName,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: 'India',
      };
      const res = await api.post('/orders', {
        shippingAddress,
        billingAddress: shippingAddress,
        paymentMethod: data.paymentMethod || 'cod',
        notes: data.notes,
      });
      await fetchCart();
      showToast('Order placed successfully!');
      navigate(`/buyer/orders/${res.data.order._id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" {...register('fullName', { required: true })} />
              <Input label="Phone" {...register('phone', { required: true })} />
              <div className="sm:col-span-2"><Input label="Street Address" {...register('street', { required: true })} /></div>
              <Input label="City" {...register('city', { required: true })} />
              <Input label="State" {...register('state', { required: true })} />
              <Input label="PIN Code" {...register('zipCode', { required: true })} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold">Payment Method</h2>
            <label className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 p-4">
              <input type="radio" value="cod" {...register('paymentMethod')} defaultChecked />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm text-gray-500">Pay when you receive your order</p>
              </div>
            </label>
          </div>

          <Textarea label="Order Notes (optional)" {...register('notes')} />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 h-fit">
          <h2 className="mb-4 font-semibold">Order Summary</h2>
          <div className="space-y-2 text-sm mb-6">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(summary.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(summary.tax)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{summary.shipping === 0 ? 'FREE' : formatPrice(summary.shipping)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span><span>{formatPrice(summary.total)}</span>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" loading={loading}>Place Order</Button>
        </div>
      </form>
    </div>
  );
}
