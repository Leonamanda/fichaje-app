const express = require('express');

const router = express.Router();

const db = require('../config/db');

const UsuarioService =
    require('../services/UsuarioService');

const usuarioService =
    new UsuarioService(db);

router.post('/login', async (req, res) => {

    console.log('LOGIN HIT');

    try {

        console.log(req.body);

        const {
            usuario,
            password
        } = req.body;

        console.log('ANTES LOGIN SERVICE');

        const user =
            await usuarioService.login(
                usuario,
                password
            );

        console.log('DESPUES LOGIN SERVICE');

        res.json({
            ok: true,
            usuario: user.usuario,
            rol: user.rol
        });

    } catch (error) {

        console.log('ERROR LOGIN');
        console.log(error);

        res.status(400).json({
            ok: false,
            error: error.toString()
        });
    }
});

router.post('/crear', async (req, res) => {

    try {

        const {
            usuario,
            password,
            rol,
            descanso
        } = req.body;

        await usuarioService.crearUsuario(
            usuario,
            password,
            rol,
            descanso
        );

        res.json({
            ok: true
        });

    } catch (error) {

        console.log(error);

        res.status(400).json({
            ok: false,
            error: error.toString()
        });
    }
});

module.exports = router;