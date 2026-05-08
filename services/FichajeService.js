class FichajeService {
  constructor(db) {
    this.db = db;
  }

  async ficharEntrada(usuario) {
    const usuarioResult = await this.db.query(
      "SELECT * FROM usuarios WHERE usuario = $1",
      [usuario],
    );

    const user = usuarioResult.rows[0];

    if (!user) {
      throw "Usuario no encontrado";
    }

    const existe = await this.db.query(
      `SELECT * FROM fichajes
             WHERE usuario_id = $1
             AND DATE(entrada) = CURRENT_DATE`,
      [user.id],
    );

    if (existe.rows.length > 0) {
      throw "Ya fichaste hoy";
    }

    await this.db.query(
      `INSERT INTO fichajes
            (usuario_id, entrada)
            VALUES($1, NOW())`,
      [user.id],
    );

    return true;
  }

  async ficharSalida(usuario) {
    const usuarioResult = await this.db.query(
      "SELECT * FROM usuarios WHERE usuario = $1",
      [usuario],
    );

    const user = usuarioResult.rows[0];

    if (!user) {
      throw "Usuario no encontrado";
    }

    const fichajeResult = await this.db.query(
      `SELECT * FROM fichajes
             WHERE usuario_id = $1
             AND DATE(entrada) = CURRENT_DATE
             ORDER BY id DESC
             LIMIT 1`,
      [user.id],
    );

    const fichaje = fichajeResult.rows[0];

    if (!fichaje) {
      throw "No hay entrada";
    }

    if (fichaje.salida) {
      throw "Ya fichaste salida";
    }

    await this.db.query(
      `UPDATE fichajes
             SET salida = NOW()
             WHERE id = $1`,
      [fichaje.id],
    );

    return true;
  }

  async obtenerFichajes() {
    const result = await this.db.query(
      `SELECT
        f.id,
        u.usuario,
        f.entrada,
        f.salida,
        f.horas
     FROM fichajes f
     JOIN usuarios u
     ON f.usuario_id = u.id
     ORDER BY f.entrada DESC`,
    );

    return result.rows;
  }
}

module.exports = FichajeService;
