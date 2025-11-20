# Complete Component & Feature List

## Navigation Components

### Bottom Navigation Bar
- **Home Button** - Dashboard navigation with home icon
- **Menu Button** - Menu management with checkmark icon  
- **Items Button** - Ingredients with house icon
- **Stock Button** - Inventory with box icon
- **Stats Button** - Analytics with chart icon
- **More Button** - Expandable menu with 3-dots icon

### Expandable Menu (3-Dot Menu)
- **Suppliers Option** - Supplier management access
- **Tools Option** - File management access  
- **Catering Option** - Catering orders access
- **Expand/Collapse Logic** - Show/hide additional options

### Header Navigation
- **Brand Logo** - "Birria Fusion" branding
- **Hamburger Menu** - Settings access (☰ icon)
- **Settings Overlay** - Dark background overlay
- **Settings Slide Panel** - Right-side sliding menu

## Page Components

### 1. Dashboard Page (`dashboardPage`)
#### Overview Cards Grid
- **Menu Items Card** - Total count with green color
- **Average Margin Card** - Profit percentage with conditional coloring
- **Low Stock Card** - Alert count with red/green status
- **Revenue Card** - Total revenue with green color

#### Dashboard Functions
- `loadDashboard()` - Populate dashboard metrics
- Real-time data calculation
- Color-coded status indicators

### 2. Menu Management Page (`menuPage`)
#### Add Menu Item Form
- **Item Name Input** - Text input for product name
- **Price Input** - Number input with decimal support
- **Cost Input** - Number input for food cost
- **Category Select** - Dropdown (Food/Beverage/Dessert)
- **Add Button** - Submit new menu item

#### Menu Items Data Table
- **Table Header** - "Menu Items (count)" with actions
- **Item Rows** - Name, price, margin display
- **Edit Recipe Button** - Opens recipe modal
- **Delete Button** - Remove item with confirmation

#### Menu Functions
- `addMenuItem()` - Create new menu item
- `loadMenu()` - Display menu items table
- `deleteMenuItem(id)` - Remove menu item
- `editRecipe(id, name)` - Open recipe editor

### 3. Ingredients Page (`ingredientsPage`)
#### Add Ingredient Form
- **Ingredient Name Input** - Text input
- **Cost per Unit Input** - Number input with decimals
- **Unit Select** - Dropdown (lb, oz, kg, each)
- **Add Button** - Submit new ingredient

#### Ingredients Data Table
- **Table Header** - "Ingredients (count)"
- **Ingredient Rows** - Name, cost, unit display
- **Delete Button** - Remove ingredient

#### Ingredient Functions
- `addIngredient()` - Create new ingredient
- `loadIngredients()` - Display ingredients table
- `deleteIngredient(id)` - Remove ingredient
- `updateIngredientSelects()` - Refresh dropdowns

### 4. Inventory Page (`inventoryPage`)
#### Add Inventory Form
- **Ingredient Select** - Dropdown of available ingredients
- **Current Stock Input** - Number input
- **Min Stock Input** - Number input for reorder point
- **Max Stock Input** - Number input for capacity
- **Add Button** - Submit inventory item

#### Inventory Data Table
- **Table Header** - "Inventory (count)"
- **Inventory Rows** - Name, stock level, status badges
- **Update Stock Button** - Quick stock adjustment
- **Delete Button** - Remove inventory item

#### Inventory Functions
- `addInventoryItem()` - Create inventory entry
- `loadInventory()` - Display inventory table
- `updateStock(id)` - Modify stock levels
- `deleteInventoryItem(id)` - Remove inventory item

### 5. Analytics Page (`analyticsPage`)
#### Analytics Cards Grid
- **Revenue Card** - Total revenue with green color
- **Costs Card** - Total costs with red color
- **Profit Card** - Net profit with green color
- **Margin Card** - Average margin with conditional coloring

#### Analytics Functions
- `loadAnalytics()` - Calculate and display metrics
- Revenue/cost/profit calculations
- Margin analysis and trending

### 6. Suppliers Page (`suppliersPage`)
#### Add Supplier Form
- **Supplier Name Input** - Text input
- **Contact Person Input** - Text input
- **Phone Input** - Tel input with formatting
- **Email Input** - Email input with validation
- **Category Select** - Dropdown (Food/Equipment/Services)
- **Add Button** - Submit new supplier

#### Suppliers Data Table
- **Table Header** - "Suppliers (count)"
- **Supplier Rows** - Name, contact, phone display
- **Delete Button** - Remove supplier

#### Supplier Functions
- `addSupplier()` - Create new supplier
- `loadSuppliers()` - Display suppliers table
- `deleteSupplier(id)` - Remove supplier

### 7. Tools Page (`toolsPage`)
#### File Upload Form
- **File Input** - Multiple file selection
- **Upload Button** - Process selected files
- **Upload Status** - Progress and result display

#### File Management Grid
- **File Items** - Grid layout of uploaded files
- **File Info** - Name, size, type display
- **Delete Button** - Remove file with confirmation

#### Tools Functions
- `uploadFiles()` - Process file uploads
- `loadTools()` - Display file grid
- `deleteFile(id)` - Remove uploaded file

### 8. Catering Page (`cateringPage`)
#### Add Catering Order Form
- **Client Name Input** - Text input
- **Event Date Input** - Date picker
- **Guest Count Input** - Number input
- **Package Select** - Dropdown (Basic/Premium/Deluxe)
- **Total Price Input** - Number input with decimals
- **Notes Textarea** - Multi-line text input
- **Add Button** - Submit catering order

#### Catering Orders Data Table
- **Table Header** - "Catering Orders (count)"
- **Order Rows** - Client, date, guests, price display
- **Delete Button** - Remove order

#### Catering Functions
- `addCateringOrder()` - Create new catering order
- `loadCatering()` - Display orders table
- `deleteCateringOrder(id)` - Remove catering order

## Modal Components

### Recipe Editor Modal (`recipeModal`)
#### Recipe Form
- **Modal Title** - "Recipe: [Item Name]"
- **Ingredient Select** - Dropdown of available ingredients
- **Quantity Input** - Number input with decimals
- **Add Ingredient Button** - Add to recipe
- **Recipe Total Display** - Sum of ingredient costs
- **Save Button** - Persist recipe changes
- **Cancel Button** - Close without saving

#### Recipe Ingredients List
- **Ingredient Rows** - Name, quantity, unit, cost
- **Remove Buttons** - Delete ingredient from recipe
- **Cost Calculations** - Real-time total updates

#### Recipe Functions
- `editRecipe(id, name)` - Open recipe editor
- `addRecipeIngredient()` - Add ingredient to recipe
- `removeRecipeIngredient(idx)` - Remove ingredient
- `updateRecipeDisplay()` - Refresh ingredient list
- `saveRecipe()` - Persist recipe data
- `closeRecipeModal()` - Close modal

## Settings Components

### Settings Menu Panel
#### Display Settings Section
- **Dark Mode Checkbox** - Theme toggle (default: checked)
- **Theme Toggle Function** - Switch between themes

#### Business Settings Section
- **Business Name Input** - Company name (default: "Birria Fusion")
- **Target Margin Input** - Profit goal percentage (default: 30)
- **Save Settings Button** - Persist configuration

#### Data Management Section
- **Export Data Button** - Download JSON backup
- **Clear Data Button** - Factory reset with confirmation

#### Settings Functions
- `toggleSettings()` - Open/close settings panel
- `closeSettings()` - Close settings panel
- `saveSettings()` - Persist business configuration
- `exportData()` - Generate data backup
- `clearData()` - Reset all application data

## Utility Components

### Data Storage System
- **LocalStorage Integration** - Client-side data persistence
- **API Fallback System** - Server communication when available
- **Data Synchronization** - Automatic sync between storage methods

### Navigation System
- **Page Switching Logic** - Show/hide page components
- **Active State Management** - Visual navigation feedback
- **Menu State Control** - Expandable menu logic

### Form Validation
- **Input Validation** - Required field checking
- **Number Validation** - Decimal and positive number validation
- **Confirmation Dialogs** - Destructive action protection

### UI Feedback System
- **Status Badges** - Color-coded status indicators
- **Hover Effects** - Interactive element feedback
- **Loading States** - Operation progress indication

## Data Models

### Menu Item Model
```javascript
{
  id: Number,
  name: String,
  price: Number,
  cost: Number,
  category: String,
  profit_margin: Number (calculated)
}
```

### Ingredient Model
```javascript
{
  id: Number,
  name: String,
  cost: Number,
  unit: String
}
```

### Inventory Model
```javascript
{
  id: Number,
  ingredient_id: Number,
  name: String,
  unit: String,
  current_stock: Number,
  min_stock: Number,
  max_stock: Number
}
```

### Supplier Model
```javascript
{
  id: Number,
  name: String,
  contact: String,
  phone: String,
  email: String,
  category: String
}
```

### Catering Order Model
```javascript
{
  id: Number,
  client: String,
  date: String,
  guests: Number,
  package: String,
  price: Number,
  notes: String
}
```

### Recipe Model
```javascript
{
  ingredient_id: Number,
  name: String,
  cost: Number,
  unit: String,
  quantity: Number
}
```

### File Model
```javascript
{
  id: Number,
  name: String,
  size: Number,
  type: String,
  uploadDate: String
}
```

## Event Handlers

### Navigation Events
- `showPage(pageName)` - Page navigation handler
- `toggleExpandMenu()` - Expandable menu toggle
- `closeExpandMenu()` - Close expandable menu

### Form Events
- Form submission handlers for all CRUD operations
- Input validation and sanitization
- Real-time calculation updates

### Modal Events
- Modal open/close handlers
- Overlay click handlers
- Escape key handlers

### Settings Events
- Theme toggle handlers
- Settings panel slide animations
- Data export/import handlers

## CSS Classes & Styling

### Layout Classes
- `.container` - Main content wrapper
- `.app-header` - Top header styling
- `.bottom-nav` - Fixed bottom navigation
- `.nav-container` - Navigation item container
- `.page` - Page content wrapper

### Component Classes
- `.form` - Form container styling
- `.form-grid` - Responsive form layout
- `.data-table` - Table container
- `.table-header` - Table header styling
- `.table-row` - Table row styling
- `.card` - Dashboard card styling
- `.modal` - Modal overlay and content

### Interactive Classes
- `.nav-item` - Navigation button styling
- `.nav-item.active` - Active navigation state
- `.btn-icon` - Icon button styling
- `.btn-secondary` - Secondary button styling
- `.btn-danger` - Destructive action styling

### Status Classes
- `.badge` - Status badge base
- `.badge-success` - Success status (green)
- `.badge-warning` - Warning status (orange)
- `.badge-danger` - Danger status (red)

## Responsive Design Features

### Mobile Optimizations
- Touch-friendly button sizes (minimum 44px)
- Optimized spacing for thumb navigation
- Single-column layouts on small screens
- Bottom navigation for easy thumb access

### Tablet Adaptations
- Multi-column form layouts
- Expanded navigation options
- Larger content areas
- Enhanced data table layouts

### Desktop Enhancements
- Full-width layouts
- Hover effects and transitions
- Keyboard navigation support
- Enhanced data visualization

This comprehensive component list represents every feature, function, and interface element built during our development session, providing a complete reference for the food truck management application.