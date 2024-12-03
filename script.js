// Adicionar evento de clique nos botões "Adicionar Tarefa"
document.querySelectorAll('.add-task').forEach(button => {
    button.addEventListener('click', (event) => {
        const columnId = button.dataset.column; // Identifica a coluna onde será adicionada a tarefa
        openModal(columnId);
    });
});
// Função para abrir o modal
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

// Fechar modal
document.getElementById('cancel-modal').addEventListener('click', () => {
    document.getElementById('task-modal').classList.add('hidden');
});

// Salvar tarefa
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
    };

    if (taskId) {
        updateTask(task);
    } else {
        addTaskToColumn(columnId, task);
    }
    document.getElementById('task-modal').classList.add('hidden');
});

// Adicionar tarefa à coluna
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

    taskElement.addEventListener('click', () => openModal(null, task));
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

    container.addEventListener('drop', (event) => {
        const task = document.querySelector('.dragging');
        container.appendChild(task);
        container.classList.remove('over');
    });
});

// Exibir foto de perfil
document.getElementById('profile-pic').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            // Obtém a imagem em Base64
            const base64Image = reader.result;
            
            // Exibe a imagem convertida no preview
            const preview = document.getElementById('preview');
            preview.src = base64Image;
            preview.classList.remove('hidden');

            // Se quiser fazer algo com a imagem em Base64, como armazená-la em uma variável
            console.log(base64Image); // Aqui você pode armazenar ou usar a imagem Base64
        };
        reader.readAsDataURL(file); // Converte a imagem para Base64
    }
});


// Função para formatar datas no formato dd/mm/aaaa
const formatarData = (data) => {
    const date = new Date(data);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Função para calcular o tempo restante
const calcularTempoRestante = (endDate) => {
    const agora = new Date();
    const fim = new Date(endDate);
    const restante = fim - agora;

    if (restante < 0) {
        return { texto: 'Atrasada', atrasada: true };
    }

    const dias = Math.floor(restante / (1000 * 60 * 60 * 24));
    const horas = Math.floor((restante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));

    return { texto: `${dias}d ${horas}h ${minutos}m restantes`, atrasada: false };
};

// Função para renderizar um cartão de tarefa
const renderizarTarefa = (tarefa, coluna) => {
    const tempoRestante = calcularTempoRestante(tarefa.endDate);

    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.style.backgroundColor = tempoRestante.atrasada ? 'red' : tarefa.color;

    taskElement.innerHTML = `
        <h3>${tarefa.name}</h3>
        <p>Prioridade: ${tarefa.priority}</p>
        <p>Prazo: ${formatarData(tarefa.endDate)}</p>
        <p>Tempo restante: ${tempoRestante.texto}</p>
        <button class="edit-task">Editar</button>
    `;

    taskElement.querySelector('.edit-task').addEventListener('click', () => {
        openModal(coluna, tarefa);
    });

    document.getElementById(coluna).appendChild(taskElement);
};

const baixarComoPDF = () => {
    const quadro = document.getElementById('kanban-board'); // Elemento do quadro
    const opt = {
        margin: 1, // Margens no PDF
        filename: 'kanban.pdf', // Nome do arquivo
        image: { type: 'jpeg', quality: 0.98 }, // Qualidade da imagem
        html2canvas: { scale: 2, useCORS: true }, // Configurações do canvas
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } // Configurações do PDF
    };

    // Gerar e salvar o PDF
    html2pdf()
        .set(opt)
        .from(quadro)
        .save()
        .catch((err) => console.error('Erro ao gerar PDF:', err));
};

// Associando o botão de download ao evento
document.getElementById('download-pdf').addEventListener('click', baixarComoPDF);

