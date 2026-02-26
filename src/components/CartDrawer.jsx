import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, updateQuantity, removeFromCart, itemCount } = useCart();
  const { user } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            className="cart-drawer glass-strong"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-header">
              <h2><ShoppingBag size={20} /> Cart ({itemCount})</h2>
              <button className="btn-icon nav-action-btn" onClick={() => setIsOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                  <Link to="/catalog" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p className="cart-item-price">${item.price.toFixed(2)}</p>
                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total</span>
                  <span className="cart-total-amount">${total.toFixed(2)}</span>
                </div>
                <Link
                  to={user ? '/checkout' : '/login'}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setIsOpen(false)}
                >
                  {user ? 'Checkout' : 'Sign in to Checkout'} <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
