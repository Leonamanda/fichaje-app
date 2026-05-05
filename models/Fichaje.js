class Fichaje {
    constructor(usuario, fecha, entrada, salida = null) {
        this.usuario = usuario;
        this.fecha = fecha;
        this.entrada = entrada;
        this.salida = salida;
    }

    calcularHoras(descanso) {
        if (!this.salida) return 0;

        const entrada = new Date(`${this.fecha}T${this.entrada}`);
        const salida = new Date(`${this.fecha}T${this.salida}`);

        let minutos = (salida - entrada) / (1000 * 60);

        if (minutos >= 360) {
            minutos -= descanso;
        }

        return (minutos / 60).toFixed(2);
    }
}

module.exports = Fichaje;