        // License Functions
        function addLicense() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add License/Permit';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <select id="licenseType">
                            <option value="Business License">Business License</option>
                            <option value="Food Handler's Permit">Food Handler's Permit</option>
                            <option value="Mobile Vendor Permit">Mobile Vendor Permit</option>
                            <option value="Health Department Permit">Health Department Permit</option>
                            <option value="Fire Department Permit">Fire Department Permit</option>
                            <option value="State Sales Tax License">State Sales Tax License</option>
                            <option value="Workers Compensation">Workers Compensation</option>
                            <option value="General Liability Insurance">General Liability Insurance</option>
                            <option value="Vehicle Registration">Vehicle Registration</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" id="customNameField" style="display: none;">
                        <input type="text" id="customLicenseName" placeholder="Enter license name">
                    </div>
                    <div class="form-row">
                        <input type="text" id="licenseNumber" placeholder="License/Permit Number">
                        <input type="text" id="issuingAgency" placeholder="Issuing Agency">
                    </div>
                    <div class="form-row">
                        <input type="text" id="expirationDate" placeholder="Expiration Date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                        <input type="text" id="renewalCost" placeholder="Renewal Cost ($)">
                    </div>
                    <button class="btn" onclick="saveLicense(); closeAddModal();">Add License</button>
                </div>
            `;
            
            // Show custom name field when "Other" is selected
            setTimeout(() => {
                document.getElementById('licenseType').onchange = function() {
                    const customField = document.getElementById('customNameField');
                    customField.style.display = this.value === 'Other' ? 'block' : 'none';
                };
            }, 100);
            
            modal.classList.add('show');
        }
        
        function saveLicense() {
            const type = document.getElementById('licenseType').value;
            const customName = document.getElementById('customLicenseName')?.value;
            const name = type === 'Other' ? customName : type;
            const expiration = document.getElementById('expirationDate').value;
            
            if (!name || !expiration) {
                alert('Please enter license name and expiration date');
                return;
            }
            
            fetch('/api/licenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, expiry_date: expiration, status: 'Active' })
            }).then(() => loadLicenses());
        }
        
        function loadLicenses() {
            // Migrate localStorage licenses to database (one-time)
            const localLicenses = JSON.parse(localStorage.getItem('licenses') || '[]');
            if (localLicenses.length > 0) {
                Promise.all(localLicenses.map(license => 
                    fetch('/api/licenses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: license.name, expiry_date: license.expiration, status: 'Active' })
                    })
                )).then(() => {
                    localStorage.removeItem('licenses');
                    loadLicenses();
                });
                return;
            }
            
            fetch('/api/licenses')
                .then(r => r.json())
                .then(licenses => {
                    const today = new Date().toISOString().split('T')[0];
            
            document.getElementById('licenseList').innerHTML = licenses.map(license => {
                const expDate = new Date(license.expiry_date);
                const daysUntilExp = Math.ceil((expDate - new Date()) / (1000 * 60 * 60 * 24));
                
                let status, statusColor;
                if (daysUntilExp < 0) {
                    status = 'EXPIRED';
                    statusColor = 'var(--danger)';
                } else if (daysUntilExp <= 30) {
                    status = 'Expires Soon';
                    statusColor = 'var(--warning)';
                } else {
                    status = 'Valid';
                    statusColor = 'var(--success)';
                }
                
                return `
                    <div class="file-card">
                        <div class="file-icon" style="background: ${statusColor}; font-size: 0.6em;">${license.name.slice(0,4).toUpperCase()}</div>
                        <div class="file-name">${license.name}</div>
                        <div class="file-meta">Expires: ${license.expiry_date}</div>
                        <div class="file-meta" style="color: ${statusColor}; font-weight: bold;">${status}</div>
                        <div class="file-actions">
                            <button class="btn" onclick="renewLicense(${license.id})" style="background: var(--orange); color: white;">Renew</button>
                            <button class="btn btn-danger" onclick="deleteLicense(${license.id})">Del</button>
                        </div>
                    </div>
                `;
            }).join('');
                });
        }
        
        function renewLicense(id) {
            fetch('/api/licenses')
                .then(r => r.json())
                .then(licenses => {
                    const license = licenses.find(l => l.id === id);
                    if (!license) return;
                    
                    const newExpiration = prompt('Enter new expiration date (YYYY-MM-DD):', license.expiry_date);
                    if (newExpiration && /^\d{4}-\d{2}-\d{2}$/.test(newExpiration)) {
                        fetch(`/api/licenses/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: license.name, expiry_date: newExpiration, status: license.status })
                        }).then(() => loadLicenses());
                    }
                });
        }
        
        function deleteLicense(id) {
            if (confirm('Delete this license/permit?')) {
                fetch(`/api/licenses/${id}`, { method: 'DELETE' })
                    .then(() => loadLicenses());
            }
        }

