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

