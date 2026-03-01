#!/bin/bash
echo "🖨️  Copier Store PK — Setup"
echo "================================"

echo ""
echo "📦 Installing backend dependencies..."
cd backend && npm install
echo "✅ Backend ready"

echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install
echo "✅ Frontend ready"

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "To start the app, open TWO terminals:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  cd backend && node server.js"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  cd frontend && npm start"
echo ""
echo "🌐 Public site:  http://localhost:3000"
echo "🔐 Admin panel:  http://localhost:3000/admin/login"
echo "   Default login: admin / admin123"
echo ""
