// Database Helper Functions - Replace localStorage with database API calls

// Business Info & Settings
let businessInfoCache = null;
let settingsCache = null;

async function getBusinessInfo() {
    if (!businessInfoCache) {
        const response = await fetch('/api/business-info');
        businessInfoCache = await response.json();
    }
    return businessInfoCache;
}

async function saveBusinessInfo(data) {
    await fetch('/api/business-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    businessInfoCache = null;
}

async function getSettings() {
    if (!settingsCache) {
        const response = await fetch('/api/settings');
        settingsCache = await response.json();
    }
    return settingsCache;
}

async function saveSetting(key, value) {
    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
    });
    settingsCache = null;
}

async function saveSettings(settings) {
    await fetch('/api/settings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
    });
    settingsCache = null;
}

// Recipes
async function getRecipe(menuId) {
    const response = await fetch(`/api/recipes/${menuId}`);
    return await response.json();
}

async function saveRecipe(menuId, ingredients) {
    await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: menuId, ingredients })
    });
}

// Licenses
async function getLicenses() {
    const response = await fetch('/api/licenses');
    return await response.json();
}

async function saveLicense(license) {
    await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(license)
    });
}

async function updateLicense(id, license) {
    await fetch(`/api/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(license)
    });
}

async function deleteLicense(id) {
    await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
}

// Maintenance Tasks
async function getMaintenanceTasks() {
    const response = await fetch('/api/maintenance-tasks');
    return await response.json();
}

async function saveMaintenanceTask(task) {
    await fetch('/api/maintenance-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

async function updateMaintenanceTask(id, task) {
    await fetch(`/api/maintenance-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

async function deleteMaintenanceTask(id) {
    await fetch(`/api/maintenance-tasks/${id}`, { method: 'DELETE' });
}

// Files
async function getFiles() {
    const response = await fetch('/api/files');
    return await response.json();
}

async function saveFile(file) {
    await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file)
    });
}

async function updateFile(id, file) {
    await fetch(`/api/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(file)
    });
}

async function deleteFile(id) {
    await fetch(`/api/files/${id}`, { method: 'DELETE' });
}

// Helper functions for backward compatibility
async function getDefaultMargin() {
    const info = await getBusinessInfo();
    return info.default_margin || 30;
}

async function getBusinessPhone() {
    const info = await getBusinessInfo();
    return info.phone || '';
}

async function getBusinessEmail() {
    const info = await getBusinessInfo();
    return info.email || '';
}

async function getBusinessWebsite() {
    const info = await getBusinessInfo();
    return info.website || '';
}

async function getMenuCategories() {
    const settings = await getSettings();
    return settings.menuCategories ? JSON.parse(settings.menuCategories) : ['Entree','Appetizer','Dessert','Sauce','Side','Beverage'];
}

async function getSupplierCategories() {
    const settings = await getSettings();
    return settings.supplierCategories ? JSON.parse(settings.supplierCategories) : ['Food','Equipment','Supplies','Other'];
}

async function getMeasurementUnits() {
    const settings = await getSettings();
    return settings.measurementUnits ? JSON.parse(settings.measurementUnits) : ['lb','oz','kg','g','cups','tbsp','tsp','liters','ml','pieces','pack'];
}

async function getEventStatuses() {
    const settings = await getSettings();
    return settings.eventStatuses ? JSON.parse(settings.eventStatuses) : ['Interested','Applied','Accepted','Accepted & Paid','Rejected','Completed'];
}

async function getFileCategories() {
    const settings = await getSettings();
    return settings.fileCategories ? JSON.parse(settings.fileCategories) : ['General','Event Contracts','Catering Contracts','Permits','Insurance','Marketing','Images','Receipts','Other'];
}

async function getEmployeeRoles() {
    const settings = await getSettings();
    return settings.employeeRoles ? JSON.parse(settings.employeeRoles) : ['Cook','Cashier','Manager','Prep Cook','Server','Driver','Cleaner'];
}

async function getTheme() {
    const settings = await getSettings();
    return settings.theme || 'light';
}

async function saveTheme(theme) {
    await saveSetting('theme', theme);
}
