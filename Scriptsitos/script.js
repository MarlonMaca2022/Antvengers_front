document.addEventListener('DOMContentLoaded', () => {
    // --- INITIAL DATA SETUP ---
    const initializeData = () => {
        if (!localStorage.getItem('ant_users')) {
            const initialUsers = [
                { id: Date.now(), name: 'Alex Rivera', email: 'alex@antvengers.com', role: 'Admin', status: 'Active' },
                { id: Date.now() + 1, name: 'Sam Smith', email: 'sam@antvengers.com', role: 'Editor', status: 'Active' },
                { id: Date.now() + 2, name: 'Jordan Lee', email: 'jordan@antvengers.com', role: 'Viewer', status: 'Inactive' }
            ];
            localStorage.setItem('ant_users', JSON.stringify(initialUsers));
        }
    };
    initializeData();

    // --- SHARED LOGIC ---

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark');
            const isDark = body.classList.contains('dark');
            if (themeIcon) {
                themeIcon.classList.replace(
                    isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill',
                    isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'
                );
            }
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        if (localStorage.getItem('theme') === 'light') {
            body.classList.remove('dark');
            if (themeIcon) themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
        }
    }

    // Generic Password Toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    });

    // --- PAGE SPECIFIC LOGIC ---

    // 1. LOGIN
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            // Mock Login Logic
            if (email === 'alex@antvengers.com') {
                localStorage.setItem('ant_session', JSON.stringify({ name: 'Alex Rivera', email, role: 'Admin' }));
                handleFormSubmit(loginForm, 'login-btn', '¡Acceso de Administrador!', () => {
                    window.location.href = 'admin_usuarios.html';
                });
            } else {
                localStorage.setItem('ant_session', JSON.stringify({ name: 'Heroe', email, role: 'User' }));
                handleFormSubmit(loginForm, 'login-btn', '¡Bienvenido de nuevo!', () => {
                    alert('Redirigiendo a tu panel de usuario...');
                });
            }
        });
    }

    // 2. REGISTER
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirm = document.getElementById('confirm-password').value;

            if (password !== confirm) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            const newUser = {
                id: Date.now(),
                name: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                role: 'Viewer',
                status: 'Active'
            };

            const users = JSON.parse(localStorage.getItem('ant_users'));
            users.push(newUser);
            localStorage.setItem('ant_users', JSON.stringify(users));

            handleFormSubmit(registerForm, 'register-btn', '¡Cuenta creada con éxito!', () => {
                window.location.href = 'index.html';
            });
        });
    }

    // 3. ADMIN USERS CRUD
    const usersTableBody = document.getElementById('users-table-body');
    if (usersTableBody) {
        const renderUsers = () => {
            const users = JSON.parse(localStorage.getItem('ant_users')) || [];
            usersTableBody.innerHTML = '';
            
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors';
                tr.innerHTML = `
                    <td>
                        <div class="flex items-center gap-3">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random" class="user-avatar" alt="${user.name}">
                            <span class="font-medium">${user.name}</span>
                        </div>
                    </td>
                    <td class="text-slate-500">${user.email}</td>
                    <td><span class="status-chip ${user.role === 'Admin' ? 'status-active' : 'status-inactive'}">${user.role}</span></td>
                    <td><span class="status-chip ${user.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        <i class="bi bi-circle-fill" style="font-size: 0.4rem;"></i> ${user.status}
                    </span></td>
                    <td style="text-align: right;">
                        <button class="action-btn edit-user" data-id="${user.id}"><i class="bi bi-pencil-square"></i></button>
                        <button class="action-btn delete delete-user" data-id="${user.id}"><i class="bi bi-trash3"></i></button>
                    </td>
                `;
                usersTableBody.appendChild(tr);
            });

            // Update stats
            const total = users.length;
            const admins = users.filter(u => u.role === 'Admin').length;
            document.getElementById('total-users-stat').textContent = total;
            document.getElementById('total-admins-stat').textContent = admins;
            document.getElementById('table-info').textContent = `Mostrando ${total} resultados`;
        };

        renderUsers();

        // Modal Logic
        const modal = document.getElementById('user-modal');
        const userForm = document.getElementById('user-form');
        
        document.getElementById('add-user-btn').addEventListener('click', () => {
            userForm.reset();
            document.getElementById('edit-user-id').value = '';
            document.getElementById('modal-title').textContent = 'Añadir Usuario';
            document.getElementById('save-btn-text').textContent = 'Guardar Usuario';
            modal.style.display = 'flex';
        });

        document.getElementById('close-modal').addEventListener('click', () => modal.style.display = 'none');

        // Delete User
        usersTableBody.addEventListener('click', (e) => {
            if (e.target.closest('.delete-user')) {
                const id = parseInt(e.target.closest('.delete-user').dataset.id);
                if (confirm('¿Estás seguro de eliminar este usuario?')) {
                    const users = JSON.parse(localStorage.getItem('ant_users')).filter(u => u.id !== id);
                    localStorage.setItem('ant_users', JSON.stringify(users));
                    renderUsers();
                }
            }

            if (e.target.closest('.edit-user')) {
                const id = parseInt(e.target.closest('.edit-user').dataset.id);
                const user = JSON.parse(localStorage.getItem('ant_users')).find(u => u.id === id);
                if (user) {
                    document.getElementById('edit-user-id').value = user.id;
                    document.getElementById('user-name').value = user.name;
                    document.getElementById('user-email').value = user.email;
                    document.getElementById('user-role').value = user.role;
                    document.getElementById('modal-title').textContent = 'Editar Usuario';
                    document.getElementById('save-btn-text').textContent = 'Actualizar Usuario';
                    modal.style.display = 'flex';
                }
            }
        });

        // Save/Update User
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-user-id').value;
            let users = JSON.parse(localStorage.getItem('ant_users'));

            const userData = {
                name: document.getElementById('user-name').value,
                email: document.getElementById('user-email').value,
                role: document.getElementById('user-role').value,
                status: 'Active'
            };

            if (id) {
                users = users.map(u => u.id == id ? { ...u, ...userData } : u);
            } else {
                users.push({ ...userData, id: Date.now() });
            }

            localStorage.setItem('ant_users', JSON.stringify(users));
            modal.style.display = 'none';
            renderUsers();
        });
    }

    // LOGOUT
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('ant_session');
            window.location.href = 'index.html';
        });
    }

    // Helper Function
    function handleFormSubmit(form, btnId, successMsg, callback) {
        const btn = document.getElementById(btnId);
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
        btn.disabled = true;

        setTimeout(() => {
            alert(successMsg);
            btn.innerHTML = originalContent;
            btn.disabled = false;
            if (callback) callback();
        }, 1200);
    }
});
