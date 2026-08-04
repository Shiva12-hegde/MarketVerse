import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { formatPrice, orderStatusLabel, orderStatusColor } from '../../utils/format';
import Button from '../../components/ui/Button';

export default function BuyerOrders() {
  const { id } = useParams();

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders/my').then((r) => r.data.orders),
    enabled: !id,
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data.order),
    enabled: !!id,
  });

  if (id && orderDetail) {
    return (
      <div>
        <Link to="/buyer/orders" className="mb-4 inline-block text-sm text-brand-600 hover:text-brand-700">← Back to orders</Link>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">{orderDetail.orderNumber}</h1>
              <p className="text-sm text-gray-500">Placed on {new Date(orderDetail.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${orderStatusColor[orderDetail.status]}`}>
              {orderStatusLabel[orderDetail.status]}
            </span>
          </div>

          <div className="mb-6 space-y-3">
            {orderDetail.items.map((item, i) => (
              <div key={i} className="flex gap-4 rounded-lg border border-gray-100 p-3">
                <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm font-medium">Shipping Address</p>
              <p className="text-sm text-gray-600">
                {orderDetail.shippingAddress.fullName}<br />
                {orderDetail.shippingAddress.street}<br />
                {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state} {orderDetail.shippingAddress.zipCode}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-1 text-sm font-medium">Order Total</p>
              <p className="text-2xl font-bold">{formatPrice(orderDetail.total)}</p>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-3 font-medium">Order Timeline</p>
            <div className="space-y-3">
              {orderDetail.timeline?.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{t.status.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{t.note} · {new Date(t.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
      {!orders?.length ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <p className="text-gray-500 mb-4">No orders yet</p>
          <Link to="/marketplace"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order._id} to={`/buyer/orders/${order._id}`} className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-brand-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items · {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${orderStatusColor[order.status]}`}>
                    {orderStatusLabel[order.status]}
                  </span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
