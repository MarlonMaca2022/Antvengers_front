// admin_categorias.js
document.addEventListener('DOMContentLoaded', () => {
    // --- INITIAL DATA SETUP ---
    const initializeCategoriasData = () => {
        if (!localStorage.getItem('ant_categorias')) {
            const initialCategorias = [
                { id: Date.now(), nombre: 'Alimentos', ref: 'CAT-001', descripcion: 'Insumos básicos y productos perecederos de la canasta familiar colombiana.', icono: 'bi-cup-hot' },
                { id: Date.now() + 1, nombre: 'Tecnología', ref: 'CAT-002', descripcion: 'Dispositivos electrónicos, computadores, smartphones y accesorios de última generación.', icono: 'bi-pc-display' },
                { id: Date.now() + 2, nombre: 'Hogar', ref: 'CAT-003', descripcion: 'Muebles, decoración y herramientas para la mejora del espacio doméstico.', icono: 'bi-house' },
                { id: Date.now() + 3, nombre: 'Salud', ref: 'CAT-004', descripcion: 'Medicamentos, suministros médicos y productos de cuidado personal especializado.', icono: 'bi-heart-pulse' }
            ];
            localStorage.setItem('ant_categorias', JSON.stringify(initialCategorias));
        }
    };
    initializeCategoriasData();

    const cantegoriasTableBody = document.getElementById('categorias-table-body');
    const searchInput = document.getElementById('search-categorias');

    if (cantegoriasTableBody) {
        const renderCategorias = (searchTerm = '') => {
            const allCategorias = JSON.parse(localStorage.getItem('ant_categorias')) || [];
            
            // Search filter
            const filteredCategorias = allCategorias.filter(c => 
                c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                c.ref.toLowerCase().includes(searchTerm.toLowerCase())
            );

            cantegoriasTableBody.innerHTML = '';
            
            filteredCategorias.forEach(cat => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors';
                
                tr.innerHTML = `
                    <td>
                        <div class="cat-icon-container">
                            <i class="bi ${cat.icono}"></i>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: 700; font-size: 0.875rem;">${cat.nombre}</div>
                        <div style="font-size: 0.75rem; color: var(--slate-500);">REF: ${cat.ref}</div>
                    </td>
                    <td>
                        <div class="table-desc">${cat.descripcion}</div>
                    </td>
                    <td style="text-align: right;">
                        <button class="action-btn edit-categoria" data-id="${cat.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="action-btn delete delete-categoria" data-id="${cat.id}"><i class="bi bi-trash3"></i></button>
                    </td>
                `;
                cantegoriasTableBody.appendChild(tr);
            });

            // Update bottom stats
            const total = allCategorias.length;
            document.getElementById('total-categorias-stat').textContent = total;
            document.getElementById('table-info').textContent = `Mostrando ${filteredCategorias.length} de ${total} resultados`;
            
            // Just simulating top category
            if (total > 0) {
                document.getElementById('top-categoria-stat').textContent = allCategorias[0].nombre;
            } else {
                document.getElementById('top-categoria-stat').textContent = 'Ninguna';
            }
        };

        renderCategorias();

        // Search logic
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderCategorias(e.target.value);
            });
        }

        // Modal Logic
        const modal = document.getElementById('categoria-modal');
        const categoriaForm = document.getElementById('categoria-form');
        let currentEditName = ''; // keep track for recent activity

        document.getElementById('add-categoria-btn').addEventListener('click', () => {
            categoriaForm.reset();
            document.getElementById('edit-categoria-id').value = '';
            document.getElementById('modal-title').textContent = 'Añadir Categoría';
            document.getElementById('save-btn-text').textContent = 'Guardar Categoría';
            modal.style.display = 'flex';
        });

        document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

        // Delete & Edit logic
        cantegoriasTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-categoria')) {
                const id = parseInt(e.target.closest('.delete-categoria').dataset.id);
                if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                    const categorias = JSON.parse(localStorage.getItem('ant_categorias')).filter(c => c.id !== id);
                    localStorage.setItem('ant_categorias', JSON.stringify(categorias));
                    renderCategorias(searchInput.value);
                }
            }

            if (e.target.closest('.edit-categoria')) {
                const id = parseInt(e.target.closest('.edit-categoria').dataset.id);
                const cat = JSON.parse(localStorage.getItem('ant_categorias')).find(c => c.id === id);
                if (cat) {
                    document.getElementById('edit-categoria-id').value = cat.id;
                    document.getElementById('categoria-nombre').value = cat.nombre;
                    document.getElementById('categoria-ref').value = cat.ref;
                    document.getElementById('categoria-descripcion').value = cat.descripcion;
                    document.getElementById('categoria-icono').value = cat.icono;
                    
                    document.getElementById('modal-title').textContent = 'Editar Categoría';
                    document.getElementById('save-btn-text').textContent = 'Actualizar Categoría';
                    modal.style.display = 'flex';
                }
            }
        });

        // Form Submit
        categoriaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-categoria-id').value;
            let categorias = JSON.parse(localStorage.getItem('ant_categorias'));

            const catData = {
                nombre: document.getElementById('categoria-nombre').value,
                ref: document.getElementById('categoria-ref').value,
                descripcion: document.getElementById('categoria-descripcion').value,
                icono: document.getElementById('categoria-icono').value
            };

            if (id) {
                categorias = categorias.map(c => c.id == id ? { ...c, ...catData } : c);
            } else {
                categorias.push({ ...catData, id: Date.now() });
            }

            // Update recent activity simulation
            document.getElementById('recent-categoria-stat').textContent = catData.nombre;

            localStorage.setItem('ant_categorias', JSON.stringify(categorias));
            modal.style.display = 'none';
            renderCategorias(searchInput.value);
        });
    }
});
