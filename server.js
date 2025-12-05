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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});
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
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

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
    db.run(`ALTER TABLE ingredients ADD COLUMN servings INTEGER DEFAULT 1`, () => {});

    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_id INTEGER,
        name TEXT,
        unit TEXT,
        category TEXT DEFAULT 'Food',
        current_stock REAL NOT NULL,
        min_stock REAL NOT NULL,
        max_stock REAL NOT NULL,
        barcode TEXT,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
    )`);
    
    // Migrate old table structure to new one with id column
    db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='inventory'`, (err, row) => {
        if (row && !row.sql.includes('id INTEGER PRIMARY KEY')) {
            db.run(`ALTER TABLE inventory RENAME TO inventory_old`, () => {
                db.run(`CREATE TABLE inventory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ingredient_id INTEGER,
                    name TEXT,
                    unit TEXT,
                    category TEXT DEFAULT 'Food',
                    current_stock REAL NOT NULL,
                    min_stock REAL NOT NULL,
                    max_stock REAL NOT NULL,
                    barcode TEXT,
                    FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
                )`, () => {
                    db.run(`INSERT INTO inventory (ingredient_id, name, unit, category, current_stock, min_stock, max_stock, barcode)
                            SELECT ingredient_id, name, unit, category, current_stock, min_stock, max_stock, barcode FROM inventory_old`, () => {
                        db.run(`DROP TABLE inventory_old`);
                    });
                });
            });
        }
    });

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
    db.run(`ALTER TABLE suppliers ADD COLUMN address TEXT`, () => {});

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
    db.run(`ALTER TABLE catering ADD COLUMN contact_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });
    
    db.run(`ALTER TABLE events ADD COLUMN contact_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column')) console.error(err);
    });
    
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

    db.run(`CREATE TABLE IF NOT EXISTS recipes (
        type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        ingredients TEXT NOT NULL,
        PRIMARY KEY (type, item_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS shift_swaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id INTEGER NOT NULL,
        requester_name TEXT NOT NULL,
        shift_date TEXT NOT NULL,
        shift_time TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        responder_id INTEGER,
        responder_name TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (requester_id) REFERENCES employees (id)
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
    
    // Contacts table
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT,
        category TEXT DEFAULT 'General',
        phone TEXT,
        email TEXT,
        address TEXT,
        notes TEXT,
        tags TEXT
    )`);
    
    // Archived tables
    db.run(`CREATE TABLE IF NOT EXISTS archived_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_id INTEGER,
        name TEXT NOT NULL,
        type TEXT,
        location TEXT,
        date TEXT,
        end_date TEXT,
        time TEXT,
        fee REAL DEFAULT 0,
        status TEXT DEFAULT 'Interested',
        notes TEXT,
        paid INTEGER DEFAULT 0,
        contact_id INTEGER,
        archived_date TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS archived_catering (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_id INTEGER,
        contact_id INTEGER,
        client TEXT NOT NULL,
        date TEXT NOT NULL,
        guests INTEGER,
        price REAL,
        status TEXT DEFAULT 'Inquiry',
        deposit REAL DEFAULT 0,
        setup_time TEXT,
        selected_menu TEXT,
        staff_assigned TEXT,
        service_type TEXT DEFAULT 'Delivery',
        staff_count INTEGER DEFAULT 0,
        staff_cost REAL DEFAULT 0,
        location TEXT,
        event_start_time TEXT,
        event_end_time TEXT,
        equipment_provider TEXT DEFAULT 'Birria Fusion',
        equipment_cost REAL DEFAULT 0,
        equipment_notes TEXT,
        payment_status TEXT DEFAULT 'Deposit Needed',
        personal_notes TEXT,
        notes TEXT,
        archived_date TEXT
    )`);
    
    // Notes/Comments table
    db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type TEXT NOT NULL,
        item_id INTEGER NOT NULL,
        note_text TEXT NOT NULL,
        created_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT
    )`);
    
    // Schedules table
    db.run(`CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        event_id INTEGER,
        shift_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        hours REAL,
        notes TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (event_id) REFERENCES events (id)
    )`);
    
    // Availability table
    db.run(`CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        day_of_week INTEGER NOT NULL,
        available INTEGER DEFAULT 1,
        start_time TEXT,
        end_time TEXT,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
    )`);
    
    // Inventory history table
    db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inventory_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        change_amount REAL NOT NULL,
        previous_stock REAL NOT NULL,
        new_stock REAL NOT NULL,
        change_type TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (inventory_id) REFERENCES inventory (id)
    )`);
    
    // Waste log table
    db.run(`CREATE TABLE IF NOT EXISTS waste_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inventory_id INTEGER,
        item_name TEXT NOT NULL,
        amount REAL NOT NULL,
        unit TEXT,
        reason TEXT NOT NULL,
        cost REAL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (inventory_id) REFERENCES inventory (id)
    )`);
    
    // Menu specials table
    db.run(`CREATE TABLE IF NOT EXISTS menu_specials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        start_date TEXT,
        end_date TEXT,
        days_of_week TEXT,
        status TEXT DEFAULT 'active',
        category TEXT DEFAULT 'seasonal'
    )`);
    
    // Insert sample contacts
    db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
        if (!err && row.count === 0) {
            const samples = [
                ['Sarah Johnson', 'ABC Corporation', 'Catering Client', '555-0101', 'sarah@abccorp.com', '123 Business St', 'Prefers vegetarian options', 'preferred,corporate'],
                ['Mike Chen', 'Downtown Events LLC', 'Event Organizer', '555-0102', 'mike@downtownevents.com', '456 Event Ave', 'Organizes summer festivals', 'festivals,preferred'],
                ['Party Rentals Plus', '', 'Vendor', '555-0103', 'info@partyrentals.com', '789 Supply Rd', 'Tables, chairs, tents', 'equipment,rental'],
                ['Lisa Martinez', 'City Parks Dept', 'Event Organizer', '555-0104', 'lmartinez@cityparks.gov', '321 City Hall', 'Manages farmers markets', 'government,markets']
            ];
            samples.forEach(s => {
                db.run('INSERT INTO contacts (name, company, category, phone, email, address, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', s);
            });
        }
    });
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
    db.all(`SELECT ing.* 
            FROM ingredients ing
            INNER JOIN inventory inv ON ing.id = inv.ingredient_id
            WHERE inv.category = 'Food'
            ORDER BY ing.name`, (err, rows) => {
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
    db.all(`SELECT i.*, 
            COALESCE(i.name, ing.name) as name, 
            COALESCE(i.unit, ing.unit) as unit
            FROM inventory i 
            LEFT JOIN ingredients ing ON i.ingredient_id = ing.id 
            ORDER BY name`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/inventory', (req, res) => {
    const { ingredient_id, current_stock, min_stock, max_stock, name, unit, barcode, category } = req.body;
    
    if (ingredient_id) {
        db.run('INSERT INTO inventory (ingredient_id, category, current_stock, min_stock, max_stock, barcode) VALUES (?, ?, ?, ?, ?, ?)',
            [ingredient_id, category || 'Food', current_stock, min_stock, max_stock, barcode],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID });
            });
    } else {
        db.run('INSERT INTO inventory (name, unit, category, current_stock, min_stock, max_stock, barcode) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, unit, category || 'Other', current_stock, min_stock, max_stock, barcode],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID });
            });
    }
});

app.put('/api/inventory/:id', (req, res) => {
    const { ingredient_id, name, unit, current_stock, min_stock, max_stock, barcode, category, change_type, notes } = req.body;
    
    db.get('SELECT * FROM inventory WHERE id = ?', [req.params.id], (err, oldItem) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let sql = 'UPDATE inventory SET current_stock = ?, min_stock = ?, max_stock = ?, barcode = ?, category = ?';
        let params = [current_stock, min_stock, max_stock, barcode, category];
        
        if (ingredient_id !== undefined) {
            sql += ', ingredient_id = ?';
            params.push(ingredient_id);
        }
        if (name !== undefined) {
            sql += ', name = ?';
            params.push(name);
        }
        if (unit !== undefined) {
            sql += ', unit = ?';
            params.push(unit);
        }
        
        sql += ' WHERE id = ?';
        params.push(req.params.id);
        
        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            if (oldItem && oldItem.current_stock !== current_stock) {
                const change = current_stock - oldItem.current_stock;
                db.run('INSERT INTO inventory_history (inventory_id, item_name, change_amount, previous_stock, new_stock, change_type, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [req.params.id, oldItem.name || name, change, oldItem.current_stock, current_stock, change_type || 'adjustment', notes || '', new Date().toISOString()]
                );
            }
            
            res.json({ success: true });
        });
    });
});

app.delete('/api/inventory/:id', (req, res) => {
    db.run('DELETE FROM inventory WHERE id = ?', [req.params.id], (err) => {
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

app.get('/api/events/:id', (req, res) => {
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
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

app.get('/api/catering/:id', (req, res) => {
    db.get('SELECT * FROM catering WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.post('/api/catering', (req, res) => {
    const { contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes } = req.body;
    db.run('INSERT INTO catering (contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/catering/:id', (req, res) => {
    const { contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes } = req.body;
    db.run('UPDATE catering SET contact_id = ?, client = ?, date = ?, guests = ?, price = ?, status = ?, deposit = ?, setup_time = ?, selected_menu = ?, staff_assigned = ?, service_type = ?, staff_count = ?, staff_cost = ?, notes = ?, location = ?, event_start_time = ?, event_end_time = ?, equipment_provider = ?, equipment_cost = ?, equipment_notes = ?, payment_status = ?, personal_notes = ? WHERE id = ?',
        [contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, notes, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes, req.params.id],
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

// Contacts API endpoints
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/contacts/:id', (req, res) => {
    db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.post('/api/contacts', (req, res) => {
    const { name, company, category, phone, email, address, notes, tags } = req.body;
    db.run('INSERT INTO contacts (name, company, category, phone, email, address, notes, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, company, category, phone, email, address, notes, tags],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/contacts/:id', (req, res) => {
    const { name, company, category, phone, email, address, notes, tags } = req.body;
    db.run('UPDATE contacts SET name = ?, company = ?, category = ?, phone = ?, email = ?, address = ?, notes = ?, tags = ? WHERE id = ?',
        [name, company, category, phone, email, address, notes, tags, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/contacts/:id', (req, res) => {
    db.run('DELETE FROM contacts WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/contacts/:id/history', (req, res) => {
    const contactId = req.params.id;
    db.all('SELECT * FROM catering WHERE contact_id = ? ORDER BY date DESC', [contactId], (err, catering) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT * FROM events WHERE contact_id = ? ORDER BY date DESC', [contactId], (err2, events) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ catering, events });
        });
    });
});

// Maintenance tasks API endpoints
app.get('/api/maintenance', (req, res) => {
    db.all('SELECT id, task, due_date as date, status, notes FROM maintenance_tasks ORDER BY due_date', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/maintenance/:id', (req, res) => {
    db.get('SELECT id, task, due_date as date, status, notes FROM maintenance_tasks WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/maintenance/:id', (req, res) => {
    const { task, date, status, notes } = req.body;
    db.run('UPDATE maintenance_tasks SET task = ?, due_date = ?, status = ?, notes = ? WHERE id = ?',
        [task, date, status, notes, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

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

// Schedules API endpoints
app.get('/api/schedules', (req, res) => {
    const query = `
        SELECT s.*, e.name as employee_name, ev.name as event_name
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        LEFT JOIN events ev ON s.event_id = ev.id
        ORDER BY s.shift_date, s.start_time
    `;
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/schedules', (req, res) => {
    const { employee_id, event_id, shift_date, start_time, end_time, hours, notes } = req.body;
    db.run('INSERT INTO schedules (employee_id, event_id, shift_date, start_time, end_time, hours, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [employee_id, event_id, shift_date, start_time, end_time, hours, notes],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/schedules/:id', (req, res) => {
    db.run('DELETE FROM schedules WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Availability endpoints
app.get('/api/availability/:employeeId', (req, res) => {
    db.all('SELECT * FROM availability WHERE employee_id = ?', [req.params.employeeId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/availability', (req, res) => {
    const { employee_id, day_of_week, available, start_time, end_time } = req.body;
    db.run('DELETE FROM availability WHERE employee_id = ? AND day_of_week = ?', [employee_id, day_of_week], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (available) {
            db.run('INSERT INTO availability (employee_id, day_of_week, available, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                [employee_id, day_of_week, 1, start_time, end_time],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: this.lastID });
                });
        } else {
            res.json({ success: true });
        }
    });
});

// Availability endpoints
app.get('/api/availability/:employeeId', (req, res) => {
    db.all('SELECT * FROM availability WHERE employee_id = ?', [req.params.employeeId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/availability', (req, res) => {
    const { employee_id, day_of_week, available, start_time, end_time } = req.body;
    db.run('DELETE FROM availability WHERE employee_id = ? AND day_of_week = ?', [employee_id, day_of_week], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        if (available) {
            db.run('INSERT INTO availability (employee_id, day_of_week, available, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                [employee_id, day_of_week, 1, start_time, end_time],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: this.lastID });
                });
        } else {
            res.json({ success: true });
        }
    });
});

// Notes API endpoints
app.get('/api/notes/:itemType/:itemId', (req, res) => {
    db.all('SELECT * FROM notes WHERE item_type = ? AND item_id = ? ORDER BY created_at DESC',
        [req.params.itemType, req.params.itemId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

app.post('/api/notes', (req, res) => {
    const { item_type, item_id, note_text, created_by } = req.body;
    const created_at = new Date().toISOString();
    db.run('INSERT INTO notes (item_type, item_id, note_text, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [item_type, item_id, note_text, created_by, created_at],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, created_at });
        });
});

app.delete('/api/notes/:id', (req, res) => {
    db.run('DELETE FROM notes WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Backup endpoints
app.get('/api/backup/download', (req, res) => {
    const dbPath = path.join(__dirname, 'foodtruck.db');
    const filename = `backup-${new Date().toISOString().split('T')[0]}.db`;
    res.download(dbPath, filename);
});

app.post('/api/backup/restore', upload.single('backup'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No backup file uploaded' });
    }
    
    const backupPath = req.file.path;
    const dbPath = path.join(__dirname, 'foodtruck.db');
    
    // Close database connection
    db.close((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to close database' });
        }
        
        // Replace database file
        fs.copyFile(backupPath, dbPath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to restore backup' });
            }
            
            // Clean up uploaded file
            fs.unlink(backupPath, () => {});
            
            // Restart will reconnect to database
            res.json({ success: true });
            
            // Exit process to force restart (if using process manager)
            setTimeout(() => process.exit(0), 1000);
        });
    });
});

// Archive endpoints
app.post('/api/events/:id/archive', (req, res) => {
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, event) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        
        db.run('INSERT INTO archived_events (original_id, name, type, location, date, end_date, time, fee, status, notes, paid, contact_id, archived_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [event.id, event.name, event.type, event.location, event.date, event.end_date, event.time, event.fee, event.status, event.notes, event.paid, event.contact_id, new Date().toISOString()],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            });
    });
});

app.post('/api/catering/:id/archive', (req, res) => {
    db.get('SELECT * FROM catering WHERE id = ?', [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        db.run('INSERT INTO archived_catering (original_id, contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes, notes, archived_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order.id, order.contact_id, order.client, order.date, order.guests, order.price, order.status, order.deposit, order.setup_time, order.selected_menu, order.staff_assigned, order.service_type, order.staff_count, order.staff_cost, order.location, order.event_start_time, order.event_end_time, order.equipment_provider, order.equipment_cost, order.equipment_notes, order.payment_status, order.personal_notes, order.notes, new Date().toISOString()],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('DELETE FROM catering WHERE id = ?', [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            });
    });
});

app.get('/api/archived-events', (req, res) => {
    db.all('SELECT * FROM archived_events ORDER BY date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/archived-catering', (req, res) => {
    db.all('SELECT * FROM archived_catering ORDER BY date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/archived-events/:id/restore', (req, res) => {
    db.get('SELECT * FROM archived_events WHERE id = ?', [req.params.id], (err, event) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!event) return res.status(404).json({ error: 'Archived event not found' });
        
        db.run('INSERT INTO events (name, type, location, date, end_date, time, fee, status, notes, paid, contact_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [event.name, event.type, event.location, event.date, event.end_date, event.time, event.fee, event.status, event.notes, event.paid, event.contact_id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('DELETE FROM archived_events WHERE id = ?', [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            });
    });
});

app.post('/api/archived-catering/:id/restore', (req, res) => {
    db.get('SELECT * FROM archived_catering WHERE id = ?', [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Archived order not found' });
        
        db.run('INSERT INTO catering (contact_id, client, date, guests, price, status, deposit, setup_time, selected_menu, staff_assigned, service_type, staff_count, staff_cost, location, event_start_time, event_end_time, equipment_provider, equipment_cost, equipment_notes, payment_status, personal_notes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order.contact_id, order.client, order.date, order.guests, order.price, order.status, order.deposit, order.setup_time, order.selected_menu, order.staff_assigned, order.service_type, order.staff_count, order.staff_cost, order.location, order.event_start_time, order.event_end_time, order.equipment_provider, order.equipment_cost, order.equipment_notes, order.payment_status, order.personal_notes, order.notes],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                db.run('DELETE FROM archived_catering WHERE id = ?', [req.params.id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true });
                });
            });
    });
});

// Inventory history and reporting endpoints
app.get('/api/inventory-history', (req, res) => {
    const { start_date, end_date } = req.query;
    let sql = 'SELECT * FROM inventory_history WHERE 1=1';
    const params = [];
    
    if (start_date) {
        sql += ' AND created_at >= ?';
        params.push(start_date);
    }
    if (end_date) {
        sql += ' AND created_at <= ?';
        params.push(end_date + 'T23:59:59');
    }
    
    sql += ' ORDER BY created_at DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/inventory-report', (req, res) => {
    const { start_date, end_date } = req.query;
    
    let sql = `
        SELECT 
            ih.item_name,
            SUM(CASE WHEN ih.change_amount < 0 THEN ABS(ih.change_amount) ELSE 0 END) as total_used,
            SUM(CASE WHEN ih.change_amount > 0 THEN ih.change_amount ELSE 0 END) as total_added,
            COUNT(*) as transaction_count,
            i.unit
        FROM inventory_history ih
        LEFT JOIN inventory i ON ih.inventory_id = i.id
        WHERE 1=1
    `;
    const params = [];
    
    if (start_date) {
        sql += ' AND ih.created_at >= ?';
        params.push(start_date);
    }
    if (end_date) {
        sql += ' AND ih.created_at <= ?';
        params.push(end_date + 'T23:59:59');
    }
    
    sql += ' GROUP BY ih.item_name, i.unit ORDER BY total_used DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Menu specials endpoints
app.get('/api/menu-specials', (req, res) => {
    db.all('SELECT * FROM menu_specials ORDER BY start_date DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/menu-specials', (req, res) => {
    const { name, description, price, start_date, end_date, days_of_week, status, category } = req.body;
    console.log('Creating menu special:', { name, description, price, start_date, end_date, days_of_week, status, category });
    db.run('INSERT INTO menu_specials (name, description, price, start_date, end_date, days_of_week, status, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, description, price, start_date || null, end_date || null, days_of_week, status || 'active', category || 'seasonal'],
        function(err) {
            if (err) {
                console.error('Error creating menu special:', err);
                return res.status(500).json({ error: err.message });
            }
            console.log('Menu special created with ID:', this.lastID);
            res.json({ id: this.lastID });
        });
});

app.put('/api/menu-specials/:id', (req, res) => {
    const { name, description, price, start_date, end_date, days_of_week, status, category } = req.body;
    db.run('UPDATE menu_specials SET name = ?, description = ?, price = ?, start_date = ?, end_date = ?, days_of_week = ?, status = ?, category = ? WHERE id = ?',
        [name, description, price, start_date, end_date, days_of_week, status, category, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/menu-specials/:id', (req, res) => {
    db.run('DELETE FROM menu_specials WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.get('/api/menu-specials/active', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date().getDay();
    db.all(`SELECT * FROM menu_specials WHERE status = 'active' AND start_date <= ? AND end_date >= ? AND (days_of_week IS NULL OR days_of_week LIKE ?)`,
        [today, today, `%${dayOfWeek}%`],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

// Waste log endpoints
app.get('/api/waste-log', (req, res) => {
    db.all('SELECT * FROM waste_log ORDER BY created_at DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/waste-log', (req, res) => {
    const { inventory_id, item_name, amount, unit, reason, cost } = req.body;
    const created_at = new Date().toISOString();
    
    db.get('SELECT * FROM inventory WHERE id = ?', [inventory_id], (err, item) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!item) return res.status(404).json({ error: 'Inventory item not found' });
        
        const newStock = item.current_stock - amount;
        
        db.run('INSERT INTO waste_log (inventory_id, item_name, amount, unit, reason, cost, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [inventory_id, item_name, amount, unit, reason, cost || 0, created_at],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                
                db.run('UPDATE inventory SET current_stock = ? WHERE id = ?', [newStock, inventory_id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    db.run('INSERT INTO inventory_history (inventory_id, item_name, change_amount, previous_stock, new_stock, change_type, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [inventory_id, item_name, -amount, item.current_stock, newStock, 'waste', `Waste: ${reason}`, created_at],
                        (err) => {
                            if (err) console.error('Failed to log inventory history:', err);
                            res.json({ id: this.lastID, new_stock: newStock });
                        });
                });
            });
    });
});

app.get('/api/waste-report', (req, res) => {
    const { start_date, end_date } = req.query;
    let sql = `
        SELECT 
            item_name,
            SUM(amount) as total_amount,
            unit,
            SUM(cost) as total_cost,
            COUNT(*) as waste_count,
            reason
        FROM waste_log
        WHERE 1=1
    `;
    const params = [];
    
    if (start_date) {
        sql += ' AND created_at >= ?';
        params.push(start_date);
    }
    if (end_date) {
        sql += ' AND created_at <= ?';
        params.push(end_date + 'T23:59:59');
    }
    
    sql += ' GROUP BY item_name, unit, reason ORDER BY total_cost DESC';
    
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Shift swap endpoints
app.get('/api/shift-swaps', (req, res) => {
    db.all('SELECT * FROM shift_swaps ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/shift-swaps', (req, res) => {
    const { requester_id, requester_name, shift_date, shift_time, reason } = req.body;
    const created_at = new Date().toISOString();
    db.run('INSERT INTO shift_swaps (requester_id, requester_name, shift_date, shift_time, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [requester_id, requester_name, shift_date, shift_time, reason, created_at],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/shift-swaps/:id', (req, res) => {
    const { status, responder_id, responder_name } = req.body;
    db.run('UPDATE shift_swaps SET status = ?, responder_id = ?, responder_name = ? WHERE id = ?',
        [status, responder_id, responder_name, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.delete('/api/shift-swaps/:id', (req, res) => {
    db.run('DELETE FROM shift_swaps WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Recipe endpoints
app.get('/api/recipes/:type/:id', (req, res) => {
    db.get('SELECT ingredients FROM recipes WHERE type = ? AND item_id = ?', [req.params.type, req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ ingredients: row ? row.ingredients : '[]' });
    });
});

app.post('/api/recipes/:type/:id', (req, res) => {
    const { ingredients } = req.body;
    db.run('INSERT OR REPLACE INTO recipes (type, item_id, ingredients) VALUES (?, ?, ?)', [req.params.type, req.params.id, ingredients], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/recipes/:type/:id', (req, res) => {
    db.run('DELETE FROM recipes WHERE type = ? AND item_id = ?', [req.params.type, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Settings sync endpoints
app.get('/api/settings/:key', (req, res) => {
    db.get('SELECT value FROM settings WHERE key = ?', [req.params.key], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ value: row ? row.value : null });
    });
});

app.post('/api/settings/:key', (req, res) => {
    const { value } = req.body;
    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [req.params.key, value], (err) => {
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

// Start HTTP server (accessible by IP)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ HTTP server running on http://0.0.0.0:${PORT}`);
    console.log('✅ Access via IP address or Cloudflare Tunnel');
});