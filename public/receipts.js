        // Receipt Scanner Functions
        let currentReceiptFile = null;
        let currentReceiptId = null;
        let extractedReceiptItems = [];
        
        function openReceiptScanner() {
            document.getElementById('receiptScannerModal').classList.add('show');
            document.getElementById('receiptDate').value = new Date().toISOString().split('T')[0];
        }
        
        function closeReceiptScanner() {
            document.getElementById('receiptScannerModal').classList.remove('show');
            stopCamera();
            resetReceiptScanner();
        }
        
        function resetReceiptScanner() {
            document.getElementById('cameraContainer').style.display = 'none';
            document.getElementById('receiptPreview').style.display = 'none';
            document.getElementById('receiptProcessing').style.display = 'none';
            document.getElementById('receiptReview').style.display = 'none';
            currentReceiptFile = null;
            currentReceiptId = null;
            extractedReceiptItems = [];
        }
        
        function startCamera() {
            const video = document.getElementById('receiptVideo');
            const container = document.getElementById('cameraContainer');
            
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                    container.style.display = 'block';
                })
                .catch(err => {
                    console.error('Camera error:', err);
                    alert('Could not access camera. Please use file upload instead.');
                });
        }
        
        function stopCamera() {
            const video = document.getElementById('receiptVideo');
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }
            document.getElementById('cameraContainer').style.display = 'none';
        }
        
        function capturePhoto() {
            const video = document.getElementById('receiptVideo');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(blob => {
                handleReceiptFile(blob);
                stopCamera();
            }, 'image/jpeg', 0.8);
        }
        
        function handleReceiptFile(file) {
            if (!file) return;
            
            currentReceiptFile = file;
            
            if (file.type === 'application/pdf') {
                // Show PDF preview
                document.getElementById('receiptImage').style.display = 'none';
                const preview = document.getElementById('receiptPreview');
                preview.style.display = 'block';
                
                const pdfPreview = document.createElement('div');
                pdfPreview.innerHTML = `
                    <div style="background: var(--gray-light); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 10px;">
                        <div style="font-size: 48px; margin-bottom: 10px;">📄</div>
                        <div style="font-weight: bold;">${file.name}</div>
                        <div style="color: var(--gray); font-size: 0.9em;">${(file.size / 1024 / 1024).toFixed(1)} MB PDF</div>
                    </div>
                `;
                preview.insertBefore(pdfPreview, preview.querySelector('.form'));
            } else {
                // Show image preview
                document.getElementById('receiptImage').style.display = 'block';
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('receiptImage').src = e.target.result;
                    document.getElementById('receiptPreview').style.display = 'block';
                    
                    // Auto-run OCR to fill fields immediately
                    autoFillReceiptData();
                };
                reader.readAsDataURL(file);
            }
        }
        
        function autoFillReceiptData() {
            if (!currentReceiptFile) return;
            
            // Show processing indicator
            const processingDiv = document.createElement('div');
            processingDiv.id = 'autoFillProcessing';
            processingDiv.innerHTML = '<div style="text-align: center; padding: 10px; color: var(--orange); font-size: 14px;">🔍 Extracting receipt data...</div>';
            document.getElementById('receiptPreview').insertBefore(processingDiv, document.getElementById('receiptPreview').querySelector('.form'));
            
            const ocrFormData = new FormData();
            ocrFormData.append('image', currentReceiptFile);
            
            fetch('/api/receipts/ocr-only', {
                method: 'POST',
                body: ocrFormData
            })
            .then(r => r.json())
            .then(ocrResult => {
                // Remove processing indicator
                const processing = document.getElementById('autoFillProcessing');
                if (processing) processing.remove();
                
                // Auto-fill fields with OCR results
                if (ocrResult.success && ocrResult.extracted_data) {
                    const data = ocrResult.extracted_data;
                    if (data.vendor_name) document.getElementById('merchantName').value = data.vendor_name;
                    if (data.receipt_date) document.getElementById('receiptDate').value = data.receipt_date;
                    if (data.total_amount) document.getElementById('totalAmount').value = data.total_amount;
                    if (data.category) document.getElementById('receiptCategory').value = data.category;
                    
                    // Set extracted items for later use
                    extractedReceiptItems = data.items && data.items.length > 0 ? data.items : [
                        { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 }
                    ];
                    
                    // Show success indicator
                    const successDiv = document.createElement('div');
                    successDiv.innerHTML = '<div style="text-align: center; padding: 5px; color: var(--success); font-size: 12px;">✓ Receipt data extracted successfully</div>';
                    document.getElementById('receiptPreview').insertBefore(successDiv, document.getElementById('receiptPreview').querySelector('.form'));
                    setTimeout(() => successDiv.remove(), 3000);
                } else {
                    extractedReceiptItems = [
                        { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 }
                    ];
                }
            })
            .catch(err => {
                // Remove processing indicator
                const processing = document.getElementById('autoFillProcessing');
                if (processing) processing.remove();
                
                console.error('OCR failed:', err);
                extractedReceiptItems = [
                    { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 }
                ];
            });
        }
        
        function processReceipt() {
            if (!currentReceiptFile) {
                alert('Please select a receipt image first');
                return;
            }
            
            const category = document.getElementById('receiptCategory').value;
            const date = document.getElementById('receiptDate').value;
            const merchantName = document.getElementById('merchantName').value;
            const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
            
            if (!category || !date) {
                alert('Please fill in category and date');
                return;
            }
            
            document.getElementById('receiptPreview').style.display = 'none';
            document.getElementById('receiptProcessing').style.display = 'block';
            
            // Upload receipt with current form data
            const formData = new FormData();
            formData.append('receipt', currentReceiptFile);
            formData.append('category', category);
            formData.append('date', date);
            formData.append('merchant_name', merchantName);
            formData.append('total_amount', totalAmount);
            
            fetch('/api/receipts/upload', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                currentReceiptId = data.id;
                
                document.getElementById('receiptProcessing').style.display = 'none';
                document.getElementById('receiptReview').style.display = 'block';
                displayExtractedItems();
            })
            .catch(err => {
                alert('Failed to process receipt: ' + err.message);
                document.getElementById('receiptProcessing').style.display = 'none';
                document.getElementById('receiptPreview').style.display = 'block';
            });
        }
        
        function performOCR() {
            return new Promise((resolve, reject) => {
                // Call server-side OCR processing
                fetch('/api/receipts/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ receipt_id: currentReceiptId })
                })
                .then(r => r.json())
                .then(result => {
                    if (result.success && result.items && result.items.length > 0) {
                        extractedReceiptItems = result.items;
                        
                        // Auto-fill merchant and date if extracted
                        if (result.extracted_data) {
                            if (result.extracted_data.vendor_name) {
                                document.getElementById('merchantName').value = result.extracted_data.vendor_name;
                            }
                            if (result.extracted_data.receipt_date) {
                                document.getElementById('receiptDate').value = result.extracted_data.receipt_date;
                            }
                            if (result.extracted_data.total_amount) {
                                document.getElementById('totalAmount').value = result.extracted_data.total_amount;
                            }
                            if (result.extracted_data.category) {
                                document.getElementById('receiptCategory').value = result.extracted_data.category;
                            }
                        }
                    } else {
                        // No items found, provide empty template
                        extractedReceiptItems = [
                            { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 },
                            { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 },
                            { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 }
                        ];
                    }
                    resolve();
                })
                .catch(err => {
                    console.error('OCR Error:', err);
                    // Fallback to manual entry
                    extractedReceiptItems = [
                        { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 },
                        { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 },
                        { item_name: '', quantity: 1, price: 0, confidence_score: 0.3 }
                    ];
                    resolve();
                });
            });
        }
        
        function displayExtractedItems() {
            const container = document.getElementById('extractedItems');
            
            let html = '<div style="margin-bottom: 15px;"><strong>Enter items from your receipt:</strong></div>';
            
            extractedReceiptItems.forEach((item, index) => {
                html += `
                    <div style="background: var(--gray-light); padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                        <div style="margin-bottom: 12px;">
                            <input type="text" placeholder="Item name" value="${item.item_name}" onchange="updateExtractedItem(${index}, 'item_name', this.value)" style="width: 100%; padding: 12px; margin-bottom: 8px; font-size: 16px;">
                            <div style="display: flex; gap: 8px;">
                                <input type="number" placeholder="Qty" value="${item.quantity}" step="0.1" onchange="updateExtractedItem(${index}, 'quantity', this.value)" style="flex: 1; padding: 12px; font-size: 16px;">
                                <input type="number" placeholder="Price $" value="${item.price}" step="0.01" onchange="updateExtractedItem(${index}, 'price', this.value)" style="flex: 1; padding: 12px; font-size: 16px;">
                                <button onclick="removeExtractedItem(${index})" style="background: var(--danger); color: white; border: none; padding: 12px 16px; border-radius: 4px; font-size: 16px;">&times;</button>
                            </div>
                        </div>
                        <div style="margin-bottom: 8px;">
                            <select onchange="updateExtractedItem(${index}, 'inventory_id', this.value)" style="width: 100%; padding: 12px; margin-bottom: 8px; font-size: 16px;">
                                <option value="">Link to existing inventory OR create new item</option>
                            </select>
                            <button onclick="createNewInventoryItem(${index})" style="background: var(--success); color: white; border: none; padding: 12px 16px; border-radius: 4px; width: 100%; font-size: 16px;">Create New Inventory Item</button>
                        </div>
                    </div>
                `;
            });
            
            html += '<button onclick="addMoreItems()" style="background: var(--orange); color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-bottom: 15px;">+ Add More Items</button>';
            
            container.innerHTML = html;
            
            fetch('/api/inventory')
                .then(r => r.json())
                .then(inventory => {
                    const selects = container.querySelectorAll('select');
                    selects.forEach(select => {
                        const options = inventory.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
                        select.innerHTML = '<option value="">Link to existing inventory OR create new item</option>' + options;
                    });
                });
        }
        
        function addMoreItems() {
            extractedReceiptItems.push({ item_name: '', quantity: 1, price: 0, confidence_score: 0.5 });
            displayExtractedItems();
        }
        
        function createNewInventoryItem(index) {
            const item = extractedReceiptItems[index];
            if (!item.item_name) {
                alert('Please enter an item name first');
                return;
            }
            
            const category = prompt('What category is this item?\n\nOptions: Food, Cleaning Supplies, To Go Supplies, Equipment, Other', 'Food');
            if (!category) return;
            
            const unit = prompt('What unit? (lb, oz, pieces, pack, etc.)', 'pieces');
            if (!unit) return;
            
            // Create new inventory item
            fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: item.item_name,
                    unit: unit,
                    category: category,
                    current_stock: item.quantity,
                    min_stock: 1,
                    max_stock: 100
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    item.inventory_id = data.id;
                    alert(`Created new inventory item: ${item.item_name}`);
                    displayExtractedItems();
                } else {
                    alert('Failed to create inventory item');
                }
            });
        }
        
        function addToInventory() {
            alert('Items would be added to inventory (demo)');
            closeReceiptScanner();
            loadReceipts();
        }
        
        function loadReceipts() {
            const container = document.getElementById('receiptsList');
            if (!container) return;
            
            fetch('/api/receipts')
                .then(r => r.json())
                .then(receipts => {
                    if (receipts.length === 0) {
                        container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--gray); padding: 40px;">No receipts found</div>';
                        return;
                    }
                    
                    container.innerHTML = receipts.map(receipt => `
                        <div class="card">
                            <div class="card-title">${receipt.merchant_name || 'Unknown'}</div>
                            <div class="card-meta">${receipt.category} • ${receipt.date}</div>
                            <div class="card-meta">$${receipt.total_amount?.toFixed(2) || '0.00'}</div>
                            <div class="card-meta" style="color: var(--orange); font-weight: bold;">PDF</div>
                            <div class="card-actions">
                                <button class="btn" onclick="viewReceiptFile(${receipt.id}, '${receipt.filename}', '${receipt.category}', '${receipt.date}')" style="background: var(--orange); color: white;">View PDF</button>
                                <button class="btn btn-danger" onclick="deleteReceipt(${receipt.id})">Delete</button>
                            </div>
                        </div>
                    `).join('');
                });
        }
        
        function viewReceiptFile(receiptId, filename, category, date) {
            const filePath = `/receipts/${category}/${date.substring(0, 7)}/${filename}`;
            window.open(filePath, '_blank');
        }
        
        function deleteReceipt(receiptId) {
            if (confirm('Delete this receipt?')) {
                fetch(`/api/receipts/${receiptId}`, { method: 'DELETE' })
                    .then(() => loadReceipts());
            }
        }
        
        function loadReceiptCategories() {
            fetch('/api/receipt-categories')
                .then(r => r.json())
                .then(categories => {
                    const container = document.getElementById('receiptCategoriesList');
                    if (!container) return;
                    container.innerHTML = categories.map(cat => `
                        <div style="display: inline-flex; align-items: center; background: var(--orange); color: white; padding: 6px 12px; border-radius: 20px; margin: 3px; font-size: 0.85em;">
                            <span style="margin-right: 8px;">${cat.name}</span>
                            <button onclick="deleteReceiptCategory('${cat.name}')" style="background: rgba(255,255,255,0.3); color: white; border: none; width: 18px; height: 18px; border-radius: 50%; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">&times;</button>
                        </div>
                    `).join('');
                });
        }
        
        function addReceiptCategory() {
            const input = document.getElementById('newReceiptCategory');
            const name = input.value.trim();
            if (!name) return;
            
            fetch('/api/receipt-categories', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, keywords: ''})
            }).then(() => {
                input.value = '';
                loadReceiptCategories();
            });
        }
        
        function deleteReceiptCategory(name) {
            if (confirm(`Delete category "${name}"?`)) {
                fetch(`/api/receipt-categories/${name}`, {method: 'DELETE'})
                    .then(() => loadReceiptCategories());
            }
        }
