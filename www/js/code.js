const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const EJERCICIOS = document.querySelector("#pantalla-registrar-ejercicio");
const URL_BASE = "https://movetrack.develotion.com/";

Inicio();
function Inicio(){
    Eventos();
    ArmarMenu();
}


function ArmarMenu(){
    let hayToken = localStorage.getItem("token");

    let cadena = `<ion-item onclick="CerrarMenu()" href="/">Home</ion-item>`;
    if(hayToken){
        cadena += 
        `
            <ion-item onclick="CerrarMenu()" href="/registrar-ejercicio">Registrar Ejercicio</ion-item>
            <ion-item onclick="CerrarSesion()">Cerrar Sesión</ion-item>
        `
    }else{
        cadena += 
        `
            <ion-item onclick="CerrarMenu()" href="/login">Login</ion-item>
            <ion-item onclick="CerrarMenu()" href="/registro">Registro</ion-item>
        `
    }
    document.querySelector("#menu-opciones").innerHTML = cadena;
}


function Eventos(){
    ROUTER.addEventListener('ionRouteDidChange', Navegar);
    document.querySelector("#btnRegistro").addEventListener('click', TomarDatosRegistro);
    document.querySelector("#btnLogin").addEventListener('click', TomarDatosLogin);
    document.querySelector("#btnGuardarEjercicio").addEventListener('click', GuardarEjercicio);

    document.querySelector("#menu").addEventListener("ionDidOpen", () => {
        document.querySelector("#menu").removeAttribute("aria-hidden");
    });
    document.querySelector("#menu").addEventListener("ionDidClose", () => {
        document.querySelector("#menu").setAttribute("aria-hidden", "true");
    });

    document.addEventListener("DOMContentLoaded", CargarActividades);
    
}
function TomarDatosRegistro(){
    let nom = document.querySelector("#txtRegistroNombre").value;
    let pai = document.querySelector("#txtRegistroPais").value;
    let pas = document.querySelector("#txtRegistroPassword").value;

    let mensajeError = "";

    if(!nom || !pas || !pai){
        mensajeError = "Todos los campos son obligatorios.";
    }else if(pas.length < 6){
        mensajeError = "La contraseña debe tener al menos 6 caracteres";
    }

    if(mensajeError){
        document.querySelector("#label-respuesta-registro").innerHTML = mensajeError;
        return;
    }

    let usuario = new Object();
    usuario.nombre = nom;
    usuario.pais = pai;
    usuario.password = pas;
    
    fetch(`${URL_BASE}usuarios.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario),
    })
    .then(function(response){
        console.log(response);
        return response.json();
    })
    .then(function(data){
        console.log(data);

        if(data.error === ""){
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuarioId", data.id);
            document.querySelector("#label-respuesta-registro").innerHTML = "Alta Correcta"
        }else{
            document.querySelector("#label-respuesta-registro").innerHTML = data.error;
        }
    })
    .catch(error => console.error("Error en la solicitud: ", error));
}
function TomarDatosLogin(){
    let nom = document.querySelector("#txtLoginNombre").value;
    let pas = document.querySelector("#txtLoginPassword").value;

    let mensajeError = "";
    if(!nom || !pas){
        mensajeError = "Todos los campos son obligatorios.";
    }
    if(mensajeError){
        document.querySelector("#label-respuesta-login").innerHTML = mensajeError;
        return;
    }

    let usuarioEncontrado ={
        usuario: nom, 
        password: pas 
    };

    fetch(`${URL_BASE}login.php`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioEncontrado),
    })
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if(data.codigo === 200 && data.apiKey){
            localStorage.setItem("token", data.apiKey);
            localStorage.setItem("usuarioId", data.id);
            document.querySelector("#label-respuesta-login").innerHTML = "Inicio de sesión exitoso.";
            setTimeout(() => window.location.href = "/", 1500);
        }else{
            document.querySelector("#label-respuesta-login").innerHTML = "Usuario o contraseña incorrectos.";
        }
    })
    .catch(error => console.error("Error en la solicitud:", error));
}


function GuardarEjercicio(){
    let act = document.querySelector("#selectActividad").value;
    let tie = document.querySelector("#txtTiempo").value;
    let fec = document.querySelector("#fechaEjercicio").value;

    let mensajeError = "";

    if(!act || !tie || !fec){
        mensajeError = "Todos los campos son obligatorios.";
    }else if(tie <= 0){
        mensajeError = "El tiempo debe ser mayor a 0.";
    }
    if(mensajeError){
        document.querySelector("#label-respuesta-ejercicio").innerHTML = mensajeError;
        return;
    }

    let ejercicio = new Object();
    ejercicio.usuarioId = localStorage.getItem("usuarioId");
    ejercicio.actividadId = act;
    ejercicio.tiempo = tie;
    ejercicio.fecha = fec;

    console.log("Ejercicio guardado:", ejercicio);
}
function CargarActividades(){
    let token = localStorage.getItem("token");
    
    fetch(`${URL_BASE}actividades.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        let select = document.querySelector("#selectActividad");
        select.innerHTML = "";

        if(data.actividades && data.actividades.length > 0){
            data.actividades.forEach(actividad => {
                let option = document.querySelector("#ion-select-option");
                option.value = actividad.id;
                option.textContent = actividad.nombre;
                select.appendChild(option);
            });
        }else{
            console.error("No se encontraron actividades en la api.");
        }
    })
    .catch(error => console.error("Error al cargar actividades: ", error));
}


function CerrarSesion(){
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioId");
    document.querySelector("#label-respuesta-login").innerHTML = "Sesión cerrada.";

    window.location.href = "/";
    ArmarMenu();
}


function Navegar(evt){
    OcultarPantalla();
    console.log(evt);
    const ruta = evt.detail.to;
    let hayToken = localStorage.getItem("token");

    if(ruta == "/"){
        HOME.style.display = "block";
    }else if(ruta == "/login"){
        LOGIN.style.display = "block";
    }else if(ruta == "/registro"){
        REGISTRO.style.display = "block";
    }else if(ruta == "/registrar-ejercicio"){
        EJERCICIOS.style.display = "block";
    }
}
function OcultarPantalla(){
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    EJERCICIOS.style.display = "none";
}


function CerrarMenu(){
    MENU.close();
}