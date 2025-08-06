// Pega o id da unidade da URL, ex: unidade.html?id=3
function getIdUnidade() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const idUnidade = getIdUnidade();

if (!idUnidade) {
  alert('ID da unidade não fornecido na URL!');
} else {
  carregarUnidade(idUnidade);
  carregarComputadores(idUnidade);
}

function carregarUnidade(id) {
  fetch(`http://localhost:8080/v1/unidades/${id}`) // Ajuste a URL da sua API para pegar a unidade
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar unidade');
      return response.json();
    })
    .then(unidade => {
      document.getElementById('nome-unidade').textContent = unidade.nome;
      document.getElementById('endereco-unidade').textContent = unidade.endereco;
      if (unidade.foto_url) {
        document.getElementById('foto-unidade').src = unidade.foto_url;
        document.getElementById('foto-unidade').alt = `Foto da unidade ${unidade.nome}`;
      } else {
        document.getElementById('foto-unidade').style.display = 'none';
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar dados da unidade.');
    });
}

function carregarComputadores(idUnidade) {
  fetch(`http://localhost:8080/v1/computadores?unidade_id=${idUnidade}`) // Ajuste conforme seu endpoint
    .then(response => {
      if (!response.ok) throw new Error('Erro ao carregar computadores');
      return response.json();
    })
    .then(computadores => {
      const container = document.getElementById('lista-computadores');
      container.innerHTML = '';

      if (computadores.length === 0) {
        container.innerHTML = '<p>Nenhum computador encontrado para esta unidade.</p>';
        return;
      }

      computadores.forEach(comp => {
        const div = document.createElement('div');
        div.classList.add('computador');

        div.innerHTML = `
          <h3>${comp.nome || 'Computador sem nome'}</h3>
          <label>Comentário:</label>
          <textarea class="comentario-textarea" id="comentario-${comp.id}">${comp.comentario || ''}</textarea>
          <br />
          <button class="btn-salvar" onclick="salvarComentario(${comp.id})">Salvar Comentário</button>
        `;

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar computadores da unidade.');
    });
}

function salvarComentario(idComputador) {
  const texto = document.getElementById(`comentario-${idComputador}`).value;

  fetch(`http://localhost:8080/v1/computadores/${idComputador}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comentario: texto })
  })
    .then(response => {
      if (!response.ok) throw new Error('Erro ao salvar comentário');
      alert('Comentário salvo com sucesso!');
    })
    .catch(err => {
      console.error(err);
      alert('Falha ao salvar comentário.');
    });
}
