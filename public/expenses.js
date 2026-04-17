        // Expense Functions
        function addExpense() {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Add Expense';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-row">
                        <select id="expenseCategory">
                            ${getAllExpenseCategories().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        <input type="number" id="expenseAmount" placeholder="Amount ($)" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <input type="text" id="expenseDescription" placeholder="Description (e.g., Gas station fill-up, Paper towels)">
                    </div>
                    <div class="form-row">
                        <input type="text" id="expenseDate" placeholder="Date" onfocus="this.type='date'" onblur="if(!this.value)this.type='text'">
                        <select id="expensePayment">
                            <option value="Cash">Cash</option>
                            <option value="Card">Credit/Debit Card</option>
                            <option value="Check">Check</option>
                            <option value="Online">Online Payment</option>
                        </select>
                    </div>
                    <button class="btn" onclick="saveExpense(); closeAddModal();">Add Expense</button>
                </div>
            `;
            
            // Set today's date as default
            setTimeout(() => {
                document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
            }, 100);
            
            modal.classList.add('show');
        }
        
        function saveExpense() {
            const category = document.getElementById('expenseCategory').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const description = document.getElementById('expenseDescription').value;
            const date = document.getElementById('expenseDate').value;
            const payment = document.getElementById('expensePayment').value;
            
            if (!amount || !description || !date) {
                alert('Please fill in amount, description, and date');
                return;
            }
            
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            expenses.push({
                id: Date.now(),
                category,
                amount,
                description,
                date,
                payment
            });
            localStorage.setItem('expenses', JSON.stringify(expenses));
            loadExpenses();
        }
        
        function loadExpenses() {
            const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            
            // Calculate stats
            const thisMonth = new Date().toISOString().slice(0, 7);
            const monthlyExpenses = expenses.filter(e => e.date.startsWith(thisMonth));
            const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            const categories = {};
            monthlyExpenses.forEach(e => {
                categories[e.category] = (categories[e.category] || 0) + e.amount;
            });
            
            const topCategory = Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'None');
            
            document.getElementById('expenseStats').innerHTML = `
                <div class="stat-card">
                    <div class="stat-number">$${totalMonthly.toFixed(0)}</div>
                    <div class="stat-label">This Month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${monthlyExpenses.length}</div>
                    <div class="stat-label">Transactions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$${(totalMonthly / (monthlyExpenses.length || 1)).toFixed(0)}</div>
                    <div class="stat-label">Avg per Transaction</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${topCategory}</div>
                    <div class="stat-label">Top Category</div>
                </div>
            `;
            
            // Show recent expenses
            const recentExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
            document.getElementById('expenseList').innerHTML = recentExpenses.map(expense => {
                const categoryColors = {
                    'Fuel': '#ff6b35',
                    'Supplies': '#28a745',
                    'Permits': '#dc3545',
                    'Insurance': '#6f42c1',
                    'Maintenance': '#fd7e14',
                    'Marketing': '#20c997',
                    'Utilities': '#6c757d',
                    'Labor': '#007bff',
                    'Other': '#ffc107'
                };
                
                return `
                    <div class="card">
                        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>${expense.description}</span>
                            <span style="color: ${categoryColors[expense.category] || '#666'}; font-weight: bold;">$${expense.amount.toFixed(2)}</span>
                        </div>
                        <div class="card-meta">${expense.category} • ${expense.date}</div>
                        <div class="card-meta">Paid by ${expense.payment}</div>
                        <div class="card-actions">
                            <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        function deleteExpense(id) {
            if (confirm('Delete this expense?')) {
                const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
                const filtered = expenses.filter(e => e.id !== id);
                localStorage.setItem('expenses', JSON.stringify(filtered));
                loadExpenses();
            }
        }

