const db = require('../config/db');
const FichajeService = require('../services/FichajeService');
const ExcelJS = require('exceljs');

const service = new FichajeService(db);

exports.entrada = async (req, res) => {
    try {
        const { usuario } = req.body;

        const now = new Date();
        const fecha = now.toISOString().split('T')[0];
        const hora = now.toTimeString().slice(0,5);

        const h = await service.ficharEntrada(usuario, fecha, hora);

        res.json({ mensaje: "Entrada registrada", hora: h });

    } catch (err) {
        res.status(400).send(err);
    }
};

exports.salida = async (req, res) => {
    try {
        const { usuario } = req.body;

        const now = new Date();
        const fecha = now.toISOString().split('T')[0];
        const hora = now.toTimeString().slice(0,5);

        const horas = await service.ficharSalida(usuario, fecha, hora);

        res.json({ mensaje: "Salida registrada", horas });

    } catch (err) {
        res.status(400).send(err);
    }
};

exports.verFichajes = async (req, res) => {
    let { inicio, fin } = req.query;

    if (!inicio || !fin) {
        db.all(`SELECT * FROM fichajes`, (err, rows) => {
            if (err) return res.status(500).send(err);
            res.json(rows);
        });
        return;
    }

    db.all(
        `SELECT * FROM fichajes WHERE fecha BETWEEN ? AND ?`,
        [inicio, fin],
        (err, rows) => {
            if (err) return res.status(500).send(err);
            res.json(rows);
        }
    );
};

// 🔥 EXPORTAR EXCEL
exports.exportarExcel = async (req, res) => {
    const ExcelJS = require('exceljs');

    try {
        // 🔥 obtener datos correctamente con Promise
        const fichajes = await new Promise((resolve, reject) => {
            db.all(`SELECT * FROM fichajes`, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log("FICHAJES:", fichajes); // debug

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Registro Horario');

        sheet.columns = [
            { header: 'Usuario', key: 'usuario', width: 20 },
            { header: 'Fecha', key: 'fecha', width: 15 },
            { header: 'Entrada', key: 'entrada', width: 10 },
            { header: 'Salida', key: 'salida', width: 10 },
            { header: 'Horas', key: 'horas', width: 10 }
        ];

        // encabezado en negrita
        sheet.getRow(1).font = { bold: true };

        // 🔥 añadir datos
        fichajes.forEach(f => {
            sheet.addRow({
                usuario: f.usuario,
                fecha: f.fecha,
                entrada: f.entrada,
                salida: f.salida || "-",
                horas: f.horas ?? "0.00"
            });
        });

        // nombre dinámico
        const hoy = new Date().toISOString().split('T')[0];
        const nombreArchivo = `registro-horario-${hoy}.xlsx`;

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${nombreArchivo}`
        );

        // 🔥 ESTA ES LA CLAVE
        await workbook.xlsx.write(res);

        res.end();

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generando Excel");
    }
};

exports.actualizarFichaje = async (req, res) => {
    try {
        const { id, entrada, salida } = req.body;

        console.log("EDITANDO:", id, entrada, salida); // 🔥 DEBUG

        await service.actualizarFichaje(id, entrada, salida);

        res.send("OK");

    } catch (err) {
        console.log("ERROR CONTROLLER:", err); // 🔥 CLAVE
        res.status(400).send("Error");
    }
};