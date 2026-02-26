import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const API = 'http://localhost:3001/api';

export default function Profile() {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, token, navigate]);

  if (!user) return null;

  return (
    <div className="profile-page container">
      <div className="profile-layout">
        <aside className="profile-sidebar glass">
          <div className="profile-user">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            {isAdmin && <span className="badge badge-accent profile-admin-badge"><Shield size={12} /> Admin</span>}
          </div>
          
          <nav className="profile-nav">
            <button className="active"><Package size={18} /> My Orders</button>
            {isAdmin && <button onClick={() => navigate('/admin')}><Shield size={18} /> Admin Panel</button>}
            <button onClick={logout} className="logout-btn"><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className="profile-content">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Order History
          </motion.h2>

          {loading ? (
            <div className="orders-loading">
              <div className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-md)', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 150, borderRadius: 'var(--radius-md)' }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass empty-orders">
              <Package size={48} />
              <p>You haven't placed any orders yet.</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalog')}>Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order, i) => (
                <motion.div 
                  key={order.id} 
                  className="order-card glass"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="order-header">
                    <div>
                      <span className="order-id">Order #{order.id}</span>
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="order-status-total">
                      <span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span>
                      <span className="order-total">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="order-items">
                    {order.items?.map(item => (
                      <div key={item.id} className="order-item">
                        <img src={item.image} alt={item.name} />
                        <div className="order-item-info">
                          <p>{item.name}</p>
                          <span>Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': case 'delivered': return 'success';
    case 'cancelled': return 'error';
    default: return 'warning';
  }
}
