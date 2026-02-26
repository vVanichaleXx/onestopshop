import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:3001/api';

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(d => setProducts(d.products || []));
    fetch(`${API}/products/categories`).then(r => r.json()).then(setCategories);
  }, []);

  const openModal = (product = null) => {
    setEditProduct(product);
    setFormData(product || {
      name: '', description: '', price: '', original_price: '',
      image: '', category_id: categories[0]?.id || 1, stock: '', featured: false
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditProduct(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editProduct ? 'PUT' : 'POST';
    const url = editProduct ? `${API}/products/${editProduct.id}` : `${API}/products`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      const saved = await res.json();
      if (editProduct) {
        setProducts(products.map(p => p.id === saved.id ? saved : p));
      } else {
        setProducts([saved, ...products]);
      }
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`${API}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="admin-products glass">
      <div className="admin-header-actions" style={{ padding: 'var(--space-xl)' }}>
        <h1 className="admin-title" style={{ marginBottom: 0 }}>Products</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} />
                </td>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openModal(p)} style={{ padding: 8 }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)} style={{ padding: 8, color: 'var(--error)' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="cart-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              className="glass-strong"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ padding: 'var(--space-2xl)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ marginBottom: 'var(--space-xl)' }}>{editProduct ? 'Edit Product' : 'New Product'}</h2>
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="input-group">
                  <label>Name</label>
                  <input className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea className="input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" className="input" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                  </div>
                  <div className="input-group">
                    <label>Original Price ($)</label>
                    <input type="number" step="0.01" className="input" value={formData.original_price || ''} onChange={e => setFormData({...formData, original_price: parseFloat(e.target.value) || null})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input" value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})} required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Stock</label>
                    <input type="number" className="input" value={formData.stock || 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                  </div>
                </div>
                <div className="input-group">
                  <label>Image URL</label>
                  <input className="input" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="checkbox" id="featured" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                  <label htmlFor="featured">Featured Product</label>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
