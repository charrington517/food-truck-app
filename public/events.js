        // Event Functions
        function addEvent() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Event';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="eventName" placeholder="Event Name (e.g., Downtown Food Festival)">
                    </div>
                    <div class="form-row">
                        <select id="eventType">
                            <option value="Festival">Festival</option>
                            <option value="Farmers Market">Farmers Market</option>
                            <option value="Street Fair">Street Fair</option>
                            <option value="Concert">Concert</option>
                            <option value="Sports Event">Sports Event</option>
                            <option value="Corporate Event">Corporate Event</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="text" id="eventLocation" placeholder="Location">
                    </div>
                    <div class="form-row">
                        <input type="text" id="eventDate" placeholder="Start Date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                        <input type="text" id="eventEndDate" placeholder="End Date (optional)" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                    </div>
                    <div class="form-group">
                        <input type="text" id="eventTime" placeholder="Time (e.g., 10am-6pm)">
                    </div>
                    <div class="form-row">
                        <input type="number" id="applicationFee" placeholder="Application Fee ($)" step="0.01" min="0">
                        <select id="eventStatus">
                            <option value="Interested">Interested</option>
                            <option value="Applied">Applied</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Accepted & Paid">Accepted & Paid</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <textarea id="eventNotes" placeholder="Notes (organizer contact, requirements, competition...)" rows="2"></textarea>
                    </div>
                    <button class="btn" onclick="saveEvent(); closeAddModal();">Add Event</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function saveEvent() {
            const name = document.getElementById('eventName').value;
            const type = document.getElementById('eventType').value;
            const location = document.getElementById('eventLocation').value;
            const date = document.getElementById('eventDate').value;
            const endDate = document.getElementById('eventEndDate').value;
            const time = document.getElementById('eventTime').value;
            const fee = parseFloat(document.getElementById('applicationFee').value) || 0;
            const status = document.getElementById('eventStatus').value;
            const notes = document.getElementById('eventNotes').value;
            
            if (!name || !location || !date) {
                alert('Please fill in event name, location, and start date');
                return;
            }
            
            const events = JSON.parse(localStorage.getItem('events') || '[]');
            events.push({
                id: Date.now(),
                name,
                type,
                location,
                date,
                endDate,
                time,
                fee,
                status,
                notes,
                paid: false
            });
            localStorage.setItem('events', JSON.stringify(events));
            loadEvents();
        }
        
        function loadEvents() {
            fetch('/api/events')
                .then(r => r.json())
                .then(events => {
            const today = new Date().toISOString().split('T')[0];
            
            // Calculate stats
            const upcomingEvents = events.filter(e => e.date >= today && e.status === 'Accepted').length;
            const appliedEvents = events.filter(e => e.status === 'Applied').length;
            const completedEvents = events.filter(e => e.status === 'Completed').length;
            const totalFees = events.reduce((sum, e) => sum + (e.paid ? e.fee : 0), 0);
            
            document.getElementById('eventStats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${upcomingEvents}</div>
                    <div class="stat-label">Upcoming Events</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${appliedEvents}</div>
                    <div class="stat-label">Pending Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${completedEvents}</div>
                    <div class="stat-label">Completed Events</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${totalFees.toFixed(0)}</div>
                    <div class="stat-label">Total Fees Paid</div>
                </div>
            `;
            
            // Show events sorted by date
            const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
            document.getElementById('eventList').innerHTML = sortedEvents.map(event => {
                const isUpcoming = event.date >= today;
                const statusColors = {
                    'Interested': '#6c757d',
                    'Applied': '#ffc107',
                    'Accepted': '#28a745',
                    'Accepted & Paid': '#20c997',
                    'Rejected': '#dc3545',
                    'Completed': '#17a2b8'
                };
                
                return `
                    <div class="card">
                        <div class="card-header" onclick="toggleEventDetails(${event.id})" style="cursor: pointer;">
                            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${event.name}</span>
                                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                                    <span style="color: ${statusColors[event.status]}; font-size: 0.8em; font-weight: bold; white-space: nowrap;">${event.status}</span>
                                    ${event.fee > 0 ? `<span style="color: ${event.paid ? 'var(--success)' : 'var(--danger)'}; font-size: 0.7em; font-weight: bold; white-space: nowrap;">${event.paid ? 'PAID' : '✗ UNPAID'}</span>` : ''}
                                </div>
                            </div>
                            <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${event.type} • ${event.location}</span>
                                <span>${event.end_date ? `${event.date} - ${event.end_date}` : event.date}</span>
                            </div>
                        </div>
                        <div class="card-details" id="event-details-${event.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); overflow-wrap: break-word; word-wrap: break-word;">
                            ${event.time ? `<div class="card-meta">Time: ${event.time}</div>` : ''}
                            ${event.fee > 0 ? `<div class="card-meta">Fee: $${event.fee.toFixed(2)}</div>` : ''}
                            ${event.notes ? `<div class="card-meta" style="font-style: italic;">Notes: ${event.notes}</div>` : ''}
                            <div class="card-actions" style="margin-top: 10px;">
                                <button class="btn" onclick="editEvent(${event.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn" onclick="printEventDetails(${event.id})" style="background: #666; color: white;">Print</button>
                                <button class="btn" onclick="updateEventStatus(${event.id})" style="background: var(--success); color: white;">Status</button>
                                ${event.fee > 0 ? `<button class="btn" onclick="togglePayment(${event.id})" style="background: ${event.paid ? 'var(--danger)' : 'var(--success)'}; color: white;">${event.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>` : ''}
                                <button class="btn" onclick="openNotesModal('event', ${event.id}, '${event.name.replace(/'/g, "\\'")}')" style="background: #666; color: white;">Notes</button>
                                <button class="btn" onclick="archiveEvent(${event.id})" style="background: #6c757d; color: white;">Archive</button>
                                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            });
        }
        
        function updateEventStatus(id) {
            fetch('/api/events')
                .then(r => r.json())
                .then(events => {
                    const event = events.find(e => e.id === id);
                    if (!event) return;
                    
                    const statusOptions = ['Interested', 'Applied', 'Accepted', 'Accepted & Paid', 'Rejected', 'Completed'];
                    const optionsText = statusOptions.map((status, index) => `${index + 1}. ${status}`).join('\n');
                    
                    const choice = prompt(`Current status: ${event.status}\n\nSelect new status:\n${optionsText}\n\nEnter number (1-6):`);
                    const choiceNum = parseInt(choice);
                    
                    if (choiceNum >= 1 && choiceNum <= 6) {
                        const newStatus = statusOptions[choiceNum - 1];
                        fetch(`/api/events/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...event, status: newStatus, end_date: event.end_date })
                        }).then(() => loadEvents());
                    }
                });
        }
        
        function editEvent(id) {
            fetch('/api/events')
                .then(r => r.json())
                .then(events => {
                    const event = events.find(e => e.id === id);
                    if (!event) return;
            
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Edit Event';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="eventName" placeholder="Event Name" value="${event.name}">
                    </div>
                    <div class="form-row">
                        <select id="eventType">
                            <option value="Festival" ${event.type === 'Festival' ? 'selected' : ''}>Festival</option>
                            <option value="Farmers Market" ${event.type === 'Farmers Market' ? 'selected' : ''}>Farmers Market</option>
                            <option value="Street Fair" ${event.type === 'Street Fair' ? 'selected' : ''}>Street Fair</option>
                            <option value="Concert" ${event.type === 'Concert' ? 'selected' : ''}>Concert</option>
                            <option value="Sports Event" ${event.type === 'Sports Event' ? 'selected' : ''}>Sports Event</option>
                            <option value="Corporate Event" ${event.type === 'Corporate Event' ? 'selected' : ''}>Corporate Event</option>
                            <option value="Other" ${event.type === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                        <input type="text" id="eventLocation" placeholder="Location" value="${event.location}">
                    </div>
                    <div class="form-row">
                        <input type="date" id="eventDate" value="${event.date}">
                        <input type="date" id="eventEndDate" placeholder="End Date" value="${event.endDate || ''}">
                    </div>
                    <div class="form-group">
                        <input type="text" id="eventTime" placeholder="Time" value="${event.time || ''}">
                    </div>
                    <div class="form-row">
                        <input type="number" id="applicationFee" placeholder="Application Fee ($)" step="0.01" min="0" value="${event.fee}">
                        <select id="eventStatus">
                            <option value="Interested" ${event.status === 'Interested' ? 'selected' : ''}>Interested</option>
                            <option value="Applied" ${event.status === 'Applied' ? 'selected' : ''}>Applied</option>
                            <option value="Accepted" ${event.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="Accepted & Paid" ${event.status === 'Accepted & Paid' ? 'selected' : ''}>Accepted & Paid</option>
                            <option value="Rejected" ${event.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            <option value="Completed" ${event.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <textarea id="eventNotes" placeholder="Notes" rows="2">${event.notes || ''}</textarea>
                    </div>
                    <button class="btn" onclick="updateEvent(${id}); closeAddModal();">Update Event</button>
                </div>
            `;
            
            modal.classList.add('show');
                });
        }
        
        function updateEvent(id) {
            const name = document.getElementById('eventName').value;
            const type = document.getElementById('eventType').value;
            const location = document.getElementById('eventLocation').value;
            const date = document.getElementById('eventDate').value;
            const endDate = document.getElementById('eventEndDate').value;
            const time = document.getElementById('eventTime').value;
            const fee = parseFloat(document.getElementById('applicationFee').value) || 0;
            const status = document.getElementById('eventStatus').value;
            const notes = document.getElementById('eventNotes').value;
            
            if (!name || !location || !date) {
                alert('Please fill in event name, location, and start date');
                return;
            }
            
            fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, location, date, end_date: endDate, time, fee, status, notes, paid: 0 })
            }).then(() => loadEvents());
        }
        
        function archiveEvent(id) {
            if (confirm('Archive this event? You can restore it later from Archives.')) {
                fetch(`/api/events/${id}/archive`, { method: 'POST' })
                    .then(() => loadEvents());
            }
        }
        
        function deleteEvent(id) {
            if (confirm('Delete this event?')) {
                fetch(`/api/events/${id}`, { method: 'DELETE' })
                    .then(() => loadEvents());
            }
        }







        
        function toggleEventDetails(id) {
            const details = document.getElementById(`event-details-${id}`);
            
            if (details.style.display === 'none') {
                details.style.display = 'block';
            } else {
                details.style.display = 'none';
            }
        }
        
        function togglePayment(id) {
            fetch('/api/events')
                .then(r => r.json())
                .then(events => {
                    const event = events.find(e => e.id === id);
                    if (!event) return;
                    
                    fetch(`/api/events/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...event, paid: event.paid ? 0 : 1, end_date: event.end_date })
                    }).then(() => loadEvents());
                });
        }

