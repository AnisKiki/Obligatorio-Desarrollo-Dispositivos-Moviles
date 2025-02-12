const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const EJERCICIOS = document.querySelector("#pantalla-registrar-ejercicio");
const URL_BASE = "https://movetrack.develotion.com/";
const nav = dqs("ion-nav");

Inicio();
function dqs(id) {
  return document.querySelector(`${id}`);
}

function Inicio() {
  Eventos();
  ArmarMenu();
}

function ArmarMenu() {
  let hayToken = localStorage.getItem("token");

  let cadena = `<ion-item onclick="CerrarMenu()" href="/">Home</ion-item>`;
  if (hayToken) {
    cadena += `
            <ion-item onclick="CerrarMenu()" href="/registrar-ejercicio">Registrar Ejercicio</ion-item>
            <ion-item onclick="CerrarSesion()">Cerrar Sesión</ion-item>
        `;
  } else {
    cadena += `
            <ion-item onclick="CerrarMenu()" href="/login">Login</ion-item>
            <ion-item onclick="CerrarMenu()" href="/registro">Registro</ion-item>
        `;
  }
  document.querySelector("#menu-opciones").innerHTML = cadena;
}

const loading = document.createElement("ion-loading");
function PrenderLoading(texto) {
  loading.cssClass = "my-custom-class";
  loading.message = texto;
  //loading.duration = 2000;
  document.body.appendChild(loading);
  loading.present();
}

function MostrarToast(mensaje, duracion) {
  const toast = document.createElement("ion-toast");
  toast.message = mensaje;
  toast.duration = duracion;
  document.body.appendChild(toast);
  toast.present();
}

function Eventos() {
  ROUTER.addEventListener("ionRouteDidChange", Navegar);
  document
    .querySelector("#btnRegistro")
    .addEventListener("click", TomarDatosRegistro);
  document
    .querySelector("#btnLogin")
    .addEventListener("click", TomarDatosLogin);
  document
    .querySelector("#btnGuardarEjercicio")
    .addEventListener("click", GuardarEjercicio);

  document.querySelector("#menu").addEventListener("ionDidOpen", () => {
    document.querySelector("#menu").removeAttribute("aria-hidden");
  });
  document.querySelector("#menu").addEventListener("ionDidClose", () => {
    document.querySelector("#menu").setAttribute("aria-hidden", "true");
  });
}
async function cargarSelectPaises() {
  PrenderLoading("Cargando Componentes");
  let paises = await fetch(`${URL_BASE}paises.php`);
  paises = await paises.json();

  let res = "";
  paises.paises.forEach((p) => {
    res += `<ion-select-option value="${p.id}">${p.name}</ion-select-option>`;
  });
  dqs("#selectPaises").innerHTML = res;
  loading.dismiss();
}
async function TomarDatosRegistro() {
  let nom = document.querySelector("#txtRegistroNombre").value;
  let pai = document.querySelector("#selectPaises").value;
  let pas = document.querySelector("#txtRegistroPassword").value;

  let mensajeError = "";

  if (!nom || !pas || !pai) {
    mensajeError = "Todos los campos son obligatorios.";
  } else if (pas.length < 6) {
    mensajeError = "La contraseña debe tener al menos 6 caracteres";
  }

  if (mensajeError) {
    MostrarToast(mensajeError, 3000);
    return;
  }

  let usuario = new Object();
  usuario.usuario = nom;
  usuario.idPais = pai;
  usuario.password = pas;

  PrenderLoading("Registrando Sesión");
  let respuesta = await registrarse(usuario);
  loading.dismiss();
  if (respuesta.codigo == 200) {
    nav.push("page-home");
    MostrarToast("Registro Exitoso", 3000);
    localStorage.setItem("token", respuesta.apyKey);
    localStorage.setItem("id", respuesta.id);
    ArmarMenu();
  } else {
    MostrarToast("Error en el registro", 3000);
  }
}
async function registrarse(u) {
  let res = "";
  let response = await fetch(`${URL_BASE}usuarios.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(u),
  });
  res = await response.json();
  return res;
}
function TomarDatosLogin() {
  let nom = document.querySelector("#txtLoginNombre").value;
  let pas = document.querySelector("#txtLoginPassword").value;

  let mensajeError = "";
  if (!nom || !pas) {
    mensajeError = "Todos los campos son obligatorios.";
  }
  if (mensajeError) {
    document.querySelector("#label-respuesta-login").innerHTML = mensajeError;
    return;
  }

  let usuarioEncontrado = {
    usuario: nom,
    password: pas,
  };

  fetch(`${URL_BASE}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(usuarioEncontrado),
  })
    .then(function (response) {
      console.log(response);
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      if (data.codigo === 200 && data.apiKey) {
        localStorage.setItem("token", data.apiKey);
        localStorage.setItem("id", data.id);
        document.querySelector("#label-respuesta-login").innerHTML =
          "Inicio de sesión exitoso.";
        nav.push("page-home");
      } else {
        document.querySelector("#label-respuesta-login").innerHTML =
          "Usuario o contraseña incorrectos.";
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function GuardarEjercicio() {
  let act = document.querySelector("#selectActividad").value;
  let tie = document.querySelector("#txtTiempo").value;
  let fec = document.querySelector("#fechaEjercicio").value;

  let mensajeError = "";

  if (!act || !tie || !fec) {
    mensajeError = "Todos los campos son obligatorios.";
  } else if (tie <= 0) {
    mensajeError = "El tiempo debe ser mayor a 0.";
  }
  if (mensajeError) {
    document.querySelector("#label-respuesta-ejercicio").innerHTML =
      mensajeError;
    return;
  }

  let ejercicio = new Object();
  ejercicio.usuarioId = localStorage.getItem("id");
  ejercicio.actividadId = act;
  ejercicio.tiempo = tie;
  ejercicio.fecha = fec;

  console.log("Ejercicio guardado:", ejercicio);
}
function CargarSelectActividades() {}
let actividades = null;

async function cargarActividades() {
  if (actividades == null) {
    let act = await fetch(`${URL_BASE}actividades.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "iduser": localStorage.getItem("id"),
        "apikey": localStorage.getItem("token"),
      },
    });
    
    actividades = await act.json();
    actividades = actividades.actividades
    console.log(actividades)
  }
}

function CerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioId");
  document.querySelector("#label-respuesta-login").innerHTML =
    "Sesión cerrada.";

  window.location.href = "/";
  ArmarMenu();
}

function Navegar(evt) {
  OcultarPantalla();
  console.log(evt);
  const ruta = evt.detail.to;
  let hayToken = localStorage.getItem("token");

  if (ruta == "/") {
    HOME.style.display = "block";
  } else if (ruta == "/login") {
    LOGIN.style.display = "block";
  } else if (ruta == "/registro") {
    cargarSelectPaises();
    REGISTRO.style.display = "block";
  } else if (ruta == "/registrar-ejercicio") {
    EJERCICIOS.style.display = "block";
  }
}
function OcultarPantalla() {
  HOME.style.display = "none";
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  EJERCICIOS.style.display = "none";
}

function CerrarMenu() {
  MENU.close();
}
