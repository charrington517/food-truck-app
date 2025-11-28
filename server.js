require('dotenv').config();
const express = require('express');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;



// Middleware
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage });

// Database setup
const db = new sqlite3.Database('foodtruck.db');

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        recipe_type TEXT DEFAULT 'Food',
        portions INTEGER DEFAULT 1,
        profit_margin REAL GENERATED ALWAYS AS (((price - cost) / price) * 100) STORED
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cost REAL NOT NULL,
        unit TEXT NOT NULL,
        servings INTEGER DEFAULT 1
    )`);

    // Add servings column if it doesn't exist
    db.run(`ALTER TABLE ingredients ADD COLUMN servings INTEGER DEFAULT 1`, (err) => {
        // Ignore error if column already exists
    });

    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        ingredient_id INTEGER PRIMARY KEY,
        current_stock REAL NOT NULL,
        min_stock REAL NOT NULL,
        max_stock REAL NOT NULL,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        category TEXT DEFAULT 'Food',
        description TEXT
    )`);
    
    // Add address column if it doesn't exist
    db.run(`ALTER TABLE suppliers ADD COLUMN address TEXT`, (err) => {
        // Ignore error if column already exists
    });

    // Employees table
    db.run(`CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        username TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        notes TEXT,
        status TEXT DEFAULT 'signed-out',
        sign_in_time TEXT,
        total_hours REAL DEFAULT 0,
        permissions TEXT
    )`);

    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        employee_id INTEGER,
        permissions TEXT
    )`);

    // Events table
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        location TEXT,
        date TEXT,
        end_date TEXT,
        time TEXT,
        fee REAL DEFAULT 0,
        status TEXT DEFAULT 'Interested',
        notes TEXT,
        paid INTEGER DEFAULT 0
    )`);

    // Catering table
    db.run(`CREATE TABLE IF NOT EXISTS catering (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client TEXT NOT NULL,
        date TEXT NOT NULL,
        guests INTEGER,
        price REAL,
        status TEXT DEFAULT 'Inquiry',
        deposit REAL DEFAULT 0,
        setup_time TEXT,
        selected_menu TEXT,
        staff_assigned TEXT,
        notes TEXT
    )`);
    
    // Add new columns if they don't exist
    db.run(`ALTER TABLE catering ADD COLUMN service_type TEXT DEFAULT 'Delivery'`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN staff_count INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN staff_cost REAL DEFAULT 0`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN location TEXT`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN event_start_time TEXT`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN event_end_time TEXT`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN equipment_provider TEXT DEFAULT 'Birria Fusion'`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN equipment_cost REAL DEFAULT 0`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN equipment_notes TEXT`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN payment_status TEXT DEFAULT 'Deposit Needed'`, () => {});
    db.run(`ALTER TABLE catering ADD COLUMN personal_notes TEXT`, () => {});

    // Reviews table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform TEXT,
        rating INTEGER,
        reviewer_name TEXT,
        review_text TEXT,
        review_date TEXT,
        response_status TEXT DEFAULT 'Not Responded',
        response_text TEXT
    )`);

    // Expenses table
    db.run(`CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        amount REAL,
        description TEXT,
        date TEXT,
        payment TEXT
    )`);

    // Tools table
    db.run(`CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'Working'
    )`);

    // Files table
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        type TEXT,
        category TEXT DEFAULT 'General',
        upload_date TEXT
    )`);

    // Business info table
    db.run(`CREATE TABLE IF NOT EXISTS business_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        website TEXT,
        facebook TEXT,
        instagram TEXT,
        default_margin REAL DEFAULT 30
    )`);
    
    db.run(`ALTER TABLE business_info ADD COLUMN phone TEXT`, () => {});
    db.run(`ALTER TABLE business_info ADD COLUMN email TEXT`, () => {});
    db.run(`ALTER TABLE business_info ADD COLUMN address TEXT`, () => {});
    db.run(`ALTER TABLE business_info ADD COLUMN website TEXT`, () => {});
    db.run(`ALTER TABLE business_info ADD COLUMN facebook TEXT`, () => {});
    db.run(`ALTER TABLE business_info ADD COLUMN instagram TEXT`, () => {});

    // Settings table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
    )`);

    // Time punches table
    db.run(`CREATE TABLE IF NOT EXISTS time_punches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        sign_in_time TEXT,
        sign_out_time TEXT,
        total_hours REAL,
        date TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )`);
    
    // Recipes table
    db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_id INTEGER,
        ingredients TEXT,
        FOREIGN KEY (menu_id) REFERENCES menu (id)
    )`);
    
    // Licenses table
    db.run(`CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        expiry_date TEXT,
        status TEXT DEFAULT 'Active'
    )`);
    
    // Maintenance tasks table
    db.run(`CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        due_date TEXT,
        status TEXT DEFAULT 'Pending',
        notes TEXT
    )`);
});

// API Routes
app.get('/api/menu', (req, res) => {
    db.all('SELECT * FROM menu ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/menu', (req, res) => {
    const { name, price, cost, recipe_type, portions } = req.body;
    db.run('INSERT INTO menu (name, price, cost, recipe_type, portions) VALUES (?, ?, ?, ?, ?)',
        [name, price, cost, recipe_type || 'Food', portions || 1],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/menu/:id', (req, res) => {
    const { name, price, cost, recipe_type, portions } = req.body;
    db.run('UPDATE menu SET name = ?, price = ?, cost = ?, recipe_type = ?, portions = ? WHERE id = ?',
        [name, price, cost, recipe_type || 'Entree', portions || 1, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/menu/:id', (req, res) => {
    db.run('DELETE FROM menu WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/ingredients', (req, res) => {
    db.all('SELECT * FROM ingredients ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/ingredients', (req, res) => {
    const { name, cost, unit, servings } = req.body;
    db.run('INSERT INTO ingredients (name, cost, unit, servings) VALUES (?, ?, ?, ?)',
        [name, cost, unit, servings || 1],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/ingredients/:id', (req, res) => {
    const { name, cost, unit, servings } = req.body;
    db.run('UPDATE ingredients SET name = ?, cost = ?, unit = ?, servings = ? WHERE id = ?',
        [name, cost, unit, servings || 1, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/ingredients/:id', (req, res) => {
    db.run('DELETE FROM ingredients WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/inventory', (req, res) => {
    db.all(`SELECT i.*, ing.name, ing.unit 
            FROM inventory i 
            JOIN ingredients ing ON i.ingredient_id = ing.id 
            ORDER BY ing.name`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventory', (req, res) => {
    const { ingredient_id, current_stock, min_stock, max_stock, name, unit } = req.body;
    
    if (ingredient_id) {
        db.run('INSERT OR REPLACE INTO inventory (ingredient_id, current_stock, min_stock, max_stock) VALUES (?, ?, ?, ?)',
            [ingredient_id, current_stock, min_stock, max_stock],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true });
            });
    } else if (name && unit) {
        db.run('INSERT INTO ingredients (name, cost, unit) VALUES (?, ?, ?)',
            [name, 0, unit],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                const ingredientId = this.lastID;
                db.run('INSERT INTO inventory (ingredient_id, current_stock, min_stock, max_stock) VALUES (?, ?, ?, ?)',
                    [ingredientId, current_stock, min_stock, max_stock],
                    (err) => {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ success: true });
                    });
            });
    }
});

app.put('/api/inventory/:id', (req, res) => {
    const { current_stock, min_stock, max_stock } = req.body;
    db.run('UPDATE inventory SET current_stock = ?, min_stock = ?, max_stock = ? WHERE ingredient_id = ?',
        [current_stock, min_stock, max_stock, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/inventory/:id', (req, res) => {
    db.run('DELETE FROM inventory WHERE ingredient_id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/suppliers', (req, res) => {
    db.all('SELECT * FROM suppliers ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/suppliers', (req, res) => {
    const { name, contact, phone, email, address, category, description } = req.body;
    db.run('INSERT INTO suppliers (name, contact, phone, email, address, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, contact, phone, email, address, category || 'Food', description],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/suppliers/:id', (req, res) => {
    const { name, contact, phone, email, address, category, description } = req.body;
    db.run('UPDATE suppliers SET name = ?, contact = ?, phone = ?, email = ?, address = ?, category = ?, description = ? WHERE id = ?',
        [name, contact, phone, email, address, category || 'Food', description, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/suppliers/:id', (req, res) => {
    db.run('DELETE FROM suppliers WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// Employee API endpoints
app.get('/api/employees', (req, res) => {
    db.all('SELECT * FROM employees ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/employees', (req, res) => {
    const { name, role, username, email, phone, address, notes, permissions } = req.body;
    db.run('INSERT INTO employees (name, role, username, email, phone, address, notes, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, role, username, email, phone, address, notes, JSON.stringify(permissions)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/employees/:id', (req, res) => {
    const { name, role, username, email, phone, address, notes, status, permissions } = req.body;
    db.run('UPDATE employees SET name = ?, role = ?, username = ?, email = ?, phone = ?, address = ?, notes = ?, status = ?, permissions = ? WHERE id = ?',
        [name, role, username, email, phone, address, notes, status, JSON.stringify(permissions), req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/employees/:id', (req, res) => {
    db.run('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Events API endpoints
app.get('/api/events', (req, res) => {
    db.all('SELECT * FROM events ORDER BY date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/events', (req, res) => {
    const { name, type, location, date, end_date, time, fee, status, notes } = req.body;
    db.run('INSERT INTO events (name, type, location, date, end_date, time, fee, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, type, location, date, end_date, time, fee, status, notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/events/:id', (req, res) => {
    const { name, type, location, date, end_date, time, fee, status, notes, paid } = req.body;
    db.run('UPDATE events SET name = ?, type = ?, location = ?, date = ?, end_date = ?, time = ?, fee = ?, status = ?, notes = ?, paid = ? WHERE id = ?',
        [name, type, location, date, end_date, time, fee, status, notes, paid ? 1 : 0, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/events/:id', (req, res) => {
    db.run('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Catering API endpoints
app.get('/api/catering', (req, res) => {
    db.all('SELECT * FROM catering ORDER BY date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/catering', (req, res) => {
    const { client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes } = req.body;
    db.run('INSERT INTO catering (client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/catering/:id', (req, res) => {
    const { client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes } = req.body;
    db.run('UPDATE catering SET client = ?, date = ?, guests = ?, price = ?, status = ?, deposit = ?, setup_time = ?, selected_menu = ?, staff_assigned = ?, service_type = ?, staff_count = ?, staff_cost = ?, notes = ?, location = ?, event_start_time = ?, event_end_time = ?, equipment_provider = ?, equipment_cost = ?, equipment_notes = ?, payment_status = ?, personal_notes = ? WHERE id = ?',
        [client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/catering/:id', (req, res) => {
    db.run('DELETE FROM catering WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Reviews API endpoints
app.get('/api/reviews', (req, res) => {
    db.all('SELECT * FROM reviews ORDER BY review_date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/reviews', (req, res) => {
    const { platform, rating, reviewer_name, review_text, review_date, response_status, response_text } = req.body;
    db.run('INSERT INTO reviews (platform, rating, reviewer_name, review_text, review_date, response_status, response_text) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [platform, rating, reviewer_name, review_text, review_date, response_status, response_text],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/reviews/:id', (req, res) => {
    const { response_text, response_status } = req.body;
    db.run('UPDATE reviews SET response_text = ?, response_status = ? WHERE id = ?',
        [response_text, response_status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/reviews/:id', (req, res) => {
    db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Expenses API endpoints
app.get('/api/expenses', (req, res) => {
    db.all('SELECT * FROM expenses ORDER BY date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/expenses', (req, res) => {
    const { category, amount, description, date, payment } = req.body;
    db.run('INSERT INTO expenses (category, amount, description, date, payment) VALUES (?, ?, ?, ?, ?)',
        [category, amount, description, date, payment],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/expenses/:id', (req, res) => {
    db.run('DELETE FROM expenses WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Tools API endpoints
app.get('/api/tools', (req, res) => {
    db.all('SELECT * FROM tools ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/tools', (req, res) => {
    const { name, category, status } = req.body;
    db.run('INSERT INTO tools (name, category, status) VALUES (?, ?, ?)',
        [name, category, status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/tools/:id', (req, res) => {
    db.run('DELETE FROM tools WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Users API endpoints
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, role, name, employee_id FROM users', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Login endpoint with password verification
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                // Don't send password back to client
                const { password, ...userWithoutPassword } = user;
                res.json({ success: true, user: userWithoutPassword });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (err) {
            res.status(500).json({ error: 'Error verifying password' });
        }
    });
});

// Create user with hashed password
app.post('/api/users', async (req, res) => {
    const { username, password, role, name, employee_id, permissions } = req.body;
    
    try {
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (username, password, role, name, employee_id, permissions) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, role, name, employee_id, JSON.stringify(permissions)],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID });
            });
    } catch (err) {
        res.status(500).json({ error: 'Error hashing password' });
    }
});

// Time punches API endpoints
app.get('/api/time-punches', (req, res) => {
    const query = `
        SELECT tp.*, e.name as employee_name 
        FROM time_punches tp 
        JOIN employees e ON tp.employee_id = e.id 
        ORDER BY tp.sign_in_time DESC
    `;
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/time-punches', (req, res) => {
    const { employee_id, sign_in_time, sign_out_time, total_hours, date } = req.body;
    db.run('INSERT INTO time_punches (employee_id, sign_in_time, sign_out_time, total_hours, date) VALUES (?, ?, ?, ?, ?)',
        [employee_id, sign_in_time, sign_out_time, total_hours, date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Recipes API endpoints
app.get('/api/recipes/:menuId', (req, res) => {
    db.get('SELECT * FROM recipes WHERE menu_id = ?', [req.params.menuId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row ? JSON.parse(row.ingredients) : []);
    });
});

app.post('/api/recipes', (req, res) => {
    const { menu_id, ingredients } = req.body;
    db.run('INSERT OR REPLACE INTO recipes (menu_id, ingredients) VALUES (?, ?)',
        [menu_id, JSON.stringify(ingredients)],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// Licenses API endpoints
app.get('/api/licenses', (req, res) => {
    db.all('SELECT * FROM licenses ORDER BY expiry_date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/licenses', (req, res) => {
    const { name, expiry_date, status } = req.body;
    db.run('INSERT INTO licenses (name, expiry_date, status) VALUES (?, ?, ?)',
        [name, expiry_date, status],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/licenses/:id', (req, res) => {
    const { name, expiry_date, status } = req.body;
    db.run('UPDATE licenses SET name = ?, expiry_date = ?, status = ? WHERE id = ?',
        [name, expiry_date, status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/licenses/:id', (req, res) => {
    db.run('DELETE FROM licenses WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Maintenance tasks API endpoints
app.get('/api/maintenance-tasks', (req, res) => {
    db.all('SELECT * FROM maintenance_tasks ORDER BY due_date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/maintenance-tasks', (req, res) => {
    const { task, due_date, status, notes } = req.body;
    db.run('INSERT INTO maintenance_tasks (task, due_date, status, notes) VALUES (?, ?, ?, ?)',
        [task, due_date, status, notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/maintenance-tasks/:id', (req, res) => {
    const { task, due_date, status, notes } = req.body;
    db.run('UPDATE maintenance_tasks SET task = ?, due_date = ?, status = ?, notes = ? WHERE id = ?',
        [task, due_date, status, notes, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/maintenance-tasks/:id', (req, res) => {
    db.run('DELETE FROM maintenance_tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Business info API endpoints
app.get('/api/business-info', (req, res) => {
    db.get('SELECT * FROM business_info WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

app.post('/api/business-info', (req, res) => {
    const { name, phone, email, address, website, facebook, instagram, default_margin } = req.body;
    db.run('INSERT OR REPLACE INTO business_info (id, name, phone, email, address, website, facebook, instagram, default_margin) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, phone, email, address, website, facebook, instagram, default_margin],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// Settings API endpoints
app.get('/api/settings', (req, res) => {
    db.all('SELECT * FROM settings', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    });
});

app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.post('/api/settings/bulk', (req, res) => {
    const settings = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    db.serialize(() => {
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, value);
        }
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

// Files API endpoints
app.get('/api/files', (req, res) => {
    db.all('SELECT * FROM files ORDER BY upload_date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/files', (req, res) => {
    const { name, path, size, type, category, upload_date } = req.body;
    db.run('INSERT INTO files (name, path, size, type, category, upload_date) VALUES (?, ?, ?, ?, ?, ?)',
        [name, path, size, type, category, upload_date],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/files/:id', (req, res) => {
    const { category } = req.body;
    db.run('UPDATE files SET category = ? WHERE id = ?',
        [category, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/files/:id', (req, res) => {
    db.run('DELETE FROM files WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Try HTTPS first, fallback to HTTP
try {
    const httpsOptions = {
        key: fs.readFileSync(path.join(__dirname, 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
    };
    
    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`🔒 HTTPS server running on https://localhost:${PORT}`);
        console.log('✅ PDF downloads will be secure (no browser warning)');
        console.log('⚠️  Browser will show certificate warning on first visit - click "Advanced" → "Proceed"');
    });
} catch (err) {
    app.listen(PORT, () => {
        console.log(`⚠️  HTTP server running on http://localhost:${PORT}`);
        console.log('⚠️  PDF downloads will show browser security warning');
        console.log('💡 To fix: Run "openssl req -nodes -new -x509 -keyout server.key -out server.cert -days 365" and restart');
    });
}