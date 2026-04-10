document.addEventListener("DOMContentLoaded", function(){

let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

let fechaSeleccionada = null;

const calendar = new FullCalendar.Calendar(document.getElementById("calendar"),{

initialView:"dayGridMonth",
locale:"es",

dateClick:function(info){

fechaSeleccionada = info.dateStr;

document.getElementById("modal").style.display="flex";

},

datesSet:function(){

actualizarTotal();

},

eventContent:function(arg){

return{html:arg.event.title};

}

});

calendar.render();

eventos.forEach(e=>{

calendar.addEvent({
title:e.texto,
start:e.fecha
});

});

function convertirAMinutos(h){

const partes = h.split(":");

return partes[0]*60 + parseInt(partes[1]);

}

function calcularExtra(salida){

const salidaMin = convertirAMinutos(salida);

const corteInicio = convertirAMinutos("12:15");
const corteFin = convertirAMinutos("15:30");
const salidaNormal = convertirAMinutos("19:30");

let extra = 0;

if(salidaMin>corteInicio && salidaMin<corteFin){

extra = salidaMin - corteInicio;

}

else if(salidaMin>salidaNormal){

extra = salidaMin - salidaNormal;

}

return extra;

}

document.getElementById("guardar").onclick=function(){

const salida = document.getElementById("horaSalida").value;
const motivo = document.getElementById("motivo").value;

if(!salida) return;

const extraMin = calcularExtra(salida);

if(extraMin<=0){

cerrarModal();
return;

}

const h = Math.floor(extraMin/60);
const m = extraMin%60;

const texto =
"<small>"+salida+"</small><br>"+
"<b>+"+h+"h "+m+"m</b><br>"+
"<small>"+motivo+"</small>";

const evento={

fecha:fechaSeleccionada,
texto:texto,
minutos:extraMin

};

eventos.push(evento);

localStorage.setItem("eventos",JSON.stringify(eventos));

calendar.addEvent({

title:texto,
start:fechaSeleccionada

});

actualizarTotal();

cerrarModal();

};

function actualizarTotal(){

const fechaCalendario = calendar.getDate();

const mes = fechaCalendario.getMonth();
const anio = fechaCalendario.getFullYear();

let total=0;

eventos.forEach(e=>{

const f = new Date(e.fecha);

if(f.getMonth()===mes && f.getFullYear()===anio){

total+=e.minutos;

}

});

const h=Math.floor(total/60);
const m=total%60;

document.getElementById("total").innerText=
"Horas extra del mes: "+h+"h "+m+"m";

}

document.getElementById("cancelar").onclick=cerrarModal;

function cerrarModal(){

document.getElementById("modal").style.display="none";

document.getElementById("horaSalida").value="";
document.getElementById("motivo").value="";

}

document.getElementById("borrar").onclick=function(){

const confirmar = confirm("¿Borrar horas de este mes?");
if(!confirmar) return;

const fechaCalendario = calendar.getDate();
const mes = fechaCalendario.getMonth();
const anio = fechaCalendario.getFullYear();

eventos = eventos.filter(e=>{

const f=new Date(e.fecha);

return !(f.getMonth()===mes && f.getFullYear()===anio);

});

localStorage.setItem("eventos",JSON.stringify(eventos));

calendar.getEvents().forEach(e=>e.remove());

eventos.forEach(e=>{

calendar.addEvent({

title:e.texto,
start:e.fecha

});

});

actualizarTotal();

};

});