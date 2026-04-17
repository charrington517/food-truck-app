        // Theme Functions
        function toggleTheme() {
            const isDark = document.getElementById('darkMode').checked;
            document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.body.setAttribute('data-theme', savedTheme);
            document.getElementById('darkMode').checked = savedTheme === 'dark';
        }

        // Menu Categories Functions
        function addMenuCategory() {
            const category = document.getElementById('newCategory').value.trim();
            if (!category) return alert('Please enter a category name');
            
            fetch('/api/settings/menuCategories')
                .then(r => r.json())
                .then(dbCats => {
                    const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/menuCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    document.getElementById('newCategory').value = '';
                    loadMenuCategories();
                });
        }
        
        function loadMenuCategories() {
            fetch('/api/settings/menuCategories')
                .then(r => r.json())
                .then(dbCats => {
                    const categories = dbCats.value ? JSON.parse(dbCats.value) : JSON.parse('["Entree","Appetizer","Dessert","Sauce","Side","Beverage"]');
                    document.getElementById('categoriesList').innerHTML = categories.map(category => `
                        <span onclick="editMenuCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        let editType = '';
        let editOriginalValue = '';
        
        function editMenuCategory(category) {
            editType = 'category';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function deleteMenuCategory(category) {
            if (!confirm(`Delete category "${category}"?`)) return;
            fetch('/api/settings/menuCategories')
                .then(r => r.json())
                .then(dbCats => {
                    const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                    const filtered = categories.filter(c => c !== category);
                    return fetch('/api/settings/menuCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                })
                .then(() => loadMenuCategories());
        }
        
        function getAllMenuCategories() {
            return fetch('/api/settings/menuCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }

        // Supplier Categories Functions
        function addInventoryCategory() {
            const category = document.getElementById('newInventoryCategory').value.trim();
            if (!category) return alert('Please enter a category name');
            
            fetch('/api/settings/inventoryCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/inventoryCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    document.getElementById('newInventoryCategory').value = '';
                    loadInventoryCategories();
                });
        }
        
        function loadInventoryCategories() {
            fetch('/api/settings/inventoryCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : JSON.parse('["Food","Cleaning Supplies","To Go Supplies","Equipment","Other"]');
                    document.getElementById('inventoryCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editInventoryCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function editInventoryCategory(category) {
            editType = 'inventoryCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Inventory Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllInventoryCategories() {
            return fetch('/api/settings/inventoryCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }

        function addSupplierCategory() {
            const category = document.getElementById('newSupplierCategory').value.trim();
            if (!category) return alert('Please enter a category name');
            
            fetch('/api/settings/supplierCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/supplierCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    document.getElementById('newSupplierCategory').value = '';
                    loadSupplierCategories();
                });
        }
        
        function loadSupplierCategories() {
            fetch('/api/settings/supplierCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : JSON.parse('["Food","Beverage","Equipment","Supplies","Other"]');
                    document.getElementById('supplierCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editSupplierCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function editSupplierCategory(category) {
            editType = 'supplierCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Supplier Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllSupplierCategories() {
            return fetch('/api/settings/supplierCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }

        // Measurement Units Functions
        function addMeasurementUnit() {
            const unit = document.getElementById('newUnit').value.trim();
            if (!unit) return alert('Please enter a unit name');
            
            fetch('/api/settings/measurementUnits')
                .then(r => r.json())
                .then(d => {
                    const units = d.value ? JSON.parse(d.value) : [];
                    if (units.includes(unit)) return alert('Unit already exists');
                    units.push(unit);
                    return fetch('/api/settings/measurementUnits', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(units)})});
                })
                .then(() => {
                    document.getElementById('newUnit').value = '';
                    loadMeasurementUnits();
                });
        }
        
        function getAllQRCategories() {
            const stored = localStorage.getItem('qrCategories');
            return stored ? JSON.parse(stored) : ['Website/Menu Link','Text Message','Phone Number','Email Address','WiFi Network'];
        }
        
        function loadQRCategories() {
            fetch('/api/settings/qrCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : ['Website/Menu Link','Text Message','Phone Number','Email Address','WiFi Network'];
                    localStorage.setItem('qrCategories', JSON.stringify(categories));
                    const list = document.getElementById('qrCategoriesList');
                    if (list) {
                        list.innerHTML = categories.map(cat => `
                            <span onclick="editQRCategory('${cat}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                                ${cat}
                            </span>
                        `).join('');
                    }
                });
        }
        
        function addQRCategory() {
            const input = document.getElementById('newQRCategory');
            const category = input.value.trim();
            if (!category) return;
            
            const categories = getAllQRCategories();
            if (!categories.includes(category)) {
                categories.push(category);
                fetch('/api/settings/qrCategories', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({value: JSON.stringify(categories)})
                }).then(() => {
                    input.value = '';
                    loadQRCategories();
                });
            }
        }
        
        function editQRCategory(category) {
            if (confirm(`Delete "${category}"?`)) {
                removeQRCategory(category);
            }
        }
        
        function removeQRCategory(category) {
            const categories = getAllQRCategories().filter(c => c !== category);
            fetch('/api/settings/qrCategories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({value: JSON.stringify(categories)})
            }).then(() => loadQRCategories());
        }
        
        function toggleEquipmentTracking() {
            const content = document.getElementById('equipmentTrackingContent');
            const icon = document.getElementById('equipment-tracking-icon');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▲';
            } else {
                content.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function toggleEquipmentCard(id) {
            const details = document.getElementById(`eq-details-${id}`);
            const icon = document.getElementById(`eq-icon-${id}`);
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function loadEquipmentTracking() {
            fetch('/api/equipment-tracking')
                .then(r => r.json())
                .then(equipment => {
                    const tracked = equipment.filter(e => e.status !== 'Rented');
                    if (tracked.length === 0) {
                        document.getElementById('equipmentList').innerHTML = '<div style="text-align: center; color: var(--gray); padding: 20px;">No equipment tracked yet</div>';
                        return;
                    }
                    
                    document.getElementById('equipmentList').innerHTML = tracked.map(e => {
                        const statusColor = e.status === 'Available' ? 'var(--success)' : e.status === 'In Use' ? 'var(--warning)' : 'var(--danger)';
                        return `
                            <div class="card">
                                <div onclick="toggleEquipmentCard(${e.id})" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                                    <div class="card-title" style="margin: 0;">${e.equipment_name}</div>
                                    <span id="eq-icon-${e.id}">▼</span>
                                </div>
                                <div id="eq-details-${e.id}" style="display: none; margin-top: 10px;">
                                    <div class="card-meta">Quantity: ${e.quantity_available || 0} / ${e.quantity_total || 1} available</div>
                                    <div class="card-meta">Location: ${e.location || 'Not set'}</div>
                                    <div class="card-meta" style="color: ${statusColor}; font-weight: bold;">Status: ${e.status}</div>
                                    <div class="card-meta">QR: ${e.qr_code}</div>
                                    ${e.notes ? `<div class="card-meta">Notes: ${e.notes}</div>` : ''}
                                    <div class="card-meta" style="font-size: 0.8em;">Updated: ${new Date(e.last_updated).toLocaleString()}</div>
                                    <div class="card-actions">
                                        <button class="btn" onclick="event.stopPropagation(); updateEquipmentStatus(${e.id})" style="background: var(--orange);">Update</button>
                                        <button class="btn" onclick="event.stopPropagation(); viewEquipmentQR('${e.qr_code}', '${e.equipment_name}')" style="background: var(--success);">View QR</button>
                                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteEquipment(${e.id})">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                });
        }
        
        function addEquipment() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Equipment';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="equipmentName" placeholder="Equipment Name (e.g., Grill, Cooler)">
                    </div>
                    <div class="form-group">
                        <input type="text" id="equipmentQR" placeholder="QR Code (unique ID)" value="EQ${Date.now()}">
                    </div>
                    <div class="form-group">
                        <input type="text" id="equipmentLocation" placeholder="Location">
                    </div>
                    <div class="form-group">
                        <select id="equipmentStatus">
                            ${getAllEquipmentStatuses().map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div style="flex: 1;">
                            <label>Total Quantity</label>
                            <input type="number" id="equipmentQtyTotal" placeholder="Total" min="1" value="1">
                        </div>
                        <div style="flex: 1;">
                            <label>Available</label>
                            <input type="number" id="equipmentQtyAvailable" placeholder="Available" min="0" value="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <textarea id="equipmentNotes" placeholder="Notes" rows="2"></textarea>
                    </div>
                    <button class="btn" onclick="saveEquipment(); closeAddModal();">Save Equipment</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function saveEquipment() {
            const equipment_name = document.getElementById('equipmentName').value.trim();
            const qr_code = document.getElementById('equipmentQR').value.trim();
            const location = document.getElementById('equipmentLocation').value.trim();
            const status = document.getElementById('equipmentStatus').value;
            const notes = document.getElementById('equipmentNotes').value.trim();
            
            if (!equipment_name || !qr_code) {
                alert('Please enter equipment name and QR code');
                return;
            }
            
            const quantity_total = parseInt(document.getElementById('equipmentQtyTotal').value) || 1;
            const quantity_available = parseInt(document.getElementById('equipmentQtyAvailable').value) || quantity_total;
            
            fetch('/api/equipment-tracking', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ equipment_name, qr_code, location, status, notes, quantity_total, quantity_available })
            }).then(() => loadEquipmentTracking());
        }
        
        function updateEquipmentStatus(id) {
            fetch('/api/equipment-tracking')
                .then(r => r.json())
                .then(equipment => {
                    const item = equipment.find(e => e.id === id);
                    if (!item) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Update Equipment Status';
                    modalForm.innerHTML = `
                        <div class="form">
                            <h4>${item.equipment_name}</h4>
                            <div class="form-group">
                                <label>Location</label>
                                <input type="text" id="updateLocation" value="${item.location || ''}">
                            </div>
                            <div class="form-group">
                                <label>Status</label>
                                <select id="updateStatus">
                                    ${getAllEquipmentStatuses().map(s => `<option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Total Quantity</label>
                                    <input type="number" id="updateQtyTotal" min="1" value="${item.quantity_total || 1}">
                                </div>
                                <div style="flex: 1;">
                                    <label>Available</label>
                                    <input type="number" id="updateQtyAvailable" min="0" value="${item.quantity_available || 1}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="updateNotes" rows="2">${item.notes || ''}</textarea>
                            </div>
                            <button class="btn" onclick="saveEquipmentUpdate(${id}); closeAddModal();">Update</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function saveEquipmentUpdate(id) {
            const location = document.getElementById('updateLocation').value.trim();
            const status = document.getElementById('updateStatus').value;
            const notes = document.getElementById('updateNotes').value.trim();
            const quantity_total = parseInt(document.getElementById('updateQtyTotal').value) || 1;
            const quantity_available = parseInt(document.getElementById('updateQtyAvailable').value) || 0;
            
            fetch(`/api/equipment-tracking/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ location, status, notes, quantity_total, quantity_available })
            }).then(() => loadEquipmentTracking());
        }
        
        function viewEquipmentQR(qrCode, name) {
            document.getElementById('qrContent').value = qrCode;
            generateQR();
            document.getElementById('qrResult').scrollIntoView({ behavior: 'smooth' });
        }
        
        let equipmentScanner = null;
        
        function lookupEquipmentQR() {
            const qrCode = prompt('Enter QR Code (e.g., stove):');
            if (!qrCode) return;
            
            fetch(`/api/equipment-tracking/${encodeURIComponent(qrCode)}`)
                .then(r => r.json())
                .then(equipment => {
                    if (equipment && equipment.id) {
                        updateEquipmentStatus(equipment.id);
                    } else {
                        if (confirm(`Equipment "${qrCode}" not found. Add it?`)) {
                            const modal = document.getElementById('addModal');
                            const modalTitle = document.getElementById('modalTitle');
                            const modalForm = document.getElementById('modalForm');
                            
                            modalTitle.textContent = 'Add Equipment';
                            modalForm.innerHTML = `
                                <div class="form">
                                    <div class="form-group">
                                        <input type="text" id="equipmentName" placeholder="Equipment Name">
                                    </div>
                                    <div class="form-group">
                                        <input type="text" id="equipmentQR" value="${qrCode}" readonly>
                                    </div>
                                    <div class="form-group">
                                        <input type="text" id="equipmentLocation" placeholder="Location">
                                    </div>
                                    <div class="form-group">
                                        <select id="equipmentStatus">
                                            ${getAllEquipmentStatuses().map(s => `<option value="${s}">${s}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <textarea id="equipmentNotes" placeholder="Notes" rows="2"></textarea>
                                    </div>
                                    <button class="btn" onclick="saveEquipment(); closeAddModal();">Save Equipment</button>
                                </div>
                            `;
                            modal.classList.add('show');
                        }
                    }
                });
        }
        
        function scanEquipmentQR() {
            document.getElementById('barcodeScannerModal').classList.add('show');
            document.getElementById('barcodeScanResult').innerHTML = '<div style="text-align: center; color: var(--gray);">Position QR code in camera view...</div>';
            
            equipmentScanner = new Html5Qrcode('barcodeScannerReader');
            
            Html5Qrcode.getCameras().then(cameras => {
                if (cameras && cameras.length) {
                    const cameraId = cameras[cameras.length - 1].id;
                    equipmentScanner.start(
                        cameraId,
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        (decodedText) => {
                            alert('QR Scanned: ' + decodedText);
                            equipmentScanner.stop().then(() => {
                                equipmentScanner.clear();
                                equipmentScanner = null;
                                document.getElementById('barcodeScannerModal').classList.remove('show');
                                
                                fetch(`/api/equipment-tracking/${encodeURIComponent(decodedText)}`)
                                    .then(r => r.json())
                                    .then(equipment => {
                                        if (equipment && equipment.id) {
                                            updateEquipmentStatus(equipment.id);
                                        } else {
                                            if (confirm(`Equipment "${decodedText}" not found. Add it?`)) {
                                                const modal = document.getElementById('addModal');
                                                const modalTitle = document.getElementById('modalTitle');
                                                const modalForm = document.getElementById('modalForm');
                                                
                                                modalTitle.textContent = 'Add Equipment';
                                                modalForm.innerHTML = `
                                                    <div class="form">
                                                        <div class="form-group">
                                                            <input type="text" id="equipmentName" placeholder="Equipment Name">
                                                        </div>
                                                        <div class="form-group">
                                                            <input type="text" id="equipmentQR" value="${decodedText}" readonly>
                                                        </div>
                                                        <div class="form-group">
                                                            <input type="text" id="equipmentLocation" placeholder="Location">
                                                        </div>
                                                        <div class="form-group">
                                                            <select id="equipmentStatus">
                                                                <option value="Available">Available</option>
                                                                <option value="In Use">In Use</option>
                                                                <option value="Maintenance">Maintenance</option>
                                                                <option value="Out of Service">Out of Service</option>
                                                            </select>
                                                        </div>
                                                        <div class="form-group">
                                                            <textarea id="equipmentNotes" placeholder="Notes" rows="2"></textarea>
                                                        </div>
                                                        <button class="btn" onclick="saveEquipment(); closeAddModal();">Save Equipment</button>
                                                    </div>
                                                `;
                                                modal.classList.add('show');
                                            }
                                        }
                                    });
                            });
                        },
                        () => {}
                    ).catch(err => {
                        console.error('Camera start error:', err);
                        document.getElementById('barcodeScanResult').innerHTML = '<div style="color: var(--danger);">Camera access denied or not available</div>';
                    });
                }
            }).catch(err => {
                console.error('Camera error:', err);
                document.getElementById('barcodeScanResult').innerHTML = '<div style="color: var(--danger);">No camera found</div>';
            });
        }
        
        function deleteEquipment(id) {
            if (confirm('Delete this equipment?')) {
                fetch(`/api/equipment-tracking/${id}`, {method: 'DELETE'})
                    .then(() => loadEquipmentTracking());
            }
        }
        
        function getAllEquipmentStatuses() {
            const stored = localStorage.getItem('equipmentStatuses');
            return stored ? JSON.parse(stored) : ['Available','In Use','Maintenance','Out of Service'];
        }
        
        function loadEquipmentStatuses() {
            fetch('/api/settings/equipmentStatuses')
                .then(r => r.json())
                .then(d => {
                    const statuses = d.value ? JSON.parse(d.value) : ['Available','In Use','Maintenance','Out of Service'];
                    localStorage.setItem('equipmentStatuses', JSON.stringify(statuses));
                    const list = document.getElementById('equipmentStatusesList');
                    if (list) {
                        list.innerHTML = statuses.map(status => `
                            <span onclick="editEquipmentStatus('${status}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                                ${status}
                            </span>
                        `).join('');
                    }
                });
        }
        
        function addEquipmentStatus() {
            const input = document.getElementById('newEquipmentStatus');
            const status = input.value.trim();
            if (!status) return;
            
            const statuses = getAllEquipmentStatuses();
            if (!statuses.includes(status)) {
                statuses.push(status);
                fetch('/api/settings/equipmentStatuses', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({value: JSON.stringify(statuses)})
                }).then(() => {
                    input.value = '';
                    loadEquipmentStatuses();
                });
            }
        }
        
        function editEquipmentStatus(status) {
            if (confirm(`Delete "${status}"?`)) {
                const statuses = getAllEquipmentStatuses().filter(s => s !== status);
                fetch('/api/settings/equipmentStatuses', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({value: JSON.stringify(statuses)})
                }).then(() => loadEquipmentStatuses());
            }
        }
        
        function loadQRTypeDropdown() {
            const categories = getAllQRCategories();
            const select = document.getElementById('qrType');
            if (select) {
                select.innerHTML = categories.map(cat => `<option value="${cat.toLowerCase().replace(/[^a-z0-9]/g, '')}">${cat}</option>`).join('');
            }
        }
        
        function loadMeasurementUnits() {
            fetch('/api/settings/measurementUnits')
                .then(r => r.json())
                .then(d => {
                    const units = d.value ? JSON.parse(d.value) : JSON.parse('["lb","oz","kg","g","cups","tbsp","tsp","liters","ml","pieces","pack"]');
                    document.getElementById('unitsList').innerHTML = units.map(unit => `
                        <span onclick="editMeasurementUnit('${unit}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${unit}
                        </span>
                    `).join('');
                });
        }
        
        function editMeasurementUnit(unit) {
            editType = 'unit';
            editOriginalValue = unit;
            document.getElementById('editModalTitle').textContent = 'Edit Unit';
            document.getElementById('editInput').value = unit;
            document.getElementById('editModal').classList.add('show');
        }
        
        function closeEditModal() {
            document.getElementById('editModal').classList.remove('show');
        }
        
        function saveEdit() {
            const newValue = document.getElementById('editInput').value.trim();
            if (!newValue) return;
            
            if (editType === 'category') {
                fetch('/api/settings/menuCategories')
                    .then(r => r.json())
                    .then(dbCats => {
                        const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/menuCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadMenuCategories());
            } else if (editType === 'unit') {
                fetch('/api/settings/measurementUnits')
                    .then(r => r.json())
                    .then(d => {
                        const units = d.value ? JSON.parse(d.value) : [];
                        const index = units.indexOf(editOriginalValue);
                        if (index !== -1) {
                            units[index] = newValue;
                            return fetch('/api/settings/measurementUnits', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(units)})});
                        }
                    })
                    .then(() => loadMeasurementUnits());
            } else if (editType === 'inventoryCategory') {
                fetch('/api/settings/inventoryCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/inventoryCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadInventoryCategories());
            } else if (editType === 'supplierCategory') {
                fetch('/api/settings/supplierCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/supplierCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadSupplierCategories());
            } else if (editType === 'eventStatus') {
                const statuses = JSON.parse(localStorage.getItem('eventStatuses') || '["Interested","Applied","Accepted","Accepted & Paid","Rejected","Completed"]');
                const index = statuses.indexOf(editOriginalValue);
                if (index !== -1) {
                    statuses[index] = newValue;
                    localStorage.setItem('eventStatuses', JSON.stringify(statuses));
                    loadEventStatuses();
                }
            } else if (editType === 'fileCategory') {
                fetch('/api/settings/fileCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/fileCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadFileCategories());
            } else if (editType === 'employeeRole') {
                fetch('/api/settings/employeeRoles')
                    .then(r => r.json())
                    .then(d => {
                        const roles = d.value ? JSON.parse(d.value) : [];
                        const index = roles.indexOf(editOriginalValue);
                        if (index !== -1) {
                            roles[index] = newValue;
                            return fetch('/api/settings/employeeRoles', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(roles)})});
                        }
                    })
                    .then(() => {
                        loadEmployeeRoles();
                        updateEmployeeRoleDropdown();
                    });
            } else if (editType === 'contactCategory') {
                fetch('/api/settings/contactCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/contactCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadContactCategories());
            } else if (editType === 'expenseCategory') {
                fetch('/api/settings/expenseCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/expenseCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadExpenseCategories());
            } else if (editType === 'specialCategory') {
                fetch('/api/settings/specialCategories')
                    .then(r => r.json())
                    .then(dbCats => {
                        const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                        const index = categories.indexOf(editOriginalValue);
                        if (index !== -1) {
                            categories[index] = newValue;
                            return fetch('/api/settings/specialCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                        }
                    })
                    .then(() => loadSpecialCategories());
            }
            closeEditModal();
        }
        
        function deleteItem() {
            if (!confirm(`Delete "${editOriginalValue}"?`)) return;
            
            if (editType === 'category') {
                const categories = JSON.parse(localStorage.getItem('menuCategories') || '["Entree","Appetizer","Dessert","Sauce","Side","Beverage"]');
                const filtered = categories.filter(c => c !== editOriginalValue);
                const value = JSON.stringify(filtered);
                localStorage.setItem('menuCategories', value);
                fetch('/api/settings/menuCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value})});
                loadMenuCategories();
            } else if (editType === 'unit') {
                fetch('/api/settings/measurementUnits')
                    .then(r => r.json())
                    .then(d => {
                        const units = d.value ? JSON.parse(d.value) : [];
                        const filtered = units.filter(u => u !== editOriginalValue);
                        return fetch('/api/settings/measurementUnits', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadMeasurementUnits());
            } else if (editType === 'inventoryCategory') {
                fetch('/api/settings/inventoryCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/inventoryCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadInventoryCategories());
            } else if (editType === 'supplierCategory') {
                fetch('/api/settings/supplierCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/supplierCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadSupplierCategories());
            } else if (editType === 'eventStatus') {
                const statuses = JSON.parse(localStorage.getItem('eventStatuses') || '["Interested","Applied","Accepted","Accepted & Paid","Rejected","Completed"]');
                const filtered = statuses.filter(s => s !== editOriginalValue);
                localStorage.setItem('eventStatuses', JSON.stringify(filtered));
                loadEventStatuses();
            } else if (editType === 'fileCategory') {
                fetch('/api/settings/fileCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/fileCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadFileCategories());
            } else if (editType === 'employeeRole') {
                fetch('/api/settings/employeeRoles')
                    .then(r => r.json())
                    .then(d => {
                        const roles = d.value ? JSON.parse(d.value) : [];
                        const filtered = roles.filter(r => r !== editOriginalValue);
                        return fetch('/api/settings/employeeRoles', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => {
                        loadEmployeeRoles();
                        updateEmployeeRoleDropdown();
                    });
            } else if (editType === 'contactCategory') {
                fetch('/api/settings/contactCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/contactCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadContactCategories());
            } else if (editType === 'expenseCategory') {
                fetch('/api/settings/expenseCategories')
                    .then(r => r.json())
                    .then(d => {
                        const categories = d.value ? JSON.parse(d.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/expenseCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadExpenseCategories());
            } else if (editType === 'specialCategory') {
                fetch('/api/settings/specialCategories')
                    .then(r => r.json())
                    .then(dbCats => {
                        const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                        const filtered = categories.filter(c => c !== editOriginalValue);
                        return fetch('/api/settings/specialCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(filtered)})});
                    })
                    .then(() => loadSpecialCategories());
            }
            closeEditModal();
        }
        
        function getAllMeasurementUnits() {
            return fetch('/api/settings/measurementUnits').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        // Event Status Functions
        function addEventStatus() {
            const status = document.getElementById('newEventStatus').value.trim();
            if (!status) return alert('Please enter a status name');
            
            fetch('/api/settings/eventStatuses')
                .then(r => r.json())
                .then(d => {
                    const statuses = d.value ? JSON.parse(d.value) : [];
                    if (statuses.includes(status)) return alert('Status already exists');
                    statuses.push(status);
                    return fetch('/api/settings/eventStatuses', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(statuses)})});
                })
                .then(() => {
                    document.getElementById('newEventStatus').value = '';
                    loadEventStatuses();
                });
        }
        
        function loadEventStatuses() {
            fetch('/api/settings/eventStatuses')
                .then(r => r.json())
                .then(d => {
                    const statuses = d.value ? JSON.parse(d.value) : JSON.parse('["Scheduled","Confirmed","Completed","Cancelled"]');
                    document.getElementById('eventStatusesList').innerHTML = statuses.map(status => `
                        <span onclick="editEventStatus('${status}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${status}
                        </span>
                    `).join('');
                });
        }
        
        function editEventStatus(status) {
            editType = 'eventStatus';
            editOriginalValue = status;
            document.getElementById('editModalTitle').textContent = 'Edit Event Status';
            document.getElementById('editInput').value = status;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllEventStatuses() {
            return fetch('/api/settings/eventStatuses').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        // File Category Functions
        function addFileCategory() {
            const category = document.getElementById('newFileCategory').value.trim();
            if (!category) return alert('Please enter a category name');
            
            fetch('/api/settings/fileCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/fileCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    document.getElementById('newFileCategory').value = '';
                    loadFileCategories();
                });
        }
        
        function loadFileCategories() {
            fetch('/api/settings/fileCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : JSON.parse('["Licenses","Permits","Insurance","Contracts","Invoices","Receipts","Other"]');
                    document.getElementById('fileCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editFileCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function editFileCategory(category) {
            editType = 'fileCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit File Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllFileCategories() {
            return fetch('/api/settings/fileCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        // Employee Roles Functions
        function addEmployeeRole() {
            const role = document.getElementById('newEmployeeRoleInput').value.trim();
            if (!role) return alert('Please enter a role name');
            
            fetch('/api/settings/employeeRoles')
                .then(r => r.json())
                .then(d => {
                    const roles = d.value ? JSON.parse(d.value) : [];
                    if (roles.includes(role)) return alert('Role already exists');
                    roles.push(role);
                    return fetch('/api/settings/employeeRoles', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(roles)})});
                })
                .then(() => {
                    document.getElementById('newEmployeeRoleInput').value = '';
                    loadEmployeeRoles();
                    updateEmployeeRoleDropdown();
                });
        }
        
        function loadEmployeeRoles() {
            fetch('/api/settings/employeeRoles')
                .then(r => r.json())
                .then(d => {
                    const roles = d.value ? JSON.parse(d.value) : JSON.parse('["Manager","Chef","Cook","Server","Cashier","Driver"]');
                    document.getElementById('employeeRolesList').innerHTML = roles.map(role => `
                        <span onclick="editEmployeeRole('${role}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${role}
                        </span>
                    `).join('');
                });
        }
        
        function editEmployeeRole(role) {
            editType = 'employeeRole';
            editOriginalValue = role;
            document.getElementById('editModalTitle').textContent = 'Edit Employee Role';
            document.getElementById('editInput').value = role;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllEmployeeRoles() {
            return fetch('/api/settings/employeeRoles').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        async function updateEmployeeRoleDropdown() {
            const roleSelect = document.getElementById('newEmployeeRole');
            if (roleSelect) {
                const roles = await getAllEmployeeRoles();
                roleSelect.innerHTML = '<option value="">Select role...</option>' + 
                    roles.map(role => `<option value="${role}">${role}</option>`).join('');
            }
        }

        // Data Management Functions
        function loadContactCategories() {
            fetch('/api/settings/contactCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : JSON.parse('["Client","Supplier","Vendor","Partner","Other"]');
                    document.getElementById('contactCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editContactCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function editContactCategory(category) {
            editType = 'contactCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Contact Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllContactCategories() {
            return fetch('/api/settings/contactCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        function addContactCategory() {
            const input = document.getElementById('newContactCategory');
            const category = input.value.trim();
            if (!category) return;
            
            fetch('/api/settings/contactCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/contactCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    input.value = '';
                    loadContactCategories();
                });
        }

        // Expense Categories Functions
        function addExpenseCategory() {
            const input = document.getElementById('newExpenseCategory');
            const category = input.value.trim();
            if (!category) return;
            
            fetch('/api/settings/expenseCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/expenseCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    input.value = '';
                    loadExpenseCategories();
                });
        }
        
        function loadExpenseCategories() {
            fetch('/api/settings/expenseCategories')
                .then(r => r.json())
                .then(d => {
                    const categories = d.value ? JSON.parse(d.value) : JSON.parse('["Food","Supplies","Fuel","Maintenance","Permits","Insurance","Marketing","Other"]');
                    document.getElementById('expenseCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editExpenseCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function editExpenseCategory(category) {
            editType = 'expenseCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Expense Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllExpenseCategories() {
            return fetch('/api/settings/expenseCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }
        
        function loadSpecialCategories() {
            fetch('/api/settings/specialCategories')
                .then(r => r.json())
                .then(dbCats => {
                    const categories = dbCats.value ? JSON.parse(dbCats.value) : JSON.parse('["Seasonal","Weekly","Daily","Limited"]');
                    document.getElementById('specialCategoriesList').innerHTML = categories.map(category => `
                        <span onclick="editSpecialCategory('${category}')" style="display: inline-block; background: var(--orange); color: white; padding: 5px 10px; margin: 2px; border-radius: 15px; font-size: 12px; cursor: pointer;">
                            ${category}
                        </span>
                    `).join('');
                });
        }
        
        function addSpecialCategory() {
            const input = document.getElementById('newSpecialCategory');
            const category = input.value.trim();
            if (!category) return;
            
            fetch('/api/settings/specialCategories')
                .then(r => r.json())
                .then(dbCats => {
                    const categories = dbCats.value ? JSON.parse(dbCats.value) : [];
                    if (categories.includes(category)) return alert('Category already exists');
                    categories.push(category);
                    return fetch('/api/settings/specialCategories', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({value: JSON.stringify(categories)})});
                })
                .then(() => {
                    input.value = '';
                    loadSpecialCategories();
                });
        }
        
        function editSpecialCategory(category) {
            editType = 'specialCategory';
            editOriginalValue = category;
            document.getElementById('editModalTitle').textContent = 'Edit Special Category';
            document.getElementById('editInput').value = category;
            document.getElementById('editModal').classList.add('show');
        }
        
        function getAllSpecialCategories() {
            return fetch('/api/settings/specialCategories').then(r => r.json()).then(d => d.value ? JSON.parse(d.value) : []);
        }

        async function exportData() {
            const measurementUnits = await fetch('/api/settings/measurementUnits').then(r=>r.json()).then(d=>d.value?JSON.parse(d.value):[]);
            const data = {
                menu: [],
                ingredients: [],
                inventory: [],
                suppliers: [],
                tools: JSON.parse(localStorage.getItem('tools') || '[]'),
                catering: JSON.parse(localStorage.getItem('catering') || '[]'),
                measurementUnits: measurementUnits,
                uploadedFiles: JSON.parse(localStorage.getItem('uploadedFiles') || '[]'),
                exportDate: new Date().toISOString()
            };
            
            // Get database data
            Promise.all([
                fetch('/api/menu').then(r => r.json()),
                fetch('/api/ingredients').then(r => r.json()),
                fetch('/api/inventory').then(r => r.json()),
                fetch('/api/suppliers').then(r => r.json())
            ]).then(([menu, ingredients, inventory, suppliers]) => {
                data.menu = menu;
                data.ingredients = ingredients;
                data.inventory = inventory;
                data.suppliers = suppliers;
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `birria-fusion-data-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }).catch(error => {
                console.error('Export error:', error);
                alert('Export failed');
            });
        }

        // Contacts Functions
        function loadContacts() {
            const filterSelect = document.getElementById('contactCategoryFilter');
            const currentFilter = filterSelect.value;
            
            fetch('/api/settings/contactCategories')
                .then(r => r.json())
                .then(data => {
                    const categories = data.value ? JSON.parse(data.value) : ['Client','Supplier','Vendor','Partner','Other'];
                    filterSelect.innerHTML = '<option value="all">All Categories</option>' + 
                        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                    filterSelect.value = currentFilter;
                    return fetch('/api/contacts');
                })
                .then(r => r.json())
                .then(contacts => {
                    const filter = filterSelect.value;
                    const filtered = filter === 'all' ? contacts : contacts.filter(c => c.category === filter);
                    document.getElementById('contactsList').innerHTML = filtered.map(contact => `
                        <div class="card">
                            <div class="card-title">${contact.name}</div>
                            ${contact.company ? `<div class="card-meta">${contact.company}</div>` : ''}
                            <div class="card-meta" style="color: var(--orange); font-weight: 600;">${contact.category}</div>
                            ${contact.phone ? `<div class="card-meta"><a href="tel:${contact.phone}" style="color: var(--charcoal);">☎ ${contact.phone}</a></div>` : ''}
                            ${contact.email ? `<div class="card-meta"><a href="mailto:${contact.email}" style="color: var(--charcoal);">✉ ${contact.email}</a></div>` : ''}
                            ${contact.tags ? `<div class="card-meta" style="font-size: 0.8em;">${contact.tags.split(',').map(t => `<span style="background: var(--gray-light); padding: 2px 6px; border-radius: 4px; margin-right: 4px;">${t.trim()}</span>`).join('')}</div>` : ''}
                            <div class="card-actions">
                                <button class="btn" onclick="viewContactHistory(${contact.id})" style="background: #17a2b8; color: white;">History</button>
                                <button class="btn" onclick="editContact(${contact.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn btn-danger" onclick="deleteContact(${contact.id})">Delete</button>
                            </div>
                        </div>
                    `).join('');
                });
        }
        
        function addContact() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Contact';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="contactName" placeholder="Name *">
                    </div>
                    <div class="form-row">
                        <input type="text" id="contactCompany" placeholder="Company/Organization">
                        <select id="contactCategory">
                            ${getAllContactCategories().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <input type="tel" id="contactPhone" placeholder="Phone">
                        <input type="email" id="contactEmail" placeholder="Email">
                    </div>
                    <div class="form-group">
                        <input type="text" id="contactAddress" placeholder="Address">
                    </div>
                    <div class="form-group">
                        <textarea id="contactNotes" placeholder="Notes" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <input type="text" id="contactTags" placeholder="Tags (comma-separated, e.g. preferred, equipment)">
                    </div>
                    <button class="btn" onclick="saveContact(); closeAddModal();">Add Contact</button>
                </div>
            `;
            modal.classList.add('show');
        }
        
        function saveContact() {
            const name = document.getElementById('contactName').value.trim();
            if (!name) {
                alert('Please enter a name');
                return;
            }
            
            fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    company: document.getElementById('contactCompany').value.trim(),
                    category: document.getElementById('contactCategory').value,
                    phone: document.getElementById('contactPhone').value.trim(),
                    email: document.getElementById('contactEmail').value.trim(),
                    address: document.getElementById('contactAddress').value.trim(),
                    notes: document.getElementById('contactNotes').value.trim(),
                    tags: document.getElementById('contactTags').value.trim()
                })
            }).then(() => loadContacts());
        }
        
        function editContact(id) {
            fetch('/api/contacts')
                .then(r => r.json())
                .then(contacts => {
                    const contact = contacts.find(c => c.id === id);
                    if (!contact) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Contact';
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <input type="text" id="contactName" placeholder="Name *" value="${contact.name}">
                            </div>
                            <div class="form-row">
                                <input type="text" id="contactCompany" placeholder="Company/Organization" value="${contact.company || ''}">
                                <select id="contactCategory">
                                    ${getAllContactCategories().map(cat => `<option value="${cat}" ${contact.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <input type="tel" id="contactPhone" placeholder="Phone" value="${contact.phone || ''}">
                                <input type="email" id="contactEmail" placeholder="Email" value="${contact.email || ''}">
                            </div>
                            <div class="form-group">
                                <input type="text" id="contactAddress" placeholder="Address" value="${contact.address || ''}">
                            </div>
                            <div class="form-group">
                                <textarea id="contactNotes" placeholder="Notes" rows="2">${contact.notes || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <input type="text" id="contactTags" placeholder="Tags (comma-separated)" value="${contact.tags || ''}">
                            </div>
                            <button class="btn" onclick="updateContact(${id}); closeAddModal();">Update Contact</button>
                        </div>
                    `;
                    modal.classList.add('show');
                });
        }
        
        function updateContact(id) {
            const name = document.getElementById('contactName').value.trim();
            if (!name) {
                alert('Please enter a name');
                return;
            }
            
            fetch(`/api/contacts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    company: document.getElementById('contactCompany').value.trim(),
                    category: document.getElementById('contactCategory').value,
                    phone: document.getElementById('contactPhone').value.trim(),
                    email: document.getElementById('contactEmail').value.trim(),
                    address: document.getElementById('contactAddress').value.trim(),
                    notes: document.getElementById('contactNotes').value.trim(),
                    tags: document.getElementById('contactTags').value.trim()
                })
            }).then(() => loadContacts());
        }
        
        async function viewContactHistory(id) {
            const [contact, history] = await Promise.all([
                fetch(`/api/contacts/${id}`).then(r => r.json()),
                fetch(`/api/contacts/${id}/history`).then(r => r.json())
            ]);
            
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            const totalSpent = history.catering.reduce((sum, c) => sum + (c.price || 0), 0);
            
            modalTitle.textContent = `${contact.name} - Customer History`;
            modalForm.innerHTML = `
                <div class="form">
                    <div style="background: var(--gray-light); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="font-size: 1.2em; font-weight: 600; margin-bottom: 5px;">Total Spent: $${totalSpent.toFixed(2)}</div>
                        <div style="color: var(--gray);">Orders: ${history.catering.length} | Events: ${history.events.length}</div>
                    </div>
                    
                    <h4 style="margin-bottom: 10px;">Catering Orders</h4>
                    ${history.catering.length === 0 ? '<div style="color: var(--gray); font-style: italic; margin-bottom: 15px;">No catering orders</div>' : history.catering.map(order => `
                        <div style="background: var(--gray-light); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                            <div style="font-weight: 600;">${order.date} - ${order.guests} guests</div>
                            <div style="font-size: 0.9em; color: var(--gray);">$${order.price.toFixed(2)} - ${order.status}</div>
                            <button class="btn" onclick="reorderCatering(${order.id})" style="margin-top: 8px; padding: 6px 12px; font-size: 0.85em; width: 100%; background: var(--orange); color: white;">Reorder</button>
                        </div>
                    `).join('')}
                    
                    <h4 style="margin: 15px 0 10px 0;">Events</h4>
                    ${history.events.length === 0 ? '<div style="color: var(--gray); font-style: italic;">No events</div>' : history.events.map(event => `
                        <div style="background: var(--gray-light); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                            <div style="font-weight: 600;">${event.name}</div>
                            <div style="font-size: 0.9em; color: var(--gray);">${event.date} - ${event.location}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            modal.classList.add('show');
        }
        
        async function reorderCatering(orderId) {
            const order = await fetch('/api/catering').then(r => r.json()).then(orders => orders.find(o => o.id === orderId));
            if (!order) return;
            
            closeAddModal();
            setTimeout(() => {
                addCateringOrder();
                setTimeout(() => {
                    document.getElementById('cateringContactId').value = order.contact_id || '';
                    document.getElementById('cateringClient').value = order.client;
                    document.getElementById('cateringGuests').value = order.guests;
                    document.getElementById('cateringLocation').value = order.location || '';
                    document.getElementById('cateringNotes').value = order.notes || '';
                    
                    const selectedMenu = JSON.parse(order.selected_menu || '[]');
                    selectedMenu.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput) qtyInput.value = item.quantity;
                        if (priceInput) priceInput.value = item.total;
                    });
                    updateNewQuoteTotal();
                }, 500);
            }, 100);
        }
        
        function deleteContact(id) {
            if (confirm('Delete this contact?')) {
                fetch(`/api/contacts/${id}`, { method: 'DELETE' })
                    .then(() => loadContacts());
            }
        }

        // Settings Functions
        function toggleSettingsSection(section) {
            const content = document.getElementById(`${section}-content`);
            const icon = document.getElementById(`${section}-icon`);
            
            if (content.classList.contains('show')) {
                content.classList.remove('show');
                icon.textContent = '▼';
            } else {
                content.classList.add('show');
                icon.textContent = '▲';
            }
        }
        
        function toggleCategorySection(section) {
            const sectionDiv = document.getElementById(`${section}-section`);
            const arrow = document.getElementById(`${section}-arrow`);
            
            if (sectionDiv.style.display === 'none') {
                sectionDiv.style.display = 'block';
                arrow.textContent = '▼';
            } else {
                sectionDiv.style.display = 'none';
                arrow.textContent = '▶';
            }
            event.stopPropagation();
        }
        
        function saveDefaultMargin() {
            const margin = document.getElementById('defaultMargin').value;
            if (margin) {
                localStorage.setItem('defaultMargin', margin);
            }
        }
        
        function loadDefaultMargin() {
            const margin = localStorage.getItem('defaultMargin') || '30';
            document.getElementById('defaultMargin').value = margin;
        }
        
        async function saveBusinessInfo() {
            const data = {
                name: 'Birria Fusion',
                phone: document.getElementById('businessPhone').value,
                email: document.getElementById('businessEmail').value,
                address: document.getElementById('businessAddress').value,
                website: document.getElementById('businessWebsite').value,
                facebook: document.getElementById('businessFacebook').value,
                instagram: document.getElementById('businessInstagram').value,
                default_margin: parseFloat(document.getElementById('defaultMargin').value) || 30
            };
            await fetch('/api/business-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            alert('Business information saved!');
        }
        
        async function loadBusinessInfo() {
            const response = await fetch('/api/business-info');
            const info = await response.json();
            document.getElementById('businessPhone').value = info.phone || '';
            document.getElementById('businessEmail').value = info.email || '';
            document.getElementById('businessAddress').value = info.address || '';
            document.getElementById('businessWebsite').value = info.website || '';
            document.getElementById('businessFacebook').value = info.facebook || '';
            document.getElementById('businessInstagram').value = info.instagram || '';
        }
        
        function loadUserProfile() {
            if (!currentUser) return;
            document.getElementById('profileName').value = currentUser.name || '';
            document.getElementById('profileUsername').value = currentUser.username || '';
        }
        
        function updateUserProfile() {
            if (!currentUser) return;
            
            const name = document.getElementById('profileName').value.trim();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!name) {
                alert('Name is required');
                return;
            }
            
            // Update name
            currentUser.name = name;
            
            // Update password if provided
            if (newPassword) {
                if (!currentPassword) {
                    alert('Please enter your current password');
                    return;
                }
                
                if (currentUser.password !== currentPassword) {
                    alert('Current password is incorrect');
                    return;
                }
                
                if (newPassword.length < 8) {
                    alert('New password must be at least 8 characters');
                    return;
                }
                
                if (newPassword !== confirmPassword) {
                    alert('New passwords do not match');
                    return;
                }
                
                currentUser.password = newPassword;
            }
            
            // Update in localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            alert('Profile updated successfully!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        }
        
        function clearData() {
            if (confirm('This will delete ALL data. Are you sure?')) {
                localStorage.clear();
                alert('Data cleared! Please refresh the page.');
            }
        }

