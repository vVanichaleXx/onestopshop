import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStatusColor } from '../../utils';
import './Admin.css';

const API = 'http://localhost:3001/api';

export default function AdminDashboard() {
  const { token, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetch(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, [isAdmin, token, navigate]);

  if (!isAdmin || !stats) return null;

  const isMainDashboard = location.pathname === '/admin';

  return (
    <div className="admin-layout container">
      <aside className="admin-sidebar glass">
        <div className="admin-brand">
          <span className="logo-icon">✦</span> OneStopShop Admin
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={isMainDashboard ? 'active' : ''}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/products" className={location.pathname.includes('/products') ? 'active' : ''}>
            <Package size={18} /> Products
          </Link>
          <Link to="/admin/orders" className={location.pathname.includes('/orders') ? 'active' : ''}>
            <ShoppingBag size={18} /> Orders
          </Link>
        </nav>
      </aside>

      <main className="admin-content">
        {isMainDashboard ? (
          <div className="dashboard-overview">
            <h1 className="admin-title">Dashboard Overview</h1>
            
            <div className="stats-grid">
              <div className="stat-card glass-strong">
                <div className="stat-icon" style={{ color: 'var(--accent)', background: 'var(--accent-subtle)' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="stat-label">Total Revenue</p>
                  <p className="stat-value">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="stat-card glass-strong">
                <div className="stat-icon" style={{ color: 'var(--info)', background: 'rgba(59, 130, 246, 0.1)' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="stat-label">Total Orders</p>
                  <p className="stat-value">{stats.totalOrders || 0}</p>
                </div>
              </div>
              <div className="stat-card glass-strong">
                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(74, 222, 128, 0.1)' }}>
                  <Package size={24} />
                </div>
                <div>
                  <p className="stat-label">Products</p>
                  <p className="stat-value">{stats.totalProducts || 0}</p>
                </div>
              </div>
              <div className="stat-card glass-strong">
                <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <p className="stat-label">Total Users</p>
                  <p className="stat-value">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="recent-orders-section glass">
              <h2>Recent Orders</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders?.length > 0 ? (
                      stats.recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.user_name}</td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center">No orders yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

