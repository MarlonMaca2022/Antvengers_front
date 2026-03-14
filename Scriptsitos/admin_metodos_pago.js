// admin_metodos_pago.js
document.addEventListener('DOMContentLoaded', () => {
    // --- INITIAL DATA SETUP ---
    const initializeMethodData = () => {
        if (!localStorage.getItem('ant_methods')) {
            const initialMethods = [
                { id: Date.now(), platform: 'Tarjeta de Crédito', type: 'Crédito', status: 'Activo' },
                { id: Date.now() + 1, platform: 'Tarjeta de Débito', type: 'Débito', status: 'Activo' },
                { id: Date.now() + 2, platform: 'Efectivo', type: 'Efectivo', status: 'Activo' },
                { id: Date.now() + 3, platform: 'Sistecredito', type: 'Crédito', status: 'Activo' },
                { id: Date.now() + 4, platform: 'Addi', type: 'Crédito', status: 'Inactivo' }
            ];
            localStorage.setItem('ant_methods', JSON.stringify(initialMethods));
        }
    };
    initializeMethodData();

    const methodsTableBody = document.getElementById('methods-table-body');
    if (methodsTableBody) {
        const renderMethods = () => {
            const methods = JSON.parse(localStorage.getItem('ant_methods')) || [];
            methodsTableBody.innerHTML = '';
            
            methods.forEach(method => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors';
                
                // Determine badge class
                let badgeClass = '';
                if (method.type === 'Crédito') badgeClass = 'badge-credito';
                else if (method.type === 'Débito') badgeClass = 'badge-debito';
                else badgeClass = 'badge-efectivo';

                // Status
                let statusColor = method.status === 'Activo' ? '#10b981' : '#94a3b8';

                tr.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div class="method-icon">
                                <i class="bi bi-bank"></i>
                            </div>
                            <span style="font-weight: 500;">${method.platform}</span>
                        </div>
                    </td>
                    <td><span class="badge ${badgeClass}">${method.type}</span></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.375rem; color: ${statusColor}; font-size: 0.75rem; font-weight: 500;">
                            <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i>
                            ${method.status}
                        </div>
                    </td>
                    <td style="text-align: right;">
                        <button class="action-btn edit-method" data-id="${method.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="action-btn delete delete-method" data-id="${method.id}"><i class="bi bi-trash3"></i></button>
                    </td>
                `;
                methodsTableBody.appendChild(tr);
            });

            // Update stats
            const total = methods.length;
            document.getElementById('total-methods-stat').textContent = total;
            document.getElementById('table-info').textContent = `Mostrando 1 a ${total} de ${total} resultados`;
        };

        renderMethods();

        // Modal Logic
        const modal = document.getElementById('method-modal');
        const methodForm = document.getElementById('method-form');
        document.getElementById('add-method-btn').addEventListener('click', () => {
            methodForm.reset();
            document.getElementById('edit-method-id').value = '';
            document.getElementById('modal-title').textContent = 'Añadir Método';
            document.getElementById('save-btn-text').textContent = 'Guardar Método';
            modal.style.display = 'flex';
        });

        document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

        // Delete Method
        methodsTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-method')) {
                const id = parseInt(e.target.closest('.delete-method').dataset.id);
                if (confirm('¿Estás seguro de eliminar este método de pago?')) {
                    const methods = JSON.parse(localStorage.getItem('ant_methods')).filter(m => m.id !== id);
                    localStorage.setItem('ant_methods', JSON.stringify(methods));
                    renderMethods();
                }
            }

            if (e.target.closest('.edit-method')) {
                const id = parseInt(e.target.closest('.edit-method').dataset.id);
                const method = JSON.parse(localStorage.getItem('ant_methods')).find(m => m.id === id);
                if (method) {
                    document.getElementById('edit-method-id').value = method.id;
                    document.getElementById('method-platform').value = method.platform;
                    
                    const typeSelect = document.getElementById('method-type');
                    typeSelect.value = method.type;
                    
                    document.getElementById('method-status').value = method.status;
                    
                    document.getElementById('modal-title').textContent = 'Editar Método';
                    document.getElementById('save-btn-text').textContent = 'Actualizar Método';
                    modal.style.display = 'flex';
                }
            }
        });

        // Save/Update Method
        methodForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-method-id').value;
            let methods = JSON.parse(localStorage.getItem('ant_methods'));

            const typeSelect = document.getElementById('method-type');
            
            const methodData = {
                platform: document.getElementById('method-platform').value,
                type: typeSelect.value,
                status: document.getElementById('method-status').value
            };

            if (id) {
                methods = methods.map(m => m.id == id ? { ...m, ...methodData } : m);
            } else {
                methods.push({ ...methodData, id: Date.now() });
            }

            localStorage.setItem('ant_methods', JSON.stringify(methods));
            modal.style.display = 'none';
            renderMethods();
        });
    }
});
