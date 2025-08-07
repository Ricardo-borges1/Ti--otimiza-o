// unidade.js - CÓDIGO COMPLETO COM FILTROS E NOVO BOTÃO DE ADICIONAR

const urlParams = new URLSearchParams(window.location.search);
const unidadeId = urlParams.get('id');

if (!unidadeId) {
    alert('Unidade inválida.');
    window.location.href = 'index.html';
}

let todosOsComputadores = [];

async function carregarComputadores() {
    try {
        const resUnidade = await fetch(`/api/unidades`);
        const unidades = await resUnidade.json();
        const unidade = unidades.find(u => u.id == unidadeId);

        if (!unidade) {
            alert('Unidade não encontrada.');
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('nome-unidade').innerText = unidade.nome;

        const res = await fetch(`/api/unidades/${unidadeId}/computadores`);
        todosOsComputadores = await res.json();
        
        renderizarComputadores(todosOsComputadores);
        criarGraficoUnidade(todosOsComputadores);

        const filtroStatus = document.getElementById('filtroStatus');
        const filtroSetor = document.getElementById('filtroSetor');
        const filtroPatrimonio = document.getElementById('filtroPatrimonio');

        if (filtroStatus) filtroStatus.addEventListener('change', filtrarComputadores);
        if (filtroSetor) filtroSetor.addEventListener('keyup', filtrarComputadores);
        if (filtroPatrimonio) filtroPatrimonio.addEventListener('keyup', filtrarComputadores);

    } catch (error) {
        console.error('Erro ao carregar computadores:', error);
    }
}

function renderizarComputadores(computadores) {
    const container = document.getElementById('lista-computadores');
    container.innerHTML = '';

    if (computadores.length === 0) {
        container.innerHTML = '<p>Nenhum computador encontrado com os filtros aplicados.</p>';
    } else {
        computadores.forEach(comp => {
            let cardClass = '';
            let statusText = '';

            if (comp.otimizado) {
                cardClass = 'otimizado';
                statusText = 'Otimizado';
            } else if (comp.retirado) {
                cardClass = 'retirado';
                statusText = 'Retirado';
            } else {
                cardClass = 'pendente';
                statusText = 'Pendente';
            }

            const div = document.createElement('div');
            div.className = `computador-card ${cardClass}`;
            div.innerHTML = `
                <div class="info">
                    <strong>Setor:</strong> ${comp.setor}<br>
                    <strong>Patrimônio:</strong> ${comp.patrimonio}<br>
                    <strong>Quantidade:</strong> ${comp.quantidade}<br>
                    <span class="status">${statusText}</span>
                </div>
                <div class="actions">
                    <label>
                        <input type="checkbox" onchange="alterarStatusOtimizado(${comp.id}, this.checked)" ${comp.otimizado ? 'checked' : ''} ${comp.retirado ? 'disabled' : ''}> Otimizado
                    </label>
                    <label>
                        <input type="checkbox" onchange="alterarStatusRetirado(${comp.id}, this.checked)" ${comp.retirado ? 'checked' : ''} ${comp.otimizado ? 'disabled' : ''}> Retirado
                    </label>
                    <button onclick="editarComputador(${comp.id}, '${comp.setor}', '${comp.patrimonio}', ${comp.quantidade})" class="btn editar-btn">Editar</button>
                    <button onclick="excluirComputador(${comp.id})" class="btn excluir-btn">Excluir</button>
                    <button onclick="abrirComentario(${comp.id}, \`${comp.comentario || ''}\`)" class="btn relatorio-btn">Comentário</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

function filtrarComputadores() {
    const statusFiltro = document.getElementById('filtroStatus').value;
    const setorFiltro = document.getElementById('filtroSetor').value.toLowerCase();
    const patrimonioFiltro = document.getElementById('filtroPatrimonio').value.toLowerCase();

    const computadoresFiltrados = todosOsComputadores.filter(comp => {
        let statusMatch = true;
        if (statusFiltro !== 'todos') {
            if (statusFiltro === 'otimizado') {
                statusMatch = comp.otimizado && !comp.retirado;
            } else if (statusFiltro === 'pendente') {
                statusMatch = !comp.otimizado && !comp.retirado;
            } else if (statusFiltro === 'retirado') {
                statusMatch = comp.retirado;
            }
        }
        
        const setorMatch = comp.setor.toLowerCase().includes(setorFiltro);
        const patrimonioMatch = comp.patrimonio.toLowerCase().includes(patrimonioFiltro);

        return statusMatch && setorMatch && patrimonioMatch;
    });

    renderizarComputadores(computadoresFiltrados);
    criarGraficoUnidade(computadoresFiltrados);
}

// NOVO: Função para abrir o formulário de adição com o botão de retornar
function abrirFormularioAdicionar() {
    const container = document.getElementById('lista-computadores');
    
    // Limpa a tela para mostrar apenas o formulário
    container.innerHTML = `
        <h3 style="color: #004080;">Adicionar Novo Computador</h3>
        <div class="formulario-container">
            <label>Setor: <input type="text" id="novo-setor" placeholder="Nome do Setor" required></label><br>
            <label>Patrimônio: <input type="text" id="novo-patrimonio" placeholder="Número de Patrimônio" required></label><br>
            <label>Quantidade: <input type="number" id="nova-quantidade" value="1" min="1" required></label><br>
            <button onclick="salvarNovoComputador()" class="btn salvar-btn">Salvar</button>
            <button onclick="carregarComputadores()" class="btn cancelar-btn">Retornar</button>
        </div>
    `;
}

// NOVO: Função para salvar o novo computador
async function salvarNovoComputador() {
    const setor = document.getElementById('novo-setor').value.trim();
    const patrimonio = document.getElementById('novo-patrimonio').value.trim();
    const quantidade = parseInt(document.getElementById('nova-quantidade').value.trim(), 10);

    if (!setor || !patrimonio || quantidade < 1) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    try {
        const response = await fetch('/api/computadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unidade_id: unidadeId, setor, patrimonio, quantidade })
        });

        if (response.ok) {
            alert('Computador adicionado com sucesso!');
            carregarComputadores(); // Recarrega a lista para mostrar o novo item
        } else {
            alert('Erro ao adicionar computador.');
        }
    } catch (error) {
        console.error(error);
    }
}

// --- Funções CRUD e de Gráfico (mantidas intactas) ---

async function alterarStatusOtimizado(compId, otimizado) {
    try {
        const body = otimizado ? { otimizado: 1, retirado: 0 } : { otimizado: 0 };
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const compIndex = todosOsComputadores.findIndex(c => c.id === compId);
            if (compIndex !== -1) {
                todosOsComputadores[compIndex] = { ...todosOsComputadores[compIndex], ...body };
            }
            filtrarComputadores();
        } else {
            const errorText = await response.text();
            alert(`Erro ao alterar status de otimizado: ${errorText}`);
        }
    } catch (error) {
        console.error(error);
    }
}

async function alterarStatusRetirado(compId, retirado) {
    try {
        const body = retirado ? { retirado: 1, otimizado: 0 } : { retirado: 0 };
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const compIndex = todosOsComputadores.findIndex(c => c.id === compId);
            if (compIndex !== -1) {
                todosOsComputadores[compIndex] = { ...todosOsComputadores[compIndex], ...body };
            }
            filtrarComputadores();
        } else {
            const errorText = await response.text();
            alert(`Erro ao alterar status de retirado: ${errorText}`);
        }
    } catch (error) {
        console.error(error);
    }
}

function criarGraficoUnidade(computadores) {
    const otimizados = computadores.filter(c => c.otimizado && !c.retirado).length;
    const retirados = computadores.filter(c => c.retirado).length;
    const pendentes = computadores.filter(c => !c.otimizado && !c.retirado).length;
    
    const ctx = document.getElementById('unidade-chart').getContext('2d');
    
    if (window.unidadeChart) {
        window.unidadeChart.destroy();
    }

    window.unidadeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Otimizados', 'Retirados', 'Pendentes'],
            datasets: [{
                data: [otimizados, retirados, pendentes],
                backgroundColor: ['#28a745', '#007bff', '#ff0707a2'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: 'Status dos Computadores',
                    font: { size: 18, weight: 'bold' }
                }
            }
        }
    });
}

async function excluirComputador(compId) {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
        const response = await fetch(`/api/computadores/${compId}`, { method: 'DELETE' });
        if (response.ok) {
            carregarComputadores();
        } else {
            alert('Erro ao excluir.');
        }
    } catch (error) {
        console.error(error);
    }
}

function editarComputador(compId, setor, patrimonio, quantidade) {
    const container = document.getElementById('lista-computadores');
    container.innerHTML = `
        <h3 style="color: #004080;">Editar Computador</h3>
        <div class="formulario-container">
            <label>Setor: <input type="text" id="input-setor-${compId}" value="${setor}"></label><br>
            <label>Patrimônio: <input type="text" id="input-patrimonio-${compId}" value="${patrimonio}"></label><br>
            <label>Quantidade: <input type="number" id="input-quantidade-${compId}" value="${quantidade}" min="1"></label><br>
            <button onclick="salvarComputador(${compId})" class="btn salvar-btn">Salvar</button>
            <button onclick="carregarComputadores()" class="btn cancelar-btn">Cancelar</button>
        </div>
    `;
}

async function salvarComputador(compId) {
    const setor = document.getElementById(`input-setor-${compId}`).value.trim();
    const patrimonio = document.getElementById(`input-patrimonio-${compId}`).value.trim();
    const quantidade = parseInt(document.getElementById(`input-quantidade-${compId}`).value.trim(), 10);

    if (!setor || !patrimonio || quantidade < 1) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    try {
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ setor, patrimonio, quantidade })
        });
        if (response.ok) {
            carregarComputadores();
        } else {
            alert('Erro ao salvar.');
        }
    } catch (error) {
        console.error(error);
    }
}

function abrirComentario(compId, comentarioAtual) {
    const container = document.getElementById('lista-computadores');
    container.innerHTML = `
        <h3 style="color: #004080; margin-bottom: 12px;">Comentário para o computador ID ${compId}</h3>
        <textarea id="comentario-textarea" rows="6" style="width: 100%; padding: 10px; font-size: 1rem; border: 2px solid #004080; border-radius: 8px;">${comentarioAtual}</textarea>
        <div style="margin-top: 16px;">
            <button class="btn salvar-btn" onclick="salvarComentario(${compId})">Salvar Comentário</button>
            <button class="btn cancelar-btn" onclick="carregarComputadores()">Cancelar</button>
        </div>
    `;
}

async function salvarComentario(compId) {
    const comentario = document.getElementById('comentario-textarea').value.trim();

    try {
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comentario })
        });
        if (response.ok) {
            alert('Comentário salvo com sucesso!');
            carregarComputadores();
        } else {
            alert('Erro ao salvar comentário.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar comentário.');
    }
}

function voltar() {
    window.location.href = 'index.html';
}

carregarComputadores();