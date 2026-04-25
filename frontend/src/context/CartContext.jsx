import { createContext, useContext, useState, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await cartAPI.get();
      setItems(data.items);
      setSummary(data.summary);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1, isBulk = false) => {
    try {
      await cartAPI.add({ productId, quantity, isBulk });
      await fetchCart();
      return true;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to add to cart';
    }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setItems([]);
      setSummary({ subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 0 });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{ items, summary, loading, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
