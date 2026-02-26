import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStatusColor } from '../../utils';

const API = 'http://localhost:3001/api';

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API}/orders/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setOrders(d || []));
  }, [token]);

  const handleStatusChange = async (id, newStatus) => {
    const res = await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  return (
    <div className="admin-orders glass">
      <div className="admin-header-actions" style={{ padding: 'var(--space-xl)' }}>
        <h1 className="admin-title" style={{ marginBottom: 0 }}>Orders</h1>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ fontWeight: 600 }}>#{order.id}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{order.user_name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.user_email}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td>
                  <select 
                    className="input" 
                    style={{ padding: '6px 10px', fontSize: 12, width: 'auto' }}
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
