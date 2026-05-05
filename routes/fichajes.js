const express = require('express');
const router = express.Router();
const controller = require('../controllers/fichajesController');

router.post('/entrada', controller.entrada);
router.post('/salida', controller.salida);
router.get('/ver', controller.verFichajes);
router.get('/excel', controller.exportarExcel);
router.post('/editar', controller.actualizarFichaje);


module.exports = router;