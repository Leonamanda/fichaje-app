const db = require('../config/db');
const UsuarioService = require('../services/UsuarioService');

const service = new UsuarioService(db);

exports.crearUsuario = async (req, res) => {
    try {
        let { nombre, password, rol, descanso } = req.body;

        if (!nombre || nombre.trim() === "") {
            return res.status(400).send("El nombre es obligatorio");
        }

        if (!password || password.trim() === "") {
            return res.status(400).send("La contraseña es obligatoria");
        }

        if (!rol || (rol !== "admin" && rol !== "trabajador")) {
            return res.status(400).send("Rol inválido");
        }

        descanso = parseInt(descanso);

        if (rol === "trabajador") {
            if (isNaN(descanso) || descanso < 0) {
                return res.status(400).send("Descanso inválido");
            }
        } else {
            descanso = 0;
        }

        await service.crearUsuario(nombre, password, rol, descanso);

        res.send("Usuario creado");

    } catch (err) {
        res.status(400).send(err);
    }
};

exports.login = async (req, res) => {
    try {
        const { nombre, password } = req.body;

        const user = await service.login(nombre, password);

        res.json(user);

    } catch (err) {
        res.status(400).send(err);
    }
};

