document.addEventListener('DOMContentLoaded', function () {

  const calendarEl = document.getElementById('calendar');

  // 🔁 Cargar datos guardados
  let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',

    dateClick: function(info) {
      const fecha = info.dateStr;

      const salida = prompt("Hora de salida (HH:MM):");
      const motivo = prompt("Motivo:");

      if (!salida) return;

      calcularHorasExtra(fecha, salida, motivo);
    },

    eventContent: function(arg) {
      return { html: arg.event.title };
    }

  });

  calendar.render();

document.getElementById("borrar").addEventListener("click", function() {

  const confirmar = confirm("¿Seguro que querés borrar todos los datos?");

  if (!confirmar) return;

  // 🧹 Vaciar array
  eventos = [];

  // 🗑 Borrar localStorage
  localStorage.removeItem("eventos");

  // 🗓 Limpiar calendario
  calendar.getEvents().forEach(e => e.remove());

  // 🔄 Resetear total
  actualizarTotal();
});

  // 🔁 Mostrar eventos guardados al iniciar
  eventos.forEach(e => {
    calendar.addEvent({
      title: e.texto,
      start: e.fecha
    });
  });

  actualizarTotal();


  function convertirAMinutos(hora) {
    const partes = hora.split(":");
    return parseInt(partes[0]) * 60 + parseInt(partes[1]);
  }


  function calcularHorasExtra(fecha, salidaReal, motivo) {

    const salidaMin = convertirAMinutos(salidaReal);

    const inicioCorte = convertirAMinutos("12:15");
    const finCorte = convertirAMinutos("15:30");
    const salidaNormal = convertirAMinutos("19:30");

    let extraMinutos = 0;

    if (salidaMin > inicioCorte && salidaMin < finCorte) {
      extraMinutos = salidaMin - inicioCorte;
    } else if (salidaMin > salidaNormal) {
      extraMinutos = salidaMin - salidaNormal;
    }

    if (extraMinutos <= 0) return;

    const horas = Math.floor(extraMinutos / 60);
    const minutos = extraMinutos % 60;

    const texto = "<b>+" + horas + "h " + minutos + "m</b><br><small>" + motivo + "</small>";

    guardarEvento(fecha, texto, motivo, extraMinutos);
  }


  function guardarEvento(fecha, texto, motivo, minutos) {

    const nuevoEvento = { fecha, texto, motivo, minutos };

    eventos.push(nuevoEvento);

    // 💾 GUARDAR EN LOCALSTORAGE
    localStorage.setItem("eventos", JSON.stringify(eventos));

    calendar.addEvent({
      title: texto,
      start: fecha
    });

    actualizarTotal();
  }


  function actualizarTotal() {

    let totalMin = 0;

    eventos.forEach(e => totalMin += e.minutos);

    const horas = Math.floor(totalMin / 60);
    const minutos = totalMin % 60;

    document.getElementById("total").innerText =
      "Horas extra del mes: " + horas + "h " + minutos + "m";
  }

});