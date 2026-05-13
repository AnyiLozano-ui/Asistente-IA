const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

const recognition = new SpeechRecognition()

recognition.lang = 'es-ES'
recognition.continuous = false
recognition.interimResults = false

let modo = ''
let palabraActual = ''
let silabasActuales = ''
let respuestaCorrecta = 0
let puntaje = 0
let intentos = 0
let escuchando = false
let vozMujer = null
let silabaActual = null
let juegoActual = null

const palabrasXimena = [
    { palabra: 'dado', silabas: 'da-do', nivel: 1 },
    { palabra: 'dedo', silabas: 'de-do', nivel: 1 },
    { palabra: 'bota', silabas: 'bo-ta', nivel: 1 },
    { palabra: 'vaca', silabas: 'va-ca', nivel: 1 },
    { palabra: 'taza', silabas: 'ta-za', nivel: 1 },
    { palabra: 'ventana', silabas: 'ven-ta-na', nivel: 2 },
    { palabra: 'tomate', silabas: 'to-ma-te', nivel: 2 },
    { palabra: 'abuela', silabas: 'a-bue-la', nivel: 2 },
    { palabra: 'brazo', silabas: 'bra-zo', nivel: 3 },
    { palabra: 'bravo', silabas: 'bra-vo', nivel: 3 },
    { palabra: 'blusa', silabas: 'blu-sa', nivel: 3 },
    { palabra: 'tabla', silabas: 'ta-bla', nivel: 3 },
    { palabra: 'tren', silabas: 'tren', nivel: 3 },
    { palabra: 'trapo', silabas: 'tra-po', nivel: 3 },
    { palabra: 'dragón', silabas: 'dra-gón', nivel: 3 },
    { palabra: 'piedra', silabas: 'pie-dra', nivel: 3 },
]

const silabasJuego = [
    { silabas: ['bra', 'zo'], palabra: 'brazo' },
    { silabas: ['tra', 'po'], palabra: 'trapo' },
    { silabas: ['ta', 'bla'], palabra: 'tabla' },
    { silabas: ['dra', 'gón'], palabra: 'dragón' },
    { silabas: ['pie', 'dra'], palabra: 'piedra' },
    { silabas: ['blu', 'sa'], palabra: 'blusa' },
]

const juegoPalabras = [
    { correcta: 'vaca', emoji: '🐄', opciones: ['vaca', 'taza', 'baca'] },
    { correcta: 'tren', emoji: '🚂', opciones: ['tren', 'tres', 'trapo'] },
    { correcta: 'brazo', emoji: '💪', opciones: ['brazo', 'braso', 'vaso'] },
    { correcta: 'tomate', emoji: '🍅', opciones: ['tomate', 'camote', 'tomete'] },
]

function cargarVoz() {
    const voces = speechSynthesis.getVoices()

    vozMujer =
        voces.find(v => v.name.toLowerCase().includes('google español')) ||
        voces.find(v => v.name.toLowerCase().includes('helena')) ||
        voces.find(v => v.name.toLowerCase().includes('maria')) ||
        voces.find(v => v.lang.toLowerCase().includes('es')) ||
        voces[0]
}

speechSynthesis.onvoiceschanged = cargarVoz
cargarVoz()

function hablar(texto, callback = null) {
    try {
        recognition.stop()
    } catch (e) {}

    speechSynthesis.cancel()

    const voz = new SpeechSynthesisUtterance(texto)
    voz.lang = 'es-ES'
    voz.rate = 0.9
    voz.pitch = 1
    voz.volume = 1

    if (vozMujer) {
        voz.voice = vozMujer
    }

    voz.onend = () => {
        try {
            recognition.start()
            escuchando = true
        } catch (e) {}

        if (callback) callback()
    }

    speechSynthesis.speak(voz)
}

function iniciarMicrofono() {
    if (!escuchando) {
        try {
            recognition.start()
            escuchando = true
        } catch (e) {}
    }
}

function limpiarJuegoOpciones() {
    const contenedor = document.getElementById('juegoOpciones')
    if (contenedor) {
        contenedor.innerHTML = ''
    }
}

function reiniciarJuego(nuevoModo) {
    modo = nuevoModo
    puntaje = 0
    intentos = 0

    document.getElementById('puntaje').textContent = '⭐ Puntaje: 0'
    document.getElementById('respuesta').textContent = ''

    limpiarJuegoOpciones()
    iniciarMicrofono()
}

function abrirActividad(tipo) {
    document.getElementById('menu').classList.remove('active')
    document.getElementById('logros').classList.remove('active')
    document.getElementById('actividad').classList.add('active')

    document.getElementById('respuesta').textContent = ''
    document.getElementById('puntaje').textContent = '⭐ Puntaje: 0'

    limpiarJuegoOpciones()

    if (tipo === 'pronunciacion') {
        document.getElementById('tituloActividad').textContent =
            '🗣️ Pronunciación'
        iniciarPronunciacion()
    }

    if (tipo === 'silabas') {
        document.getElementById('tituloActividad').textContent =
            '🔤 Sílabas'
        iniciarSilabas()
    }

    if (tipo === 'tablas') {
        document.getElementById('tituloActividad').textContent =
            '✖️ Tablas de multiplicar'
        iniciarTablas()
    }

    if (tipo === 'matematicas') {
        document.getElementById('tituloActividad').textContent =
            '➕➖ Sumas y restas'
        iniciarSumasRestas()
    }

    if (tipo === 'juego') {
        document.getElementById('tituloActividad').textContent =
            '🎮 Atrapa la palabra'
        iniciarJuego()
    }
}

function abrirLogros() {
    document.getElementById('menu').classList.remove('active')
    document.getElementById('actividad').classList.remove('active')
    document.getElementById('logros').classList.add('active')
}

function volverMenu() {
    modo = ''
    escuchando = false

    try {
        recognition.stop()
    } catch (e) {}

    speechSynthesis.cancel()
    limpiarJuegoOpciones()

    document.getElementById('actividad').classList.remove('active')
    document.getElementById('logros').classList.remove('active')
    document.getElementById('menu').classList.add('active')
}

function iniciarPronunciacion() {
    reiniciarJuego('pronunciacion')

    hablar('Hola Ximena, vamos a practicar palabras y sílabas', () => {
        nuevaPalabra()
    })
}

function iniciarSilabas() {
    reiniciarJuego('silabas')

    hablar('Hola Ximena. Vamos a unir sílabas', () => {
        nuevaSilaba()
    })
}

function iniciarTablas() {
    reiniciarJuego('tablas')

    hablar('Hola Ximena, vamos a practicar tablas de multiplicar', () => {
        nuevaTabla()
    })
}

function iniciarSumasRestas() {
    reiniciarJuego('matematicas')

    hablar('Hola Ximena, vamos a practicar sumas y restas', () => {
        nuevaOperacion()
    })
}

function iniciarJuego() {
    reiniciarJuego('juego')

    hablar('Hola Ximena. Vamos a jugar atrapa la palabra', () => {
        nuevoJuego()
    })
}

function nuevaPalabra() {
    intentos = 0

    const item =
        palabrasXimena[Math.floor(Math.random() * palabrasXimena.length)]

    palabraActual = item.palabra
    silabasActuales = item.silabas

    document.getElementById('pregunta').innerHTML =
        `🌟 Nivel ${item.nivel}<br><br>
         👂 Escucha: <strong>${silabasActuales}</strong><br><br>
         🎤 Ahora pronuncia:<br>
         <span style="font-size: 45px;">${palabraActual}</span>`

    hablar(
        `Escucha despacio Ximena. ${silabasActuales}. Ahora di la palabra ${palabraActual}`
    )
}

function nuevaSilaba() {
    intentos = 0

    silabaActual =
        silabasJuego[Math.floor(Math.random() * silabasJuego.length)]

    document.getElementById('pregunta').innerHTML =
        `🔤 Une las sílabas 🔤<br><br>
        <span style="font-size:70px;color:#ff4fa3;">
            ${silabaActual.silabas[0]}
        </span>
        +
        <span style="font-size:70px;color:#7c3aed;">
            ${silabaActual.silabas[1]}
        </span>`

    hablar(
        `${silabaActual.silabas[0]} ... ${silabaActual.silabas[1]}. ¿Qué palabra forman?`
    )
}

function nuevaTabla() {
    intentos = 0

    const tabla = Math.floor(Math.random() * 10) + 1
    const multiplicador = Math.floor(Math.random() * 10) + 1

    respuestaCorrecta = tabla * multiplicador

    document.getElementById('pregunta').innerHTML =
        `✖️ Tabla del ${tabla}<br><br>
         ¿Cuánto es ${tabla} por ${multiplicador}?`

    hablar(
        `Ximena, estamos en la tabla del ${tabla}. ¿Cuánto es ${tabla} por ${multiplicador}?`
    )
}

function nuevaOperacion() {
    intentos = 0

    const numero1 = Math.floor(Math.random() * 20) + 1
    const numero2 = Math.floor(Math.random() * 20) + 1
    const esSuma = Math.random() > 0.5

    if (esSuma) {
        respuestaCorrecta = numero1 + numero2

        document.getElementById('pregunta').innerHTML =
            `➕ Suma<br><br>¿Cuánto es ${numero1} más ${numero2}?`

        hablar(`Ximena, ¿cuánto es ${numero1} más ${numero2}?`)
    } else {
        const mayor = Math.max(numero1, numero2)
        const menor = Math.min(numero1, numero2)

        respuestaCorrecta = mayor - menor

        document.getElementById('pregunta').innerHTML =
            `➖ Resta<br><br>¿Cuánto es ${mayor} menos ${menor}?`

        hablar(`Ximena, ¿cuánto es ${mayor} menos ${menor}?`)
    }
}

function nuevoJuego() {
    intentos = 0

    juegoActual =
        juegoPalabras[Math.floor(Math.random() * juegoPalabras.length)]

    document.getElementById('pregunta').innerHTML =
        `🎮 Atrapa la palabra correcta<br><br>
         👂 Escucha atentamente`

    const opcionesHTML =
        juegoActual.opciones.map(opcion => `
            <button class="option" onclick="validarJuego('${opcion}')">
                <span>${juegoActual.emoji}</span>
                ${opcion}
            </button>
        `).join('')

    document.getElementById('juegoOpciones').innerHTML = opcionesHTML

    hablar(`Ximena, selecciona la palabra ${juegoActual.correcta}`)
}

function validarJuego(opcion) {
    if (opcion === juegoActual.correcta) {
        puntaje++

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar('Muy bien Ximena. Encontraste la palabra correcta', () => {
            setTimeout(() => {
                nuevoJuego()
            }, 2000)
        })
    } else {
        hablar('Casi Ximena. Intenta otra vez')
    }
}

recognition.onresult = function(event) {
    const texto =
        event.results[0][0].transcript.toLowerCase().trim()

    document.getElementById('respuesta').textContent =
        '🗣️ Ximena dijo: ' + texto

    if (modo === 'pronunciacion') {
        validarPronunciacion(texto)
    }

    if (modo === 'silabas') {
        validarSilabas(texto)
    }

    if (modo === 'tablas' || modo === 'matematicas') {
        validarMatematicas(texto)
    }
}

function validarPronunciacion(texto) {
    const correcta = palabraActual.toLowerCase()

    if (texto.includes(correcta)) {
        puntaje++
        intentos = 0

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar(`Muy bien Ximena. Dijiste correctamente ${palabraActual}`, () => {
            setTimeout(nuevaPalabra, 2000)
        })
    } else {
        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje =
                `Casi Ximena. Escucha por sílabas. ${silabasActuales}. Ahora di ${palabraActual}`
        } else if (intentos === 2) {
            mensaje =
                `Vamos despacio. Primero escucha. ${silabasActuales}. Ahora repite la palabra ${palabraActual}`
        } else {
            mensaje =
                `No pasa nada Ximena. Seguimos con la misma palabra. ${palabraActual}. Repítela lentamente`
        }

        hablar(mensaje)
    }
}

function validarSilabas(texto) {
    const correcta = silabaActual.palabra.toLowerCase()

    if (texto.includes(correcta)) {
        puntaje++

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar(`Muy bien Ximena. La palabra era ${correcta}`, () => {
            setTimeout(nuevaSilaba, 2000)
        })
    } else {
        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje = 'Casi Ximena. Escucha otra vez'
        } else if (intentos === 2) {
            mensaje =
                `Las sílabas son ${silabaActual.silabas[0]} y ${silabaActual.silabas[1]}`
        } else {
            mensaje =
                `La palabra correcta era ${correcta}. Vamos con otra`
        }

        hablar(mensaje, () => {
            if (intentos >= 3) {
                setTimeout(nuevaSilaba, 2000)
            } else {
                setTimeout(() => {
                    hablar(
                        `${silabaActual.silabas[0]} ... ${silabaActual.silabas[1]}. ¿Qué palabra forman?`
                    )
                }, 1000)
            }
        })
    }
}

function validarMatematicas(texto) {
    const numeroUsuario = convertirTextoANumero(texto)

    if (numeroUsuario === respuestaCorrecta) {
        puntaje++
        intentos = 0

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar('Muy bien Ximena. Contestaste correctamente', () => {
            setTimeout(() => {
                if (modo === 'tablas') nuevaTabla()
                else nuevaOperacion()
            }, 2000)
        })
    } else {
        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje = 'Casi Ximena. Intenta nuevamente'
        } else if (intentos === 2) {
            mensaje =
                'Vamos Ximena. Escucha bien y vuelve a responder'
        } else {
            mensaje =
                'No pasa nada Ximena. Vamos a repetir el ejercicio'
        }

        hablar(mensaje, () => {
            setTimeout(() => {
                hablar(document.getElementById('pregunta').innerText)
            }, 1000)
        })
    }
}

function convertirTextoANumero(texto) {
    texto = texto.toLowerCase().trim()

    const numeros = {
        cero: 0,
        uno: 1,
        una: 1,
        dos: 2,
        tres: 3,
        cuatro: 4,
        cinco: 5,
        seis: 6,
        siete: 7,
        ocho: 8,
        nueve: 9,
        diez: 10,
        once: 11,
        doce: 12,
        trece: 13,
        catorce: 14,
        quince: 15,
        dieciseis: 16,
        dieciséis: 16,
        diecisiete: 17,
        dieciocho: 18,
        diecinueve: 19,
        veinte: 20,
        veintiuno: 21,
        veintidós: 22,
        veintidos: 22,
        treinta: 30,
        cuarenta: 40,
        cincuenta: 50,
        sesenta: 60,
        setenta: 70,
        ochenta: 80,
        noventa: 90,
        cien: 100,
    }

    const numeroDirecto = texto.match(/\d+/)
    if (numeroDirecto) return Number(numeroDirecto[0])

    for (const palabra in numeros) {
        if (texto.includes(palabra)) {
            return numeros[palabra]
        }
    }

    return null
}

recognition.onerror = function(event) {
    console.log('Error:', event.error)
}

recognition.onend = function() {
    if (escuchando) {
        try {
            recognition.start()
        } catch (e) {}
    }
}