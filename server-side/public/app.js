// ============================================
// EXPLORE SARAJEVO CMS - Main Application
// ============================================

const API_BASE = '';
let currentView = 'dashboard';
let allCategories = [];
let allTypes = [];
let allBrands = [];
let allEvents = [];
let currentUser = null;
let currentSite = 'explore-sarajevo'; // Default site
let hotspotBlockSets = []; // Hotspot Blocks configuration loaded from API
let hotspotCollapsedSets = {}; // UI-only collapse state for sets
let hotspotCollapsedBlocks = {}; // UI-only collapse state for individual blocks
let hotspotFooter = { icons: [], styles: {} };
let hotspotEditorsPicks = [];
let hotspotDiscovery = [];
let hotspotQuickFun = {};
let hotspotUtilities = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupAuthForms();
});

// ============================================
// AUTHENTICATION
// ============================================

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showCMS();
        } else {
            showAuth();
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        showAuth();
    }
}

function showAuth() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('cms-container').style.display = 'none';
}

function showCMS() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('cms-container').style.display = 'flex';
    document.getElementById('current-user').textContent = `👤 ${currentUser.username}`;
    initNavigation();
    setupSiteSelector();
    loadData();
    showView('dashboard');
    setupModal();
}

function setupAuthForms() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.getElementById('login-form').style.display = tabName === 'login' ? 'block' : 'none';
            document.getElementById('register-form').style.display = tabName === 'register' ? 'block' : 'none';
            
            // Clear errors
            document.getElementById('login-error').classList.remove('show');
            document.getElementById('register-error').classList.remove('show');
        });
    });
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const errorEl = document.getElementById('login-error');
        
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.get('username'),
                    password: formData.get('password')
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                currentUser = data.user;
                showCMS();
            } else {
                errorEl.textContent = data.error || 'Login failed';
                errorEl.classList.add('show');
            }
        } catch (err) {
            console.error('Login error:', err);
            errorEl.textContent = 'Network error. Please try again.';
            errorEl.classList.add('show');
        }
    });
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const errorEl = document.getElementById('register-error');
        
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                currentUser = data.user;
                showCMS();
            } else {
                errorEl.textContent = data.error || 'Registration failed';
                errorEl.classList.add('show');
            }
        } catch (err) {
            console.error('Register error:', err);
            errorEl.textContent = 'Network error. Please try again.';
            errorEl.classList.add('show');
        }
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            currentUser = null;
            showAuth();
        } catch (err) {
            console.error('Logout error:', err);
        }
    });
}

function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showView(view);
        });
    });
}

function setupSiteSelector() {
    const siteSelect = document.getElementById('site-select');
    
    // Load saved site preference
    const savedSite = localStorage.getItem('selectedSite');
    if (savedSite) {
        currentSite = savedSite;
        siteSelect.value = savedSite;
    }
    
    // Load navigation for current site
    loadNavigationForSite(currentSite);
    
    // Handle site change
    siteSelect.addEventListener('change', (e) => {
        currentSite = e.target.value;
        localStorage.setItem('selectedSite', currentSite);
        
        // Show notification
        showNotification(`Switched to ${getSiteName(currentSite)}`, 'success');
        
        // Update navigation
        loadNavigationForSite(currentSite);
        
        // Reload data for the new site
        loadData();
        showView('dashboard');
    });
}

function loadNavigationForSite(siteId) {
    const navContainer = document.getElementById('sidebar-nav');
    
    let navHTML = '';
    
    if (siteId === 'explore-sarajevo') {
        navHTML = `
            <div class="nav-section">
                <h3>Dashboard</h3>
                <a href="#" data-view="dashboard" class="nav-link active">
                    <span>📊</span> Dashboard
                </a>
            </div>

            <div class="nav-section">
                <h3>Content</h3>
                <a href="#" data-view="brands" class="nav-link"><span>🏷️</span> Brands</a>
                <a href="#" data-view="businesses" class="nav-link"><span>🏢</span> Businesses</a>
                <a href="#" data-view="attractions" class="nav-link"><span>🏛️</span> Attractions</a>
                <a href="#" data-view="events" class="nav-link"><span>🎉</span> Events</a>
                <a href="#" data-view="subevents" class="nav-link"><span>📅</span> Sub-events</a>
            </div>

            <div class="nav-section">
                <h3>Taxonomies</h3>
                <a href="#" data-view="categories" class="nav-link"><span>📁</span> Categories</a>
                <a href="#" data-view="types" class="nav-link"><span>🏷️</span> Types</a>
            </div>
        `;
    } else if (siteId === 'hotspot') {
        navHTML = `
            <div class="nav-section">
                <h3>Dashboard</h3>
                <a href="#" data-view="dashboard" class="nav-link active">
                    <span>📊</span> Dashboard
                </a>
            </div>

            <div class="nav-section">
                <h3>Content</h3>
                <a href="#" data-view="global" class="nav-link"><span>🌍</span> Global</a>
                <a href="#" data-view="hero-video" class="nav-link"><span>🎬</span> Hero Video</a>
                <a href="#" data-view="chips" class="nav-link"><span>🎯</span> Chips</a>
                <a href="#" data-view="hero-banner" class="nav-link"><span>🖼️</span> Hero Banner</a>
                <a href="#" data-view="blocks" class="nav-link"><span>🧱</span> Blocks</a>
                <a href="#" data-view="footer" class="nav-link"><span>📄</span> Footer</a>
                <a href="#" data-view="editors-picks" class="nav-link"><span>⭐</span> Editors Picks</a>
                <a href="#" data-view="discovery" class="nav-link"><span>🔍</span> Discovery</a>
                <a href="#" data-view="quick-fun" class="nav-link"><span>⚡</span> Quick Fun</a>
                <a href="#" data-view="utilities" class="nav-link"><span>🛠️</span> Utilities</a>
                <a href="#" data-view="sections" class="nav-link"><span>📑</span> Sections</a>
            </div>
        `;
    } else if (siteId === 'pametno-odabrano') {
        navHTML = `
            <div class="nav-section">
                <h3>Dashboard</h3>
                <a href="#" data-view="dashboard" class="nav-link active">
                    <span>📊</span> Dashboard
                </a>
            </div>

            <div class="nav-section">
                <h3>Content</h3>
                <a href="#" data-view="featured" class="nav-link"><span>⭐</span> Featured</a>
                <a href="#" data-view="smart-devices" class="nav-link"><span>📱</span> Smart Devices</a>
                <a href="#" data-view="power-of-sound" class="nav-link"><span>🔊</span> Power of Sound</a>
                <a href="#" data-view="home-experiences" class="nav-link"><span>🏠</span> Home full of experiences</a>
                <a href="#" data-view="control-fingertips" class="nav-link"><span>👆</span> Control at your fingertips</a>
                <a href="#" data-view="capture-moment" class="nav-link"><span>📸</span> Capture every moment</a>
                <a href="#" data-view="visual-elegance" class="nav-link"><span>✨</span> Visual elegance</a>
            </div>
        `;
    }
    
    navContainer.innerHTML = navHTML;
    
    // Re-initialize navigation listeners
    initNavigation();
}

function getSiteName(siteId) {
    const siteNames = {
        'explore-sarajevo': 'Explore Sarajevo',
        'hotspot': 'Hotspot',
        'pametno-odabrano': 'Pametno Odabrano'
    };
    return siteNames[siteId] || siteId;
}

async function loadData() {
    try {
        [allCategories, allTypes, allBrands, allEvents] = await Promise.all([
            fetchAPI('/api/categories'),
            fetchAPI('/api/types'),
            fetchAPI('/api/brands'),
            fetchAPI('/api/events')
        ]);
    } catch (err) {
        console.error('Error loading reference data:', err);
    }
}

// ============================================
// API HELPERS
// ============================================

async function fetchAPI(endpoint, options = {}) {
    const response = await fetch(API_BASE + endpoint, options);
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
}

async function postAPI(endpoint, data) {
    return fetchAPI(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function putAPI(endpoint, data) {
    return fetchAPI(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function deleteAPI(endpoint) {
    return fetchAPI(endpoint, { method: 'DELETE' });
}

// ============================================
// VIEW ROUTER
// ============================================

async function showView(view) {
    currentView = view;
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        switch (view) {
            case 'dashboard':
                await renderDashboard(container);
                break;
            // Explore Sarajevo views
            case 'categories':
                await renderCategories(container);
                break;
            case 'types':
                await renderTypes(container);
                break;
            case 'brands':
                await renderBrands(container);
                break;
            case 'businesses':
                await renderBusinesses(container);
                break;
            case 'attractions':
                await renderAttractions(container);
                break;
            case 'events':
                await renderEvents(container);
                break;
            case 'subevents':
                await renderSubEvents(container);
                break;
            // Hotspot views
            case 'global':
                await renderHotspotSection(container, 'Global', 'global');
                break;
            case 'hero-video':
                await renderHotspotSection(container, 'Hero Video', 'hero-video');
                break;
            case 'chips':
                await renderHotspotSection(container, 'Chips', 'chips');
                break;
            case 'hero-banner':
                await renderHotspotSection(container, 'Hero Banner', 'hero-banner');
                break;
            case 'blocks':
                await renderHotspotSection(container, 'Blocks', 'blocks');
                break;
            case 'footer':
                await renderHotspotSection(container, 'Footer', 'footer');
                break;
            case 'editors-picks':
                await renderHotspotSection(container, 'Editors Picks', 'editors-picks');
                break;
            case 'discovery':
                await renderHotspotSection(container, 'Discovery', 'discovery');
                break;
            case 'quick-fun':
                await renderHotspotSection(container, 'Quick Fun', 'quick-fun');
                break;
            case 'utilities':
                await renderHotspotSection(container, 'Utilities', 'utilities');
                break;
            case 'sections':
                await renderHotspotSection(container, 'Sections', 'sections');
                break;
            // Pametno Odabrano views
            case 'featured':
                await renderPametnoSection(container, 'Featured', 'featured');
                break;
            case 'smart-devices':
                await renderPametnoSection(container, 'Smart Devices', 'smart-devices');
                break;
            case 'power-of-sound':
                await renderPametnoSection(container, 'Power of Sound', 'power-of-sound');
                break;
            case 'home-experiences':
                await renderPametnoSection(container, 'Home full of experiences', 'home-experiences');
                break;
            case 'control-fingertips':
                await renderPametnoSection(container, 'Control at your fingertips', 'control-fingertips');
                break;
            case 'capture-moment':
                await renderPametnoSection(container, 'Capture every moment', 'capture-moment');
                break;
            case 'visual-elegance':
                await renderPametnoSection(container, 'Visual elegance', 'visual-elegance');
                break;
            default:
                container.innerHTML = '<p>View not found</p>';
        }
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Error loading view: ${err.message}</div>`;
    }
}

// ============================================
// DASHBOARD VIEW
// ============================================

async function renderDashboard(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>📊 Dashboard - ${getSiteName(currentSite)}</h1>
            <p>Overview of your content for ${getSiteName(currentSite)}</p>
        </div>
    `;

    if (currentSite === 'explore-sarajevo') {
        await renderExploreSarajevoDashboard(container);
    } else if (currentSite === 'hotspot') {
        await renderHotspotDashboard(container);
    } else if (currentSite === 'pametno-odabrano') {
        await renderPametnoOdabranoDashboard(container);
    }
}

async function renderExploreSarajevoDashboard(container) {
    const [categories, types, brands, businesses, attractions, events] = await Promise.all([
        fetchAPI('/api/categories'),
        fetchAPI('/api/types'),
        fetchAPI('/api/brands'),
        fetchAPI('/api/businesses'),
        fetchAPI('/api/attractions'),
        fetchAPI('/api/events')
    ]);

    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Businesses</h3>
                <div class="value">${businesses.length}</div>
            </div>
            <div class="stat-card">
                <h3>Attractions</h3>
                <div class="value">${attractions.length}</div>
            </div>
            <div class="stat-card">
                <h3>Events</h3>
                <div class="value">${events.length}</div>
            </div>
            <div class="stat-card">
                <h3>Brands</h3>
                <div class="value">${brands.length}</div>
            </div>
            <div class="stat-card">
                <h3>Categories</h3>
                <div class="value">${categories.length}</div>
            </div>
            <div class="stat-card">
                <h3>Types</h3>
                <div class="value">${types.length}</div>
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h2>Recent Events</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Date Range</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.slice(0, 5).map(e => `
                        <tr>
                            <td>${e.name}</td>
                            <td><span class="badge badge-${e.status === 'published' ? 'success' : 'warning'}">${e.status}</span></td>
                            <td>${e.start_date ? new Date(e.start_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML += statsHTML;
}

async function renderHotspotDashboard(container) {
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Global Settings</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Hero Videos</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Chips</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Hero Banners</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Blocks</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Sections</h3>
                <div class="value">0</div>
            </div>
        </div>

        <div class="table-container">
            <div style="padding: 40px; text-align: center; color: var(--text-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                <h3 style="margin-bottom: 8px;">Hotspot Dashboard</h3>
                <p>Content management for Hotspot. Start by selecting a section from the sidebar.</p>
            </div>
        </div>
    `;
    
    container.innerHTML += statsHTML;
}

async function renderPametnoOdabranoDashboard(container) {
    const statsHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Featured</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Smart Devices</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Power of Sound</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Home Experiences</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Control Features</h3>
                <div class="value">0</div>
            </div>
            <div class="stat-card">
                <h3>Capture Moments</h3>
                <div class="value">0</div>
            </div>
        </div>

        <div class="table-container">
            <div style="padding: 40px; text-align: center; color: var(--text-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
                <h3 style="margin-bottom: 8px;">Pametno Odabrano Dashboard</h3>
                <p>Smart shopping content management. Start by selecting a section from the sidebar.</p>
            </div>
        </div>
    `;
    
    container.innerHTML += statsHTML;
}

// ============================================
// CATEGORIES VIEW
// ============================================

async function renderCategories(container) {
    const categories = await fetchAPI('/api/categories');
    allCategories = categories;

    container.innerHTML = `
        <div class="page-header">
            <h1>📁 Categories</h1>
            <p>Manage content categories</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openCategoryForm()">+ Add Category</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td><strong>${cat.name}</strong></td>
                            <td>${cat.slug}</td>
                            <td>${cat.image ? `<img src="${cat.image}" style="height: 30px">` : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editCategory(${JSON.stringify(cat)})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openCategoryForm(data = null) {
    const isEdit = !!data;
    showModal(`
        <h2>${isEdit ? 'Edit' : 'Add'} Category</h2>
        <form id="category-form">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${data?.name || ''}" required placeholder="Category name">
            </div>
            <div class="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated" readonly>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Brief description">${data?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image</label>
                <input type="file" id="category-image-file" accept="image/*" onchange="uploadCategoryImage()" style="margin-bottom: 8px;">
                <div id="category-image-preview" style="margin-bottom: 8px;">
                    ${data?.image ? `
                        <div class="media-item" style="display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 4px;">
                            <img src="${data.image}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                            <span style="flex: 1; font-size: 12px; word-break: break-all;">${data.image}</span>
                            <button type="button" class="btn btn-sm btn-danger" onclick="removeCategoryImage()">🗑️</button>
                        </div>
                    ` : '<div style="padding: 8px; color: #999; font-size: 12px;">No image uploaded yet</div>'}
                </div>
                <input type="text" name="image" id="category-image-url" value="${data?.image || ''}" style="display: none;">
                <small class="form-help-text" id="category-upload-status">Select an image to upload</small>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit ? '💾 Save Changes' : '✨ Create Category'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        
        try {
            if (isEdit) {
                await putAPI(`/api/categories/${data.id}`, payload);
            } else {
                await postAPI('/api/categories', payload);
            }
            closeModal();
            showView('categories');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editCategory(cat) {
    openCategoryForm(cat);
}

async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await deleteAPI(`/api/categories/${id}`);
    showView('categories');
}

async function uploadCategoryImage() {
    const fileInput = document.getElementById('category-image-file');
    const urlInput = document.getElementById('category-image-url');
    const preview = document.getElementById('category-image-preview');
    const statusText = document.getElementById('category-upload-status');
    if (!fileInput.files || !fileInput.files[0]) return;
    
    statusText.textContent = 'Uploading...';
    statusText.style.color = '#666';
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
        const resp = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error('Upload failed');
        const result = await resp.json();
        urlInput.value = result.url;
        
        // Update preview
        preview.innerHTML = `
            <div class="media-item" style="display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 4px;">
                <img src="${result.url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <span style="flex: 1; font-size: 12px; word-break: break-all;">${result.url}</span>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeCategoryImage()">🗑️</button>
            </div>
        `;
        
        fileInput.value = '';
        statusText.textContent = '✅ Upload successful';
        statusText.style.color = '#28a745';
    } catch (err) {
        statusText.textContent = '❌ Upload failed: ' + err.message;
        statusText.style.color = '#dc3545';
    }
}

function removeCategoryImage() {
    const urlInput = document.getElementById('category-image-url');
    const preview = document.getElementById('category-image-preview');
    urlInput.value = '';
    preview.innerHTML = '<div style="padding: 8px; color: #999; font-size: 12px;">No image uploaded yet</div>';
}

// ============================================
// TYPES VIEW (similar to categories)
// ============================================

async function renderTypes(container) {
    const types = await fetchAPI('/api/types');
    allTypes = types;

    container.innerHTML = `
        <div class="page-header">
            <h1>🏷️ Types</h1>
            <p>Manage content types</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openTypeForm()">+ Add Type</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${types.map(type => `
                        <tr>
                            <td><strong>${type.name}</strong></td>
                            <td>${type.slug}</td>
                            <td>${type.image ? `<img src="${type.image}" style="height: 30px">` : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editType(${JSON.stringify(type)})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteType(${type.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openTypeForm(data = null) {
    const isEdit = !!data;
    showModal(`
        <h2>${isEdit ? 'Edit' : 'Add'} Type</h2>
        <form id="type-form">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${data?.name || ''}" required placeholder="Type name">
            </div>
            <div class="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated" readonly>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Brief description">${data?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" name="image" value="${data?.image || ''}" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit ? '💾 Save Changes' : '✨ Create Type'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('type-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        
        try {
            if (isEdit) {
                await putAPI(`/api/types/${data.id}`, payload);
            } else {
                await postAPI('/api/types', payload);
            }
            closeModal();
            showView('types');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editType(type) {
    openTypeForm(type);
}

async function deleteType(id) {
    if (!confirm('Delete this type?')) return;
    await deleteAPI(`/api/types/${id}`);
    showView('types');
}

// ============================================
// BRANDS VIEW
// ============================================

async function renderBrands(container) {
    const brands = await fetchAPI('/api/brands');
    allBrands = brands;

    container.innerHTML = `
        <div class="page-header">
            <h1>🏷️ Brands</h1>
            <p>Manage brands and brand hierarchy</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openBrandForm()">+ Add Brand</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Parent Brand</th>
                        <th>PDV</th>
                        <th>Businesses</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${brands.map(brand => `
                        <tr>
                            <td><strong>${brand.name}</strong></td>
                            <td>${brand.slug}</td>
                            <td>${brand.parent_brand_name || '-'}</td>
                            <td>${brand.brand_pdv || '-'}</td>
                            <td>${brand.business_count || 0}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editBrand(${JSON.stringify(brand)})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteBrand(${brand.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openBrandForm(data = null) {
    const isEdit = !!data;
    showModal(`
        <h2>${isEdit ? 'Edit' : 'Add'} Brand</h2>
        <form id="brand-form">
            <div class="form-section">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${data?.name || ''}" required placeholder="Brand name">
                </div>
                <div class="form-group">
                    <label>Slug</label>
                    <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated" readonly>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" placeholder="Brief description">${data?.description || ''}</textarea>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Brand Hierarchy & Details</h3>
                <div class="form-group">
                    <label>Parent Brand</label>
                    <select name="parent_brand_id">
                        <option value="">None (Top-level brand)</option>
                        ${allBrands.filter(b => b.id !== data?.id).map(b => `
                            <option value="${b.id}" ${data?.parent_brand_id === b.id ? 'selected' : ''}>${b.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Brand PDV / VAT Number</label>
                    <input type="text" name="brand_pdv" value="${data?.brand_pdv || ''}" placeholder="Tax identification number">
                </div>
                <div class="form-group">
                    <label>External Business ID</label>
                    <input type="text" name="business_id" value="${data?.business_id || ''}" placeholder="Reference ID from external system">
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${isEdit ? '💾 Save Changes' : '✨ Create Brand'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('brand-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = Object.fromEntries(formData);
        if (!payload.parent_brand_id) delete payload.parent_brand_id;
        
        try {
            if (isEdit) {
                await putAPI(`/api/brands/${data.id}`, payload);
            } else {
                await postAPI('/api/brands', payload);
            }
            closeModal();
            await loadData();
            showView('brands');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editBrand(brand) {
    openBrandForm(brand);
}

async function deleteBrand(id) {
    if (!confirm('Delete this brand?')) return;
    await deleteAPI(`/api/brands/${id}`);
    await loadData();
    showView('brands');
}

// ============================================
// BUSINESSES VIEW
// ============================================

async function renderBusinesses(container) {
    const businesses = await fetchAPI('/api/businesses');

    container.innerHTML = `
        <div class="page-header">
            <h1>🏢 Businesses</h1>
            <p>Manage businesses and services</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openBusinessForm()">+ Add Business</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Brand</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${businesses.map(b => `
                        <tr>
                            <td><strong>${b.name}</strong></td>
                            <td>${b.brand_name || '-'}</td>
                            <td>${b.location || '-'}</td>
                            <td>${b.rating || '-'}</td>
                            <td>${b.featured_business ? '<span class="badge badge-success">Yes</span>' : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editBusiness(${b.id})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteBusiness(${b.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function openBusinessForm(id = null) {
    let data = null;
    if (id) {
        data = await fetchAPI(`/api/businesses/${id}`);
    }

    const categoryIds = data?.categories?.map(c => c.id) || [];
    const typeIds = data?.types?.map(t => t.id) || [];

    showModal(`
        <h2>${id ? 'Edit' : 'Add'} Business</h2>
        <form id="business-form">
            <div class="form-section">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${data?.name || ''}" required placeholder="Enter business name">
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Slug</label>
                        <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated" readonly>
                    </div>
                    <div class="form-group">
                        <label>Brand</label>
                        <select name="brand_id">
                            <option value="">None</option>
                            ${allBrands.map(b => `
                                <option value="${b.id}" ${data?.brand_id === b.id ? 'selected' : ''}>${b.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" placeholder="Brief description of the business">${data?.description || ''}</textarea>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Location Details</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Address</label>
                        <input type="text" name="address" value="${data?.address || ''}" placeholder="Street address">
                    </div>
                    <div class="form-group">
                        <label>Coordinates</label>
                        <input type="text" name="location" value="${data?.location || ''}" placeholder="lat,lng">
                        <small class="form-help-text">Format: 43.8563,18.4131</small>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Contact Information</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="text" name="telephone" value="${data?.telephone || ''}" placeholder="+387 33 123 456">
                    </div>
                    <div class="form-group">
                        <label>Website</label>
                        <input type="url" name="website" value="${data?.website || ''}" placeholder="https://example.com">
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Additional Details</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Rating</label>
                        <input type="number" name="rating" step="0.1" min="0" max="5" value="${data?.rating || ''}" placeholder="0.0 - 5.0">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="featured_business" ${data?.featured_business ? 'checked' : ''}>
                            Featured Business
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label>Working Hours</label>
                    <input type="text" name="working_hours" value="${data?.working_hours || ''}" placeholder="Mon–Fri 08:00–20:00; Sat–Sun 10:00–18:00">
                    <small class="form-help-text">Use semicolons to separate day ranges. Example: Mon–Fri 09:00–18:00; Sat 10:00–14:00</small>
                </div>
                <div class="form-group">
                    <label>Media</label>
                    <input type="file" id="business-media-file" accept="image/*,video/*" onchange="uploadBusinessMedia()" style="margin-bottom: 8px;">
                    <div id="business-media-list" style="margin-bottom: 8px;">
                        ${Array.isArray(data?.media) ? data.media.map((url, idx) => `
                            <div class="media-item" style="display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 4px;">
                                <img src="${url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                                <span style="flex: 1; font-size: 12px; word-break: break-all;">${url}</span>
                                <button type="button" class="btn btn-sm btn-danger" onclick="removeBusinessMedia(${idx})">🗑️</button>
                            </div>
                        `).join('') : '<div style="padding: 8px; color: #999; font-size: 12px;">No media uploaded yet</div>'}
                    </div>
                    <textarea name="media_urls" id="business-media-urls" rows="2" style="display: none;">${Array.isArray(data?.media) ? data.media.join('\n') : ''}</textarea>
                    <small class="form-help-text" id="business-upload-status">Select files to upload</small>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Classification</h3>
                <div class="form-group">
                    <label>Categories</label>
                    <div class="checkbox-grid">
                        ${allCategories.map(c => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="category_ids" value="${c.id}" ${categoryIds.includes(c.id) ? 'checked' : ''}>
                                <span>${c.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    ${allCategories.length === 0 ? '<small class="form-help-text">No categories available. Create some in the Categories section first.</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Types</label>
                    <div class="checkbox-grid">
                        ${allTypes.map(t => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="type_ids" value="${t.id}" ${typeIds.includes(t.id) ? 'checked' : ''}>
                                <span>${t.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    ${allTypes.length === 0 ? '<small class="form-help-text">No types available. Create some in the Types section first.</small>' : ''}
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${id ? '💾 Save Changes' : '✨ Create Business'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('business-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            brand_id: formData.get('brand_id') || null,
            description: formData.get('description'),
            address: formData.get('address'),
            location: formData.get('location'),
            telephone: formData.get('telephone'),
            website: formData.get('website'),
            rating: formData.get('rating') ? parseFloat(formData.get('rating')) : null,
            working_hours: formData.get('working_hours'),
            featured_business: formData.get('featured_business') === 'on',
            category_ids: Array.from(formData.getAll('category_ids')).map(Number),
            type_ids: Array.from(formData.getAll('type_ids')).map(Number),
            media: (() => {
                const raw = formData.get('media_urls');
                if (!raw) return null;
                const list = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
                return list.length ? list : null;
            })()
        };
        
        try {
            if (id) {
                await putAPI(`/api/businesses/${id}`, payload);
            } else {
                await postAPI('/api/businesses', payload);
            }
            closeModal();
            showView('businesses');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editBusiness(id) {
    openBusinessForm(id);
}

async function deleteBusiness(id) {
    if (!confirm('Delete this business?')) return;
    await deleteAPI(`/api/businesses/${id}`);
    showView('businesses');
}

async function uploadBusinessMedia() {
    const fileInput = document.getElementById('business-media-file');
    const textarea = document.getElementById('business-media-urls');
    const mediaList = document.getElementById('business-media-list');
    const statusText = document.getElementById('business-upload-status');
    if (!fileInput.files || !fileInput.files[0]) return;
    
    statusText.textContent = 'Uploading...';
    statusText.style.color = '#666';
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    try {
        const resp = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!resp.ok) throw new Error('Upload failed');
        const result = await resp.json();
        const currentUrls = textarea.value.trim();
        const newUrls = currentUrls ? `${currentUrls}\n${result.url}` : result.url;
        textarea.value = newUrls;
        
        // Update visual list
        const urls = newUrls.split('\n').filter(Boolean);
        const idx = urls.length - 1;
        if (mediaList.innerHTML.includes('No media uploaded yet')) {
            mediaList.innerHTML = '';
        }
        mediaList.innerHTML += `
            <div class="media-item" style="display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 4px;">
                <img src="${result.url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <span style="flex: 1; font-size: 12px; word-break: break-all;">${result.url}</span>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeBusinessMedia(${idx})">🗑️</button>
            </div>
        `;
        
        fileInput.value = '';
        statusText.textContent = '✅ Upload successful';
        statusText.style.color = '#28a745';
    } catch (err) {
        statusText.textContent = '❌ Upload failed: ' + err.message;
        statusText.style.color = '#dc3545';
    }
}

function removeBusinessMedia(index) {
    const textarea = document.getElementById('business-media-urls');
    const mediaList = document.getElementById('business-media-list');
    const urls = textarea.value.split('\n').filter(Boolean);
    urls.splice(index, 1);
    textarea.value = urls.join('\n');
    
    // Rebuild visual list
    if (urls.length === 0) {
        mediaList.innerHTML = '<div style="padding: 8px; color: #999; font-size: 12px;">No media uploaded yet</div>';
    } else {
        mediaList.innerHTML = urls.map((url, idx) => `
            <div class="media-item" style="display: flex; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 4px;">
                <img src="${url}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <span style="flex: 1; font-size: 12px; word-break: break-all;">${url}</span>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeBusinessMedia(${idx})">🗑️</button>
            </div>
        `).join('');
    }
}

// ============================================
// ATTRACTIONS VIEW (similar to businesses)
// ============================================

async function renderAttractions(container) {
    const attractions = await fetchAPI('/api/attractions');

    container.innerHTML = `
        <div class="page-header">
            <h1>🏛️ Attractions</h1>
            <p>Manage tourist attractions and landmarks</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openAttractionForm()">+ Add Attraction</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Featured</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${attractions.map(a => `
                        <tr>
                            <td><strong>${a.name}</strong></td>
                            <td>${a.location || '-'}</td>
                            <td>${a.featured_location ? '<span class="badge badge-success">Yes</span>' : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editAttraction(${a.id})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteAttraction(${a.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function openAttractionForm(id = null) {
    let data = null;
    if (id) {
        data = await fetchAPI(`/api/attractions/${id}`);
    }

    const categoryIds = data?.categories?.map(c => c.id) || [];
    const typeIds = data?.types?.map(t => t.id) || [];

    showModal(`
        <h2>${id ? 'Edit' : 'Add'} Attraction</h2>
        <form id="attraction-form">
            <div class="form-section">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" value="${data?.name || ''}" required placeholder="Enter attraction name">
                </div>
                <div class="form-group">
                    <label>Slug</label>
                    <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated" readonly>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" placeholder="Brief description of the attraction">${data?.description || ''}</textarea>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Location Details</h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Address</label>
                        <input type="text" name="address" value="${data?.address || ''}" placeholder="Street address">
                    </div>
                    <div class="form-group">
                        <label>Coordinates</label>
                        <input type="text" name="location" value="${data?.location || ''}" placeholder="lat,lng">
                        <small class="form-help-text">Format: 43.8563,18.4131</small>
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="featured_location" ${data?.featured_location ? 'checked' : ''}>
                        Featured Location
                    </label>
                </div>
            </div>

            <div class="form-section">
                <h3 class="form-section-title">Classification</h3>
                <div class="form-group">
                    <label>Categories</label>
                    <div class="checkbox-grid">
                        ${allCategories.map(c => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="category_ids" value="${c.id}" ${categoryIds.includes(c.id) ? 'checked' : ''}>
                                <span>${c.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    ${allCategories.length === 0 ? '<small class="form-help-text">No categories available. Create some in the Categories section first.</small>' : ''}
                </div>
                <div class="form-group">
                    <label>Types</label>
                    <div class="checkbox-grid">
                        ${allTypes.map(t => `
                            <label class="checkbox-item">
                                <input type="checkbox" name="type_ids" value="${t.id}" ${typeIds.includes(t.id) ? 'checked' : ''}>
                                <span>${t.name}</span>
                            </label>
                        `).join('')}
                    </div>
                    ${allTypes.length === 0 ? '<small class="form-help-text">No types available. Create some in the Types section first.</small>' : ''}
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${id ? '💾 Save Changes' : '✨ Create Attraction'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('attraction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description'),
            address: formData.get('address'),
            location: formData.get('location'),
            featured_location: formData.get('featured_location') === 'on',
            category_ids: Array.from(formData.getAll('category_ids')).map(Number),
            type_ids: Array.from(formData.getAll('type_ids')).map(Number)
        };
        
        try {
            if (id) {
                await putAPI(`/api/attractions/${id}`, payload);
            } else {
                await postAPI('/api/attractions', payload);
            }
            closeModal();
            showView('attractions');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editAttraction(id) {
    openAttractionForm(id);
}

async function deleteAttraction(id) {
    if (!confirm('Delete this attraction?')) return;
    await deleteAPI(`/api/attractions/${id}`);
    showView('attractions');
}

// ============================================
// EVENTS VIEW
// ============================================

async function renderEvents(container) {
    const events = await fetchAPI('/api/events');
    allEvents = events;

    container.innerHTML = `
        <div class="page-header">
            <h1>🎉 Events</h1>
            <p>Manage events and happenings</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openEventForm()">+ Add Event</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Date Range</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.map(e => `
                        <tr>
                            <td><strong>${e.name}</strong></td>
                            <td><span class="badge badge-${e.status === 'published' ? 'success' : e.status === 'draft' ? 'warning' : 'danger'}">${e.status}</span></td>
                            <td>${e.start_date ? new Date(e.start_date).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editEvent(${e.id})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteEvent(${e.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function openEventForm(id = null) {
    let data = null;
    if (id) {
        data = await fetchAPI(`/api/events/${id}`);
    }

    const categoryIds = data?.categories?.map(c => c.id) || [];
    const typeIds = data?.types?.map(t => t.id) || [];

    showModal(`
        <h2>${id ? 'Edit' : 'Add'} Event</h2>
        <form id="event-form">
            <div class="form-group">
                <label>Name *</label>
                <input type="text" name="name" value="${data?.name || ''}" required>
            </div>
            <div class="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value="${data?.slug || ''}" placeholder="auto-generated">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="3">${data?.description || ''}</textarea>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="datetime-local" name="start_date" value="${data?.start_date ? new Date(data.start_date).toISOString().slice(0,16) : ''}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="datetime-local" name="end_date" value="${data?.end_date ? new Date(data.end_date).toISOString().slice(0,16) : ''}">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="draft" ${data?.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="published" ${data?.status === 'published' ? 'selected' : ''}>Published</option>
                        <option value="archived" ${data?.status === 'archived' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="show_date_range" ${data?.show_date_range !== false ? 'checked' : ''}>
                        Show Date Range
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Categories</label>
                <div class="checkbox-grid">
                    ${allCategories.map(c => `
                        <label class="checkbox-item">
                            <input type="checkbox" name="category_ids" value="${c.id}" ${categoryIds.includes(c.id) ? 'checked' : ''}>
                            <span>${c.name}</span>
                        </label>
                    `).join('')}
                </div>
                ${allCategories.length === 0 ? '<small class="form-help-text">No categories available. Create some in the Categories section first.</small>' : ''}
            </div>
            <div class="form-group">
                <label>Types</label>
                <div class="checkbox-grid">
                    ${allTypes.map(t => `
                        <label class="checkbox-item">
                            <input type="checkbox" name="type_ids" value="${t.id}" ${typeIds.includes(t.id) ? 'checked' : ''}>
                            <span>${t.name}</span>
                        </label>
                    `).join('')}
                </div>
                ${allTypes.length === 0 ? '<small class="form-help-text">No types available. Create some in the Types section first.</small>' : ''}
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${id ? '💾 Save Changes' : '✨ Create Event'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            status: formData.get('status'),
            show_date_range: formData.get('show_date_range') === 'on',
            category_ids: Array.from(formData.getAll('category_ids')).map(Number),
            type_ids: Array.from(formData.getAll('type_ids')).map(Number)
        };
        
        try {
            if (id) {
                await putAPI(`/api/events/${id}`, payload);
            } else {
                await postAPI('/api/events', payload);
            }
            closeModal();
            await loadData();
            showView('events');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editEvent(id) {
    openEventForm(id);
}

async function deleteEvent(id) {
    if (!confirm('Delete this event and all sub-events?')) return;
    await deleteAPI(`/api/events/${id}`);
    await loadData();
    showView('events');
}

// ============================================
// SUB-EVENTS VIEW
// ============================================

async function renderSubEvents(container) {
    const subevents = await fetchAPI('/api/subevents');

    container.innerHTML = `
        <div class="page-header">
            <h1>📅 Sub-events</h1>
            <p>Manage sub-events within events</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openSubEventForm()">+ Add Sub-event</button>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Description</th>
                        <th>Date Range</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${subevents.map(se => `
                        <tr>
                            <td><strong>${se.event_name}</strong></td>
                            <td>${se.description?.substring(0, 50) || '-'}...</td>
                            <td>${se.start_date ? new Date(se.start_date).toLocaleDateString() : 'N/A'}</td>
                            <td><span class="badge badge-${se.status === 'published' ? 'success' : 'warning'}">${se.status}</span></td>
                            <td>
                                <button class="btn btn-sm btn-secondary" onclick='editSubEvent(${se.id})'>Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteSubEvent(${se.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function openSubEventForm(id = null) {
    let data = null;
    if (id) {
        data = await fetchAPI(`/api/subevents/${id}`);
    }

    const categoryIds = data?.categories?.map(c => c.id) || [];
    const typeIds = data?.types?.map(t => t.id) || [];

    showModal(`
        <h2>${id ? 'Edit' : 'Add'} Sub-event</h2>
        <form id="subevent-form">
            <div class="form-group">
                <label>Parent Event *</label>
                <select name="event_id" required ${id ? 'disabled' : ''}>
                    <option value="">Select Event</option>
                    ${allEvents.map(e => `
                        <option value="${e.id}" ${data?.event_id === e.id ? 'selected' : ''}>${e.name}</option>
                    `).join('')}
                </select>
                ${id ? `<input type="hidden" name="event_id" value="${data.event_id}">` : ''}
            </div>
            <div class="form-group">
                <label>Description *</label>
                <textarea name="description" rows="3" required>${data?.description || ''}</textarea>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="datetime-local" name="start_date" value="${data?.start_date ? new Date(data.start_date).toISOString().slice(0,16) : ''}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="datetime-local" name="end_date" value="${data?.end_date ? new Date(data.end_date).toISOString().slice(0,16) : ''}">
                </div>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Status</label>
                    <select name="status">
                        <option value="draft" ${data?.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="published" ${data?.status === 'published' ? 'selected' : ''}>Published</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="show_event" ${data?.show_event !== false ? 'checked' : ''}>
                        Show Event
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Categories</label>
                <div class="checkbox-grid">
                    ${allCategories.map(c => `
                        <label class="checkbox-item">
                            <input type="checkbox" name="category_ids" value="${c.id}" ${categoryIds.includes(c.id) ? 'checked' : ''}>
                            <span>${c.name}</span>
                        </label>
                    `).join('')}
                </div>
                ${allCategories.length === 0 ? '<small class="form-help-text">No categories available. Create some in the Categories section first.</small>' : ''}
            </div>
            <div class="form-group">
                <label>Types</label>
                <div class="checkbox-grid">
                    ${allTypes.map(t => `
                        <label class="checkbox-item">
                            <input type="checkbox" name="type_ids" value="${t.id}" ${typeIds.includes(t.id) ? 'checked' : ''}>
                            <span>${t.name}</span>
                        </label>
                    `).join('')}
                </div>
                ${allTypes.length === 0 ? '<small class="form-help-text">No types available. Create some in the Types section first.</small>' : ''}
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">${id ? '💾 Save Changes' : '✨ Create Sub-event'}</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('subevent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            event_id: parseInt(formData.get('event_id')),
            description: formData.get('description'),
            start_date: formData.get('start_date') || null,
            end_date: formData.get('end_date') || null,
            status: formData.get('status'),
            show_event: formData.get('show_event') === 'on',
            category_ids: Array.from(formData.getAll('category_ids')).map(Number),
            type_ids: Array.from(formData.getAll('type_ids')).map(Number)
        };
        
        try {
            if (id) {
                await putAPI(`/api/subevents/${id}`, payload);
            } else {
                await postAPI('/api/subevents', payload);
            }
            closeModal();
            showView('subevents');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function editSubEvent(id) {
    openSubEventForm(id);
}

async function deleteSubEvent(id) {
    if (!confirm('Delete this sub-event?')) return;
    await deleteAPI(`/api/subevents/${id}`);
    showView('subevents');
}

// ============================================
// UPLOADS VIEW
// ============================================

async function renderUploads(container) {
    const data = await fetchAPI('/api/uploads');

    container.innerHTML = `
        <div class="page-header">
            <h1>🖼️ File Uploads</h1>
            <p>Manage uploaded files</p>
            <div class="page-actions">
                <button class="btn btn-primary" onclick="openUploadForm()">+ Upload File</button>
            </div>
        </div>

        <div class="table-container">
            <div style="padding: 20px">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
                    ${data.files.map(file => `
                        <div style="border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center;">
                            <img src="${file.url}" style="max-width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                            <div style="font-size: 12px; color: var(--text-light); word-break: break-all;">${file.name}</div>
                            <button class="btn btn-sm btn-secondary mt-1" onclick="copyToClipboard('${file.url}')">Copy URL</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function openUploadForm() {
    showModal(`
        <h2>Upload File</h2>
        <form id="upload-form" enctype="multipart/form-data">
            <div class="form-group">
                <label>Select file</label>
                <input type="file" name="file" accept="image/*" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Upload</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);

    document.getElementById('upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.querySelector('input[name="file"]');
        if (!fileInput.files || !fileInput.files[0]) {
            alert('Please select a file');
            return;
        }

        const data = new FormData();
        data.append('file', fileInput.files[0]);

        try {
            const resp = await fetch('/api/upload', { method: 'POST', body: data });
            if (!resp.ok) throw new Error('Upload failed');
            await resp.json();
            closeModal();
            showView('uploads');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

// ============================================
// HOTSPOT VIEWS
// ============================================

async function renderHotspotSection(container, title, sectionId) {
    if (sectionId === 'global') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🌍 Global Section</h1>
                <p>Configure global color setting for your portal</p>
            </div>
            <form id="global-settings-form" style="max-width: 500px; margin: 0 auto;">
                <div class="form-section">
                    <div class="form-section-title">Background & Theme</div>
                    <div class="form-group">
                        <label for="main-bg-color">Main Background Color</label>
                        <input type="text" id="main-bg-color" value="rgba(0, 0, 29, 1)" class="color-input" readonly>
                        <input type="color" id="main-bg-color-picker" value="#00001d" style="margin-top:8px;">
                        <div id="main-bg-preview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(0,0,29,1);margin:12px 0 0 0;"></div>
                        <div class="form-help-text">RGBA: <span id="main-bg-color-rgba">rgba(0, 0, 29, 1)</span></div>
                    </div>
                    <div class="form-group">
                        <label for="primary-brand-color">Primary Brand Color</label>
                        <input type="text" id="primary-brand-color" value="rgba(0, 123, 255, 1)" class="color-input" readonly>
                        <input type="color" id="primary-brand-color-picker" value="#007bff" style="margin-top:8px;">
                        <div id="primary-brand-preview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(0,123,255,1);margin:12px 0 0 0;"></div>
                        <div class="form-help-text">RGBA: <span id="primary-brand-color-rgba">rgba(0, 123, 255, 1)</span></div>
                    </div>
                    <div class="form-group">
                        <label for="secondary-accent-color">Secondary Accent Color</label>
                        <input type="text" id="secondary-accent-color" value="rgba(108, 117, 125, 1)" class="color-input" readonly>
                        <input type="color" id="secondary-accent-color-picker" value="#6c757d" style="margin-top:8px;">
                        <div id="secondary-accent-preview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(108,117,125,1);margin:12px 0 0 0;"></div>
                        <div class="form-help-text">RGBA: <span id="secondary-accent-color-rgba">rgba(108, 117, 125, 1)</span></div>
                    </div>
                </div>
            </form>
        `;
        setupGlobalColorPickers();
        return;
    }
    if (sectionId === 'hero-video') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🎬 Hero Videos</h1>
                <p>Add multiple hero videos for rotation</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-hero-video-btn">+ Add Hero Video</button>
                </div>
            </div>
            <div id="hero-videos-list" style="margin-top:32px;">
                <div class="alert alert-info text-center">No hero videos added yet.</div>
            </div>
        `;
        document.getElementById('add-hero-video-btn').onclick = openHeroVideoModal;
        return;
    }
    if (sectionId === 'chips') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🎯 Navigation Chips</h1>
                <p>Add quick action buttons with icons</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-chip-btn">+ Add Chip</button>
                </div>
            </div>
            <div id="chips-list" style="margin-top:32px;">
                <div class="alert alert-info text-center">No chips added yet.</div>
            </div>
        `;
        document.getElementById('add-chip-btn').onclick = openChipModal;
        return;
    }
    if (sectionId === 'hero-banner') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🖼️ Hero Banners</h1>
                <p>Add multiple hero banners for rotation (4:3 ratio)</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-hero-banner-btn">+ Add Hero Banner</button>
                </div>
            </div>
            <div id="hero-banners-list" style="margin-top:32px;">
                <div class="alert alert-info text-center">No hero banners added yet.</div>
            </div>
        `;
        document.getElementById('add-hero-banner-btn').onclick = openHeroBannerModal;
        return;
    }
    if (sectionId === 'blocks') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🧱 Content Block Sets</h1>
                <p>Add multiple block sets for rotation – each set can contain multiple blocks.</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-block-set-btn">+ Add Block Set</button>
                    <button class="btn btn-secondary" id="save-block-sets-btn">💾 Save All</button>
                </div>
            </div>
            <div id="hotspot-block-sets" style="margin-top:32px;"></div>
        `;
        document.getElementById('add-block-set-btn').onclick = () => addHotspotBlockSet();
        document.getElementById('save-block-sets-btn').onclick = () => saveHotspotBlocks();
        await loadHotspotBlocks();
        renderHotspotBlockSets();
        return;
    }
    if (sectionId === 'footer') {
        container.innerHTML = `
            <div class="page-header">
                <h1>📄 Footer</h1>
                <p>Configure footer icons and styling (max 4 icons).</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-footer-icon-btn">+ Add Icon</button>
                    <button class="btn btn-secondary" id="save-footer-btn">💾 Save</button>
                </div>
            </div>
            <div id="footer-content" style="margin-top:32px;"></div>
        `;
        document.getElementById('add-footer-icon-btn').onclick = () => addFooterIcon();
        document.getElementById('save-footer-btn').onclick = () => saveFooter();
        await loadFooter();
        renderFooter();
        return;
    }
    if (sectionId === 'editors-picks') {
        container.innerHTML = `
            <div class="page-header">
                <h1>⭐ Editor's Picks</h1>
                <p>Add 2–3 curated article snippets.</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-pick-btn">+ Add Item</button>
                    <button class="btn btn-secondary" id="save-picks-btn">💾 Save</button>
                </div>
            </div>
            <div id="editors-picks-content" style="margin-top:32px;"></div>
        `;
        document.getElementById('add-pick-btn').onclick = () => addEditorsPick();
        document.getElementById('save-picks-btn').onclick = () => saveEditorsPicks();
        await loadEditorsPicks();
        renderEditorsPicks();
        return;
    }
    if (sectionId === 'discovery') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🔍 Discovery</h1>
                <p>Add 2–3 places or businesses to highlight.</p>
                <div class="page-actions">
                    <button class="btn btn-primary" id="add-place-btn">+ Add Place</button>
                    <button class="btn btn-secondary" id="save-discovery-btn">💾 Save</button>
                </div>
            </div>
            <div id="discovery-content" style="margin-top:32px;"></div>
        `;
        document.getElementById('add-place-btn').onclick = () => addDiscoveryPlace();
        document.getElementById('save-discovery-btn').onclick = () => saveDiscovery();
        await loadDiscovery();
        renderDiscovery();
        return;
    }
    if (sectionId === 'quick-fun') {
        container.innerHTML = `
            <div class="page-header">
                <h1>⚡ Quick Fun</h1>
                <p>Single 16:9 image banner linking to a game or interactive experience.</p>
                <div class="page-actions">
                    <button class="btn btn-secondary" id="save-quickfun-btn">💾 Save</button>
                </div>
            </div>
            <div id="quickfun-content" style="margin-top:32px;"></div>
        `;
        document.getElementById('save-quickfun-btn').onclick = () => saveQuickFun();
        await loadQuickFun();
        renderQuickFun();
        return;
    }
    if (sectionId === 'utilities') {
        container.innerHTML = `
            <div class="page-header">
                <h1>🛠️ Utilities</h1>
                <p>Defaults for city utility widgets (weather/time/currency).</p>
                <div class="page-actions">
                    <button class="btn btn-secondary" id="save-utilities-btn">💾 Save</button>
                </div>
            </div>
            <div id="utilities-content" style="margin-top:32px;"></div>
        `;
        document.getElementById('save-utilities-btn').onclick = () => saveUtilities();
        await loadUtilities();
        renderUtilities();
        return;
    }
    // ...existing code for other sections...
    container.innerHTML = `
        <div class="page-header">
            <h1>${getIconForSection(sectionId)} ${title}</h1>
            <p>Manage ${title.toLowerCase()} content for Hotspot</p>
        </div>
        <div class="table-container">
            <div style="padding: 40px; text-align: center; color: var(--text-light);">
                <div style="font-size: 48px; margin-bottom: 16px;">🚧</div>
                <h3 style="margin-bottom: 8px;">Content Section Coming Soon</h3>
                <p>The ${title} section is being prepared. Functionality will be added here.</p>
            </div>
        </div>
    `;
}

function setupGlobalColorPickers() {
    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha = 1) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    function rgbaToHex(rgba) {
        const match = rgba.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        if (!match) return '#000000';
        let r = parseInt(match[1]).toString(16).padStart(2, '0');
        let g = parseInt(match[2]).toString(16).padStart(2, '0');
        let b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    // Main BG
    const mainBgInput = document.getElementById('main-bg-color');
    const mainBgPicker = document.getElementById('main-bg-color-picker');
    const mainBgRgba = document.getElementById('main-bg-color-rgba');
    const mainBgPreview = document.getElementById('main-bg-preview');
    mainBgPicker.value = rgbaToHex(mainBgInput.value);
    mainBgPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        mainBgInput.value = rgba;
        mainBgRgba.textContent = rgba;
        mainBgPicker.value = rgbaToHex(rgba);
        mainBgPreview.style.background = rgba;
    });
    mainBgInput.addEventListener('input', e => {
        mainBgPicker.value = rgbaToHex(e.target.value);
        mainBgRgba.textContent = e.target.value;
        mainBgPreview.style.background = e.target.value;
    });
    // Primary Brand
    const primaryBrandInput = document.getElementById('primary-brand-color');
    const primaryBrandPicker = document.getElementById('primary-brand-color-picker');
    const primaryBrandRgba = document.getElementById('primary-brand-color-rgba');
    const primaryBrandPreview = document.getElementById('primary-brand-preview');
    primaryBrandPicker.value = rgbaToHex(primaryBrandInput.value);
    primaryBrandPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        primaryBrandInput.value = rgba;
        primaryBrandRgba.textContent = rgba;
        primaryBrandPicker.value = rgbaToHex(rgba);
        primaryBrandPreview.style.background = rgba;
    });
    primaryBrandInput.addEventListener('input', e => {
        primaryBrandPicker.value = rgbaToHex(e.target.value);
        primaryBrandRgba.textContent = e.target.value;
        primaryBrandPreview.style.background = e.target.value;
    });
    // Secondary Accent
    const secondaryAccentInput = document.getElementById('secondary-accent-color');
    const secondaryAccentPicker = document.getElementById('secondary-accent-color-picker');
    const secondaryAccentRgba = document.getElementById('secondary-accent-color-rgba');
    const secondaryAccentPreview = document.getElementById('secondary-accent-preview');
    secondaryAccentPicker.value = rgbaToHex(secondaryAccentInput.value);
    secondaryAccentPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        secondaryAccentInput.value = rgba;
        secondaryAccentRgba.textContent = rgba;
        secondaryAccentPicker.value = rgbaToHex(rgba);
        secondaryAccentPreview.style.background = rgba;
    });
    secondaryAccentInput.addEventListener('input', e => {
        secondaryAccentPicker.value = rgbaToHex(e.target.value);
        secondaryAccentRgba.textContent = e.target.value;
        secondaryAccentPreview.style.background = e.target.value;
    });
}

function openHeroVideoModal() {
    showModal(`
       
        <h2>Configure Hero Video</h2>
        <form id="hero-video-form">
            <div class="form-section">
                <div class="form-section-title">Content</div>
                <div class="form-group">
                    <label>Video File</label>
                    <input type="file" name="videoFile" accept="video/*">
                </div>
                <div class="form-group">
                    <label>Thumbnail Image</label>
                    <input type="file" name="thumbnailImage" accept="image/*">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <div class="form-grid">
                        <div>
                            <label>Bosnian</label>
                            <input type="text" name="titleBosnian" placeholder="Title in Bosnian">
                        </div>
                        <div>
                            <label>English</label>
                            <input type="text" name="titleEnglish" placeholder="Title in English">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Button Text</label>
                    <div class="form-grid">
                        <div>
                            <label>Bosnian</label>
                            <input type="text" name="buttonTextBosnian" placeholder="Button text in Bosnian">
                        </div>
                        <div>
                            <label>English</label>
                            <input type="text" name="buttonTextEnglish" placeholder="Button text in English">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Button Link</label>
                    <input type="text" name="buttonLink" placeholder="Button link">
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">Colors & Styling</div>
                <div class="form-group">
                    <label>Title Text Color</label>
                    <input type="text" name="titleTextColor" value="rgba(255, 255, 255, 1)" class="color-input" readonly>
                    <input type="color" name="titleTextColorPicker" value="#ffffff" style="margin-top:8px;">
                    <div class="form-help-text">RGBA: <span class="color-rgba">rgba(255, 255, 255, 1)</span></div>
                </div>
                <div class="form-group">
                    <label>Button Background</label>
                    <input type="text" name="buttonBgColor" value="rgba(122, 73, 240, 1)" class="color-input" readonly>
                    <input type="color" name="buttonBgColorPicker" value="#7a49f0" style="margin-top:8px;">
                    <div class="form-help-text">RGBA: <span class="color-rgba">rgba(122, 73, 240, 1)</span></div>
                </div>
                <div class="form-group">
                    <label>Button Text Color</label>
                    <input type="text" name="buttonTextColor" value="rgba(255, 255, 255, 1)" class="color-input" readonly>
                    <input type="color" name="buttonTextColorPicker" value="#ffffff" style="margin-top:8px;">
                    <div class="form-help-text">RGBA: <span class="color-rgba">rgba(255, 255, 255, 1)</span></div>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Hero Video</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
    setupHeroVideoColorPickers();
}

function setupHeroVideoColorPickers() {
    // Helper to convert hex to rgba
    function hexToRgba(hex, alpha = 1) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Title Text Color
    const titleTextColorPicker = document.querySelector('input[name="titleTextColorPicker"]');
    titleTextColorPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        document.querySelector('input[name="titleTextColor"]').value = rgba;
        titleTextColorPicker.parentElement.querySelector('.color-rgba').textContent = rgba;
    });
    // Button BG Color
    const buttonBgColorPicker = document.querySelector('input[name="buttonBgColorPicker"]');
    buttonBgColorPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        document.querySelector('input[name="buttonBgColor"]').value = rgba;
        buttonBgColorPicker.parentElement.querySelector('.color-rgba').textContent = rgba;
    });
    // Button Text Color
    const buttonTextColorPicker = document.querySelector('input[name="buttonTextColorPicker"]');
    buttonTextColorPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        document.querySelector('input[name="buttonTextColor"]').value = rgba;
        buttonTextColorPicker.parentElement.querySelector('.color-rgba').textContent = rgba;
    });
}

function openChipModal() {
    showModal(`
        <h2>Add Navigation Chip</h2>
        <form id="chip-form">
            <div class="form-section">
                <div class="form-section-title">Chip Content</div>
                <div class="form-group">
                    <label>Name</label>
                    <div class="form-grid">
                        <div>
                            <label>Bosnian</label>
                            <input type="text" name="nameBosnian" placeholder="Name in Bosnian" required>
                        </div>
                        <div>
                            <label>English</label>
                            <input type="text" name="nameEnglish" placeholder="Name in English" required>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Link URL</label>
                    <input type="text" name="linkUrl" placeholder="Enter link URL" required>
                </div>
                <div class="form-group">
                    <label>Icon Image</label>
                    <input type="file" name="iconImage" accept="image/*">
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Chip</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
}

function openHeroBannerModal() {
    showModal(`
        <h2>Configure Hero Banner</h2>
        <form id="hero-banner-form">
            <div class="form-section">
                <div class="form-section-title">Content</div>
                <div class="form-group">
                    <label>Banner Image (4:3 ratio recommended)</label>
                    <input type="file" name="bannerImage" accept="image/*">
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <div class="form-grid">
                        <div>
                            <label>Bosnian</label>
                            <input type="text" name="titleBosnian" placeholder="Title in Bosnian">
                        </div>
                        <div>
                            <label>English</label>
                            <input type="text" name="titleEnglish" placeholder="Title in English">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Subtitle</label>
                    <div class="form-grid">
                        <div>
                            <label>Bosnian</label>
                            <input type="text" name="subtitleBosnian" placeholder="Subtitle in Bosnian">
                        </div>
                        <div>
                            <label>English</label>
                            <input type="text" name="subtitleEnglish" placeholder="Subtitle in English">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Button Link</label>
                    <input type="text" name="buttonLink" placeholder="Button link">
                </div>
            </div>
            <div class="form-section">
                <div class="form-section-title">Banner Styling</div>
                <div class="form-group">
                    <label>Title Color</label>
                    <input type="text" name="titleColor" value="rgba(255, 255, 255, 1)" class="color-input" readonly>
                    <input type="color" name="titleColorPicker" value="#ffffff" style="margin-top:8px;">
                    <div name="titleColorPreview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(255,255,255,1);margin:12px 0 0 0;"></div>
                    <div class="form-help-text">RGBA: <span class="color-rgba-title">rgba(255, 255, 255, 1)</span></div>
                </div>
                <div class="form-group">
                    <label>Subtitle Color</label>
                    <input type="text" name="subtitleColor" value="rgba(255, 255, 255, 1)" class="color-input" readonly>
                    <input type="color" name="subtitleColorPicker" value="#ffffff" style="margin-top:8px;">
                    <div name="subtitleColorPreview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(255,255,255,1);margin:12px 0 0 0;"></div>
                    <div class="form-help-text">RGBA: <span class="color-rgba-subtitle">rgba(255, 255, 255, 1)</span></div>
                </div>
                <div class="form-group">
                    <label>Button Background</label>
                    <input type="text" name="buttonBgColor" value="rgba(122, 73, 240, 1)" class="color-input" readonly>
                    <input type="color" name="buttonBgColorPicker" value="#7a49f0" style="margin-top:8px;">
                    <div name="buttonBgColorPreview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(122,73,240,1);margin:12px 0 0 0;"></div>
                    <div class="form-help-text">RGBA: <span class="color-rgba-button-bg">rgba(122, 73, 240, 1)</span></div>
                </div>
                <div class="form-group">
                    <label>Button Text Color</label>
                    <input type="text" name="buttonTextColor" value="rgba(255, 255, 255, 1)" class="color-input" readonly>
                    <input type="color" name="buttonTextColorPicker" value="#ffffff" style="margin-top:8px;">
                    <div name="buttonTextColorPreview" style="width:100%;height:6px;border-radius:4px;border:0;background:rgba(255,255,255,1);margin:12px 0 0 0;"></div>
                    <div class="form-help-text">RGBA: <span class="color-rgba-button-text">rgba(255, 255, 255, 1)</span></div>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Hero Banner</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
    setupHeroBannerColorPickers();
}

function setupHeroBannerColorPickers() {
    function hexToRgba(hex, alpha = 1) {
        let r = 0, g = 0, b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    function rgbaToHex(rgba) {
        const match = rgba.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
        if (!match) return '#000000';
        let r = parseInt(match[1]).toString(16).padStart(2, '0');
        let g = parseInt(match[2]).toString(16).padStart(2, '0');
        let b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    
    // Title Color
    const titleInput = document.querySelector('input[name="titleColor"]');
    const titlePicker = document.querySelector('input[name="titleColorPicker"]');
    const titleRgba = document.querySelector('.color-rgba-title');
    const titlePreview = document.querySelector('div[name="titleColorPreview"]');
    titlePicker.value = rgbaToHex(titleInput.value);
    titlePicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        titleInput.value = rgba;
        titleRgba.textContent = rgba;
        titlePreview.style.background = rgba;
    });
    
    // Subtitle Color
    const subtitleInput = document.querySelector('input[name="subtitleColor"]');
    const subtitlePicker = document.querySelector('input[name="subtitleColorPicker"]');
    const subtitleRgba = document.querySelector('.color-rgba-subtitle');
    const subtitlePreview = document.querySelector('div[name="subtitleColorPreview"]');
    subtitlePicker.value = rgbaToHex(subtitleInput.value);
    subtitlePicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        subtitleInput.value = rgba;
        subtitleRgba.textContent = rgba;
        subtitlePreview.style.background = rgba;
    });
    
    // Button BG Color
    const buttonBgInput = document.querySelector('input[name="buttonBgColor"]');
    const buttonBgPicker = document.querySelector('input[name="buttonBgColorPicker"]');
    const buttonBgRgba = document.querySelector('.color-rgba-button-bg');
    const buttonBgPreview = document.querySelector('div[name="buttonBgColorPreview"]');
    buttonBgPicker.value = rgbaToHex(buttonBgInput.value);
    buttonBgPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        buttonBgInput.value = rgba;
        buttonBgRgba.textContent = rgba;
        buttonBgPreview.style.background = rgba;
    });
    
    // Button Text Color
    const buttonTextInput = document.querySelector('input[name="buttonTextColor"]');
    const buttonTextPicker = document.querySelector('input[name="buttonTextColorPicker"]');
    const buttonTextRgba = document.querySelector('.color-rgba-button-text');
    const buttonTextPreview = document.querySelector('div[name="buttonTextColorPreview"]');
    buttonTextPicker.value = rgbaToHex(buttonTextInput.value);
    buttonTextPicker.addEventListener('input', e => {
        const rgba = hexToRgba(e.target.value);
        buttonTextInput.value = rgba;
        buttonTextRgba.textContent = rgba;
        buttonTextPreview.style.background = rgba;
    });
}

// ============================================
// HOTSPOT BLOCKS FUNCTIONS
// ============================================

async function loadHotspotBlocks() {
    try {
        const data = await fetchAPI('/api/hotspot/blocks');
        hotspotBlockSets = data.blockSets || [];
    } catch (err) {
        console.warn('Failed to load hotspot blocks:', err.message);
        hotspotBlockSets = [];
    }
}

function genId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function addHotspotBlockSet() {
    hotspotBlockSets.push({
        id: genId(),
        styles: {
            blockBackground: 'rgba(31, 31, 31, 1)',
            titleColor: 'rgba(255, 255, 255, 1)',
            descriptionColor: 'rgba(196, 196, 196, 1)',
            buttonBackground: 'rgba(122, 73, 240, 1)',
            buttonTextColor: 'rgba(255, 255, 255, 1)'
        },
        blocks: []
    });
    renderHotspotBlockSets();
}

function removeHotspotBlockSet(setId) {
    hotspotBlockSets = hotspotBlockSets.filter(s => s.id !== setId);
    renderHotspotBlockSets();
}

function addHotspotBlock(setId) {
    const set = hotspotBlockSets.find(s => s.id === setId);
    if (!set) return;
    set.blocks.push({
        id: genId(),
        image: null,
        title: '',
        description: '',
        buttonText: '',
        buttonLink: ''
    });
    renderHotspotBlockSets();
}

function removeHotspotBlock(setId, blockId) {
    const set = hotspotBlockSets.find(s => s.id === setId);
    if (!set) return;
    set.blocks = set.blocks.filter(b => b.id !== blockId);
    renderHotspotBlockSets();
}

function updateHotspotBlockField(setId, blockId, field, value) {
    const set = hotspotBlockSets.find(s => s.id === setId);
    if (!set) return;
    const block = set.blocks.find(b => b.id === blockId);
    if (!block) return;
    block[field] = value;
}

function updateHotspotStyleField(setId, field, value) {
    const set = hotspotBlockSets.find(s => s.id === setId);
    if (!set) return;
    set.styles[field] = value;
}

function hexToRgba(hex, alpha = 1) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToHex(rgba) {
    const match = rgba.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
    if (!match) return '#000000';
    let r = parseInt(match[1]).toString(16).padStart(2, '0');
    let g = parseInt(match[2]).toString(16).padStart(2, '0');
    let b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function renderHotspotBlockSets() {
    const container = document.getElementById('hotspot-block-sets');
    if (!container) return;
    if (hotspotBlockSets.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center">No block sets added yet.</div>';
        return;
    }
    container.innerHTML = hotspotBlockSets.map((set, index) => {
        const blocksHTML = set.blocks.map((b, bi) => {
            const collapsed = !!hotspotCollapsedBlocks[b.id];
            return `
            <div class="block-item" style="border:1px solid var(--border);padding:16px;border-radius:8px;margin-bottom:12px;background:#fff;">
                <div style="display:flex;justify-content:space-between;align-items:center;${collapsed ? '' : 'margin-bottom:8px;'}">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button class="btn btn-sm btn-secondary" style="padding:2px 8px;" onclick="toggleHotspotBlockCollapse('${set.id}','${b.id}')">${collapsed ? '►' : '▼'}</button>
                        <strong>Block ${bi + 1}</strong>
                    </div>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-sm btn-danger" onclick="removeHotspotBlock('${set.id}','${b.id}')">Remove</button>
                    </div>
                </div>
                ${collapsed ? '' : `
                <div class="form-grid">
                    <div class="form-group">
                        <label>Block Image</label>
                        <input type="file" accept="image/*" onchange="handleHotspotBlockImage(event,'${set.id}','${b.id}')">
                        ${b.image ? `<small class='form-help-text'>${typeof b.image === 'string' ? b.image : b.image.name}</small>` : ''}
                    </div>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" value="${escapeHtml(b.title)}" oninput="updateHotspotBlockField('${set.id}','${b.id}','title',this.value)">
                    </div>
                    <div class="form-group" style="grid-column:1 / -1;">
                        <label>Description</label>
                        <textarea rows="2" oninput="updateHotspotBlockField('${set.id}','${b.id}','description',this.value)">${escapeHtml(b.description)}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Button Text</label>
                        <input type="text" value="${escapeHtml(b.buttonText)}" oninput="updateHotspotBlockField('${set.id}','${b.id}','buttonText',this.value)">
                    </div>
                    <div class="form-group">
                        <label>Button Link</label>
                        <input type="text" value="${escapeHtml(b.buttonLink)}" oninput="updateHotspotBlockField('${set.id}','${b.id}','buttonLink',this.value)">
                    </div>
                </div>`}
            </div>`;
        }).join('');
        const setCollapsed = !!hotspotCollapsedSets[set.id];
        return `
            <div class="block-set" style="border:1px solid var(--border);padding:20px;border-radius:12px;margin-bottom:24px;background:var(--bg-alt);">
                <div style="display:flex;justify-content:space-between;align-items:center;${setCollapsed ? '' : 'margin-bottom:8px;'}">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <button class="btn btn-sm btn-secondary" style="padding:2px 8px;" onclick="toggleHotspotSetCollapse('${set.id}')">${setCollapsed ? '►' : '▼'}</button>
                        <h3 style="margin:0;">Block Set ${index + 1}</h3>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-sm btn-primary" onclick="addHotspotBlock('${set.id}')">+ Add Block</button>
                        <button class="btn btn-sm btn-danger" onclick="removeHotspotBlockSet('${set.id}')">Remove Set</button>
                    </div>
                </div>
                <p style="margin-top:0;font-size:12px;color:var(--text-light);">This set will rotate with other sets on the frontend. (${set.blocks.length} block${set.blocks.length!==1?'s':''})</p>
                ${setCollapsed ? '' : `
                <div class="blocks-wrapper">${blocksHTML || '<div class="alert alert-info">No blocks in this set yet.</div>'}</div>
                <div class="form-section" style="margin-top:16px;">
                    <div class="form-section-title">Styling for Block Set ${index + 1}</div>
                    <div class="form-grid">
                        ${renderHotspotColorInput(set.id, 'Block Background', 'blockBackground', set.styles.blockBackground)}
                        ${renderHotspotColorInput(set.id, 'Title Color', 'titleColor', set.styles.titleColor)}
                        ${renderHotspotColorInput(set.id, 'Description Color', 'descriptionColor', set.styles.descriptionColor)}
                        ${renderHotspotColorInput(set.id, 'Button Background', 'buttonBackground', set.styles.buttonBackground)}
                        ${renderHotspotColorInput(set.id, 'Button Text Color', 'buttonTextColor', set.styles.buttonTextColor)}
                    </div>
                </div>`}
            </div>
        `;
    }).join('');
    setupHotspotColorPickers();
}

function renderHotspotColorInput(setId, label, field, rgbaValue) {
    const hex = rgbaToHex(rgbaValue);
    return `
        <div class="form-group">
            <label>${label}</label>
            <input type="text" value="${rgbaValue}" readonly data-color-rgba="${setId}:${field}" class="color-input">
            <input type="color" value="${hex}" data-color-picker="${setId}:${field}" style="margin-top:8px;">
            <div data-color-preview="${setId}:${field}" style="width:100%;height:6px;border-radius:4px;border:0;background:${rgbaValue};margin:12px 0 0 0;"></div>
            <div class="form-help-text">RGBA: <span data-color-text="${setId}:${field}">${rgbaValue}</span></div>
        </div>
    `;
}

function setupHotspotColorPickers() {
    document.querySelectorAll('input[data-color-picker]').forEach(picker => {
        picker.addEventListener('input', e => {
            const key = picker.getAttribute('data-color-picker');
            const [setId, field] = key.split(':');
            const rgba = hexToRgba(e.target.value);
            updateHotspotStyleField(setId, field, rgba);
            const rgbaInput = document.querySelector(`input[data-color-rgba="${setId}:${field}"]`);
            const preview = document.querySelector(`div[data-color-preview="${setId}:${field}"]`);
            const text = document.querySelector(`span[data-color-text="${setId}:${field}"]`);
            if (rgbaInput) rgbaInput.value = rgba;
            if (preview) preview.style.background = rgba;
            if (text) text.textContent = rgba;
        });
    });
}

function handleHotspotBlockImage(event, setId, blockId) {
    const file = event.target.files?.[0];
    updateHotspotBlockField(setId, blockId, 'image', file || null);
    renderHotspotBlockSets();
}

function toggleHotspotSetCollapse(setId) {
    hotspotCollapsedSets[setId] = !hotspotCollapsedSets[setId];
    renderHotspotBlockSets();
}

function toggleHotspotBlockCollapse(setId, blockId) {
    hotspotCollapsedBlocks[blockId] = !hotspotCollapsedBlocks[blockId];
    renderHotspotBlockSets();
}

async function saveHotspotBlocks() {
    try {
        const response = await fetch('/api/hotspot/blocks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blockSets: hotspotBlockSets })
        });
        if (!response.ok) throw new Error('Failed to save');
        showNotification('Hotspot Block Sets saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving block sets: ' + err.message, 'error');
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// FOOTER SECTION
// ============================================

async function loadFooter() {
    try {
        hotspotFooter = await fetchAPI('/api/hotspot/footer');
    } catch (err) {
        console.warn('Failed to load footer:', err.message);
        hotspotFooter = { icons: [], styles: { footerBackground: 'rgba(33, 37, 41, 1)', iconColor: 'rgba(0, 0, 0, 0)', textColor: 'rgba(0, 0, 0, 0)' } };
    }
}

function addFooterIcon() {
    if (hotspotFooter.icons.length >= 4) {
        alert('Max 4 footer icons allowed.');
        return;
    }
    hotspotFooter.icons.push({ id: genId(), name: '', url: '', iconImage: null });
    renderFooter();
}

function removeFooterIcon(id) {
    hotspotFooter.icons = hotspotFooter.icons.filter(i => i.id !== id);
    renderFooter();
}

function updateFooterIconField(id, field, value) {
    const icon = hotspotFooter.icons.find(i => i.id === id);
    if (icon) icon[field] = value;
}

function updateFooterStyleField(field, value) {
    hotspotFooter.styles[field] = value;
}

function renderFooter() {
    const container = document.getElementById('footer-content');
    if (!container) return;
    const iconsHTML = hotspotFooter.icons.map((icon, i) => `
        <div class="block-item" style="border:1px solid var(--border);padding:16px;border-radius:8px;margin-bottom:12px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Footer Icon ${i + 1}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeFooterIcon('${icon.id}')">Remove</button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" value="${escapeHtml(icon.name)}" oninput="updateFooterIconField('${icon.id}','name',this.value)">
                </div>
                <div class="form-group">
                    <label>URL</label>
                    <input type="text" value="${escapeHtml(icon.url)}" oninput="updateFooterIconField('${icon.id}','url',this.value)">
                </div>
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Icon Image</label>
                    <input type="file" accept="image/*" onchange="handleFooterIconImage(event,'${icon.id}')">
                    ${icon.iconImage ? `<small class='form-help-text'>${typeof icon.iconImage === 'string' ? icon.iconImage : icon.iconImage.name}</small>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    container.innerHTML = `
        <div class="blocks-wrapper">${iconsHTML || '<div class="alert alert-info">No footer icons added yet.</div>'}</div>
        <div class="form-section" style="margin-top:24px;">
            <div class="form-section-title">Footer Styling</div>
            <div class="form-grid">
                ${renderHotspotColorInput('footer', 'Footer Background', 'footerBackground', hotspotFooter.styles.footerBackground)}
                ${renderHotspotColorInput('footer', 'Icon Color', 'iconColor', hotspotFooter.styles.iconColor)}
                ${renderHotspotColorInput('footer', 'Text Color', 'textColor', hotspotFooter.styles.textColor)}
            </div>
        </div>
    `;
    setupHotspotColorPickers();
}

function handleFooterIconImage(event, id) {
    const file = event.target.files?.[0];
    updateFooterIconField(id, 'iconImage', file || null);
    renderFooter();
}

async function saveFooter() {
    try {
        await fetch('/api/hotspot/footer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hotspotFooter)
        });
        showNotification('Footer saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving footer: ' + err.message, 'error');
    }
}

// ============================================
// EDITORS PICKS SECTION
// ============================================

async function loadEditorsPicks() {
    try {
        const data = await fetchAPI('/api/hotspot/editors-picks');
        hotspotEditorsPicks = data.picks || [];
    } catch (err) {
        console.warn('Failed to load editors picks:', err.message);
        hotspotEditorsPicks = [];
    }
}

function addEditorsPick() {
    hotspotEditorsPicks.push({
        id: genId(),
        cardImage: null,
        titleBosnian: '',
        titleEnglish: '',
        teaserBosnian: '',
        teaserEnglish: '',
        link: ''
    });
    renderEditorsPicks();
}

function removeEditorsPick(id) {
    hotspotEditorsPicks = hotspotEditorsPicks.filter(p => p.id !== id);
    renderEditorsPicks();
}

function updateEditorsPickField(id, field, value) {
    const pick = hotspotEditorsPicks.find(p => p.id === id);
    if (pick) pick[field] = value;
}

function renderEditorsPicks() {
    const container = document.getElementById('editors-picks-content');
    if (!container) return;
    if (hotspotEditorsPicks.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center">No picks added yet.</div>';
        return;
    }
    container.innerHTML = hotspotEditorsPicks.map((pick, i) => `
        <div class="block-item" style="border:1px solid var(--border);padding:16px;border-radius:8px;margin-bottom:12px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Pick ${i + 1}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeEditorsPick('${pick.id}')">Remove</button>
            </div>
            <div class="form-grid">
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Card Image</label>
                    <input type="file" accept="image/*" onchange="handleEditorsPickImage(event,'${pick.id}')">
                    ${pick.cardImage ? `<small class='form-help-text'>${typeof pick.cardImage === 'string' ? pick.cardImage : pick.cardImage.name}</small>` : ''}
                </div>
                <div class="form-group">
                    <label>Title (Bosnian)</label>
                    <input type="text" value="${escapeHtml(pick.titleBosnian)}" oninput="updateEditorsPickField('${pick.id}','titleBosnian',this.value)">
                </div>
                <div class="form-group">
                    <label>Title (English)</label>
                    <input type="text" value="${escapeHtml(pick.titleEnglish)}" oninput="updateEditorsPickField('${pick.id}','titleEnglish',this.value)">
                </div>
                <div class="form-group">
                    <label>Teaser (Bosnian)</label>
                    <textarea rows="2" oninput="updateEditorsPickField('${pick.id}','teaserBosnian',this.value)">${escapeHtml(pick.teaserBosnian)}</textarea>
                </div>
                <div class="form-group">
                    <label>Teaser (English)</label>
                    <textarea rows="2" oninput="updateEditorsPickField('${pick.id}','teaserEnglish',this.value)">${escapeHtml(pick.teaserEnglish)}</textarea>
                </div>
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Link</label>
                    <input type="text" value="${escapeHtml(pick.link)}" oninput="updateEditorsPickField('${pick.id}','link',this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

function handleEditorsPickImage(event, id) {
    const file = event.target.files?.[0];
    updateEditorsPickField(id, 'cardImage', file || null);
    renderEditorsPicks();
}

async function saveEditorsPicks() {
    try {
        await fetch('/api/hotspot/editors-picks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ picks: hotspotEditorsPicks })
        });
        showNotification('Editors Picks saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving picks: ' + err.message, 'error');
    }
}

// ============================================
// DISCOVERY SECTION
// ============================================

async function loadDiscovery() {
    try {
        const data = await fetchAPI('/api/hotspot/discovery');
        hotspotDiscovery = data.places || [];
    } catch (err) {
        console.warn('Failed to load discovery:', err.message);
        hotspotDiscovery = [];
    }
}

function addDiscoveryPlace() {
    hotspotDiscovery.push({
        id: genId(),
        placeImage: null,
        nameBosnian: '',
        nameEnglish: '',
        categoryBosnian: '',
        categoryEnglish: '',
        link: ''
    });
    renderDiscovery();
}

function removeDiscoveryPlace(id) {
    hotspotDiscovery = hotspotDiscovery.filter(p => p.id !== id);
    renderDiscovery();
}

function updateDiscoveryField(id, field, value) {
    const place = hotspotDiscovery.find(p => p.id === id);
    if (place) place[field] = value;
}

function renderDiscovery() {
    const container = document.getElementById('discovery-content');
    if (!container) return;
    if (hotspotDiscovery.length === 0) {
        container.innerHTML = '<div class="alert alert-info text-center">No places added yet.</div>';
        return;
    }
    container.innerHTML = hotspotDiscovery.map((place, i) => `
        <div class="block-item" style="border:1px solid var(--border);padding:16px;border-radius:8px;margin-bottom:12px;background:#fff;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong>Place ${i + 1}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeDiscoveryPlace('${place.id}')">Remove</button>
            </div>
            <div class="form-grid">
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Place Image</label>
                    <input type="file" accept="image/*" onchange="handleDiscoveryImage(event,'${place.id}')">
                    ${place.placeImage ? `<small class='form-help-text'>${typeof place.placeImage === 'string' ? place.placeImage : place.placeImage.name}</small>` : ''}
                </div>
                <div class="form-group">
                    <label>Name (Bosnian)</label>
                    <input type="text" value="${escapeHtml(place.nameBosnian)}" oninput="updateDiscoveryField('${place.id}','nameBosnian',this.value)">
                </div>
                <div class="form-group">
                    <label>Name (English)</label>
                    <input type="text" value="${escapeHtml(place.nameEnglish)}" oninput="updateDiscoveryField('${place.id}','nameEnglish',this.value)">
                </div>
                <div class="form-group">
                    <label>Category (Bosnian)</label>
                    <input type="text" value="${escapeHtml(place.categoryBosnian)}" oninput="updateDiscoveryField('${place.id}','categoryBosnian',this.value)">
                </div>
                <div class="form-group">
                    <label>Category (English)</label>
                    <input type="text" value="${escapeHtml(place.categoryEnglish)}" oninput="updateDiscoveryField('${place.id}','categoryEnglish',this.value)">
                </div>
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Link</label>
                    <input type="text" value="${escapeHtml(place.link)}" oninput="updateDiscoveryField('${place.id}','link',this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

function handleDiscoveryImage(event, id) {
    const file = event.target.files?.[0];
    updateDiscoveryField(id, 'placeImage', file || null);
    renderDiscovery();
}

async function saveDiscovery() {
    try {
        await fetch('/api/hotspot/discovery', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ places: hotspotDiscovery })
        });
        showNotification('Discovery saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving discovery: ' + err.message, 'error');
    }
}

// ============================================
// QUICK FUN SECTION
// ============================================

async function loadQuickFun() {
    try {
        hotspotQuickFun = await fetchAPI('/api/hotspot/quick-fun');
    } catch (err) {
        console.warn('Failed to load quick fun:', err.message);
        hotspotQuickFun = { bannerImage: null, titleBosnian: '', titleEnglish: '', subtitleBosnian: '', subtitleEnglish: '', link: '' };
    }
}

function updateQuickFunField(field, value) {
    hotspotQuickFun[field] = value;
}

function renderQuickFun() {
    const container = document.getElementById('quickfun-content');
    if (!container) return;
    container.innerHTML = `
        <div class="block-item" style="border:1px solid var(--border);padding:20px;border-radius:8px;background:#fff;">
            <h3 style="margin-top:0;">Quick Fun Feature</h3>
            <p style="color:var(--text-light);font-size:13px;">Single 16:9 image banner linking to a game or interactive experience.</p>
            <div class="form-grid">
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Banner Image (16:9)</label>
                    <input type="file" accept="image/*" onchange="handleQuickFunImage(event)">
                    ${hotspotQuickFun.bannerImage ? `<small class='form-help-text'>${typeof hotspotQuickFun.bannerImage === 'string' ? hotspotQuickFun.bannerImage : hotspotQuickFun.bannerImage.name}</small>` : ''}
                </div>
                <div class="form-group">
                    <label>Title (Bosnian)</label>
                    <input type="text" value="${escapeHtml(hotspotQuickFun.titleBosnian || '')}" oninput="updateQuickFunField('titleBosnian',this.value)">
                </div>
                <div class="form-group">
                    <label>Title (English)</label>
                    <input type="text" value="${escapeHtml(hotspotQuickFun.titleEnglish || '')}" oninput="updateQuickFunField('titleEnglish',this.value)">
                </div>
                <div class="form-group">
                    <label>Subtitle (Bosnian)</label>
                    <input type="text" value="${escapeHtml(hotspotQuickFun.subtitleBosnian || '')}" oninput="updateQuickFunField('subtitleBosnian',this.value)">
                </div>
                <div class="form-group">
                    <label>Subtitle (English)</label>
                    <input type="text" value="${escapeHtml(hotspotQuickFun.subtitleEnglish || '')}" oninput="updateQuickFunField('subtitleEnglish',this.value)">
                </div>
                <div class="form-group" style="grid-column:1 / -1;">
                    <label>Link</label>
                    <input type="text" value="${escapeHtml(hotspotQuickFun.link || '')}" oninput="updateQuickFunField('link',this.value)">
                </div>
            </div>
        </div>
    `;
}

function handleQuickFunImage(event) {
    const file = event.target.files?.[0];
    updateQuickFunField('bannerImage', file || null);
    renderQuickFun();
}

async function saveQuickFun() {
    try {
        await fetch('/api/hotspot/quick-fun', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hotspotQuickFun)
        });
        showNotification('Quick Fun saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving Quick Fun: ' + err.message, 'error');
    }
}

// ============================================
// UTILITIES SECTION
// ============================================

async function loadUtilities() {
    try {
        hotspotUtilities = await fetchAPI('/api/hotspot/utilities');
    } catch (err) {
        console.warn('Failed to load utilities:', err.message);
        hotspotUtilities = { cityName: '', baseCurrency: '', timezone: '', latitude: '', longitude: '', targetCurrencies: '' };
    }
}

function updateUtilitiesField(field, value) {
    hotspotUtilities[field] = value;
}

function renderUtilities() {
    const container = document.getElementById('utilities-content');
    if (!container) return;
    container.innerHTML = `
        <div class="block-item" style="border:1px solid var(--border);padding:20px;border-radius:8px;background:#fff;">
            <h3 style="margin-top:0;">Utilities Configuration</h3>
            <p style="color:var(--text-light);font-size:13px;">Defaults for city utility widgets (weather/time/currency).</p>
            <div class="form-grid">
                <div class="form-group">
                    <label>City Name</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.cityName || '')}" oninput="updateUtilitiesField('cityName',this.value)">
                </div>
                <div class="form-group">
                    <label>Base Currency</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.baseCurrency || '')}" oninput="updateUtilitiesField('baseCurrency',this.value)" placeholder="e.g., BAM">
                </div>
                <div class="form-group">
                    <label>Timezone (IANA)</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.timezone || '')}" oninput="updateUtilitiesField('timezone',this.value)" placeholder="e.g., Europe/Sarajevo">
                </div>
                <div class="form-group">
                    <label>Latitude</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.latitude || '')}" oninput="updateUtilitiesField('latitude',this.value)" placeholder="e.g., 43.8563">
                </div>
                <div class="form-group">
                    <label>Longitude</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.longitude || '')}" oninput="updateUtilitiesField('longitude',this.value)" placeholder="e.g., 18.4131">
                </div>
                <div class="form-group">
                    <label>Target Currencies (comma separated)</label>
                    <input type="text" value="${escapeHtml(hotspotUtilities.targetCurrencies || '')}" oninput="updateUtilitiesField('targetCurrencies',this.value)" placeholder="e.g., USD,EUR,GBP">
                </div>
            </div>
        </div>
    `;
}

async function saveUtilities() {
    try {
        await fetch('/api/hotspot/utilities', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hotspotUtilities)
        });
        showNotification('Utilities saved', 'success');
    } catch (err) {
        console.error(err);
        showNotification('Error saving utilities: ' + err.message, 'error');
    }
}

// ============================================
// MODAL HELPERS
// ============================================

function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

function showModal(html) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = html;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
