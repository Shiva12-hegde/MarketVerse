export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const discountedPrice = (price, discount = 0) => price - (price * discount) / 100;

export const calculateCartTotals = (cart) => {
  const items = (cart?.items || []).filter((item) => item.product);
  const subtotal = items.reduce(
    (sum, item) => sum + discountedPrice(item.product.price, item.product.discount) * item.quantity,
    0,
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal === 0 || subtotal > 500 ? 0 : 49;
  return { items, itemCount, subtotal, tax, shipping, total: subtotal + tax + shipping };
};

export const cn = (...classes) => classes.filter(Boolean).join(' ');

export const orderStatusLabel = {
  pending: 'Pending',
  preparing: 'Preparing',
  ready_for_dispatch: 'Ready for Dispatch',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const orderStatusColor = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready_for_dispatch: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};
