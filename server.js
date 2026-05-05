const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Rutas
const usuariosRoutes = require('./routes/usuarios');
const fichajesRoutes = require('./routes/fichajes');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fichajes', fichajesRoutes);

// Arrancar servidor (SOLO UNA VEZ y al final)
app.listen(PORT, () => {
    console.log("Servidor en puerto " + PORT);
});