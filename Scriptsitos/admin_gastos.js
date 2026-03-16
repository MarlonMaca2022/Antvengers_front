document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gasto-form');
    const montoInput = document.getElementById('gasto-monto');
    const descInput = document.getElementById('gasto-descripcion');
    const catSelect = document.getElementById('gasto-categoria');
    const comSelect = document.getElementById('gasto-comercio');
    const metSelect = document.getElementById('gasto-metodo');
    const gastosList = document.getElementById('gastos-list');
    const btnCancel = document.getElementById('cancel-gasto');

    let isEditing = false;
    let editId = null;

    // Load selects de LocalStorage
    const loadSelects = () => {
        const categorias = JSON.parse(localStorage.getItem('ant_categorias')) || [];
        const comercios = JSON.parse(localStorage.getItem('ant_comercios')) || [];
        const metodos = JSON.parse(localStorage.getItem('ant_methods')) || [];

        // Categories
        catSelect.innerHTML = '<option value="">Seleccionar Categoría</option>';
        categorias.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.nombre;
            opt.textContent = cat.nombre;
            catSelect.appendChild(opt);
        });

        // Comercios
        comSelect.innerHTML = '<option value="">Seleccionar Comercio</option>';
        comercios.forEach(com => {
            const opt = document.createElement('option');
            opt.value = com.nombre;
            opt.textContent = com.nombre;
            comSelect.appendChild(opt);
        });

        // Metodos de pago - Solo activos prefiere la plataforma como value
        metSelect.innerHTML = '<option value="">Seleccionar Método</option>';
        const activos = metodos.filter(m => m.status === 'Activo');
        activos.forEach(met => {
            const opt = document.createElement('option');
            opt.value = met.platform;
            opt.textContent = met.platform + " (" + met.type + ")";
            metSelect.appendChild(opt);
        });
    };

    loadSelects();

    // Actualizamos al ganar el focus por si admin borra / agrega en otra pestaña
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            // Guardamos valores para volver a setear
            const curCat = catSelect.value;
            const curCom = comSelect.value;
            const curMet = metSelect.value;
            loadSelects();
            if (curCat) catSelect.value = curCat;
            if (curCom) comSelect.value = curCom;
            if (curMet) metSelect.value = curMet;
        }
    });

    const loadGastos = () => {
        let gastos = JSON.parse(localStorage.getItem('ant_gastos')) || [];
        gastosList.innerHTML = '';
        let total = 0;
        const commerceCount = {};

        gastos.sort((a, b) => b.id - a.id).forEach(gasto => {
            total += parseFloat(gasto.monto);
            commerceCount[gasto.comercio] = (commerceCount[gasto.comercio] || 0) + 1;

            const div = document.createElement('div');
            div.className = 'p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-800';

            const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

            div.innerHTML = `
                <div class="overflow-hidden pr-2">
                    <h4 class="font-bold text-sm truncate">${gasto.descripcion}</h4>
                    <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-1 truncate">
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">sell</span> <span class="truncate">${gasto.categoria}</span></span>
                        <span>&bull;</span>
                        <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">storefront</span> <span class="truncate">${gasto.comercio}</span></span>
                    </div>
                </div>
                <div class="text-right flex items-center gap-3 shrink-0">
                    <div>
                        <p class="font-bold text-primary">${formatter.format(gasto.monto)}</p>
                        <p class="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-1">
                            <span class="material-symbols-outlined text-[12px]">credit_card</span>
                            ${gasto.metodo}
                        </p>
                    </div>
                    <button class="delete-btn text-slate-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer" data-id="${gasto.id}" title="Eliminar gasto">
                        <span class="material-symbols-outlined pointer-events-none text-[20px]">delete</span>
                    </button>
                </div>
            `;
            gastosList.appendChild(div);
        });

        if (gastos.length === 0) {
            gastosList.innerHTML = `
                <div class="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                    <p class="text-sm">No hay gastos registrados aún.</p>
                </div>
            `;
        }

        // Stats Footer
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
        document.getElementById('stat-total').textContent = formatter.format(total);

        if (Object.keys(commerceCount).length > 0) {
            const mainCommerce = Object.keys(commerceCount).reduce((a, b) => commerceCount[a] > commerceCount[b] ? a : b);
            document.getElementById('stat-main-commerce').textContent = mainCommerce;
        } else {
            document.getElementById('stat-main-commerce').textContent = 'N/A';
        }
    };

    loadGastos();

    // Guardar nuevo
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let gastos = JSON.parse(localStorage.getItem('ant_gastos')) || [];

        const nuevoGasto = {
            id: Date.now(),
            monto: parseFloat(montoInput.value),
            descripcion: descInput.value,
            categoria: catSelect.value,
            comercio: comSelect.value,
            metodo: metSelect.value,
            fecha: new Date().toISOString()
        };

        gastos.push(nuevoGasto);
        localStorage.setItem('ant_gastos', JSON.stringify(gastos));

        form.reset();
        loadGastos();

        // FeedBack Visual
        const saveBtn = form.querySelector('button[type="submit"]');
        const text = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ¡Guardado!';
        saveBtn.classList.replace('bg-primary', 'bg-green-500');
        saveBtn.classList.replace('shadow-primary/20', 'shadow-green-500/20');
        setTimeout(() => {
            saveBtn.innerHTML = text;
            saveBtn.classList.replace('bg-green-500', 'bg-primary');
            saveBtn.classList.replace('shadow-green-500/20', 'shadow-primary/20');
        }, 2000);
    });

    // Limpiar 
    btnCancel.addEventListener('click', () => {
        form.reset();
    });

    // Eliminar
    gastosList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-btn');
        if (btn) {
            const id = parseInt(btn.dataset.id);
            if (confirm('¿Seguro que deseas eliminar este gasto de tus registros?')) {
                let gastos = JSON.parse(localStorage.getItem('ant_gastos')) || [];
                gastos = gastos.filter(g => g.id !== id);
                localStorage.setItem('ant_gastos', JSON.stringify(gastos));
                loadGastos();
            }
        }
    });

    // Filter local (Search Input)
    const searchInput = document.getElementById('busqueda-gastos');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            const items = gastosList.children;
            if (items.length > 0 && !items[0].querySelector('.opacity-50')) { // Asegurar que no sea el texto "No hay gastos"
                Array.from(items).forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(val)) {
                        item.classList.remove('hidden');
                        item.classList.add('flex');
                    } else {
                        item.classList.add('hidden');
                        item.classList.remove('flex');
                    }
                });
            }
        });
    }

});
