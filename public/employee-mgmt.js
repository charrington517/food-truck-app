        // Employee Management Functions
        

        
        function toggleEmployeeStatus() {
            const employeeId = document.getElementById('employeeSelect').value;
            if (!employeeId) {
                alert('Please select an employee');
                return;
            }
            
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id == employeeId);
            if (!employee) return;
            
            const now = new Date();
            const punches = JSON.parse(localStorage.getItem('timePunches') || '[]');
            
            if (employee.status === 'signed-out') {
                employee.status = 'signed-in';
                employee.signInTime = now.toISOString();
                
                // Record sign-in punch
                punches.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    action: 'punch-in',
                    timestamp: now.toISOString()
                });
            } else {
                employee.status = 'signed-out';
                
                // Record sign-out punch
                punches.push({
                    employeeId: employee.id,
                    employeeName: employee.name,
                    action: 'punch-out',
                    timestamp: now.toISOString()
                });
                
                if (employee.signInTime) {
                    const signInTime = new Date(employee.signInTime);
                    const hoursWorked = (now - signInTime) / (1000 * 60 * 60);
                    employee.totalHours += hoursWorked;
                }
                employee.signInTime = null;
            }
            
            localStorage.setItem('employees', JSON.stringify(employees));
            localStorage.setItem('timePunches', JSON.stringify(punches));
            updateCurrentStatus();
            updateEmployeeStatusList();
        }
        
        function updateCurrentStatus() {
            const employeeId = document.getElementById('employeeSelect').value;
            const btn = document.getElementById('clockBtn');
            const status = document.getElementById('currentStatus');
            
            if (!employeeId) {
                btn.textContent = 'Punch In';
                btn.style.background = 'var(--orange)';
                status.innerHTML = '';
                return;
            }
            
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const employee = employees.find(emp => emp.id == employeeId);
            if (!employee) return;
            
            if (employee.status === 'signed-in') {
                btn.textContent = 'Punch Out';
                btn.style.background = 'var(--danger)';
                const signInTime = new Date(employee.signInTime);
                const currentTime = (new Date() - signInTime) / (1000 * 60 * 60);
                status.innerHTML = `<div style="color: var(--success); font-weight: bold;">Signed in since ${signInTime.toLocaleTimeString()}</div><div>Current shift: ${currentTime.toFixed(1)} hours</div>`;
            } else {
                btn.textContent = 'Punch In';
                btn.style.background = 'var(--success)';
                status.innerHTML = `<div style="color: var(--gray);">Signed out</div><div>Total hours: ${employee.totalHours.toFixed(1)}</div>`;
            }
        }
        
        function updateEmployeeStatusList() {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const list = document.getElementById('employeeStatusList');
            
            if (employees.length === 0) {
                list.innerHTML = '<div style="color: var(--gray); font-style: italic;">No employees added yet</div>';
                return;
            }
            
            list.innerHTML = employees.map(emp => {
                const statusColor = emp.status === 'signed-in' ? 'var(--success)' : 'var(--gray)';
                const statusText = emp.status === 'signed-in' ? 'SIGNED IN' : 'Signed Out';
                let timeInfo = '';
                
                if (emp.status === 'signed-in' && emp.signInTime) {
                    const signInTime = new Date(emp.signInTime);
                    const currentHours = (new Date() - signInTime) / (1000 * 60 * 60);
                    timeInfo = `Current: ${currentHours.toFixed(1)}h`;
                } else {
                    timeInfo = `Total: ${emp.totalHours.toFixed(1)}h`;
                }
                
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 5px; background: var(--gray-light); border-radius: 6px;">
                        <div>
                            <div style="font-weight: bold;">${emp.name}</div>
                            <div style="font-size: 0.8em; color: var(--gray);">${emp.role}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: ${statusColor}; font-weight: bold; font-size: 0.8em;">${statusText}</div>
                            <div style="font-size: 0.8em; color: var(--gray);">${timeInfo}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        document.getElementById('employeeSelect')?.addEventListener('change', updateCurrentStatus);

