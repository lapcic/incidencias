require('dotenv').config();

const express = require('express');
const cors = require('cors');
const registrarCorteMensual = require('./routes/incidencias');

const app = express();

app.use(cors());
app.use(express.json());

let db;
try {
  db = require('./db');
} catch (error) {
  console.error('No se pudo configurar la conexión con MySQL de XAMPP:', error);
  process.exit(1);
}

registrarCorteMensual(app, db);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, async () => {
  try {
    await db.query('SELECT 1');
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
    console.log('Conexión con MySQL de XAMPP establecida.');
  } catch (error) {
    console.error('No se pudo conectar con MySQL de XAMPP:', error.message);
    process.exit(1);
  }
});
