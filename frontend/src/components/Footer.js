import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">CP</div>
              <div>
                <div className="logo-primary">Copier Store PK</div>
                <div className="logo-sub">Your Trusted Partner</div>
              </div>
            </div>
            <p>Pakistan's leading supplier of copiers, printers, toners, and office equipment. Quality products at competitive prices.</p>
          </div>

          <div className="footer-links">
            <h4>Products</h4>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?featured=true">Featured Items</Link>
            <Link to="/shop/category/1">Photocopiers</Link>
            <Link to="/shop/category/2">Printers</Link>
            <Link to="/shop/category/3">Toners</Link>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/admin/login">Admin Panel</Link>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>📍 Lahore, Pakistan</p>
            <p>📞 +92 300 0000000</p>
            <p>✉️ info@copierstore.pk</p>
            <p>🕐 Mon–Sat: 9am – 6pm</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Copier Store PK. All rights reserved. | Product display only — contact us for orders.</p>
        </div>
      </div>
    </footer>
  );
}
