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
            case 'uploads':
                await renderUploads(container);
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
    const [categories, types, brands, businesses, attractions, events] = await Promise.all([
        fetchAPI('/api/categories'),
        fetchAPI('/api/types'),
        fetchAPI('/api/brands'),
        fetchAPI('/api/businesses'),
        fetchAPI('/api/attractions'),
        fetchAPI('/api/events')
    ]);

    container.innerHTML = `
        <div class="page-header">
            <h1>📊 Dashboard</h1>
            <p>Overview of your content</p>
        </div>

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
                <label>Image URL</label>
                <input type="text" name="image" value="${data?.image || ''}" placeholder="https://example.com/image.jpg">
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
                    <label>Media URLs (one per line)</label>
                    <textarea name="media_urls" rows="4" placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg">${Array.isArray(data?.media) ? data.media.join('\n') : ''}</textarea>
                    <small class="form-help-text">Paste full URLs to images or videos already uploaded (via Uploads). They will be stored as an ordered list.</small>
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
                            <img src="/uploads/${file}" style="max-width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                            <div style="font-size: 12px; color: var(--text-light); word-break: break-all;">${file}</div>
                            <button class="btn btn-sm btn-secondary mt-1" onclick="copyToClipboard('/uploads/${file}')">Copy URL</button>
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
                <label>Select File *</label>
                <input type="file" name="file" required>
            </div>
            <button type="submit" class="btn btn-primary">Upload</button>
        </form>
    `);

    document.getElementById('upload-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');
            closeModal();
            showView('uploads');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard: ' + text);
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
