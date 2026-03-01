import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data)).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-top">
        <div className="container navbar-top-inner">
          <span className="navbar-tagline">📦 Pakistan's Trusted Copier & Office Equipment Supplier</span>
          <Link to="/admin/login" className="navbar-admin-link">🔐 Admin</Link>
        </div>
      </div>

      <div className="navbar-main">
        <div className="container navbar-main-inner">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">CP</div>
            <div className="logo-text">
              <span className="logo-primary">Copier</span>
              <span className="logo-secondary">Store PK</span>
            </div>
          </Link>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, brands, models..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </form>

          <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
        <div className="container navbar-nav-inner">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">All Products</Link>
          <div className="nav-dropdown">
            <span className="nav-link">Categories ▾</span>
            <div className="dropdown-menu">
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop/category/${cat.id}`} className="dropdown-item">
                  {cat.name}
                  <span className="dropdown-count">{cat.product_count}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/shop?featured=true" className="nav-link">Featured</Link>
        </div>
      </nav>
    </header>
  );
}
