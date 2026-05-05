const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const usuariosRoutes = require('./routes/usuarios');
const fichajesRoutes = require('./routes/fichajes');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/fichajes', fichajesRoutes);

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});