const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/db.sqlite');

db.all('SELECT * FROM unidades', (err, rows) => {
  if (err) {
    console.error('Erro ao consultar tabela unidades:', err.message);
  } else {
    console.log(`Total de unidades cadastradas: ${rows.length}`);
    console.log(rows);
  }
  db.close();
});
