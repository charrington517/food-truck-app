        // Shift Swap Functions
        async function loadShiftSwaps() {
            const swaps = await fetch('/api/shift-swaps').then(r => r.json());
            const employees = await fetch('/api/employees').then(r => r.json());
            
            if (swaps.length === 0) {
                document.getElementById('shiftSwapsList').innerHTML = '<div class="card" style="text-align: center; color: var(--gray);">No shift swap requests</div>';
                return;
            }
            
            document.getElementById('shiftSwapsList').innerHTML = swaps.map(swap => {
                const statusColor = swap.status === 'pending' ? 'var(--warning)' : swap.status === 'accepted' ? 'var(--success)' : 'var(--danger)';
                const canRespond = swap.status === 'pending' && currentUser.id !== swap.requester_id;
                
                return `
                    <div class="card" style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                            <div>
                                <div style="font-weight: bold;">${swap.requester_name}</div>
                                <div style="color: var(--gray); font-size: 0.9em;">${swap.shift_date} at ${swap.shift_time}</div>
                                ${swap.reason ? `<div style="margin-top: 5px; font-style: italic;">${swap.reason}</div>` : ''}
                            </div>
                            <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; text-transform: uppercase;">${swap.status}</span>
                        </div>
                        ${swap.responder_name ? `<div style="color: var(--success); font-size: 0.9em; margin-top: 10px;">Accepted by: ${swap.responder_name}</div>` : ''}
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            ${canRespond ? `<button class="btn" onclick="acceptShiftSwap(${swap.id})" style="background: var(--success); color: white;">Accept</button>` : ''}
                            ${currentUser.id === swap.requester_id || currentUser.role === 'Manager' ? `<button class="btn btn-danger" onclick="deleteShiftSwap(${swap.id})">Delete</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function openShiftSwapModal() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Request Shift Swap';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Shift Date</label>
                        <input type="date" id="swapDate" required>
                    </div>
                    <div class="form-group">
                        <label>Shift Time</label>
                        <input type="time" id="swapTime" required>
                    </div>
                    <div class="form-group">
                        <label>Reason (optional)</label>
                        <textarea id="swapReason" rows="3" placeholder="Why do you need to swap this shift?"></textarea>
                    </div>
                    <button class="btn" onclick="submitShiftSwap()" style="width: 100%; background: var(--orange); color: white;">Submit Request</button>
                </div>
            `;
            modal.classList.add('show');
        }
        
        async function submitShiftSwap() {
            const shift_date = document.getElementById('swapDate').value;
            const shift_time = document.getElementById('swapTime').value;
            const reason = document.getElementById('swapReason').value;
            
            if (!shift_date || !shift_time) return alert('Please fill in date and time');
            
            await fetch('/api/shift-swaps', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    requester_id: currentUser.id,
                    requester_name: currentUser.name,
                    shift_date,
                    shift_time,
                    reason
                })
            }).catch(err => console.error('Failed to create shift swap:', err));
            
            document.getElementById('addModal').classList.remove('show');
            loadShiftSwaps();
        }
        
        async function acceptShiftSwap(id) {
            if (!confirm('Accept this shift swap?')) return;
            
            await fetch(`/api/shift-swaps/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    status: 'accepted',
                    responder_id: currentUser.id,
                    responder_name: currentUser.name
                })
            }).catch(err => console.error('Failed to accept shift swap:', err));
            
            loadShiftSwaps();
        }
        
        async function deleteShiftSwap(id) {
            if (!confirm('Delete this shift swap request?')) return;
            
            await fetch(`/api/shift-swaps/${id}`, {
                method: 'DELETE'
            }).catch(err => console.error('Failed to delete shift swap:', err));
            
            loadShiftSwaps();
        }

        function loadEmployees() {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            
            // Update employee select dropdown
            const employeeSelect = document.getElementById('employeeSelect');
            employeeSelect.innerHTML = '<option value="">Select employee...</option>' +
                employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.role})</option>`).join('');
            
            loadEmployeeList();
            
            // Update status list
            const statusList = document.getElementById('employeeStatusList');
            if (employees.length === 0) {
                statusList.innerHTML = '<div style="color: var(--gray); font-style: italic;">No employees added yet. Add an employee above to get started.</div>';
                return;
            }
            
            console.log('Loading employees:', employees);
            
            statusList.innerHTML = employees.map(emp => {
                const statusColor = emp.status === 'signed-in' ? 'var(--success)' : 'var(--gray)';
                const statusText = emp.status === 'signed-in' ? `Signed in at ${emp.signInTime}` : 'Signed out';
                
                return `
                    <div style="background: var(--white); border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; font-size: 1.1em;">${emp.name}</div>
                            <div style="font-size: 0.9em; color: var(--gray);">${emp.role}</div>
                        </div>
                        <div style="font-size: 0.9em; color: ${statusColor}; font-weight: 500;">${statusText}</div>
                    </div>
                `;
            }).join('');
            
            // Update current status for time clock functionality
            updateCurrentStatus();
        }
        
        function editEmployee(id) {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id === id);
            if (!employee) return;
            
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Edit Employee';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="editEmployeeName" placeholder="Employee Name" value="${employee.name}">
                    </div>
                    <div class="form-group">
                        <select id="editEmployeeRole">
                            <option value="">Select role...</option>
                            ${getAllEmployeeRoles().map(role => `<option value="${role}" ${employee.role === role ? 'selected' : ''}>${role}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="email" id="editEmployeeEmail" placeholder="Email" value="${employee.email || ''}">
                    </div>
                    <div class="form-group">
                        <input type="tel" id="editEmployeePhone" placeholder="Phone" value="${employee.phone || ''}">
                    </div>
                    <div class="form-group">
                        <input type="text" id="editEmployeeAddress" placeholder="Address" value="${employee.address || ''}">
                    </div>
                    <div class="form-group">
                        <textarea id="editEmployeeNotes" placeholder="Notes" rows="2">${employee.notes || ''}</textarea>
                    </div>
                    <button class="btn" onclick="updateEmployee(${id}); closeAddModal();">Update Employee</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function updateEmployee(id) {
            const name = document.getElementById('editEmployeeName').value.trim();
            const role = document.getElementById('editEmployeeRole').value;
            const email = document.getElementById('editEmployeeEmail').value.trim();
            const phone = document.getElementById('editEmployeePhone').value.trim();
            const address = document.getElementById('editEmployeeAddress').value.trim();
            const notes = document.getElementById('editEmployeeNotes').value.trim();
            
            if (!name || !role) {
                alert('Please enter employee name and role');
                return;
            }
            
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employeeIndex = employees.findIndex(emp => emp.id === id);
            
            if (employeeIndex !== -1) {
                employees[employeeIndex] = {
                    ...employees[employeeIndex],
                    name,
                    role,
                    email,
                    phone,
                    address,
                    notes
                };
                localStorage.setItem('employees', JSON.stringify(employees));
                loadEmployees();
            }
        }
        
        function deleteEmployee(id) {
            if (confirm('Delete this employee?')) {
                fetch(`/api/employees/${id}`, { method: 'DELETE' })
                    .then(() => loadEmployees());
            }
        }








        
        function toggleEmployeeStatus() {
            const selectedId = document.getElementById('employeeSelect').value;
            if (!selectedId) {
                alert('Please select an employee');
                return;
            }
            
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id == selectedId);
            if (!employee) return;
            
            if (employee.status === 'signed-out') {
                employee.status = 'signed-in';
                employee.signInTime = new Date().toLocaleTimeString();
            } else {
                employee.status = 'signed-out';
                employee.signInTime = null;
            }
            
            localStorage.setItem('employees', JSON.stringify(employees));
            loadEmployees();
            updateCurrentStatus();
        }
        
        function updateCurrentStatus() {
            const selectedId = document.getElementById('employeeSelect').value;
            const statusDiv = document.getElementById('currentStatus');
            const clockBtn = document.getElementById('clockBtn');
            
            if (!selectedId) {
                statusDiv.textContent = '';
                clockBtn.textContent = 'Punch In';
                return;
            }
            
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id == selectedId);
            
            if (employee) {
                if (employee.status === 'signed-in') {
                    statusDiv.textContent = `Signed in at ${employee.signInTime}`;
                    statusDiv.style.color = 'var(--success)';
                    clockBtn.textContent = 'Punch Out';
                } else {
                    statusDiv.textContent = 'Currently signed out';
                    statusDiv.style.color = 'var(--gray)';
                    clockBtn.textContent = 'Punch In';
                }
            }
        }
        
        window.toggleEmployeeDetails = function(id) {
            const details = document.getElementById(`emp-details-${id}`);
            const icon = document.getElementById(`emp-icon-${id}`);
            
            if (details && icon) {
                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    icon.textContent = '▲';
                } else {
                    details.style.display = 'none';
                    icon.textContent = '▼';
                }
            }
        };
        
        function toggleAddEmployee() {
            const form = document.getElementById('add-employee-form');
            const icon = document.getElementById('add-emp-icon');
            
            if (form.style.display === 'none') {
                form.style.display = 'block';
                icon.textContent = '▲';
            } else {
                form.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function toggleTimePunches() {
            const container = document.getElementById('timePunchHistoryContainer');
            const icon = document.getElementById('punch-icon');
            
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                updatePunchFilter();
                loadTimePunchHistory();
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function updatePunchFilter() {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const filter = document.getElementById('punchFilter');
            const currentValue = filter.value;
            
            filter.innerHTML = '<option value="all">All Employees</option>' + 
                employees.map(emp => `<option value="${emp.name}" ${currentValue === emp.name ? 'selected' : ''}>${emp.name}</option>`).join('');
        }
        
        function loadTimePunchHistory() {
            const punches = JSON.parse(localStorage.getItem('timePunches') || '[]');
            const history = document.getElementById('timePunchHistory');
            const filterValue = document.getElementById('punchFilter').value;
            const dateFilter = document.getElementById('punchDateFilter').value;
            
            // Filter punches by selected employee
            let filteredPunches = filterValue === 'all' ? punches : punches.filter(p => p.employeeName === filterValue);
            
            // Filter by date if selected
            if (dateFilter) {
                const filterDate = new Date(dateFilter + 'T00:00:00');
                filteredPunches = filteredPunches.filter(p => {
                    const punchDate = new Date(p.timestamp);
                    return punchDate.getFullYear() === filterDate.getFullYear() &&
                           punchDate.getMonth() === filterDate.getMonth() &&
                           punchDate.getDate() === filterDate.getDate();
                });
            }
            
            if (filteredPunches.length === 0) {
                history.innerHTML = '<div style="color: var(--gray); font-style: italic;">No time punches found.</div>';
                return;
            }
            
            const today = new Date().toDateString();
            const displayPunches = dateFilter ? filteredPunches.reverse() : filteredPunches.slice(-20).reverse();
            
            history.innerHTML = displayPunches.map(punch => {
                const date = new Date(punch.timestamp);
                const isToday = date.toDateString() === today;
                const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const dateStr = isToday ? 'Today' : date.toLocaleDateString();
                
                return `
                    <div style="display: flex; justify-content: space-between; padding: 8px; margin-bottom: 5px; background: var(--gray-light); border-radius: 6px;">
                        <div>
                            <div style="font-weight: bold;">${punch.employeeName}</div>
                            <div style="font-size: 0.8em; color: var(--gray);">${dateStr} at ${timeStr}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: ${(punch.action === 'punch-in' || punch.action === 'sign-in') ? 'var(--success)' : 'var(--danger)'}; font-weight: bold; font-size: 0.9em;">${punch.action.replace('sign-', 'punch-').toUpperCase()}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

