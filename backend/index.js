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
  db = {
    query: async () => [[]],
  };
  console.warn('No se encontró un módulo de base de datos. Se usará un modo de desarrollo sin persistencia.');
}

registrarCorteMensual(app, db);

app.listen(3000, () => {
  console.log('Servidor backend escuchando en http://localhost:3000');
});
