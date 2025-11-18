require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { signToken, verifyToken, setAuthCookie, clearAuthCookie, TOKEN_COOKIE } = require('./db/auth');
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
const hotspotModel = require('./db/hotspot');
const supabase = require('./db/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Removed express-session to avoid Windows EPERM rename issues; using stateless JWT cookies instead.

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
// Separate in-memory storage for direct-to-Supabase uploads
const memoryUpload = multer({ storage: multer.memoryStorage() });
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'media';

// Helper to ensure bucket exists (auto-create if missing)
async function ensureBucketExists() {
  try {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    if (listErr) {
      console.warn('Storage listBuckets error:', listErr.message || listErr);
      return false;
    }
    if (buckets && buckets.find(b => b.name === STORAGE_BUCKET)) {
      return true;
    }
    const { error: createErr } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (createErr && !/exists/i.test(createErr.message || '')) {
      console.warn('Storage createBucket error:', createErr.message || createErr);
      return false;
    }
    console.log(`✅ Created storage bucket: ${STORAGE_BUCKET}`);
    return true;
  } catch (e) {
    console.warn('ensureBucketExists exception:', e.message || e);
    return false;
  }
}

// Auth middleware
// Auth middleware (JWT)
function requireAuth(req, res, next) {
  const token = req.cookies[TOKEN_COOKIE];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
  req.user = decoded;
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
    const token = signToken(user);
    setAuthCookie(res, token);
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
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies[TOKEN_COOKIE];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });
  res.json({ user: decoded });
});

// ============================================
// PUBLIC API ENDPOINTS (No Auth Required)
// For Next.js client-side website
// ============================================

// Get all published businesses with categories, types, and brands
app.get('/api/public/businesses', async (req, res) => {
  try {
    // Use the existing businessesModel which already has proper Supabase queries
    const businesses = await businessesModel.getAllBusinesses({});
    
    // Filter and format for public consumption
    const publicBusinesses = businesses.map(b => {
      // Parse media field - it can be JSON string array or null
      let images = [];
      if (b.media) {
        try {
          images = typeof b.media === 'string' ? JSON.parse(b.media) : b.media;
          if (!Array.isArray(images)) images = [];
        } catch (e) {
          images = [];
        }
      }
      
      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        description: b.description || '',
        address: b.address || '',
        location: b.location || '',
        phone: b.phone,
        website: b.website,
        rating: b.rating || 0,
        workingHours: b.working_hours || '',
        working_hours: b.working_hours || '', // Also include snake_case
        images: images,
        featuredBusiness: b.featured_business || false,
        featured_business: b.featured_business || false, // Also include snake_case
        brandId: b.brand_id,
        brand_id: b.brand_id, // Also include snake_case
        brandName: b.brand_name,
        brandSlug: b.brand_slug,
        categoryId: b.categories?.[0]?.name || b.categories?.[0]?.id || '',
        parentCategoryId: b.categories?.[0]?.id,
        categories: b.categories || [],
        types: b.types || []
      };
    });
    
    res.json(publicBusinesses);
  } catch (error) {
    console.error('Error fetching public businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get all categories with their types (subcategories)
app.get('/api/public/categories', async (req, res) => {
  try {
    const allCategories = await categoriesModel.getAllCategories();
    const types = await typesModel.getAllTypes();
    
    // Filter for only featured categories
    const categories = allCategories.filter(cat => cat.featured_category === true);
    
    // Group types by category
    const categoriesWithTypes = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      image: cat.image,
      coverImage: cat.image, // Also provide as coverImage for backward compatibility
      subcategories: types.filter(t => t.category_id === cat.id).map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug
      }))
    }));
    
    res.json(categoriesWithTypes);
  } catch (error) {
    console.error('Error fetching public categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get all published attractions with categories
app.get('/api/public/attractions', async (req, res) => {
  try {
    const attractions = await attractionsModel.getAllAttractions({});
    
    // Format for public API
    const publicAttractions = attractions.map(a => {
      // Parse media field - it can be JSON string array or null
      let images = [];
      if (a.media) {
        try {
          images = typeof a.media === 'string' ? JSON.parse(a.media) : a.media;
          if (!Array.isArray(images)) images = [];
        } catch (e) {
          images = [];
        }
      }
      
      return {
        id: a.id,
        name: a.name,
        slug: a.slug,
        description: a.description,
        address: a.address,
        location: a.location,
        images: images,
        featuredLocation: a.featured_location,
        categoryId: a.categories?.[0]?.name || a.categories?.[0]?.id,
        categories: a.categories || []
      };
    });
    
    res.json(publicAttractions);
  } catch (error) {
    console.error('Error fetching public attractions:', error);
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

// Get active events (current and upcoming)
app.get('/api/public/events', async (req, res) => {
  try {
    const events = await eventsModel.getAllEvents({ status: 'active' });
    const allSubevents = await subeventsModel.getAllSubEvents(null);
    
    // Add subevents to each event
    const eventsWithSubevents = events.map(e => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description,
      location: e.location,
      start_date: e.start_date,
      end_date: e.end_date,
      image: e.image,
      categories: e.categories || [],
      subevents: allSubevents.filter(se => se.event_id === e.id)
    }));
    
    res.json(eventsWithSubevents);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get all brands (for filtering)
app.get('/api/public/brands', async (req, res) => {
  try {
    const brands = await brandsModel.getAllBrands();
    
    res.json(brands);
  } catch (error) {
    console.error('Error fetching public brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Get all types (subcategories)
app.get('/api/public/types', async (req, res) => {
  try {
    const types = await typesModel.getAllTypes();
    const categories = await categoriesModel.getAllCategories();
    
    // Add category info to each type
    const typesWithCategory = types.map(t => {
      const cat = categories.find(c => c.id === t.category_id);
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        category_id: t.category_id,
        category_name: cat?.name,
        category_slug: cat?.slug
      };
    });
    
    res.json(typesWithCategory);
  } catch (error) {
    console.error('Error fetching public types:', error);
    res.status(500).json({ error: 'Failed to fetch types' });
  }
});

// Get subevents for a specific event or all subevents
app.get('/api/public/subevents', async (req, res) => {
  try {
    const eventId = req.query.event_id;
    const subevents = await subeventsModel.getAllSubEvents(eventId || null);
    const events = await eventsModel.getAllEvents({});
    
    // Add event info to each subevent
    const subeventsWithEvent = subevents.map(se => {
      const event = events.find(e => e.id === se.event_id);
      return {
        id: se.id,
        event_id: se.event_id,
        description: se.description,
        start_date: se.start_date,
        end_date: se.end_date,
        location: se.location,
        event_name: event?.name,
        event_slug: event?.slug
      };
    });
    
    res.json(subeventsWithEvent);
  } catch (error) {
    console.error('Error fetching public subevents:', error);
    res.status(500).json({ error: 'Failed to fetch subevents' });
  }
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
    if (req.file) body.images = [`/uploads/${req.file.filename}`];
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

app.put('/api/categories/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    await categoriesModel.reorderCategories(orderedIds);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to reorder categories' });
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

app.put('/api/businesses/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds must be an array' });
    }
    await businessesModel.reorderBusinesses(orderedIds);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to reorder businesses' });
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
// HOTSPOT CONFIG - BLOCK SETS
// ============================================

app.get('/api/hotspot/blocks', (req, res) => {
  try {
    const sets = hotspotModel.getBlockSets();
    res.json({ blockSets: sets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read hotspot blocks' });
  }
});

app.put('/api/hotspot/blocks', async (req, res) => {
  try {
    if (!Array.isArray(req.body.blockSets)) {
      return res.status(400).json({ error: 'blockSets array required' });
    }
    const saved = hotspotModel.saveBlockSets(req.body.blockSets);
    res.json({ blockSets: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save hotspot blocks' });
  }
});

app.get('/api/hotspot/footer', (req, res) => {
  try {
    res.json(hotspotModel.getFooter());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read footer' });
  }
});

app.put('/api/hotspot/footer', (req, res) => {
  try {
    const saved = hotspotModel.saveFooter(req.body);
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save footer' });
  }
});

app.get('/api/hotspot/editors-picks', (req, res) => {
  try {
    res.json({ picks: hotspotModel.getEditorsPicks() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read editors picks' });
  }
});

app.put('/api/hotspot/editors-picks', (req, res) => {
  try {
    if (!Array.isArray(req.body.picks)) {
      return res.status(400).json({ error: 'picks array required' });
    }
    const saved = hotspotModel.saveEditorsPicks(req.body.picks);
    res.json({ picks: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save editors picks' });
  }
});

app.get('/api/hotspot/discovery', (req, res) => {
  try {
    res.json({ places: hotspotModel.getDiscovery() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read discovery' });
  }
});

app.put('/api/hotspot/discovery', (req, res) => {
  try {
    if (!Array.isArray(req.body.places)) {
      return res.status(400).json({ error: 'places array required' });
    }
    const saved = hotspotModel.saveDiscovery(req.body.places);
    res.json({ places: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save discovery' });
  }
});

app.get('/api/hotspot/quick-fun', (req, res) => {
  try {
    res.json(hotspotModel.getQuickFun());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read quick fun' });
  }
});

app.put('/api/hotspot/quick-fun', (req, res) => {
  try {
    const saved = hotspotModel.saveQuickFun(req.body);
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save quick fun' });
  }
});

app.get('/api/hotspot/utilities', (req, res) => {
  try {
    res.json(hotspotModel.getUtilities());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read utilities' });
  }
});

app.put('/api/hotspot/utilities', (req, res) => {
  try {
    const saved = hotspotModel.saveUtilities(req.body);
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to save utilities' });
  }
});

// ============================================
// FILE MANAGEMENT
// ============================================

// List files in uploads
app.get('/api/uploads', async (req, res) => {
  try {
    // List files from Supabase Storage under 'uploads/' prefix
    const prefix = 'uploads';
    const { data: files, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (error) {
      if (/not\s*found|does\s*not\s*exist/i.test(error.message || '')) {
        const ok = await ensureBucketExists();
        if (!ok) {
          return res.status(500).json({ error: 'Bucket not found and could not be created (service role key required)' });
        }
        // Retry once
        const retry = await supabase.storage.from(STORAGE_BUCKET).list(prefix, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
        if (retry.error) return res.status(500).json({ error: retry.error.message });
        const retryFiles = retry.data || [];
        const result = retryFiles
          .filter(f => f && f.name && f.name !== '.emptyFolderPlaceholder')
          .map(f => {
            const path = `${prefix}/${f.name}`;
            const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            return { name: f.name, path, url: data.publicUrl };
          });
        return res.json({ files: result });
      }
      return res.status(500).json({ error: error.message });
    }

    const result = (files || [])
      .filter(f => f && f.name && f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const path = `${prefix}/${f.name}`;
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        return { name: f.name, path, url: data.publicUrl };
      });

    res.json({ files: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to list uploads' });
  }
});

// Upload endpoint -> Supabase Storage (MinIO)
app.post('/api/upload', memoryUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file uploaded' });

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '_');
    const storagePath = `uploads/${unique}-${safeName}`;

    let { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });
    if (uploadError) {
      // Try to create the bucket if missing (requires service role key)
      if (/not\s*found|does\s*not\s*exist/i.test(uploadError.message || '') || uploadError.statusCode === 404) {
        try {
          const ok = await ensureBucketExists();
          if (!ok) {
            return res.status(500).json({ error: 'Bucket not found and could not be created (service role key required)' });
          }
          // Retry upload once
          const retry = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, req.file.buffer, {
              contentType: req.file.mimetype,
              upsert: false
            });
          uploadError = retry.error || null;
        } catch (e) {
          console.error('Bucket create exception:', e.message);
          return res.status(500).json({ error: 'Could not create bucket: ' + e.message });
        }
      }
      if (uploadError) {
        console.error('Upload error:', uploadError.message || uploadError);
        return res.status(500).json({ error: uploadError.message || 'upload failed' });
      }
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    return res.json({ filename: safeName, path: storagePath, url: data.publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload failed' });
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
