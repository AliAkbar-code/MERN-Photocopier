import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const PLACEHOLDER = 'https://placehold.co/400x300/f0f2f5/9ca3af?text=No+Image';

export default function ProductCard({ product }) {
  const imgSrc = product.image
    ? `http://localhost:5000${product.image}`
    : PLACEHOLDER;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(price);

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      {product.featured === 1 && <span className="product-badge featured">⭐ Featured</span>}
      <div className="product-card-image">
        <img src={imgSrc} alt={product.name} onError={e => { e.target.src = PLACEHOLDER; }} />
      </div>
      <div className="product-card-body">
        {product.category_name && (
          <span className="product-category">{product.category_name}</span>
        )}
        <h3 className="product-name">{product.name}</h3>
        {(product.brand || product.model) && (
          <p className="product-meta">
            {product.brand && <span>{product.brand}</span>}
            {product.brand && product.model && <span className="sep">·</span>}
            {product.model && <span>{product.model}</span>}
          </p>
        )}
        <div className="product-footer">
          <span className="product-price price">{formatPrice(product.price)}</span>
          <span className={`badge ${product.stock_status === 'In Stock' ? 'badge-green' : 'badge-red'}`}>
            {product.stock_status}
          </span>
        </div>
        <p className="product-cta">View Details →</p>
      </div>
    </Link>
  );
}
