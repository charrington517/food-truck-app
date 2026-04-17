        // Menu Specials Functions
        async function loadMenuSpecials() {
            const specials = await fetch('/api/menu-specials').then(r => r.json());
            if (specials.length === 0) {
                document.getElementById('menuSpecialsList').innerHTML = '<div class="card" style="text-align: center; color: var(--gray);"><div class="card-title">No specials planned</div><div class="card-meta">Add rotating specials or seasonal items</div></div>';
                return;
            }
            
            const today = new Date().toISOString().split('T')[0];
            const specialsHtml = await Promise.all(specials.map(async special => {
                const data = await fetch(`/api/recipes/special/${special.id}`).then(r => r.json());
                const ingredients = JSON.parse(data.ingredients || '[]');
                const cost = ingredients.reduce((sum, ing) => sum + (ing.calculatedCost || 0), 0);
                const margin = special.price && cost ? (((special.price - cost) / special.price) * 100).toFixed(1) : 0;
                
                let isActive, isPast, isFuture;
                if (special.start_date && special.end_date) {
                    isActive = special.start_date <= today && special.end_date >= today;
                    isPast = special.end_date < today;
                    isFuture = special.start_date > today;
                } else {
                    isActive = true;
                    isPast = false;
                    isFuture = false;
                }
                const statusColor = isActive ? 'var(--success)' : isPast ? 'var(--gray)' : 'var(--warning)';
                const statusText = isActive ? 'ACTIVE' : isPast ? 'ENDED' : 'SCHEDULED';
                const days = special.days_of_week ? JSON.parse(special.days_of_week).map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') : 'All days';
                const dateRange = special.start_date && special.end_date ? `${special.start_date} to ${special.end_date}` : 'Ongoing';
                const categoryDisplay = days !== 'All days' ? `${special.category.charAt(0).toUpperCase() + special.category.slice(1)} - ${days}` : special.category.charAt(0).toUpperCase() + special.category.slice(1);
                
                return `
                    <div class="card">
                        <div class="card-header" onclick="toggleSpecialDetails(${special.id})" style="cursor: pointer;">
                            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${special.name}</span>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <span style="background: ${statusColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; font-weight: bold;">${statusText}</span>
                                    <span class="expand-icon" id="special-icon-${special.id}">▼</span>
                                </div>
                            </div>
                            <div class="card-meta">${categoryDisplay} • ${dateRange}</div>
                            <div class="card-meta">Price: ${special.price ? '$' + special.price.toFixed(2) : 'Not set'}${cost > 0 ? ` • Cost: $${cost.toFixed(2)} • Margin: ${margin}%` : ''}</div>
                        </div>
                        <div class="card-details" id="special-details-${special.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                            ${special.description ? `<div style="margin-bottom: 10px; font-style: italic;">${special.description}</div>` : ''}
                            ${ingredients.length > 0 ? `
                                <h4 style="margin-bottom: 10px;">Ingredients:</h4>
                                ${ingredients.map(ing => `
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: var(--gray-light); border-radius: 6px;">
                                        <span>${ing.name}</span>
                                        <span>${ing.amount} servings - $${(ing.calculatedCost || 0).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            ` : '<div style="color: var(--gray); font-style: italic;">No ingredients added</div>'}
                        </div>
                        <div class="card-actions" style="margin-top: 15px;">
                            <button class="btn" onclick="event.stopPropagation(); editMenuSpecial(${special.id})" style="background: var(--orange); color: white;">Edit</button>
                            <button class="btn btn-danger" onclick="event.stopPropagation(); deleteMenuSpecial(${special.id})">Delete</button>
                        </div>
                    </div>
                `;
            }));
            
            document.getElementById('menuSpecialsList').innerHTML = specialsHtml.join('');
        }
        
        function addMenuSpecial() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Menu Special';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="specialName" placeholder="Special Name (e.g., Summer Mango Tacos)">
                    </div>
                    <div class="form-group">
                        <textarea id="specialDescription" placeholder="Description" rows="2"></textarea>
                    </div>
                    <div class="form-row">
                        <input type="number" id="specialPrice" placeholder="Price ($)" step="0.01">
                        <select id="specialCategory">
                            ${getAllSpecialCategories().map(cat => `<option value="${cat.toLowerCase()}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <input type="date" id="specialStartDate" placeholder="Start Date (optional)">
                        <input type="date" id="specialEndDate" placeholder="End Date (optional)">
                    </div>
                    <div style="font-size: 0.85em; color: var(--gray); margin-bottom: 10px;">Leave dates empty for ongoing specials</div>
                    <div class="form-group">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Available Days:</label>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="0" class="day-checkbox"> Sun</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="1" class="day-checkbox"> Mon</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="2" class="day-checkbox"> Tue</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="3" class="day-checkbox"> Wed</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="4" class="day-checkbox"> Thu</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="5" class="day-checkbox"> Fri</label>
                            <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="6" class="day-checkbox"> Sat</label>
                        </div>
                    </div>
                    <button class="btn" onclick="saveMenuSpecial(); closeAddModal();">Add Special</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function saveMenuSpecial() {
            const name = document.getElementById('specialName').value.trim();
            const description = document.getElementById('specialDescription').value.trim();
            const price = parseFloat(document.getElementById('specialPrice').value) || null;
            const category = document.getElementById('specialCategory').value;
            const startDate = document.getElementById('specialStartDate').value || null;
            const endDate = document.getElementById('specialEndDate').value || null;
            const days = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => parseInt(cb.value));
            
            if (!name) {
                alert('Please enter a name for the special');
                return;
            }
            
            fetch('/api/menu-specials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price,
                    start_date: startDate,
                    end_date: endDate,
                    days_of_week: days.length > 0 ? JSON.stringify(days) : null,
                    status: 'scheduled',
                    category
                })
            }).then(() => loadMenuSpecials());
        }
        
        function editMenuSpecial(id) {
            editingRecipeId = id;
            fetch(`/api/recipes/special/${id}`)
                .then(r => r.json())
                .then(data => {
                    editIngredients = JSON.parse(data.ingredients || '[]');
                    return fetch('/api/menu-specials');
                })
                .then(r => r.json())
                .then(specials => {
                    const special = specials.find(s => s.id === id);
                    if (!special) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    const days = special.days_of_week ? JSON.parse(special.days_of_week) : [];
                    const ingredients = editIngredients;
                    const calculatedCost = ingredients.reduce((sum, ing) => sum + (ing.calculatedCost || 0), 0);
                    
                    modalTitle.textContent = 'Edit Menu Special';
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <input type="text" id="specialName" placeholder="Special Name" value="${special.name}">
                            </div>
                            <div class="form-group">
                                <textarea id="specialDescription" placeholder="Description" rows="2">${special.description || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;"><label>Price ($)</label><input type="number" id="specialPrice" placeholder="Price" step="0.01" value="${special.price || ''}"></div>
                                <div style="flex: 1;"><label>Cost ($)</label><input type="number" id="specialCost" placeholder="Cost" step="0.01" value="${calculatedCost.toFixed(2)}" readonly style="background: var(--gray-light);"></div>
                            </div>
                            <div class="form-row">
                                <select id="specialCategory">
                                    ${getAllSpecialCategories().map(cat => `<option value="${cat.toLowerCase()}" ${special.category === cat.toLowerCase() ? 'selected' : ''}>${cat}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <input type="date" id="specialStartDate" value="${special.start_date || ''}">
                                <input type="date" id="specialEndDate" value="${special.end_date || ''}">
                            </div>
                            <div class="form-group">
                                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Available Days:</label>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="0" class="day-checkbox" ${days.includes(0) ? 'checked' : ''}> Sun</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="1" class="day-checkbox" ${days.includes(1) ? 'checked' : ''}> Mon</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="2" class="day-checkbox" ${days.includes(2) ? 'checked' : ''}> Tue</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="3" class="day-checkbox" ${days.includes(3) ? 'checked' : ''}> Wed</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="4" class="day-checkbox" ${days.includes(4) ? 'checked' : ''}> Thu</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="5" class="day-checkbox" ${days.includes(5) ? 'checked' : ''}> Fri</label>
                                    <label style="display: flex; align-items: center; gap: 4px;"><input type="checkbox" value="6" class="day-checkbox" ${days.includes(6) ? 'checked' : ''}> Sat</label>
                                </div>
                            </div>
                            
                            <h4 style="margin: 20px 0 10px 0;">Ingredients</h4>
                            <div id="editIngredientsList">
                                ${ingredients.map((ing, index) => `
                                    <div class="form-row" style="align-items: center; margin-bottom: 10px;">
                                        <select onchange="updateEditIngredient(${index}, 'ingredientId', this.value); calculateIngredientCost(${index})" style="flex: 1;">
                                            <option value="">Select ingredient...</option>
                                            <option value="${ing.ingredientId || ''}" selected>${ing.name || 'Select ingredient...'}</option>
                                        </select>
                                        <input type="number" placeholder="Servings" step="0.1" value="${ing.amount}" onchange="updateEditIngredient(${index}, 'amount', this.value); calculateIngredientCost(${index})" style="width: 80px;">
                                        <span style="width: 80px; text-align: center; font-size: 12px;">$${(ing.calculatedCost || 0).toFixed(2)}</span>
                                        <button type="button" onclick="removeEditIngredient(${index})" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">&times;</button>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="text-align: right; margin: 10px 0; font-weight: bold;">Total Cost: $<span id="totalCost">${calculatedCost.toFixed(2)}</span></div>
                            <button type="button" class="btn" onclick="addEditIngredient()" style="background: var(--success); margin-bottom: 15px;">+ Add Ingredient</button>
                            
                            <button class="btn" onclick="updateMenuSpecial(${id}); closeAddModal();">Update Special</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                    setTimeout(() => refreshEditIngredients(), 100);
                });
        }
        
        function updateMenuSpecial(id) {
            const name = document.getElementById('specialName').value.trim();
            const description = document.getElementById('specialDescription').value.trim();
            const price = parseFloat(document.getElementById('specialPrice').value) || null;
            const category = document.getElementById('specialCategory').value;
            const startDate = document.getElementById('specialStartDate').value || null;
            const endDate = document.getElementById('specialEndDate').value || null;
            const days = Array.from(document.querySelectorAll('.day-checkbox:checked')).map(cb => parseInt(cb.value));
            
            if (!name) {
                alert('Please enter a name for the special');
                return;
            }
            
            fetch(`/api/recipes/special/${id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ingredients: JSON.stringify(editIngredients)})
            }).catch(err => console.error('Failed to save special recipe:', err));
            
            const today = new Date().toISOString().split('T')[0];
            let status = 'active';
            if (startDate && endDate) {
                if (startDate <= today && endDate >= today) status = 'active';
                else if (endDate < today) status = 'ended';
                else status = 'scheduled';
            }
            
            fetch(`/api/menu-specials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price,
                    start_date: startDate,
                    end_date: endDate,
                    days_of_week: days.length > 0 ? JSON.stringify(days) : null,
                    status,
                    category
                })
            }).then(() => loadMenuSpecials());
        }
        
        function deleteMenuSpecial(id) {
            if (confirm('Delete this menu special?')) {
                fetch(`/api/menu-specials/${id}`, { method: 'DELETE' })
                    .then(() => {
                        fetch(`/api/recipes/special/${id}`, {method: 'DELETE'});
                        loadMenuSpecials();
                    });
            }
        }
        
        function toggleSpecialDetails(id) {
            const details = document.getElementById(`special-details-${id}`);
            const icon = document.getElementById(`special-icon-${id}`);
            
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }

