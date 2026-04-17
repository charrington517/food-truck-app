        // Tools Functions
        function addTool() {
            const name = document.getElementById('toolName').value;
            const category = document.getElementById('toolCategory').value;
            const status = document.getElementById('toolStatus').value;
            
            if (!name) {
                alert('Please enter tool name');
                return;
            }
            
            const tools = JSON.parse(localStorage.getItem('tools') || '[]');
            tools.push({ id: Date.now(), name, category, status });
            localStorage.setItem('tools', JSON.stringify(tools));
            
            document.getElementById('toolName').value = '';
            loadTools();
        }
        
        function loadTools() {
            fetch('/api/equipment-tracking')
                .then(r => r.json())
                .then(equipment => {
                    const rentals = equipment.filter(e => e.status === 'Rented');
                    if (rentals.length === 0) {
                        document.getElementById('toolsList').innerHTML = '<div class="card" style="text-align: center; color: var(--gray);"><div class="card-title">No rental equipment</div><div class="card-meta">Add equipment with "Rented" status to track rentals</div></div>';
                        return;
                    }
                    document.getElementById('toolsList').innerHTML = rentals.map(tool => `
                        <div class="card">
                            <div onclick="toggleRentalCard(${tool.id})" style="cursor: pointer;">
                                <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                    ${tool.equipment_name}
                                    <span id="rental-icon-${tool.id}">▼</span>
                                </div>
                                <div class="card-meta">${tool.location || 'No location'}</div>
                                <div class="card-meta">Last updated: ${new Date(tool.last_updated).toLocaleDateString()}</div>
                            </div>
                            <div id="rental-details-${tool.id}" style="display: none;">
                                ${tool.notes ? `<div class="card-meta" style="font-style: italic; white-space: pre-line; margin-top: 10px;">${tool.notes}</div>` : ''}
                                <div class="card-actions">
                                    <button class="btn" onclick="event.stopPropagation(); editRentalEquipment(${tool.id})" style="background: var(--orange); color: white;">Update</button>
                                    <button class="btn" onclick="event.stopPropagation(); returnRentalEquipment(${tool.id})" style="background: var(--success); color: white;">Return</button>
                                </div>
                            </div>
                        </div>
                    `).join('');
                });
        }
        
        function addRentalEquipment() {
            Promise.all([
                fetch('/api/equipment-tracking').then(r => r.json()),
                fetch('/api/catering').then(r => r.json()),
                fetch('/api/contacts').then(r => r.json())
            ]).then(([equipment, catering, contacts]) => {
                const available = equipment.filter(e => e.status !== 'Rented');
                const upcomingCatering = catering.filter(c => new Date(c.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
                
                const modal = document.getElementById('addModal');
                const modalTitle = document.getElementById('modalTitle');
                const modalForm = document.getElementById('modalForm');
                
                modalTitle.textContent = 'Rent Equipment';
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <label>Select Equipment</label>
                                <select id="rentalEquipmentId" onchange="updateRentalQuantityMax()">
                                    <option value="">Choose equipment...</option>
                                    ${available.map(e => `<option value="${e.id}" data-qty="${e.quantity_available || 1}">${e.equipment_name} (${e.quantity_available || 1} available)</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Quantity to Rent</label>
                                <input type="number" id="rentalQuantity" min="1" max="1" value="1">
                            </div>
                            <div class="form-group">
                                <label>Link to Client</label>
                                <select id="rentalClientSelect" onchange="updateRentalClientInfo()">
                                    <option value="">-- Select or Enter New Client --</option>
                                    <optgroup label="Catering Events">
                                        ${upcomingCatering.map(c => `<option value="catering-${c.id}" data-client="${c.client}" data-purpose="${c.location || ''}" data-date="${c.date}">${c.client} - ${c.date} (${c.guests} guests)</option>`).join('')}
                                    </optgroup>
                                    <optgroup label="Contacts">
                                        ${contacts.map(c => `<option value="contact-${c.id}" data-client="${c.name}" data-company="${c.company || ''}">${c.name}${c.company ? ' - ' + c.company : ''}</option>`).join('')}
                                    </optgroup>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Client Name</label>
                                <input type="text" id="rentalClient" placeholder="Client name">
                            </div>
                            <div class="form-group">
                                <label>Event/Purpose</label>
                                <input type="text" id="rentalPurpose" placeholder="e.g., Wedding, Festival">
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Rental Date</label>
                                    <input type="date" id="rentalDate">
                                </div>
                                <div style="flex: 1;">
                                    <label>Return Date</label>
                                    <input type="date" id="returnDate">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Additional Notes</label>
                                <textarea id="rentalNotes" placeholder="Cost, deposit, condition..." rows="2"></textarea>
                            </div>
                            <button class="btn" onclick="saveRentalEquipment(); closeAddModal();">Rent Out</button>
                        </div>
                    `;
                    modal.classList.add('show');
            });
        }
        
        function updateRentalClientInfo() {
            const select = document.getElementById('rentalClientSelect');
            const option = select.options[select.selectedIndex];
            const clientInput = document.getElementById('rentalClient');
            const purposeInput = document.getElementById('rentalPurpose');
            const dateInput = document.getElementById('rentalDate');
            
            if (option.value) {
                clientInput.value = option.getAttribute('data-client') || '';
                purposeInput.value = option.getAttribute('data-purpose') || option.getAttribute('data-company') || '';
                if (option.getAttribute('data-date')) {
                    dateInput.value = option.getAttribute('data-date');
                }
            } else {
                clientInput.value = '';
                purposeInput.value = '';
            }
        }
        
        function updateRentalQuantityMax() {
            const select = document.getElementById('rentalEquipmentId');
            const qtyInput = document.getElementById('rentalQuantity');
            const selectedOption = select.options[select.selectedIndex];
            const maxQty = parseInt(selectedOption.getAttribute('data-qty')) || 1;
            qtyInput.max = maxQty;
            qtyInput.value = Math.min(parseInt(qtyInput.value) || 1, maxQty);
        }
        
        function saveRentalEquipment() {
            const equipmentId = document.getElementById('rentalEquipmentId').value;
            const clientSelect = document.getElementById('rentalClientSelect').value;
            const client = document.getElementById('rentalClient').value.trim();
            const purpose = document.getElementById('rentalPurpose').value.trim();
            const rentalDate = document.getElementById('rentalDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const notes = document.getElementById('rentalNotes').value.trim();
            const rentalQty = parseInt(document.getElementById('rentalQuantity').value) || 1;
            
            if (!equipmentId || !client) {
                alert('Please select equipment and enter client name');
                return;
            }
            
            let catering_id = null;
            let contact_id = null;
            if (clientSelect.startsWith('catering-')) {
                catering_id = parseInt(clientSelect.replace('catering-', ''));
            } else if (clientSelect.startsWith('contact-')) {
                contact_id = parseInt(clientSelect.replace('contact-', ''));
            }
            
            fetch('/api/equipment-tracking')
                .then(r => r.json())
                .then(equipment => {
                    const item = equipment.find(e => e.id == equipmentId);
                    if (!item) return;
                    
                    const newAvailable = (item.quantity_available || 1) - rentalQty;
                    
                    fetch(`/api/equipment-tracking/${equipmentId}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            location: item.location,
                            status: item.status,
                            notes: item.notes,
                            quantity_available: newAvailable
                        })
                    }).then(() => {
                        const rentalNotes = `Client: ${client}\nEvent: ${purpose || 'N/A'}\nRental: ${rentalDate || 'N/A'} to ${returnDate || 'N/A'}\nQuantity: ${rentalQty}\n${notes}`;
                        
                        fetch('/api/equipment-tracking', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                equipment_name: `${item.equipment_name} - ${client}`,
                                qr_code: `RENTAL-${Date.now()}`,
                                location: client,
                                status: 'Rented',
                                notes: rentalNotes,
                                quantity_total: rentalQty,
                                quantity_available: 0,
                                catering_id: catering_id,
                                contact_id: contact_id
                            })
                        }).then(() => { loadTools(); if(typeof loadEquipmentTracking === 'function') loadEquipmentTracking(); });
                    });
                });
        }
        
        function editRentalEquipment(equipmentId) {
            fetch('/api/equipment-tracking')
                .then(r => r.json())
                .then(equipment => {
                    const item = equipment.find(e => e.id == equipmentId);
                    if (!item) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Update Rental: ' + item.equipment_name;
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <label>Rented To</label>
                                <input type="text" id="rentalLocation" value="${item.location || ''}">
                            </div>
                            <div class="form-group">
                                <label>Notes</label>
                                <textarea id="rentalNotes" rows="3">${item.notes || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <button class="btn" onclick="updateRentalEquipment(${equipmentId}); closeAddModal();" style="flex: 1;">Update</button>
                                <button class="btn" onclick="returnRentalEquipment(${equipmentId}); closeAddModal();" style="flex: 1; background: var(--success);">Mark Returned</button>
                            </div>
                        </div>
                    `;
                    modal.classList.add('show');
                });
        }
        
        function updateRentalEquipment(equipmentId) {
            const location = document.getElementById('rentalLocation').value.trim();
            const notes = document.getElementById('rentalNotes').value.trim();
            
            fetch(`/api/equipment-tracking/${equipmentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    location: location,
                    status: 'Rented',
                    notes: notes
                })
            }).then(() => { loadTools(); if(typeof loadEquipmentTracking === 'function') loadEquipmentTracking(); });
        }
        
        function toggleRentalCard(id) {
            const details = document.getElementById(`rental-details-${id}`);
            const icon = document.getElementById(`rental-icon-${id}`);
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function returnRentalEquipment(equipmentId) {
            if (confirm('Mark this equipment as returned?')) {
                fetch('/api/equipment-tracking')
                    .then(r => r.json())
                    .then(equipment => {
                        const rental = equipment.find(e => e.id == equipmentId);
                        if (!rental) return;
                        
                        const baseName = rental.equipment_name.split(' - ')[0];
                        const originalEquipment = equipment.find(e => e.equipment_name === baseName && e.status !== 'Rented');
                        
                        if (originalEquipment) {
                            const restoredQty = (originalEquipment.quantity_available || 0) + (rental.quantity_total || 1);
                            fetch(`/api/equipment-tracking/${originalEquipment.id}`, {
                                method: 'PUT',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ quantity_available: restoredQty })
                            });
                        }
                        
                        fetch(`/api/equipment-tracking/${equipmentId}`, { method: 'DELETE' })
                            .then(() => { loadTools(); if(typeof loadEquipmentTracking === 'function') loadEquipmentTracking(); });
                    });
            }
        }
        
        function deleteRentalEquipment(equipmentId) {
            if (confirm('Remove this rental?')) {
                returnRentalEquipment(equipmentId);
            }
        }
        
