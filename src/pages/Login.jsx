import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Successfully signed in!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Failed to login';
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="logo-icon">✦</span>
              <span className="logo-text">ONESTOPSHOP</span>
            </Link>
            <h2>Welcome Back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

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
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
            <div className="auth-demo-credentials">
              <p><strong>Demo Admin:</strong> admin@onestopshop.com / admin123</p>
              <p><strong>Demo User:</strong> john@example.com / customer123</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
