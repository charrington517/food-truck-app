        // Employee Functions
        function addEmployee() {
            const name = document.getElementById('newEmployeeName').value.trim();
            const role = document.getElementById('newEmployeeRole').value;
            const email = document.getElementById('newEmployeeEmail').value.trim();
            const phone = document.getElementById('newEmployeePhone').value.trim();
            const address = document.getElementById('newEmployeeAddress').value.trim();
            const food_handler_card_number = document.getElementById('newEmployeeFoodHandlerCard').value.trim();
            const food_handler_expiration = document.getElementById('newEmployeeFoodHandlerExpiration').value;
            const food_handler_photo_file = document.getElementById('newEmployeeFoodHandlerPhoto').files[0];
            const notes = document.getElementById('newEmployeeNotes').value.trim();
            
            if (!name || !role) {
                alert('Please enter employee name and role');
                return;
            }
            
            const saveEmployee = (photoPath = null) => {
                const employees = JSON.parse(localStorage.getItem('employees') || '[]');
                const newEmployee = {
                    id: Date.now(),
                    name,
                    role,
                    email,
                    phone,
                    address,
                    food_handler_card_number,
                    food_handler_expiration,
                    food_handler_photo: photoPath,
                    notes,
                    status: 'signed-out',
                    signInTime: null
                };
                
                employees.push(newEmployee);
                localStorage.setItem('employees', JSON.stringify(employees));
                
                document.getElementById('newEmployeeName').value = '';
                document.getElementById('newEmployeeRole').value = '';
                document.getElementById('newEmployeeEmail').value = '';
                document.getElementById('newEmployeePhone').value = '';
                document.getElementById('newEmployeeAddress').value = '';
                document.getElementById('newEmployeeFoodHandlerCard').value = '';
                document.getElementById('newEmployeeFoodHandlerExpiration').value = '';
                document.getElementById('newEmployeeFoodHandlerPhoto').value = '';
                document.getElementById('newEmployeeNotes').value = '';
                
                loadEmployees();
            };
            
            if (food_handler_photo_file) {
                const formData = new FormData();
                formData.append('file', food_handler_photo_file);
                fetch('/upload', {method: 'POST', body: formData})
                    .then(r => r.json())
                    .then(data => saveEmployee(data.path));
            } else {
                saveEmployee();
            }
        }
        
        function toggleEmployeeList() {
            const container = document.getElementById('employeeListContainer');
            const icon = document.getElementById('emplist-icon');
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                loadEmployeeList();
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function toggleStatusSection() {
            const container = document.getElementById('employeeStatusContainer');
            const icon = document.getElementById('empstatus-icon');
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                loadEmployees();
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        let showingArchivedReviews = false;
        
        function togglePerformanceReviews() {
            const container = document.getElementById('performanceReviewsContainer');
            const icon = document.getElementById('reviews-icon');
            if (container.style.display === 'none') {
                container.style.display = 'block';
                icon.textContent = '▲';
                fetch('/api/performance-reviews/auto-archive', {method: 'POST'}).then(() => loadReviewEmployees());
            } else {
                container.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function showCurrentReviews() {
            showingArchivedReviews = false;
            document.getElementById('currentReviewsBtn').style.background = 'var(--orange)';
            document.getElementById('archivedReviewsBtn').style.background = 'var(--gray)';
            loadEmployeeReviews();
        }
        
        function showArchivedReviews() {
            showingArchivedReviews = true;
            document.getElementById('currentReviewsBtn').style.background = 'var(--gray)';
            document.getElementById('archivedReviewsBtn').style.background = 'var(--orange)';
            loadEmployeeReviews();
        }
        
        async function loadReviewEmployees() {
            const employees = await fetch('/api/employees').then(r => r.json());
            const select = document.getElementById('reviewEmployee');
            select.innerHTML = '<option value="">All employees</option>' + employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
            loadEmployeeReviews();
        }
        
        async function loadEmployeeReviews() {
            const employeeId = document.getElementById('reviewEmployee').value;
            const endpoint = showingArchivedReviews ? 'archived-performance-reviews' : 'performance-reviews';
            const reviews = employeeId ? await fetch(`/api/${endpoint}/employee/${employeeId}`).then(r => r.json()) : await fetch(`/api/${endpoint}`).then(r => r.json());
            
            if (reviews.length === 0) {
                document.getElementById('reviewsList').innerHTML = '<div style="color: var(--gray); font-style: italic; text-align: center; padding: 20px;">No reviews yet</div>';
                return;
            }
            
            document.getElementById('reviewsList').innerHTML = reviews.map(r => `
                <div style="background: var(--gray-light); border-radius: 8px; margin-bottom: 10px;">
                    <div onclick="toggleReviewDetails(${r.id})" style="padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; font-size: 1.1em;">${r.employee_name}</div>
                            <div style="font-size: 0.9em; color: var(--gray);">Reviewed by ${r.reviewer_name || 'N/A'} on ${r.review_date} • Overall: ${r.overall_rating}/5${showingArchivedReviews && r.archived_date ? ` • Archived ${new Date(r.archived_date).toLocaleDateString()}` : ''}</div>
                        </div>
                        <span id="review-icon-${r.id}">▼</span>
                    </div>
                    <div id="review-details-${r.id}" style="display: none; padding: 0 15px 15px 15px; border-top: 1px solid var(--border);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin: 10px 0;">
                            <div><strong>Attendance:</strong> ${r.attendance_rating}/5</div>
                            <div><strong>Quality:</strong> ${r.quality_rating}/5</div>
                            <div><strong>Teamwork:</strong> ${r.teamwork_rating}/5</div>
                            <div><strong>Punctuality:</strong> ${r.punctuality_rating}/5</div>
                        </div>
                        ${r.strengths ? `<div style="margin-bottom: 8px;"><strong>Strengths:</strong> ${r.strengths}</div>` : ''}
                        ${r.areas_for_improvement ? `<div style="margin-bottom: 8px;"><strong>Areas for Improvement:</strong> ${r.areas_for_improvement}</div>` : ''}
                        ${r.goals ? `<div style="margin-bottom: 8px;"><strong>Goals:</strong> ${r.goals}</div>` : ''}
                        ${r.notes ? `<div style="margin-bottom: 8px;"><strong>Notes:</strong> ${r.notes}</div>` : ''}
                        ${!showingArchivedReviews ? `<div style="display: flex; gap: 8px; margin-top: 10px;"><button class="btn" onclick="event.stopPropagation(); archiveReview(${r.id})" style="padding: 4px 8px; font-size: 0.8em; width: auto; background: var(--warning);">Archive</button><button class="btn btn-danger" onclick="event.stopPropagation(); deleteReview(${r.id})" style="padding: 4px 8px; font-size: 0.8em; width: auto;">Delete</button></div>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        function addPerformanceReview() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Performance Review';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <select id="reviewEmployeeId" style="width: 100%;">
                            <option value="">Select employee...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="text" id="reviewerName" placeholder="Reviewer Name" value="${currentUser?.name || ''}">
                    </div>
                    <div class="form-group">
                        <input type="date" id="reviewDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                        <div><label>Attendance (1-5)</label><input type="number" id="attendanceRating" min="1" max="5" value="3"></div>
                        <div><label>Quality (1-5)</label><input type="number" id="qualityRating" min="1" max="5" value="3"></div>
                        <div><label>Teamwork (1-5)</label><input type="number" id="teamworkRating" min="1" max="5" value="3"></div>
                        <div><label>Punctuality (1-5)</label><input type="number" id="punctualityRating" min="1" max="5" value="3"></div>
                        <div style="grid-column: 1 / -1;"><label>Overall (1-5)</label><input type="number" id="overallRating" min="1" max="5" value="3"></div>
                    </div>
                    <div class="form-group">
                        <textarea id="strengths" placeholder="Strengths" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <textarea id="areasForImprovement" placeholder="Areas for Improvement" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <textarea id="goals" placeholder="Goals for Next Review" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <textarea id="reviewNotes" placeholder="Additional Notes" rows="2"></textarea>
                    </div>
                    <button class="btn" onclick="savePerformanceReview(); closeAddModal();">Save Review</button>
                </div>
            `;
            
            fetch('/api/employees').then(r => r.json()).then(employees => {
                document.getElementById('reviewEmployeeId').innerHTML = '<option value="">Select employee...</option>' + employees.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
            });
            
            modal.classList.add('show');
        }
        
        function savePerformanceReview() {
            const employee_id = document.getElementById('reviewEmployeeId').value;
            const reviewer_name = document.getElementById('reviewerName').value;
            const review_date = document.getElementById('reviewDate').value;
            const attendance_rating = parseInt(document.getElementById('attendanceRating').value);
            const quality_rating = parseInt(document.getElementById('qualityRating').value);
            const teamwork_rating = parseInt(document.getElementById('teamworkRating').value);
            const punctuality_rating = parseInt(document.getElementById('punctualityRating').value);
            const overall_rating = parseInt(document.getElementById('overallRating').value);
            const strengths = document.getElementById('strengths').value;
            const areas_for_improvement = document.getElementById('areasForImprovement').value;
            const goals = document.getElementById('goals').value;
            const notes = document.getElementById('reviewNotes').value;
            
            if (!employee_id || !review_date) {
                alert('Please select employee and review date');
                return;
            }
            
            fetch('/api/performance-reviews', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    employee_id, reviewer_name, review_date, attendance_rating, quality_rating,
                    teamwork_rating, punctuality_rating, overall_rating, strengths,
                    areas_for_improvement, goals, notes
                })
            }).then(() => loadEmployeeReviews());
        }
        
        function toggleReviewDetails(id) {
            const details = document.getElementById(`review-details-${id}`);
            const icon = document.getElementById(`review-icon-${id}`);
            if (details.style.display === 'none') {
                details.style.display = 'block';
                icon.textContent = '▲';
            } else {
                details.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function archiveReview(id) {
            if (confirm('Archive this review?')) {
                fetch(`/api/performance-reviews/${id}/archive`, {method: 'POST'})
                    .then(() => loadEmployeeReviews());
            }
        }
        
        function deleteReview(id) {
            if (confirm('Delete this review?')) {
                fetch(`/api/performance-reviews/${id}`, {method: 'DELETE'})
                    .then(() => loadEmployeeReviews());
            }
        }
        
        function toggleAddEmployeeInList() {
            const form = document.getElementById('add-employee-form');
            if (form.style.display === 'none') {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        }
        
        function loadEmployeeList() {
            const employees = JSON.parse(localStorage.getItem('employees') || '[]');
            const list = document.getElementById('employeeList');
            
            let html = '';
            
            if (employees.length === 0) {
                html = '<div style="color: var(--gray); font-style: italic; text-align: center; padding: 20px;">No employees added yet</div>';
            } else {
                html = employees.map(emp => {
                    let cardStatus = '';
                    let cardColor = 'var(--gray)';
                    if (emp.food_handler_expiration) {
                        const expDate = new Date(emp.food_handler_expiration);
                        const today = new Date();
                        const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                        if (daysUntilExpiry < 0) {
                            cardStatus = 'EXPIRED';
                            cardColor = 'var(--danger)';
                        } else if (daysUntilExpiry <= 30) {
                            cardStatus = `Expires in ${daysUntilExpiry} days`;
                            cardColor = 'var(--warning)';
                        } else {
                            cardStatus = `Valid until ${emp.food_handler_expiration}`;
                            cardColor = 'var(--success)';
                        }
                    } else {
                        cardStatus = 'No card on file';
                        cardColor = 'var(--danger)';
                    }
                    
                    return `
                        <div style="background: var(--gray-light); border-radius: 6px; margin-bottom: 8px;">
                            <div onclick="toggleEmployeeDetails(${emp.id})" style="cursor: pointer; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 600;">${emp.name}</div>
                                    <div style="font-size: 0.85em; color: var(--gray);">${emp.role}</div>
                                    <div style="font-size: 0.8em; color: ${cardColor}; font-weight: 500; margin-top: 4px;">Food Handler Card: ${cardStatus}</div>
                                </div>
                                <span id="emp-icon-${emp.id}" style="font-size: 1.2em;">▼</span>
                            </div>
                            <div id="emp-details-${emp.id}" style="display: none; padding: 0 12px 12px 12px; border-top: 1px solid var(--border);">
                                ${emp.email ? `<div style="margin: 8px 0;"><strong>Email:</strong> ${emp.email}</div>` : ''}
                                ${emp.phone ? `<div style="margin: 8px 0;"><strong>Phone:</strong> ${emp.phone}</div>` : ''}
                                ${emp.address ? `<div style="margin: 8px 0;"><strong>Address:</strong> ${emp.address}</div>` : ''}
                                ${emp.notes ? `<div style="margin: 8px 0;"><strong>Notes:</strong> ${emp.notes}</div>` : ''}
                                ${emp.food_handler_photo ? `<div style="margin: 8px 0;"><strong>Food Handler Card Photo:</strong><br><img src="${emp.food_handler_photo}" style="max-width: 200px; border-radius: 4px; margin-top: 5px; cursor: pointer;" onclick="window.open('${emp.food_handler_photo}', '_blank')"></div>` : ''}
                                <div style="display: flex; gap: 8px; margin-top: 15px;">
                                    <button class="btn" onclick="event.stopPropagation(); editEmployee(${emp.id})" style="padding: 6px 12px; font-size: 0.85em; width: auto; background: var(--orange); color: white;">Edit</button>
                                    <button class="btn btn-danger" onclick="event.stopPropagation(); deleteEmployee(${emp.id})" style="padding: 6px 12px; font-size: 0.85em; width: auto;">Delete</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            list.innerHTML = html;
        }
        
