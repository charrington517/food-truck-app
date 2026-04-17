        // Menu Functions
        function addRecipe() {
            const name = document.getElementById('recipeName').value;
            const type = document.getElementById('recipeType').value;
            const portions = parseInt(document.getElementById('portions').value) || 1;
            const price = parseFloat(document.getElementById('price').value);
            const cost = parseFloat(document.getElementById('cost').value) || 0;

            if (!name || !price) {
                alert('Please fill in name and price');
                return;
            }

            fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, cost, recipe_type: type, portions })
            }).then(() => {
                document.getElementById('recipeName').value = '';
                document.getElementById('price').value = '';
                document.getElementById('cost').value = '';
                document.getElementById('portions').value = '1';
                loadMenu();
            });
        }

        function loadMenu() {
            loadMenuSpecials();
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    // Group items by category
                    const grouped = {};
                    items.forEach(item => {
                        const category = item.recipe_type || 'Uncategorized';
                        if (!grouped[category]) grouped[category] = [];
                        grouped[category].push(item);
                    });
                    
                    let html = '';
                    Object.keys(grouped).sort().forEach(category => {
                        html += `<div style="grid-column: 1 / -1; margin: 20px 0 10px 0;"><h3 style="color: var(--orange); font-size: 18px; font-weight: 600; border-bottom: 2px solid var(--orange); padding-bottom: 8px;">${category}</h3></div>`;
                        
                        grouped[category].forEach(item => {
                            const margin = ((item.price - item.cost) / item.price) * 100;
                            const status = margin >= 30 ? 'Good' : margin >= 20 ? 'Needs Attention' : 'Bad - Urgent';
                            html += `
                                <div class="card">
                                    <div class="card-header" onclick="toggleMenuDetails(${item.id})" style="cursor: pointer;">
                                        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                                            ${item.name}
                                            <span class="expand-icon" id="icon-${item.id}">▼</span>
                                        </div>
                                        <div class="card-meta">${item.recipe_type || 'Uncategorized'} • ${item.portions} portions</div>
                                        <div class="card-meta" style="display: flex; gap: 15px; align-items: center;">
                                            <span>Cost: $${item.cost.toFixed(2)}</span>
                                            <span style="display: flex; align-items: center;">Price: $<input type="number" class="inline-edit-input" value="${item.price.toFixed(2)}" step="0.01" min="0" onchange="updatePrice(${item.id}, this.value)" style="width: 70px; padding: 4px; border: 1px solid var(--border); border-radius: 4px; background: var(--white); color: var(--charcoal); margin-left: 2px;" onclick="event.stopPropagation();"></span>
                                        </div>
                                        <div class="card-meta">Margin: <input type="number" class="inline-edit-input" value="${margin.toFixed(1)}" step="0.1" min="0" max="100" onchange="updateMargin(${item.id}, this.value)" style="width: 50px; padding: 4px; border: 1px solid var(--border); border-radius: 4px; background: var(--white); color: var(--charcoal);" onclick="event.stopPropagation();">% ${status}</div>
                                    </div>
                                    <div class="card-details" id="details-${item.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                                        <h4 style="margin-bottom: 10px;">Ingredients:</h4>
                                        <div id="ingredients-${item.id}">Loading ingredients...</div>
                                    </div>
                                    <div class="card-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                                        <button class="btn" onclick="event.stopPropagation(); editRecipe(${item.id})" style="flex: 1; background: var(--orange); color: white;">Edit</button>
                                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteRecipe(${item.id})" style="flex: 1;">Delete</button>
                                    </div>
                                </div>
                            `;
                        });
                    });
                    
                    document.getElementById('menuItems').innerHTML = html;
                });
        }

        function toggleMenuDetails(id) {
            const details = document.getElementById(`details-${id}`);
            const icon = document.getElementById(`icon-${id}`);
            
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
                loadMenuIngredients(id);
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function loadMenuIngredients(menuId) {
            fetch(`/api/recipes/menu/${menuId}`)
                .then(r => r.json())
                .then(data => {
                    const ingredients = JSON.parse(data.ingredients || '[]');
            
            if (ingredients.length === 0) {
                document.getElementById(`ingredients-${menuId}`).innerHTML = '<div style="color: var(--gray); font-style: italic;">No ingredients added yet. Use Edit to add ingredients.</div>';
                return;
            }
            
            const ingredientsHtml = ingredients.map(ing => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: var(--gray-light); border-radius: 6px;">
                    <span>${ing.name}</span>
                    <span>${ing.amount} servings - $${(ing.calculatedCost || 0).toFixed(2)}</span>
                </div>
            `).join('');
            
                    document.getElementById(`ingredients-${menuId}`).innerHTML = ingredientsHtml;
                });
        }

        function editRecipe(id) {
            editingRecipeId = id;
            fetch(`/api/recipes/menu/${id}`)
                .then(r => r.json())
                .then(data => {
                    editIngredients = JSON.parse(data.ingredients || '[]');
                    return fetch('/api/menu');
                })
                .then(r => r.json())
                .then(items => {
                    const recipe = items.find(item => item.id === id);
                    if (!recipe) return;
                    
                    // Open modal with edit form
                    const modal = document.getElementById('addModal');
                    const modalTitle = document.getElementById('modalTitle');
                    const modalForm = document.getElementById('modalForm');
                    
                    modalTitle.textContent = 'Edit Recipe';
                    const ingredients = editIngredients;
                    
                    modalForm.innerHTML = `
                        <div class="form">
                            <div class="form-group">
                                <label>Recipe Name</label>
                                <input type="text" id="recipeName" placeholder="Recipe Name" value="${recipe.name}">
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Category</label>
                                    <select id="recipeType">
                                        <option value="Entree" ${recipe.recipe_type === 'Entree' ? 'selected' : ''}>Entree</option>
                                        <option value="Appetizer" ${recipe.recipe_type === 'Appetizer' ? 'selected' : ''}>Appetizer</option>
                                        <option value="Dessert" ${recipe.recipe_type === 'Dessert' ? 'selected' : ''}>Dessert</option>
                                        <option value="Sauce" ${recipe.recipe_type === 'Sauce' ? 'selected' : ''}>Sauce</option>
                                        <option value="Side" ${recipe.recipe_type === 'Side' ? 'selected' : ''}>Side</option>
                                        <option value="Beverage" ${recipe.recipe_type === 'Beverage' ? 'selected' : ''}>Beverage</option>
                                    </select>
                                </div>
                                <div style="flex: 1;">
                                    <label>Portions</label>
                                    <input type="number" id="portions" placeholder="Portions" min="1" value="${recipe.portions}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div style="flex: 1;">
                                    <label>Menu Price ($)</label>
                                    <input type="number" id="price" placeholder="Menu Price ($)" step="0.01" value="${recipe.price}">
                                </div>
                                <div style="flex: 1;">
                                    <label>Recipe Cost ($)</label>
                                    <input type="number" id="cost" placeholder="Recipe Cost ($)" step="0.01" value="${ingredients.reduce((sum, ing) => sum + (ing.calculatedCost || 0), 0).toFixed(2)}" readonly style="background: var(--gray-light);">
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
                            <div style="text-align: right; margin: 10px 0; font-weight: bold;">Total Cost: $<span id="totalCost">${ingredients.reduce((sum, ing) => sum + (ing.calculatedCost || 0), 0).toFixed(2)}</span></div>
                            <button type="button" class="btn" onclick="addEditIngredient()" style="background: var(--success); margin-bottom: 15px;">+ Add Ingredient</button>
                            
                            <button class="btn" onclick="updateRecipe(${id}); closeAddModal();">Update Recipe</button>
                        </div>
                    `;
                    
                    modal.classList.add('show');
                });
        }
        
        function updateRecipe(id) {
            const name = document.getElementById('recipeName').value;
            const type = document.getElementById('recipeType').value;
            const portions = parseInt(document.getElementById('portions').value) || 1;
            const price = parseFloat(document.getElementById('price').value);
            
            let sum = 0;
            editIngredients.forEach(ing => {
                sum += Math.round((ing.calculatedCost || 0) * 100);
            });
            const cost = sum / 100;

            if (!name || !price) {
                alert('Please fill in name and price');
                return;
            }
            
            fetch(`/api/recipes/menu/${id}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ingredients: JSON.stringify(editIngredients)})
            }).catch(err => console.error('Failed to save recipe:', err));

            fetch(`/api/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, cost, recipe_type: type, portions })
            }).then(() => {
                setTimeout(() => loadMenu(), 200);
            });
        }

        function deleteRecipe(id) {
            if (confirm('Delete this recipe?')) {
                fetch(`/api/menu/${id}`, { method: 'DELETE' })
                    .then(() => loadMenu());
            }
        }

        function updatePrice(id, newPrice) {
            const price = parseFloat(newPrice);
            if (isNaN(price) || price <= 0) return;
            
            // Get current item to preserve other fields
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const item = items.find(i => i.id === id);
                    if (!item) return;
                    
                    fetch(`/api/menu/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            name: item.name,
                            price: price,
                            cost: item.cost,
                            recipe_type: item.recipe_type,
                            portions: item.portions
                        })
                    }).then(() => {
                        loadMenu();
                    });
                });
        }

        function updateMargin(id, newMargin) {
            const margin = parseFloat(newMargin);
            if (isNaN(margin) || margin < 0) return;
            
            // Get current item data to calculate new price
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const item = items.find(i => i.id === id);
                    if (!item) return;
                    
                    // Calculate new price based on margin: price = cost / (1 - margin/100)
                    const newPrice = item.cost / (1 - margin / 100);
                    
                    fetch(`/api/menu/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            name: item.name,
                            price: newPrice,
                            cost: item.cost,
                            recipe_type: item.recipe_type,
                            portions: item.portions
                        })
                    }).then(() => {
                        loadMenu();
                    });
                });
        }
        
        let editingRecipeId = null;
        let editIngredients = [];
        
        function addEditIngredient() {
            editIngredients.push({ ingredientId: '', name: '', amount: '1', unit: '', calculatedCost: 0 });
            refreshEditIngredients();
        }
        
        function updateEditIngredient(index, field, value) {
            if (editIngredients[index]) {
                if (field === 'amount') {
                    editIngredients[index][field] = parseFloat(value) || 0;
                } else if (field === 'ingredientId') {
                    editIngredients[index][field] = value;
                    // Update name, unit, and servings from selected ingredient
                    fetch('/api/ingredients')
                        .then(r => r.json())
                        .then(ingredients => {
                            const ingredient = ingredients.find(ing => ing.id == value);
                            if (ingredient) {
                                editIngredients[index].name = ingredient.name;
                                editIngredients[index].unit = ingredient.unit;
                                editIngredients[index].unitCost = ingredient.cost;
                                editIngredients[index].servings = ingredient.servings || 1;
                                calculateIngredientCost(index);
                                refreshEditIngredients();
                            }
                        });
                } else {
                    editIngredients[index][field] = value;
                }
            }
        }
        
        function calculateIngredientCost(index) {
            if (editIngredients[index] && editIngredients[index].unitCost && editIngredients[index].amount && editIngredients[index].servings) {
                // Calculate cost per serving, then multiply by amount of servings needed
                const costPerServing = editIngredients[index].unitCost / editIngredients[index].servings;
                editIngredients[index].calculatedCost = parseFloat((costPerServing * editIngredients[index].amount).toFixed(2));
                updateTotalCost();
                refreshEditIngredients();
            }
        }
        
        function updateTotalCost() {
            let sum = 0;
            editIngredients.forEach(ing => {
                sum += Math.round((ing.calculatedCost || 0) * 100);
            });
            const totalCost = sum / 100;
            const totalCostElement = document.getElementById('totalCost');
            const costInput = document.getElementById('cost');
            if (totalCostElement) {
                totalCostElement.textContent = totalCost.toFixed(2);
            }
            if (costInput) {
                costInput.value = totalCost.toFixed(2);
            }
        }
        
        function removeEditIngredient(index) {
            editIngredients.splice(index, 1);
            updateTotalCost();
            refreshEditIngredients();
        }
        
        function refreshEditIngredients() {
            // Load ingredients for dropdowns
            fetch('/api/ingredients')
                .then(r => r.json())
                .then(ingredients => {
                    const editList = document.getElementById('editIngredientsList');
                    if (editList) {
                        editList.innerHTML = editIngredients.map((ing, index) => `
                            <div class="form-row" style="align-items: center; margin-bottom: 10px;">
                                <select onchange="updateEditIngredient(${index}, 'ingredientId', this.value); calculateIngredientCost(${index})" style="flex: 1;">
                                    <option value="">Select ingredient...</option>
                                    ${ingredients.map(ingredient => `<option value="${ingredient.id}" ${ingredient.id == ing.ingredientId ? 'selected' : ''}>${ingredient.name} (${ingredient.servings || 1} servings per ${ingredient.unit})</option>`).join('')}
                                </select>
                                <input type="number" placeholder="Servings" step="0.1" value="${ing.amount}" onchange="updateEditIngredient(${index}, 'amount', this.value); calculateIngredientCost(${index})" style="width: 80px;">
                                <span style="width: 80px; text-align: center; font-size: 12px;">$${(ing.calculatedCost || 0).toFixed(2)}</span>
                                <button type="button" onclick="removeEditIngredient(${index})" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">&times;</button>
                            </div>
                        `).join('');
                    }
                });
        }

