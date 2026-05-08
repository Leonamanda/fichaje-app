const ExcelJS = require('exceljs');
const db = require('../config/db');

const FichajeService =
    require('../services/FichajeService');

const service =
    new FichajeService(db);

exports.entrada = async (req, res) => {

    try {

        const { usuario } = req.body;

        await service.ficharEntrada(
            usuario
        );

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(400).send(
            err.toString()
        );
    }
};

exports.salida = async (req, res) => {

    try {

        const { usuario } = req.body;

        await service.ficharSalida(
            usuario
        );

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(400).send(
            err.toString()
        );
    }
};

exports.verFichajes = async (req, res) => {

    try {

        const {
            inicio,
            fin
        } = req.query;

        let result;

        if (inicio && fin) {

            result = await db.query(
                `SELECT
                    f.id,
                    u.usuario,
                    f.entrada,
                    f.salida,
                    f.horas
                 FROM fichajes f
                 JOIN usuarios u
                 ON f.usuario_id = u.id
                 WHERE DATE(f.entrada)
                 BETWEEN $1 AND $2
                 ORDER BY f.entrada DESC`,
                [inicio, fin]
            );

        } else {

            result = await db.query(
                `SELECT
                    f.id,
                    u.usuario,
                    f.entrada,
                    f.salida,
                    f.horas
                 FROM fichajes f
                 JOIN usuarios u
                 ON f.usuario_id = u.id
                 ORDER BY f.entrada DESC`
            );
        }

        res.json(result.rows);

    } catch (err) {

        console.log(err);

        res.status(500).send(
            'Error obteniendo fichajes'
        );
    }
};

exports.actualizarFichaje = async (req, res) => {

    try {

        const {
            id,
            entrada,
            salida
        } = req.body;

        console.log('ENTRADA:', entrada);
console.log('SALIDA:', salida);

        const fichajeResult =
            await db.query(
                `SELECT
                    f.*,
                    u.descanso
                 FROM fichajes f
                 JOIN usuarios u
                 ON f.usuario_id = u.id
                 WHERE f.id = $1`,
                [id]
            );

        const fichaje =
            fichajeResult.rows[0];

        const entradaHora =
            entrada.split(' ')[1];

        const salidaHora =
            salida.split(' ')[1];

        const [h1, m1] =
            entradaHora.split(':').map(Number);

        const [h2, m2] =
            salidaHora.split(':').map(Number);

        let minutosEntrada =
            h1 * 60 + m1;

        let minutosSalida =
            h2 * 60 + m2;

        let totalMinutos =
            minutosSalida - minutosEntrada;

        totalMinutos -=
            fichaje.descanso || 0;

        if (totalMinutos < 0) {
            totalMinutos = 0;
        }

       const horasEnteras =
    Math.floor(totalMinutos / 60);

const minutosRestantes =
    totalMinutos % 60;

const horas =
    `${horasEnteras}.${minutosRestantes
        .toString()
        .padStart(2, '0')}`;

console.log('HORAS:', horas);

        await db.query(
            `UPDATE fichajes
             SET entrada = $1,
                 salida = $2,
                 horas = $3
             WHERE id = $4`,
            [
                entrada,
                salida,
                horas,
                id
            ]
        );

        res.json({
            ok: true
        });

    } catch (err) {

        console.log(err);

        res.status(400).json({
            ok: false
        });
    }
};


exports.exportarExcel = async (req, res) => {

    try {

        const result = await db.query(
            `SELECT
                f.id,
                u.usuario,
                f.entrada,
                f.salida,
                f.horas
             FROM fichajes f
             JOIN usuarios u
             ON f.usuario_id = u.id
             ORDER BY f.entrada DESC`
        );

        const fichajes = result.rows;

        const workbook =
            new ExcelJS.Workbook();

        const sheet =
            workbook.addWorksheet(
                'Fichajes'
            );

        sheet.columns = [
            {
                header: 'Usuario',
                key: 'usuario',
                width: 20
            },
            {
                header: 'Fecha',
                key: 'fecha',
                width: 15
            },
            {
                header: 'Entrada',
                key: 'entrada',
                width: 15
            },
            {
                header: 'Salida',
                key: 'salida',
                width: 15
            },
            {
                header: 'Horas',
                key: 'horas',
                width: 10
            }
        ];

        fichajes.forEach(f => {

            const fechaEntrada =
                new Date(f.entrada);

            const fecha =
                fechaEntrada.toLocaleDateString(
                    'es-ES'
                );

            const entrada =
                fechaEntrada.toLocaleTimeString(
                    'es-ES',
                    {
                        hour: '2-digit',
                        minute: '2-digit'
                    }
                );

            let salida = '-';

            if (f.salida) {

                salida =
                    new Date(f.salida)
                        .toLocaleTimeString(
                            'es-ES',
                            {
                                hour: '2-digit',
                                minute: '2-digit'
                            }
                        );
            }

            sheet.addRow({
                usuario: f.usuario,
                fecha,
                entrada,
                salida,
                horas: f.horas
            });
        });

        const ahora = new Date();

        const fechaArchivo =
            ahora.toISOString()
                .split('T')[0];

        const horaArchivo =
            ahora.toTimeString()
                .slice(0, 5)
                .replace(':', '-');

        const nombreArchivo =
            `registro_fichajes_${fechaArchivo}_${horaArchivo}.xlsx`;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${nombreArchivo}`
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (err) {

        console.log(err);

        res.status(500).send(
            'Error exportando Excel'
        );
    }
};