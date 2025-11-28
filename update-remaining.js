const fs = require('fs');

let html = fs.readFileSync('./public/index.html', 'utf8');

// Replace all remaining localStorage.getItem for categories
html = html.replace(/JSON\.parse\(localStorage\.getItem\('menuCategories'\)[^)]+\)/g, "await getMenuCategories()");
html = html.replace(/JSON\.parse\(localStorage\.getItem\('supplierCategories'\)[^)]+\)/g, "await getSupplierCategories()");
html = html.replace(/JSON\.parse\(localStorage\.getItem\('measurementUnits'\)[^)]+\)/g, "await getMeasurementUnits()");
html = html.replace(/JSON\.parse\(localStorage\.getItem\('eventStatuses'\)[^)]+\)/g, "await getEventStatuses()");
html = html.replace(/JSON\.parse\(localStorage\.getItem\('fileCategories'\)[^)]+\)/g, "await getFileCategories()");
html = html.replace(/JSON\.parse\(localStorage\.getItem\('employeeRoles'\)[^)]+\)/g, "await getEmployeeRoles()");

// Replace localStorage.setItem for categories
html = html.replace(/localStorage\.setItem\('menuCategories', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('menuCategories', JSON.stringify($1))");
html = html.replace(/localStorage\.setItem\('supplierCategories', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('supplierCategories', JSON.stringify($1))");
html = html.replace(/localStorage\.setItem\('measurementUnits', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('measurementUnits', JSON.stringify($1))");
html = html.replace(/localStorage\.setItem\('eventStatuses', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('eventStatuses', JSON.stringify($1))");
html = html.replace(/localStorage\.setItem\('fileCategories', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('fileCategories', JSON.stringify($1))");
html = html.replace(/localStorage\.setItem\('employeeRoles', JSON\.stringify\(([^)]+)\)\)/g, "await saveSetting('employeeRoles', JSON.stringify($1))");

// Make all category functions async
const functionsToMakeAsync = [
    'addSupplierCategory',
    'addMeasurementUnit',
    'addEventStatus',
    'addFileCategory',
    'addEmployeeRole',
    'loadMenuCategories',
    'loadSupplierCategories',
    'loadMeasurementUnits',
    'loadEventStatuses',
    'loadFileCategories',
    'loadEmployeeRoles',
    'deleteMenuCategory',
    'deleteSupplierCategory',
    'deleteMeasurementUnit',
    'deleteEventStatus',
    'deleteFileCategory',
    'deleteEmployeeRole'
];

functionsToMakeAsync.forEach(funcName => {
    const regex = new RegExp(`function ${funcName}\\(`, 'g');
    html = html.replace(regex, `async function ${funcName}(`);
});

// Update openAddModal to be async and await category calls
html = html.replace(/function openAddModal\(\) \{/, 'async function openAddModal() {');

fs.writeFileSync('./public/index.html', html, 'utf8');

console.log('Remaining localStorage references updated!');
console.log('- Updated category getters');
console.log('- Updated category setters');
console.log('- Made category functions async');
