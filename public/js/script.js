// 🔐 LOGIN
async function login() {
  const usuario = document.getElementById("usuario").value;

  const password = document.getElementById("password").value;

  const res = await fetch("/api/usuarios/login", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      usuario,
      password,
    }),
  });

  const data = await res.json();

  console.log(data);

  if (data.ok) {
    localStorage.setItem("usuario", data.usuario);

    localStorage.setItem("rol", data.rol);

    if (data.rol === "admin") {
      window.location = "/admin.html";
    } else {
      window.location = "/trabajador.html";
    }
  } else {
    alert(data.error);
  }
}
// 👤 CREAR USUARIO
async function crearUsuario() {
  const usuario = document.getElementById("nombre").value;

  const password = document.getElementById("password").value;

  const descanso = document.getElementById("descanso").value;

  const rol = document.getElementById("rol").value;

  const res = await fetch("/api/usuarios/crear", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      usuario,
      password,
      rol,
      descanso,
    }),
  });

  const data = await res.json();

  console.log(data);

  if (data.ok) {
    alert("Usuario creado");

    location.reload();
  } else {
    alert(data.error);
  }
}

// SALIDA
async function salida() {
  const usuario = JSON.parse(localStorage.getItem("usuarioData")).nombre;

  const res = await fetch("/api/fichajes/salida", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario }),
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
  resultado.innerText = "✅ " + data.mensaje + " - Horas: " + data.horas;
}

async function cargarFichajes() {
  const inicio = document.getElementById("inicio").value;
  const fin = document.getElementById("fin").value;

  // fecha de hoy
  const hoy = new Date().toISOString().split("T")[0];

  if (inicio && fin) {
    if (inicio > fin) {
      alert(" La fecha de inicio no puede ser mayor que la de fin");
      return;
    }

    if (fin > hoy) {
      alert(" La fecha no puede ser posterior a hoy");
      return;
    }

    if (inicio > hoy) {
      alert(" La fecha de inicio no puede ser futura");
      return;
    }
  }

  let url = "/api/fichajes";

  if (inicio && fin) {
    url += `?inicio=${inicio}&fin=${fin}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const tabla = document.getElementById("tablaFichajes");
  tabla.innerHTML = "";

  data.forEach((f) => {
    const fila = document.createElement("tr");
    
    fila.id = `fila-${f.id}`;

    const fechaEntrada = new Date(f.entrada);

    const fecha = fechaEntrada.toLocaleDateString("es-ES");

    const horaEntrada = fechaEntrada.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let horaSalida = "-";

    if (f.salida) {
      const salidaDate = new Date(f.salida);

      horaSalida = salidaDate.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    fila.innerHTML = `
    <td>${f.usuario}</td>
    <td>${fecha}</td>
    <td>${horaEntrada}</td>
    <td>${horaSalida}</td>
    <td>${f.horas || '0.00'}</td>

    <td>
        <button
            class="btn btn-warning"
            onclick="editar(${f.id})"
        >
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
  document
    .getElementById(activo)
    .classList.remove("btn-outline-primary", "btn-outline-secondary");
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

    const fila =
        document.getElementById(
            `fila-${id}`
        );

    const celdas =
        fila.querySelectorAll('td');

    const entradaActual =
        celdas[2].innerText;

    const salidaActual =
        celdas[3].innerText === '-'
            ? ''
            : celdas[3].innerText;

    celdas[2].innerHTML = `
        <input
            type="time"
            id="entrada-${id}"
            class="form-control"
            value="${entradaActual}"
        >
    `;

    celdas[3].innerHTML = `
        <input
            type="time"
            id="salida-${id}"
            class="form-control"
            value="${salidaActual}"
        >
    `;

    celdas[5].innerHTML = `
        <button
            class="btn btn-success"
            onclick="guardar(${id})"
        >
            Guardar
        </button>
    `;
}
async function guardar(id) {

    const entrada =
        document.getElementById(
            `entrada-${id}`
        ).value;

    const salida =
        document.getElementById(
            `salida-${id}`
        ).value;

    const fila =
        document.getElementById(
            `fila-${id}`
        );

    const fecha =
        fila.children[1].innerText;

    const partes =
        fecha.split('/');

    const fechaSQL =
        `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;

    const entradaCompleta =
        `${fechaSQL} ${entrada}:00`;

    const salidaCompleta =
        `${fechaSQL} ${salida}:00`;

    console.log({
        entradaCompleta,
        salidaCompleta
    });

    const res = await fetch(
        '/api/fichajes/actualizar',
        {
            method: 'PUT',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                id,
                entrada: entradaCompleta,
                salida: salidaCompleta
            })
        }
    );

    const data = await res.json();

    if (data.ok) {

        location.reload();

    } else {

        alert('Error actualizando');
    }
}

async function entrada() {

    const usuario =
        localStorage.getItem('usuario');

    const res = await fetch(
        '/api/fichajes/entrada',
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                usuario
            })
        }
    );

    const texto =
        await res.text();

    try {

        const data =
            JSON.parse(texto);

        if (data.ok) {

            alert(
                'Entrada registrada'
            );

        } else {

            alert(
                data.error ||
                'Error'
            );
        }

    } catch {

        alert(texto);
    }
}


async function salida() {

    const usuario =
        localStorage.getItem('usuario');

    const res = await fetch(
        '/api/fichajes/salida',
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                usuario
            })
        }
    );

    const texto =
        await res.text();

    try {

        const data =
            JSON.parse(texto);

        if (data.ok) {

            alert(
                'Salida registrada'
            );

        } else {

            alert(
                data.error ||
                'Error'
            );
        }

    } catch {

        alert(texto);
    }
}