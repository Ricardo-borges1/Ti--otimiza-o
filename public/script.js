async function carregarUnidades() {
    let todasUnidades = [];
  try {
    const response = await fetch('/api/unidades');
    const unidades = await response.json();
    const container = document.getElementById('lista-unidades');
    container.innerHTML = '';

    unidades.forEach(unidade => {
      const card = document.createElement('div');
      card.className = 'unidade-card';
      card.innerHTML = `
        <h2>${unidade.nome}</h2>
        <p>${unidade.endereco}</p>
        <div class="botoes">
          <button class="btn ver-btn" onclick="abrirModalComputadores(${unidade.id}, '${unidade.nome}')">Ver</button>
          <button class="btn adicionar-btn" onclick="abrirModalFormulario(${unidade.id}, '${unidade.nome}')">Adicionar</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar unidades:', error);
  }
}

// Abrir modal com computadores
async function abrirModalComputadores(unidadeId, unidadeNome) {
  try {
    const response = await fetch(`/api/unidades/${unidadeId}/computadores`);
    const computadores = await response.json();

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `<h2 style="margin-bottom: 16px; color: #004080;">${unidadeNome}</h2>`;

    if (computadores.length === 0) {
      modalBody.innerHTML += '<p>Nenhum computador cadastrado.</p>';
    } else {
      computadores.forEach(comp => {
        const div = document.createElement('div');
        div.className = `computador-card ${comp.otimizado ? 'otimizado' : 'pendente'}`;
        div.innerHTML = `
          <div class="info">
            <strong>Setor:</strong> ${comp.setor}<br>
            <strong>Patrimônio:</strong> ${comp.patrimonio}<br>
            <strong>Quantidade:</strong> ${comp.quantidade}<br>
            <span class="status">${comp.otimizado ? 'Otimizado' : 'Pendente'}</span>
          </div>
          <div class="actions">
            <label>
              <input type="checkbox" onchange="alterarStatusOtimizado(${comp.id}, this.checked, ${unidadeId})" ${comp.otimizado ? 'checked' : ''}> Otimizado
            </label>
            <button onclick="editarComputador(${comp.id}, '${comp.setor}', '${comp.patrimonio}', ${comp.quantidade}, ${unidadeId})" class="btn editar-btn">Editar</button>
            <button onclick="excluirComputador(${comp.id}, ${unidadeId})" class="btn excluir-btn">Excluir</button>
          </div>
        `;
        modalBody.appendChild(div);
      });
    }

    abrirModal();
  } catch (error) {
    console.error('Erro ao carregar computadores:', error);
  }
}

// Abrir modal com formulário
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

// Adicionar computador
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
      abrirModalComputadores(unidadeId);
    } else {
      alert('Erro ao adicionar computador.');
    }
  } catch (error) {
    console.error(error);
  }
}

// Editar
function editarComputador(compId, setor, patrimonio, quantidade, unidadeId) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h3 style="color: #004080;">Editar Computador</h3>
    <div class="formulario-container">
      <label>Setor: <input type="text" id="input-setor-${compId}" value="${setor}"></label><br>
      <label>Patrimônio: <input type="text" id="input-patrimonio-${compId}" value="${patrimonio}"></label><br>
      <label>Quantidade: <input type="number" id="input-quantidade-${compId}" value="${quantidade}" min="1"></label><br>
      <button onclick="salvarComputador(${compId}, ${unidadeId})" class="btn salvar-btn">Salvar</button>
      <button onclick="abrirModalComputadores(${unidadeId})" class="btn cancelar-btn">Cancelar</button>
    </div>
  `;
}

// Salvar edição
async function salvarComputador(compId, unidadeId) {
  const setor = document.getElementById(`input-setor-${compId}`).value;
  const patrimonio = document.getElementById(`input-patrimonio-${compId}`).value;
  const quantidade = parseInt(document.getElementById(`input-quantidade-${compId}`).value, 10);

  try {
    const response = await fetch(`/api/computadores/${compId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setor, patrimonio, quantidade })
    });

    if (response.ok) {
      abrirModalComputadores(unidadeId);
    } else {
      alert('Erro ao salvar.');
    }
  } catch (error) {
    console.error(error);
  }
}

// Excluir
async function excluirComputador(compId, unidadeId) {
  if (!confirm('Tem certeza que deseja excluir?')) return;

  try {
    const response = await fetch(`/api/computadores/${compId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      abrirModalComputadores(unidadeId);
    } else {
      alert('Erro ao excluir.');
    }
  } catch (error) {
    console.error(error);
  }
}

// Alterar status
async function alterarStatusOtimizado(compId, otimizado, unidadeId) {
  try {
    const response = await fetch(`/api/computadores/${compId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otimizado: otimizado ? 1 : 0 })
    });

    if (response.ok) {
      abrirModalComputadores(unidadeId);
    } else {
      alert('Erro ao alterar status.');
    }
  } catch (error) {
    console.error(error);
  }
}

window.onload = carregarUnidades;
