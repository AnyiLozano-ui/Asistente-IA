const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

const recognition = new SpeechRecognition()

recognition.lang = 'es-ES'
recognition.continuous = false
recognition.interimResults = false

let modo = ''
let palabraActual = ''
let respuestaCorrecta = 0
let puntaje = 0
let intentos = 0
let escuchando = false
let vozMujer = null

const palabrasXimena = [
    'dado',
    'dedo',
    'día',
    'dama',
    'duende',
    'dormir',

    'bebé',
    'bota',
    'burro',
    'barco',
    'bola',
    'abuela',

    'vaca',
    'vaso',
    'vela',
    'verde',
    'volar',
    'ventana',

    'taza',
    'toro',
    'tela',
    'tigre',
    'torta',
    'tomate',

    'brazo',
    'bravo',
    'blusa',
    'tabla',
    'tren',
    'trapo',
    'tres',
    'drama',
    'dragón',
    'piedra',
    'abrigo',
]

function cargarVoz() {
    const voces = speechSynthesis.getVoices()

    vozMujer =
        voces.find(v =>
            v.name.toLowerCase().includes('google español')
        ) ||
        voces.find(v =>
            v.name.toLowerCase().includes('helena')
        ) ||
        voces.find(v =>
            v.name.toLowerCase().includes('maria')
        ) ||
        voces.find(v =>
            v.lang.toLowerCase().includes('es')
        ) ||
        voces[0]
}

speechSynthesis.onvoiceschanged = cargarVoz
cargarVoz()

function hablar(texto, callback = null) {

    // Detener micrófono mientras habla
    try {
        recognition.stop()
    } catch (e) {}

    speechSynthesis.cancel()

    const voz = new SpeechSynthesisUtterance(texto)

    voz.lang = 'es-ES'

    // Voz natural
    voz.rate = 1
    voz.pitch = 1
    voz.volume = 1

    if (vozMujer) {
        voz.voice = vozMujer
    }

    voz.onend = () => {

        // Reactivar micrófono
        try {
            recognition.start()
        } catch (e) {}

        if (callback) {
            callback()
        }
    }

    speechSynthesis.speak(voz)
}

function iniciarMicrofono() {
    if (!escuchando) {
        escuchando = true

        try {
            recognition.start()
        } catch (e) {
            console.log(e)
        }
    }
}

function reiniciarJuego(nuevoModo) {
    modo = nuevoModo
    puntaje = 0
    intentos = 0

    document.getElementById('puntaje').textContent =
        '⭐ Puntaje: 0'

    document.getElementById('respuesta').textContent = ''

    iniciarMicrofono()
}

function iniciarPronunciacion() {
    reiniciarJuego('pronunciacion')

    hablar(
        'Hola Ximena, vamos a practicar pronunciación',
        () => {
            setTimeout(() => {
                nuevaPalabra()
            }, 1500)
        }
    )
}

function iniciarTablas() {
    reiniciarJuego('tablas')

    hablar(
        'Hola Ximena, vamos a practicar tablas',
        () => {
            setTimeout(() => {
                nuevaTabla()
            }, 1500)
        }
    )
}

function iniciarSumasRestas() {
    reiniciarJuego('matematicas')

    hablar(
        'Hola Ximena, vamos a practicar sumas y restas',
        () => {
            setTimeout(() => {
                nuevaOperacion()
            }, 1500)
        }
    )
}

function nuevaPalabra() {
    intentos = 0

    palabraActual =
        palabrasXimena[
            Math.floor(Math.random() * palabrasXimena.length)
        ]

    document.getElementById('pregunta').innerHTML =
        `🌟 Pronuncia esta palabra 🌟<br><br>${palabraActual}`

    hablar(
        `Ximena, pronuncia la palabra ${palabraActual}`
    )
}

function nuevaTabla() {

    intentos = 0

    // Elegir tabla
    const tabla =
        Math.floor(Math.random() * 10) + 1

    // Número a multiplicar
    const multiplicador =
        Math.floor(Math.random() * 10) + 1

    respuestaCorrecta = tabla * multiplicador

    document.getElementById('pregunta').innerHTML =
        `✖️ Tabla del ${tabla}<br><br>
        ¿Cuánto es ${tabla} por ${multiplicador}?`

    hablar(
        `Ximena, estamos en la tabla del ${tabla}. 
        ¿Cuánto es ${tabla} por ${multiplicador}?`
    )
}

function nuevaOperacion() {
    intentos = 0

    const numero1 =
        Math.floor(Math.random() * 20) + 1

    const numero2 =
        Math.floor(Math.random() * 20) + 1

    const esSuma = Math.random() > 0.5

    if (esSuma) {
        respuestaCorrecta = numero1 + numero2

        document.getElementById('pregunta').innerHTML =
            `➕ Suma<br><br>¿Cuánto es ${numero1} más ${numero2}?`

        hablar(
            `Ximena, ¿cuánto es ${numero1} más ${numero2}?`
        )
    } else {

        const mayor = Math.max(numero1, numero2)
        const menor = Math.min(numero1, numero2)

        respuestaCorrecta = mayor - menor

        document.getElementById('pregunta').innerHTML =
            `➖ Resta<br><br>¿Cuánto es ${mayor} menos ${menor}?`

        hablar(
            `Ximena, ¿cuánto es ${mayor} menos ${menor}?`
        )
    }
}

recognition.onresult = function(event) {

    const texto =
        event.results[0][0].transcript
        .toLowerCase()
        .trim()

    document.getElementById('respuesta').textContent =
        '🗣️ Ximena dijo: ' + texto

    if (modo === 'pronunciacion') {
        validarPronunciacion(texto)
    }

    if (
        modo === 'tablas' ||
        modo === 'matematicas'
    ) {
        validarMatematicas(texto)
    }
}

function validarPronunciacion(texto) {

    const correcta =
        palabraActual.toLowerCase()

    if (texto.includes(correcta)) {

        puntaje++
        intentos = 0

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar(
            `Muy bien Ximena. Dijiste correctamente ${palabraActual}`,
            () => {
                setTimeout(() => {
                    nuevaPalabra()
                }, 2000)
            }
        )

    } else {

        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje =
                `Casi Ximena. Intenta otra vez decir ${palabraActual}`
        } else if (intentos === 2) {
            mensaje =
                `Escucha despacio. ${palabraActual}. Ahora repítela`
        } else {
            mensaje =
                `No pasa nada Ximena. La palabra es ${palabraActual}. Repítela lentamente`
        }

        hablar(mensaje)
    }
}

function validarMatematicas(texto) {
    const numeroUsuario = convertirTextoANumero(texto)

    console.log('Dijo:', texto)
    console.log('Número detectado:', numeroUsuario)
    console.log('Respuesta correcta:', respuestaCorrecta)

    if (numeroUsuario === respuestaCorrecta) {
        puntaje++
        intentos = 0

        document.getElementById('puntaje').textContent =
            '⭐ Puntaje: ' + puntaje

        hablar(
            'Muy bien Ximena. Contestaste correctamente',
            () => {
                setTimeout(() => {
                    if (modo === 'tablas') {
                        nuevaTabla()
                    } else {
                        nuevaOperacion()
                    }
                }, 2000)
            }
        )
    } else {
        intentos++

        let mensaje = ''

        if (intentos === 1) {
            mensaje = 'Casi Ximena. Intenta nuevamente'
        } else if (intentos === 2) {
            mensaje = 'Vamos Ximena. Tú puedes. Escucha bien y vuelve a responder'
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
        'cero': 0,
        'uno': 1,
        'una': 1,
        'dos': 2,
        'tres': 3,
        'cuatro': 4,
        'cinco': 5,
        'seis': 6,
        'siete': 7,
        'ocho': 8,
        'nueve': 9,
        'diez': 10,
        'once': 11,
        'doce': 12,
        'trece': 13,
        'catorce': 14,
        'quince': 15,
        'dieciséis': 16,
        'dieciseis': 16,
        'diecisiete': 17,
        'dieciocho': 18,
        'diecinueve': 19,
        'veinte': 20,
        'veintiuno': 21,
        'veintidós': 22,
        'veintidos': 22,
        'veintitrés': 23,
        'veintitres': 23,
        'veinticuatro': 24,
        'veinticinco': 25,
        'veintiséis': 26,
        'veintiseis': 26,
        'veintisiete': 27,
        'veintiocho': 28,
        'veintinueve': 29,
        'treinta': 30,
        'treinta y uno': 31,
        'treinta y dos': 32,
        'treinta y tres': 33,
        'treinta y cuatro': 34,
        'treinta y cinco': 35,
        'treinta y seis': 36,
        'treinta y siete': 37,
        'treinta y ocho': 38,
        'treinta y nueve': 39,
        'cuarenta': 40,
        'cincuenta': 50,
        'sesenta': 60,
        'setenta': 70,
        'ochenta': 80,
        'noventa': 90,
        'cien': 100
    }

    const numeroDirecto = texto.match(/\d+/)
    if (numeroDirecto) {
        return Number(numeroDirecto[0])
    }

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
        } catch (e) {
            console.log(e)
        }
    }
}