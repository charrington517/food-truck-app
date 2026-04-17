        // Ingredient Functions
        let compoundIngredients = [];
        
        function toggleCompoundIngredients() {
            const isCompound = document.getElementById('isCompound').checked;
            document.getElementById('compoundIngredientsSection').style.display = isCompound ? 'block' : 'none';
            document.getElementById('ingredientCost').readOnly = isCompound;
            document.getElementById('ingredientCost').style.background = isCompound ? 'var(--gray-light)' : '';
            if (isCompound) {
                document.getElementById('ingredientCost').value = '0';
                compoundIngredients = [];
                addCompoundIngredientRow();
            }
        }
        
        function addCompoundIngredientRow() {
            fetch('/api/ingredients').then(r => r.json()).then(ingredients => {
                const index = compoundIngredients.length;
                compoundIngredients.push({ingredientId: '', amount: 1});
                const html = `
                    <div class="form-row" style="margin-bottom: 8px;">
                        <select onchange="updateCompoundIngredient(${index}, 'ingredientId', this.value)" style="flex: 1;">
                            <option value="">Select ingredient...</option>
                            ${ingredients.filter(i => !i.is_compound).map(ing => `<option value="${ing.id}">${ing.name} ($${ing.cost}/${ing.unit})</option>`).join('')}
                        </select>
                        <input type="number" placeholder="Amount" step="0.1" value="1" onchange="updateCompoundIngredient(${index}, 'amount', this.value)" style="width: 100px;">
                        <button type="button" onclick="removeCompoundIngredient(${index})" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px;">&times;</button>
                    </div>
                `;
                document.getElementById('compoundIngredientsList').insertAdjacentHTML('beforeend', html);
            });
        }
        
        function updateCompoundIngredient(index, field, value) {
            if (compoundIngredients[index]) {
                compoundIngredients[index][field] = field === 'amount' ? parseFloat(value) : value;
                calculateCompoundCost();
            }
        }
        
        function removeCompoundIngredient(index) {
            compoundIngredients.splice(index, 1);
            document.getElementById('compoundIngredientsList').innerHTML = '';
            compoundIngredients.forEach((_, i) => addCompoundIngredientRow());
        }
        
        function calculateCompoundCost() {
            fetch('/api/ingredients').then(r => r.json()).then(ingredients => {
                console.log('Calculating cost for:', compoundIngredients);
                let totalCost = 0;
                compoundIngredients.forEach(ci => {
                    const ing = ingredients.find(i => i.id == ci.ingredientId);
                    if (ing) {
                        const cost = (ing.cost / ing.servings) * ci.amount;
                        console.log(`  ${ing.name}: ${ing.cost}/${ing.servings} x ${ci.amount} = ${cost}`);
                        totalCost += cost;
                    }
                });
                console.log('Total cost:', totalCost);
                document.getElementById('ingredientCost').value = totalCost.toFixed(2);
            });
        }
        
        function addIngredient() {
            const name = document.getElementById('ingredientName').value;
            const cost = parseFloat(document.getElementById('ingredientCost').value);
            const unit = document.getElementById('ingredientUnit').value;
            const servings = parseInt(document.getElementById('ingredientServings').value) || 1;
            const isCompound = document.getElementById('isCompound')?.checked || false;

            if (!name || !unit) {
                alert('Please fill in name and unit');
                return;
            }
            
            if (!isCompound && !cost) {
                alert('Please fill in cost');
                return;
            }
            
            if (isCompound && compoundIngredients.length === 0) {
                alert('Please add at least one sub-ingredient');
                return;
            }
            
            if (isCompound) {
                const invalid = compoundIngredients.find(ci => !ci.ingredientId || !ci.amount);
                if (invalid) {
                    alert('Please select ingredient and amount for all sub-ingredients');
                    return;
                }
            }
            
            const payload = { 
                name, 
                cost, 
                unit, 
                servings,
                is_compound: isCompound ? 1 : 0,
                recipe: isCompound ? JSON.stringify(compoundIngredients) : null
            };
            console.log('Saving ingredient:', payload);

            fetch('/api/ingredients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(r => r.json())
            .then(data => {
                console.log('Save response:', data);
                compoundIngredients = [];
                closeAddModal();
                loadIngredients();
                alert(`${isCompound ? 'Compound' : ''} Ingredient "${name}" saved successfully!`);
            })
            .catch(err => {
                console.error('Save error:', err);
                alert('Failed to save ingredient');
            });
        }

        let ingredientFilter = 'all';
        
        function setIngredientFilter(filter) {
            ingredientFilter = filter;
            document.querySelectorAll('[id^="filter-ing-"]').forEach(btn => btn.style.background = 'var(--gray)');
            document.getElementById(`filter-ing-${filter}`).style.background = 'var(--orange)';
            renderIngredients();
        }
        
        function filterIngredients() {
            renderIngredients();
        }
        
        function renderIngredients() {
            if (!window.allIngredients) {
                console.log('No ingredients loaded yet');
                return;
            }
            
            console.log('Rendering ingredients:', window.allIngredients.length, 'total');
            const search = document.getElementById('ingredientSearch')?.value.toLowerCase() || '';
            let filtered = window.allIngredients.filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(search);
                const matchesFilter = ingredientFilter === 'all' || 
                    (ingredientFilter === 'compound' && item.is_compound) ||
                    (ingredientFilter === 'regular' && !item.is_compound);
                return matchesSearch && matchesFilter;
            });
            
            console.log('Filtered to:', filtered.length, 'ingredients (filter:', ingredientFilter, ', search:', search, ')');
            console.log('Ingredients:', filtered.map(i => ({id: i.id, name: i.name, is_compound: i.is_compound})));
            
            const html = filtered.map(item => {
                const subIngredients = item.is_compound && item.recipe ? JSON.parse(item.recipe) : [];
                const subIngredientsHtml = subIngredients.length > 0 ? `
                    <div style="margin-top: 10px; padding: 10px; background: var(--gray-light); border-radius: 6px;">
                        <strong>Sub-Ingredients:</strong>
                        ${subIngredients.map(si => {
                            const subIng = window.allIngredients.find(i => i.id == si.ingredientId);
                            return subIng ? `<div style="margin-top: 5px;">• ${subIng.name}: ${si.amount} servings</div>` : '';
                        }).join('')}
                    </div>
                ` : '';
                
                return `
                    <div class="card" data-ingredient-type="${item.is_compound ? 'compound' : 'regular'}">
                        <div onclick="toggleIngredientCard(${item.id})" style="cursor: pointer;">
                            <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${item.name} ${item.is_compound ? '<span style="background: var(--success); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7em; margin-left: 5px;">COMPOUND</span>' : ''}</span>
                                <span id="ing-icon-${item.id}">▼</span>
                            </div>
                            <div class="card-meta">$${item.cost.toFixed(2)} per ${item.unit}</div>
                        </div>
                        <div id="ing-details-${item.id}" style="display: none; margin-top: 10px;">
                            <div class="card-meta">Servings: ${item.servings || 1} per ${item.unit}</div>
                            <div class="card-meta">Cost per serving: $${((item.cost || 0) / (item.servings || 1)).toFixed(2)}</div>
                            ${subIngredientsHtml}
                            <div class="card-actions">
                                <button class="btn" onclick="event.stopPropagation(); editIngredient(${item.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn btn-danger" onclick="event.stopPropagation(); deleteIngredient(${item.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            const finalHtml = html.join('');
            console.log('Generated HTML length:', finalHtml.length);
            document.getElementById('ingredientsList').innerHTML = finalHtml;
        }
        
        function toggleIngredientCard(id) {
            const details = document.getElementById(`ing-details-${id}`);
            const icon = document.getElementById(`ing-icon-${id}`);
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function loadIngredients() {
            fetch('/api/ingredients')
                .then(r => r.json())
                .then(items => {
                    window.allIngredients = items;
                    renderIngredients();
                    
                    // Update inventory dropdown if it exists - show all ingredients
                    const inventorySelect = document.getElementById('inventoryIngredient');
                    if (inventorySelect) {
                        inventorySelect.innerHTML = 
                            '<option value="">Select ingredient...</option>' +
                            realIngredients.map(ing => `<option value="${ing.id}">${ing.name} (${ing.unit})</option>`).join('');
                    }
                });
        }

        function editIngredient(id) {
            fetch('/api/ingredients')
                .then(r => r.json())
                .then(items => {
                    const ingredient = items.find(item => item.id === id);
                    if (!ingredient) return;
                    
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Ingredient';
                    
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <label>Ingredient Name</label>
                                <input type="text" id="ingredientName" placeholder="Ingredient Name" value="${ingredient.name}">
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Cost per Unit ($)</label>
                                    <input type="number" id="ingredientCost" placeholder="Cost per Unit ($)" step="0.01" value="${ingredient.cost}">
                                </div>
                                <div style="flex: 1;">
                                    <label>Unit</label>
                                    <select id="ingredientUnit">
                                        <option value="">Select unit...</option>
                                        <option value="lb" ${ingredient.unit === 'lb' ? 'selected' : ''}>lb</option>
                                        <option value="oz" ${ingredient.unit === 'oz' ? 'selected' : ''}>oz</option>
                                        <option value="kg" ${ingredient.unit === 'kg' ? 'selected' : ''}>kg</option>
                                        <option value="g" ${ingredient.unit === 'g' ? 'selected' : ''}>g</option>
                                        <option value="cups" ${ingredient.unit === 'cups' ? 'selected' : ''}>cups</option>
                                        <option value="tbsp" ${ingredient.unit === 'tbsp' ? 'selected' : ''}>tbsp</option>
                                        <option value="tsp" ${ingredient.unit === 'tsp' ? 'selected' : ''}>tsp</option>
                                        <option value="liters" ${ingredient.unit === 'liters' ? 'selected' : ''}>liters</option>
                                        <option value="ml" ${ingredient.unit === 'ml' ? 'selected' : ''}>ml</option>
                                        <option value="pieces" ${ingredient.unit === 'pieces' ? 'selected' : ''}>pieces</option>
                                        <option value="pack" ${ingredient.unit === 'pack' ? 'selected' : ''}>pack</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Servings per Unit</label>
                                <input type="number" id="ingredientServings" placeholder="Servings" min="1" value="${ingredient.servings || 1}">
                            </div>
                            <button class="btn" onclick="updateIngredient(${id}); closeAddModal();">Update Ingredient</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function updateIngredient(id) {
            const name = document.getElementById('ingredientName').value;
            const cost = parseFloat(document.getElementById('ingredientCost').value);
            const unit = document.getElementById('ingredientUnit').value;
            const servings = parseInt(document.getElementById('ingredientServings').value) || 1;

            if (!name || !cost || !unit) {
                alert('Please fill in all fields');
                return;
            }

            fetch(`/api/ingredients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cost, unit, servings })
            }).then(() => {
                loadIngredients();
            });
        }

        function deleteIngredient(id) {
            if (confirm('Delete this ingredient? This will also remove it from inventory.')) {
                fetch(`/api/ingredients/${id}`, { method: 'DELETE' })
                    .then(() => {
                        loadIngredients();
                        loadInventory();
                    });
            }
        }

