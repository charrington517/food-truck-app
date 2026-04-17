        // Cost Calculator Functions
        function toggleCostSection(section) {
            const content = document.getElementById(`${section}-content`);
            const icon = document.getElementById(`${section}-icon`);
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.textContent = '▲';
            } else {
                content.style.display = 'none';
                icon.textContent = '▼';
            }
        }
        
        function loadRecipeForCalculation() {
            const recipeId = document.getElementById('recipeSelect').value;
            if (!recipeId) {
                document.getElementById('recipeCalculation').innerHTML = '';
                return;
            }
            
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const recipe = items.find(item => item.id == recipeId);
                    if (!recipe) return;
                    
                    fetch(`/api/recipes/menu/${recipeId}`)
                        .then(r => r.json())
                        .then(data => {
                            const ingredients = JSON.parse(data.ingredients || '[]');
                            const totalCost = ingredients.reduce((sum, ing) => sum + (ing.calculatedCost || 0), 0);
                            const costPerPortion = totalCost / recipe.portions;
                            const margin = ((recipe.price - costPerPortion) / recipe.price) * 100;
                    
                    document.getElementById('recipeCalculation').innerHTML = `
                        <div style="font-size: 0.9em; line-height: 1.4;">
                            <div><strong>${recipe.name}</strong></div>
                            <div>Total Cost: $${totalCost.toFixed(2)}</div>
                            <div>Portions: ${recipe.portions}</div>
                            <div>Cost per Portion: $${costPerPortion.toFixed(2)}</div>
                            <div>Selling Price: $${recipe.price.toFixed(2)}</div>
                            <div style="color: ${margin >= 30 ? 'var(--success)' : margin >= 20 ? 'var(--warning)' : 'var(--danger)'}">Margin: ${margin.toFixed(1)}%</div>
                        </div>
                    `;
                        });
                });
        }
        
        function calculatePortionCost() {
            const baseCost = parseFloat(document.getElementById('baseCost').value);
            const basePortions = parseFloat(document.getElementById('basePortions').value);
            const newPortions = parseFloat(document.getElementById('newPortions').value);
            
            if (!baseCost || !basePortions || !newPortions) {
                alert('Please fill in all fields');
                return;
            }
            
            const costPerPortion = baseCost / basePortions;
            const newTotalCost = costPerPortion * newPortions;
            const scaleFactor = newPortions / basePortions;
            
            document.getElementById('portionResult').innerHTML = `
                <div style="font-size: 0.9em; line-height: 1.4;">
                    <div>Cost per Portion: $${costPerPortion.toFixed(2)}</div>
                    <div>New Total Cost: $${newTotalCost.toFixed(2)}</div>
                    <div>Scale Factor: ${scaleFactor.toFixed(2)}x</div>
                </div>
            `;
        }
        
        function convertUnits() {
            const amount = parseFloat(document.getElementById('convertAmount').value);
            const from = document.getElementById('convertFrom').value;
            const to = document.getElementById('convertTo').value;
            
            if (!amount || amount <= 0) {
                document.getElementById('conversionResult').textContent = 'Please enter a valid amount';
                return;
            }
            
            const conversions = {
                cups: { oz: 8, ml: 236.588, liters: 0.236588, tbsp: 16, tsp: 48, g: 236.588, kg: 0.236588, lb: 0.52 },
                oz: { cups: 0.125, ml: 29.5735, liters: 0.0295735, tbsp: 2, tsp: 6, g: 28.3495, kg: 0.0283495, lb: 0.0625 },
                lb: { oz: 16, cups: 1.92, g: 453.592, kg: 0.453592, ml: 453.592, liters: 0.453592, tbsp: 30.67, tsp: 92 },
                g: { oz: 0.035274, cups: 0.00422675, lb: 0.00220462, kg: 0.001, ml: 1, liters: 0.001, tbsp: 0.067628, tsp: 0.202884 },
                kg: { g: 1000, oz: 35.274, cups: 4.22675, lb: 2.20462, ml: 1000, liters: 1, tbsp: 67.628, tsp: 202.884 },
                ml: { oz: 0.033814, cups: 0.00422675, g: 1, kg: 0.001, liters: 0.001, tbsp: 0.067628, tsp: 0.202884, lb: 0.00220462 },
                liters: { ml: 1000, oz: 33.814, cups: 4.22675, g: 1000, kg: 1, tbsp: 67.628, tsp: 202.884, lb: 2.20462 },
                tbsp: { tsp: 3, oz: 0.5, cups: 0.0625, ml: 14.7868, liters: 0.0147868, g: 14.7868, kg: 0.0147868, lb: 0.03125 },
                tsp: { tbsp: 0.333333, oz: 0.166667, cups: 0.0208333, ml: 4.92892, liters: 0.00492892, g: 4.92892, kg: 0.00492892, lb: 0.0104167 }
            };
            
            if (from === to) {
                document.getElementById('conversionResult').textContent = `${amount} ${from}`;
                return;
            }
            
            const result = amount * conversions[from][to];
            document.getElementById('conversionResult').textContent = `${amount} ${from} = ${result.toFixed(3)} ${to}`;
        }
        
        function calculateBreakEven() {
            const eventCosts = parseFloat(document.getElementById('eventCosts').value);
            const avgPrice = parseFloat(document.getElementById('avgItemPrice').value);
            const avgCost = parseFloat(document.getElementById('avgItemCost').value);
            
            if (!eventCosts || !avgPrice || !avgCost) {
                alert('Please fill in all fields');
                return;
            }
            
            const profitPerItem = avgPrice - avgCost;
            const breakEvenUnits = Math.ceil(eventCosts / profitPerItem);
            const breakEvenRevenue = breakEvenUnits * avgPrice;
            
            document.getElementById('breakEvenResult').innerHTML = `
                <div style="font-size: 0.9em; line-height: 1.4;">
                    <div>Profit per Item: $${profitPerItem.toFixed(2)}</div>
                    <div style="color: var(--orange);">Break-Even: ${breakEvenUnits} items</div>
                    <div>Break-Even Revenue: $${breakEvenRevenue.toFixed(2)}</div>
                    <div style="font-size: 0.8em; color: var(--gray); margin-top: 5px;">Need to sell ${breakEvenUnits} items to cover $${eventCosts.toFixed(2)} in costs</div>
                </div>
            `;
        }
        
        function loadRecipesForCalculator() {
            fetch('/api/menu')
                .then(r => r.json())
                .then(items => {
                    const select = document.getElementById('recipeSelect');
                    if (select) {
                        select.innerHTML = '<option value="">Select a recipe...</option>' +
                            items.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
                    }
                });
        }

