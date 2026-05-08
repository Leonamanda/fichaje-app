const bcrypt = require('bcrypt');

class UsuarioService {

    constructor(db) {
        this.db = db;
    }

    async login(usuario, password) {

        const result = await this.db.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            [usuario]
        );

        const user = result.rows[0];

        if (!user) {
            throw 'Usuario no encontrado';
        }

        const valido = await bcrypt.compare(
            password,
            user.password
        );

        if (!valido) {
            throw 'Contraseña incorrecta';
        }

        return user;
    }

    async crearUsuario(
        usuario,
        password,
        rol,
        descanso
    ) {

        const existe = await this.db.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            [usuario]
        );

        if (existe.rows.length > 0) {
            throw 'Usuario ya existe';
        }

        const hash = await bcrypt.hash(password, 10);

        await this.db.query(
            `INSERT INTO usuarios
            (usuario, password, rol, descanso)
            VALUES($1, $2, $3, $4)`,
            [usuario, hash, rol, descanso]
        );
    }
}

module.exports = UsuarioService;