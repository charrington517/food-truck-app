// Global variables
let currentPage = 'dashboard';
let currentUser = null;
let sessionTimeout = null;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Session management
function resetSessionTimeout() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        alert('Session expired. Please log in again.');
        logout();
    }, SESSION_DURATION);
}

function extendSession() {
    if (currentUser) {
        resetSessionTimeout();
    }
}

// Add activity listeners to extend session
document.addEventListener('click', extendSession);
document.addEventListener('keypress', extendSession);
document.addEventListener('scroll', extendSession);

// Authentication Functions
async function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.querySelector('.nav').style.display = 'block';
        resetSessionTimeout();
        await migrateEmployeesToDatabase();
        await migrateRecipesToDatabase();
        loadDashboard();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.querySelector('.nav').style.display = 'none';
        initializeDefaultUsers();
    }
}

async function attemptLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorDiv = document.getElementById('loginError');

    if (!username || !password) {
        errorDiv.textContent = 'Please enter username and password';
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        
        const data = await response.json();
        
        if (data.error) {
            errorDiv.textContent = 'Invalid username or password';
            document.getElementById('loginPassword').value = '';
        } else {
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            document.querySelector('.nav').style.display = 'block';
            resetSessionTimeout();
            loadDashboard();
            errorDiv.textContent = '';
            document.getElementById('loginPassword').value = '';
        }
    } catch (error) {
        errorDiv.textContent = 'Login failed. Please try again.';
        document.getElementById('loginPassword').value = '';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
            sessionTimeout = null;
        }
        
        currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Clear all form fields for security
        document.querySelectorAll('input[type="password"]').forEach(input => input.value = '');
        document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
        document.querySelectorAll('input[type="email"]').forEach(input => input.value = '');
        
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.querySelector('.nav').style.display = 'none';
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }
}

// Page Navigation
function showPage(pageId) {
    const validPages = ['dashboard', 'menu', 'ingredients', 'inventory', 'suppliers', 'employee', 'tools', 'recipes', 'catering', 'events', 'contacts', 'marketing', 'analytics', 'settings'];
    if (!validPages.includes(pageId)) {
        console.error('Invalid page ID:', pageId);
        return;
    }
    
    if (!hasPermission(pageId)) {
        alert('Access denied. You do not have permission to view this page.');
        return;
    }
    
    currentPage = pageId;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    const navItem = document.querySelector(`[onclick*="${pageId}"]`);
    if (navItem && navItem.classList.contains('nav-item')) {
        navItem.classList.add('active');
    }
    
    document.getElementById('extraMenu').classList.remove('show');
    
    // Show/hide FAB based on page and permissions
    const fabBtn = document.getElementById('fabBtn');
    if (['dashboard', 'analytics', 'settings', 'marketing', 'events', 'catering', 'employee', 'tools', 'contacts'].includes(pageId) || isReadOnly(pageId)) {
        fabBtn.style.display = 'none';
    } else {
        fabBtn.style.display = 'block';
        fabBtn.style.background = '#ff6b35';
    }
    
    // Load page-specific data
    loadPageData(pageId);
}

function loadPageData(pageId) {
    switch(pageId) {
        case 'dashboard': loadDashboard(); break;
        case 'menu': loadMenu(); break;
        case 'ingredients': loadIngredients(); break;
        case 'inventory': loadInventory(); loadWasteLog(); break;
        case 'suppliers': loadSuppliers(); break;
        case 'employee': loadEmployees(); break;
        case 'tools': loadFiles(); loadLicenses(); break;
        case 'recipes': loadRecipeBook(); break;
        case 'catering': loadCatering(); break;
        case 'events': loadEvents(); break;
        case 'marketing': loadReviews(); break;
        case 'analytics': loadExpenses(); loadAnalytics(); break;
        case 'contacts': loadContacts(); break;
        case 'settings': loadSettings(); break;
    }
}

// Permission Functions
function hasPermission(page) {
    if (!currentUser || currentUser.role !== 'Employee') return true;
    const permissions = currentUser.permissions || {};
    return permissions[page] && (permissions[page].read || permissions[page].write);
}

function isReadOnly(page) {
    if (!currentUser || currentUser.role !== 'Employee') return false;
    const permissions = currentUser.permissions || {};
    return permissions[page] && permissions[page].read && !permissions[page].write;
}

// Modal Functions
function openAddModal() {
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalForm = document.getElementById('modalForm');
    
    let title = '';
    let form = '';
    
    switch(currentPage) {
        case 'menu':
            title = 'Add New Recipe';
            form = getMenuForm();
            break;
        case 'ingredients':
            title = 'Add Ingredient';
            form = getIngredientForm();
            break;
        case 'inventory':
            title = 'Add to Inventory';
            form = getInventoryForm();
            break;
        case 'suppliers':
            title = 'Add Supplier';
            form = getSupplierForm();
            break;
    }
    
    modalTitle.textContent = title;
    modalForm.innerHTML = form;
    modal.classList.add('show');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('show');
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const response = await fetch('/api/menu');
        const items = await response.json();
        
        const totalItems = items.length;
        const avgFoodCost = totalItems > 0 ? items.reduce((sum, item) => sum + ((item.cost / item.price) * 100), 0) / totalItems : 0;
        const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
        const goodItems = items.filter(item => ((item.price - item.cost) / item.price) * 100 >= defaultMargin).length;
        const totalRevenue = items.reduce((sum, item) => sum + (item.price * 10), 0);

        document.getElementById('dashboardStats').innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${totalItems}</div>
                <div class="stat-label">Menu Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${avgFoodCost.toFixed(1)}%</div>
                <div class="stat-label">Avg Food Cost</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${goodItems}</div>
                <div class="stat-label">Good Items (30%+)</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$${totalRevenue.toFixed(0)}</div>
                <div class="stat-label">Est. Revenue</div>
            </div>
        `;

        const topItems = items.sort((a, b) => (b.cost / b.price) - (a.cost / a.price)).slice(0, 6);
        document.getElementById('topItems').innerHTML = topItems.map(item => {
            const foodCost = (item.cost / item.price) * 100;
            const margin = ((item.price - item.cost) / item.price) * 100;
            const status = margin >= defaultMargin ? 'Good' : margin >= (defaultMargin * 0.67) ? 'Needs Attention' : 'Bad - Urgent';
            return `
                <div class="card">
                    <div class="card-title">${item.name}</div>
                    <div class="card-meta">$${item.price} • ${foodCost.toFixed(1)}% food cost</div>
                    <div class="card-meta">${status}</div>
                </div>
            `;
        }).join('');
        
        loadUpcomingSchedule();
        checkExpiringLicenses();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Menu Functions
async function loadMenu() {
    try {
        const response = await fetch('/api/menu');
        const items = await response.json();
        
        // Group items by category
        const grouped = {};
        items.forEach(item => {
            const category = item.recipe_type || 'Uncategorized';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(item);
        });
        
        let html = '';
        Object.keys(grouped).sort().forEach(category => {
            html += `<div style="grid-column: 1 / -1; margin: 20px 0 10px 0;"><h3 style="color: var(--orange); font-size: 18px; font-weight: 600; border-bottom: 2px solid var(--orange); padding-bottom: 8px;">${category}</h3></div>`;
            
            grouped[category].forEach(item => {
                const margin = ((item.price - item.cost) / item.price) * 100;
                const status = margin >= 30 ? 'Good' : margin >= 20 ? 'Needs Attention' : 'Bad - Urgent';
                html += `
                    <div class="card">
                        <div class="card-title">${item.name}</div>
                        <div class="card-meta">${item.recipe_type || 'Uncategorized'} • ${item.portions} portions</div>
                        <div class="card-meta">Cost: $${item.cost.toFixed(2)} • Price: $${item.price.toFixed(2)}</div>
                        <div class="card-meta">Margin: ${margin.toFixed(1)}% ${status}</div>
                        <div class="card-actions">
                            <button class="btn" onclick="editRecipe(${item.id})" style="background: var(--orange); color: white;">Edit</button>
                            <button class="btn btn-danger" onclick="deleteRecipe(${item.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
        });
        
        document.getElementById('menuItems').innerHTML = html;
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

// Utility Functions
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>"'&]/g, function(match) {
        const escapeMap = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
        };
        return escapeMap[match];
    });
}

// Extra Menu
function toggleExtraMenu() {
    document.getElementById('extraMenu').classList.toggle('show');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Close extra menu when clicking outside
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('extraMenu');
        const btn = event.target.closest('[onclick="toggleExtraMenu()"]');
        if (!menu.contains(event.target) && !btn) {
            menu.classList.remove('show');
        }
    });
});

// Placeholder functions for features to be implemented
function loadIngredients() { console.log('Loading ingredients...'); }
function loadInventory() { console.log('Loading inventory...'); }
function loadWasteLog() { console.log('Loading waste log...'); }
function loadSuppliers() { console.log('Loading suppliers...'); }
function loadEmployees() { console.log('Loading employees...'); }
function loadFiles() { console.log('Loading files...'); }
function loadLicenses() { console.log('Loading licenses...'); }
function loadRecipeBook() { console.log('Loading recipe book...'); }
function loadCatering() { console.log('Loading catering...'); }
function loadEvents() { console.log('Loading events...'); }
function loadReviews() { console.log('Loading reviews...'); }
function loadExpenses() { console.log('Loading expenses...'); }
function loadAnalytics() { console.log('Loading analytics...'); }
function loadContacts() { console.log('Loading contacts...'); }
function loadSettings() { console.log('Loading settings...'); }
function loadUpcomingSchedule() { console.log('Loading upcoming schedule...'); }
function checkExpiringLicenses() { console.log('Checking expiring licenses...'); }
function migrateEmployeesToDatabase() { console.log('Migrating employees...'); }
function migrateRecipesToDatabase() { console.log('Migrating recipes...'); }
function initializeDefaultUsers() { console.log('Initializing default users...'); }
function editRecipe(id) { console.log('Editing recipe:', id); }
function deleteRecipe(id) { console.log('Deleting recipe:', id); }
function getMenuForm() { return '<p>Menu form placeholder</p>'; }
function getIngredientForm() { return '<p>Ingredient form placeholder</p>'; }
function getInventoryForm() { return '<p>Inventory form placeholder</p>'; }
function getSupplierForm() { return '<p>Supplier form placeholder</p>'; }