const EJERCICIOS = dqs("#pantalla-registrar-ejercicio");
const URL_BASE = "https://movetrack.develotion.com/";
const ESTADISTICAS = dqs("#pantalla-estadisticas");
const UIMG = "https://movetrack.develotion.com/imgs/";
const REGISTRO = dqs("#pantalla-registro");
const MIS = dqs("#pantalla-mis-registros");
const HOME = dqs("#pantalla-home");
const MAPA = dqs("#pantalla-mapa");
const LOGIN = dqs("#pantalla-login");
const ROUTER = dqs("#ruteo");
const MENU = dqs("#menu");
const nav = dqs("ion-nav");
let actividades = null;
let modal = null;
Inicio();

function dqs(id) {
  return document.querySelector(`${id}`);
}

let MiLat = null;
let MiLong = null;
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
  dqs("#menu-opciones").innerHTML = cadena;
}
function CerrarMenu() {
  MENU.close();
}

function Navegar(evt) {
  OcultarPantalla();
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
    cargarMapa();
    MAPA.style.display = "block";
  } else if (ruta == "/estadisticas") {
    ESTADISTICAS.style.display = "block";
    cargarTiempos();
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

function Eventos() {
  ROUTER.addEventListener("ionRouteDidChange", Navegar);

  dqs("#btnRegistro").addEventListener("click", TomarDatosRegistro);
  dqs("#btnLogin").addEventListener("click", TomarDatosLogin);
  dqs("#btnGuardarEjercicio").addEventListener("click", GuardarEjercicio);

  dqs("#menu").addEventListener("ionDidOpen", () => {
    dqs("#menu").removeAttribute("aria-hidden");
  });
  dqs("#menu").addEventListener("ionDidClose", () => {
    dqs("#menu").setAttribute("aria-hidden", "true");
  });
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

/* TODO LO NECESARIO PARA LA PANTALLA DE REGISTRARSE */
let paises = null;
async function cargarSelectPaises() {
  PrenderLoading("Cargando Componentes");
  await cargarPaises();

  let res = "";
  paises.forEach((p) => {
    res += `<ion-select-option value="${p.id}">${p.name}</ion-select-option>`;
  });
  dqs("#selectPaises").innerHTML = res;
  loading.dismiss();
}
async function TomarDatosRegistro() {
  let nom = dqs("#txtRegistroNombre").value;
  let pai = dqs("#selectPaises").value;
  let pas = dqs("#txtRegistroPassword").value;
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

/* TODO LO NECESARIO PARA LA PANTALLA DE LOGIN */
async function TomarDatosLogin() {
  let nom = dqs("#txtLoginNombre").value;
  let pas = dqs("#txtLoginPassword").value;
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

  PrenderLoading("Comprobando datos");
  let respuesta = await comprobarUsuario(usuarioEncontrado);
  loading.dismiss();
  if (respuesta.codigo == 200) {
    nav.push("page-home");
    MostrarToast("Datos correcto, redirigiendo", 3000);
    localStorage.setItem("token", respuesta.apiKey);
    localStorage.setItem("id", respuesta.id);
    ArmarMenu();
  } else {
    MostrarToast("Usuario o contraseña incorrrectos", 3000);
  }
}
async function comprobarUsuario(l) {
  let res = "";
  response = await fetch(`${URL_BASE}login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(l),
  });
  res = await response.json();
  return res;
}

/* TODO LO NECESARIO PARA LA PANTALLA DE REGISTRAR EJERCICIOS*/
async function GuardarEjercicio() {
  let act = dqs("#selectActividades").value;
  let tie = dqs("#timeActividades").value;
  let fec = dqs("#fechaEjercicio").value;
  let mensajeError = "";

  if (!act || !tie || !fec) {
    mensajeError = "Todos los campos son obligatorios.";
  } else if (tie <= 0) {
    mensajeError = "El tiempo debe ser mayor a 0.";
  }
  if (mensajeError) {
    MostrarToast(mensajeError, 3000);
  } else {
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
// Inicio Calendario Actividades //
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
// Fin Calendario Actividades //

/* TODO LO NECESARIO PARA LA PANTALLA DE MIS REGISTROS */
// Error
// https://github.com/ionic-team/ionic-framework/issues/29499
async function CargarSliderRegistros() {
  PrenderLoading("Cargando componentes.");
  /* Soy dios */
  let sliderRegistros = dqs("#sliderRegistros");

  if (sliderRegistros.children.length > 0) {
    location.reload();
  }
  cargarlistButtonsRegistros();
  let registros = await registrosFiltrados(
    localStorage.getItem("filtroRegistros")
  );
  let error = false;
  let ret = "";
  for (let r of registros) {
    if(r.idActividad != 0 || r.idActividad == null || r.idActividad == undefined){
      const actividad = await actividadById(r.idActividad);
      /* 
        <ion-item>
          <ion-thumbnail slot="start">
            <img 
              src="${UIMG + actividad.imagen + ".png"}" 
              alt="${actividad.nombre}"
            >
          </ion-thumbnail>
          <ion-label>
            <p>${actividad.nombre} / ${r.tiempo}(min) / ${r.fecha}</p>
          </ion-label>
        </ion-item>
      */
      ret += `
        <ion-item-sliding>
          <ion-item>
            <ion-item slot="start" style="margin-right: 10px;">
              <ion-img class="imgRegistros"
                src="${UIMG + actividad.imagen + ".png"}"
                alt="${actividad.nombre}"
                style="width: 50px; height: 50px;"
              >
            </ion-item>
            <ion-label class="labelRegistros" style="margin-left: 10px;">
              ${actividad.nombre} / ${r.tiempo}(min) / ${r.fecha}
            </ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option 
              id="${r.id}" 
              color="danger" 
              onclick="eliminarRegistro('${r.id}')"
            > 
            Eliminar
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      `;
    }else{
      error = true
    }
  }
  dqs("#sliderRegistros").innerHTML = ret;
  if(error){
    MostrarToast("Algunas actividades no pudieron ser cargadas", 3000);
  }
  loading.dismiss();
}
function cargarlistButtonsRegistros() {
  let ret = "";
  if (localStorage.getItem("filtroRegistros") == 1) {
    ret = `
      <ion-button onclick="filtroRegistro(3)" color="primary">Completo</ion-button>
      <ion-button onclick="filtroRegistro(2)" color="primary">Mes</ion-button>
      <ion-button onclick="filtroRegistro(1)" color="success">Semana</ion-button>
    `;
  } else if (localStorage.getItem("filtroRegistros") == 2) {
    ret = `
      <ion-button onclick="filtroRegistro(3)" color="primary">Completo</ion-button>
      <ion-button onclick="filtroRegistro(2)" color="success">Mes</ion-button>
      <ion-button onclick="filtroRegistro(1)" color="primary">Semana</ion-button>
    `;
  } else {
    ret = `
      <ion-button onclick="filtroRegistro(3)" color="success">Completo</ion-button>
      <ion-button onclick="filtroRegistro(2)" color="primary">Mes</ion-button>
      <ion-button onclick="filtroRegistro(1)" color="primary">Semana</ion-button>
    `;
  }
  dqs("#listButtonsRegistros").innerHTML = ret;
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
function filtroRegistro(condicion) {
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
    case "3": // todos los registros
      ret = registros;
      break;
    case "1": // ultima semana
      registros.forEach((r) => {
        if (Date.parse(r.fecha) >= fechaHaceUnaSemana) {
          ret.push(r);
        }
      });
      break;
    case "2": // ultimo mes
      registros.forEach((r) => {
        if (Date.parse(r.fecha) >= fechaHaceUnMes) {
          ret.push(r);
        }
      });
      break;
    case "4": // hoy
      registros.forEach((r) => {
        if (r.fecha == hoy.toString().split("T")[0]) {
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

/* TODO LO NECESARIO PARA LA PANTALLA DE MIS ESTADISTICAS */
async function obtenerTiempo() {
  let tiempoTotal = 0;
  let tiempoDiario = 0;
  let registros = await obtenerRegistros();

  for (let r of registros) {
    tiempoTotal += r.tiempo;
  }
  for (let r of registros) {
    if (r.fecha == hoy.toString().split("T")[0]) {
      tiempoDiario += r.tiempo;
    }
  }
  return [tiempoTotal, tiempoDiario];
}
async function cargarTiempos() {
  PrenderLoading("Cargando estadisticas.");
  let tiempo = await obtenerTiempo();
  let tiempoTotal = tiempo[0];
  let tiempoDiario = tiempo[1];

  let ret = `
    <ion-item>
      <ion-label>Tiempo Total:</ion-label>
      <ion-label>${tiempoTotal} min</ion-label>
    </ion-item>
    <ion-item>
      <ion-label>Tiempo Diario:</ion-label>
      <ion-label>${tiempoDiario} min</ion-label>
    </ion-item>
  `;
  dqs("#todasLasEstadisticas").innerHTML = ret;
  loading.dismiss();
}

/* TODO LO NECESARIO PARA LA PANTALLA DE MAPA */
async function cargarMapa() {
  PrenderLoading("Cargando componentes.");
  setTimeout(function () {
    CrearMapa();
  }, 1000);
}
let lat = -19.9;
let long = -58.1;
var map = null;
async function CrearMapa() {
  if (map != null) {
    map.remove();
  }
  map = L.map("map").setView([lat, long], 4);
  await cargarPersonasPais();
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 10,
    minZoom: 1,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  loading.dismiss();
  return map;
}
async function cargarPersonasPais() {
  let personas = await obtenerPersonasPorPaisValido();
  if (personas != null) {
    personas.forEach((p) => {
      let marcador = L.marker([p.latitude, p.longitude]);
      marcador.bindPopup(`
        <strong>
          ${p.name}
        </strong>
        <br>
        <span>
          Cantidad de usuarios: ${p.cantidadDeUsuarios}
        </span>
      `);
      marcador.addTo(map);
    });
  } else {
    MostrarToast("No se pueden cargar las personas por Pais.", 3000);
  }
}
async function obtenerPersonasPorPais() {
  let ret = null;

  ret = await fetch(`${URL_BASE}/usuariosPorPais.php`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      iduser: localStorage.getItem("id"),
      apikey: localStorage.getItem("token"),
    },
  });
  if (ret.status == 200) {
    ret = await ret.json();
    ret = ret.paises;
  }
  return ret;
}
async function obtenerPersonasPorPaisValido() {
  let personas = await obtenerPersonasPorPais();
  await cargarPaises();
  let ret = [];

  if (personas != null) {
    personas.forEach((p) => {
      paises.forEach((pa) => {
        if (pa.id == p.id) {
          Object.defineProperty(p, "latitude", { value: pa.latitude });
          Object.defineProperty(p, "longitude", { value: pa.longitude });
          ret.push(p);
        }
      });
    });
  }
  return ret;
}
async function cargarPaises() {
  if (paises == null) {
    paises = await fetch(`${URL_BASE}paises.php`);
    if (paises.status == 200) {
      paises = await paises.json();
      paises = paises.paises;
    } else {
      MostrarToast("No se pueden cargar los Paises.", 3000);
    }
  }
}

/* LO NECESARIO PARA CERRAR SESION */
function CerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioId");
  nav.push("page-home");
  MostrarToast("Sesión cerrada correctamente.", 3000);
  ArmarMenu();
}
