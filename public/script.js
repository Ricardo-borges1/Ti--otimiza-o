// script.js completo com comentários para ajudar na leitura

async function carregarUnidades() {
    try {
        const response = await fetch('/api/unidades');
        const unidades = await response.json();
        const container = document.getElementById('lista-unidades');
        container.innerHTML = '';

        for (const unidade of unidades) {
            const card = document.createElement('div');
            card.className = 'unidade-card';
            card.innerHTML = `
                <h2>${unidade.nome}</h2>
                <p>${unidade.endereco}</p>
                <div class="progresso-container">
                    <div class="barra-externa">
                        <div id="barra-progresso-${unidade.id}" class="barra-interna"></div>
                    </div>
                    <div id="texto-progresso-${unidade.id}" class="texto-progresso">Otimizado: 0% (0 de 0)</div>
                </div>
                <div class="botoes">
                    <button class="btn ver-btn" onclick="irParaUnidade(${unidade.id})">Ver</button>
                    <button class="btn adicionar-btn" onclick="abrirModalFormulario(${unidade.id}, '${unidade.nome}')">Adicionar</button>
                    <button class="btn relatorio-btn" onclick="abrirModalComputadores(${unidade.id}, '${unidade.nome}', true)">Comentário</button>
                </div>
            `;
            container.appendChild(card);
            // Atualiza o progresso para essa unidade ao criar o card
            await atualizarProgresso(unidade.id);
        }
    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
    }
}


function irParaUnidade(unidadeId) {
    // Redireciona para unidade.html com o id na query string
    window.location.href = `unidade.html?id=${unidadeId}`;
}

// Abrir modal com computadores e opções
async function abrirModalComputadores(unidadeId, unidadeNome, abrirComentario = false) {
    try {
        const response = await fetch(`/api/unidades/${unidadeId}/computadores`);
        const computadores = await response.json();

        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `<h2 style="margin-bottom: 16px; color: #004080;">${unidadeNome}</h2>`;

        if (computadores.length === 0) {
            modalBody.innerHTML += '<p>Nenhum computador cadastrado.</p>';
        } else {
            computadores.forEach(comp => {
                const cardClass = comp.retirado ? 'retirado' : (comp.otimizado ? 'otimizado' : 'pendente');
                const statusText = comp.retirado ? 'Retirado' : (comp.otimizado ? 'Otimizado' : 'Pendente');

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
                            <input type="checkbox" onchange="alterarStatusOtimizado(${comp.id}, this.checked, ${unidadeId})" ${comp.otimizado ? 'checked' : ''} ${comp.retirado ? 'disabled' : ''}> Otimizado
                        </label>
                        <button onclick="alterarStatusRetirado(${comp.id}, ${!comp.retirado}, ${unidadeId})" class="btn retirar-btn">${comp.retirado ? 'Reativar' : 'Retirar'}</button>
                        <button onclick="editarComputador(${comp.id}, '${comp.setor}', '${comp.patrimonio}', ${comp.quantidade}, ${unidadeId})" class="btn editar-btn">Editar</button>
                        <button onclick="excluirComputador(${comp.id}, ${unidadeId})" class="btn excluir-btn">Excluir</button>
                        <button onclick="abrirComentario(${comp.id}, \`${comp.comentario || ''}\`, ${unidadeId})" class="btn relatorio-btn">Comentário</button>
                    </div>
                `;
                modalBody.appendChild(div);
            });
        }

        abrirModal();

        // Se solicitado, abrir o comentário do primeiro computador da lista
        if (abrirComentario && computadores.length > 0) {
            abrirComentario(computadores[0].id, computadores[0].comentario || '', unidadeId);
        }
    } catch (error) {
        console.error('Erro ao carregar computadores:', error);
    }
}

// Abrir modal com formulário para adicionar computador
function abrirModalFormulario(unidadeId, unidadeNome) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 16px; color: #004080;">${unidadeNome}</h2>
        <div class="formulario-container">
            <h3>Adicionar Computador</h3>
            <form onsubmit="adicionarComputador(event, ${unidadeId})">
                <input type="text" id="setor-${unidadeId}" placeholder="Setor" required>
                <input type="text" id="patrimonio-${unidadeId}" placeholder="Patrimônio" required>
                <input type="number" id="quantidade-${unidadeId}" placeholder="Quantidade" value="1" min="1" required>
                <button type="submit" class="btn salvar-btn">Salvar</button>
            </form>
        </div>
    `;
    abrirModal();
}

// Funções auxiliares do modal
function abrirModal() {
    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-body').innerHTML = '';
}

document.getElementById('modal-close').addEventListener('click', fecharModal);
window.addEventListener('click', (e) => {
    if (e.target.id === 'modal') fecharModal();
});

// Adicionar computador (alterado para redirecionar para unidade.html após salvar)
async function adicionarComputador(event, unidadeId) {
    event.preventDefault();
    const setor = document.getElementById(`setor-${unidadeId}`).value.trim();
    const patrimonio = document.getElementById(`patrimonio-${unidadeId}`).value.trim();
    const quantidade = parseInt(document.getElementById(`quantidade-${unidadeId}`).value.trim(), 10);

    if (!setor || !patrimonio || quantidade < 1) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    try {
        const response = await fetch('/api/computadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unidade_id: unidadeId, setor, patrimonio, quantidade })
        });

        if (response.ok) {
            window.location.href = `unidade.html?id=${unidadeId}`;
        } else {
            alert('Erro ao adicionar computador.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Editar computador
function editarComputador(compId, setor, patrimonio, quantidade, unidadeId) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h3 style="color: #004080;">Editar Computador</h3>
        <div class="formulario-container">
            <label>Setor: <input type="text" id="input-setor-${compId}" value="${setor}"></label><br>
            <label>Patrimônio: <input type="text" id="input-patrimonio-${compId}" value="${patrimonio}"></label><br>
            <label>Quantidade: <input type="number" id="input-quantidade-${compId}" value="${quantidade}" min="1"></label><br>
            <button onclick="salvarComputador(${compId}, ${unidadeId})" class="btn salvar-btn">Salvar</button>
            <button onclick="abrirModalComputadores(${unidadeId}, '')" class="btn cancelar-btn">Cancelar</button>
        </div>
    `;
}

// Salvar edição (alterado para redirecionar para unidade.html após salvar)
async function salvarComputador(compId, unidadeId) {
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
            window.location.href = `unidade.html?id=${unidadeId}`;
        } else {
            alert('Erro ao salvar.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Excluir computador
async function excluirComputador(compId, unidadeId) {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    try {
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            abrirModalComputadores(unidadeId);
            atualizarProgresso(unidadeId);
        } else {
            alert('Erro ao excluir.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Alterar status otimizado
async function alterarStatusOtimizado(compId, otimizado, unidadeId) {
    try {
        const body = otimizado ? { otimizado: true, retirado: false } : { otimizado: false };
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            await atualizarProgresso(unidadeId);
            abrirModalComputadores(unidadeId);
        } else {
            alert('Erro ao alterar status.');
        }
    } catch (error) {
        console.error(error);
    }
}

// NOVA FUNÇÃO: Alterar status retirado
async function alterarStatusRetirado(compId, retirado, unidadeId) {
    try {
        const body = retirado ? { retirado: true, otimizado: false } : { retirado: false };
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            await atualizarProgresso(unidadeId);
            abrirModalComputadores(unidadeId);
        } else {
            alert('Erro ao alterar status de retirado.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Atualizar barra de progresso para cada unidade
async function atualizarProgresso(unidadeId) {
    try {
        const response = await fetch(`/api/unidades/${unidadeId}/computadores`);
        const computadores = await response.json();

        const computadoresAtivos = computadores.filter(c => !c.retirado);
        
        const total = computadoresAtivos.length;
        const otimizados = computadoresAtivos.filter(c => c.otimizado).length;
        const progresso = total === 0 ? 0 : Math.round((otimizados / total) * 100);

        const barra = document.getElementById(`barra-progresso-${unidadeId}`);
        const texto = document.getElementById(`texto-progresso-${unidadeId}`);

        if (barra && texto) {
            barra.style.width = `${progresso}%`;
            texto.innerText = `Otimizado: ${progresso}% (${otimizados} de ${total})`;
        }
    } catch (error) {
        console.error('Erro ao atualizar barra de progresso:', error);
    }
}

// Exportar CSV (continua igual)
function exportarCSV(unidadeId, nomeUnidade, computadores) {
    const headers = ['Setor', 'Patrimônio', 'Quantidade', 'Otimizado', 'Retirado', 'Comentário'];
    const linhas = [headers.join(',')];

    computadores.forEach(comp => {
        const setor = `"${comp.setor.replace(/"/g, '""')}"`;
        const patrimonio = `"${comp.patrimonio.replace(/"/g, '""')}"`;
        const quantidade = comp.quantidade;
        const otimizado = comp.otimizado ? 'Sim' : 'Não';
        const retirado = comp.retirado ? 'Sim' : 'Não';
        const comentario = `"${(comp.comentario || '').replace(/"/g, '""')}"`;
        linhas.push([setor, patrimonio, quantidade, otimizado, retirado, comentario].join(','));
    });

    const csvContent = '\uFEFF' + linhas.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nomeUnidade}_computadores.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Função para buscar computadores e gerar CSV (não usado mais porque removemos botão Relatório, mas deixei caso queira)
async function gerarRelatorio(unidadeId, nomeUnidade) {
    try {
        const response = await fetch(`/api/unidades/${unidadeId}/computadores`);
        if (!response.ok) throw new Error('Erro ao buscar computadores');

        const computadores = await response.json();
        if (computadores.length === 0) {
            alert('Nenhum computador cadastrado para gerar relatório.');
            return;
        }

        exportarCSV(unidadeId, nomeUnidade, computadores);
    } catch (error) {
        alert('Erro ao gerar relatório.');
        console.error(error);
    }
}

// --- Funções para o modal de comentário ---

function abrirComentario(compId, comentarioAtual, unidadeId) {
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h3 style="color: #004080; margin-bottom: 12px;">Comentário para o computador</h3>
        <textarea id="comentario-textarea" rows="6" style="width: 100%; padding: 10px; font-size: 1rem; border: 2px solid #004080; border-radius: 8px;">${comentarioAtual}</textarea>
        <div style="margin-top: 16px;">
            <button class="btn salvar-btn" onclick="salvarComentario(${compId}, ${unidadeId})">Salvar Comentário</button>
            <button class="btn cancelar-btn" onclick="abrirModalComputadores(${unidadeId}, '', false)">Cancelar</button>
        </div>
    `;
}

async function salvarComentario(compId, unidadeId) {
    const comentario = document.getElementById('comentario-textarea').value.trim();

    try {
        const response = await fetch(`/api/computadores/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comentario })
        });

        if (response.ok) {
            alert('Comentário salvo com sucesso!');
            abrirModalComputadores(unidadeId, '', false);
        } else {
            alert('Erro ao salvar comentário.');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar comentário.');
    }
}

// --- Funções do Dashboard com gráficos ---

let graficoPizza, graficoBarras;

async function carregarDashboard() {
    try {
        const response = await fetch('/api/unidades');
        const unidades = await response.json();

        let totalOtimizados = 0;
        let totalNaoOtimizados = 0;
        const otimizadoPorUnidade = {};

        for (const unidade of unidades) {
            const resComp = await fetch(`/api/unidades/${unidade.id}/computadores`);
            const computadores = await resComp.json();

            const computadoresAtivos = computadores.filter(c => !c.retirado);

            const otimizados = computadoresAtivos.filter(c => c.otimizado).length;
            const naoOtimizados = computadoresAtivos.length - otimizados;

            totalOtimizados += otimizados;
            totalNaoOtimizados += naoOtimizados;

            otimizadoPorUnidade[unidade.nome] = otimizados;
        }

        montarGraficoPizza(totalOtimizados, totalNaoOtimizados);
        montarGraficoBarras(otimizadoPorUnidade);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function montarGraficoPizza(otimizados, naoOtimizados) {
    const ctx = document.getElementById('graficoPizza').getContext('2d');
    if (graficoPizza) graficoPizza.destroy();

    graficoPizza = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Otimizado', 'Não Otimizado'],
            datasets: [{
                data: [otimizados, naoOtimizados],
                backgroundColor: ['#28a745', '#dc3545'],
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Proporção Otimizado / Não Otimizado (Ativos)' }
            }
        }
    });
}

function montarGraficoBarras(dados) {
    const ctx = document.getElementById('graficoBarras').getContext('2d');
    if (graficoBarras) graficoBarras.destroy();

    graficoBarras = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                label: 'Total Otimizações',
                data: Object.values(dados),
                backgroundColor: '#004080'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Total de Otimizações por Unidade (Ativos)' }
            },
            scales: {
                y: { beginAtZero: true, precision: 0 }
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('sidebar-open');
    const closeBtn = document.getElementById('sidebar-close');

    openBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !openBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
});

window.onload = () => {
    carregarUnidades();
    carregarDashboard();
};