const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('foodtruck.db');

db.serialize(() => {
    db.run("INSERT INTO catering (client, date, guests, price, status, deposit, setup_time, notes) VALUES ('ABC Corp', '2025-01-20', 50, 2500.00, 'Booked', 500.00, '2', 'Corporate lunch event')");
    db.run("INSERT INTO catering (client, date, guests, price, status, deposit, setup_time, notes) VALUES ('Johnson Wedding', '2025-01-25', 120, 4800.00, 'Quote Sent', 0, '3', 'Outdoor wedding reception')");
});

db.close();
console.log('Catering events added');