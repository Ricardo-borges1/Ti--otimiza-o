const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/db.sqlite');

const unidades = [
  // Secretaria de Saúde
  { nome: "Secretaria de Saúde", endereco: "R. Antonio Roberto, 53 - Jd. das Belezas" },

  // Atenção Básica
  { nome: "UBS Adauto Ribeiro", endereco: "Estr. da Gabiroba, 519 - Jardim Copiuva" },
  { nome: "UBS Ana Estela", endereco: "R. Monte Aprazível, 50 - Jardim Ana Estela" },
  { nome: "UBS Ariston", endereco: "R. Dumont, 26 - Cidade Ariston Estela Azevedo" },
  { nome: "UBS Central", endereco: "Av. Consolação, 505 - Vila Gustavo Correia" },
  { nome: "UBS Cohab II", endereco: "Av. do Bosque, 400 - Cohab II" },
  { nome: "UBS Cohab V", endereco: "Av. Pres. Tancredo de Almeida Neves, 860 A - Cohab V" },
  { nome: "UBS Florispina de Carvalho", endereco: "R. Bandeirantes, 24 - Vila Dirce" },
  { nome: "USF Jandáia", endereco: "Estr. do Gopiúva, 1942 - Vila da Oportunidade" },
  { nome: "USF Natercio Silva Arruda", endereco: "R. Bom Pastor, 106 - Jardim Bom Pastor" },
  { nome: "UBS Novo Horizonte", endereco: "R. Áquila, 21 - Novo Horizonte" },
  { nome: "UBS Parque Florida", endereco: "Estr. Egílio Vitorello, 1850 - Parque Flórida" },
  { nome: "UBS Vila Cretti", endereco: "R. José Fernandes Teixeira Zuza, 510 - Vila Cretti" },
  { nome: "UBS Vila Menck", endereco: "Estr. das Acácias, 202 - Parque Roseira" },
  { nome: "UBS Vila Helena", endereco: "Av. Ver. José Fernandes Filho, 788 - Vila Helena" },

  // Urgência e Emergência
  { nome: "PA Cohab II", endereco: "Av. do Bosque, 410 - Cohab II" },
  { nome: "PA Vila Dirce (CEJAM)", endereco: "R. Ernestina Vieira, 70" },
  { nome: "PSI", endereco: "Av. General Teixeira Lott, 601 - Vila Cretti" },
  { nome: "SAMU", endereco: "Av. General Teixeira Lott, 501 - Vila Cretti" },
  { nome: "SAD", endereco: "Av. do Bosque, 410 - Cohab II" },

  // Saúde Mental
  { nome: "CAPS AD", endereco: "R. Ernestina Vieira, 70" },
  { nome: "CAPS III", endereco: "Av. do Bosque, 410 - Cohab II" },
  { nome: "CAPS Infantil", endereco: "Av. Marginal do Ribeirão, altura 3417" },
  { nome: "Casa do Adolescente", endereco: "R. José Fernandes Teixeira Zuza, 510 - Vila Cretti" },
  { nome: "Residência Terapêutica I", endereco: "Av. Sandra Maria, 423 - Jardim das Belezas" },
  { nome: "Residência Terapêutica II", endereco: "Rua Angela Perioto Tolaini, 662 - Jardim das Belezas" },
  { nome: "Projeto Acolhe", endereco: "Av. General Teixeira Lott, 601 - Vila Cretti" },

  // Especializada
  { nome: "Policlínica", endereco: "R. Zacarias de Medeiros S/N - Pq. Santa Tereza" },
  { nome: "Centro de Fisioterapia", endereco: "Av. Consolação, 505 - Vila Gustavo Correia" },
  { nome: "CEO Cohab V", endereco: "Av. Pres. Tancredo de Almeida Neves, 860 - Cohab V" },
  { nome: "CEO Ariston", endereco: "R. V. 18 - Ariston" },
  { nome: "Farmácia Especializada", endereco: "Estrada Ernestina Vieira, 149 - Vila Silviana" },

  // Vigilâncias em Saúde
  { nome: "Vigilância Sanitária", endereco: "R. Antonio Roberto, 53 - Jd. das Belezas" },
  { nome: "Vigilância Epidemiológica", endereco: "Av. General Teixeira Lott, 601 - Vila Cretti" },
  { nome: "Vigilância em Zoonoses", endereco: "R. Maracai, 164 - Cidade Ariston Estela Azevedo" },
  { nome: "NAIC", endereco: "R. Ernestina Vieira, 70" },
];

db.serialize(() => {
  unidades.forEach(unidade => {
    db.run(
      `INSERT INTO unidades (nome, endereco) VALUES (?, ?)`,
      [unidade.nome, unidade.endereco],
      (err) => {
        if (err) console.error(`Erro ao inserir ${unidade.nome}:`, err.message);
      }
    );
  });
});

db.close(() => {
  console.log("✅ Todas as unidades foram inseridas no banco de dados.");
});
