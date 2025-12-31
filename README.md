# Birria Fusion Food Truck Management System

## WHAT THIS APP IS
A comprehensive food truck management system for **Birria Fusion** - a Mexican food truck business. This is a **COMPLETE, WORKING APPLICATION** that manages every aspect of food truck operations from menu costing to employee scheduling.

## CURRENT STATUS: FULLY OPERATIONAL ✅
- **Server**: Running on port 3000 (HTTP)
- **Database**: SQLite (foodtruck.db) with full schema
- **Security**: Fixed and hardened (NO receipt scanning functionality)
- **UI**: Mobile-responsive single-page application
- **Authentication**: Role-based user system with bcrypt passwords

## WHAT THE APP DOES

### Core Business Functions
1. **Menu Management** - Recipe costing, profit margin analysis, ingredient tracking
2. **Inventory Control** - Stock levels, alerts, waste logging, barcode scanning
3. **Employee Management** - Time clock, scheduling, permissions, food handler cards
4. **Catering & Events** - Order management, calendar integration, client tracking
5. **Financial Analytics** - Cost analysis, expense tracking, profit reporting
6. **Document Management** - File uploads, license tracking, maintenance schedules

### Key Features
- **Real-time cost calculations** for menu items based on ingredient costs
- **Automated inventory alerts** when stock runs low
- **Employee time tracking** with punch in/out system
- **Calendar integration** showing events, catering, and maintenance
- **Mobile-first design** that works on phones and tablets
- **Role-based permissions** controlling what employees can access
- **Business analytics** with profit margin analysis

## ARCHITECTURE

### Backend (server.js)
- **Express.js** server with REST API endpoints
- **SQLite3** database with 20+ tables
- **Multer** for secure file uploads
- **bcrypt** for password hashing
- **Security middleware** for path traversal protection

### Frontend (public/index.html)
- **Single-page application** with vanilla JavaScript
- **Mobile-responsive** CSS with touch-friendly interface
- **Real-time updates** via fetch API calls
- **Modal-based** forms and interactions

### Database Schema
```
menu (recipes with cost/price)
ingredients (base ingredients with costs)
inventory (current stock levels)
employees (staff with permissions)
users (authentication)
catering (orders and clients)
events (festivals, markets)
suppliers (vendor information)
reviews (customer feedback)
expenses (business costs)
files (document storage)
contacts (client database)
+ 10 more supporting tables
```

## SECURITY STATUS
**✅ SECURE** - All vulnerabilities have been fixed:
- Path traversal protection on file uploads
- File type validation and sanitization
- Input validation on all endpoints
- No external CDN dependencies
- No receipt scanning functionality (completely removed)

## WHAT WAS REMOVED
**Receipt Scanning System** - Completely eliminated due to:
- OCR functionality was broken and unreliable
- Security vulnerabilities in file processing
- User requested complete removal
- All related code, endpoints, and UI elements deleted

## HOW TO USE

### Starting the App
```bash
cd /root/food-truck-app
node server.js
```
Access at: http://192.168.0.44:3000

### Default Login
- Username: `admin`
- Password: `admin123`
**CHANGE THIS IMMEDIATELY**

### Main Navigation
- **Dashboard** - Business overview and alerts
- **Menu** - Recipe management and costing
- **Ingredients** - Base ingredient costs
- **Inventory** - Stock tracking and alerts
- **Suppliers** - Vendor management
- **Employee** - Time clock and scheduling
- **Tools** - Files, licenses, maintenance
- **Catering** - Order management
- **Events** - Festival and market tracking
- **Marketing** - Review management
- **Analytics** - Financial reporting
- **Contacts** - Client database
- **Settings** - Configuration and permissions

## DEVELOPMENT NOTES

### File Structure
```
/root/food-truck-app/
├── server.js (main backend)
├── public/index.html (frontend SPA)
├── public/uploads/ (file storage)
├── foodtruck.db (SQLite database)
├── package.json (dependencies)
└── node_modules/ (packages)
```

### Key Dependencies
- express (web server)
- sqlite3 (database)
- multer (file uploads)
- bcrypt (password hashing)
- jspdf (PDF generation)

### API Endpoints
All endpoints follow REST conventions:
- GET /api/menu (list recipes)
- POST /api/menu (create recipe)
- PUT /api/menu/:id (update recipe)
- DELETE /api/menu/:id (delete recipe)
- Similar patterns for all resources

## TROUBLESHOOTING

### Common Issues
1. **Port 3000 in use** - Kill existing process: `pkill -f "node server.js"`
2. **Database locked** - Restart server, SQLite will recover
3. **File upload fails** - Check uploads directory permissions
4. **Login fails** - Verify bcrypt is working, check user table

### Security Warnings
- Browser may show HTTPS warnings (ignore for local development)
- No external scripts loaded (security hardened)
- All file uploads validated and sanitized

## FUTURE DEVELOPMENT

### Planned Features
- **Point of Sale** integration for real-time sales tracking
- **GPS tracking** for truck location management
- **Customer loyalty** program integration
- **Advanced reporting** with charts and graphs
- **Mobile app** for employees (React Native)

### Technical Improvements
- **Database optimization** for larger datasets
- **Real-time notifications** via WebSocket
- **Backup automation** to cloud storage
- **Multi-location** support for franchise operations

## IMPORTANT NOTES

### DO NOT
- ❌ Add receipt scanning functionality back
- ❌ Use external CDN scripts (security risk)
- ❌ Modify security middleware without testing
- ❌ Delete the uploads directory
- ❌ Change database schema without migration

### ALWAYS
- ✅ Test changes on development before production
- ✅ Backup database before major changes
- ✅ Validate user input on all forms
- ✅ Use prepared statements for database queries
- ✅ Keep dependencies updated for security

## CONTACT & SUPPORT
This is a custom application built specifically for Birria Fusion food truck operations. All code is proprietary and should not be shared or distributed.

**Last Updated**: January 2025
**Version**: 2.0 (Security Hardened)
**Status**: Production Ready ✅