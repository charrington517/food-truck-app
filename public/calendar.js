        // Calendar Functions
        let currentCalendarDate = new Date();
        let calendarData = { events: [], catering: [], maintenance: [] };
        let calendarClickedItem = null;
        
        window.openCalendar = function() {
            document.getElementById('calendarModal').classList.add('show');
            loadCalendarData();
        }
        
        window.closeCalendar = function() {
            document.getElementById('calendarModal').classList.remove('show');
        }
        
        function previousMonth() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar();
        }
        
        function nextMonth() {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar();
        }
        
        async function loadCalendarData() {
            const [events, catering, maintenance] = await Promise.all([
                fetch('/api/events').then(r => r.json()),
                fetch('/api/catering').then(r => r.json()),
                fetch('/api/maintenance').then(r => r.json()).catch(() => [])
            ]);
            
            calendarData = { events, catering, maintenance };
            renderCalendar();
        }
        
        function renderCalendar() {
            const year = currentCalendarDate.getFullYear();
            const month = currentCalendarDate.getMonth();
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let html = '';
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayNames.forEach(day => {
                html += `<div style="font-weight: bold; text-align: center; padding: 6px; background: var(--orange); color: white; border-radius: 4px; font-size: 12px;">${day}</div>`;
            });
            
            for (let i = 0; i < firstDay; i++) {
                html += `<div style="background: var(--gray-light); border-radius: 4px; min-height: 80px;"></div>`;
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                
                const dayEvents = calendarData.events.filter(e => e.date === dateStr);
                const dayCatering = calendarData.catering.filter(c => c.date === dateStr);
                const dayMaintenance = calendarData.maintenance.filter(m => m.date === dateStr);
                
                html += `<div style="background: var(--white); border: 1px solid ${isToday ? 'var(--orange)' : 'var(--border)'}; border-radius: 4px; padding: 4px; min-height: 80px; position: relative; overflow-y: auto;">`;
                html += `<div style="font-weight: bold; margin-bottom: 4px; color: ${isToday ? 'var(--orange)' : 'var(--charcoal)'}; font-size: 14px;">${day}</div>`;
                
                dayEvents.forEach(e => {
                    html += `<div onclick="calendarClickedItem={type:'event',id:${e.id}}; window.closeCalendar(); window.showPage('events');" style="background: #007bff; color: white; padding: 2px 4px; margin-bottom: 2px; border-radius: 3px; font-size: 10px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${e.name}\n${e.location || ''}\n${e.date} ${e.time || ''}">${e.name}</div>`;
                });
                
                dayCatering.forEach(c => {
                    html += `<div onclick="calendarClickedItem={type:'catering',id:${c.id}}; window.closeCalendar(); window.showPage('catering');" style="background: #28a745; color: white; padding: 2px 4px; margin-bottom: 2px; border-radius: 3px; font-size: 10px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${c.client}\n${c.guests} guests\n${c.date}\n$${c.price || 0}">${c.client}</div>`;
                });
                
                dayMaintenance.forEach(m => {
                    html += `<div onclick="calendarClickedItem={type:'maintenance',id:${m.id}}; window.closeCalendar(); window.showPage('tools');" style="background: #ff6b35; color: white; padding: 2px 4px; margin-bottom: 2px; border-radius: 3px; font-size: 10px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${m.task}\n${m.date}">${m.task}</div>`;
                });
                
                html += `</div>`;
            }
            
            document.getElementById('calendarGrid').innerHTML = html;
        }
        


        function loadArchives() {
            fetch('/api/archived-events')
                .then(r => r.json())
                .then(events => {
                    document.getElementById('archivedEventsList').innerHTML = events.map(e => `
                        <div class="card">
                            <div class="card-title">${e.name}</div>
                            <div class="card-meta">${e.location || 'N/A'} • ${e.date}</div>
                            <div class="card-meta">Archived: ${new Date(e.archived_date).toLocaleDateString()}</div>
                            <div class="card-actions">
                                <button class="btn" onclick="restoreEvent(${e.id})" style="background: var(--success); color: white;">Restore</button>
                            </div>
                        </div>
                    `).join('');
                });
            
            fetch('/api/archived-catering')
                .then(r => r.json())
                .then(orders => {
                    document.getElementById('archivedCateringList').innerHTML = orders.map(c => `
                        <div class="card">
                            <div class="card-title">${c.client}</div>
                            <div class="card-meta">${c.guests} guests • ${c.date}</div>
                            <div class="card-meta">Archived: ${new Date(c.archived_date).toLocaleDateString()}</div>
                            <div class="card-actions">
                                <button class="btn" onclick="restoreCateringOrder(${c.id})" style="background: var(--success); color: white;">Restore</button>
                            </div>
                        </div>
                    `).join('');
                });
        }
        
        function restoreEvent(id) {
            if (confirm('Restore this event to active events?')) {
                fetch(`/api/archived-events/${id}/restore`, { method: 'POST' })
                    .then(() => loadArchives());
            }
        }
        
        function restoreCateringOrder(id) {
            if (confirm('Restore this order to active catering?')) {
                fetch(`/api/archived-catering/${id}/restore`, { method: 'POST' })
                    .then(() => loadArchives());
            }
        }

        function downloadBackup() {
            if (confirm('Download a backup of your entire database?')) {
                window.location.href = '/api/backup/download';
            }
        }
        
        function uploadBackup() {
            const file = document.getElementById('restoreFile').files[0];
            if (!file) return;
            
            if (!confirm('WARNING: This will replace ALL current data with the backup file. Continue?')) {
                document.getElementById('restoreFile').value = '';
                return;
            }
            
            const formData = new FormData();
            formData.append('backup', file);
            
            fetch('/api/backup/restore', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    alert('Backup restored successfully! Reloading...');
                    location.reload();
                } else {
                    alert('Restore failed: ' + data.error);
                }
            })
            .catch(err => alert('Restore failed: ' + err));
        }

