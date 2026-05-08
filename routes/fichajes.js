const express = require('express');

const router = express.Router();

const fichajesController =
    require('../controllers/fichajesController');

router.post(
    '/entrada',
    fichajesController.entrada
);

router.post(
    '/salida',
    fichajesController.salida
);

router.get(
    '/',
    fichajesController.verFichajes
);
router.put(
    '/actualizar',
    fichajesController.actualizarFichaje
);

router.get(
    '/excel',
    fichajesController.exportarExcel
);

module.exports = router;