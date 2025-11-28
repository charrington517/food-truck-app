const fs = require('fs');

// WARNING: This is a ONE-TIME migration script that has already been run.
// Running it again will break the application by injecting duplicate await keywords.
// If you need to re-run migrations, restore from backup first:
//   cp public/index.html.backup public/index.html

console.error('⚠️  WARNING: This migration script has already been executed.');
console.error('⚠️  Running it again will break the application.');
console.error('⚠️  If you need to re-migrate, first restore the backup:');
console.error('⚠️    cp public/index.html.backup public/index.html');
console.error('');
console.error('Exiting to prevent damage...');
process.exit(1);

// ORIGINAL CODE BELOW - DO NOT EXECUTE
// This code is preserved for reference only

/*
let html;
try {
    html = fs.readFileSync('./public/index.html', 'utf8');
} catch (err) {
    console.error('Error reading index.html:', err.message);
    process.exit(1);
}

// Note: Keep currentUser and users in localStorage for authentication/session management
// These are security-sensitive and should not be in the database in this way

// Update tools to use database (via API)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('tools'\) \|\| '\[\]'\)/g, "await fetch('/api/tools').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('tools', JSON\.stringify\(tools\)\)/g, "/* tools now saved via API */");

// Update uploadedFiles to use database
html = html.replace(/JSON\.parse\(localStorage\.getItem\('uploadedFiles'\) \|\| '\[\]'\)/g, "await getFiles()");
html = html.replace(/localStorage\.setItem\('uploadedFiles', JSON\.stringify\(uploadedFiles\)\)/g, "/* files now saved via API */");
html = html.replace(/localStorage\.setItem\('uploadedFiles', JSON\.stringify\(files\)\)/g, "/* files now saved via API */");
html = html.replace(/localStorage\.setItem\('uploadedFiles', JSON\.stringify\(filteredFiles\)\)/g, "/* files now saved via API */");
html = html.replace(/localStorage\.setItem\('uploadedFiles', JSON\.stringify\(filtered\)\)/g, "/* files now saved via API */");

// Update licenses and maintenance tasks (these were already migrated)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('licenses'\) \|\| '\[\]'\)/g, "await getLicenses()");
html = html.replace(/localStorage\.setItem\('licenses', JSON\.stringify\(licenses\)\)/g, "/* licenses now saved via API */");
html = html.replace(/localStorage\.setItem\('licenses', JSON\.stringify\(filtered\)\)/g, "/* licenses now saved via API */");

html = html.replace(/JSON\.parse\(localStorage\.getItem\('maintenanceTasks'\) \|\| '\[\]'\)/g, "await getMaintenanceTasks()");
html = html.replace(/localStorage\.setItem\('maintenanceTasks', JSON\.stringify\(tasks\)\)/g, "/* maintenance tasks now saved via API */");
html = html.replace(/localStorage\.setItem\('maintenanceTasks', JSON\.stringify\(filtered\)\)/g, "/* maintenance tasks now saved via API */");

// Update catering localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('catering'\) \|\| '\[\]'\)/g, "await fetch('/api/catering').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('catering', JSON\.stringify\(filtered\)\)/g, "/* catering now in database */");

// Update events localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('events'\) \|\| '\[\]'\)/g, "await fetch('/api/events').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('events', JSON\.stringify\(events\)\)/g, "/* events now in database */");
html = html.replace(/localStorage\.setItem\('events', JSON\.stringify\(filtered\)\)/g, "/* events now in database */");

// Update reviews localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('reviews'\) \|\| '\[\]'\)/g, "await fetch('/api/reviews').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('reviews', JSON\.stringify\(reviews\)\)/g, "/* reviews now in database */");
html = html.replace(/localStorage\.setItem\('reviews', JSON\.stringify\(filtered\)\)/g, "/* reviews now in database */");

// Update expenses localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('expenses'\) \|\| '\[\]'\)/g, "await fetch('/api/expenses').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('expenses', JSON\.stringify\(expenses\)\)/g, "/* expenses now in database */");
html = html.replace(/localStorage\.setItem\('expenses', JSON\.stringify\(filtered\)\)/g, "/* expenses now in database */");

// Update employees localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('employees'\) \|\| '\[\]'\)/g, "await fetch('/api/employees').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('employees', JSON\.stringify\(employees\)\)/g, "/* employees now in database */");
html = html.replace(/localStorage\.setItem\('employees', JSON\.stringify\(filtered\)\)/g, "/* employees now in database */");

// Update timePunches localStorage (should already be in database)
html = html.replace(/JSON\.parse\(localStorage\.getItem\('timePunches'\) \|\| '\[\]'\)/g, "await fetch('/api/time-punches').then(r => r.json())");
html = html.replace(/localStorage\.setItem\('timePunches', JSON\.stringify\(punches\)\)/g, "/* time punches now in database */");

// Make functions that use these async
const asyncFunctions = [
    'addTool',
    'loadTools',
    'deleteTool',
    'uploadFile',
    'uploadFileFromSection',
    'loadFiles',
    'displayFiles',
    'editFile',
    'updateFile',
    'deleteFile',
    'addLicense',
    'loadLicenses',
    'editLicense',
    'updateLicense',
    'deleteLicense',
    'addMaintenanceTask',
    'loadMaintenanceTasks',
    'editMaintenanceTask',
    'updateMaintenanceTask',
    'deleteMaintenanceTask',
    'exportData',
    'clearData'
];

asyncFunctions.forEach(funcName => {
    const regex = new RegExp(`(\\s+)function ${funcName}\\(`, 'g');
    html = html.replace(regex, `$1async function ${funcName}(`);
});

try {
    fs.writeFileSync('./public/index.html', html, 'utf8');
} catch (err) {
    console.error('Error writing index.html:', err.message);
    console.error('File may be corrupted. Restore from backup if needed.');
    process.exit(1);
}

console.log('Final localStorage updates complete!');
console.log('- Updated tools to use database');
console.log('- Updated files to use database');
console.log('- Updated licenses to use database');
console.log('- Updated maintenance tasks to use database');
console.log('- Updated catering, events, reviews, expenses to use database');
console.log('- Updated employees and time punches to use database');
console.log('- Made related functions async');
console.log('');
console.log('Note: currentUser and users remain in localStorage for session management');
*/
