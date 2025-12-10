const fs = require('fs');
const path = require('path');

const htmlPath = process.env.HTML_PATH || path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const categories = [
    {key: 'eventStatuses', defaults: '["Scheduled","Confirmed","Completed","Cancelled"]'},
    {key: 'fileCategories', defaults: '["Licenses","Permits","Insurance","Contracts","Invoices","Receipts","Other"]'},
    {key: 'employeeRoles', defaults: '["Manager","Chef","Cook","Server","Cashier","Driver"]'},
    {key: 'contactCategories', defaults: '["Client","Supplier","Vendor","Partner","Other"]'},
    {key: 'expenseCategories', defaults: '["Food","Supplies","Fuel","Maintenance","Permits","Insurance","Marketing","Other"]'}
];

categories.forEach(cat => {
    // Replace all localStorage.getItem calls
    const regex1 = new RegExp(`JSON\\.parse\\(localStorage\\.getItem\\('${cat.key}'\\)[^)]*\\)`, 'g');
    html = html.replace(regex1, `(await fetch('/api/settings/${cat.key}').then(r=>r.json()).then(d=>d.value?JSON.parse(d.value):JSON.parse('${cat.key}')))`);
    
    // Replace localStorage.setItem calls
    const regex2 = new RegExp(`localStorage\\.setItem\\('${cat.key}',\\s*JSON\\.stringify\\(([^)]+)\\)\\)`, 'g');
    html = html.replace(regex2, `fetch('/api/settings/${cat.key}', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify($1)})})`);
});

fs.writeFileSync(htmlPath, html);
console.log('Fixed all category localStorage references');
