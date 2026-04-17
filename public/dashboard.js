        // Dashboard Functions
        function checkExpiringLicenses() {
            fetch('/api/licenses')
                .then(r => r.json())
                .then(licenses => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const ninetyDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
                    
                    const expiring = licenses.filter(license => {
                        if (!license.expiry_date) return false;
                        const expiryDate = new Date(license.expiry_date);
                        expiryDate.setHours(0, 0, 0, 0);
                        return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
                    });
                    
                    const alertsDiv = document.getElementById('licenseAlerts');
                    if (expiring.length > 0) {
                        alertsDiv.style.display = 'block';
                        alertsDiv.innerHTML = expiring.map(license => {
                            const expiryDate = new Date(license.expiry_date);
                            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                            const urgency = daysUntilExpiry <= 30 ? 'background: #dc3545; color: white;' : daysUntilExpiry <= 60 ? 'background: #ffc107; color: black;' : 'background: #17a2b8; color: white;';
                            return `
                                <div style="padding: 15px; margin-bottom: 10px; border-radius: 8px; ${urgency}">
                                    <strong>License Expiring:</strong> ${license.name} expires in ${daysUntilExpiry} days (${license.expiry_date})
                                </div>
                            `;
                        }).join('');
                    } else {
                        alertsDiv.style.display = 'none';
                    }
                });
            
            fetch('/api/employees')
                .then(r => r.json())
                .then(employees => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
                    
                    const issues = employees.filter(emp => {
                        if (!emp.food_handler_expiration) return true;
                        const expiryDate = new Date(emp.food_handler_expiration);
                        expiryDate.setHours(0, 0, 0, 0);
                        return expiryDate <= thirtyDaysFromNow;
                    });
                    
                    const alertsDiv = document.getElementById('foodHandlerAlerts');
                    if (issues.length > 0) {
                        alertsDiv.style.display = 'block';
                        alertsDiv.innerHTML = issues.map(emp => {
                            if (!emp.food_handler_expiration) {
                                return `
                                    <div style="padding: 15px; margin-bottom: 10px; border-radius: 8px; background: #dc3545; color: white;">
                                        <strong>Food Handler Card:</strong> ${emp.name} has NO card on file
                                    </div>
                                `;
                            }
                            const expiryDate = new Date(emp.food_handler_expiration);
                            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                            const urgency = daysUntilExpiry < 0 ? 'background: #dc3545; color: white;' : daysUntilExpiry <= 7 ? 'background: #dc3545; color: white;' : daysUntilExpiry <= 14 ? 'background: #ffc107; color: black;' : 'background: #17a2b8; color: white;';
                            const message = daysUntilExpiry < 0 ? 'EXPIRED' : `expires in ${daysUntilExpiry} days`;
                            return `
                                <div style="padding: 15px; margin-bottom: 10px; border-radius: 8px; ${urgency}">
                                    <strong>Food Handler Card:</strong> ${emp.name}'s card ${message} (${emp.food_handler_expiration})
                                </div>
                            `;
                        }).join('');
                    } else {
                        alertsDiv.style.display = 'none';
                    }
                });
        }

        function loadUpcomingSchedule() {
            const today = new Date().toISOString().split('T')[0];
            const futureDate = new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0];
            
            Promise.all([
                fetch('/api/events').then(r => r.json()),
                fetch('/api/catering').then(r => r.json())
            ]).then(([events, catering]) => {
                const upcomingEvents = events.filter(e => e.date && e.date >= today && e.date <= futureDate);
                const upcomingCatering = catering.filter(c => c.date && c.date >= today && c.date <= futureDate);
                
                const allUpcoming = [
                    ...upcomingEvents.map(e => ({...e, type: 'event'})),
                    ...upcomingCatering.map(c => ({...c, type: 'catering'}))
                ].sort((a, b) => new Date(a.date) - new Date(b.date));

                let scheduleHtml = '';
                if (allUpcoming.length === 0) {
                    scheduleHtml = `
                        <div class="card" style="text-align: center; color: var(--gray);">
                            <div class="card-title">No upcoming events</div>
                            <div class="card-meta">Add events or catering orders to see your schedule</div>
                        </div>
                    `;
                } else {
                    scheduleHtml = allUpcoming.slice(0, 6).map(item => {
                        const isToday = item.date === today;
                        const daysDiff = Math.ceil((new Date(item.date) - new Date()) / (1000 * 60 * 60 * 24));
                        const timeText = daysDiff === 0 ? 'Today' : daysDiff === 1 ? 'Tomorrow' : `${daysDiff} days`;
                        const typeColor = item.type === 'event' ? '#17a2b8' : '#28a745';
                        const typeLabel = item.type === 'event' ? 'EVENT' : 'CATERING';
                        
                        return `
                            <div class="card" style="${isToday ? 'border-color: var(--orange); background: rgba(255, 107, 53, 0.05);' : ''} cursor: pointer; border-left: 4px solid ${typeColor};" onclick="${item.type === 'event' ? `showPage('events');` : `showPage('catering');`}">
                                <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                    <span>${item.type === 'event' ? item.name : item.client}</span>
                                    <span style="background: ${typeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; font-weight: bold;">${typeLabel}</span>
                                </div>
                                <div class="card-meta">${item.type === 'event' ? item.location : `${item.guests} guests`}</div>
                                <div class="card-meta" style="color: ${isToday ? 'var(--orange)' : 'var(--gray)'}; font-weight: ${isToday ? 'bold' : 'normal'};">${item.date} • ${timeText}</div>
                                ${item.type === 'catering' && item.price ? `<div class="card-meta">$${item.price.toFixed(2)}</div>` : ''}
                            </div>
                        `;
                    }).join('');
                }
                
                document.getElementById('upcomingSchedule').innerHTML = scheduleHtml;
            });
        }
        
        function loadDashboard() {
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const totalItems = items.length;
                    const avgFoodCost = totalItems > 0 ? items.reduce((sum, item) => sum + ((item.cost / item.price) * 100), 0) / totalItems : 0;
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    const goodItems = items.filter(item => ((item.price - item.cost) / item.price) * 100 >= defaultMargin).length;
                    const totalRevenue = items.reduce((sum, item) => sum + (item.price * 10), 0);

                    document.getElementById('dashboardStats').innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number">${totalItems}</div>
                            <div class="stat-label">Menu Items</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${avgFoodCost.toFixed(1)}%</div>
                            <div class="stat-label">Avg Food Cost</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${goodItems}</div>
                            <div class="stat-label">Good Items (30%+)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${totalRevenue.toFixed(0)}</div>
                            <div class="stat-label">Est. Revenue</div>
                        </div>
                    `;

                    const topItems = items.sort((a, b) => (b.cost / b.price) - (a.cost / a.price)).slice(0, 6);
                    document.getElementById('topItems').innerHTML = topItems.map(item => {
                        const foodCost = (item.cost / item.price) * 100;
                        const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                        const margin = ((item.price - item.cost) / item.price) * 100;
                        const status = margin >= defaultMargin ? 'Good' : margin >= (defaultMargin * 0.67) ? 'Needs Attention' : 'Bad - Urgent';
                        return `
                            <div class="card">
                                <div class="card-title">${item.name}</div>
                                <div class="card-meta">$${item.price} • ${foodCost.toFixed(1)}% food cost</div>
                                <div class="card-meta">${status}</div>
                            </div>
                        `;
                    }).join('');
                    
                    // Load upcoming schedule
                    loadUpcomingSchedule();
                    
                    // Check for expiring licenses
                    checkExpiringLicenses();
                });
        }

