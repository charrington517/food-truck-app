        // Supplier Functions
        function addSupplier() {
            const name = document.getElementById('supplierName').value;
            const contact = document.getElementById('supplierContact').value;
            const phone = document.getElementById('supplierPhone').value;
            const email = document.getElementById('supplierEmail').value;
            const address = document.getElementById('supplierAddress').value;
            const category = document.getElementById('supplierCategory').value;
            const description = document.getElementById('supplierDescription').value;

            if (!name) {
                alert('Please enter supplier name');
                return;
            }

            fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, phone, email, address, category, description })
            }).then(() => {
                document.getElementById('supplierName').value = '';
                document.getElementById('supplierContact').value = '';
                document.getElementById('supplierPhone').value = '';
                document.getElementById('supplierEmail').value = '';
                document.getElementById('supplierAddress').value = '';
                document.getElementById('supplierDescription').value = '';
                loadSuppliers();
            });
        }

        function loadSuppliers() {
            fetch('/api/suppliers')
                .then(r => r.json())
                .then(items => {
                    document.getElementById('suppliersList').innerHTML = items.map(item => `
                        <div class="card">
                            <div class="card-header" onclick="toggleSupplierDetails(${item.id})" style="cursor: pointer;">
                                <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                    ${item.name}
                                    <span class="expand-icon" id="supplier-icon-${item.id}">▼</span>
                                </div>
                                <div class="card-meta">${item.category || 'Food'}</div>
                            </div>
                            <div class="card-details" id="supplier-details-${item.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                                <div class="card-meta">Contact: ${item.contact || 'No contact'}</div>
                                <div class="card-meta">Phone: ${item.phone || 'No phone'}</div>
                                <div class="card-meta">Email: ${item.email || 'No email'}</div>
                                ${item.address ? `<div class="card-meta">Address: ${item.address}</div>` : ''}
                                ${item.description ? `<div class="card-meta">Description: ${item.description}</div>` : ''}
                            </div>
                            <div class="card-actions">
                                <button class="btn" onclick="editSupplier(${item.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn btn-danger" onclick="deleteSupplier(${item.id})">Delete</button>
                            </div>
                        </div>
                    `).join('');
                });
        }

        function editSupplier(id) {
            fetch('/api/suppliers')
                .then(r => r.json())
                .then(items => {
                    const supplier = items.find(item => item.id === id);
                    if (!supplier) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Supplier';
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <input type="text" id="supplierName" placeholder="Supplier Name" value="${supplier.name}">
                            </div>
                            <div class="form-row">
                                <input type="text" id="supplierContact" placeholder="Contact Person" value="${supplier.contact || ''}">
                                <select id="supplierCategory">
                                    <option value="Food" ${supplier.category === 'Food' ? 'selected' : ''}>Food</option>
                                    <option value="Beverage" ${supplier.category === 'Beverage' ? 'selected' : ''}>Beverage</option>
                                    <option value="Equipment" ${supplier.category === 'Equipment' ? 'selected' : ''}>Equipment</option>
                                    <option value="Supplies" ${supplier.category === 'Supplies' ? 'selected' : ''}>Supplies</option>
                                    <option value="Other" ${supplier.category === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <input type="tel" id="supplierPhone" placeholder="Phone Number" value="${supplier.phone || ''}">
                                <input type="email" id="supplierEmail" placeholder="Email" value="${supplier.email || ''}">
                            </div>
                            <div class="form-group">
                                <input type="text" id="supplierAddress" placeholder="Address" value="${supplier.address || ''}">
                            </div>
                            <div class="form-group">
                                <textarea id="supplierDescription" placeholder="Description, notes, terms..." rows="3">${supplier.description || ''}</textarea>
                            </div>
                            <button class="btn" onclick="updateSupplier(${id}); closeAddModal();">Update Supplier</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function updateSupplier(id) {
            const name = document.getElementById('supplierName').value;
            const contact = document.getElementById('supplierContact').value;
            const phone = document.getElementById('supplierPhone').value;
            const email = document.getElementById('supplierEmail').value;
            const address = document.getElementById('supplierAddress').value;
            const category = document.getElementById('supplierCategory').value;
            const description = document.getElementById('supplierDescription').value;

            if (!name) {
                alert('Please enter supplier name');
                return;
            }

            fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, contact, phone, email, address, category, description })
            }).then(() => {
                loadSuppliers();
            });
        }

        function deleteSupplier(id) {
            if (confirm('Delete this supplier?')) {
                fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
                    .then(() => loadSuppliers());
            }
        }
        
        function toggleSupplierDetails(id) {
            const details = document.getElementById(`supplier-details-${id}`);
            const icon = document.getElementById(`supplier-icon-${id}`);
            
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }

