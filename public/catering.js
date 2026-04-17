        // Catering Functions
        function addCateringOrder() {
            Promise.all([
                fetch('/api/menu').then(r => r.json()),
                fetch('/api/contacts').then(r => r.json())
            ]).then(([menuItems, contacts]) => {
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    
                    modalTitle.textContent = 'Add Catering Order & Quote';
                    modalForm.innerHTML = `
                        <div class="form">
                            <h4 style="margin-bottom: 10px;">Client Information</h4>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Link to Contact (optional):</label>
                                <select id="cateringContactId" onchange="fillContactInfo()">
                                    <option value="">Select existing contact or enter new...</option>
                                    ${contacts.map(c => `<option value="${c.id}">${c.name}${c.company ? ' - ' + c.company : ''}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Client Name:</label>
                                    <input type="text" id="cateringClient" placeholder="Client Name">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Date:</label>
                                    <input type="date" id="cateringDate">
                                </div>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Number of Guests:</label>
                                    <input type="number" id="cateringGuests" placeholder="Number of Guests" min="1">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Status:</label>
                                    <select id="cateringStatus">
                                        <option value="Inquiry">Inquiry</option>
                                        <option value="Quote Sent">Quote Sent</option>
                                        <option value="Booked">Booked</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Location:</label>
                                <input type="text" id="cateringLocation" placeholder="Event Location">
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Setup Time (hours):</label>
                                    <input type="number" id="setupTime" placeholder="Setup Time (hours)" step="0.5" min="0">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Start Time:</label>
                                    <input type="time" id="eventStartTime" placeholder="Event Start Time">
                                </div>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event End Time:</label>
                                    <input type="time" id="eventEndTime" placeholder="Event End Time">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Deposit ($):</label>
                                    <input type="number" id="cateringDeposit" placeholder="Deposit ($)" step="0.01" min="0">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Payment Status:</label>
                                <select id="paymentStatus">
                                    <option value="Deposit Needed">Deposit Needed</option>
                                    <option value="Deposit Paid">Deposit Paid</option>
                                    <option value="Partial Payment">Partial Payment</option>
                                    <option value="Paid in Full">Paid in Full</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Notes (shown on PDF):</label>
                                <textarea id="cateringNotes" placeholder="Special requests, dietary restrictions, etc..." rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Personal Notes (internal only):</label>
                                <textarea id="personalNotes" placeholder="Internal notes, reminders, etc..." rows="2"></textarea>
                            </div>
                            
                            <h4 style="margin: 20px 0 10px 0;">Menu Items</h4>
                            <div id="menuSelection" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border); padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                                ${menuItems.map(item => {
                                    const suggestedPrice = item.cost / (1 - defaultMargin / 100);
                                    return `
                                    <div style="background: var(--white); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <h4 style="margin: 0; color: var(--charcoal);">${item.name}</h4>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <input type="number" id="qty-${item.id}" min="0" value="0" style="width: 60px; padding: 6px; text-align: center; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()" placeholder="0">
                                                <span style="font-weight: 500; font-size: 0.9em;">servings</span>
                                            </div>
                                        </div>
                                        <div id="cost-display-${item.id}" style="display: none; background: var(--gray-light); padding: 6px; border-radius: 4px; margin-bottom: 6px; font-size: 0.85em;">
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                                <div>Food Cost: <strong style="color: var(--orange);">$<span id="total-cost-${item.id}">0.00</span></strong></div>
                                                <div>Suggested: <strong style="color: var(--green);">$<span id="suggested-price-${item.id}">0.00</span></strong></div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <label style="font-weight: 500; font-size: 0.9em;">Your Price: $</label>
                                            <input type="number" id="price-${item.id}" step="0.01" min="0" value="0" style="flex: 1; padding: 6px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                            
                            <h4 style="margin-bottom: 10px;">Additional Services</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                <div>
                                    <label style="font-weight: 500; display: block; margin-bottom: 5px;">Service Type:</label>
                                    <select id="serviceType" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;">
                                        <option value="Delivery">Delivery Only</option>
                                        <option value="On-Premise">On-Premise Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-weight: 500; display: block; margin-bottom: 5px;">Number of Staff:</label>
                                    <input type="number" id="staffCount" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                                </div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Staff Cost: $</label>
                                <input type="number" id="staffCost" step="0.01" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                            </div>
                            
                            <h4 style="margin: 20px 0 10px 0;">Equipment</h4>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Provided By:</label>
                                <select id="equipmentProvider" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="toggleEquipmentCost()">
                                    <option value="Birria Fusion">Birria Fusion</option>
                                    <option value="Client Provides">Client Provides</option>
                                    <option value="Third-Party Rental">Third-Party Rental</option>
                                </select>
                            </div>
                            <div id="equipmentCostSection" style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Cost: $</label>
                                <input type="number" id="equipmentCost" step="0.01" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                            </div>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Notes (optional):</label>
                                <textarea id="equipmentNotes" rows="2" placeholder="List specific equipment items..." style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;"></textarea>
                            </div>
                            
                            <div style="text-align: right; margin-bottom: 15px; font-weight: bold; font-size: 1.1em; border-top: 2px solid var(--orange); padding-top: 10px; margin-top: 10px;">
                                Total: $<span id="newQuoteTotal">0.00</span>
                            </div>
                            <button class="btn" onclick="saveCateringOrderWithQuote(); closeAddModal();">Add Catering Order</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function updateNewQuoteTotal() {
            fetch('/api/menu')
                .then(r => r.json())
                .then(menuItems => {
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    let total = 0;
                    menuItems.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput && priceInput) {
                            const qty = parseInt(qtyInput.value) || 0;
                            const totalPrice = parseFloat(priceInput.value) || 0;
                            const totalCostSpan = document.getElementById(`total-cost-${item.id}`);
                            const suggestedPriceSpan = document.getElementById(`suggested-price-${item.id}`);
                            const costDisplay = document.getElementById(`cost-display-${item.id}`);
                            
                            if (qty > 0) {
                                const totalFoodCost = qty * item.cost;
                                const suggestedPrice = item.cost / (1 - defaultMargin / 100);
                                const totalSuggestedPrice = qty * suggestedPrice;
                                if (totalCostSpan) totalCostSpan.textContent = totalFoodCost.toFixed(2);
                                if (suggestedPriceSpan) suggestedPriceSpan.textContent = totalSuggestedPrice.toFixed(2);
                                if (costDisplay) costDisplay.style.display = 'block';
                                total += totalPrice;
                            } else {
                                if (costDisplay) costDisplay.style.display = 'none';
                            }
                        }
                    });
                    const staffCost = parseFloat(document.getElementById('staffCost')?.value || 0);
                    const equipmentCost = parseFloat(document.getElementById('equipmentCost')?.value || 0);
                    const grandTotal = total + staffCost + equipmentCost;
                    document.getElementById('newQuoteTotal').textContent = grandTotal.toFixed(2);
                });
        }
        
        function toggleEquipmentCost() {
            const provider = document.getElementById('equipmentProvider')?.value;
            const costSection = document.getElementById('equipmentCostSection');
            if (costSection) {
                costSection.style.display = provider === 'Client Provides' ? 'none' : 'block';
                if (provider === 'Client Provides') {
                    document.getElementById('equipmentCost').value = 0;
                    updateNewQuoteTotal();
                }
            }
        }
        
        async function fillContactInfo() {
            const contactId = document.getElementById('cateringContactId').value;
            if (!contactId) return;
            
            const contacts = await fetch('/api/contacts').then(r => r.json());
            const contact = contacts.find(c => c.id == contactId);
            if (contact) {
                document.getElementById('cateringClient').value = contact.name;
            }
        }
        
        function saveCateringOrderWithQuote() {
            const contactId = document.getElementById('cateringContactId')?.value || null;
            const client = document.getElementById('cateringClient')?.value.trim() || '';
            const date = document.getElementById('cateringDate')?.value || '';
            const guests = parseInt(document.getElementById('cateringGuests')?.value) || 0;
            const status = document.getElementById('cateringStatus')?.value || 'Inquiry';
            const location = document.getElementById('cateringLocation')?.value || '';
            const setupTime = parseFloat(document.getElementById('setupTime')?.value) || 0;
            const eventStartTime = document.getElementById('eventStartTime')?.value || '';
            const eventEndTime = document.getElementById('eventEndTime')?.value || '';
            const deposit = parseFloat(document.getElementById('cateringDeposit')?.value) || 0;
            const notes = document.getElementById('cateringNotes')?.value || '';
            const personalNotes = document.getElementById('personalNotes')?.value || '';
            const serviceType = document.getElementById('serviceType')?.value || 'Delivery';
            const staffCount = parseInt(document.getElementById('staffCount')?.value) || 0;
            const staffCost = parseFloat(document.getElementById('staffCost')?.value) || 0;
            const equipmentProvider = document.getElementById('equipmentProvider')?.value || 'Birria Fusion';
            const equipmentCost = parseFloat(document.getElementById('equipmentCost')?.value) || 0;
            const equipmentNotes = document.getElementById('equipmentNotes')?.value || '';
            const paymentStatus = document.getElementById('paymentStatus')?.value || 'Deposit Needed';
            
            if (!client || !date || !guests) {
                alert('Please fill in client name, date, and number of guests');
                return;
            }
            
            fetch('/api/menu')
                .then(r => r.json())
                .then(menuItems => {
                    const selectedMenu = [];
                    let totalPrice = 0;
                    
                    menuItems.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput && priceInput) {
                            const qty = parseInt(qtyInput.value) || 0;
                            const totalItemPrice = parseFloat(priceInput.value) || 0;
                            if (qty > 0) {
                                selectedMenu.push({
                                    id: item.id,
                                    name: item.name,
                                    price: totalItemPrice / qty,
                                    totalPrice: totalItemPrice,
                                    foodCost: item.cost,
                                    quantity: qty,
                                    total: totalItemPrice
                                });
                                totalPrice += totalItemPrice;
                            }
                        }
                    });
                    
                    const grandTotal = totalPrice + staffCost + equipmentCost;
                    
                    return fetch('/api/catering', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contact_id: contactId,
                            client,
                            date,
                            guests,
                            status,
                            price: grandTotal,
                            deposit,
                            setup_time: setupTime,
                            selected_menu: JSON.stringify(selectedMenu),
                            service_type: serviceType,
                            staff_count: staffCount,
                            staff_cost: staffCost,
                            notes,
                            location,
                            event_start_time: eventStartTime,
                            event_end_time: eventEndTime,
                            equipment_provider: equipmentProvider,
                            equipment_cost: equipmentCost,
                            equipment_notes: equipmentNotes,
                            payment_status: paymentStatus,
                            personal_notes: personalNotes
                        })
                    });
                })
                .then(() => loadCatering());
        }
        
        function saveCateringOrder() {
            const client = document.getElementById('cateringClient')?.value.trim() || '';
            const date = document.getElementById('cateringDate')?.value || '';
            const guests = parseInt(document.getElementById('cateringGuests')?.value) || 0;
            const status = document.getElementById('cateringStatus')?.value || 'Inquiry';
            const location = document.getElementById('cateringLocation')?.value || '';
            const time = document.getElementById('cateringTime')?.value || '';
            const setupTime = parseFloat(document.getElementById('setupTime')?.value) || 0;
            const deposit = parseFloat(document.getElementById('cateringDeposit')?.value) || 0;
            const notes = document.getElementById('cateringNotes')?.value || '';
            const personalNotes = document.getElementById('personalNotes')?.value || '';
            
            if (!client || !date || !guests) {
                alert('Please fill in client name, date, and number of guests');
                return;
            }
            
            fetch('/api/catering', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client, date, guests, status, price: 0, deposit, setup_time: setupTime, notes, personal_notes: personalNotes })
            }).then(() => loadCatering());
        }
        
        function loadCatering() {
            fetch('/api/catering')
                .then(r => r.json())
                .then(orders => {
            const today = new Date().toISOString().split('T')[0];
            
            // Calculate stats
            const upcomingOrders = orders.filter(o => o.date >= today && o.status === 'Booked').length;
            const bookedOrders = orders.filter(o => o.status === 'Booked').length;
            const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.price || 0), 0);
            const pendingQuotes = orders.filter(o => o.status === 'Quote Sent').length;
            
            document.getElementById('cateringStats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${upcomingOrders}</div>
                    <div class="stat-label">Upcoming Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${bookedOrders}</div>
                    <div class="stat-label">Booked Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${totalRevenue.toFixed(0)}</div>
                    <div class="stat-label">Total Revenue</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: ${pendingQuotes > 0 ? 'var(--warning)' : 'var(--success)'}">${pendingQuotes}</div>
                    <div class="stat-label">Pending Quotes</div>
                </div>
            `;
            
            // Show orders sorted by date
            const sortedOrders = orders.sort((a, b) => new Date(a.date) - new Date(b.date));
            document.getElementById('cateringList').innerHTML = sortedOrders.map(order => {
                const statusColors = {
                    'Inquiry': '#6c757d',
                    'Quote Sent': '#ffc107',
                    'Booked': '#28a745',
                    'Completed': '#17a2b8',
                    'Cancelled': '#dc3545'
                };
                
                return `
                    <div class="card" style="border-left: 4px solid ${order.service_type === 'On-Premise' ? '#17a2b8' : '#ff6b35'};">
                        <div class="card-header" onclick="toggleCateringDetails(${order.id})" style="cursor: pointer;">
                            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${order.client}</span>
                                <div style="display: flex; gap: 8px;">
                                    ${order.status === 'Booked' || order.status === 'Completed' ? `<span style="background: ${order.payment_status === 'Paid in Full' ? '#28a745' : order.payment_status === 'Deposit Paid' ? '#ffc107' : order.payment_status === 'Partial Payment' ? '#17a2b8' : '#dc3545'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold;">${order.payment_status || 'Deposit Needed'}</span>` : ''}
                                    <span style="color: ${statusColors[order.status]}; font-size: 0.8em; font-weight: bold;">${order.status}</span>
                                </div>
                            </div>
                            <div class="card-meta">${order.date} • ${order.guests} guests${order.price > 0 ? ` • $${order.price.toFixed(2)}` : ''}</div>
                            ${order.location ? `<div class="card-meta">${order.location}</div>` : ''}
                        </div>
                        <div class="card-details" id="catering-details-${order.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); overflow-wrap: break-word; word-wrap: break-word;">
                            ${order.event_start_time || order.event_end_time ? `<div class="card-meta">Event: ${order.event_start_time || 'TBD'} - ${order.event_end_time || 'TBD'}${order.setup_time > 0 ? ` (${order.setup_time}hr setup)` : ''}</div>` : order.setup_time > 0 ? `<div class="card-meta">Setup: ${order.setup_time} hours</div>` : ''}
                            ${order.service_type || order.staff_count > 0 ? `<div class="card-meta">${order.service_type || ''}${order.service_type && order.staff_count > 0 ? ' • ' : ''}${order.staff_count > 0 ? `${order.staff_count} staff - $${order.staff_cost.toFixed(2)}` : ''}</div>` : ''}
                            ${order.equipment_provider ? `<div class="card-meta">Equipment: ${order.equipment_provider}${order.equipment_cost > 0 ? ` - $${order.equipment_cost.toFixed(2)}` : ''}${order.equipment_notes ? ` (${order.equipment_notes})` : ''}</div>` : ''}
                            ${order.deposit > 0 || (order.status === 'Booked' || order.status === 'Completed') ? `<div class="card-meta">Payment: ${order.payment_status || 'Deposit Needed'}${order.deposit > 0 ? ` - $${order.deposit.toFixed(2)} deposit` : ''}</div>` : ''}
                            ${(() => {
                                let selectedMenu = [];
                                if (order.selected_menu) {
                                    try {
                                        selectedMenu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
                                    } catch(e) {}
                                }
                                if (selectedMenu && selectedMenu.length > 0) {
                                    return `<div class="card-meta" style="margin-top: 8px;"><strong>Menu Items:</strong><ul style="margin: 5px 0 0 20px;">${selectedMenu.map(item => `<li>${item.name} (${item.quantity} servings) - $${(item.total || item.totalPrice).toFixed(2)}</li>`).join('')}</ul></div>`;
                                }
                                return '';
                            })()}
                            ${order.notes ? `<div class="card-meta" style="font-style: italic; margin-top: 8px;">Event Notes: ${order.notes}</div>` : ''}
                            ${order.personal_notes ? `<div class="card-meta" style="font-style: italic; margin-top: 8px; color: #6c757d;">Personal Notes: ${order.personal_notes}</div>` : ''}
                            <div class="card-actions" style="margin-top: 10px;">
                                <button class="btn" onclick="editCateringOrder(${order.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn" onclick="printCateringDetails(${order.id})" style="background: #666; color: white;">Print</button>
                                <button class="btn" onclick="exportCateringPDF(${order.id})" style="background: var(--warning); color: white;">Quote</button>
                                <button class="btn" onclick="exportCateringInvoice(${order.id})" style="background: #17a2b8; color: white;">Invoice</button>
                                <button class="btn" onclick="updateCateringStatus(${order.id})" style="background: var(--success); color: white;">Status</button>
                                <button class="btn" onclick="openNotesModal('catering', ${order.id}, '${order.client.replace(/'/g, "\\'")}')" style="background: #666; color: white;">Notes</button>
                                <button class="btn" onclick="archiveCateringOrder(${order.id})" style="background: #6c757d; color: white;">Archive</button>
                                <button class="btn btn-danger" onclick="deleteCateringOrder(${order.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
                });
        }
        
        function toggleCateringDetails(id) {
            const details = document.getElementById(`catering-details-${id}`);
            
            if (details.style.display === 'none') {
                details.style.display = 'block';
            } else {
                details.style.display = 'none';
            }
        }
        
        function editCateringOrder(id) {
            let currentOrder;
            Promise.all([
                fetch('/api/catering').then(r => r.json()),
                fetch('/api/menu').then(r => r.json()),
                fetch('/api/contacts').then(r => r.json())
            ]).then(([orders, menuItems, contacts]) => {
                currentOrder = orders.find(o => o.id === id);
                if (!currentOrder) return;
                    const order = currentOrder;
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Catering Order & Quote';
                    modalForm.innerHTML = `
                        <div class="form">
                            <h4 style="margin-bottom: 10px;">Client Information</h4>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Link to Contact (optional):</label>
                                <select id="cateringContactId" onchange="fillContactInfo()">
                                    <option value="">Select existing contact or enter new...</option>
                                    ${contacts.map(c => `<option value="${c.id}" ${c.id == order.contact_id ? 'selected' : ''}>${c.name}${c.company ? ' - ' + c.company : ''}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Client Name:</label>
                                    <input type="text" id="cateringClient" placeholder="Client Name" value="${order.client}">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Date:</label>
                                    <input type="date" id="cateringDate" value="${order.date}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Number of Guests:</label>
                                    <input type="number" id="cateringGuests" placeholder="Number of Guests" min="1" value="${order.guests}">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Status:</label>
                                    <select id="cateringStatus">
                                        <option value="Inquiry" ${order.status === 'Inquiry' ? 'selected' : ''}>Inquiry</option>
                                        <option value="Quote Sent" ${order.status === 'Quote Sent' ? 'selected' : ''}>Quote Sent</option>
                                        <option value="Booked" ${order.status === 'Booked' ? 'selected' : ''}>Booked</option>
                                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Location:</label>
                                <input type="text" id="cateringLocation" placeholder="Event Location" value="${order.location || ''}">
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Setup Time (hours):</label>
                                    <input type="number" id="setupTime" placeholder="Setup Time (hours)" step="0.5" min="0" value="${order.setup_time || 0}">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Start Time:</label>
                                    <input type="time" id="eventStartTime" placeholder="Event Start Time" value="${order.event_start_time || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event End Time:</label>
                                    <input type="time" id="eventEndTime" placeholder="Event End Time" value="${order.event_end_time || ''}">
                                </div>
                                <div style="flex: 1;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Deposit ($):</label>
                                    <input type="number" id="cateringDeposit" placeholder="Deposit ($)" step="0.01" min="0" value="${order.deposit || 0}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Payment Status:</label>
                                <select id="paymentStatus">
                                    <option value="Deposit Needed" ${(order.payment_status || 'Deposit Needed') === 'Deposit Needed' ? 'selected' : ''}>Deposit Needed</option>
                                    <option value="Deposit Paid" ${order.payment_status === 'Deposit Paid' ? 'selected' : ''}>Deposit Paid</option>
                                    <option value="Partial Payment" ${order.payment_status === 'Partial Payment' ? 'selected' : ''}>Partial Payment</option>
                                    <option value="Paid in Full" ${order.payment_status === 'Paid in Full' ? 'selected' : ''}>Paid in Full</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Event Notes (shown on PDF):</label>
                                <textarea id="cateringNotes" placeholder="Special requests, dietary restrictions, etc..." rows="2">${order.notes || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--charcoal);">Personal Notes (internal only):</label>
                                <textarea id="editPersonalNotes" placeholder="Internal notes, reminders, etc..." rows="2">${order.personal_notes || ''}</textarea>
                            </div>
                            
                            <h4 style="margin: 20px 0 10px 0;">Menu Items</h4>
                            <div id="menuSelection" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border); padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                                ${menuItems.map(item => {
                                    const suggestedPrice = item.cost / (1 - defaultMargin / 100);
                                    return `
                                    <div style="background: var(--white); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <h4 style="margin: 0; color: var(--charcoal);">${item.name}</h4>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <input type="number" id="qty-${item.id}" min="0" value="0" style="width: 60px; padding: 6px; text-align: center; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()" placeholder="0">
                                                <span style="font-weight: 500; font-size: 0.9em;">servings</span>
                                            </div>
                                        </div>
                                        <div id="cost-display-${item.id}" style="display: none; background: var(--gray-light); padding: 6px; border-radius: 4px; margin-bottom: 6px; font-size: 0.85em;">
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                                <div>Food Cost: <strong style="color: var(--orange);">$<span id="total-cost-${item.id}">0.00</span></strong></div>
                                                <div>Suggested: <strong style="color: var(--green);">$<span id="suggested-price-${item.id}">0.00</span></strong></div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <label style="font-weight: 500; font-size: 0.9em;">Your Price: $</label>
                                            <input type="number" id="price-${item.id}" step="0.01" min="0" value="0" style="flex: 1; padding: 6px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                            
                            <h4 style="margin-bottom: 10px;">Additional Services</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                <div>
                                    <label style="font-weight: 500; display: block; margin-bottom: 5px;">Service Type:</label>
                                    <select id="serviceType" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;">
                                        <option value="Delivery">Delivery Only</option>
                                        <option value="On-Premise">On-Premise Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-weight: 500; display: block; margin-bottom: 5px;">Number of Staff:</label>
                                    <input type="number" id="staffCount" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                                </div>
                            </div>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Staff Cost: $</label>
                                <input type="number" id="staffCost" step="0.01" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                            </div>
                            
                            <h4 style="margin: 20px 0 10px 0;">Equipment</h4>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Provided By:</label>
                                <select id="equipmentProvider" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="toggleEquipmentCost()">
                                    <option value="Birria Fusion">Birria Fusion</option>
                                    <option value="Client Provides">Client Provides</option>
                                    <option value="Third-Party Rental">Third-Party Rental</option>
                                </select>
                            </div>
                            <div id="equipmentCostSection" style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Cost: $</label>
                                <input type="number" id="equipmentCost" step="0.01" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateNewQuoteTotal()">
                            </div>
                            <div style="margin-bottom: 12px;">
                                <label style="font-weight: 500; display: block; margin-bottom: 5px;">Equipment Notes (optional):</label>
                                <textarea id="equipmentNotes" rows="2" placeholder="List specific equipment items..." style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;"></textarea>
                            </div>
                            
                            <div style="text-align: right; margin-bottom: 15px; font-weight: bold; font-size: 1.1em; border-top: 2px solid var(--orange); padding-top: 10px; margin-top: 10px;">
                                Total: $<span id="newQuoteTotal">0.00</span>
                            </div>
                            <button class="btn" onclick="updateCateringOrderWithQuote(${id});">Update Catering Order</button>
                        </div>
                    `;
                    
                    // Load existing menu items
                    let selectedMenu = [];
                    if (order.selected_menu) {
                        selectedMenu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
                    }
                    
                    if (selectedMenu && selectedMenu.length > 0) {
                        selectedMenu.forEach(menuItem => {
                            const qtyInput = document.getElementById(`qty-${menuItem.id}`);
                            const priceInput = document.getElementById(`price-${menuItem.id}`);
                            if (qtyInput) qtyInput.value = menuItem.quantity;
                            if (priceInput) priceInput.value = menuItem.totalPrice || menuItem.total;
                        });
                    }
                    
                    // Load service details
                    document.getElementById('serviceType').value = order.service_type || 'Delivery';
                    document.getElementById('staffCount').value = order.staff_count || 0;
                    document.getElementById('staffCost').value = order.staff_cost || 0;
                    
                    // Load equipment details
                    document.getElementById('equipmentProvider').value = order.equipment_provider || 'Birria Fusion';
                    document.getElementById('equipmentCost').value = order.equipment_cost || 0;
                    document.getElementById('equipmentNotes').value = order.equipment_notes || '';
                    toggleEquipmentCost();
                    
                    updateNewQuoteTotal();
                    modal.classList.add('show');
                });
        }
        
        function updateCateringOrderWithQuote(id) {
            const contactId = document.getElementById('cateringContactId')?.value || null;
            const client = document.getElementById('cateringClient')?.value.trim() || '';
            const date = document.getElementById('cateringDate')?.value || '';
            const guests = parseInt(document.getElementById('cateringGuests')?.value) || 0;
            const status = document.getElementById('cateringStatus')?.value || 'Inquiry';
            const location = document.getElementById('cateringLocation')?.value || '';
            const setupTime = parseFloat(document.getElementById('setupTime')?.value) || 0;
            const eventStartTime = document.getElementById('eventStartTime')?.value || '';
            const eventEndTime = document.getElementById('eventEndTime')?.value || '';
            const deposit = parseFloat(document.getElementById('cateringDeposit')?.value) || 0;
            const notes = document.getElementById('cateringNotes')?.value || '';
            const personalNotes = document.getElementById('editPersonalNotes')?.value || '';
            const serviceType = document.getElementById('serviceType')?.value || 'Delivery';
            const staffCount = parseInt(document.getElementById('staffCount')?.value) || 0;
            const staffCost = parseFloat(document.getElementById('staffCost')?.value) || 0;
            const equipmentProvider = document.getElementById('equipmentProvider')?.value || 'Birria Fusion';
            const paymentStatus = document.getElementById('paymentStatus')?.value || 'Deposit Needed';
            const equipmentCost = parseFloat(document.getElementById('equipmentCost')?.value) || 0;
            const equipmentNotes = document.getElementById('equipmentNotes')?.value || '';
            
            if (!client || !date || !guests) {
                alert('Please fill in client name, date, and number of guests');
                return;
            }
            
            fetch('/api/menu')
                .then(r => r.json())
                .then(menuItems => {
                    const selectedMenu = [];
                    let totalPrice = 0;
                    
                    menuItems.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput && priceInput) {
                            const qty = parseInt(qtyInput.value) || 0;
                            const totalItemPrice = parseFloat(priceInput.value) || 0;
                            if (qty > 0) {
                                selectedMenu.push({
                                    id: item.id,
                                    name: item.name,
                                    price: totalItemPrice / qty,
                                    totalPrice: totalItemPrice,
                                    foodCost: item.cost,
                                    quantity: qty,
                                    total: totalItemPrice
                                });
                                totalPrice += totalItemPrice;
                            }
                        }
                    });
                    
                    const grandTotal = totalPrice + staffCost + equipmentCost;
                    
                    return fetch(`/api/catering/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contact_id: contactId,
                            client,
                            date,
                            guests,
                            status,
                            price: grandTotal,
                            deposit,
                            setup_time: setupTime,
                            selected_menu: JSON.stringify(selectedMenu),
                            staff_assigned: null,
                            service_type: serviceType,
                            staff_count: staffCount,
                            staff_cost: staffCost,
                            notes,
                            location,
                            event_start_time: eventStartTime,
                            event_end_time: eventEndTime,
                            equipment_provider: equipmentProvider,
                            equipment_cost: equipmentCost,
                            equipment_notes: equipmentNotes,
                            payment_status: paymentStatus,
                            personal_notes: personalNotes
                        })
                    });
                })
                .then(() => { document.getElementById('addModal').classList.remove('show'); loadCatering(); });
        }
        
        function updateCateringStatus(id) {
            fetch('/api/catering')
                .then(r => r.json())
                .then(orders => {
                    const order = orders.find(o => o.id === id);
                    if (!order) return;
                    
                    const statusOptions = ['Inquiry', 'Quote Sent', 'Booked', 'Completed', 'Cancelled'];
                    const optionsText = statusOptions.map((status, index) => `${index + 1}. ${status}`).join('\n');
                    
                    const choice = prompt(`Current status: ${order.status}\n\nSelect new status:\n${optionsText}\n\nEnter number (1-5):`);
                    const choiceNum = parseInt(choice);
                    
                    if (choiceNum >= 1 && choiceNum <= 5) {
                        const newStatus = statusOptions[choiceNum - 1];
                        fetch(`/api/catering/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...order, status: newStatus, setup_time: order.setup_time })
                        }).then(() => loadCatering());
                    }
                });
        }
        
        function buildQuote(id) {
            let currentOrder;
            fetch('/api/catering')
                .then(r => r.json())
                .then(orders => {
                    currentOrder = orders.find(o => o.id === id);
                    if (!currentOrder) return;
                    
                    // Get menu items for quote builder
                    return fetch('/api/menu');
                })
                .then(r => r.json())
                .then(menuItems => {
                    const order = currentOrder;
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = `Build Quote - ${order.client}`;
                    modalForm.innerHTML = `
                        <div class="form">
                            <h4 style="margin-bottom: 10px;">Select Menu Items</h4>
                            <div id="menuSelection" style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                                ${menuItems.map(item => {
                                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                                    const suggestedPrice = item.cost / (1 - defaultMargin / 100);
                                    return `
                                    <div style="background: var(--white); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                            <h4 style="margin: 0; color: var(--charcoal);">${item.name}</h4>
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <input type="number" id="qty-${item.id}" min="0" value="0" style="width: 70px; padding: 8px; text-align: center; border: 2px solid var(--border); border-radius: 6px;" onchange="updateQuoteTotal()" placeholder="0">
                                                <span style="font-weight: 500;">servings</span>
                                            </div>
                                        </div>
                                        <div id="cost-display-${item.id}" style="display: none; background: var(--gray-light); padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 0.9em;">
                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                                <div>Food Cost: <strong style="color: var(--orange);">$<span id="total-cost-${item.id}">0.00</span></strong></div>
                                                <div>Suggested: <strong style="color: var(--green);">$<span id="suggested-price-${item.id}">0.00</span></strong></div>
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 8px;">
                                            <label style="font-weight: 500;">Your Price: $</label>
                                            <input type="number" id="price-${item.id}" step="0.01" min="0" value="0" style="flex: 1; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateQuoteTotal()">
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                            <div style="border-top: 2px solid var(--border); padding-top: 15px; margin-top: 15px;">
                                <h4 style="margin-bottom: 10px;">Additional Services</h4>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                    <div>
                                        <label style="font-weight: 500; display: block; margin-bottom: 5px;">Service Type:</label>
                                        <select id="serviceType" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;">
                                            <option value="Delivery">Delivery Only</option>
                                            <option value="On-Premise">On-Premise Service</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="font-weight: 500; display: block; margin-bottom: 5px;">Number of Staff:</label>
                                        <input type="number" id="staffCount" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateQuoteTotal()">
                                    </div>
                                </div>
                                <div style="margin-bottom: 12px;">
                                    <label style="font-weight: 500; display: block; margin-bottom: 5px;">Staff Cost: $</label>
                                    <input type="number" id="staffCost" step="0.01" min="0" value="0" style="width: 100%; padding: 8px; border: 2px solid var(--border); border-radius: 6px;" onchange="updateQuoteTotal()">
                                </div>
                            </div>
                            <div style="text-align: right; margin-bottom: 15px; font-weight: bold; font-size: 1.1em; border-top: 2px solid var(--orange); padding-top: 10px; margin-top: 10px;">
                                Total: $<span id="quoteTotal">0.00</span>
                            </div>
                            <button class="btn" onclick="saveQuote(${id}); closeAddModal();">Save Quote</button>
                        </div>
                    `;
                    
                    // Load existing quote if available
                    let selectedMenu = [];
                    if (order.selected_menu) {
                        selectedMenu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
                    } else if (order.selectedMenu) {
                        selectedMenu = typeof order.selectedMenu === 'string' ? JSON.parse(order.selectedMenu) : order.selectedMenu;
                    }
                    
                    if (selectedMenu && selectedMenu.length > 0) {
                        selectedMenu.forEach(menuItem => {
                            const qtyInput = document.getElementById(`qty-${menuItem.id}`);
                            const priceInput = document.getElementById(`price-${menuItem.id}`);
                            if (qtyInput) {
                                qtyInput.value = menuItem.quantity;
                            }
                            if (priceInput && menuItem.totalPrice !== undefined) {
                                priceInput.value = menuItem.totalPrice.toFixed(2);
                            }
                        });
                    }
                    
                    // Load service details with defaults
                    document.getElementById('serviceType').value = order.service_type || 'Delivery';
                    document.getElementById('staffCount').value = order.staff_count || 0;
                    document.getElementById('staffCost').value = order.staff_cost || 0;
                    
                    updateQuoteTotal();
                    
                    modal.classList.add('show');
                });
        }
        
        function updateQuoteTotal() {
            const staffCostInput = document.getElementById('staffCost');
            if (!staffCostInput) return;
            
            fetch('/api/menu')
                .then(r => r.json())
                .then(menuItems => {
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    let total = 0;
                    menuItems.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput && priceInput) {
                            const qty = parseInt(qtyInput.value) || 0;
                            const totalPrice = parseFloat(priceInput.value) || 0;
                            const totalCostSpan = document.getElementById(`total-cost-${item.id}`);
                            const suggestedPriceSpan = document.getElementById(`suggested-price-${item.id}`);
                            const costDisplay = document.getElementById(`cost-display-${item.id}`);
                            
                            if (qty > 0) {
                                const totalFoodCost = qty * item.cost;
                                const suggestedPrice = item.cost / (1 - defaultMargin / 100);
                                const totalSuggestedPrice = qty * suggestedPrice;
                                if (totalCostSpan) totalCostSpan.textContent = totalFoodCost.toFixed(2);
                                if (suggestedPriceSpan) suggestedPriceSpan.textContent = totalSuggestedPrice.toFixed(2);
                                if (costDisplay) costDisplay.style.display = 'block';
                                total += totalPrice;
                            } else {
                                if (costDisplay) costDisplay.style.display = 'none';
                            }
                        }
                    });
                    const staffCost = parseFloat(document.getElementById('staffCost')?.value || 0);
                    const grandTotal = total + staffCost;
                    document.getElementById('quoteTotal').textContent = grandTotal.toFixed(2);
                });
        }
        
        function saveQuote(orderId) {
            let currentOrder;
            fetch('/api/catering')
                .then(r => r.json())
                .then(orders => {
                    currentOrder = orders.find(o => o.id === orderId);
                    return fetch('/api/menu');
                })
                .then(r => r.json())
                .then(menuItems => {
                    const selectedMenu = [];
                    let totalPrice = 0;
                    
                    menuItems.forEach(item => {
                        const qtyInput = document.getElementById(`qty-${item.id}`);
                        const priceInput = document.getElementById(`price-${item.id}`);
                        if (qtyInput && priceInput) {
                            const qty = parseInt(qtyInput.value) || 0;
                            const totalItemPrice = parseFloat(priceInput.value) || 0;
                            if (qty > 0) {
                                selectedMenu.push({
                                    id: item.id,
                                    name: item.name,
                                    price: totalItemPrice / qty,
                                    totalPrice: totalItemPrice,
                                    foodCost: item.cost,
                                    quantity: qty,
                                    total: totalItemPrice
                                });
                                totalPrice += totalItemPrice;
                            }
                        }
                    });
                    
                    const serviceType = document.getElementById('serviceType').value;
                    const staffCount = parseInt(document.getElementById('staffCount').value) || 0;
                    const staffCost = parseFloat(document.getElementById('staffCost').value) || 0;
                    const grandTotal = totalPrice + staffCost;
                    
                    return fetch(`/api/catering/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            client: currentOrder.client,
                            date: currentOrder.date,
                            guests: currentOrder.guests,
                            price: grandTotal,
                            status: currentOrder.status,
                            deposit: currentOrder.deposit,
                            setup_time: currentOrder.setup_time,
                            selected_menu: JSON.stringify(selectedMenu),
                            staff_assigned: currentOrder.staff_assigned,
                            service_type: serviceType,
                            staff_count: staffCount,
                            staff_cost: staffCost,
                            notes: currentOrder.notes
                        })
                    });
                })
                .then(() => loadCatering());
        }
        
        async function exportCateringPDF(id) {
            const response = await fetch('/api/catering');
            const orders = await response.json();
            const order = orders.find(o => o.id === id);
            if (!order) return;
            
            // Load jsPDF library if not already loaded
            if (typeof window.jsPDF === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = async () => await generateCateringPDF(order);
                document.head.appendChild(script);
            } else {
                await generateCateringPDF(order);
            }
        }
        
        async function generateCateringPDF(order) {
            const doc = new window.jspdf.jsPDF();
            
            // Parse selectedMenu if it's a string
            let selectedMenu = [];
            if (order.selected_menu) {
                selectedMenu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
            } else if (order.selectedMenu) {
                selectedMenu = typeof order.selectedMenu === 'string' ? JSON.parse(order.selectedMenu) : order.selectedMenu;
            }
            
            // Fetch business info from database
            const response = await fetch('/api/business-info');
            const businessInfo = await response.json();
            
            // Add logo
            const logo = new Image();
            logo.src = '/uploads/1763192867406_birria-fusion-logo.png';
            logo.onload = function() {
                doc.addImage(logo, 'PNG', 15, 10, 30, 30);
                
                // Header - Company Name
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 107, 53);
                doc.text('BIRRIA FUSION', 50, 22);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                const phone = businessInfo.phone || '(555) 123-4567';
                const email = businessInfo.email || 'info@birriafusion.com';
                const website = businessInfo.website || 'www.birriafusion.com';
                doc.text(`${phone} | ${email}`, 50, 28);
                doc.text(website, 50, 33);
                
                // Title
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('CATERING QUOTE', 105, 55, { align: 'center' });
                
                // Horizontal line
                doc.setDrawColor(255, 107, 53);
                doc.setLineWidth(0.5);
                doc.line(15, 60, 195, 60);
                
                // Client Info Box
                doc.setFillColor(250, 250, 250);
                doc.rect(15, 68, 180, 35, 'F');
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('CLIENT INFORMATION', 20, 76);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Client: ${order.client}`, 20, 84);
                doc.text(`Event Date: ${order.date}`, 20, 90);
                doc.text(`Number of Guests: ${order.guests}`, 20, 96);
                
                const serviceType = order.service_type || 'Delivery';
                doc.text(`Service Type: ${serviceType}`, 120, 84);
                if (order.setup_time || order.setupTime) {
                    doc.text(`Setup Time: ${order.setup_time || order.setupTime}`, 120, 90);
                }
                
                // Menu Items Section
                let yPos = 115;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('MENU ITEMS', 20, yPos);
                
                yPos += 8;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                doc.line(15, yPos, 195, yPos);
                
                // Table Header
                yPos += 7;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(80, 80, 80);
                doc.text('ITEM', 20, yPos);
                doc.text('QUANTITY', 130, yPos);
                doc.text('PRICE', 185, yPos, { align: 'right' });
                
                yPos += 3;
                doc.line(15, yPos, 195, yPos);
                
                // Menu Items
                yPos += 8;
                let subtotal = 0;
                if (selectedMenu && selectedMenu.length > 0) {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    selectedMenu.forEach(item => {
                        const itemTotal = item.total || item.totalPrice;
                        doc.setFontSize(10);
                        doc.text(item.name, 20, yPos);
                        doc.text(`${item.quantity} servings`, 130, yPos);
                        doc.text(`$${itemTotal.toFixed(2)}`, 185, yPos, { align: 'right' });
                        subtotal += itemTotal;
                        yPos += 8;
                    });
                }
                
                // Totals Section
                yPos += 5;
                doc.setDrawColor(200, 200, 200);
                doc.line(120, yPos, 195, yPos);
                
                yPos += 8;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('FOOD SUBTOTAL:', 130, yPos);
                doc.text(`$${subtotal.toFixed(2)}`, 185, yPos, { align: 'right' });
                
                if (order.staff_count > 0 || order.staff_cost > 0) {
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Staff (${order.staff_count || 0} person${order.staff_count !== 1 ? 's' : ''}):`, 130, yPos);
                    doc.text(`$${(order.staff_cost || 0).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                if (order.equipment_cost > 0) {
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.text('Equipment Rental:', 130, yPos);
                    doc.text(`$${(order.equipment_cost || 0).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                yPos += 8;
                doc.setFont('helvetica', 'bold');
                const totalPrice = order.price || subtotal + (order.staff_cost || 0) + (order.equipment_cost || 0);
                doc.text('TOTAL:', 130, yPos);
                doc.text(`$${totalPrice.toFixed(2)}`, 185, yPos, { align: 'right' });
                
                if (order.deposit > 0) {
                    yPos += 8;
                    doc.setTextColor(255, 107, 53);
                    doc.text('DEPOSIT REQUIRED:', 130, yPos);
                    doc.text(`$${order.deposit.toFixed(2)}`, 185, yPos, { align: 'right' });
                    
                    yPos += 8;
                    doc.setTextColor(0, 0, 0);
                    doc.text('BALANCE DUE:', 130, yPos);
                    doc.text(`$${(totalPrice - order.deposit).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                yPos += 3;
                doc.setDrawColor(255, 107, 53);
                doc.setLineWidth(0.5);
                doc.line(120, yPos, 195, yPos);
                
                // Notes Section
                if (order.notes) {
                    yPos += 15;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text('SPECIAL NOTES:', 20, yPos);
                    
                    yPos += 6;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    const splitNotes = doc.splitTextToSize(order.notes, 170);
                    doc.text(splitNotes, 20, yPos);
                }
                
                // Footer
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(120, 120, 120);
                doc.text('Thank you for choosing Birria Fusion for your catering needs!', 105, 275, { align: 'center' });
                doc.text('This quote is valid for 30 days from the date of issue.', 105, 280, { align: 'center' });
                
                // Save PDF
                doc.save(`Catering-Quote-${order.client}-${order.date}.pdf`);
            };
            
            // Fallback if logo doesn't load
            logo.onerror = function() {
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 107, 53);
                doc.text('BIRRIA FUSION', 15, 25);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('(555) 123-4567 | info@birriafusion.com | www.birriafusion.com', 15, 32);
                
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('CATERING QUOTE', 105, 55, { align: 'center' });
                
                doc.save(`Catering-Quote-${order.client}-${order.date}.pdf`);
            };
        }

        async function exportCateringInvoice(id) {
            const response = await fetch('/api/catering');
            const orders = await response.json();
            const order = orders.find(o => o.id === id);
            if (!order) return;
            
            if (typeof window.jsPDF === 'undefined') {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => generateCateringInvoice(order);
                document.head.appendChild(script);
            } else {
                await generateCateringInvoice(order);
            }
        }
        
        async function generateCateringInvoice(order) {
            const doc = new window.jspdf.jsPDF();
            const invoiceNumber = `INV-${order.id}-${new Date().getFullYear()}`;
            const invoiceDate = new Date().toISOString().split('T')[0];
            const dueDate = new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0];
            
            let selectedMenu = [];
            if (order.selected_menu) {
                selectedMenu = typeof order.selected_menu === 'string' ? JSON.parse(order.selected_menu) : order.selected_menu;
            } else if (order.selectedMenu) {
                selectedMenu = typeof order.selectedMenu === 'string' ? JSON.parse(order.selectedMenu) : order.selectedMenu;
            }
            
            const response = await fetch('/api/business-info');
            const businessInfo = await response.json();
            
            const logo = new Image();
            logo.src = '/uploads/1763192867406_birria-fusion-logo.png';
            logo.onload = function() {
                doc.addImage(logo, 'PNG', 15, 10, 30, 30);
                
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 107, 53);
                doc.text('BIRRIA FUSION', 50, 22);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                const phone = businessInfo.phone || '(555) 123-4567';
                const email = businessInfo.email || 'info@birriafusion.com';
                const website = businessInfo.website || 'www.birriafusion.com';
                doc.text(`${phone} | ${email}`, 50, 28);
                doc.text(website, 50, 33);
                
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(220, 53, 69);
                doc.text('INVOICE', 105, 55, { align: 'center' });
                
                doc.setDrawColor(255, 107, 53);
                doc.setLineWidth(0.5);
                doc.line(15, 60, 195, 60);
                
                doc.setFillColor(250, 250, 250);
                doc.rect(15, 68, 85, 30, 'F');
                doc.rect(110, 68, 85, 30, 'F');
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text('BILL TO:', 20, 76);
                doc.setFont('helvetica', 'normal');
                doc.text(order.client, 20, 82);
                doc.text(`Event Date: ${order.date}`, 20, 88);
                doc.text(`Guests: ${order.guests}`, 20, 94);
                
                doc.setFont('helvetica', 'bold');
                doc.text('INVOICE DETAILS:', 115, 76);
                doc.setFont('helvetica', 'normal');
                doc.text(`Invoice #: ${invoiceNumber}`, 115, 82);
                doc.text(`Invoice Date: ${invoiceDate}`, 115, 88);
                doc.text(`Due Date: ${dueDate}`, 115, 94);
                
                let yPos = 110;
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('SERVICES PROVIDED', 20, yPos);
                
                yPos += 8;
                doc.setDrawColor(200, 200, 200);
                doc.setLineWidth(0.3);
                doc.line(15, yPos, 195, yPos);
                
                yPos += 7;
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(80, 80, 80);
                doc.text('DESCRIPTION', 20, yPos);
                doc.text('QTY', 130, yPos);
                doc.text('AMOUNT', 185, yPos, { align: 'right' });
                
                yPos += 3;
                doc.line(15, yPos, 195, yPos);
                
                yPos += 8;
                let subtotal = 0;
                if (selectedMenu && selectedMenu.length > 0) {
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(0, 0, 0);
                    
                    selectedMenu.forEach(item => {
                        const itemTotal = item.total || item.totalPrice;
                        doc.setFontSize(10);
                        doc.text(item.name, 20, yPos);
                        doc.text(`${item.quantity}`, 130, yPos);
                        doc.text(`$${itemTotal.toFixed(2)}`, 185, yPos, { align: 'right' });
                        subtotal += itemTotal;
                        yPos += 8;
                    });
                }
                
                yPos += 5;
                doc.setDrawColor(200, 200, 200);
                doc.line(120, yPos, 195, yPos);
                
                yPos += 8;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.text('FOOD SUBTOTAL:', 130, yPos);
                doc.text(`$${subtotal.toFixed(2)}`, 185, yPos, { align: 'right' });
                
                if (order.staff_count > 0 || order.staff_cost > 0) {
                    yPos += 8;
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Staff (${order.staff_count || 0}):`, 130, yPos);
                    doc.text(`$${(order.staff_cost || 0).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                if (order.equipment_cost > 0) {
                    yPos += 8;
                    doc.text('Equipment:', 130, yPos);
                    doc.text(`$${(order.equipment_cost || 0).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                yPos += 8;
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                const totalPrice = order.price || subtotal + (order.staff_cost || 0) + (order.equipment_cost || 0);
                doc.text('TOTAL DUE:', 130, yPos);
                doc.text(`$${totalPrice.toFixed(2)}`, 185, yPos, { align: 'right' });
                
                if (order.deposit > 0) {
                    yPos += 8;
                    doc.setFontSize(11);
                    doc.setTextColor(40, 167, 69);
                    doc.text('Deposit Paid:', 130, yPos);
                    doc.text(`-$${order.deposit.toFixed(2)}`, 185, yPos, { align: 'right' });
                    
                    yPos += 8;
                    doc.setTextColor(220, 53, 69);
                    doc.setFontSize(13);
                    doc.text('BALANCE DUE:', 130, yPos);
                    doc.text(`$${(totalPrice - order.deposit).toFixed(2)}`, 185, yPos, { align: 'right' });
                }
                
                yPos += 3;
                doc.setDrawColor(220, 53, 69);
                doc.setLineWidth(0.8);
                doc.line(120, yPos, 195, yPos);
                
                yPos += 15;
                doc.setFillColor(255, 243, 205);
                doc.rect(15, yPos, 180, 20, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(133, 100, 4);
                doc.text('PAYMENT TERMS:', 20, yPos + 7);
                doc.setFont('helvetica', 'normal');
                doc.text(`Payment due within 15 days (by ${dueDate})`, 20, yPos + 13);
                doc.text('Make checks payable to: Birria Fusion', 20, yPos + 17);
                
                if (order.notes) {
                    yPos += 30;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text('NOTES:', 20, yPos);
                    
                    yPos += 6;
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    const splitNotes = doc.splitTextToSize(order.notes, 170);
                    doc.text(splitNotes, 20, yPos);
                }
                
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(120, 120, 120);
                doc.text('Thank you for your business!', 105, 275, { align: 'center' });
                doc.text('Please remit payment by the due date to avoid late fees.', 105, 280, { align: 'center' });
                
                doc.save(`Invoice-${invoiceNumber}-${order.client}.pdf`);
            };
            
            logo.onerror = function() {
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 107, 53);
                doc.text('BIRRIA FUSION', 15, 25);
                doc.save(`Invoice-${invoiceNumber}-${order.client}.pdf`);
            };
        }

        function archiveCateringOrder(id) {
            if (confirm('Archive this order? You can restore it later from Archives.')) {
                fetch(`/api/catering/${id}/archive`, { method: 'POST' })
                    .then(() => loadCatering());
            }
        }
        
        function deleteCateringOrder(id) {
            if (confirm('Delete this catering order?')) {
                fetch(`/api/catering/${id}`, { method: 'DELETE' })
                    .then(() => loadCatering());
            }
        }







        
