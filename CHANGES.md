# Database Migration Changes - December 2024

## Overview
Migrated business contact information from localStorage to SQLite database to ensure data persistence and enable PDF generation with accurate business details.

## Changes Made

### 1. Database Schema Updates

#### Expanded `business_info` Table
```sql
ALTER TABLE business_info ADD COLUMN phone TEXT;
ALTER TABLE business_info ADD COLUMN email TEXT;
ALTER TABLE business_info ADD COLUMN address TEXT;
ALTER TABLE business_info ADD COLUMN website TEXT;
ALTER TABLE business_info ADD COLUMN facebook TEXT;
ALTER TABLE business_info ADD COLUMN instagram TEXT;
```

#### New Tables Created
```sql
-- Recipes table for menu item ingredients
CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id INTEGER,
    ingredients TEXT,
    FOREIGN KEY (menu_id) REFERENCES menu (id)
);

-- Licenses table for license renewals
CREATE TABLE licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expiry_date TEXT,
    status TEXT DEFAULT 'Active'
);

-- Maintenance tasks table
CREATE TABLE maintenance_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    due_date TEXT,
    status TEXT DEFAULT 'Pending',
    notes TEXT
);
```

### 2. New API Endpoints

#### Business Info
- `GET /api/business-info` - Retrieve business contact information
- `POST /api/business-info` - Save/update business contact information

#### Settings
- `GET /api/settings` - Retrieve all settings
- `POST /api/settings` - Save individual setting
- `POST /api/settings/bulk` - Save multiple settings at once

#### Recipes
- `GET /api/recipes/:menuId` - Get recipe ingredients for menu item
- `POST /api/recipes` - Save recipe ingredients

#### Licenses
- `GET /api/licenses` - List all licenses
- `POST /api/licenses` - Create new license
- `PUT /api/licenses/:id` - Update license
- `DELETE /api/licenses/:id` - Delete license

#### Maintenance Tasks
- `GET /api/maintenance-tasks` - List all tasks
- `POST /api/maintenance-tasks` - Create new task
- `PUT /api/maintenance-tasks/:id` - Update task
- `DELETE /api/maintenance-tasks/:id` - Delete task

#### Files
- `GET /api/files` - List all file metadata
- `POST /api/files` - Save file metadata
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file metadata

### 3. Frontend Changes

#### Updated Functions (Made Async)
- `saveBusinessInfo()` - Now saves to database via API
- `loadBusinessInfo()` - Now loads from database via API
- `generateCateringPDF()` - Fetches business info from database
- `exportCateringPDF()` - Made async to await PDF generation

#### Business Info Storage
**Before:**
```javascript
localStorage.setItem('businessPhone', value);
localStorage.setItem('businessEmail', value);
// etc...
```

**After:**
```javascript
await fetch('/api/business-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phone: value,
        email: value,
        // etc...
    })
});
```

#### PDF Generation
**Before:**
```javascript
const phone = localStorage.getItem('businessPhone') || '(555) 123-4567';
```

**After:**
```javascript
const response = await fetch('/api/business-info');
const businessInfo = await response.json();
const phone = businessInfo.phone || '(555) 123-4567';
```

### 4. Files Created

- `/public/db-helpers.js` - Database helper functions (created but not integrated)
- `/public/migrate-localstorage.html` - One-time data migration page
- `/public/index.html.backup` - Backup of original file
- `/root/food-truck-app/LOCALSTORAGE_MIGRATION.md` - Full migration documentation
- `/root/food-truck-app/CHANGES.md` - This file

### 5. Migration Scripts Created

- `update-frontend.js` - Initial localStorage replacement script
- `update-remaining.js` - Category functions update script
- `final-update.js` - Final localStorage updates script

## What Still Uses LocalStorage

- `currentUser` - Current user session
- `users` - User authentication data
- All other app data (categories, settings, etc.) - **Intentionally kept in localStorage for stability**

## Benefits

1. **Business Info Persistence** - Contact information survives browser cache clears
2. **Accurate PDFs** - Catering quotes always show current business contact info
3. **Database Backup** - Business info included in database backups
4. **API Access** - Business info accessible via REST API
5. **Future-Ready** - Infrastructure in place for additional migrations

## Testing Performed

- ✅ Business info saves to database
- ✅ Business info loads from database
- ✅ PDF generation uses database business info
- ✅ Settings page displays and saves correctly
- ✅ Login/authentication still works
- ✅ No console errors on page load
- ✅ Server restart preserves data

## Rollback Instructions

If issues occur, restore the backup:
```bash
cd /root/food-truck-app/public
cp index.html.backup index.html
```

Then restart the server:
```bash
pkill -f "node server.js"
cd /root/food-truck-app
node server.js
```

## Future Considerations

The infrastructure is now in place to migrate additional data from localStorage to the database:
- Categories (menu, supplier, file, etc.)
- Settings (theme, default margin, etc.)
- Recipe ingredients
- Licenses and maintenance tasks
- File metadata

These can be migrated incrementally as needed without breaking existing functionality.

## Notes

- Migration was performed on December 2024
- Original localStorage data was preserved during migration
- Changes are backward compatible
- No user data was lost during migration
- Database file: `/root/food-truck-app/foodtruck.db`
