        // File Upload Functions
        function uploadFile() {
            const fileInput = document.getElementById('fileUpload');
            const files = fileInput.files;
            
            if (files.length === 0) {
                alert('Please select files to upload');
                return;
            }
            
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);
                
                fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                    uploadedFiles.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        path: data.path,
                        size: file.size,
                        type: file.type,
                        uploadDate: new Date().toLocaleDateString()
                    });
                    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
                    loadFiles();
                })
                .catch(error => {
                    console.error('Upload error:', error);
                    alert('Upload failed');
                });
            }
            
            fileInput.value = '';
        }
        
        let currentFileFilter = 'All';
        
        function uploadFileFromSection() {
            const fileInput = document.getElementById('fileUpload');
            const files = fileInput.files;
            const category = document.getElementById('uploadFileCategory').value;
            
            if (files.length === 0) return;
            
            for (let file of files) {
                const formData = new FormData();
                formData.append('file', file);
                
                fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                    uploadedFiles.push({
                        id: Date.now() + Math.random(),
                        name: file.name,
                        path: data.path,
                        size: file.size,
                        type: file.type,
                        category: category,
                        uploadDate: new Date().toLocaleDateString()
                    });
                    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
                    loadFiles();
                })
                .catch(error => {
                    console.error('Upload error:', error);
                    alert('Upload failed');
                });
            }
            
            fileInput.value = '';
        }
        
        function filterFiles(category) {
            currentFileFilter = category;
            
            // Update button styles
            document.querySelectorAll('[id^="filter-"]').forEach(btn => {
                btn.style.background = 'var(--gray)';
            });
            document.getElementById(`filter-${category}`).style.background = 'var(--orange)';
            
            loadFiles();
        }
        
        function loadFiles() {
            const storedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
            const existingFiles = [
                {
                    id: 1,
                    name: 'birria-fusion-logo.png',
                    path: '/uploads/1763192867406_birria-fusion-logo.png',
                    size: 0,
                    type: 'image/png',
                    category: 'Images',
                    uploadDate: 'Previously uploaded'
                }
            ];
            
            const allFiles = [...existingFiles, ...storedFiles];
            displayFiles(allFiles);
        }
        
        function displayFiles(files) {
            // Filter files based on current filter
            const filteredFiles = currentFileFilter === 'All' ? files : files.filter(file => file.category === currentFileFilter);
            
            const categoryColors = {
                'General': '#6c757d',
                'Event Contracts': '#ff6b35',
                'Catering Contracts': '#28a745',
                'Permits': '#dc3545',
                'Insurance': '#6f42c1',
                'Marketing': '#20c997',
                'Images': '#17a2b8',
                'Receipts': '#ffc107',
                'Other': '#fd7e14'
            };
            
            document.getElementById('filesList').innerHTML = filteredFiles.map(file => {
                const isImage = file.type && file.type.startsWith('image/');
                const category = file.category || 'General';
                const categoryColor = categoryColors[category] || '#6c757d';
                
                const thumbnail = isImage ? 
                    `<img src="${file.path}" class="file-thumbnail">` : 
                    `<div class="file-icon" style="background: ${categoryColor};">${file.name.split('.').pop().toUpperCase()}</div>`;
                
                return `
                    <div class="file-card">
                        ${thumbnail}
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta" style="color: ${categoryColor}; font-weight: bold;">${category}</div>
                        <div class="file-meta">${file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : 'Logo'}</div>
                        <div class="file-actions">
                            <button class="btn" onclick="viewFile('${file.path}')" style="background: #ff6b35; color: white;">View</button>
                            <button class="btn" onclick="editFile(${file.id})" style="background: var(--success); color: white;">Edit</button>
                            ${file.id !== 1 ? `<button class="btn btn-danger" onclick="deleteFile(${file.id})">Del</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function viewFile(path) {
            window.open(path, '_blank');
        }
        
        function editFile(id) {
            // Handle existing logo file
            if (id === 1) {
                const modal = document.getElementById('addModal');
                const modalTitle = document.getElementById('modalTitle');
                const modalForm = document.getElementById('modalForm');
                
                modalTitle.textContent = 'Edit File';
                modalForm.innerHTML = `
                    <div class="form">
                        <div class="form-group">
                            <input type="text" id="fileName" placeholder="File Name" value="birria-fusion-logo.png">
                        </div>
                        <div class="form-group">
                            <select id="fileCategory">
                                <option value="General">General</option>
                                <option value="Event Contracts">Event Contracts</option>
                                <option value="Catering Contracts">Catering Contracts</option>
                                <option value="Permits">Permits</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Marketing" selected>Marketing</option>
                                <option value="Receipts">Receipts</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button class="btn" onclick="updateFile(${id}); closeAddModal();">Update File</button>
                    </div>
                `;
                
                modal.classList.add('show');
                return;
            }
            
            const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
            const file = files.find(f => f.id === id);
            if (!file) return;
            
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Edit File';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <input type="text" id="fileName" placeholder="File Name" value="${file.name}">
                    </div>
                    <div class="form-group">
                        <select id="fileCategory">
                            ${getAllFileCategories().map(cat => `<option value="${cat}" ${file.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn" onclick="updateFile(${id}); closeAddModal();">Update File</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function updateFile(id) {
            const newName = document.getElementById('fileName').value;
            const newCategory = document.getElementById('fileCategory').value;
            
            if (!newName) {
                alert('Please enter a file name');
                return;
            }
            
            // Handle existing logo file
            if (id === 1) {
                // Update the existing files array to include the logo with new details
                const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                const logoFile = {
                    id: 1,
                    name: newName,
                    path: '/uploads/1763192867406_birria-fusion-logo.png',
                    size: 0,
                    type: 'image/png',
                    category: newCategory,
                    uploadDate: 'Previously uploaded'
                };
                
                // Remove any existing logo entry and add updated one
                const filteredFiles = uploadedFiles.filter(f => f.id !== 1);
                filteredFiles.unshift(logoFile);
                localStorage.setItem('uploadedFiles', JSON.stringify(filteredFiles));
                loadFiles();
                return;
            }
            
            const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
            const fileIndex = files.findIndex(f => f.id === id);
            
            if (fileIndex !== -1) {
                files[fileIndex].name = newName;
                files[fileIndex].category = newCategory;
                localStorage.setItem('uploadedFiles', JSON.stringify(files));
                loadFiles();
            }
        }
        
        function deleteFile(id) {
            if (confirm('Delete this file?')) {
                const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
                const filtered = files.filter(f => f.id !== id);
                localStorage.setItem('uploadedFiles', JSON.stringify(filtered));
                loadFiles();
            }
        }
        
