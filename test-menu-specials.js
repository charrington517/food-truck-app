const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH || 'foodtruck.db');

console.log('Testing menu_specials table...\n');

// Test 1: Check if table exists
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_specials'", (err, row) => {
    if (err) {
        console.error('❌ Error checking table:', err);
        return;
    }
    if (row) {
        console.log('✅ Table exists');
    } else {
        console.log('❌ Table does not exist');
        return;
    }
    
    // Test 2: Check table schema
    db.all("PRAGMA table_info(menu_specials)", (err, columns) => {
        if (err) {
            console.error('❌ Error getting schema:', err);
            return;
        }
        console.log('\n📋 Table Schema:');
        columns.forEach(col => {
            console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
        });
        
        // Test 3: Try inserting a test record
        console.log('\n🧪 Testing insert...');
        const testData = {
            name: 'Test Tuesday Special',
            description: 'Test description',
            price: 9.99,
            start_date: null,
            end_date: null,
            days_of_week: '[2]',
            status: 'active',
            category: 'weekly'
        };
        
        db.run(
            'INSERT INTO menu_specials (name, description, price, start_date, end_date, days_of_week, status, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [testData.name, testData.description, testData.price, testData.start_date, testData.end_date, testData.days_of_week, testData.status, testData.category],
            function(err) {
                if (err) {
                    console.error('❌ Insert failed:', err.message);
                    db.close();
                    return;
                }
                console.log('✅ Insert successful! ID:', this.lastID);
                
                // Test 4: Read it back
                db.get('SELECT * FROM menu_specials WHERE id = ?', [this.lastID], (err, row) => {
                    if (err) {
                        console.error('❌ Read failed:', err);
                    } else {
                        console.log('\n📖 Retrieved record:');
                        console.log(JSON.stringify(row, null, 2));
                    }
                    
                    // Clean up test record
                    db.run('DELETE FROM menu_specials WHERE id = ?', [this.lastID], (err) => {
                        if (err) {
                            console.error('❌ Cleanup failed:', err);
                        } else {
                            console.log('\n🧹 Test record cleaned up');
                        }
                        
                        // Test 5: Check all existing records
                        db.all('SELECT * FROM menu_specials', (err, rows) => {
                            if (err) {
                                console.error('❌ Error reading all records:', err);
                            } else {
                                console.log(`\n📊 Total records in table: ${rows.length}`);
                                if (rows.length > 0) {
                                    console.log('Existing records:');
                                    rows.forEach(r => console.log(`  - ${r.name} (${r.category})`));
                                }
                            }
                            
                            console.log('\n✅ All tests complete!');
                            db.close();
                        });
                    });
                });
            }
        );
    });
});
