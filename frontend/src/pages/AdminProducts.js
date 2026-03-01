import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';
import './AdminPages.css';

const PLACEHOLDER = 'https://placehold.co/80x60/f0f2f5/9ca3af?text=No+Img';
const EMPTY_FORM = { name: '', description: '', price: '', category_id: '', brand: '', model: '', stock_status: 'In Stock', featured: 'false' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    axios.get('/api/products', { params }).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
      setLoading(false);
    });
  }, [page, search]);

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category_id: product.category_id || '',
      brand: product.brand || '',
      model: product.model || '',
      stock_status: product.stock_status || 'In Stock',
      featured: product.featured ? 'true' : 'false',
    });
    setImagePreview(product.image ? `http://localhost:5000${product.image}` : null);
    setImageFile(null);
    setEditId(product.id);
    setModal('edit');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error('Name and price are required');
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append('image', imageFile);

      if (modal === 'edit') {
        await axios.put(`/api/products/${editId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added!');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${deleteId}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-page-header">
          <div>
            <h1>Products</h1>
            <p>{total} total products in your catalog</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>

        {/* Search */}
        <div className="table-toolbar">
          <input
            className="form-input"
            type="text"
            placeholder="🔍 Search by name, brand, or model..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ maxWidth: 380 }}
          />
          <span className="table-count">{total} products</span>
        </div>

        {/* Table */}
        <div className="admin-section">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>No products found</h3>
              <p>Add your first product to get started.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Product</button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={p.image ? `http://localhost:5000${p.image}` : PLACEHOLDER}
                        alt={p.name}
                        className="table-product-thumb"
                        onError={e => { e.target.src = PLACEHOLDER; }}
                      />
                    </td>
                    <td>
                      <div className="table-product-name">{p.name}</div>
                      {(p.brand || p.model) && <div className="table-product-meta">{p.brand} {p.model}</div>}
                    </td>
                    <td>{p.category_name ? <span className="badge badge-blue">{p.category_name}</span> : '—'}</td>
                    <td><span className="price" style={{ fontSize: 14 }}>{formatPrice(p.price)}</span></td>
                    <td><span className={`badge ${p.stock_status === 'In Stock' ? 'badge-green' : 'badge-red'}`}>{p.stock_status}</span></td>
                    <td style={{ textAlign: 'center' }}>{p.featured ? '⭐' : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination" style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPage(i+1)}
                >
                  {i+1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'edit' ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" type="text" placeholder="e.g. Ricoh MP 2014D Photocopier" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (PKR) *</label>
                    <input className="form-input" type="number" placeholder="e.g. 85000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" type="text" placeholder="e.g. Ricoh, HP, Canon" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input className="form-input" type="text" placeholder="e.g. MP 2014D" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Status</label>
                    <select className="form-select" value={form.stock_status} onChange={e => setForm({ ...form, stock_status: e.target.value })}>
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Pre-Order">Pre-Order</option>
                      <option value="Discontinued">Discontinued</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Featured</label>
                    <select className="form-select" value={form.featured} onChange={e => setForm({ ...form, featured: e.target.value })}>
                      <option value="false">No</option>
                      <option value="true">⭐ Yes (Show on Homepage)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="Describe the product..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Product Image</label>
                    <div className="image-upload-area">
                      {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
                      <label className="image-upload-btn">
                        {imagePreview ? '🔄 Change Image' : '📷 Upload Image'}
                        <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                      </label>
                      <div className="image-hint">Max 5MB. JPG, PNG, WebP supported.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : modal === 'edit' ? '✅ Update Product' : '➕ Add Product'}
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
              <h3>🗑️ Delete Product</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
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
