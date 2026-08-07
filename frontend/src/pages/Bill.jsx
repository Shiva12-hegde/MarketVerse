import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, ShoppingBag, Package } from 'lucide-react';
import { formatPrice, discountedPrice } from '../utils/format';
import Button from '../components/ui/Button';

export default function Bill() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const found = storedOrders.find((o) => o._id === orderId);
    if (found) {
      setOrder(found);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="container-app py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold">Bill Not Found</h2>
        <p className="mb-6 text-gray-500">We couldn't locate the invoice for order #{orderId}.</p>
        <Link to="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const invoiceDate = new Date(Number(order._id) || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container-app py-8">
      {/* Top Controls (Hidden on Print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </button>
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="accent" className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print / Download Bill
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Success Banner */}
        <div className="mb-8 flex items-center gap-4 rounded-xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200 print:hidden">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
          <div>
            <h2 className="font-bold text-base">Payment Confirmed & Order Placed!</h2>
            <p className="text-xs text-emerald-700">Thank you for shopping with MarketVerse AI. Your tax invoice is detailed below.</p>
          </div>
        </div>

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-gray-200 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-extrabold text-2xl tracking-tight mb-2">
              <Package className="h-7 w-7" /> MarketVerse AI
            </div>
            <p className="text-xs text-gray-500">Official B2B & B2C Tax Invoice / Bill</p>
            <p className="text-xs text-gray-500">GSTIN: 29AAAAA0000A1Z5</p>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-xl font-bold text-gray-900 mb-1">TAX INVOICE</h1>
            <p className="text-sm font-medium text-gray-700">Invoice No: <span className="font-mono font-bold">INV-{order._id.slice(-6).toUpperCase()}</span></p>
            <p className="text-xs text-gray-500">Date: {invoiceDate}</p>
            <p className="text-xs text-gray-500">Payment Status: <span className="font-semibold text-emerald-600">Pending (COD)</span></p>
          </div>
        </div>

        {/* Customer & Billing Details */}
        <div className="grid gap-6 sm:grid-cols-2 py-6 border-b border-gray-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed To (Customer)</h3>
            <p className="text-sm font-bold text-gray-900">{order.shippingAddress?.fullName || 'Valued Customer'}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
            <p className="text-sm text-gray-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
            <p className="text-sm text-gray-600">Phone: {order.shippingAddress?.phone}</p>
          </div>
          <div className="sm:text-right">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Supplier Info</h3>
            <p className="text-sm font-bold text-gray-900">MarketVerse Direct Merchants</p>
            <p className="text-sm text-gray-600">100 Tech Park, MG Road</p>
            <p className="text-sm text-gray-600">Bengaluru, Karnataka - 560001</p>
            <p className="text-sm text-gray-600">support@marketverse.ai</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {order.items?.map((item, index) => {
                const price = discountedPrice(item.product?.price || 0, item.product?.discount || 0);
                return (
                  <tr key={index}>
                    <td className="py-4 px-4 text-gray-400 font-mono">{index + 1}</td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-500">Category: {item.product?.category || 'General'}</p>
                    </td>
                    <td className="py-4 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">{formatPrice(price)}</td>
                    <td className="py-4 px-4 text-right font-semibold">{formatPrice(price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col sm:flex-row justify-end border-t border-gray-200 pt-6">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">{formatPrice(order.summary?.subtotal || 0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST / Taxes (18%):</span>
              <span className="font-medium text-gray-900">{formatPrice(order.summary?.tax || 0)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee:</span>
              <span className="font-medium text-gray-900">{order.summary?.shipping === 0 ? 'FREE' : formatPrice(order.summary?.shipping || 0)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
              <span>Total Amount:</span>
              <span className="text-brand-600">{formatPrice(order.summary?.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Footer Terms */}
        <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          <p className="mb-1">This is a computer-generated tax invoice and requires no physical signature.</p>
          <p>Thank you for buying on MarketVerse AI — Smart B2B & B2C Commerce Platform.</p>
        </div>
      </div>
    </div>
  );
}
