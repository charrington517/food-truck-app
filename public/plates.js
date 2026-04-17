        // Plates (Menu) Functions
        async function loadPlates() {
            try {
                const [plates, menuItems] = await Promise.all([
                    fetch('/api/plates').then(r => r.json()),
                    fetch('/api/menu').then(r => r.json())
                ]);

                window._menuItems = menuItems;

                if (plates.length === 0) {
                    document.getElementById('platesList').innerHTML = '<div style="text-align: center; color: var(--gray); padding: 40px;">No plates yet. Click "Add Plate" to build your first combo!</div>';
                    document.getElementById('plateStats').innerHTML = '';
                    return;
                }

                // Load full details for each plate
                const detailed = await Promise.all(plates.map(p => fetch('/api/plates/' + p.id).then(r => r.json())));

                const avgCost = detailed.reduce((sum, p) => sum + (p.food_cost || 0), 0) / detailed.length;
                const avgMargin = detailed.filter(p => p.price > 0).reduce((sum, p) => sum + (((p.price - p.food_cost) / p.price) * 100), 0) / (detailed.filter(p => p.price > 0).length || 1);

                document.getElementById('plateStats').innerHTML = `
                    <div class="stat-card">
                        <div class="stat-number">${detailed.length}</div>
                        <div class="stat-label">Plates</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">$${avgCost.toFixed(2)}</div>
                        <div class="stat-label">Avg Food Cost</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${avgMargin.toFixed(1)}%</div>
                        <div class="stat-label">Avg Margin</div>
                    </div>
                `;

                document.getElementById('platesList').innerHTML = detailed.map(plate => {
                    const margin = plate.price > 0 ? ((plate.price - plate.food_cost) / plate.price * 100) : 0;
                    const marginStatus = margin >= 30 ? 'Good' : margin >= 20 ? 'Needs Attention' : 'Low Margin';
                    const marginColor = margin >= 30 ? 'var(--success)' : margin >= 20 ? 'var(--warning)' : 'var(--danger)';
                    const itemsList = (plate.items || []).map(i => `${i.quantity}x ${i.item_name}`).join(', ') || 'No items';

                    return `
                        <div class="card">
                            <div class="card-title">${plate.name}</div>
                            ${plate.description ? `<div class="card-meta">${plate.description}</div>` : ''}
                            <div class="card-meta" style="margin-top: 8px;">
                                <strong>Items:</strong> ${itemsList}
                            </div>
                            <div class="card-meta" style="display: flex; gap: 15px; margin-top: 8px;">
                                <span>Food Cost: <strong style="color: var(--danger);">$${(plate.food_cost || 0).toFixed(2)}</strong></span>
                                <span>Price: <strong style="color: var(--success);">$${(plate.price || 0).toFixed(2)}</strong></span>
                            </div>
                            <div class="card-meta">
                                Margin: <strong style="color: ${marginColor};">${margin.toFixed(1)}%</strong> ${marginStatus}
                                ${plate.price == 0 ? `<span style="margin-left: 10px;">Suggested: <strong>$${(plate.food_cost / 0.7).toFixed(2)}</strong> (30% margin)</span>` : ''}
                            </div>
                            <div class="card-actions">
                                <button class="btn" onclick="editPlate(${plate.id})" style="background: var(--orange); color: white;">Edit</button>
                                <button class="btn btn-danger" onclick="deletePlate(${plate.id})">Delete</button>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (err) {
                console.error('Error loading plates:', err);
            }
        }

        function addPlate() {
            const menuItems = window._menuItems || [];
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');

            modalTitle.textContent = 'Build a Plate';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Plate Name</label>
                        <input type="text" id="plateName" placeholder="e.g., Birria Plate">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="plateDescription" placeholder="e.g., 3 tacos with rice and beans">
                    </div>
                    <div class="form-group">
                        <label>Target Food Cost %</label>
                        <input type="number" id="plateMargin" value="30" min="0" max="100" step="1">
                    </div>
                    <h4 style="margin: 15px 0 10px;">Plate Items</h4>
                    <div id="plateItemsList"></div>
                    <button type="button" class="btn" onclick="addPlateItemRow()" style="background: var(--success); margin: 10px 0;">+ Add Item</button>
                    <div id="plateCostSummary" style="background: var(--gray-light); padding: 15px; border-radius: 8px; margin: 15px 0;"></div>
                    <div class="form-group">
                        <label>Menu Price ($)</label>
                        <input type="number" id="platePrice" placeholder="0.00" step="0.01">
                    </div>
                    <button class="btn" onclick="savePlate()">Save Plate</button>
                </div>
            `;
            modal.classList.add('show');
            addPlateItemRow();
        }

        function addPlateItemRow() {
            const menuItems = window._menuItems || [];
            const container = document.getElementById('plateItemsList');
            const index = container.children.length;
            const row = document.createElement('div');
            row.className = 'form-row';
            row.style.cssText = 'align-items: center; margin-bottom: 10px;';
            row.innerHTML = `
                <select onchange="updatePlateCost()" style="flex: 2;">
                    <option value="">Select item...</option>
                    ${menuItems.map(m => `<option value="${m.id}" data-cost="${m.cost}" data-name="${m.name}">${m.name} ($${m.cost.toFixed(2)})</option>`).join('')}
                </select>
                <input type="number" value="1" min="1" style="width: 60px;" onchange="updatePlateCost()" placeholder="Qty">
                <button type="button" onclick="this.parentElement.remove(); updatePlateCost();" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">&times;</button>
            `;
            container.appendChild(row);
        }

        function updatePlateCost() {
            const rows = document.getElementById('plateItemsList').children;
            let totalCost = 0;
            let itemSummary = [];

            for (let row of rows) {
                const select = row.querySelector('select');
                const qty = parseInt(row.querySelector('input').value) || 1;
                if (select.value) {
                    const cost = parseFloat(select.selectedOptions[0].dataset.cost) || 0;
                    const name = select.selectedOptions[0].dataset.name;
                    totalCost += cost * qty;
                    itemSummary.push(`${qty}x ${name}: $${(cost * qty).toFixed(2)}`);
                }
            }

            const margin = parseFloat(document.getElementById('plateMargin').value) || 30;
            const suggestedPrice = totalCost / (margin / 100);

            document.getElementById('plateCostSummary').innerHTML = `
                ${itemSummary.map(s => `<div style="font-size: 0.9em; margin-bottom: 4px;">${s}</div>`).join('')}
                <hr style="margin: 10px 0; border-color: var(--border);">
                <div style="font-weight: bold; font-size: 1.1em;">
                    Total Food Cost: <span style="color: var(--danger);">$${totalCost.toFixed(2)}</span>
                </div>
                <div style="font-weight: bold; font-size: 1.1em; margin-top: 5px;">
                    Suggested Price (${margin}% food cost): <span style="color: var(--success);">$${suggestedPrice.toFixed(2)}</span>
                </div>
            `;

            if (!document.getElementById('platePrice').value) {
                document.getElementById('platePrice').placeholder = suggestedPrice.toFixed(2);
            }
        }

        async function savePlate() {
            const name = document.getElementById('plateName').value.trim();
            if (!name) { alert('Please enter a plate name'); return; }

            const rows = document.getElementById('plateItemsList').children;
            const items = [];
            let totalCost = 0;

            for (let row of rows) {
                const select = row.querySelector('select');
                const qty = parseInt(row.querySelector('input').value) || 1;
                if (select.value) {
                    const cost = parseFloat(select.selectedOptions[0].dataset.cost) || 0;
                    items.push({ menu_item_id: parseInt(select.value), quantity: qty });
                    totalCost += cost * qty;
                }
            }

            if (items.length === 0) { alert('Please add at least one item'); return; }

            const margin = parseFloat(document.getElementById('plateMargin').value) || 30;
            const price = parseFloat(document.getElementById('platePrice').value) || (totalCost / (margin / 100));

            await fetch('/api/plates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: document.getElementById('plateDescription').value.trim(),
                    price,
                    food_cost: totalCost,
                    target_margin: margin,
                    items
                })
            });

            closeAddModal();
            loadPlates();
        }

        async function editPlate(id) {
            const plate = await fetch('/api/plates/' + id).then(r => r.json());
            const menuItems = window._menuItems || [];
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');

            modalTitle.textContent = 'Edit Plate';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Plate Name</label>
                        <input type="text" id="plateName" value="${plate.name}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="plateDescription" value="${plate.description || ''}">
                    </div>
                    <div class="form-group">
                        <label>Target Food Cost %</label>
                        <input type="number" id="plateMargin" value="${plate.target_margin || 30}" min="0" max="100" step="1">
                    </div>
                    <h4 style="margin: 15px 0 10px;">Plate Items</h4>
                    <div id="plateItemsList"></div>
                    <button type="button" class="btn" onclick="addPlateItemRow()" style="background: var(--success); margin: 10px 0;">+ Add Item</button>
                    <div id="plateCostSummary" style="background: var(--gray-light); padding: 15px; border-radius: 8px; margin: 15px 0;"></div>
                    <div class="form-group">
                        <label>Menu Price ($)</label>
                        <input type="number" id="platePrice" value="${plate.price || ''}" step="0.01">
                    </div>
                    <button class="btn" onclick="updatePlate(${id})">Update Plate</button>
                </div>
            `;
            modal.classList.add('show');

            // Add existing items
            (plate.items || []).forEach(item => {
                const container = document.getElementById('plateItemsList');
                const row = document.createElement('div');
                row.className = 'form-row';
                row.style.cssText = 'align-items: center; margin-bottom: 10px;';
                row.innerHTML = `
                    <select onchange="updatePlateCost()" style="flex: 2;">
                        <option value="">Select item...</option>
                        ${menuItems.map(m => `<option value="${m.id}" data-cost="${m.cost}" data-name="${m.name}" ${m.id === item.menu_item_id ? 'selected' : ''}>${m.name} ($${m.cost.toFixed(2)})</option>`).join('')}
                    </select>
                    <input type="number" value="${item.quantity}" min="1" style="width: 60px;" onchange="updatePlateCost()" placeholder="Qty">
                    <button type="button" onclick="this.parentElement.remove(); updatePlateCost();" style="background: var(--danger); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">&times;</button>
                `;
                container.appendChild(row);
            });

            updatePlateCost();
        }

        async function updatePlate(id) {
            const name = document.getElementById('plateName').value.trim();
            if (!name) { alert('Please enter a plate name'); return; }

            const rows = document.getElementById('plateItemsList').children;
            const items = [];
            let totalCost = 0;

            for (let row of rows) {
                const select = row.querySelector('select');
                const qty = parseInt(row.querySelector('input').value) || 1;
                if (select.value) {
                    const cost = parseFloat(select.selectedOptions[0].dataset.cost) || 0;
                    items.push({ menu_item_id: parseInt(select.value), quantity: qty });
                    totalCost += cost * qty;
                }
            }

            const margin = parseFloat(document.getElementById('plateMargin').value) || 30;
            const price = parseFloat(document.getElementById('platePrice').value) || (totalCost / (margin / 100));

            await fetch('/api/plates/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description: document.getElementById('plateDescription').value.trim(),
                    price,
                    food_cost: totalCost,
                    target_margin: margin,
                    items
                })
            });

            closeAddModal();
            loadPlates();
        }

        function deletePlate(id) {
            if (confirm('Delete this plate?')) {
                fetch('/api/plates/' + id, { method: 'DELETE' }).then(() => loadPlates());
            }
        }