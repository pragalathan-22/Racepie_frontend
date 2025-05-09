import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  // Load cart data from storage on mount
  useEffect(() => {
    loadCartData();
  }, []);

  // Save cart data whenever it changes
  useEffect(() => {
    saveCartData();
  }, [cartItems, cartId]);

  const loadCartData = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      const storedCartId = await AsyncStorage.getItem('cartId');
      
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      if (storedCartId) {
        setCartId(storedCartId);
      } else {
        // Generate new cart ID if none exists
        const newCartId = generateCartId();
        setCartId(newCartId);
        await AsyncStorage.setItem('cartId', newCartId);
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
    }
  };

  const saveCartData = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      if (cartId) {
        await AsyncStorage.setItem('cartId', cartId);
      }
    } catch (error) {
      console.error('Error saving cart data:', error);
    }
  };

  const generateCartId = () => {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, { ...item, cartId }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Generate new cart ID when clearing cart
    const newCartId = generateCartId();
    setCartId(newCartId);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemRate = parseFloat(item.rate) || 0;
      return total + itemRate * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 