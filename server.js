const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

app.listen(PORT, () => {
    console.log(`Food truck app running on http://localhost:${PORT}`);
});