import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './ShopPage.css';

export default function ShopPage() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const activeCategory = categoryId || searchParams.get('category') || '';

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (search) params.search = search;
    if (featured) params.featured = featured;
    if (activeCategory) params.category = activeCategory;
    axios.get('/api/products', { params }).then(r => {
      setProducts(r.data.products);
      setTotal(r.data.total);
      setPages(r.data.pages);
      setLoading(false);
    });
  }, [page, search, featured, activeCategory]);

  useEffect(() => {
    axios.get('/api/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setCategory = (id) => {
    if (id) setSearchParams({ category: id });
    else setSearchParams({});
  };

  const setPage = (p) => {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCatName = categories.find(c => c.id == activeCategory)?.name;

  return (
    <div className="shop-page">
      {/* Shop Header */}
      <div className="shop-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> › 
            {activeCatName ? <><Link to="/shop"> Shop</Link> › <span>{activeCatName}</span></> : <span> Shop</span>}
          </div>
          <h1>
            {search ? `Results for "${search}"` :
             featured ? '⭐ Featured Products' :
             activeCatName || 'All Products'}
          </h1>
          <p>{total} product{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <button
              className={`filter-item ${!activeCategory ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              All Products <span>{total}</span>
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-item ${activeCategory == cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.name} <span>{cat.product_count}</span>
              </button>
            ))}
          </div>

          <div className="filter-section">
            <h3>Filter</h3>
            <button
              className={`filter-item ${featured === 'true' ? 'active' : ''}`}
              onClick={() => setSearchParams(featured === 'true' ? {} : { featured: 'true' })}
            >
              ⭐ Featured Only
            </button>
          </div>
        </aside>

        {/* Products */}
        <div className="shop-content">
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card" style={{ height: 320 }}></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <Link to="/shop" className="btn btn-primary" style={{ marginTop: 16 }}>Clear Filters</Link>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${page === i+1 ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
