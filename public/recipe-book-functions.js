// Recipe Book Functions
function loadRecipeBook() {
    fetch('/api/recipe-book')
        .then(r => r.json())
        .then(recipes => {
            document.getElementById('recipesList').innerHTML = recipes.map(recipe => `
                <div class="card">
                    <div class="card-title" onclick="toggleRecipeCard(${recipe.id})" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        ${recipe.name}
                        <span id="recipe-icon-${recipe.id}">▼</span>
                    </div>
                    <div class="card-meta">${recipe.prep_time ? `Prep: ${recipe.prep_time}` : ''} ${recipe.cook_time ? `• Cook: ${recipe.cook_time}` : ''} ${recipe.servings ? `• Serves ${recipe.servings}` : ''}</div>
                    <div class="card-meta">${recipe.description || ''}</div>
                    <div id="recipe-details-${recipe.id}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border);">
                        <div style="margin-bottom: 15px;">
                            <h4 style="margin-bottom: 8px;">Ingredients:</h4>
                            <div style="background: var(--gray-light); padding: 10px; border-radius: 6px; white-space: pre-line;">${recipe.ingredients || 'No ingredients listed'}</div>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 8px;">Instructions:</h4>
                            <div style="background: var(--gray-light); padding: 10px; border-radius: 6px; white-space: pre-line;">${recipe.instructions || 'No instructions listed'}</div>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn" onclick="editRecipeBook(${recipe.id})" style="background: var(--orange); color: white;">Edit</button>
                        <button class="btn btn-danger" onclick="deleteRecipeBook(${recipe.id})">Delete</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(() => {
            document.getElementById('recipesList').innerHTML = '<div class="card"><div class="card-title">No recipes yet</div><div class="card-meta">Add your first recipe to get started</div></div>';
        });
}

function toggleRecipeCard(id) {
    const details = document.getElementById(`recipe-details-${id}`);
    const icon = document.getElementById(`recipe-icon-${id}`);
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        icon.textContent = '▲';
    } else {
        details.style.display = 'none';
        icon.textContent = '▼';
    }
}

function addRecipeBook() {
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalForm = document.getElementById('modalForm');
    
    modalTitle.textContent = 'Add Recipe';
    modalForm.innerHTML = `
        <div class="form">
            <div class="form-group">
                <label>Recipe Name</label>
                <input type="text" id="recipeName" placeholder="e.g., Grandma's Birria">
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="recipeDescription" placeholder="Brief description of the dish">
            </div>
            <div class="form-row">
                <div style="flex: 1;">
                    <label>Prep Time</label>
                    <input type="text" id="prepTime" placeholder="e.g., 30 min">
                </div>
                <div style="flex: 1;">
                    <label>Cook Time</label>
                    <input type="text" id="cookTime" placeholder="e.g., 2 hours">
                </div>
                <div style="flex: 1;">
                    <label>Servings</label>
                    <input type="number" id="servings" placeholder="4" min="1">
                </div>
            </div>
            <div class="form-group">
                <label>Ingredients</label>
                <textarea id="ingredients" placeholder="List ingredients with measurements:

2 lbs beef chuck roast
1 white onion, diced
4 cloves garlic, minced
..." rows="8"></textarea>
            </div>
            <div class="form-group">
                <label>Instructions</label>
                <textarea id="instructions" placeholder="Step-by-step cooking instructions:

1. Season the beef with salt and pepper
2. Heat oil in a large pot over medium-high heat
3. Brown the beef on all sides
..." rows="10"></textarea>
            </div>
            <button class="btn" onclick="saveRecipeBook(); closeAddModal();">Save Recipe</button>
        </div>
    `;
    
    modal.classList.add('show');
}

function saveRecipeBook() {
    const name = document.getElementById('recipeName').value.trim();
    const description = document.getElementById('recipeDescription').value.trim();
    const prepTime = document.getElementById('prepTime').value.trim();
    const cookTime = document.getElementById('cookTime').value.trim();
    const servings = document.getElementById('servings').value;
    const ingredients = document.getElementById('ingredients').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!name) {
        alert('Please enter a recipe name');
        return;
    }
    
    fetch('/api/recipe-book', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name,
            description,
            prep_time: prepTime,
            cook_time: cookTime,
            servings: servings ? parseInt(servings) : null,
            ingredients,
            instructions
        })
    })
    .then(() => loadRecipeBook())
    .catch(err => alert('Failed to save recipe'));
}

function editRecipeBook(id) {
    fetch(`/api/recipe-book/${id}`)
        .then(r => r.json())
        .then(recipe => {
            const modal = document.getElementById('addModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalForm = document.getElementById('modalForm');
            
            modalTitle.textContent = 'Edit Recipe';
            modalForm.innerHTML = `
                <div class="form">
                    <div class="form-group">
                        <label>Recipe Name</label>
                        <input type="text" id="recipeName" placeholder="Recipe name" value="${recipe.name}">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" id="recipeDescription" placeholder="Brief description" value="${recipe.description || ''}">
                    </div>
                    <div class="form-row">
                        <div style="flex: 1;">
                            <label>Prep Time</label>
                            <input type="text" id="prepTime" placeholder="e.g., 30 min" value="${recipe.prep_time || ''}">
                        </div>
                        <div style="flex: 1;">
                            <label>Cook Time</label>
                            <input type="text" id="cookTime" placeholder="e.g., 2 hours" value="${recipe.cook_time || ''}">
                        </div>
                        <div style="flex: 1;">
                            <label>Servings</label>
                            <input type="number" id="servings" placeholder="4" min="1" value="${recipe.servings || ''}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ingredients</label>
                        <textarea id="ingredients" placeholder="List ingredients with measurements" rows="8">${recipe.ingredients || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Instructions</label>
                        <textarea id="instructions" placeholder="Step-by-step cooking instructions" rows="10">${recipe.instructions || ''}</textarea>
                    </div>
                    <button class="btn" onclick="updateRecipeBook(${id}); closeAddModal();">Update Recipe</button>
                </div>
            `;
            
            modal.classList.add('show');
        });
}

function updateRecipeBook(id) {
    const name = document.getElementById('recipeName').value.trim();
    const description = document.getElementById('recipeDescription').value.trim();
    const prepTime = document.getElementById('prepTime').value.trim();
    const cookTime = document.getElementById('cookTime').value.trim();
    const servings = document.getElementById('servings').value;
    const ingredients = document.getElementById('ingredients').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    
    if (!name) {
        alert('Please enter a recipe name');
        return;
    }
    
    fetch(`/api/recipe-book/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            name,
            description,
            prep_time: prepTime,
            cook_time: cookTime,
            servings: servings ? parseInt(servings) : null,
            ingredients,
            instructions
        })
    })
    .then(() => loadRecipeBook())
    .catch(err => alert('Failed to update recipe'));
}

function deleteRecipeBook(id) {
    if (confirm('Delete this recipe? This cannot be undone.')) {
        fetch(`/api/recipe-book/${id}`, {method: 'DELETE'})
            .then(() => loadRecipeBook())
            .catch(err => alert('Failed to delete recipe'));
    }
}