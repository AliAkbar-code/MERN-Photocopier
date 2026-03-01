import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=true&limit=8'),
      axios.get('/api/categories'),
      axios.get('/api/products?limit=12'),
    ]).then(([featRes, catRes, allRes]) => {
      setFeatured(featRes.data.products);
      setCategories(catRes.data.filter(c => c.product_count > 0));
      setAllProducts(allRes.data.products);
      setLoading(false);
    });
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge">🇵🇰 Pakistan's #1 Office Equipment Supplier</span>
            <h1>Premium Copiers &<br />Office Solutions</h1>
            <p>Discover top-quality photocopiers, printers, toners, and office equipment. Trusted by businesses across Pakistan.</p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary btn-lg">Browse All Products</Link>
              <Link to="/shop?featured=true" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>Featured Items ⭐</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>500+</strong><span>Products</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><strong>10+</strong><span>Categories</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><strong>All Pakistan</strong><span>Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-1">
              <div className="hc-icon">🖨️</div>
              <div>Ricoh MP 3054</div>
              <div className="hc-price">PKR 1,80,000</div>
            </div>
            <div className="hero-card-2">
              <div className="hc-icon">📠</div>
              <div>Canon iR-ADV</div>
              <div className="hc-price">PKR 3,20,000</div>
            </div>
            <div className="hero-circle">
              <span>VIEW<br/>CATALOG</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/shop" className="section-link">View All →</Link>
          </div>
          <div className="categories-grid">
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.id} to={`/shop/category/${cat.id}`} className="category-card">
                <div className="category-icon">{getCategoryIcon(cat.name)}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-count">{cat.product_count} products</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2>⭐ Featured Products</h2>
                <p>Handpicked top products for your business</p>
              </div>
              <Link to="/shop?featured=true" className="section-link">See All →</Link>
            </div>
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="promo-banner">
        <div className="container promo-inner">
          <div className="promo-text">
            <h2>Looking for a Specific Model?</h2>
            <p>Browse our extensive catalog or contact us for custom requirements and bulk orders.</p>
          </div>
          <div className="promo-actions">
            <Link to="/shop" className="btn btn-primary btn-lg">Explore Catalog</Link>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Latest Products</h2>
            <Link to="/shop" className="section-link">View All Products →</Link>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
            </div>
          ) : (
            <div className="grid-4">
              {allProducts.slice(0,8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function getCategoryIcon(name) {
  const icons = {
    'photocopiers': '🖨️', 'printers': '🖨️', 'toners': '🖋️',
    'master rolls': '📜', 'fuser parts': '⚙️', 'office equipment': '💼',
    'scanners': '📡', 'plotter paper': '📄', 'fax machine': '📠',
    'liquid inks': '🖌️',
  };
  return icons[name.toLowerCase()] || '📦';
}
