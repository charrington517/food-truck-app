        // Maintenance Functions
        function addMaintenanceTask() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Maintenance Task';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="taskName" placeholder="Task Name (e.g., Clean Fryer, Health Inspection)">
                    </div>
                    <div class="form-row">
                        <select id="taskType">
                            <option value="Equipment">Equipment Service</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Inspection">Health Inspection</option>
                            <option value="Permit">Permit Renewal</option>
                        </select>
                        <select id="frequency">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Once">One-time</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <input type="text" id="nextDue" placeholder="Next Due Date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                        <input type="text" id="lastDone" placeholder="Last Completed" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                    </div>
                    <button class="btn" onclick="saveMaintenanceTask(); closeAddModal();">Add Task</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function saveMaintenanceTask() {
            const name = document.getElementById('taskName').value;
            const type = document.getElementById('taskType').value;
            const frequency = document.getElementById('frequency').value;
            const nextDue = document.getElementById('nextDue').value;
            const lastDone = document.getElementById('lastDone').value;
            
            if (!name || !nextDue) {
                alert('Please enter task name and due date');
                return;
            }
            
            const tasks = JSON.parse(localStorage.getItem('maintenanceTasks') || '[]');
            tasks.push({
                id: Date.now(),
                name,
                type,
                frequency,
                nextDue,
                lastDone,
                completed: false
            });
            localStorage.setItem('maintenanceTasks', JSON.stringify(tasks));
            loadMaintenanceTasks();
        }
        
        function loadMaintenanceTasks() {
            const tasks = JSON.parse(localStorage.getItem('maintenanceTasks') || '[]');
            const today = new Date().toISOString().split('T')[0];
            
            document.getElementById('maintenanceList').innerHTML = tasks.map(task => {
                const isOverdue = task.nextDue < today;
                const isDueSoon = task.nextDue <= new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
                const status = isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'On Track';
                const statusColor = isOverdue ? 'var(--danger)' : isDueSoon ? 'var(--warning)' : 'var(--success)';
                
                return `
                    <div class="file-card">
                        <div class="file-icon" style="background: ${statusColor}; font-size: 0.7em;">${task.type.slice(0,3).toUpperCase()}</div>
                        <div class="file-name">${task.name}</div>
                        <div class="file-meta">${task.frequency} • Due: ${task.nextDue}</div>
                        <div class="file-meta" style="color: ${statusColor}; font-weight: bold;">${status}</div>
                        <div class="file-actions">
                            <button class="btn" onclick="completeTask(${task.id})" style="background: var(--success); color: white;">Done</button>
                            <button class="btn btn-danger" onclick="deleteMaintenanceTask(${task.id})">Del</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function completeTask(id) {
            const tasks = JSON.parse(localStorage.getItem('maintenanceTasks') || '[]');
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            const today = new Date().toISOString().split('T')[0];
            task.lastDone = today;
            
            // Calculate next due date based on frequency
            const nextDate = new Date(today);
            switch(task.frequency) {
                case 'Daily': nextDate.setDate(nextDate.getDate() + 1); break;
                case 'Weekly': nextDate.setDate(nextDate.getDate() + 7); break;
                case 'Monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
                case 'Quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
                case 'Yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
                case 'Once': 
                    tasks.splice(tasks.findIndex(t => t.id === id), 1);
                    localStorage.setItem('maintenanceTasks', JSON.stringify(tasks));
                    loadMaintenanceTasks();
                    return;
            }
            
            task.nextDue = nextDate.toISOString().split('T')[0];
            localStorage.setItem('maintenanceTasks', JSON.stringify(tasks));
            loadMaintenanceTasks();
        }
        
        function deleteMaintenanceTask(id) {
            if (confirm('Delete this maintenance task?')) {
                const tasks = JSON.parse(localStorage.getItem('maintenanceTasks') || '[]');
                const filtered = tasks.filter(t => t.id !== id);
                localStorage.setItem('maintenanceTasks', JSON.stringify(filtered));
                loadMaintenanceTasks();
            }
        }

