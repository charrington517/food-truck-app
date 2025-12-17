# Birria Fusion Food Truck Management System

A comprehensive food truck management application with inventory tracking, employee management, catering orders, and business analytics.

## Features

- **Menu Management** - Recipe costing and profit margin analysis
- **Inventory Tracking** - Stock levels, alerts, and waste logging
- **Employee Management** - Time clock, scheduling, and permissions
- **Catering & Events** - Order management and calendar integration
- **Business Analytics** - Cost analysis and reporting
- **File Management** - Document storage and organization
- **User Authentication** - Role-based access control

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Access at `http://localhost:3000`

## Default Login

- Username: `admin`
- Password: `admin123`

**Important:** Change the default password immediately after first login.

## Security Features

- File upload validation and sanitization
- Path traversal protection
- Input validation and sanitization
- Role-based permissions system

## Database

Uses SQLite for data storage. Database file (`foodtruck.db`) is created automatically on first run.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Security:** bcrypt, input validation, file restrictions

## License

Private use only.