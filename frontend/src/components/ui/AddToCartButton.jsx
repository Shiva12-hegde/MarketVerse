import React from 'react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';

export default function AddToCartButton({ productId }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleAdd = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    try {
      await addToCart(productId, 1);
      showToast?.('Added to cart!');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to add to cart', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" loading={loading} onClick={handleAdd}>Add to Cart</Button>
  );
}
