const apiUrl = 'https://xano-api-endpoint.com/users';  // Altere para o endpoint real

// Cadastro de usuário
document.getElementById('register-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => response.json())
    .then(data => {
        alert('Usuário cadastrado com sucesso!');
        window.location.href = 'index.html';
    })
    .catch(error => console.error('Erro ao cadastrar usuário:', error));
});



// Login de usuário
document.getElementById('login-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Primeira requisição: login para obter o token
    fetch('https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(authResponse => {
        if (authResponse && authResponse.authToken) {
            // Armazena o token no localStorage
            localStorage.setItem('authToken', authResponse.authToken);

            // Faz a segunda requisição para obter os dados do usuário
            return fetch('https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authResponse.authToken}`
                }
            });
        } else {
            throw new Error('Credenciais inválidas. Tente novamente.');
        }
    })
    .then(response => response.json())
    .then(user => {
        if (user && user.id) {
            // Armazena o ID e outros dados se necessário
            localStorage.setItem('userId', user.id);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userEmail', user.email);

            alert('Login realizado com sucesso!');
            window.location.href = 'kanban.html';
        } else {
            alert('Erro ao obter os dados do usuário.');
        }
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        alert('Erro durante o processo de login. Tente novamente.');
    });
});



