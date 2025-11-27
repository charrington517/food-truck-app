const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('foodtruck.db');

db.serialize(() => {
    db.run("INSERT INTO events (name, type, location, date, time, fee, status, notes) VALUES ('Downtown Food Festival', 'Festival', 'Main Street', '2025-01-22', '10am-6pm', 150.00, 'Applied', 'Popular festival with good foot traffic')");
    db.run("INSERT INTO events (name, type, location, date, time, fee, status, notes) VALUES ('Farmers Market', 'Farmers Market', 'City Park', '2025-01-26', '8am-2pm', 75.00, 'Accepted', 'Weekly market, regular customers')");
});

db.close();
console.log('Events added');