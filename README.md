# 🖨️ Copier Store PK — Product Catalog Website

A full-stack product catalog website built with **React + Node.js**.
- Public visitors can browse products and view prices (NO cart/checkout)
- Admin can log in to add, edit, delete products and manage categories

---

## 🚀 Quick Setup (Run in ~5 minutes)

### Prerequisites
- Node.js v18+ installed → https://nodejs.org
- npm (comes with Node.js)

---

### Step 1: Setup Backend

```bash
cd backend
npm install
node server.js
```

Backend will run on: **http://localhost:5000**

✅ On first run:
- SQLite database (`store.db`) is created automatically
- Sample products and categories are seeded
- Default admin is created: **username: admin, password: admin123**

---

### Step 2: Setup Frontend (in a new terminal)

```bash
cd frontend
npm install
npm start
```

Frontend will run on: **http://localhost:3000**

---

## 🔐 Admin Access

Go to: **http://localhost:3000/admin/login**

| Field    | Value      |
|----------|------------|
| Username | admin      |
| Password | admin123   |

⚠️ **Change the password after first login!** (Dashboard → Change Password button)

---

## 📁 Project Structure

```
copier-store/
├── backend/
│   ├── server.js          # Express API + SQLite
│   ├── store.db           # Auto-created database
│   └── uploads/           # Auto-created for product images
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── HomePage.js         # Public homepage
        │   ├── ShopPage.js         # Product catalog with filters
        │   ├── ProductDetailPage.js # Single product view
        │   ├── AdminLoginPage.js   # Admin login
        │   ├── AdminDashboard.js   # Admin overview
        │   ├── AdminProducts.js    # Add/Edit/Delete products
        │   └── AdminCategories.js  # Manage categories
        └── components/
            ├── Navbar.js, Footer.js
            ├── ProductCard.js
            └── AdminSidebar.js
```

---

## 🌐 Public Pages

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| All Products | http://localhost:3000/shop |
| By Category | http://localhost:3000/shop/category/1 |
| Search | http://localhost:3000/shop?search=ricoh |
| Product Detail | http://localhost:3000/product/1 |

## 🔒 Admin Pages

| Page | URL |
|------|-----|
| Login | http://localhost:3000/admin/login |
| Dashboard | http://localhost:3000/admin |
| Products | http://localhost:3000/admin/products |
| Categories | http://localhost:3000/admin/categories |

---

## ⚙️ API Endpoints

### Public (no auth needed)
- `GET /api/products` — List products (filter by `?search=`, `?category=`, `?featured=true`)
- `GET /api/products/:id` — Single product
- `GET /api/categories` — All categories with product counts

### Admin (JWT token required)
- `POST /api/auth/login` — Login
- `POST /api/auth/change-password` — Change password
- `POST /api/products` — Add product (with image upload)
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product
- `POST/PUT/DELETE /api/categories` — Manage categories
- `GET /api/admin/stats` — Dashboard stats

---

## 🚀 Deployment (Production)

### Build React frontend:
```bash
cd frontend
npm run build
```

Then serve the `build/` folder from your backend or a static host like Vercel/Netlify.

### Environment variables (create `backend/.env`):
```
JWT_SECRET=your_very_secure_secret_key_here
PORT=5000
```

---

## 🔧 Customization

- **Change logo/brand name**: Edit `Navbar.js` and `Footer.js`
- **Change colors**: Edit `--accent`, `--primary` in `index.css`
- **Add more stock statuses**: Edit the select options in `AdminProducts.js`
- **Change currency**: Search for `PKR` and update to your currency code
