const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'copier_store_super_secret_2024_change_in_production';
const DB_PATH = path.join(__dirname, 'store.json');

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── JSON File Database (no native modules needed!) ───────────────────────────
let DB = {
  admins: [],
  categories: [],
  products: [],
  _adminId: 1,
  _categoryId: 1,
  _productId: 1,
};

if (fs.existsSync(DB_PATH)) {
  try { DB = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch (e) { console.log('Starting fresh DB.'); }
}

function saveDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(DB, null, 2));
}

function now() { return new Date().toISOString(); }

// ─── Seed defaults ────────────────────────────────────────────────────────────
if (DB.admins.length === 0) {
  DB.admins.push({ id: DB._adminId++, username: 'admin', password: bcrypt.hashSync('admin123', 10), created_at: now() });
  console.log('✅ Default admin: username=admin, password=admin123');
}
if (DB.categories.length === 0) {
  ['Photocopiers','Printers','Toners','Master Rolls','Fuser Parts','Office Equipment','Scanners','Plotter Paper']
    .forEach(name => DB.categories.push({ id: DB._categoryId++, name, description: '', created_at: now() }));
}
if (DB.products.length === 0) {
  [
    { name:'Ricoh MP 2014D Photocopier', description:'A4 Digital Copier, 20ppm, USB connectivity, compact design for small offices.', price:85000, category_id:1, brand:'Ricoh', model:'MP 2014D', stock_status:'In Stock', featured:1 },
    { name:'Ricoh MP 3054 Office Copier', description:'High-speed A3/A4 digital copier with advanced features for medium offices.', price:180000, category_id:1, brand:'Ricoh', model:'MP 3054', stock_status:'In Stock', featured:1 },
    { name:'HP LaserJet Pro M404dn', description:'Monochrome laser printer, duplex printing, fast 38ppm, ideal for office use.', price:55000, category_id:2, brand:'HP', model:'M404dn', stock_status:'In Stock', featured:0 },
    { name:'Canon iR-ADV C3525i', description:'Color multifunction printer with advanced document management capabilities.', price:320000, category_id:1, brand:'Canon', model:'iR-ADV C3525i', stock_status:'In Stock', featured:1 },
    { name:'Ricoh SP 210 Toner', description:'Original black toner cartridge for Ricoh SP 210 series, 2600 page yield.', price:3500, category_id:3, brand:'Ricoh', model:'SP 210', stock_status:'In Stock', featured:0 },
    { name:'HP 203A Black Toner', description:'Genuine HP toner cartridge, ~1400 page yield for HP Color LaserJet Pro.', price:8500, category_id:3, brand:'HP', model:'203A', stock_status:'In Stock', featured:0 },
    { name:'Ricoh HQ-40 Duplicator Ink (Blue)', description:'High quality duplicator ink 500ml for Ricoh digital duplicators.', price:2800, category_id:4, brand:'Ricoh', model:'HQ-40', stock_status:'In Stock', featured:0 },
    { name:'Fuser Assembly Ricoh MP 2014', description:'Original fuser unit for Ricoh MP 2014 series, 100,000 page life.', price:12000, category_id:5, brand:'Ricoh', model:'MP 2014', stock_status:'In Stock', featured:0 },
    { name:'Canon DR-C225W Scanner', description:'Compact document scanner, Wi-Fi enabled, 25ppm, ADF capacity 30 sheets.', price:42000, category_id:7, brand:'Canon', model:'DR-C225W', stock_status:'In Stock', featured:0 },
    { name:'A0 Plotter Paper Roll (80gsm)', description:'24" x 50m premium quality plotter paper roll for architectural drawings.', price:1800, category_id:8, brand:'Generic', model:'A0-80gsm', stock_status:'In Stock', featured:0 },
  ].forEach(p => DB.products.push({ ...p, id:DB._productId++, image:null, created_at:now(), updated_at:now() }));
}
saveDB();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryName(id) {
  const cat = DB.categories.find(c => c.id === parseInt(id));
  return cat ? cat.name : null;
}
function withCat(p) { return { ...p, category_name: getCategoryName(p.category_id) }; }

function filterProducts({ category, search, featured, page=1, limit=12 }) {
  let list = [...DB.products];
  if (category) list = list.filter(p => p.category_id === parseInt(category));
  if (search) { const q=search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q)||(p.model||'').toLowerCase().includes(q)); }
  if (featured==='true') list = list.filter(p => p.featured===1);
  list.sort((a,b) => b.featured-a.featured || new Date(b.created_at)-new Date(a.created_at));
  const total=list.length, pages=Math.ceil(total/limit), start=(parseInt(page)-1)*parseInt(limit);
  return { products: list.slice(start, start+parseInt(limit)).map(withCat), total, pages, page: parseInt(page) };
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const auth = (req,res,next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error:'No token' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error:'Invalid token' }); }
};

// ═══════════════════ API ROUTES ═══════════════════════════════════════════════

app.post('/api/auth/login', (req,res) => {
  const {username,password} = req.body;
  const admin = DB.admins.find(a => a.username===username);
  if (!admin||!bcrypt.compareSync(password,admin.password)) return res.status(401).json({error:'Invalid credentials'});
  const token = jwt.sign({id:admin.id,username:admin.username}, JWT_SECRET, {expiresIn:'24h'});
  res.json({token, username:admin.username});
});

app.post('/api/auth/change-password', auth, (req,res) => {
  const {currentPassword,newPassword} = req.body;
  const admin = DB.admins.find(a => a.id===req.admin.id);
  if (!bcrypt.compareSync(currentPassword,admin.password)) return res.status(400).json({error:'Current password incorrect'});
  admin.password = bcrypt.hashSync(newPassword,10);
  saveDB();
  res.json({message:'Password changed'});
});

app.get('/api/categories', (req,res) => {
  const cats = DB.categories.map(c => ({...c, product_count: DB.products.filter(p=>p.category_id===c.id).length}));
  res.json(cats.sort((a,b) => a.name.localeCompare(b.name)));
});
app.post('/api/categories', auth, (req,res) => {
  const {name,description} = req.body;
  if (!name) return res.status(400).json({error:'Name required'});
  if (DB.categories.find(c=>c.name.toLowerCase()===name.toLowerCase())) return res.status(400).json({error:'Already exists'});
  const cat = {id:DB._categoryId++, name, description:description||'', created_at:now()};
  DB.categories.push(cat); saveDB(); res.json(cat);
});
app.put('/api/categories/:id', auth, (req,res) => {
  const cat=DB.categories.find(c=>c.id===parseInt(req.params.id));
  if (!cat) return res.status(404).json({error:'Not found'});
  cat.name=req.body.name||cat.name; cat.description=req.body.description??cat.description;
  saveDB(); res.json({success:true});
});
app.delete('/api/categories/:id', auth, (req,res) => {
  const id=parseInt(req.params.id);
  DB.categories=DB.categories.filter(c=>c.id!==id);
  DB.products.forEach(p=>{if(p.category_id===id)p.category_id=null;});
  saveDB(); res.json({success:true});
});

app.get('/api/products', (req,res) => res.json(filterProducts(req.query)));
app.get('/api/products/:id', (req,res) => {
  const p=DB.products.find(p=>p.id===parseInt(req.params.id));
  if (!p) return res.status(404).json({error:'Not found'});
  res.json(withCat(p));
});
app.post('/api/products', auth, upload.single('image'), (req,res) => {
  const {name,description,price,category_id,brand,model,stock_status,featured} = req.body;
  if (!name||!price) return res.status(400).json({error:'Name and price required'});
  const p = { id:DB._productId++, name, description:description||'', price:parseFloat(price),
    category_id:category_id?parseInt(category_id):null, image:req.file?`/uploads/${req.file.filename}`:null,
    brand:brand||'', model:model||'', stock_status:stock_status||'In Stock',
    featured:featured==='true'?1:0, created_at:now(), updated_at:now() };
  DB.products.push(p); saveDB(); res.json(withCat(p));
});
app.put('/api/products/:id', auth, upload.single('image'), (req,res) => {
  const p=DB.products.find(p=>p.id===parseInt(req.params.id));
  if (!p) return res.status(404).json({error:'Not found'});
  const {name,description,price,category_id,brand,model,stock_status,featured} = req.body;
  if (name) p.name=name; if (description!==undefined) p.description=description;
  if (price) p.price=parseFloat(price);
  p.category_id=category_id?parseInt(category_id):null;
  if (brand!==undefined) p.brand=brand; if (model!==undefined) p.model=model;
  if (stock_status) p.stock_status=stock_status;
  p.featured=featured==='true'?1:0;
  if (req.file) p.image=`/uploads/${req.file.filename}`;
  p.updated_at=now(); saveDB(); res.json(withCat(p));
});
app.delete('/api/products/:id', auth, (req,res) => {
  DB.products=DB.products.filter(p=>p.id!==parseInt(req.params.id));
  saveDB(); res.json({success:true});
});

app.get('/api/admin/stats', auth, (req,res) => {
  const recentProducts=[...DB.products].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5).map(withCat);
  res.json({ totalProducts:DB.products.length, totalCategories:DB.categories.length, featuredProducts:DB.products.filter(p=>p.featured===1).length, recentProducts });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
