const bcrypt = require('bcrypt');

class UsuarioService {
    constructor(db) {
        this.db = db;
    }

    async crearUsuario(nombre, password, rol, descanso) {
        const existente = await new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM usuarios WHERE nombre = ?`,
                [nombre],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existente) {
            throw "El usuario ya existe";
        }

        const hash = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            this.db.run(
                `INSERT INTO usuarios (nombre, password, rol, descanso) VALUES (?, ?, ?, ?)`,
                [nombre, hash, rol, descanso],
                err => err ? reject(err) : resolve()
            );
        });
    }

    async login(nombre, password) {
        const user = await new Promise((resolve, reject) => {
            this.db.get(
                `SELECT * FROM usuarios WHERE nombre = ?`,
                [nombre],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) throw "Usuario no encontrado";

        const valido = await bcrypt.compare(password, user.password);

        if (!valido) throw "Contraseña incorrecta";

        return user;
    }

    
}

module.exports = UsuarioService;