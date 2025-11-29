import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch shipping fee on mount
  useEffect(() => {
    const fetchShippingFee = async () => {
      try {
        const { data } = await api.get('/admin/shipping-fees');
        setShippingFee(data.amount || 0);
      } catch (err) {
        console.error('Failed to fetch shipping fee:', err);
        setShippingFee(0);
      }
    };
    fetchShippingFee();
  }, []);

  const addToCart = (product, qty) => {
    setCartItems(prev => {
      const exist = prev.find(item => item.product._id === product._id);
      if (exist) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        return [...prev, { product, qty }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, shippingFee }}>
      {children}
    </CartContext.Provider>
  );
};