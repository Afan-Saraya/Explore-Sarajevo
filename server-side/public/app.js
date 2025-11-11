// Global state
let allContent = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('CMS loaded');
    loadContent();
    
    // Form submission
    document.getElementById('uploadForm').addEventListener('submit', handleUpload);
    document.getElementById('editForm').addEventListener('submit', handleEditSubmit);
    
    // Auto-generate slug when name changes
    document.getElementById('name').addEventListener('input', generateSlug);
    
    // Set up content type change handler
    document.getElementById('contentType').addEventListener('change', updateFormFields);
});

// Load content from server
async function loadContent() {
    try {
        const response = await fetch('/api/content');
        if (!response.ok) throw new Error('Failed to load content');
        allContent = await response.json();
        renderContent(allContent);
    } catch (error) {
        console.error('Error loading content:', error);
        showStatus('Error loading content', 'error', 'contentList');
    }
}

// Render content cards
function renderContent(items) {
    const list = document.getElementById('contentList');
    
    if (items.length === 0) {
        list.innerHTML = '<p class="placeholder">No content yet. Create your first item above!</p>';
        return;
    }
    
    list.innerHTML = items.map(item => createContentCard(item)).join('');
}

// Create a content card HTML
function createContentCard(item) {
    const contentType = item.contentType || 'unknown';
    const typeEmoji = {
        business: '🏢',
        attraction: '�️'
    }[contentType] || '📎';
    
    let mediaHTML = '';
    
    if (item.images && item.images.length > 0) {
        const imagePath = Array.isArray(item.images) ? item.images[0] : item.images;
        mediaHTML = `
            <div class="card-media">
                <img src="${imagePath}" alt="${item.name || item.title}">
                <span class="card-badge">${contentType}</span>
            </div>
        `;
    } else {
        mediaHTML = `
            <div class="card-media">
                <div class="media-placeholder">${typeEmoji}</div>
                <span class="card-badge">${contentType}</span>
            </div>
        `;
    }
    
    // Build details based on content type
    let detailsHTML = '';
    if (contentType === 'business') {
        const ratingHTML = item.rating ? `<p class="card-meta">⭐ ${item.rating}/5</p>` : '';
        const phoneHTML = item.phone ? `<p class="card-meta">📞 ${item.phone}</p>` : '';
        const hoursHTML = item.workingHours ? `<p class="card-meta">🕒 ${item.workingHours}</p>` : '';
        detailsHTML = ratingHTML + phoneHTML + hoursHTML;
    }
    
    return `
        <div class="content-card">
            ${mediaHTML}
            <div class="card-content">
                <h3 class="card-title">${escapeHtml(item.name || item.title)}</h3>
                <p class="card-description">${escapeHtml(item.description || '')}</p>
                ${item.address ? `<p class="card-meta">📍 ${escapeHtml(item.address)}</p>` : ''}
                ${detailsHTML}
                <div class="card-actions">
                    <button class="btn btn-edit" onclick="openEditModal('${item.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteContent('${item.id}')">Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Handle main form upload
async function handleUpload(e) {
    e.preventDefault();
    const statusEl = document.getElementById('uploadStatus');
    
    try {
        showStatus('Uploading...', 'loading', 'uploadStatus');
        
        const formData = new FormData(document.getElementById('uploadForm'));
        
        // Validate required fields
        const contentType = formData.get('contentType');
        const name = formData.get('name');
        const description = formData.get('description');
        
        if (!contentType || !name || !description) {
            showStatus('Content Type, Name, and Description are required', 'error', 'uploadStatus');
            return;
        }
        
        // Build clean payload
        const payload = {
            contentType,
            name,
            slug: formData.get('slug') || generateSlugValue(name),
            description,
            address: formData.get('address') || '',
            location: formData.get('location') || '',
            categoryId: formData.get('categoryId') || '',
        };
        
        // Add business-specific fields
        if (contentType === 'business') {
            payload.parentCategoryId = formData.get('parentCategoryId') || '';
            payload.brandId = formData.get('brandId') || '';
            payload.phone = formData.get('phone') || '';
            payload.website = formData.get('website') || '';
            payload.rating = formData.get('rating') ? parseFloat(formData.get('rating')) : 0;
            payload.workingHours = formData.get('workingHours') || '';
            payload.featuredBusiness = formData.get('featuredBusiness') ? true : false;
            payload.images = [];
        }
        
        // Add attraction-specific fields
        if (contentType === 'attraction') {
            payload.featuredLocation = formData.get('featuredLocation') ? true : false;
            payload.images = [];
        }
        
        // Handle file upload
        const file = formData.get('file');
        if (file && file.size > 0) {
            // Create FormData for multipart upload
            const uploadData = new FormData();
            Object.keys(payload).forEach(key => {
                if (key === 'images') {
                    // Will be filled with uploaded path
                } else if (typeof payload[key] === 'boolean' || typeof payload[key] === 'number') {
                    uploadData.append(key, payload[key].toString());
                } else {
                    uploadData.append(key, payload[key]);
                }
            });
            uploadData.append('file', file);
            
            const response = await fetch('/api/content', {
                method: 'POST',
                body: uploadData
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const newItem = await response.json();
            allContent.unshift(newItem);
        } else {
            // No file, just JSON
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const newItem = await response.json();
            allContent.unshift(newItem);
        }
        
        renderContent(allContent);
        
        // Reset form
        document.getElementById('uploadForm').reset();
        updateFormFields();
        showStatus('✓ Content created successfully!', 'success', 'uploadStatus');
        
        // Scroll to content list
        document.querySelector('.content-list-panel').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Upload error:', error);
        showStatus('Error uploading content: ' + error.message, 'error', 'uploadStatus');
    }
}

// Update form fields based on content type
function updateFormFields() {
    const contentType = document.getElementById('contentType').value;
    document.getElementById('businessFields').style.display = (contentType === 'business') ? 'block' : 'none';
    document.getElementById('attractionFields').style.display = (contentType === 'attraction') ? 'block' : 'none';
}

// Generate slug from name
function generateSlug() {
    const name = document.getElementById('name').value;
    const slug = generateSlugValue(name);
    document.getElementById('slug').value = slug;
}

// Generate slug value utility
function generateSlugValue(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Update file info display
function updateFileInfo() {
    const file = document.getElementById('file').files[0];
    const fileInfo = document.getElementById('fileInfo');
    if (file) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        fileInfo.textContent = `${file.name} (${sizeMB} MB)`;
    }
}

// Open edit modal
async function openEditModal(id) {
    const item = allContent.find(i => i.id === id);
    if (!item) return;
    
    const contentType = item.contentType || 'business';
    
    document.getElementById('editId').value = item.id;
    document.getElementById('editName').value = item.name || '';
    document.getElementById('editSlug').value = item.slug || '';
    document.getElementById('editDescription').value = item.description || '';
    document.getElementById('editAddress').value = item.address || '';
    document.getElementById('editLocation').value = item.location || '';
    document.getElementById('editCategoryId').value = item.categoryId || '';
    
    // Show/hide business-specific fields
    document.getElementById('editBusinessFields').style.display = (contentType === 'business') ? 'block' : 'none';
    document.getElementById('editAttractionFields').style.display = (contentType === 'attraction') ? 'block' : 'none';
    
    // Fill business fields if applicable
    if (contentType === 'business') {
        document.getElementById('editParentCategoryId').value = item.parentCategoryId || '';
        document.getElementById('editBrandId').value = item.brandId || '';
        document.getElementById('editPhone').value = item.phone || '';
        document.getElementById('editWebsite').value = item.website || '';
        document.getElementById('editRating').value = item.rating || '';
        document.getElementById('editWorkingHours').value = item.workingHours || '';
        document.getElementById('editFeaturedBusiness').checked = item.featuredBusiness || false;
    }
    
    // Fill attraction fields if applicable
    if (contentType === 'attraction') {
        document.getElementById('editFeaturedLocation').checked = item.featuredLocation || false;
    }
    
    document.getElementById('editModal').style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    document.getElementById('editStatus').textContent = '';
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();
    const statusEl = document.getElementById('editStatus');
    
    try {
        showStatus('Saving...', 'loading', 'editStatus');
        
        const id = document.getElementById('editId').value;
        const formData = new FormData(document.getElementById('editForm'));
        
        const response = await fetch(`/api/content/${id}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const updatedItem = await response.json();
        
        // Update in local state
        const idx = allContent.findIndex(i => i.id === id);
        if (idx !== -1) {
            allContent[idx] = updatedItem;
        }
        
        renderContent(allContent);
        showStatus('✓ Content updated successfully!', 'success', 'editStatus');
        
        setTimeout(() => {
            closeEditModal();
        }, 1500);
    } catch (error) {
        console.error('Edit error:', error);
        showStatus('Error updating content: ' + error.message, 'error', 'editStatus');
    }
}

// Delete content
async function deleteContent(id) {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/content/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        allContent = allContent.filter(i => i.id !== id);
        renderContent(allContent);
        alert('Content deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting content: ' + error.message);
    }
}

// Filter content by search and type
function filterContent() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filtered = allContent.filter(item => {
        const matchesSearch = (item.name || item.title || '').toLowerCase().includes(searchTerm) ||
                            (item.description || '').toLowerCase().includes(searchTerm) ||
                            (item.address || '').toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilter || item.contentType === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    renderContent(filtered);
}

// Show status message
function showStatus(message, type, elementId = 'uploadStatus') {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.className = `status-message ${type}`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            el.textContent = '';
            el.className = 'status-message';
        }, 5000);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
