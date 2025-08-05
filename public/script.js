async function carregarUnidades() {
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
          <button class="btn ver-btn" onclick="toggleComputadores(${unidade.id})">Ver</button>
          <button class="btn adicionar-btn" onclick="mostrarFormulario(${unidade.id})">Adicionar</button>
        </div>
        <div id="computadores-${unidade.id}" class="computadores-container" style="display: none;"></div>
        <div id="formulario-${unidade.id}" class="formulario-container" style="display: none;">
          <h3>Adicionar Computador</h3>
          <form onsubmit="adicionarComputador(event, ${unidade.id})">
            <input type="text" id="setor-${unidade.id}" placeholder="Setor" required>
            <input type="text" id="patrimonio-${unidade.id}" placeholder="Patrimônio" required>
            <input type="number" id="quantidade-${unidade.id}" placeholder="Quantidade" value="1" min="1" required>
            <button type="submit" class="btn salvar-btn">Salvar</button>
          </form>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar unidades:', error);
  }
}

function toggleComputadores(unidadeId) {
  const container = document.getElementById('lista-unidades');
  const div = document.getElementById(`computadores-${unidadeId}`);

  // Fecha todos os painéis exceto o atual
  const allComputadores = container.querySelectorAll('.computadores-container');
  allComputadores.forEach(c => {
    if (c !== div) c.style.display = 'none';
  });

  // Toggle do painel atual
  const isVisible = div.style.display === 'block';
  div.style.display = isVisible ? 'none' : 'block';

  // Carrega computadores só se abrir
  if (!isVisible) carregarComputadores(unidadeId);

  // Fecha todos os formulários menos o do painel atual
  const allForms = container.querySelectorAll('.formulario-container');
  allForms.forEach(f => {
    if (f.id !== `formulario-${unidadeId}`) f.style.display = 'none';
  });
}



function mostrarFormulario(unidadeId) {
  const form = document.getElementById(`formulario-${unidadeId}`);
  const containerComp = document.getElementById(`computadores-${unidadeId}`);

  // Abre o painel de computadores se estiver fechado
  if (containerComp.style.display !== 'block') {
    containerComp.style.display = 'block';
    carregarComputadores(unidadeId);
  }

  // Toggle formulário
  form.style.display = form.style.display === 'block' ? 'none' : 'block';
}



async function carregarComputadores(unidadeId) {
  try {
    const response = await fetch(`/api/unidades/${unidadeId}/computadores`);
    const computadores = await response.json();

    const container = document.getElementById(`computadores-${unidadeId}`);
    container.innerHTML = '';

    if (computadores.length === 0) {
      container.innerHTML = '<p>Nenhum computador cadastrado.</p>';
      return;
    }

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

      container.appendChild(div);
    });
  } catch (error) {
    console.error('Erro ao carregar computadores:', error);
  }
}

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
      document.getElementById(`formulario-${unidadeId}`).style.display = 'none';
      carregarComputadores(unidadeId);
    } else {
      alert('Erro ao adicionar computador.');
    }
  } catch (error) {
    console.error(error);
  }
}

function editarComputador(compId, setor, patrimonio, quantidade, unidadeId) {
  const container = document.getElementById(`computadores-${unidadeId}`);
  container.innerHTML = `
    <div class="computador-card editar">
      <label>Setor: <input type="text" id="input-setor-${compId}" value="${setor}"></label><br>
      <label>Patrimônio: <input type="text" id="input-patrimonio-${compId}" value="${patrimonio}"></label><br>
      <label>Quantidade: <input type="number" id="input-quantidade-${compId}" value="${quantidade}" min="1"></label><br>
      <button onclick="salvarComputador(${compId}, ${unidadeId})" class="btn salvar-btn">Salvar</button>
      <button onclick="cancelarEdicao(${unidadeId})" class="btn cancelar-btn">Cancelar</button>
    </div>
  `;
}

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
      carregarComputadores(unidadeId);
    } else {
      alert('Erro ao salvar.');
    }
  } catch (error) {
    console.error(error);
  }
}

function cancelarEdicao(unidadeId) {
  carregarComputadores(unidadeId);
}

async function excluirComputador(compId, unidadeId) {
  if (!confirm('Tem certeza que deseja excluir?')) return;

  try {
    const response = await fetch(`/api/computadores/${compId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      carregarComputadores(unidadeId);
    } else {
      alert('Erro ao excluir.');
    }
  } catch (error) {
    console.error(error);
  }
}

async function alterarStatusOtimizado(compId, otimizado, unidadeId) {
  try {
    const response = await fetch(`/api/computadores/${compId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otimizado: otimizado ? 1 : 0 })
    });

    if (response.ok) {
      carregarComputadores(unidadeId);
    } else {
      alert('Erro ao alterar status.');
    }
  } catch (error) {
    console.error(error);
  }
}

window.onload = carregarUnidades;
