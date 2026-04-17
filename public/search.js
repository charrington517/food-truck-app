        // Global Search Functions
        let searchData = { all: [] };
        let currentSearchFilter = 'all';
        
        function openSearch() {
            document.getElementById('searchModal').classList.add('show');
            document.getElementById('globalSearch').focus();
            loadRecentSearches();
        }
        
        function closeSearch() {
            document.getElementById('searchModal').classList.remove('show');
            document.getElementById('globalSearch').value = '';
            document.getElementById('searchResults').innerHTML = '';
        }
        
        function loadRecentSearches() {
            const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            if (recent.length === 0) return;
            
            let html = '<div style="font-size: 0.85em; color: var(--gray); margin-bottom: 5px;">Recent:</div>';
            html += '<div style="display: flex; gap: 5px; flex-wrap: wrap;">';
            recent.forEach(term => {
                html += `<button onclick="document.getElementById('globalSearch').value='${term}'; performSearch();" style="background: var(--gray-light); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; font-size: 0.8em; cursor: pointer;">${term}</button>`;
            });
            html += '</div>';
            document.getElementById('recentSearches').innerHTML = html;
        }
        
        function saveRecentSearch(term) {
            if (!term || term.length < 2) return;
            let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            recent = recent.filter(t => t !== term);
            recent.unshift(term);
            recent = recent.slice(0, 10);
            localStorage.setItem('recentSearches', JSON.stringify(recent));
        }
        
        async function performSearch() {
            const query = document.getElementById('globalSearch').value.toLowerCase();
            if (query.length < 2) {
                document.getElementById('searchResults').innerHTML = '';
                return;
            }
            
            saveRecentSearch(query);
            
            const [events, catering, contacts, menu, employees] = await Promise.all([
                fetch('/api/events').then(r => r.json()),
                fetch('/api/catering').then(r => r.json()),
                fetch('/api/contacts').then(r => r.json()),
                fetch('/api/menu').then(r => r.json()),
                fetch('/api/employees').then(r => r.json())
            ]);
            
            searchData = {
                all: [],
                events: events.filter(e => e.name?.toLowerCase().includes(query) || e.location?.toLowerCase().includes(query)),
                catering: catering.filter(c => c.client?.toLowerCase().includes(query) || c.location?.toLowerCase().includes(query)),
                contacts: contacts.filter(c => c.name?.toLowerCase().includes(query) || c.company?.toLowerCase().includes(query)),
                menu: menu.filter(m => m.name?.toLowerCase().includes(query)),
                employees: employees.filter(e => e.name?.toLowerCase().includes(query) || e.role?.toLowerCase().includes(query))
            };
            
            searchData.all = [
                ...searchData.events.map(e => ({...e, type: 'event'})),
                ...searchData.catering.map(c => ({...c, type: 'catering'})),
                ...searchData.contacts.map(c => ({...c, type: 'contact'})),
                ...searchData.menu.map(m => ({...m, type: 'menu'})),
                ...searchData.employees.map(e => ({...e, type: 'employee'}))
            ];
            
            displaySearchResults();
        }
        
        function filterSearchResults(type) {
            currentSearchFilter = type;
            document.querySelectorAll('[id^="search-"]').forEach(btn => btn.style.background = 'var(--gray)');
            document.getElementById(`search-${type}`).style.background = 'var(--orange)';
            displaySearchResults();
        }
        
        function displaySearchResults() {
            const results = searchData[currentSearchFilter] || [];
            if (results.length === 0) {
                document.getElementById('searchResults').innerHTML = '<div style="text-align: center; color: var(--gray); padding: 20px;">No results found</div>';
                return;
            }
            
            let html = '';
            results.forEach(item => {
                const type = item.type;
                const icons = { event: '📅', catering: '🍽️', contact: '👤', menu: '🍴', employee: '👔' };
                const pages = { event: 'events', catering: 'catering', contact: 'contacts', menu: 'menu', employee: 'employee' };
                
                html += `<div onclick="closeSearch(); showPage('${pages[type]}');" style="background: var(--gray-light); padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; border: 1px solid var(--border);" onmouseover="this.style.borderColor='var(--orange)'" onmouseout="this.style.borderColor='var(--border)'">`;
                html += `<div style="display: flex; align-items: center; gap: 10px;">`;
                html += `<span style="font-size: 1.5em;">${icons[type]}</span>`;
                html += `<div style="flex: 1;">`;
                html += `<div style="font-weight: 600;">${item.name || item.client}</div>`;
                html += `<div style="font-size: 0.85em; color: var(--gray);">`;
                if (type === 'event') html += `${item.location} • ${item.date}`;
                if (type === 'catering') html += `${item.guests} guests • ${item.date}`;
                if (type === 'contact') html += `${item.company || ''} • ${item.category || ''}`;
                if (type === 'menu') html += `$${item.price} • ${item.recipe_type || ''}`;
                if (type === 'employee') html += `${item.role}`;
                html += `</div></div></div></div>`;
            });
            
            document.getElementById('searchResults').innerHTML = html;
        }

