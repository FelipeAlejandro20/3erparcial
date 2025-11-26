// Importar librerías necesarias
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configurar conexión a base de datos
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres-db',
    port: 5432,
    database: 'crud_db',
    user: 'postgres',
    password: 'postgres'
});

// ------------------ RUTAS CRUD ------------------

// GET - Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET - Obtener usuario por ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST - Crear usuario
app.post('/api/users', async (req, res) => {
    try {
        const { nombre, correo } = req.body;
        const result = await pool.query(
            'INSERT INTO users (nombre, correo) VALUES ($1, $2) RETURNING *',
            [nombre, correo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT - Actualizar usuario
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo } = req.body;
        const result = await pool.query(
            'UPDATE users SET nombre=$1, correo=$2 WHERE id=$3 RETURNING *',
            [nombre, correo, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Eliminar usuario
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear tabla si no existe
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        correo TEXT
    )
`).then(() => console.log('Tabla users lista'));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
