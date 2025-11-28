const sqlite3 = require('sqlite3').verbose();
// Database path from environment variable (not a credential - SQLite uses file-based storage)
const dbPath = process.env.DB_PATH || 'foodtruck.db';
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(
        "INSERT INTO catering (client, date, guests, price, status, deposit, setup_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ['ABC Corp', '2025-01-20', 50, 2500.00, 'Booked', 500.00, '2', 'Corporate lunch event'],
        function(err) {
            if (err) {
                console.error('Error inserting catering 1:', err.message);
            } else {
                console.log('Catering 1 added successfully');
            }
        }
    );
    
    db.run(
        "INSERT INTO catering (client, date, guests, price, status, deposit, setup_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ['Johnson Wedding', '2025-01-25', 120, 4800.00, 'Quote Sent', 0, '3', 'Outdoor wedding reception'],
        function(err) {
            if (err) {
                console.error('Error inserting catering 2:', err.message);
            } else {
                console.log('Catering 2 added successfully');
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    } else {
                        console.log('Database closed successfully');
                    }
                });
            }
        }
    );
});