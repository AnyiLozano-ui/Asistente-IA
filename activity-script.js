function obtenerParametroURL(parametro) {
    const params = new URLSearchParams(window.location.search)
    return params.get(parametro)
}

function aplicarColorActividad(colorClass) {
    const activityScreen = document.getElementById('actividad')
    activityScreen.classList.remove('pink', 'blue', 'purple', 'green', 'yellow', 'orange')
    activityScreen.classList.add(colorClass)
}

function volverMenu() {
    // Para matemáticas, siempre vuelve al selector
    if (typeof tipoOperacionActual !== 'undefined' && tipoOperacionActual) {
        if (typeof estadoMate !== 'undefined' && estadoMate === 'selector') {
            // Si estamos en el selector, cierra
            window.close()
        } else {
            // En cualquier otra parte, vuelve al selector
            mostrarSelectorOperacion()
        }
    }
    // Si estamos jugando una tabla específica, volver al selector
    else if (typeof tablaSeleccionada !== 'undefined' && tablaSeleccionada !== null) {
        tablaSeleccionada = null
        mostrarSelectorTablas()
    } else {
        // Si estamos en el selector o cualquier otra actividad, cerrar
        window.close()
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Dar tiempo para que se carguen completamente los eventos de voz
    setTimeout(() => {
        const tipo = obtenerParametroURL('tipo')
        const color = obtenerParametroURL('color')

        if (color) {
            aplicarColorActividad(color)
        }

        // Ocultar selector de tablas por defecto
        const selectorTablas = document.getElementById('selectorTablas')
        if (selectorTablas) {
            selectorTablas.style.display = 'none'
        }

        if (tipo === 'pronunciacion') {
            document.getElementById('tituloActividad').textContent = '🗣️ Pronunciación'
            iniciarPronunciacion()
        } else if (tipo === 'silabas') {
            document.getElementById('tituloActividad').textContent = '🔤 Sílabas'
            iniciarSilabas()
        } else if (tipo === 'tablas') {
            document.getElementById('tituloActividad').textContent = '✖️ Tablas de multiplicar'
            iniciarTablas()
        } else if (tipo === 'matematicas') {
            document.getElementById('tituloActividad').textContent = '➕➖ Sumas y restas'
            iniciarSumasRestas()
        } else if (tipo === 'juego') {
            document.getElementById('tituloActividad').textContent = '🎮 Atrapa la palabra'
            iniciarJuego()
        }
    }, 500)
})
