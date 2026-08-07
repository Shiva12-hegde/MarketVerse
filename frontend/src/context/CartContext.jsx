import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isBuyer } = useAuth();
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : { items: [] };
  });
  const [itemCount, setItemCount] = useState(() => {
    const stored = localStorage.getItem('itemCount');
    return stored ? JSON.parse(stored) : 0;
  });

  const saveCartState = (newCart) => {
    const validCart = newCart && Array.isArray(newCart.items) ? newCart : { items: [] };
    setCart(validCart);
    const count = validCart.items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
    setItemCount(count);
    localStorage.setItem('cart', JSON.stringify(validCart));
    localStorage.setItem('itemCount', JSON.stringify(count));
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) return;
    try {
      const { data } = await api.get('/cart');
      if (data.cart?.items) {
        saveCartState(data.cart);
      }
    } catch {
      // Keep existing local cart
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart/add', { productId, quantity });
      if (data.cart) saveCartState(data.cart);
      return data;
    } catch {
      const { mockProducts } = await import('../api/mockData');
      const product = mockProducts.find((p) => p._id === productId) || {
        _id: productId,
        name: 'Featured Product',
        price: 4999,
        discount: 10,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
      };

      const storedCart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
      const currentItems = Array.isArray(storedCart?.items) ? [...storedCart.items] : [];
      const existingIdx = currentItems.findIndex((i) => (i.product?._id || i.product) === productId);
      if (existingIdx > -1) {
        currentItems[existingIdx].quantity += quantity;
      } else {
        currentItems.push({ product, quantity });
      }

      const updatedCart = { items: currentItems };
      saveCartState(updatedCart);
      return { cart: updatedCart };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
    } catch {}
    saveCartState({ items: [] });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    try {
      const { data } = await api.put('/cart/update', { productId, quantity });
      if (data.cart) saveCartState(data.cart);
    } catch {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
      const currentItems = Array.isArray(storedCart?.items) ? [...storedCart.items] : [];
      const idx = currentItems.findIndex((i) => (i.product?._id || i.product) === productId);
      if (idx > -1) {
        currentItems[idx].quantity = quantity;
        saveCartState({ items: currentItems });
      }
    }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      if (data.cart) saveCartState(data.cart);
    } catch {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
      const currentItems = Array.isArray(storedCart?.items)
        ? storedCart.items.filter((i) => (i.product?._id || i.product) !== productId)
        : [];
      saveCartState({ items: currentItems });
    }
  };

  return (
    <CartContext.Provider value={{ cart, itemCount, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
