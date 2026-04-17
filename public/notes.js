        // Notes Functions
        let currentNotesItem = { type: '', id: 0, name: '' };

        async function openNotesModal(itemType, itemId, itemName) {
            currentNotesItem = { type: itemType, id: itemId, name: itemName };
            document.getElementById('notesModalTitle').textContent = `Notes - ${itemName}`;
            document.getElementById('newNoteText').value = '';
            await loadNotes();
            document.getElementById('notesModal').style.display = 'flex';
        }

        function closeNotesModal() {
            document.getElementById('notesModal').style.display = 'none';
        }

        async function loadNotes() {
            const response = await fetch(`/api/notes/${currentNotesItem.type}/${currentNotesItem.id}`);
            const notes = await response.json();
            
            const notesList = document.getElementById('notesList');
            if (notes.length === 0) {
                notesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No notes yet</p>';
                return;
            }
            
            notesList.innerHTML = notes.map(note => {
                const date = new Date(note.created_at);
                const dateStr = date.toLocaleString();
                return `
                    <div style="background: var(--card-bg); padding: 12px; margin-bottom: 10px; border-radius: 8px; border-left: 3px solid var(--orange);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <strong style="color: var(--orange);">${note.created_by || 'User'}</strong>
                                <span style="color: var(--text-secondary); font-size: 0.85em; margin-left: 10px;">${dateStr}</span>
                            </div>
                            <button onclick="deleteNote(${note.id})" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 1.2em;">&times;</button>
                        </div>
                        <div style="white-space: pre-wrap;">${note.note_text}</div>
                    </div>
                `;
            }).join('');
        }

        async function addNote() {
            const noteText = document.getElementById('newNoteText').value.trim();
            if (!noteText) return;
            
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_type: currentNotesItem.type,
                    item_id: currentNotesItem.id,
                    note_text: noteText,
                    created_by: currentUser?.name || currentUser?.username || 'User'
                })
            });
            
            if (response.ok) {
                document.getElementById('newNoteText').value = '';
                await loadNotes();
            }
        }

        async function deleteNote(noteId) {
            if (!confirm('Delete this note?')) return;
            
            const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
            if (response.ok) {
                await loadNotes();
            }
        }

