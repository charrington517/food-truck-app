const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('foodtruck.db');

db.serialize(() => {
    db.run(
        "INSERT INTO events (name, type, location, date, time, fee, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ['Downtown Food Festival', 'Festival', 'Main Street', '2025-01-22', '10am-6pm', 150.00, 'Applied', 'Popular festival with good foot traffic'],
        function(err) {
            if (err) {
                console.error('Error inserting event 1:', err.message);
            } else {
                console.log('Event 1 added successfully');
            }
        }
    );
    
    db.run(
        "INSERT INTO events (name, type, location, date, time, fee, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        ['Farmers Market', 'Farmers Market', 'City Park', '2025-01-26', '8am-2pm', 75.00, 'Accepted', 'Weekly market, regular customers'],
        function(err) {
            if (err) {
                console.error('Error inserting event 2:', err.message);
            } else {
                console.log('Event 2 added successfully');
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