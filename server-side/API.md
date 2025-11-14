# CMS API Documentation

## Base URL
`http://localhost:3000`

## Status Endpoints
- `GET /api/status` - Server health check
- `GET /api/db-status` - Database connection status

---

## Categories API (Taxonomies)

### List all categories
```
GET /api/categories
```

### Get single category (with usage count)
```
GET /api/categories/:id
```

### Create category
```
POST /api/categories
Content-Type: application/json

{
  "name": "Food & Drink",
  "slug": "food-drink",  // optional, auto-generated from name
  "description": "Restaurants, cafes, bars",
  "image": "https://example.com/image.jpg"  // optional
}
```

### Update category
```
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg"
}
```

### Delete category
```
DELETE /api/categories/:id
```

---

## Types API (Taxonomies)

Same structure as Categories:
- `GET /api/types`
- `GET /api/types/:id`
- `POST /api/types`
- `PUT /api/types/:id`
- `DELETE /api/types/:id`

---

## Brands API

### List all brands
```
GET /api/brands
GET /api/brands?search=coffee          // Search by name/slug
GET /api/brands?parent_id=123         // Filter by parent brand
```

### Get single brand
```
GET /api/brands/:id
```

### Create brand
```
POST /api/brands
Content-Type: application/json

{
  "name": "Starbucks",
  "slug": "starbucks",  // optional
  "description": "Coffee chain",
  "media": ["https://example.com/logo.jpg"],  // optional, array
  "business_id": "ext-123",  // optional external ID
  "parent_brand_id": 5,  // optional, reference to parent brand
  "brand_pdv": "12345678"  // optional VAT/PDV number
}
```

### Update brand
```
PUT /api/brands/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "parent_brand_id": null  // remove parent
}
```

### Delete brand
```
DELETE /api/brands/:id
```

---

## Businesses API

### List all businesses
```
GET /api/businesses
GET /api/businesses?brand_id=5          // Filter by brand
GET /api/businesses?featured=true       // Filter by featured
GET /api/businesses?search=coffee       // Search by name
```

### Get single business (includes categories and types)
```
GET /api/businesses/:id
```

### Create business
```
POST /api/businesses
Content-Type: application/json

{
  "name": "Café Central",
  "slug": "cafe-central",  // optional
  "brand_id": 5,  // optional
  "description": "Historic café in the heart of Sarajevo",
  "address": "Ferhadija 2",
  "location": "Baščaršija",
  "rating": 4.5,  // optional
  "featured_business": true,  // optional, default false
  "telephone": "+387 33 123 456",  // optional
  "website": "https://cafecentral.ba",  // optional
  "media": ["/uploads/cafe-1.jpg", "/uploads/cafe-2.jpg"],  // optional array
  "category_ids": [1, 3, 5],  // optional, array of category IDs
  "type_ids": [2, 7]  // optional, array of type IDs
}
```

### Update business
```
PUT /api/businesses/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "rating": 4.8,
  "category_ids": [1, 2],  // replaces all categories
  "type_ids": [3]  // replaces all types
}
```

### Delete business
```
DELETE /api/businesses/:id
```
Note: Also deletes associated category and type relationships.

---

## Attractions API

Same structure as Businesses, but simpler (no brand, no contact):
- `GET /api/attractions`
- `GET /api/attractions?featured=true`
- `GET /api/attractions?search=bridge`
- `GET /api/attractions/:id`
- `POST /api/attractions`
- `PUT /api/attractions/:id`
- `DELETE /api/attractions/:id`

### Create attraction example
```json
{
  "name": "Old Bridge",
  "slug": "old-bridge",
  "description": "Historic bridge",
  "address": "Stari Most",
  "location": "Mostar",
  "featured_location": true,
  "media": ["/uploads/bridge.jpg"],
  "category_ids": [4, 6],
  "type_ids": [9]
}
```

---

## Events API

### List all events
```
GET /api/events
GET /api/events?status=published       // Filter by status
GET /api/events?search=festival        // Search by name
```

### Get single event
```
GET /api/events/:id
```
Returns event with `start_date` and `end_date` extracted from `date_range`.

### Create event
```
POST /api/events
Content-Type: application/json

{
  "name": "Sarajevo Film Festival",
  "slug": "sarajevo-film-festival",  // optional
  "description": "Annual international film festival",
  "status": "published",  // draft|published|archived, default: draft
  "media": ["/uploads/sff-poster.jpg"],  // optional
  "start_date": "2025-08-15T00:00:00Z",  // ISO datetime
  "end_date": "2025-08-22T23:59:59Z",    // ISO datetime
  "show_date_range": true,  // optional, default true
  "category_ids": [7, 8],  // optional
  "type_ids": [12]  // optional
}
```

### Update event
```
PUT /api/events/:id
Content-Type: application/json

{
  "status": "archived",
  "start_date": "2025-08-16T00:00:00Z",  // updates date range
  "end_date": "2025-08-23T23:59:59Z"
}
```

### Delete event
```
DELETE /api/events/:id
```
Note: Also deletes all associated sub-events and relationships.

---

## Sub-events API

### List all sub-events
```
GET /api/subevents
GET /api/subevents?event_id=15         // Filter by parent event
```

### Get single sub-event
```
GET /api/subevents/:id
```

### Create sub-event
```
POST /api/subevents
Content-Type: application/json

{
  "event_id": 15,  // REQUIRED - parent event ID
  "description": "Opening night screening",
  "media": ["/uploads/opening.jpg"],  // optional
  "start_date": "2025-08-15T19:00:00Z",  // optional
  "end_date": "2025-08-15T22:00:00Z",    // optional
  "status": "published",  // optional, default: draft
  "show_event": true,  // optional, default true
  "category_ids": [7],  // optional
  "type_ids": [12]  // optional
}
```

### Update sub-event
```
PUT /api/subevents/:id
Content-Type: application/json

{
  "description": "Updated description",
  "status": "published"
}
```

### Delete sub-event
```
DELETE /api/subevents/:id
```

---

## File Upload

### Upload a file
```
POST /api/upload
Content-Type: multipart/form-data

file: [binary file]
```

Response:
```json
{
  "filename": "1699876543210-image.jpg",
  "path": "/uploads/1699876543210-image.jpg"
}
```

### List uploaded files
```
GET /api/uploads
```

Response:
```json
{
  "files": ["1699876543210-image.jpg", "1699876543211-logo.png"]
}
```

---

## Content API (Legacy)

The original generic content endpoints are still available:
- `GET /api/content`
- `GET /api/content/:id`
- `POST /api/content`
- `PUT /api/content/:id`
- `DELETE /api/content/:id`

---

## Notes

### Many-to-Many Relationships
When creating or updating entities with categories/types:
- Send `category_ids` and/or `type_ids` as arrays of integers
- The API will automatically manage the join tables
- On update, providing these arrays replaces all existing relationships
- Omitting them leaves existing relationships unchanged

### Slug Generation
If you don't provide a `slug`, it will be auto-generated from the `name`:
- Lowercased
- Non-alphanumeric characters removed (except hyphens)
- Spaces replaced with hyphens

### Date Ranges
Events and sub-events store date ranges in Postgres `tsrange` type:
- Send `start_date` and `end_date` as ISO 8601 strings
- API converts them to Postgres range format
- On retrieval, `start_date` and `end_date` are extracted automatically

### Media Fields
Media fields accept:
- String (single image URL)
- Array of strings (multiple image URLs)
- Stored as JSONB in database

### Filters
Most list endpoints support query parameters for filtering and search. Check each endpoint's documentation above.
