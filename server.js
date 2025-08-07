const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Banco de dados
const db = new sqlite3.Database('./database/db.sqlite');

db.serialize(() => {
    // Tabela 'unidades' continua a mesma
    db.run(`CREATE TABLE IF NOT EXISTS unidades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        endereco TEXT
    )`);

    // --- ALTERAÇÃO AQUI: ADICIONANDO 'comentario' e 'retirado' ---
    db.run(`CREATE TABLE IF NOT EXISTS computadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unidade_id INTEGER,
        setor TEXT,
        patrimonio TEXT,
        quantidade INTEGER DEFAULT 1,
        otimizado INTEGER DEFAULT 0,
        comentario TEXT DEFAULT '',
        retirado INTEGER DEFAULT 0,
        FOREIGN KEY (unidade_id) REFERENCES unidades(id)
    )`);
});

// Rotas unidades
app.get('/api/unidades', (req, res) => {
    db.all('SELECT * FROM unidades', [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/unidades', (req, res) => {
    const { nome, endereco } = req.body;
    db.run('INSERT INTO unidades (nome, endereco) VALUES (?, ?)', [nome, endereco], function (err) {
        if (err) return res.status(500).json(err);
        res.json({ id: this.lastID });
    });
});

// Rotas computadores
app.get('/api/unidades/:id/computadores', (req, res) => {
    db.all('SELECT * FROM computadores WHERE unidade_id = ?', [req.params.id], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post('/api/computadores', (req, res) => {
    const { unidade_id, setor, patrimonio, quantidade } = req.body;
    db.run(
        'INSERT INTO computadores (unidade_id, setor, patrimonio, quantidade, comentario, retirado) VALUES (?, ?, ?, ?, ?, ?)',
        [unidade_id, setor, patrimonio, quantidade || 1, '', 0],
        function (err) {
            if (err) return res.status(500).json(err);
            res.json({ id: this.lastID });
        }
    );
});

// --- ALTERAÇÃO AQUI: ADICIONANDO 'comentario' e 'retirado' à rota PUT ---
app.put('/api/computadores/:id', (req, res) => {
    const { setor, patrimonio, quantidade, otimizado, comentario, retirado } = req.body;

    let query = 'UPDATE computadores SET ';
    let params = [];
    let updates = [];

    if (setor !== undefined) {
        updates.push('setor = ?');
        params.push(setor);
    }
    if (patrimonio !== undefined) {
        updates.push('patrimonio = ?');
        params.push(patrimonio);
    }
    if (quantidade !== undefined) {
        updates.push('quantidade = ?');
        params.push(quantidade);
    }
    if (otimizado !== undefined) {
        updates.push('otimizado = ?');
        params.push(otimizado);
    }
    if (comentario !== undefined) {
        updates.push('comentario = ?');
        params.push(comentario);
    }
    if (retirado !== undefined) {
        updates.push('retirado = ?');
        params.push(retirado);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(req.params.id);

    db.run(query, params, function (err) {
        if (err) return res.status(500).json(err);
        res.json({ updated: this.changes });
    });
});

// Deletar computador
app.delete('/api/computadores/:id', (req, res) => {
    db.run('DELETE FROM computadores WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json(err);
        res.json({ deleted: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});