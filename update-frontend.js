const fs = require('fs');

// Read the index.html file
let html = fs.readFileSync('./public/index.html', 'utf8');

// Add the db-helpers script reference after the opening <script> tag
const scriptTag = '<script>';
const scriptWithHelper = `<script src="/db-helpers.js"></script>\n    <script>`;
html = html.replace(scriptTag, scriptWithHelper);

// Replace localStorage.getItem calls for business info
html = html.replace(/localStorage\.getItem\('businessPhone'\)/g, "(await getBusinessPhone())");
html = html.replace(/localStorage\.getItem\('businessEmail'\)/g, "(await getBusinessEmail())");
html = html.replace(/localStorage\.getItem\('businessWebsite'\)/g, "(await getBusinessWebsite())");
html = html.replace(/localStorage\.getItem\('businessAddress'\)/g, "(await getBusinessInfo()).address");
html = html.replace(/localStorage\.getItem\('businessFacebook'\)/g, "(await getBusinessInfo()).facebook");
html = html.replace(/localStorage\.getItem\('businessInstagram'\)/g, "(await getBusinessInfo()).instagram");

// Replace defaultMargin
html = html.replace(/parseFloat\(localStorage\.getItem\('defaultMargin'\) \|\| '30'\)/g, "(await getDefaultMargin())");
html = html.replace(/localStorage\.getItem\('defaultMargin'\)/g, "String(await getDefaultMargin())");

// Replace theme
html = html.replace(/localStorage\.getItem\('theme'\)/g, "(await getTheme())");
html = html.replace(/localStorage\.setItem\('theme',/g, "await saveTheme(");

// Replace recipe storage
html = html.replace(/localStorage\.getItem\(`recipe-\$\{(\w+)\}`\)/g, "JSON.stringify(await getRecipe($1))");
html = html.replace(/localStorage\.setItem\(`recipe-\$\{(\w+)\}`, JSON\.stringify\((\w+)\)\)/g, "await saveRecipe($1, $2)");

// Replace settings save/load for business info
html = html.replace(/localStorage\.setItem\('businessPhone',/g, "/* localStorage.setItem('businessPhone',");
html = html.replace(/localStorage\.setItem\('businessEmail',/g, "/* localStorage.setItem('businessEmail',");
html = html.replace(/localStorage\.setItem\('businessAddress',/g, "/* localStorage.setItem('businessAddress',");
html = html.replace(/localStorage\.setItem\('businessWebsite',/g, "/* localStorage.setItem('businessWebsite',");
html = html.replace(/localStorage\.setItem\('businessFacebook',/g, "/* localStorage.setItem('businessFacebook',");
html = html.replace(/localStorage\.setItem\('businessInstagram',/g, "/* localStorage.setItem('businessInstagram',");

// Replace settings functions
html = html.replace(/localStorage\.setItem\('defaultMargin', margin\);/g, "await saveSetting('defaultMargin', String(margin));");

// Write the updated file
fs.writeFileSync('./public/index.html', html, 'utf8');

console.log('Frontend updated successfully!');
console.log('- Added db-helpers.js script reference');
console.log('- Replaced business info localStorage calls');
console.log('- Replaced defaultMargin localStorage calls');
console.log('- Replaced theme localStorage calls');
console.log('- Replaced recipe localStorage calls');
