import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Strong password validation
    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    // Optional: enforce numbers or special chars if desired
    // if (!/\d/.test(password)) { ... }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully! Welcome to OneStopShop.');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Failed to create account';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      
      <div className="container auth-container">
        <motion.div 
          className="auth-card glass-strong"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">ONESTOPSHOP</span>
            </Link>
            <h2>Create Account</h2>
            <p>Join OneStopShop to elevate your shopping experience</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="input-group auth-input-group">
              <UserIcon size={18} className="input-icon" />
              <input 
                type="text" 
                className="input with-icon" 
                placeholder="Full Name" 
                value={name}
                onChange={e => setName(e.target.value)}
                required 
              />
            </div>

            <div className="input-group auth-input-group">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="input with-icon" 
                placeholder="Email address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="input-group auth-input-group">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input with-icon" 
                placeholder="Password (min. 6 characters)" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
