// admin_comercios.js
document.addEventListener('DOMContentLoaded', () => {
    // --- INITIAL DATA SETUP ---
    const initializeComerciosData = () => {
        if (!localStorage.getItem('ant_comercios')) {
            const initialComercios = [
                { id: Date.now(), nombre: 'Tienda Ara', nit: '800.234.112-5', ubicacion: 'Bogotá, D.C.', categoria: 'Supermercado' },
                { id: Date.now() + 1, nombre: 'D1', nit: '900.556.788-2', ubicacion: 'Medellín, ANT', categoria: 'Descuento' },
                { id: Date.now() + 2, nombre: 'Farmatodo', nit: '830.111.455-9', ubicacion: 'Cali, VAL', categoria: 'Salud' },
                { id: Date.now() + 3, nombre: 'Homecenter', nit: '860.003.190-2', ubicacion: 'Barranquilla, ATL', categoria: 'Hogar' }
            ];
            localStorage.setItem('ant_comercios', JSON.stringify(initialComercios));
        }
    };
    initializeComerciosData();

    const comerciosTableBody = document.getElementById('comercios-table-body');
    const filterButtons = document.querySelectorAll('.filtro-btn');
    let currentFilter = 'Todos';

    if (comerciosTableBody) {
        const getCategoryStyles = (category) => {
            switch(category) {
                case 'Supermercado': return { icon: 'bi-cart', badge: 'cat-supermercado', bg: 'icon-supermercado' };
                case 'Descuento': return { icon: 'bi-tag', badge: 'cat-descuento', bg: 'icon-descuento' };
                case 'Salud': return { icon: 'bi-heart-pulse', badge: 'cat-salud', bg: 'icon-salud' };
                case 'Hogar': return { icon: 'bi-house-heart', badge: 'cat-hogar', bg: 'icon-hogar' };
                default: return { icon: 'bi-shop', badge: 'cat-otro', bg: 'icon-otro' };
            }
        };

        const renderComercios = () => {
            const allComercios = JSON.parse(localStorage.getItem('ant_comercios')) || [];
            
            // Filter logic
            let filteredComercios = allComercios;
            if (currentFilter !== 'Todos') {
                filteredComercios = allComercios.filter(c => c.ubicacion.includes(currentFilter));
            }

            comerciosTableBody.innerHTML = '';
            
            filteredComercios.forEach(comercio => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors';
                
                const styles = getCategoryStyles(comercio.categoria);

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="comercio-icon ${styles.bg}">
                                <i class="bi ${styles.icon}" style="font-size: 1.25rem;"></i>
                            </div>
                            <div>
                                <p style="font-weight: 700; font-size: 0.875rem;">${comercio.nombre}</p>
                                <p style="font-size: 0.75rem; color: var(--slate-400);">NIT: ${comercio.nit}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--slate-500);">
                            <i class="bi bi-geo-alt"></i>
                            <span>${comercio.ubicacion}</span>
                        </div>
                    </td>
                    <td>
                        <span class="category-badge ${styles.badge}">${comercio.categoria}</span>
                    </td>
                    <td style="text-align: right;">
                        <button class="action-btn edit-comercio" data-id="${comercio.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="action-btn delete delete-comercio" data-id="${comercio.id}"><i class="bi bi-trash3"></i></button>
                    </td>
                `;
                comerciosTableBody.appendChild(tr);
            });

            // Update stats
            const total = allComercios.length;
            document.getElementById('total-comercios-stat').textContent = total;
            document.getElementById('table-info').textContent = `Mostrando ${filteredComercios.length} de ${total} resultados`;
            
            // Calculate unique cities
            const cities = new Set(allComercios.map(c => c.ubicacion));
            document.getElementById('ciudades-stat').textContent = cities.size;
        };

        renderComercios();

        // Filters UI
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter || btn.textContent.trim();
                renderComercios();
            });
        });

        // Modal Logic
        const modal = document.getElementById('comercio-modal');
        const comercioForm = document.getElementById('comercio-form');
        
        document.getElementById('add-comercio-btn').addEventListener('click', () => {
            comercioForm.reset();
            document.getElementById('edit-comercio-id').value = '';
            document.getElementById('modal-title').textContent = 'Añadir Comercio';
            document.getElementById('save-btn-text').textContent = 'Guardar Comercio';
            modal.style.display = 'flex';
        });

        document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

        // Delete & Edit
        comerciosTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-comercio')) {
                const id = parseInt(e.target.closest('.delete-comercio').dataset.id);
                if (confirm('¿Estás seguro de eliminar este comercio?')) {
                    const comercios = JSON.parse(localStorage.getItem('ant_comercios')).filter(c => c.id !== id);
                    localStorage.setItem('ant_comercios', JSON.stringify(comercios));
                    renderComercios();
                }
            }

            if (e.target.closest('.edit-comercio')) {
                const id = parseInt(e.target.closest('.edit-comercio').dataset.id);
                const comercio = JSON.parse(localStorage.getItem('ant_comercios')).find(c => c.id === id);
                if (comercio) {
                    document.getElementById('edit-comercio-id').value = comercio.id;
                    document.getElementById('comercio-nombre').value = comercio.nombre;
                    document.getElementById('comercio-nit').value = comercio.nit;
                    document.getElementById('comercio-ubicacion').value = comercio.ubicacion;
                    document.getElementById('comercio-categoria').value = comercio.categoria;
                    
                    document.getElementById('modal-title').textContent = 'Editar Comercio';
                    document.getElementById('save-btn-text').textContent = 'Actualizar Comercio';
                    modal.style.display = 'flex';
                }
            }
        });

        // Save/Update
        comercioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-comercio-id').value;
            let comercios = JSON.parse(localStorage.getItem('ant_comercios'));

            const comercioData = {
                nombre: document.getElementById('comercio-nombre').value,
                nit: document.getElementById('comercio-nit').value,
                ubicacion: document.getElementById('comercio-ubicacion').value,
                categoria: document.getElementById('comercio-categoria').value
            };

            if (id) {
                comercios = comercios.map(c => c.id == id ? { ...c, ...comercioData } : c);
            } else {
                comercios.push({ ...comercioData, id: Date.now() });
            }

            localStorage.setItem('ant_comercios', JSON.stringify(comercios));
            modal.style.display = 'none';
            renderComercios();
        });
    }
});
