import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import './AdminPages.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    axios.get('/api/categories').then(r => setCategories(r.data));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => {
    setForm({ name: '', description: '' });
    setEditItem(null);
    setModal(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '' });
    setEditItem(cat);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`/api/categories/${editItem.id}`, form);
        toast.success('Category updated!');
      } else {
        await axios.post('/api/categories', form);
        toast.success('Category added!');
      }
      setModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/categories/${deleteId}`);
      toast.success('Category deleted');
      setDeleteId(null);
      fetch();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const icons = { 'Photocopiers': '🖨️', 'Printers': '🖨️', 'Toners': '🖋️', 'Master Rolls': '📜', 'Fuser Parts': '⚙️', 'Office Equipment': '💼', 'Scanners': '📡', 'Plotter Paper': '📄' };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Categories</h1>
            <p>Organize your products into categories</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
        </div>

        <div className="admin-section">
          <div className="categories-admin-grid">
            {categories.map(cat => (
              <div key={cat.id} className="cat-admin-card">
                <div className="cat-admin-icon">{icons[cat.name] || '📦'}</div>
                <div className="cat-admin-info">
                  <div className="cat-admin-name">{cat.name}</div>
                  {cat.description && <div className="cat-admin-desc">{cat.description}</div>}
                  <div className="cat-admin-count">{cat.product_count} products</div>
                </div>
                <div className="cat-admin-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cat.id)}>🗑️</button>
                </div>
              </div>
            ))}

            {/* Add Card */}
            <button className="cat-admin-card cat-add-card" onClick={openAdd}>
              <div className="cat-admin-icon" style={{ background: 'rgba(230,57,70,0.08)', color: 'var(--accent)' }}>+</div>
              <div className="cat-admin-name">Add New Category</div>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? '✏️ Edit Category' : '➕ Add Category'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Photocopiers" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" placeholder="Optional description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ minHeight: 80 }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editItem ? '✅ Update' : '➕ Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🗑️ Delete Category</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure? Products in this category will become uncategorized.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
