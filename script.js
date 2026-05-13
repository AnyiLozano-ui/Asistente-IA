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

function reiniciarJuego(nuevoModo) {
    modo = nuevoModo
    puntaje = 0
    intentos = 0

    document.getElementById('puntaje').textContent = '⭐ Puntaje: 0'
    document.getElementById('respuesta').textContent = ''

    iniciarMicrofono()
}

function iniciarPronunciacion() {
    reiniciarJuego('pronunciacion')

    hablar('Hola Ximena, vamos a practicar palabras y sílabas', () => {
        nuevaPalabra()
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

recognition.onresult = function(event) {
    const texto =
        event.results[0][0].transcript.toLowerCase().trim()

    document.getElementById('respuesta').textContent =
        '🗣️ Ximena dijo: ' + texto

    if (modo === 'pronunciacion') {
        validarPronunciacion(texto)
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

        document.getElementById('pregunta').innerHTML =
            `🎉 ¡Excelente Ximena!<br><br>
             Dijiste correctamente:<br>
             <span style="font-size: 45px;">${palabraActual}</span>`

        hablar(`Muy bien Ximena. Dijiste correctamente ${palabraActual}`, () => {
            setTimeout(nuevaPalabra, 2000)
        })
    } else {
        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje = `Casi Ximena. Escucha por sílabas. ${silabasActuales}. Ahora di ${palabraActual}`
        } else if (intentos === 2) {
            mensaje = `Vamos despacio. Primero escucha. ${silabasActuales}. Ahora repite la palabra ${palabraActual}`
        } else {
            mensaje = `No pasa nada Ximena. Seguimos con la misma palabra. ${palabraActual}. Repítela lentamente`
        }

        document.getElementById('pregunta').innerHTML =
            `🌟 Intenta nuevamente 🌟<br><br>
             👂 Sílabas: <strong>${silabasActuales}</strong><br><br>
             🎤 Palabra:<br>
             <span style="font-size: 45px;">${palabraActual}</span>`

        hablar(mensaje)
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
            mensaje = 'Vamos Ximena. Escucha bien y vuelve a responder'
        } else {
            mensaje = 'No pasa nada Ximena. Vamos a repetir el ejercicio'
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