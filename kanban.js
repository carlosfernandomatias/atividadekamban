
document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Você precisa estar logado para acessar o Kanban.');
        window.location.href = 'login.html';
    } else {
        // Carregar a foto do perfil do usuário
        fetch(`https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/user/${userId}`)
            .then(response => response.json())
            .then(user => {
                if (user.Foto_usuario) {
                    const base64Image = user.Foto_usuario.startsWith('data:image/')
                        ? user.Foto_usuario
                        : `data:image/png;base64,${user.Foto_usuario}`;
                    document.getElementById('preview').src = base64Image;
                    document.getElementById('preview').classList.remove('hidden');
                }
                carregarTarefasDoXano(userId);  // Carregar as tarefas após buscar o perfil
                const userName = localStorage.getItem('userName');
                if (userName) {
                    document.getElementById('nickname').value = userName;
                }
            })
            .catch(error => console.error('Erro ao carregar os dados do usuário:', error));
    }
});


// Função para carregar tarefas do Xano
const carregarTarefasDoXano = (userId) => {
    fetch(`https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/user/${userId}`)
        .then(response => response.json())
        .then(user => {
            const tasks = user.Task_Kanban || [];
            tasks.forEach(task => {
                // Verificar e corrigir datas inválidas
                task.startDate = corrigirData(task.startDate);
                task.endDate = corrigirData(task.endDate);
                addTaskToColumn(task.column, task);
            });
        })
        .catch(error => console.error('Erro ao carregar tarefas:', error));
};

// Função para corrigir as datas inválidas
const corrigirData = (data) => {
    if (!data || data.includes('Início') || data.includes('Término')) {
        return '';  // Retorna vazio se a data for inválida
    }
    return data;
};


// Adicionar evento de clique nos botões "Adicionar Tarefa"
document.querySelectorAll('.add-task').forEach(button => {
    button.addEventListener('click', () => {
        const columnId = button.dataset.column;
        openModal(columnId);
    });
});

// Abrir o modal para criar/editar tarefas
const openModal = (columnId, task = null) => {
    document.getElementById('task-modal').classList.remove('hidden');
    const form = document.getElementById('task-form');
    form.dataset.column = columnId;
    form.dataset.taskId = task?.id || '';
    document.getElementById('task-name').value = task?.name || '';
    document.getElementById('task-color').value = task?.color || '#ffffff';
    document.getElementById('task-priority').value = task?.priority || 'Baixa';
    document.getElementById('start-date').value = task?.startDate || '';
    document.getElementById('end-date').value = task?.endDate || '';
};

// Fechar o modal
document.getElementById('cancel-modal').addEventListener('click', () => {
    document.getElementById('task-modal').classList.add('hidden');
});

// Salvar tarefa no modal
document.getElementById('task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.target;
    const columnId = form.dataset.column;
    const taskId = form.dataset.taskId;

    const task = {
        id: taskId || `task-${Date.now()}`,
        name: document.getElementById('task-name').value,
        color: document.getElementById('task-color').value,
        priority: document.getElementById('task-priority').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        column: columnId
    };

    if (taskId) {
        updateTask(task);
    } else {
        addTaskToColumn(columnId, task);
    }
    salvarTarefasNoXano();  // Salva as alterações no Xano
    document.getElementById('task-modal').classList.add('hidden');
});

// Adicionar tarefa à coluna do Kanban
const addTaskToColumn = (columnId, task) => {
    const container = document.getElementById(columnId).querySelector('.task-container');
    const taskElement = createTaskElement(task);
    container.appendChild(taskElement);
};

// Atualizar tarefa
const updateTask = (task) => {
    const taskElement = document.getElementById(task.id);
    taskElement.style.backgroundColor = task.color;
    taskElement.querySelector('h4').innerText = task.name;
    taskElement.querySelector('.priority').innerText = `Prioridade: ${task.priority}`;
};

// Criar elemento de tarefa
const createTaskElement = (task) => {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task');
    taskElement.id = task.id;
    taskElement.draggable = true;
    taskElement.style.backgroundColor = task.color;

    taskElement.innerHTML = `
        <h4>${task.name}</h4>
        <p class="priority">Prioridade: ${task.priority}</p>
        <p>Início: ${task.startDate}</p>
        <p>Término: ${task.endDate}</p>
    `;

    taskElement.addEventListener('click', () => openModal(task.column, task));
    taskElement.addEventListener('dragstart', () => taskElement.classList.add('dragging'));
    taskElement.addEventListener('dragend', () => taskElement.classList.remove('dragging'));

    return taskElement;
};

// Drag and drop
document.querySelectorAll('.task-container').forEach(container => {
    container.addEventListener('dragover', (event) => {
        event.preventDefault();
        container.classList.add('over');
    });

    container.addEventListener('dragleave', () => container.classList.remove('over'));

    container.addEventListener('drop', () => {
        const task = document.querySelector('.dragging');
        container.appendChild(task);
        container.classList.remove('over');
        salvarTarefasNoXano();  // Salva após mover a tarefa
    });
});

// Coletar todas as tarefas atuais

const coletarTarefas = () => {
    const tarefas = [];
    document.querySelectorAll('.kanban-column').forEach(coluna => {
        const columnId = coluna.id;
        coluna.querySelectorAll('.task').forEach(task => {
            tarefas.push({
                id: task.id,
                name: task.querySelector('h4').innerText,
                priority: task.querySelector('.priority').innerText.replace('Prioridade: ', ''),
                startDate: task.querySelector('p:nth-child(3)')?.innerText.replace('Início: ', '') || '',
                endDate: task.querySelector('p:nth-child(4)')?.innerText.replace('Término: ', '') || '',
                color: task.style.backgroundColor,
                column: columnId
            });
        });
    });
    return tarefas;
};

// Salvar todas as tarefas no Xano
const salvarTarefasNoXano = () => {
    const userId = localStorage.getItem('userId');
    const tarefas = coletarTarefas();
    const base64SemPrefixo = localStorage.getItem('Foto_base64');
    const email = localStorage.getItem('userEmail');
    const nome = localStorage.getItem('userName');
    fetch(`https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId ,
            Task_Kanban: tarefas,
            Foto_usuario: base64SemPrefixo,
            email : email,
            name : nome
        })
    })
    .then(response => response.json())
    .then(() => console.log('Tarefas salvas com sucesso!'))
    .catch(error => console.error('Erro ao salvar tarefas:', error));
};

// Salvar imagem no back-end
document.getElementById('profile-pic').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Image = reader.result;

            // Atualizar visualização
            document.getElementById('preview').src = base64Image;
            document.getElementById('preview').classList.remove('hidden');

            // Salvar a imagem no Xano
            salvarImagemUsuario(base64Image);
        };
        reader.readAsDataURL(file);
    }
});

const salvarImagemUsuario = (base64Image) => {
    const userId = localStorage.getItem('userId');
    const tarefas = coletarTarefas();
    const email = localStorage.getItem('userEmail')
    const nome = localStorage.getItem('userName')
    
    if (!userId) {
        console.error('Usuário não autenticado.');
        return;
    }
    const base64SemPrefixo = base64Image.split(',')[1];
    localStorage.setItem('Foto_base64', base64SemPrefixo);
    fetch(`https://x8ki-letl-twmt.n7.xano.io/api:NzSrOVdQ/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
                               userId: userId ,
                               Foto_usuario: base64SemPrefixo,
                               Task_Kanban: tarefas,
                               email : email,
                               name : nome
                              })
    })
    .then(() => console.log('Foto de perfil salva no Xano!'))
    .catch(error => console.error('Erro ao salvar a imagem:', error));
};


