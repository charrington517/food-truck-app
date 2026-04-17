        // Barcode Scanner Functions
        let html5QrCode = null;
        
        function openBarcodeScanner() {
            document.getElementById('barcodeScannerModal').classList.add('show');
            document.getElementById('barcodeScanResult').innerHTML = '<div style="text-align: center; color: var(--gray);">Position barcode in camera view...</div>';
            
            html5QrCode = new Html5Qrcode("barcodeScannerReader");
            
            Html5Qrcode.getCameras().then(cameras => {
                if (cameras && cameras.length) {
                    const cameraId = cameras[cameras.length - 1].id;
                    html5QrCode.start(
                        cameraId,
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        onScanSuccess,
                        onScanFailure
                    ).catch(err => {
                        console.error('Camera start error:', err);
                        document.getElementById('barcodeScanResult').innerHTML = '<div style="color: var(--danger);">Camera access denied or not available</div>';
                    });
                }
            }).catch(err => {
                console.error('Camera error:', err);
                document.getElementById('barcodeScanResult').innerHTML = '<div style="color: var(--danger);">No camera found</div>';
            });
        }
        
        function closeBarcodeScanner() {
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                    html5QrCode = null;
                    document.getElementById('barcodeScannerModal').classList.remove('show');
                }).catch(err => {
                    console.error('Stop error:', err);
                    html5QrCode = null;
                    document.getElementById('barcodeScannerModal').classList.remove('show');
                });
            } else {
                document.getElementById('barcodeScannerModal').classList.remove('show');
            }
        }
        
        function onScanSuccess(decodedText, decodedResult) {
            html5QrCode.pause(true);
            
            fetch('/api/inventory')
                .then(r => r.json())
                .then(items => {
                    console.log('Scanned:', decodedText);
                    console.log('Inventory items:', items.map(i => ({name: i.name, barcode: i.barcode})));
                    const item = items.find(i => i.barcode && i.barcode.trim() === decodedText.trim());
                    
                    if (item) {
                        document.getElementById('barcodeScanResult').innerHTML = `
                            <div style="background: var(--success); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                <h3 style="margin: 0 0 10px 0;">Item Found</h3>
                                <div style="font-size: 1.2em; font-weight: bold;">${item.name}</div>
                                <div style="margin-top: 10px;">Current Stock: ${item.current_stock} ${item.unit}</div>
                                <div>Min Stock: ${item.min_stock} ${item.unit}</div>
                                <div style="margin-top: 10px; font-weight: bold;">${item.current_stock <= item.min_stock ? 'LOW STOCK' : 'Stock OK'}</div>
                            </div>
                            <button class="btn" onclick="editInventoryFromScan(${item.id})" style="width: 100%; margin-bottom: 10px;">Update Stock</button>
                            <button class="btn" onclick="closeBarcodeScanner()" style="width: 100%; background: var(--gray);">Close</button>
                        `;
                    } else {
                        document.getElementById('barcodeScanResult').innerHTML = `
                            <div style="background: var(--warning); color: var(--charcoal); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                <h3 style="margin: 0 0 10px 0;">⚠ Item Not Found</h3>
                                <div>Barcode: ${decodedText}</div>
                                <div style="margin-top: 10px;">This barcode is not in your inventory.</div>
                            </div>
                            <button class="btn" onclick="addInventoryWithBarcode('${decodedText}')" style="width: 100%; margin-bottom: 10px; background: var(--success);">Add New Item</button>
                            <button class="btn" onclick="closeBarcodeScanner()" style="width: 100%; background: var(--gray);">Close</button>
                        `;
                    }
                });
        }
        
        function onScanFailure(error) {
            // Ignore scan failures (happens continuously while scanning)
        }
        
        function editInventoryFromScan(id) {
            closeBarcodeScanner();
            editInventoryItem(id);
        }
        
        function addInventoryWithBarcode(barcode) {
            if (html5QrCode) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                    html5QrCode = null;
                    document.getElementById('barcodeScannerModal').classList.remove('show');
                    openAddInventoryModal(barcode);
                }).catch(err => {
                    console.error(err);
                    document.getElementById('barcodeScannerModal').classList.remove('show');
                    openAddInventoryModal(barcode);
                });
            } else {
                document.getElementById('barcodeScannerModal').classList.remove('show');
                openAddInventoryModal(barcode);
            }
        }
        
        function openAddInventoryModal(barcode) {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Inventory Item';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="inventoryItemName" placeholder="Item Name">
                    </div>
                    <div class="form-row">
                        <select id="inventoryCategory">
                            <option value="Food">Food</option>
                            <option value="Cleaning Supplies">Cleaning Supplies</option>
                            <option value="To Go Supplies">To Go Supplies</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Other">Other</option>
                        </select>
                        <select id="inventoryUnit">
                            <option value="">Select unit...</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="cups">cups</option>
                            <option value="tbsp">tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="liters">liters</option>
                            <option value="ml">ml</option>
                            <option value="pieces">pieces</option>
                            <option value="pack">pack</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <input type="number" id="currentStock" placeholder="Current Stock" step="0.1">
                        <input type="number" id="minStock" placeholder="Min Stock" step="0.1">
                    </div>
                    <div class="form-group">
                        <input type="text" id="inventoryBarcode" placeholder="Barcode" value="${barcode}" readonly style="background: var(--gray-light);">
                    </div>
                    <button class="btn" onclick="addInventoryItemWithBarcode(); closeAddModal();">Add to Inventory</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function addInventoryItemWithBarcode() {
            const itemName = document.getElementById('inventoryItemName').value.trim();
            const category = document.getElementById('inventoryCategory').value;
            const unit = document.getElementById('inventoryUnit').value.trim();
            const currentStock = parseFloat(document.getElementById('currentStock').value) || 0;
            const minStock = parseFloat(document.getElementById('minStock').value) || 0;
            const barcode = document.getElementById('inventoryBarcode').value.trim();

            if (!itemName || !unit) {
                alert('Please enter item name and unit');
                return;
            }

            fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: itemName, unit: unit, category: category, current_stock: currentStock, min_stock: minStock, max_stock: 100, barcode: barcode || null })
            }).then(r => r.json()).then(data => {
                console.log('Item added:', data);
                setTimeout(() => loadInventory(), 500);
            });
        }

