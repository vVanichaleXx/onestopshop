import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const API = 'http://localhost:3001/api';

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = token 
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };

  // Load cart from server or localStorage
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setItems(parsed);
        setTotal(parsed.reduce((s, i) => s + i.price * i.quantity, 0));
      }
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API}/cart`, { headers });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
    } catch(e) { /* silent */ }
  };

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      try {
        const res = await fetch(`${API}/cart`, {
          method: 'POST', headers,
          body: JSON.stringify({ product_id: product.id, quantity })
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } catch(e) { /* silent */ }
    } else {
      // Guest cart
      setItems(prev => {
        const existing = prev.find(i => i.product_id === product.id);
        let updated;
        if (existing) {
          updated = prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          updated = [...prev, { id: Date.now(), product_id: product.id, name: product.name, price: product.price, image: product.image, quantity }];
        }
        localStorage.setItem('cart', JSON.stringify(updated));
        setTotal(updated.reduce((s, i) => s + i.price * i.quantity, 0));
        return updated;
      });
    }
    setIsOpen(true);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (token) {
      try {
        const res = await fetch(`${API}/cart/${itemId}`, {
          method: 'PUT', headers,
          body: JSON.stringify({ quantity })
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } catch(e) { /* silent */ }
    } else {
      setItems(prev => {
        const updated = quantity < 1 
          ? prev.filter(i => i.id !== itemId)
          : prev.map(i => i.id === itemId ? { ...i, quantity } : i);
        localStorage.setItem('cart', JSON.stringify(updated));
        setTotal(updated.reduce((s, i) => s + i.price * i.quantity, 0));
        return updated;
      });
    }
  };

  const removeFromCart = async (itemId) => {
    if (token) {
      try {
        const res = await fetch(`${API}/cart/${itemId}`, {
          method: 'DELETE', headers
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } catch(e) { /* silent */ }
    } else {
      setItems(prev => {
        const updated = prev.filter(i => i.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(updated));
        setTotal(updated.reduce((s, i) => s + i.price * i.quantity, 0));
        return updated;
      });
    }
  };

  const clearCart = () => {
    setItems([]);
    setTotal(0);
    localStorage.removeItem('cart');
  };

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, itemCount, isOpen, setIsOpen, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
