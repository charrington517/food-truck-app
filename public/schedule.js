        // Weekly Schedule Functions
        let currentWeekStart = new Date();
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
        
        function toggleAvailability() {
            const container = document.getElementById('availabilityContainer');
            const icon = document.getElementById('availability-icon');
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                loadAvailabilityEmployees();
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        async function loadAvailabilityEmployees() {
            const employees = await fetch('/api/employees').then(r => r.json());
            const select = document.getElementById('availabilityEmployee');
            select.innerHTML = '<option value="">Select employee...</option>' + employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
        }
        
        async function loadEmployeeAvailability() {
            const employeeId = document.getElementById('availabilityEmployee').value;
            if (!employeeId) {
                document.getElementById('availabilityGrid').innerHTML = '';
                return;
            }
            
            const availability = await fetch(`/api/availability/${employeeId}`).then(r => r.json());
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            let html = '';
            days.forEach((day, index) => {
                const avail = availability.find(a => a.day_of_week === index) || { available: false, start_time: '09:00', end_time: '17:00' };
                html += `<div style="background: var(--gray-light); padding: 12px; border-radius: 6px; margin-bottom: 8px;">`;
                html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">`;
                html += `<span style="font-weight: 600;">${day}</span>`;
                html += `<label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="avail-${index}" ${avail.available ? 'checked' : ''} onchange="toggleDayAvailability(${employeeId}, ${index})"> Available</label>`;
                html += `</div>`;
                html += `<div id="times-${index}" style="${avail.available ? '' : 'display:none;'}display: flex; gap: 8px;">`;
                html += `<input type="time" id="start-${index}" value="${avail.start_time || '09:00'}" style="flex: 1; padding: 6px;" onchange="updateAvailability(${employeeId}, ${index})">`;
                html += `<input type="time" id="end-${index}" value="${avail.end_time || '17:00'}" style="flex: 1; padding: 6px;" onchange="updateAvailability(${employeeId}, ${index})">`;
                html += `</div></div>`;
            });
            
            document.getElementById('availabilityGrid').innerHTML = html;
        }
        
        async function toggleDayAvailability(employeeId, dayOfWeek) {
            const available = document.getElementById(`avail-${dayOfWeek}`).checked;
            const timesDiv = document.getElementById(`times-${dayOfWeek}`);
            timesDiv.style.display = available ? 'flex' : 'none';
            await updateAvailability(employeeId, dayOfWeek);
        }
        
        async function updateAvailability(employeeId, dayOfWeek) {
            const available = document.getElementById(`avail-${dayOfWeek}`).checked;
            const startTime = document.getElementById(`start-${dayOfWeek}`).value;
            const endTime = document.getElementById(`end-${dayOfWeek}`).value;
            
            await fetch('/api/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: employeeId, day_of_week: dayOfWeek, available, start_time: startTime, end_time: endTime })
            });
        }

        function toggleWeeklySchedule() {
            const container = document.getElementById('weeklyScheduleContainer');
            const icon = document.getElementById('schedule-icon');
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                document.getElementById('scheduleWeekStart').valueAsDate = currentWeekStart;
                loadWeeklySchedule();
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }

        function previousWeek() {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            document.getElementById('scheduleWeekStart').valueAsDate = currentWeekStart;
            loadWeeklySchedule();
        }

        function nextWeek() {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            document.getElementById('scheduleWeekStart').valueAsDate = currentWeekStart;
            loadWeeklySchedule();
        }

        async function loadWeeklySchedule() {
            const weekStart = new Date(document.getElementById('scheduleWeekStart').value);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const [schedules, employees] = await Promise.all([
                fetch('/api/schedules').then(r => r.json()),
                fetch('/api/employees').then(r => r.json())
            ]);

            const weekSchedules = schedules.filter(s => {
                const shiftDate = new Date(s.shift_date);
                return shiftDate >= weekStart && shiftDate <= weekEnd;
            });

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = new Date().toISOString().split('T')[0];
            let html = '';

            for (let i = 0; i < 7; i++) {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const daySchedules = weekSchedules.filter(s => s.shift_date === dateStr);
                const isToday = dateStr === today;

                html += `<div style="background: var(--gray-light); border-left: 4px solid ${isToday ? 'var(--orange)' : 'transparent'}; padding: 12px; border-radius: 6px; margin-bottom: 10px;">`;
                html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">`;
                html += `<div><span style="font-weight: 700; font-size: 1em; color: ${isToday ? 'var(--orange)' : 'var(--charcoal)'};">${days[i]}</span> <span style="font-size: 0.85em; color: var(--gray);">${date.getMonth() + 1}/${date.getDate()}</span></div>`;
                html += `</div>`;

                if (daySchedules.length === 0) {
                    html += `<div style="color: var(--gray); font-size: 0.85em; font-style: italic;">No shifts scheduled</div>`;
                } else {
                    html += `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
                    daySchedules.forEach(shift => {
                        html += `<div style="background: var(--orange); color: white; padding: 8px 12px; border-radius: 6px; font-size: 0.85em; display: inline-block;">`;
                        html += `<div style="font-weight: 600;">${shift.employee_name}</div>`;
                        html += `<div style="opacity: 0.9;">${shift.start_time} - ${shift.end_time}</div>`;
                        if (shift.event_name) html += `<div style="font-size: 0.9em; margin-top: 2px; opacity: 0.8;">${shift.event_name}</div>`;
                        html += `<div style="display: flex; gap: 4px; margin-top: 4px;">`;
                        html += `<button onclick="editShift(${shift.id}); event.stopPropagation();" style="background: rgba(0,0,0,0.2); color: white; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; cursor: pointer; flex: 1;">Edit</button>`;
                        html += `<button onclick="deleteShift(${shift.id}); event.stopPropagation();" style="background: rgba(0,0,0,0.2); color: white; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; cursor: pointer; flex: 1;">Remove</button>`;
                        html += `</div></div>`;
                    });
                    html += `</div>`;
                }

                html += `</div>`;
            }

            document.getElementById('weeklySchedule').innerHTML = html;
            calculateOvertime(weekSchedules, employees);
        }

        function calculateOvertime(schedules, employees) {
            const employeeHours = {};
            schedules.forEach(s => {
                if (!employeeHours[s.employee_id]) {
                    employeeHours[s.employee_id] = { name: s.employee_name, hours: 0 };
                }
                employeeHours[s.employee_id].hours += s.hours || 0;
            });

            let html = '';
            Object.values(employeeHours).forEach(emp => {
                if (emp.hours > 40) {
                    html += `<div style="background: var(--warning); color: var(--charcoal); padding: 8px; border-radius: 4px; margin-bottom: 6px;">`;
                    html += `<strong>${emp.name}:</strong> ${emp.hours.toFixed(1)} hours (${(emp.hours - 40).toFixed(1)} overtime)`;
                    html += `</div>`;
                }
            });

            document.getElementById('overtimeAlerts').innerHTML = html || '<div style="color: var(--text-secondary); font-size: 0.9em;">No overtime this week</div>';
        }

        async function addShift() {
            const employees = await fetch('/api/employees').then(r => r.json());
            const events = await fetch('/api/events').then(r => r.json());

            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');

            modalTitle.textContent = 'Add Shift';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Employee:</label>
                        <select id="shiftEmployee" style="width: 100%; padding: 8px;">
                            <option value="">Select employee...</option>
                            ${employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="shiftDate" style="width: 100%; padding: 8px;">
                    </div>
                    <div class="form-row">
                        <div style="flex: 1;">
                            <label>Start Time:</label>
                            <input type="time" id="shiftStart" style="width: 100%; padding: 8px;">
                        </div>
                        <div style="flex: 1;">
                            <label>End Time:</label>
                            <input type="time" id="shiftEnd" style="width: 100%; padding: 8px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Event (optional):</label>
                        <select id="shiftEvent" style="width: 100%; padding: 8px;">
                            <option value="">No event</option>
                            ${events.map(e => `<option value="${e.id}">${e.name} - ${e.date}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notes:</label>
                        <textarea id="shiftNotes" style="width: 100%; padding: 8px;" rows="2"></textarea>
                    </div>
                    <button class="btn" onclick="saveShift()" style="background: var(--orange); color: white;">Save Shift</button>
                </div>
            `;
            modal.classList.add('show');
        }

        async function saveShift() {
            const employeeId = document.getElementById('shiftEmployee').value;
            const date = document.getElementById('shiftDate').value;
            const startTime = document.getElementById('shiftStart').value;
            const endTime = document.getElementById('shiftEnd').value;
            const eventId = document.getElementById('shiftEvent').value || null;
            const notes = document.getElementById('shiftNotes').value;

            if (!employeeId || !date || !startTime || !endTime) {
                alert('Please fill in employee, date, start time, and end time');
                return;
            }

            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const hours = (end - start) / (1000 * 60 * 60);

            const response = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    event_id: eventId,
                    shift_date: date,
                    start_time: startTime,
                    end_time: endTime,
                    hours: hours,
                    notes: notes
                })
            });

            if (response.ok) {
                closeAddModal();
                const shiftDate = new Date(date);
                const weekStart = new Date(shiftDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                currentWeekStart = weekStart;
                document.getElementById('scheduleWeekStart').valueAsDate = weekStart;
                loadWeeklySchedule();
            } else {
                alert('Failed to save shift');
            }
        }

        async function editShift(id) {
            const schedules = await fetch('/api/schedules').then(r => r.json());
            const shift = schedules.find(s => s.id === id);
            if (!shift) return;
            
            const employees = await fetch('/api/employees').then(r => r.json());
            const events = await fetch('/api/events').then(r => r.json());
            
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Edit Shift';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Employee:</label>
                        <select id="shiftEmployee" style="width: 100%; padding: 8px;">
                            ${employees.map(e => `<option value="${e.id}" ${e.id == shift.employee_id ? 'selected' : ''}>${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="shiftDate" value="${shift.shift_date}" style="width: 100%; padding: 8px;">
                    </div>
                    <div class="form-row">
                        <div style="flex: 1;">
                            <label>Start Time:</label>
                            <input type="time" id="shiftStart" value="${shift.start_time}" style="width: 100%; padding: 8px;">
                        </div>
                        <div style="flex: 1;">
                            <label>End Time:</label>
                            <input type="time" id="shiftEnd" value="${shift.end_time}" style="width: 100%; padding: 8px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Event (optional):</label>
                        <select id="shiftEvent" style="width: 100%; padding: 8px;">
                            <option value="">No event</option>
                            ${events.map(e => `<option value="${e.id}" ${e.id == shift.event_id ? 'selected' : ''}>${e.name} - ${e.date}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notes:</label>
                        <textarea id="shiftNotes" style="width: 100%; padding: 8px;" rows="2">${shift.notes || ''}</textarea>
                    </div>
                    <button class="btn" onclick="updateShift(${id})" style="background: var(--orange); color: white;">Update Shift</button>
                </div>
            `;
            modal.classList.add('show');
        }
        
        async function updateShift(id) {
            const employeeId = document.getElementById('shiftEmployee').value;
            const date = document.getElementById('shiftDate').value;
            const startTime = document.getElementById('shiftStart').value;
            const endTime = document.getElementById('shiftEnd').value;
            const eventId = document.getElementById('shiftEvent').value || null;
            const notes = document.getElementById('shiftNotes').value;
            
            if (!employeeId || !date || !startTime || !endTime) {
                alert('Please fill in employee, date, start time, and end time');
                return;
            }
            
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const hours = (end - start) / (1000 * 60 * 60);
            
            await fetch(`/api/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: employeeId,
                    event_id: eventId,
                    shift_date: date,
                    start_time: startTime,
                    end_time: endTime,
                    hours: hours,
                    notes: notes
                })
            });
            
            closeAddModal();
            loadWeeklySchedule();
        }
        
        async function deleteShift(id) {
            if (!confirm('Delete this shift?')) return;
            await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
            loadWeeklySchedule();
        }

        function printWeeklySchedule() {
            const printWindow = window.open('', '', 'width=800,height=600');
            const content = document.getElementById('weeklySchedule').innerHTML;
            const weekStart = document.getElementById('scheduleWeekStart').value;
            printWindow.document.write('<html><head><title>Weekly Staff Schedule</title>');
            printWindow.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;}h1{text-align:center;}p{text-align:center;color:#666;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write('<h1>Weekly Staff Schedule</h1>');
            printWindow.document.write('<p>Week of: ' + weekStart + '</p>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }

