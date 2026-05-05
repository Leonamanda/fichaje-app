// 🔐 LOGIN
async function login() {
    const nombre = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;

    const res = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password })
    });

    if (!res.ok) {
        document.getElementById("error").innerText = "Login incorrecto";
        return;
    }

    const data = await res.json();

    // guardamos TODO el usuario
    localStorage.setItem("usuarioData", JSON.stringify(data));

    if (data.rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "trabajador.html";
    }
}

// 👤 CREAR USUARIO
async function crearUsuario() {
    const nombre = document.getElementById("nombre").value;
    const password = document.getElementById("password").value;
    const rol = document.getElementById("rol").value;
    const descanso = document.getElementById("descanso").value;

    const res = await fetch('/api/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, password, rol, descanso })
    });

    if (res.ok) {
        document.getElementById("msg").innerText = "Usuario creado";
    } else {
        document.getElementById("msg").innerText = "Error";
    }
}

// ENTRADA
async function entrada() {
    const usuario = JSON.parse(localStorage.getItem("usuarioData")).nombre;

    const res = await fetch('/api/fichajes/entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
    });

    const texto = await res.text();
    const resultado = document.getElementById("resultado");

    if (!res.ok) {
        resultado.style.color = "red";
        resultado.innerText = "❌ " + texto;
        return;
    }

    const data = JSON.parse(texto);

    resultado.style.color = "green";
    resultado.innerText = "✅ " + data.mensaje + " a las " + data.hora;
}

// SALIDA
async function salida() {
    const usuario = JSON.parse(localStorage.getItem("usuarioData")).nombre;

    const res = await fetch('/api/fichajes/salida', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario })
    });

    const texto = await res.text();
    const resultado = document.getElementById("resultado");

    if (!res.ok) {
        resultado.style.color = "red";
        resultado.innerText = "❌ " + texto;
        return;
    }

    const data = JSON.parse(texto);

    resultado.style.color = "green";
    resultado.innerText =
        "✅ " + data.mensaje + " - Horas: " + data.horas;
}

async function cargarFichajes() {

    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;

    // fecha de hoy
    const hoy = new Date().toISOString().split("T")[0];

    if (inicio && fin) {

        if (inicio > fin) {
            alert("❌ La fecha de inicio no puede ser mayor que la de fin");
            return;
        }

        if (fin > hoy) {
            alert("❌ La fecha no puede ser posterior a hoy");
            return;
        }

        if (inicio > hoy) {
            alert("❌ La fecha de inicio no puede ser futura");
            return;
        }
    }

    let url = '/api/fichajes/ver';

    if (inicio && fin) {
        url += `?inicio=${inicio}&fin=${fin}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    const tabla = document.getElementById("tablaFichajes");
    tabla.innerHTML = "";

    data.forEach(f => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${f.usuario}</td>
            <td>${f.fecha}</td>
            <td id="entrada-${f.id}">${f.entrada}</td>
            <td id="salida-${f.id}">${f.salida || "-"}</td>
            <td>${f.horas || "-"}</td>
            <td>
                <button onclick="editar(${f.id})" id="btn-${f.id}" class="btn btn-warning btn-sm">
                    ✏️ Modificar
                </button>
            </td>
        `;

        tabla.appendChild(fila);
    });
}
function exportarExcel() {
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;

    let url = `/api/fichajes/excel`;

    if (inicio && fin) {
        url += `?inicio=${inicio}&fin=${fin}`;
    }

    window.location.href = url;
}

function logout() {
    localStorage.removeItem("usuarioData");
    window.location.href = "index.html";
}

function activarBoton(activo, inactivo) {
    // ACTIVO → botón relleno
    document.getElementById(activo).classList.remove("btn-outline-primary", "btn-outline-secondary");
    document.getElementById(activo).classList.add("btn-primary");

    // INACTIVO → botón outline
    document.getElementById(inactivo).classList.remove("btn-primary");
    document.getElementById(inactivo).classList.add("btn-outline-secondary");
}


function mostrarFichajes() {
    document.getElementById("seccionFichajes").style.display = "block";
    document.getElementById("seccionUsuarios").style.display = "none";

    activarBoton("btnFichajes", "btnUsuarios");
}

function mostrarUsuarios() {
    document.getElementById("seccionFichajes").style.display = "none";
    document.getElementById("seccionUsuarios").style.display = "block";

    activarBoton("btnUsuarios", "btnFichajes");
}

function editar(id) {
    const entradaCell = document.getElementById(`entrada-${id}`);
    const salidaCell = document.getElementById(`salida-${id}`);
    const btn = document.getElementById(`btn-${id}`);

    const entradaValor = entradaCell.innerText;
    const salidaValor = salidaCell.innerText === "-" ? "" : salidaCell.innerText;

    entradaCell.innerHTML = `<input value="${entradaValor}" id="input-entrada-${id}" class="form-control">`;
    salidaCell.innerHTML = `<input value="${salidaValor}" id="input-salida-${id}" class="form-control">`;

    btn.innerText = "💾 Guardar";
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-success");

    btn.onclick = () => guardar(id);
}

async function guardar(id) {
    const entrada = document.getElementById(`input-entrada-${id}`).value;
    const salida = document.getElementById(`input-salida-${id}`).value;

    if (!entrada || !salida) {
        alert("❌ Completa entrada y salida");
        return;
    }
    
    if (salida < entrada) {
    alert("❌ La salida no puede ser menor que la entrada");
    return;
}

    const res = await fetch('/api/fichajes/editar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, entrada, salida })
    });

    if (res.ok) {
        alert("✅ Actualizado");
        cargarFichajes();
    } else {
        alert("❌ Error");
    }
}




