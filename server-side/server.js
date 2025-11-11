const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Simple file-backed datastore for CMS content
const DATA_FILE = path.join(__dirname, 'data.json');
async function readData() {
  try {
    const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeData(data) {
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

// CMS endpoints
// List content items (optional ?type=image|video|text)
app.get('/api/content', async (req, res) => {
  try {
    const type = req.query.type;
    let items = await readData();
    if (type) items = items.filter(i => i.type === type);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read content' });
  }
});

// Get single item
app.get('/api/content/:id', async (req, res) => {
  try {
    const items = await readData();
    const item = items.find(i => i.id === req.params.id);
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
    const {
      contentType,
      name,
      slug,
      description = '',
      address = '',
      location = '',
      categoryId = '',
      parentCategoryId = '',
      brandId = '',
      phone = '',
      website = '',
      rating = 0,
      workingHours = '',
      featuredBusiness = false,
      featuredLocation = false
    } = req.body;

    // Validate required fields
    if (!contentType || !name) {
      return res.status(400).json({ error: 'contentType and name are required' });
    }

    // Build base item
    const item = {
      id: generateId(),
      contentType,
      name,
      slug: slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-'),
      description,
      address,
      location,
      categoryId,
      images: []
    };

    // Add file path if uploaded
    if (req.file) {
      item.images = [`/uploads/${req.file.filename}`];
    }

    // Add business-specific fields
    if (contentType === 'business') {
      item.parentCategoryId = parentCategoryId;
      item.brandId = brandId || null;
      item.phone = phone || '';
      item.website = website || '';
      item.rating = rating ? parseFloat(rating) : 0;
      item.workingHours = workingHours || '';
      item.featuredBusiness = featuredBusiness === 'true' || featuredBusiness === true;
    }

    // Add attraction-specific fields
    if (contentType === 'attraction') {
      item.featuredLocation = featuredLocation === 'true' || featuredLocation === true;
    }

    const data = await readData();
    data.unshift(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to create content' });
  }
});

// Update content (optionally replace file)
app.put('/api/content/:id', upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id;
    const data = await readData();
    const idx = data.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });

    const item = data[idx];
    const {
      name,
      slug,
      description,
      address,
      location,
      categoryId,
      parentCategoryId,
      brandId,
      phone,
      website,
      rating,
      workingHours,
      featuredBusiness,
      featuredLocation
    } = req.body;

    // Update common fields
    if (name !== undefined) item.name = name;
    if (slug !== undefined) item.slug = slug;
    if (description !== undefined) item.description = description;
    if (address !== undefined) item.address = address;
    if (location !== undefined) item.location = location;
    if (categoryId !== undefined) item.categoryId = categoryId;

    // Update business-specific fields
    if (item.contentType === 'business') {
      if (parentCategoryId !== undefined) item.parentCategoryId = parentCategoryId;
      if (brandId !== undefined) item.brandId = brandId || null;
      if (phone !== undefined) item.phone = phone;
      if (website !== undefined) item.website = website;
      if (rating !== undefined) item.rating = parseFloat(rating) || 0;
      if (workingHours !== undefined) item.workingHours = workingHours;
      if (featuredBusiness !== undefined) item.featuredBusiness = featuredBusiness === 'true' || featuredBusiness === true;
    }

    // Update attraction-specific fields
    if (item.contentType === 'attraction') {
      if (featuredLocation !== undefined) item.featuredLocation = featuredLocation === 'true' || featuredLocation === true;
    }

    // Handle file replacement
    if (req.file) {
      // Remove old file if present
      if (item.images && item.images.length > 0) {
        item.images.forEach(imgPath => {
          const oldPath = path.join(__dirname, 'uploads', path.basename(imgPath));
          fs.unlink(oldPath, () => {});
        });
      }
      item.images = [`/uploads/${req.file.filename}`];
    }

    data[idx] = item;
    await writeData(data);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to update content' });
  }
});

// Delete content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await readData();
    const idx = data.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const item = data.splice(idx, 1)[0];
    await writeData(data);
    
    // Clean up associated images
    if (item.images && item.images.length > 0) {
      item.images.forEach(imgPath => {
        const filePath = path.join(uploadsDir, path.basename(imgPath));
        fs.unlink(filePath, () => {});
      });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to delete content' });
  }
});

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

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📍 Open http://localhost:${PORT} to access the CMS`);
});
