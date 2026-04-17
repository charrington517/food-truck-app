        // Analytics Functions
        function loadAnalytics() {
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const totalItems = items.length;
                    const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                    const goodItems = items.filter(item => ((item.price - item.cost) / item.price) * 100 >= defaultMargin).length;
                    const needsAttention = items.filter(item => {
                        const margin = ((item.price - item.cost) / item.price) * 100;
                        return margin >= (defaultMargin * 0.67) && margin < defaultMargin;
                    }).length;
                    const badItems = items.filter(item => ((item.price - item.cost) / item.price) * 100 < (defaultMargin * 0.67)).length;
                    
                    document.getElementById('analyticsStats').innerHTML = `
                        <div class="stat-card">
                            <div class="stat-number" style="color: var(--success)">${goodItems}</div>
                            <div class="stat-label">Good Items (30%+)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: var(--warning)">${needsAttention}</div>
                            <div class="stat-label">Needs Attention (20-29%)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" style="color: var(--danger)">${badItems}</div>
                            <div class="stat-label">Bad Items (<20%)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${totalItems}</div>
                            <div class="stat-label">Total Items</div>
                        </div>
                    `;
                    
                    document.getElementById('foodCostAnalysis').innerHTML = items.map(item => {
                        const foodCost = (item.cost / item.price) * 100;
                        const defaultMargin = parseFloat(localStorage.getItem('defaultMargin') || '30');
                        const margin = ((item.price - item.cost) / item.price) * 100;
                        const status = margin >= defaultMargin ? 'Good' : margin >= (defaultMargin * 0.67) ? 'Needs Attention' : 'Bad - Urgent';
                        const color = margin >= defaultMargin ? 'var(--success)' : margin >= (defaultMargin * 0.67) ? 'var(--warning)' : 'var(--danger)';
                        return `
                            <div class="card">
                                <div class="card-title">${item.name}</div>
                                <div class="card-meta">Food Cost: <span style="color: ${color}">${foodCost.toFixed(1)}%</span></div>
                                <div class="card-meta">Status: <span style="color: ${color}">${status}</span></div>
                                <div class="card-meta">Price: $${item.price} • Cost: $${item.cost}</div>
                            </div>
                        `;
                    }).join('');
                });
        }

