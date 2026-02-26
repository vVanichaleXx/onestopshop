import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const API = 'http://localhost:3001/api';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  
  const [form, setForm] = useState({
    shipping_name: user?.name || '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    shipping_phone: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardName: ''
  });

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: { pathname: '/checkout' } } });
    if (items.length === 0 && step !== 3) navigate('/catalog');
  }, [user, items, navigate, step]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear specific error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    
    // Formatting
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) {
        value = `${value.substring(0, 2)}/${value.substring(2)}`;
      }
    } else if (name === 'cvc') {
      value = value.replace(/\D/g, '').substring(0, 4);
    } else if (name === 'cardName') {
      value = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
    }

    setPaymentForm({ ...paymentForm, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!form.shipping_name.trim() || form.shipping_name.trim().length < 3) {
      newErrors.shipping_name = 'Full name must be at least 3 characters long';
    }
    if (!form.shipping_address.trim() || form.shipping_address.trim().length < 5) {
      newErrors.shipping_address = 'Please enter a valid street address';
    }
    if (!form.shipping_city.trim() || form.shipping_city.trim().length < 2) {
      newErrors.shipping_city = 'City name is required';
    }
    if (!form.shipping_zip.trim() || !/^[A-Za-z0-9\s-]{3,10}$/.test(form.shipping_zip)) {
      newErrors.shipping_zip = 'Please enter a valid ZIP/Postal code';
    }
    if (!form.shipping_phone.trim() || !/^\+?[0-9\s\-\(\)]{8,20}$/.test(form.shipping_phone)) {
      newErrors.shipping_phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    const cleanCard = paymentForm.cardNumber.replace(/\s/g, '');
    
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      newErrors.cardNumber = 'Card number must be 15 or 16 digits';
    }
    
    if (paymentForm.expiry.length !== 5) {
      newErrors.expiry = 'Expiry date must be MM/YY';
    } else {
      const [month, year] = paymentForm.expiry.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(`20${year}`, 10);
      const now = new Date();
      
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiry = 'Invalid month';
      } else if (yearNum < now.getFullYear() || (yearNum === now.getFullYear() && monthNum < now.getMonth() + 1)) {
        newErrors.expiry = 'Card has expired';
      }
    }

    if (paymentForm.cvc.length < 3) {
      newErrors.cvc = 'CVC must be 3 or 4 digits';
    }
    
    if (!paymentForm.cardName.trim() || paymentForm.cardName.trim().length < 3) {
      newErrors.cardName = 'Name on card is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setLoading(true);
    setServerError('');

    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, payment_method: 'credit_card' })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Checkout failed');
      }

      clearCart();
      setStep(3);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Secure <span style={{ color: 'var(--accent)' }}>Checkout</span>
        </motion.h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-icon"><Truck size={18} /></div>
            <span>Delivery</span>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-icon"><CreditCard size={18} /></div>
            <span>Payment</span>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-icon"><CheckCircle size={18} /></div>
            <span>Complete</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        {step !== 3 && (
          <div className="checkout-main">
            {serverError && <div className="checkout-error"><AlertCircle size={18}/> {serverError}</div>}
            
            <AnimateStep step={step} currentStep={1}>
              <form onSubmit={handleShippingSubmit} className="checkout-form glass" noValidate>
                <h2>Delivery Details</h2>
                
                <div className={`input-group ${errors.shipping_name ? 'has-error' : ''}`}>
                  <label>Full Name</label>
                  <input type="text" name="shipping_name" className="input" value={form.shipping_name} onChange={handleChange} placeholder="e.g. John Doe" />
                  {errors.shipping_name && <span className="error-text">{errors.shipping_name}</span>}
                </div>
                
                <div className={`input-group ${errors.shipping_address ? 'has-error' : ''}`}>
                  <label>Street Address</label>
                  <input type="text" name="shipping_address" className="input" value={form.shipping_address} onChange={handleChange} placeholder="e.g. 123 Main St, Apt 4B" />
                  {errors.shipping_address && <span className="error-text">{errors.shipping_address}</span>}
                </div>
                
                <div className="form-row">
                  <div className={`input-group ${errors.shipping_city ? 'has-error' : ''}`}>
                    <label>City</label>
                    <input type="text" name="shipping_city" className="input" value={form.shipping_city} onChange={handleChange} placeholder="e.g. New York" />
                    {errors.shipping_city && <span className="error-text">{errors.shipping_city}</span>}
                  </div>
                  <div className={`input-group ${errors.shipping_zip ? 'has-error' : ''}`}>
                    <label>ZIP / Postal Code</label>
                    <input type="text" name="shipping_zip" className="input" value={form.shipping_zip} onChange={handleChange} placeholder="e.g. 10001" />
                    {errors.shipping_zip && <span className="error-text">{errors.shipping_zip}</span>}
                  </div>
                </div>
                
                <div className={`input-group ${errors.shipping_phone ? 'has-error' : ''}`}>
                  <label>Phone Number (for delivery updates)</label>
                  <input type="tel" name="shipping_phone" className="input" value={form.shipping_phone} onChange={handleChange} placeholder="e.g. +1 (555) 123-4567" />
                  {errors.shipping_phone && <span className="error-text">{errors.shipping_phone}</span>}
                </div>

                <div className="checkout-actions">
                  <Link to="/catalog" className="btn btn-ghost"><ArrowLeft size={16} /> Back to Shop</Link>
                  <button type="submit" className="btn btn-primary">Continue to Payment <ArrowRight size={16} /></button>
                </div>
              </form>
            </AnimateStep>

            <AnimateStep step={step} currentStep={2}>
              <form onSubmit={handlePaymentSubmit} className="checkout-form glass" noValidate>
                <h2>Payment Method</h2>
                <div className="security-badge">
                  <CheckCircle size={14} /> 256-bit Secure Encryption
                </div>

                <div className="payment-card-grid">
                  <div className={`input-group full-width ${errors.cardName ? 'has-error' : ''}`}>
                    <label>Name on Card</label>
                    <input type="text" name="cardName" className="input uppercase-input" placeholder="JOHN DOE" value={paymentForm.cardName} onChange={handlePaymentChange} />
                    {errors.cardName && <span className="error-text">{errors.cardName}</span>}
                  </div>
                  
                  <div className={`input-group full-width ${errors.cardNumber ? 'has-error' : ''}`}>
                    <label>Card Number</label>
                    <div className="card-input-wrapper">
                      <CreditCard size={18} className="card-icon" />
                      <input type="text" name="cardNumber" className="input with-icon" placeholder="0000 0000 0000 0000" value={paymentForm.cardNumber} onChange={handlePaymentChange} />
                    </div>
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className={`input-group ${errors.expiry ? 'has-error' : ''}`}>
                      <label>Expiry Date</label>
                      <input type="text" name="expiry" className="input" placeholder="MM/YY" value={paymentForm.expiry} onChange={handlePaymentChange} />
                      {errors.expiry && <span className="error-text">{errors.expiry}</span>}
                    </div>
                    <div className={`input-group ${errors.cvc ? 'has-error' : ''}`}>
                      <label>CVC / CVV</label>
                      <input type="password" name="cvc" className="input" placeholder="123" value={paymentForm.cvc} onChange={handlePaymentChange} />
                      {errors.cvc && <span className="error-text">{errors.cvc}</span>}
                    </div>
                  </div>
                </div>

                <div className="checkout-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} /> Edit Delivery
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg pay-btn" disabled={loading}>
                    {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    {!loading && <CheckCircle size={18} />}
                  </button>
                </div>
              </form>
            </AnimateStep>
          </div>
        )}

        {step !== 3 && (
          <div className="checkout-sidebar">
            <div className="order-summary glass">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {items.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="summary-item-img">
                      <img src={item.image} alt={item.name} />
                      <span className="summary-item-qty">{item.quantity}</span>
                    </div>
                    <div className="summary-item-info">
                      <p>{item.name}</p>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free Delivery</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Total Due</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <motion.div 
            className="checkout-success glass-strong"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className="success-icon-large">
              <CheckCircle size={64} />
            </div>
            <h2>Order Confirmed!</h2>
            <p className="success-message">Thank you for your purchase. We've received your order and will begin processing it right away. A confirmation email has been sent.</p>
            
            <div className="success-details">
              <div className="detail-row">
                <span>Payment Method</span>
                <span>Credit Card ending in {paymentForm.cardNumber.slice(-4) || 'XXXX'}</span>
              </div>
              <div className="detail-row">
                <span>Shipping To</span>
                <span>{form.shipping_name}, {form.shipping_city}</span>
              </div>
            </div>

            <div className="success-actions">
              <Link to="/profile" className="btn btn-secondary btn-lg">View Order Status</Link>
              <Link to="/catalog" className="btn btn-primary btn-lg">Continue Shopping <ArrowRight size={18} /></Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function AnimateStep({ step, currentStep, children }) {
  if (step !== currentStep) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
