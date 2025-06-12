import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/chat';
import { CartItem } from '@/types/chat';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.id === newItem.id && item.color === newItem.color
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
        };
        return updatedItems;
      }

      // Add new item
      return [...currentItems, newItem];
    });
  };

  const removeItem = (id: string, color?: string) => {
    setItems(currentItems => 
      currentItems.filter(item => !(item.id === id && item.color === color))
    );
  };

  const updateQuantity = (id: string, quantity: number, color?: string) => {
    setItems(currentItems => {
      if (quantity <= 0) {
        return currentItems.filter(item => !(item.id === id && item.color === color));
      }

      return currentItems.map(item =>
        item.id === id && item.color === color
          ? { ...item, quantity }
          : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 