# Menu Planner Feature

## Overview
Added a Menu Planner feature to schedule rotating specials and seasonal menu items with date ranges and day-of-week availability.

## Database Changes
- **New Table**: `menu_specials`
  - `id`: Primary key
  - `name`: Special name (e.g., "Summer Mango Tacos")
  - `description`: Optional description
  - `price`: Optional price
  - `start_date`: Start date for the special
  - `end_date`: End date for the special
  - `days_of_week`: JSON array of days (0=Sunday, 6=Saturday)
  - `status`: 'scheduled', 'active', or 'ended'
  - `category`: 'seasonal', 'weekly', 'daily', or 'limited'

## API Endpoints
- `GET /api/menu-specials` - Get all menu specials
- `POST /api/menu-specials` - Create new special
- `PUT /api/menu-specials/:id` - Update special
- `DELETE /api/menu-specials/:id` - Delete special
- `GET /api/menu-specials/active` - Get currently active specials

## UI Features
- **Menu Planner Section** on Menu page (above Menu Items)
- **Add Special Button** - Opens modal to create new special
- **Special Cards** show:
  - Name and description
  - Category and price
  - Date range (start to end)
  - Available days of week
  - Status badge (ACTIVE/SCHEDULED/ENDED)
  - Color-coded border (green=active, yellow=scheduled, gray=ended)
- **Edit/Delete** buttons on each special card

## Usage
1. Navigate to Menu page
2. Click "Add Special" in Menu Planner section
3. Fill in:
   - Special name
   - Description (optional)
   - Price (optional)
   - Category (seasonal/weekly/daily/limited)
   - Start and end dates
   - Available days (check boxes for specific days)
4. Click "Add Special"

## Status Logic
- **SCHEDULED**: Start date is in the future
- **ACTIVE**: Current date is between start and end dates
- **ENDED**: End date has passed

## Day Selection
- Leave all days unchecked = available all days
- Check specific days = only available on those days
- Days: Sun, Mon, Tue, Wed, Thu, Fri, Sat

## Examples
- **Seasonal**: "Summer Mango Tacos" (June 1 - Aug 31)
- **Weekly**: "Taco Tuesday Special" (recurring Tuesdays)
- **Daily**: "Lunch Special" (Mon-Fri, 11am-2pm)
- **Limited**: "Valentine's Day Menu" (Feb 14 only)
