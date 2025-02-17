const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const EJERCICIOS = document.querySelector("#pantalla-registrar-ejercicio");
const MIS = document.querySelector("#pantalla-mis-registros");
const MAPA = document.querySelector("#pantalla-mapa");
const ESTADISTICAS = document.querySelector("#pantalla-estadisticas");
const URL_BASE = "https://movetrack.develotion.com/";
const UIMG = "https://movetrack.develotion.com/imgs/";
const nav = dqs("ion-nav");
let actividades = null;
let modal = null;

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
            <ion-item onclick="CerrarMenu()" href="/estadisticas">Estadisticas</ion-item>
            <ion-item onclick="CerrarMenu()" href="/registrar-ejercicio">Registrar Ejercicio</ion-item>
            <ion-item onclick="CerrarMenu()" href="/mis-registros">Mis Registros</ion-item>
            <ion-item onclick="CerrarMenu()" href="/mapa">Mapa de Usuarios</ion-item>
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
    localStorage.setItem("token", respuesta.apiKey);
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
    MostrarToast(mensajeError, 3000);
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
        MostrarToast("Inicio de sesión exitoso.", 3000);
        nav.push("page-home");
        ArmarMenu();
      } else {
        MostrarToast("Usuario o contraseña incorrectos.", 3000);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function GuardarEjercicio() {
  let act = document.querySelector("#selectActividades").value;
  let tie = document.querySelector("#timeActividades").value;
  let fec = document.querySelector("#fechaEjercicio").value;

  let mensajeError = "";

  if (!act || !tie || !fec) {
    mensajeError = "Todos los campos son obligatorios.";
  } else if (tie <= 0) {
    mensajeError = "El tiempo debe ser mayor a 0.";
  }
  if (mensajeError) {
    MostrarToast(mensajeError, 3000);
  }

  let ejercicio = new Object();
  ejercicio.idUsuario = localStorage.getItem("id");
  ejercicio.idActividad = act;
  ejercicio.tiempo = tie;
  ejercicio.fecha = fec;
  let response = await registrarEjercicio(ejercicio);
  if (response.status == 200) {
    MostrarToast("Actividad registrada correctamente.", 3000);
  } else {
    MostrarToast("No se ha podido registrar la actividad.", 3000);
  }
}
async function registrarEjercicio(e) {
  let res = await fetch(`${URL_BASE}registros.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      iduser: localStorage.getItem("id"),
      apikey: localStorage.getItem("token"),
    },
    body: JSON.stringify(e),
  });
  return res;
}

async function CargarSelectActividades() {
  PrenderLoading("Cargando Componentes");
  await cargarActividades();
  let res = "";
  actividades.forEach((a) => {
    res += `<ion-select-option value="${a.id}">${a.nombre}</ion-select-option>`;
  });
  dqs("#selectActividades").innerHTML = res;
  loading.dismiss();
}

async function cargarActividades() {
  if (actividades == null) {
    let act = await fetch(`${URL_BASE}actividades.php`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        iduser: localStorage.getItem("id"),
        apikey: localStorage.getItem("token"),
      },
    });

    actividades = await act.json();
    if (actividades.codigo == 200) {
      actividades = actividades.actividades;
    } else {
      MostrarToast("No se pueden cargar las actividades en éste momento", 3000);
    }
  }
}

function CerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioId");
  nav.push("page-home");
  MostrarToast("Sesión cerrada correctamente.", 3000);
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
    CargarSelectActividades();
    cargarCalendario();
    EJERCICIOS.style.display = "block";
  } else if (ruta == "/mis-registros") {
    CargarSliderRegistros();
    MIS.style.display = "block";
  } else if (ruta == "/mapa") {
    MAPA.style.display = "block";
  } else if (ruta == "/estadisticas") {
    ESTADISTICAS.style.display = "block";
  }
}
function OcultarPantalla() {
  HOME.style.display = "none";
  LOGIN.style.display = "none";
  REGISTRO.style.display = "none";
  EJERCICIOS.style.display = "none";
  MIS.style.display = "none";
  MAPA.style.display = "none";
  ESTADISTICAS.style.display = "none";
}

function CerrarMenu() {
  MENU.close();
}

/* Calendario Actividades */
function confirm() {
  const input = document.querySelector("ion-input");
  modal = document.querySelector("ion-modal");
  modal.dismiss(input.value, "confirm");
}

// Formateo de fecha a formato ISO 8601 ayuda por parte de ChatGPT
let fecha = new Date();
let anio = fecha.getFullYear();
let mes = String(fecha.getMonth() + 1).padStart(2, "0");
let dia = String(fecha.getDate()).padStart(2, "0");

let hoy = `${anio}-${mes}-${dia}T14:48:00.000Z`;
function cargarCalendario() {
  dqs("#fechaActiv").innerHTML = `
  <ion-label>Fecha</ion-label>
  <ion-datetime-button id="dateEventoFecha" datetime="fechaEjercicio"></ion-datetime-button>
  <ion-modal>
    <ion-header>
      <ion-toolbar>
        <ion-title>Fecha</ion-title>
        <ion-buttons slot="end">
          <ion-button onclick="confirm()" strong="true">Confirmar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>  
    <ion-datetime presentation="date" id="fechaEjercicio" value="${hoy}" max="${hoy}"></ion-datetime>
  </ion-modal>`;
}
/* Fin calendario Actividades */

/* Error
https://github.com/ionic-team/ionic-framework/issues/29499 */
async function CargarSliderRegistros() {
  PrenderLoading("Cargando componentes.");
  /* Soy dios */
  let sliderRegistros = document.querySelector("#sliderRegistros");

  if (sliderRegistros.children.length > 0) {
    location.reload();
  }

  let registros = await registrosFiltrados(localStorage.getItem("filtroRegistros"));
  let ret = "";

  for (let r of registros) {
    const actividad = await actividadById(r.idActividad);

    ret += `
      <ion-item-sliding>
        <ion-item>
        <ion-item slot="start">
          <ion-img class="imgRegistros"
          src="${UIMG + actividad.imagen + ".png"}"
          alt="${actividad.nombre}">
        </ion-item>
          <ion-label class="labelRegistros">
          ${actividad.nombre}, ${r.tiempo}(min), ${r.fecha}</ion-label>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option id="${
            r.id
          }" color="danger" onclick="eliminarRegistro('${
      r.id
    }')">Eliminar</ion-item-option>
        </ion-item-options>
      </ion-item-sliding>`;
  }

  dqs("#sliderRegistros").innerHTML = ret;
  loading.dismiss();
}

async function eliminarRegistro(idRegistro) {
  let ret = await dropRegistro(idRegistro);
  location.reload();
}
async function dropRegistro(id) {
  let ret = false;
  let response = fetch(`${URL_BASE}/registros.php?idRegistro=${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      iduser: localStorage.getItem("id"),
      apikey: localStorage.getItem("token"),
    },
  });
  if ((await response).json().status == 200) {
    ret = true;
  }
  return ret;
}
async function actividadById(id) {
  await cargarActividades();
  let ret = null;

  actividades.forEach((a) => {
    if (a.id == id) {
      ret = a;
    }
  });
  return ret;
}
function filtroRegistro(condicion){
  localStorage.setItem("filtroRegistros", condicion);
  location.reload();
  
}
async function registrosFiltrados(c) {
  let ret = [];
  let registros = await obtenerRegistros();
  let fechaHaceUnaSemana = new Date();
  fechaHaceUnaSemana.setDate(fechaHaceUnaSemana.getDate() - 8);
  let fechaHaceUnMes = new Date();
  fechaHaceUnMes.setDate(fechaHaceUnMes.getDate() - 32);
  switch (c) {
    case "3":
      ret = registros;
      break;
    case "1":
      registros.forEach((r) => {
        if (Date.parse(r.fecha) >= fechaHaceUnaSemana) {
          ret.push(r);
          
        }
      });
      break;
    case "2":
      registros.forEach((r) => {
        if (Date.parse(r.fecha) >= fechaHaceUnMes) {
          ret.push(r);
        }
      });
      break;
      case "4":
      registros.forEach((r) => {
        if (Date.parse(r.fecha) == hoy) {
          ret.push(r);
        }
      });
      break;
      default:
      ret = registros;
      break;
  }
  return ret;
}

async function obtenerRegistros() {
  let ret = fetch(
    `${URL_BASE}/registros.php?idUsuario=${localStorage.getItem("id")}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        iduser: localStorage.getItem("id"),
        apikey: localStorage.getItem("token"),
      },
    }
  );

  if ((await ret).status) {
    ret = (await ret).json();
  } else {
    MostrarToast("No se pudieron obtener los registros.", 3000);
  }

  return (await ret).registros;
}

async function obtenerTiempo(t){
  let tiempo = 0;
  if(t == 1){ 
    let registros = await registrosFiltrados(4);
    for (let r of registros) {
      tiempo += (await r).tiempo;
    }
  }else{
    let registros = await registrosFiltrados(3);
    for (let r of registros) {
      tiempo += (await r).tiempo;
    }
  }
  return tiempo; 
}