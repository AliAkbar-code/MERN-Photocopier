import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ProductDetailPage.css';

const PLACEHOLDER = 'https://placehold.co/600x450/f0f2f5/9ca3af?text=No+Image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`).then(r => {
      setProduct(r.data);
      if (r.data.category_id) {
        axios.get(`/api/products?category=${r.data.category_id}&limit=4`).then(rel => {
          setRelated(rel.data.products.filter(p => p.id !== parseInt(id)).slice(0, 3));
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh', background: 'var(--surface-2)' }}><div className="spinner" style={{ borderTopColor: 'var(--accent)' }}></div></div>;
  if (!product) return <div className="container empty-state" style={{ paddingTop: 80 }}><div className="icon">😕</div><h3>Product not found</h3><Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Shop</Link></div>;

  const imgSrc = product.image ? `http://localhost:5000${product.image}` : PLACEHOLDER;

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="breadcrumb" style={{ padding: '20px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
          <Link to="/">Home</Link> › <Link to="/shop">Shop</Link> ›
          {product.category_name && <><Link to={`/shop/category/${product.category_id}`}> {product.category_name}</Link> ›</>}
          <span> {product.name}</span>
        </div>

        <div className="detail-grid">
          <div className="detail-image">
            <img src={imgSrc} alt={product.name} onError={e => { e.target.src = PLACEHOLDER; }} />
            {product.featured === 1 && <div className="detail-featured-badge">⭐ Featured Product</div>}
          </div>

          <div className="detail-info">
            {product.category_name && <span className="detail-category">{product.category_name}</span>}
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-meta">
              {product.brand && <div className="meta-row"><span className="meta-label">Brand</span><span>{product.brand}</span></div>}
              {product.model && <div className="meta-row"><span className="meta-label">Model</span><span>{product.model}</span></div>}
              <div className="meta-row">
                <span className="meta-label">Status</span>
                <span className={`badge ${product.stock_status === 'In Stock' ? 'badge-green' : 'badge-red'}`}>{product.stock_status}</span>
              </div>
            </div>

            <div className="detail-price-box">
              <div className="detail-price-label">Price</div>
              <div className="detail-price price">{formatPrice(product.price)}</div>
              <div className="detail-price-note">For ordering and inquiries, please contact us directly.</div>
            </div>

            {product.description && (
              <div className="detail-description">
                <h3>Product Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="detail-contact">
              <h3>📞 Contact for Orders</h3>
              <p>This is a product display catalog. To place an order or get more information, contact us:</p>
              <div className="contact-options">
                <a href="tel:+923000000000" className="btn btn-primary btn-lg">📞 Call Us</a>
                <a href="mailto:info@copierstore.pk" className="btn btn-outline btn-lg">✉️ Email Us</a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="related-section">
            <h2>Related Products</h2>
            <div className="grid-4">
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="card" style={{ textDecoration: 'none' }}>
                  <img
                    src={p.image ? `http://localhost:5000${p.image}` : PLACEHOLDER}
                    alt={p.name}
                    onError={e => { e.target.src = PLACEHOLDER; }}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }}
                  />
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{p.category_name}</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 8 }}>{p.name}</div>
                    <div className="price" style={{ fontSize: 15 }}>{formatPrice(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
