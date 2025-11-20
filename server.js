const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Initialize SQLite database
const db = new sqlite3.Database('foodtruck.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    cost REAL NOT NULL,
    recipe_type TEXT DEFAULT 'Food',
    yield_servings INTEGER DEFAULT 1,
    portion_size REAL DEFAULT 1,
    prep_time_minutes INTEGER DEFAULT 0,
    labor_cost REAL DEFAULT 0,
    waste_factor REAL DEFAULT 0.05,
    total_cost REAL GENERATED ALWAYS AS (cost + labor_cost + (cost * waste_factor)) STORED,
    profit_margin REAL GENERATED ALWAYS AS ((price - (cost + labor_cost + (cost * waste_factor))) / price * 100) STORED
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    unit TEXT NOT NULL,
    allergens TEXT DEFAULT '',
    calories_per_unit REAL DEFAULT 0,
    protein_per_unit REAL DEFAULT 0,
    carbs_per_unit REAL DEFAULT 0,
    fat_per_unit REAL DEFAULT 0
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER,
    ingredient_id INTEGER,
    quantity REAL NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    email TEXT,
    category TEXT DEFAULT 'Other',
    description TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS ingredient_suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER,
    supplier_id INTEGER,
    cost REAL NOT NULL,
    unit TEXT NOT NULL,
    last_updated DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients (id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER,
    current_stock REAL DEFAULT 0,
    min_stock REAL DEFAULT 0,
    max_stock REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS menu_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER,
    category TEXT CHECK(category IN ('star', 'plow', 'puzzle', 'dog')),
    popularity_score REAL DEFAULT 0,
    profit_score REAL DEFAULT 0,
    last_calculated DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
  )`);
  
  // Insert sample data
  db.run(`INSERT OR IGNORE INTO menu_items (id, name, price, cost) VALUES 
    (1, 'Birria Tacos', 12.00, 4.50),
    (2, 'Quesabirria', 15.00, 6.00),
    (3, 'Consomé', 8.00, 2.50)`);
    
  db.run(`INSERT OR IGNORE INTO ingredients (id, name, cost, unit, allergens, calories_per_unit) VALUES 
    (1, 'Beef Chuck Roast', 8.99, 'lb', '', 1200),
    (2, 'Corn Tortillas', 3.50, 'pack', 'gluten', 150),
    (3, 'Oaxaca Cheese', 6.99, 'lb', 'dairy', 1600)`);
    
  db.run(`INSERT OR IGNORE INTO suppliers (id, name, contact, phone, email) VALUES 
    (1, 'Local Meat Market', 'Juan Rodriguez', '555-0123', 'juan@meatmarket.com'),
    (2, 'Fresh Produce Co', 'Maria Lopez', '555-0456', 'maria@freshproduce.com')`);
    
  db.run(`INSERT OR IGNORE INTO inventory (ingredient_id, current_stock, min_stock, max_stock) VALUES 
    (1, 50, 10, 100),
    (2, 20, 5, 50),
    (3, 15, 3, 30)`);
    
  // Add new columns to existing suppliers table if they don't exist
  db.run(`ALTER TABLE suppliers ADD COLUMN category TEXT DEFAULT 'Other'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Error adding category column:', err.message);
    }
  });
  
  db.run(`ALTER TABLE suppliers ADD COLUMN description TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('Error adding description column:', err.message);
    }
  });
});

// API Routes
app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, price, cost, recipe_type, portions } = req.body;
  db.run('INSERT INTO menu_items (name, price, cost, yield_servings) VALUES (?, ?, ?, ?)', 
    [name, price, cost, portions || 1], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, price, cost, recipe_type, portions });
  });
});

app.put('/api/menu/:id', (req, res) => {
  const { name, price, cost } = req.body;
  db.run('UPDATE menu_items SET name = ?, price = ?, cost = ? WHERE id = ?',
    [name, price, cost, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Updated successfully' });
  });
});

// Ingredients routes
app.get('/api/ingredients', (req, res) => {
  db.all('SELECT * FROM ingredients', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/ingredients', (req, res) => {
  const { name, cost, unit } = req.body;
  db.run('INSERT INTO ingredients (name, cost, unit) VALUES (?, ?, ?)', 
    [name, cost, unit], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, cost, unit });
  });
});

app.put('/api/ingredients/:id', (req, res) => {
  const { name, cost, unit } = req.body;
  db.run('UPDATE ingredients SET name = ?, cost = ?, unit = ? WHERE id = ?',
    [name, cost, unit, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Ingredient updated successfully' });
  });
});

// Suppliers routes
app.get('/api/suppliers', (req, res) => {
  db.all('SELECT * FROM suppliers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/suppliers', (req, res) => {
  const { name, contact, phone, email, category, description } = req.body;
  db.run('INSERT INTO suppliers (name, contact, phone, email, category, description) VALUES (?, ?, ?, ?, ?, ?)', 
    [name, contact, phone, email, category || 'Other', description || ''], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, contact, phone, email, category, description });
  });
});

app.put('/api/suppliers/:id', (req, res) => {
  const { name, contact, phone, email, category, description } = req.body;
  db.run('UPDATE suppliers SET name = ?, contact = ?, phone = ?, email = ?, category = ?, description = ? WHERE id = ?',
    [name, contact, phone, email, category || 'Other', description || '', req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Supplier updated successfully' });
  });
});

app.delete('/api/suppliers/:id', (req, res) => {
  db.run('DELETE FROM suppliers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Supplier deleted successfully' });
  });
});

// Recipe routes
app.get('/api/menu/:id/recipe', (req, res) => {
  db.all(`SELECT ri.*, i.name, i.cost, i.unit 
          FROM recipe_ingredients ri 
          JOIN ingredients i ON ri.ingredient_id = i.id 
          WHERE ri.menu_item_id = ?`, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/menu/:id/recipe', (req, res) => {
  const { ingredients } = req.body;
  
  // Delete existing recipe
  db.run('DELETE FROM recipe_ingredients WHERE menu_item_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Insert new recipe ingredients
    const stmt = db.prepare('INSERT INTO recipe_ingredients (menu_item_id, ingredient_id, quantity) VALUES (?, ?, ?)');
    ingredients.forEach(ing => {
      stmt.run([req.params.id, ing.ingredient_id, ing.quantity]);
    });
    stmt.finalize();
    
    res.json({ message: 'Recipe saved successfully' });
  });
});

// Inventory routes
app.get('/api/inventory', (req, res) => {
  db.all(`SELECT i.*, ing.name, ing.unit FROM inventory i 
          JOIN ingredients ing ON i.ingredient_id = ing.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/inventory/:id', (req, res) => {
  const { current_stock, min_stock, max_stock } = req.body;
  db.run('UPDATE inventory SET current_stock = ?, min_stock = ?, max_stock = ? WHERE ingredient_id = ?',
    [current_stock, min_stock, max_stock, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Inventory updated successfully' });
  });
});

// Analytics routes
app.get('/api/analytics/menu-engineering', (req, res) => {
  db.all(`SELECT m.*, 
          CASE 
            WHEN m.profit_margin >= 30 AND m.price >= 10 THEN 'star'
            WHEN m.profit_margin >= 30 AND m.price < 10 THEN 'plow'
            WHEN m.profit_margin < 30 AND m.price >= 10 THEN 'puzzle'
            ELSE 'dog'
          END as category
          FROM menu_items m`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/analytics/abc-analysis', (req, res) => {
  db.all(`SELECT i.*, 
          CASE 
            WHEN i.cost >= 5 THEN 'A'
            WHEN i.cost >= 2 THEN 'B'
            ELSE 'C'
          END as abc_category
          FROM ingredients i ORDER BY i.cost DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Shopping list generator
app.get('/api/shopping-list', (req, res) => {
  db.all(`SELECT i.name, i.unit, 
          (inv.min_stock - inv.current_stock) as needed_qty,
          s.name as supplier_name, s.phone
          FROM inventory inv
          JOIN ingredients i ON inv.ingredient_id = i.id
          LEFT JOIN ingredient_suppliers isp ON i.id = isp.ingredient_id
          LEFT JOIN suppliers s ON isp.supplier_id = s.id
          WHERE inv.current_stock < inv.min_stock`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Batch calculator
app.post('/api/batch-calculator', (req, res) => {
  const { menu_item_id, target_servings } = req.body;
  
  db.get('SELECT yield_servings FROM menu_items WHERE id = ?', [menu_item_id], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const multiplier = target_servings / item.yield_servings;
    
    db.all(`SELECT ri.*, i.name, i.unit, (ri.quantity * ?) as scaled_quantity
            FROM recipe_ingredients ri
            JOIN ingredients i ON ri.ingredient_id = i.id
            WHERE ri.menu_item_id = ?`, [multiplier, menu_item_id], (err, ingredients) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ multiplier, ingredients });
    });
  });
});

// File management routes
app.post('/api/upload-files', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const uploadedFiles = req.files.map(file => ({
    name: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadDate: new Date().toISOString()
  }));
  
  res.json({ 
    message: `${uploadedFiles.length} file(s) uploaded successfully`,
    files: uploadedFiles 
  });
});

app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, 'public/uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return res.json([]);
  }
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const fileList = files.map(filename => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        name: filename,
        size: stats.size,
        uploadDate: stats.birthtime
      };
    });
    
    res.json(fileList);
  });
});

app.post('/api/set-logo', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const { filename } = req.body;
  
  const sourcePath = path.join(__dirname, 'public/uploads', filename);
  const destPath = path.join(__dirname, 'public', 'logo.png');
  
  fs.copyFile(sourcePath, destPath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Logo updated successfully' });
  });
});

app.delete('/api/files/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filename = req.params.filename;
  
  const filePath = path.join(__dirname, 'public/uploads', filename);
  
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'File deleted successfully' });
  });
});

// Get file content for analysis
app.get('/api/file-content/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filename = req.params.filename;
  
  const filePath = path.join(__dirname, 'public/uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  res.sendFile(filePath);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Food Truck App running on http://localhost:${PORT}`);
});