import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AdminSidebar.css';

const navItems = [
  { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
  { path: '/admin/products', icon: '📦', label: 'Products' },
  { path: '/admin/categories', icon: '🗂️', label: 'Categories' },
];

export default function AdminSidebar() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">CP</div>
          <div>
            <div className="sidebar-logo-name">Copier Store PK</div>
            <div className="sidebar-logo-role">Admin Panel</div>
          </div>
        </Link>
      </div>

      <div className="sidebar-admin-info">
        <div className="admin-avatar">{admin?.username?.[0]?.toUpperCase()}</div>
        <div>
          <div className="admin-name">{admin?.username}</div>
          <div className="admin-role">Administrator</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${isActive(item) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/" className="sidebar-footer-btn">
          <span>🌐</span> View Public Site
        </Link>
        <button className="sidebar-footer-btn logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
