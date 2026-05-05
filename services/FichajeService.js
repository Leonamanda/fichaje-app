const Fichaje = require('../models/Fichaje');

function calcularHoras(entrada, salida, descansoMin = 0) {
    const [h1, m1] = entrada.split(":").map(Number);
    const [h2, m2] = salida.split(":").map(Number);

    let minutosEntrada = h1 * 60 + m1;
    let minutosSalida = h2 * 60 + m2;

    let total = minutosSalida - minutosEntrada;


    // restar descanso
    total -= descansoMin;

    if (total < 0) total = 0;

    return (total / 60).toFixed(2);
}

class FichajeService {
    constructor(db) {
        this.db = db;
    }


    ficharEntrada(usuario, fecha, hora) {
        return new Promise((resolve, reject) => {

            this.db.get(`SELECT * FROM usuarios WHERE nombre = ?`, [usuario], (err, user) => {

                if (!user) return reject("Usuario no existe");
                if (user.rol === "admin") return reject("Admin no ficha");

                this.db.get(
                    `SELECT * FROM fichajes WHERE usuario = ? AND fecha = ?`,
                    [usuario, fecha],
                    (err, row) => {

                        if (row) return reject("Ya fichaste hoy");

                        this.db.run(
                            `INSERT INTO fichajes (usuario, fecha, entrada) VALUES (?, ?, ?)`,
                            [usuario, fecha, hora],
                            err => err ? reject(err) : resolve(hora)
                        );
                    }
                );
            });
        });
    }

    ficharSalida(usuario, fecha, horaSalida) {
        return new Promise((resolve, reject) => {

            this.db.get(`SELECT * FROM usuarios WHERE nombre = ?`, [usuario], (err, user) => {

                if (!user) return reject("Usuario no existe");
                if (user.rol === "admin") return reject("Admin no ficha");

                this.db.get(
                    `SELECT * FROM fichajes WHERE usuario = ? AND fecha = ?`,
                    [usuario, fecha],
                    (err, row) => {

                        if (!row) return reject("No hay entrada");
                        if (row.salida) return reject("Ya fichaste salida");

                        const fichaje = new Fichaje(usuario, fecha, row.entrada, horaSalida);

                        const horas = fichaje.calcularHoras(user.descanso);

                        this.db.run(
                            `UPDATE fichajes SET salida = ?, horas = ? WHERE id = ?`,
                            [horaSalida, horas, row.id],
                            err => err ? reject(err) : resolve(horas)
                        );
                    }
                );
            });
        });
    }

    obtenerFichajes(inicio, fin) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM fichajes WHERE fecha BETWEEN ? AND ?`,
                [inicio, fin],
                (err, rows) => err ? reject(err) : resolve(rows)
            );
        });
    }


    async actualizarFichaje(id, entrada, salida) {
        return new Promise((resolve, reject) => {

            // obtener descanso del usuario
            this.db.get(`
            SELECT u.descanso 
            FROM fichajes f
            JOIN usuarios u ON f.usuario = u.nombre
            WHERE f.id = ?
        `, [id], (err, row) => {

                if (err) return reject(err);

                const descanso = row?.descanso || 0;

                // calcular horas
                const horas = calcularHoras(entrada, salida, descanso);

                // actualizar
                this.db.run(
                    `UPDATE fichajes 
                 SET entrada = ?, salida = ?, horas = ?
                 WHERE id = ?`,
                    [entrada, salida, horas, id],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        });
    }
}



module.exports = FichajeService;

