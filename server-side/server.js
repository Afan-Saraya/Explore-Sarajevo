require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const contentModel = require('./db/content');
const categoriesModel = require('./db/models/categories');
const typesModel = require('./db/models/types');
const brandsModel = require('./db/models/brands');
const businessesModel = require('./db/models/businesses');
const attractionsModel = require('./db/models/attractions');
const eventsModel = require('./db/models/events');
const subeventsModel = require('./db/models/subevents');
const usersModel = require('./db/models/users');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'explore-sarajevo-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files (CMS UI)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '_');
    cb(null, `${unique}-${safeName}`);
  }
});
const upload = multer({ storage });

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// DB health endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    await db.testConnection();
    res.json({ ok: true, connected: true });
  } catch (err) {
    res.status(500).json({ ok: false, connected: false, error: err.message });
  }
});

// ===== AUTH ENDPOINTS =====
// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const user = await usersModel.register(username, email, password);
    req.session.user = user;
    
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = await usersModel.login(username, password);
    req.session.user = user;
    
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// CMS endpoints (DB-backed)
// List content items (optional ?type=business|attraction...)
app.get('/api/content', async (req, res) => {
  try {
    const type = req.query.type;
    const items = await contentModel.getAllContent(type);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read content' });
  }
});

// Get single item
app.get('/api/content/:id', async (req, res) => {
  try {
    const item = await contentModel.getContentById(req.params.id);
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read content' });
  }
});

// Create content (multipart for files, or JSON body)
app.post('/api/content', upload.single('file'), async (req, res) => {
  try {
    const body = req.body || {};
    const {
      contentType,
      name,
      slug,
      description = '',
      address = '',
      location = '',
      categoryId = null,
      parentCategoryId = null,
      brandId = null,
      phone = '',
      website = '',
      rating = 0,
      workingHours = '',
      featuredBusiness = false,
      featuredLocation = false
    } = body;

    if (!contentType || !name) {
      return res.status(400).json({ error: 'contentType and name are required' });
    }

    const item = {
      contentType,
      name,
      slug: slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-'),
      description,
      address,
      location,
      categoryId: categoryId || null,
      parentCategoryId: parentCategoryId || null,
      brandId: brandId || null,
      phone: phone || null,
      website: website || null,
      rating: rating ? parseFloat(rating) : null,
      workingHours: workingHours || null,
      featuredBusiness: featuredBusiness === 'true' || featuredBusiness === true,
      featuredLocation: featuredLocation === 'true' || featuredLocation === true,
      images: [],
      data: {}
    };

    if (req.file) item.images = [`/uploads/${req.file.filename}`];

    const created = await contentModel.createContent(item);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create content' });
  }
});

// Update content
app.put('/api/content/:id', upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    if (req.file) {
      body.images = [`/uploads/${req.file.filename}`];
    }

    const updated = await contentModel.updateContent(id, body);
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update content' });
  }
});

// Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await contentModel.getContentById(id);
    if (!item) return res.status(404).json({ error: 'not found' });

    // attempt to remove uploaded files used by this content
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach(imgPath => {
        const filePath = path.join(uploadsDir, path.basename(imgPath));
        fs.unlink(filePath, () => {});
      });
    }

    await contentModel.deleteContent(id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete content' });
  }
});

// ============================================
// TAXONOMIES API - Categories
// ============================================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await categoriesModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch categories' });
  }
});

app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await categoriesModel.getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ error: 'category not found' });
    const usageCount = await categoriesModel.getCategoryUsageCount(req.params.id);
    res.json({ ...category, usage_count: usageCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch category' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await categoriesModel.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const category = await categoriesModel.updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: 'category not found' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await categoriesModel.deleteCategory(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete category' });
  }
});

// ============================================
// TAXONOMIES API - Types
// ============================================

app.get('/api/types', async (req, res) => {
  try {
    const types = await typesModel.getAllTypes();
    res.json(types);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch types' });
  }
});

app.get('/api/types/:id', async (req, res) => {
  try {
    const type = await typesModel.getTypeById(req.params.id);
    if (!type) return res.status(404).json({ error: 'type not found' });
    const usageCount = await typesModel.getTypeUsageCount(req.params.id);
    res.json({ ...type, usage_count: usageCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch type' });
  }
});

app.post('/api/types', async (req, res) => {
  try {
    const type = await typesModel.createType(req.body);
    res.status(201).json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create type' });
  }
});

app.put('/api/types/:id', async (req, res) => {
  try {
    const type = await typesModel.updateType(req.params.id, req.body);
    if (!type) return res.status(404).json({ error: 'type not found' });
    res.json(type);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update type' });
  }
});

app.delete('/api/types/:id', async (req, res) => {
  try {
    await typesModel.deleteType(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete type' });
  }
});

// ============================================
// BRANDS API
// ============================================

app.get('/api/brands', async (req, res) => {
  try {
    const { search, parent_id } = req.query;
    let brands;
    if (search) {
      brands = await brandsModel.searchBrands(search);
    } else if (parent_id) {
      brands = await brandsModel.getBrandsByParent(parent_id);
    } else {
      brands = await brandsModel.getAllBrands();
    }
    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch brands' });
  }
});

app.get('/api/brands/:id', async (req, res) => {
  try {
    const brand = await brandsModel.getBrandById(req.params.id);
    if (!brand) return res.status(404).json({ error: 'brand not found' });
    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch brand' });
  }
});

app.post('/api/brands', async (req, res) => {
  try {
    const brand = await brandsModel.createBrand(req.body);
    res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create brand' });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  try {
    const brand = await brandsModel.updateBrand(req.params.id, req.body);
    if (!brand) return res.status(404).json({ error: 'brand not found' });
    res.json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update brand' });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  try {
    await brandsModel.deleteBrand(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete brand' });
  }
});

// ============================================
// BUSINESSES API
// ============================================

app.get('/api/businesses', async (req, res) => {
  try {
    const filters = {
      brand_id: req.query.brand_id,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.search
    };
    const businesses = await businessesModel.getAllBusinesses(filters);
    res.json(businesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch businesses' });
  }
});

app.get('/api/businesses/:id', async (req, res) => {
  try {
    const business = await businessesModel.getBusinessById(req.params.id);
    if (!business) return res.status(404).json({ error: 'business not found' });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch business' });
  }
});

app.post('/api/businesses', async (req, res) => {
  try {
    const business = await businessesModel.createBusiness(req.body);
    res.status(201).json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create business' });
  }
});

app.put('/api/businesses/:id', async (req, res) => {
  try {
    const business = await businessesModel.updateBusiness(req.params.id, req.body);
    if (!business) return res.status(404).json({ error: 'business not found' });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update business' });
  }
});

app.delete('/api/businesses/:id', async (req, res) => {
  try {
    await businessesModel.deleteBusiness(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete business' });
  }
});

// ============================================
// ATTRACTIONS API
// ============================================

app.get('/api/attractions', async (req, res) => {
  try {
    const filters = {
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      search: req.query.search
    };
    const attractions = await attractionsModel.getAllAttractions(filters);
    res.json(attractions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch attractions' });
  }
});

app.get('/api/attractions/:id', async (req, res) => {
  try {
    const attraction = await attractionsModel.getAttractionById(req.params.id);
    if (!attraction) return res.status(404).json({ error: 'attraction not found' });
    res.json(attraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch attraction' });
  }
});

app.post('/api/attractions', async (req, res) => {
  try {
    const attraction = await attractionsModel.createAttraction(req.body);
    res.status(201).json(attraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create attraction' });
  }
});

app.put('/api/attractions/:id', async (req, res) => {
  try {
    const attraction = await attractionsModel.updateAttraction(req.params.id, req.body);
    if (!attraction) return res.status(404).json({ error: 'attraction not found' });
    res.json(attraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update attraction' });
  }
});

app.delete('/api/attractions/:id', async (req, res) => {
  try {
    await attractionsModel.deleteAttraction(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete attraction' });
  }
});

// ============================================
// EVENTS API
// ============================================

app.get('/api/events', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    const events = await eventsModel.getAllEvents(filters);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch events' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await eventsModel.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch event' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = await eventsModel.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create event' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await eventsModel.updateEvent(req.params.id, req.body);
    if (!event) return res.status(404).json({ error: 'event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await eventsModel.deleteEvent(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete event' });
  }
});

// ============================================
// SUB-EVENTS API
// ============================================

app.get('/api/subevents', async (req, res) => {
  try {
    const eventId = req.query.event_id;
    const subevents = await subeventsModel.getAllSubEvents(eventId || null);
    res.json(subevents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch sub-events' });
  }
});

app.get('/api/subevents/:id', async (req, res) => {
  try {
    const subevent = await subeventsModel.getSubEventById(req.params.id);
    if (!subevent) return res.status(404).json({ error: 'sub-event not found' });
    res.json(subevent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to fetch sub-event' });
  }
});

app.post('/api/subevents', async (req, res) => {
  try {
    const subevent = await subeventsModel.createSubEvent(req.body);
    res.status(201).json(subevent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create sub-event' });
  }
});

app.put('/api/subevents/:id', async (req, res) => {
  try {
    const subevent = await subeventsModel.updateSubEvent(req.params.id, req.body);
    if (!subevent) return res.status(404).json({ error: 'sub-event not found' });
    res.json(subevent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update sub-event' });
  }
});

app.delete('/api/subevents/:id', async (req, res) => {
  try {
    await subeventsModel.deleteSubEvent(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete sub-event' });
  }
});

// ============================================
// FILE MANAGEMENT
// ============================================

// List files in uploads
app.get('/api/uploads', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'failed to read uploads' });
    res.json({ files });
  });
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no file uploaded' });
  res.json({ filename: req.file.filename, path: `/uploads/${req.file.filename}` });
});

// Root route - serve CMS dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Fallback for SPA - serve index.html for unmatched routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    res.sendFile(path.join(publicPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'not found' });
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📍 Open http://localhost:${PORT} to access the CMS`);

  // Try DB connection on startup (non-fatal)
  try {
    await db.testConnection();
    console.log('🗄️  Connected to database successfully.');
  } catch (err) {
    console.warn('⚠️  Could not connect to database on startup. Endpoints that use DB will return errors.');
    console.warn(err.message || err);
  }
});
