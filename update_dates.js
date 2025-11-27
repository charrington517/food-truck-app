const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./food_truck.db');

// Update events with future dates
db.run(`UPDATE events SET date = '2025-12-05' WHERE id = 1`);
db.run(`UPDATE events SET date = '2025-12-10' WHERE id = 2`);

// Update catering with future dates  
db.run(`UPDATE catering SET date = '2025-12-03' WHERE id = 1`);
db.run(`UPDATE catering SET date = '2025-12-08' WHERE id = 2`);

console.log('Updated dates to future dates');
db.close();