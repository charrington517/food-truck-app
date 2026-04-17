        // Review Functions
        function addReview() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Review';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-row">
                        <select id="reviewPlatform">
                            <option value="Google">Google</option>
                            <option value="Yelp">Yelp</option>
                            <option value="Facebook">Facebook</option>
                            <option value="TripAdvisor">TripAdvisor</option>
                            <option value="Other">Other</option>
                        </select>
                        <select id="reviewRating">
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <input type="text" id="reviewerName" placeholder="Reviewer Name">
                    </div>
                    <div class="form-group">
                        <textarea id="reviewText" placeholder="Review text..." rows="3"></textarea>
                    </div>
                    <div class="form-row">
                        <input type="text" id="reviewDate" placeholder="Review Date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                        <select id="responseStatus">
                            <option value="Not Responded">Not Responded</option>
                            <option value="Responded">Responded</option>
                            <option value="No Response Needed">No Response Needed</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <textarea id="responseText" placeholder="Your response (optional)..." rows="2"></textarea>
                    </div>
                    <button class="btn" onclick="saveReview(); closeAddModal();">Add Review</button>
                </div>
            `;
            
            modal.classList.add('show');
        }
        
        function saveReview() {
            const platform = document.getElementById('reviewPlatform').value;
            const rating = parseInt(document.getElementById('reviewRating').value);
            const reviewerName = document.getElementById('reviewerName').value;
            const reviewText = document.getElementById('reviewText').value;
            const reviewDate = document.getElementById('reviewDate').value;
            const responseStatus = document.getElementById('responseStatus').value;
            const responseText = document.getElementById('responseText').value;
            
            if (!reviewerName || !reviewText || !reviewDate) {
                alert('Please fill in reviewer name, review text, and date');
                return;
            }
            
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            reviews.push({
                id: Date.now(),
                platform,
                rating,
                reviewerName,
                reviewText,
                reviewDate,
                responseStatus,
                responseText
            });
            localStorage.setItem('reviews', JSON.stringify(reviews));
            loadReviews();
        }
        
        function loadReviews() {
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            
            // Calculate stats
            const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
            const totalReviews = reviews.length;
            const needResponse = reviews.filter(r => r.responseStatus === 'Not Responded').length;
            const thisMonth = new Date().toISOString().slice(0, 7);
            const monthlyReviews = reviews.filter(r => r.reviewDate.startsWith(thisMonth)).length;
            
            document.getElementById('reviewStats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">${avgRating}</div>
                    <div class="stat-label">Avg Rating</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalReviews}</div>
                    <div class="stat-label">Total Reviews</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color: ${needResponse > 0 ? 'var(--danger)' : 'var(--success)'}">${needResponse}</div>
                    <div class="stat-label">Need Response</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${monthlyReviews}</div>
                    <div class="stat-label">This Month</div>
                </div>
            `;
            
            // Show recent reviews
            const recentReviews = reviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)).slice(0, 10);
            document.getElementById('reviewList').innerHTML = recentReviews.map(review => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const statusColor = review.responseStatus === 'Not Responded' ? 'var(--danger)' : 
                                   review.responseStatus === 'Responded' ? 'var(--success)' : 'var(--gray)';
                
                return `
                    <div class="card">
                        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${review.reviewerName}</span>
                            <span style="color: #ffc107;">${stars}</span>
                        </div>
                        <div class="card-meta">${review.platform} • ${review.reviewDate}</div>
                        <div class="card-meta" style="font-style: italic; margin: 8px 0;">"${review.reviewText.substring(0, 100)}${review.reviewText.length > 100 ? '...' : ''}"</div>
                        <div class="card-meta" style="color: ${statusColor}; font-weight: bold;">${review.responseStatus}</div>
                        ${review.responseText ? `<div class="card-meta" style="background: var(--gray-light); padding: 8px; border-radius: 4px; margin-top: 8px;">Response: "${review.responseText.substring(0, 80)}${review.responseText.length > 80 ? '...' : ''}"</div>` : ''}
                        <div class="card-actions">
                            <button class="btn" onclick="respondToReview(${review.id})" style="background: var(--orange); color: white;">Respond</button>
                            <button class="btn btn-danger" onclick="deleteReview(${review.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function respondToReview(id) {
            const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            const review = reviews.find(r => r.id === id);
            if (!review) return;
            
            const response = prompt('Enter your response:', review.responseText || '');
            if (response !== null) {
                review.responseText = response;
                review.responseStatus = response.trim() ? 'Responded' : 'Not Responded';
                localStorage.setItem('reviews', JSON.stringify(reviews));
                loadReviews();
            }
        }
        
        function deleteReview(id) {
            if (confirm('Delete this review?')) {
                const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
                const filtered = reviews.filter(r => r.id !== id);
                localStorage.setItem('reviews', JSON.stringify(filtered));
                loadReviews();
            }
        }

