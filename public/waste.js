        // Waste Logging Functions
        function logWaste(inventoryId, itemName, unit) {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = `Log Waste - ${itemName}`;
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Amount Wasted</label>
                        <input type="number" id="wasteAmount" placeholder="Amount" step="0.1" min="0.1">
                    </div>
                    <div class="form-group">
                        <label>Reason</label>
                        <select id="wasteReason">
                            <option value="Spoiled">Spoiled</option>
                            <option value="Expired">Expired</option>
                            <option value="Dropped">Dropped/Spilled</option>
                            <option value="Overcooked">Overcooked/Burned</option>
                            <option value="Customer Return">Customer Return</option>
                            <option value="Prep Error">Prep Error</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button class="btn" onclick="saveWaste(${inventoryId}, '${itemName}', '${unit}'); closeAddModal();">Log Waste</button>
                </div>
            `;
            modal.classList.add('show');
        }
        
        function saveWaste(inventoryId, itemName, unit) {
            const amount = parseFloat(document.getElementById('wasteAmount').value);
            const reason = document.getElementById('wasteReason').value;
            
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount');
                return;
            }
            
            fetch('/api/waste-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory_id: inventoryId,
                    item_name: itemName,
                    amount: amount,
                    unit: unit,
                    reason: reason,
                    cost: 0
                })
            }).then(() => {
                loadWasteLog();
                alert(`Logged ${amount} ${unit} of ${itemName} as waste`);
            });
        }
        
        function loadWasteLog() {
            fetch('/api/waste-log')
                .then(r => r.json())
                .then(logs => {
                    if (logs.length === 0) {
                        document.getElementById('wasteLogList').innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray);">No waste logged yet</div>';
                        return;
                    }
                    
                    let html = '<table style="width: 100%; border-collapse: collapse;">';
                    html += '<thead><tr style="background: var(--orange); color: white;">';
                    html += '<th style="padding: 10px; text-align: left;">Date</th>';
                    html += '<th style="padding: 10px; text-align: left;">Item</th>';
                    html += '<th style="padding: 10px; text-align: right;">Amount</th>';
                    html += '<th style="padding: 10px; text-align: left;">Reason</th>';
                    html += '</tr></thead><tbody>';
                    
                    logs.slice(0, 20).forEach((log, i) => {
                        const date = new Date(log.created_at).toLocaleDateString();
                        const bgColor = i % 2 === 0 ? 'var(--gray-light)' : 'var(--white)';
                        html += `<tr style="background: ${bgColor};">`;
                        html += `<td style="padding: 10px;">${date}</td>`;
                        html += `<td style="padding: 10px;">${log.item_name}</td>`;
                        html += `<td style="padding: 10px; text-align: right;">${log.amount} ${log.unit}</td>`;
                        html += `<td style="padding: 10px;">${log.reason}</td>`;
                        html += '</tr>';
                    });
                    
                    html += '</tbody></table>';
                    document.getElementById('wasteLogList').innerHTML = html;
                });
        }

