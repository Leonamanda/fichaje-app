class Usuario {
    constructor(nombre, password, rol = "trabajador", descanso = 30) {
        this.nombre = nombre;
        this.password = password;
        this.rol = rol;
        this.descanso = descanso;
    }

    esAdmin() {
        return this.rol === "admin";
    }
}

module.exports = Usuario;