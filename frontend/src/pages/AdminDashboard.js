import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminPages.css';

const PLACEHOLDER = 'https://placehold.co/80x60/f0f2f5/9ca3af?text=No+Img';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [changePw, setChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const { admin } = useAuth();

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

  const handleChangePw = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await axios.post('/api/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setChangePw(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {admin?.username}! Here's your store overview.</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setChangePw(true)}>🔑 Change Password</button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>📦</div>
            <div className="stat-value">{stats?.totalProducts ?? '—'}</div>
            <div className="stat-label">Total Products</div>
            <Link to="/admin/products" className="stat-action">Manage →</Link>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>🗂️</div>
            <div className="stat-value">{stats?.totalCategories ?? '—'}</div>
            <div className="stat-label">Categories</div>
            <Link to="/admin/categories" className="stat-action">Manage →</Link>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>⭐</div>
            <div className="stat-value">{stats?.featuredProducts ?? '—'}</div>
            <div className="stat-label">Featured Products</div>
            <Link to="/admin/products" className="stat-action">View →</Link>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--accent), #c1121f)', color: 'white', border: 'none' }}>
            <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>➕</div>
            <div className="stat-value" style={{ color: 'white' }}>Quick Add</div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Add new product</div>
            <Link to="/admin/products" className="stat-action" style={{ color: 'rgba(255,255,255,0.8)' }}>Add Now →</Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Recent Products</h2>
            <Link to="/admin/products" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="recent-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentProducts?.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="table-product-info">
                        <img
                          src={p.image ? `http://localhost:5000${p.image}` : PLACEHOLDER}
                          alt={p.name}
                          onError={e => { e.target.src = PLACEHOLDER; }}
                        />
                        <div>
                          <div className="table-product-name">{p.name}</div>
                          {p.brand && <div className="table-product-meta">{p.brand} {p.model}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{p.category_name || 'Uncategorized'}</span></td>
                    <td><span className="price" style={{ fontSize: 14 }}>{formatPrice(p.price)}</span></td>
                    <td><span className={`badge ${p.stock_status === 'In Stock' ? 'badge-green' : 'badge-red'}`}>{p.stock_status}</span></td>
                    <td>{p.featured ? '⭐' : '—'}</td>
                    <td><Link to="/admin/products" className="btn btn-secondary btn-sm">Edit</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <h2>Quick Actions</h2>
          <div className="grid-3">
            <Link to="/admin/products" className="quick-link-card">
              <div className="ql-icon">📦</div>
              <div className="ql-title">Manage Products</div>
              <div className="ql-desc">Add, edit, or remove products and update prices</div>
            </Link>
            <Link to="/admin/categories" className="quick-link-card">
              <div className="ql-icon">🗂️</div>
              <div className="ql-title">Manage Categories</div>
              <div className="ql-desc">Create and organize your product categories</div>
            </Link>
            <Link to="/" target="_blank" className="quick-link-card">
              <div className="ql-icon">🌐</div>
              <div className="ql-title">View Public Site</div>
              <div className="ql-desc">See how your catalog looks to visitors</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {changePw && (
        <div className="modal-overlay" onClick={() => setChangePw(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="modal-close" onClick={() => setChangePw(false)}>×</button>
            </div>
            <form onSubmit={handleChangePw}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setChangePw(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
