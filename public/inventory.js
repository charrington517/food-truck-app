        // Inventory Functions
        function addInventoryItem() {
            const itemName = document.getElementById('inventoryItemName').value.trim();
            const category = document.getElementById('inventoryCategory').value;
            const unit = document.getElementById('inventoryUnit').value.trim();
            const currentStock = parseFloat(document.getElementById('currentStock').value) || 0;
            const minStock = parseFloat(document.getElementById('minStock').value) || 0;
            const addToIngredients = document.getElementById('addToIngredients')?.checked || false;

            if (!itemName || !unit) {
                alert('Please enter item name and unit');
                return;
            }

            if (addToIngredients) {
                fetch('/api/ingredients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: itemName, cost: 0, unit: unit, servings: 1 })
                }).then(r => r.json()).then(data => {
                    fetch('/api/inventory', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ingredient_id: data.id, current_stock: currentStock, min_stock: minStock, max_stock: 100, barcode: null, category: category })
                    }).then(() => {
                        loadInventory();
                        loadIngredients();
                    });
                });
            } else {
                fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: itemName, unit: unit, category: category, current_stock: currentStock, min_stock: minStock, max_stock: 100, barcode: null })
                }).then(() => {
                    loadInventory();
                });
            }
        }

        function loadInventory() {
            fetch('/api/inventory')
                .then(r => r.json())
                .then(items => {
                    document.getElementById('inventoryList').innerHTML = items.map(item => {
                        const status = item.current_stock <= item.min_stock ? 'Low Stock' : 'Good';
                        return `
                            <div class="card">
                                <div class="card-title">${item.name}</div>
                                <div class="card-meta">${status}</div>
                                <div class="card-meta">Stock: ${item.current_stock} / ${item.min_stock} min ${item.unit}</div>
                                ${item.barcode ? `<div class="card-meta" style="font-family: monospace; font-size: 0.85em;">${item.barcode}</div>` : ''}
                                <div class="card-actions">
                                    <button class="btn" onclick="editInventoryItem(${item.id})" style="background: var(--orange); color: white;">Edit</button>
                                    <button class="btn" onclick="logWaste(${item.id}, '${item.name.replace(/'/g, "\\'")}',' ${item.unit}')" style="background: #dc3545; color: white;">Log Waste</button>
                                    <button class="btn btn-danger" onclick="deleteInventoryItem(${item.id})">Delete</button>
                                </div>
                            </div>
                        `;
                    }).join('');
                });
        }

        function editInventoryItem(id) {
            fetch('/api/inventory')
                .then(r => r.json())
                .then(items => {
                    const item = items.find(inv => inv.id === id);
                    if (!item) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Inventory';
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <label>Item Name</label>
                                <input type="text" value="${item.name}" disabled style="background: var(--gray-light);">
                            </div>
                            <div class="form-group">
                                <label>Category</label>
                                <select id="inventoryCategory">
                                    <option value="Food" ${item.category === 'Food' ? 'selected' : ''}>Food</option>
                                    <option value="Cleaning Supplies" ${item.category === 'Cleaning Supplies' ? 'selected' : ''}>Cleaning Supplies</option>
                                    <option value="To Go Supplies" ${item.category === 'To Go Supplies' ? 'selected' : ''}>To Go Supplies</option>
                                    <option value="Equipment" ${item.category === 'Equipment' ? 'selected' : ''}>Equipment</option>
                                    <option value="Other" ${item.category === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Current Stock</label>
                                    <input type="number" id="currentStock" placeholder="Current Stock" step="0.1" value="${item.current_stock}">
                                </div>
                                <div style="flex: 1;">
                                    <label>Min Stock</label>
                                    <input type="number" id="minStock" placeholder="Min Stock" step="0.1" value="${item.min_stock}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Max Stock</label>
                                <input type="number" id="maxStock" placeholder="Max Stock" step="0.1" value="${item.max_stock}">
                            </div>
                            <div class="form-group">
                                <label>Barcode (optional)</label>
                                <input type="text" id="inventoryBarcode" placeholder="Barcode" value="${item.barcode || ''}">
                            </div>
                            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                                <label style="margin: 0; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="isIngredient" ${item.ingredient_id ? 'checked' : ''} style="width: auto; cursor: pointer;">
                                    <span>Available in Ingredients (for recipes)</span>
                                </label>
                            </div>
                            <button class="btn" onclick="updateInventoryItem(${id}); closeAddModal();">Update Inventory</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function updateInventoryItem(id) {
            const currentStock = parseFloat(document.getElementById('currentStock').value) || 0;
            const minStock = parseFloat(document.getElementById('minStock').value) || 5;
            const maxStock = parseFloat(document.getElementById('maxStock').value) || 100;
            const barcode = document.getElementById('inventoryBarcode')?.value.trim() || null;
            const category = document.getElementById('inventoryCategory')?.value || 'Food';
            const isIngredient = document.getElementById('isIngredient')?.checked || false;

            fetch('/api/inventory')
                .then(r => r.json())
                .then(items => {
                    const item = items.find(inv => inv.id === id);
                    if (!item) return;

                    if (isIngredient && !item.ingredient_id) {
                        // Add to ingredients
                        fetch('/api/ingredients', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: item.name, cost: 0, unit: item.unit, servings: 1 })
                        }).then(r => r.json()).then(data => {
                            fetch(`/api/inventory/${id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ingredient_id: data.id, current_stock: currentStock, min_stock: minStock, max_stock: maxStock, barcode: barcode, category: 'Food' })
                            }).then(() => {
                                loadInventory();
                                loadIngredients();
                            });
                        });
                    } else if (!isIngredient && item.ingredient_id) {
                        // Remove from ingredients
                        fetch(`/api/inventory/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: item.name, unit: item.unit, ingredient_id: null, current_stock: currentStock, min_stock: minStock, max_stock: maxStock, barcode: barcode, category: category })
                        }).then(() => {
                            fetch(`/api/ingredients/${item.ingredient_id}`, { method: 'DELETE' })
                                .then(() => {
                                    loadInventory();
                                    loadIngredients();
                                });
                        });
                    } else {
                        // Just update inventory
                        fetch(`/api/inventory/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ current_stock: currentStock, min_stock: minStock, max_stock: maxStock, barcode: barcode, category: category })
                        }).then(() => {
                            loadInventory();
                            loadIngredients();
                        });
                    }
                });
        }

        function deleteInventoryItem(id) {
            if (confirm('Delete this inventory item?')) {
                fetch(`/api/inventory/${id}`, { method: 'DELETE' })
                    .then(() => loadInventory());
            }
        }

