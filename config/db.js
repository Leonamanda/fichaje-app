const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db');

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE,
            password TEXT,
            rol TEXT,
            descanso INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS fichajes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT,
            fecha TEXT,
            entrada TEXT,
            salida TEXT,
            horas REAL
        )
    `);

});

module.exports = db;