import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isBuyer } = useAuth();
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isBuyer) return;
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
      setItemCount(data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
    } catch {
      setCart(null);
      setItemCount(0);
    }
  }, [isAuthenticated, isBuyer]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setCart(data.cart);
    setItemCount(data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put('/cart/update', { productId, quantity });
    setCart(data.cart);
    setItemCount(data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data.cart);
    setItemCount(data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0);
  };

  return (
    <CartContext.Provider value={{ cart, itemCount, fetchCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
