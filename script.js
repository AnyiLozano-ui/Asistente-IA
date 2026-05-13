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
let tablaSeleccionada = null
let tipoOperacionActual = null
let estadoMate = 'selector' // 'selector', 'grid', 'resolviendo'
let tableroMemoria = []
let cartasVolteadas = []
let cartasPareadas = []
let bloquearTablero = false

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
    { correcta: 'gato', emoji: '🐱', opciones: ['gato', 'pato', 'rato'] },
    { correcta: 'perro', emoji: '🐕', opciones: ['perro', 'barro', 'carro'] },
    { correcta: 'casa', emoji: '🏠', opciones: ['casa', 'tasa', 'masa'] },
    { correcta: 'mesa', emoji: '🪑', opciones: ['mesa', 'vesa', 'tesa'] },
    { correcta: 'puerta', emoji: '🚪', opciones: ['puerta', 'vuerta', 'tuerta'] },
    { correcta: 'ventana', emoji: '🪟', opciones: ['ventana', 'rentana', 'sentana'] },
    { correcta: 'libro', emoji: '📚', opciones: ['libro', 'libra', 'liblo'] },
    { correcta: 'lápiz', emoji: '✏️', opciones: ['lápiz', 'lápez', 'lápes'] },
    { correcta: 'cama', emoji: '🛏️', opciones: ['cama', 'rama', 'tama'] },
    { correcta: 'pan', emoji: '🍞', opciones: ['pan', 'van', 'tan'] },
    { correcta: 'agua', emoji: '💧', opciones: ['agua', 'agra', 'asua'] },
    { correcta: 'fuego', emoji: '🔥', opciones: ['fuego', 'ruego', 'juego'] },
    { correcta: 'árbol', emoji: '🌳', opciones: ['árbol', 'arbol', 'árbil'] },
    { correcta: 'flor', emoji: '🌻', opciones: ['flor', 'fler', 'flur'] },
    { correcta: 'sol', emoji: '☀️', opciones: ['sol', 'sal', 'sul'] },
    { correcta: 'luna', emoji: '🌙', opciones: ['luna', 'lana', 'loona'] },
    { correcta: 'estrella', emoji: '⭐', opciones: ['estrella', 'estrlla', 'estella'] },
    { correcta: 'nube', emoji: '☁️', opciones: ['nube', 'nupe', 'nibe'] },
    { correcta: 'lluvia', emoji: '🌧️', opciones: ['lluvia', 'luvia', 'llovia'] },
    { correcta: 'nieve', emoji: '❄️', opciones: ['nieve', 'niebe', 'nieva'] },
    { correcta: 'viento', emoji: '💨', opciones: ['viento', 'vinto', 'vanto'] },
    { correcta: 'montaña', emoji: '⛰️', opciones: ['montaña', 'montaña', 'montana'] },
    { correcta: 'río', emoji: '🏞️', opciones: ['río', 'reo', 'ríu'] },
    { correcta: 'playa', emoji: '🏖️', opciones: ['playa', 'plaia', 'pláya'] },
    { correcta: 'piedra', emoji: '🪨', opciones: ['piedra', 'pedra', 'piadra'] },
    { correcta: 'arena', emoji: '🏜️', opciones: ['arena', 'arana', 'ajena'] },
    { correcta: 'manzana', emoji: '🍎', opciones: ['manzana', 'manzona', 'manzina'] },
    { correcta: 'naranja', emoji: '🍊', opciones: ['naranja', 'naraja', 'naranxa'] },
    { correcta: 'plátano', emoji: '🍌', opciones: ['plátano', 'platano', 'plátan'] },
    { correcta: 'fruta', emoji: '🍓', opciones: ['fruta', 'frita', 'frota'] },
    { correcta: 'verdura', emoji: '🥬', opciones: ['verdura', 'verdora', 'verdira'] },
    { correcta: 'chocolate', emoji: '🍫', opciones: ['chocolate', 'chocolte', 'choclate'] },
    { correcta: 'helado', emoji: '🍦', opciones: ['helado', 'helido', 'halado'] },
    { correcta: 'pastel', emoji: '🎂', opciones: ['pastel', 'pastal', 'postal'] },
    { correcta: 'caramelo', emoji: '🍬', opciones: ['caramelo', 'caramilo', 'carímelo'] },
    { correcta: 'dulce', emoji: '🍭', opciones: ['dulce', 'dulse', 'delce'] },
    { correcta: 'juego', emoji: '🎮', opciones: ['juego', 'juago', 'juego'] },
    { correcta: 'pelota', emoji: '⚽', opciones: ['pelota', 'palota', 'pelota'] },
    { correcta: 'muñeca', emoji: '🪆', opciones: ['muñeca', 'moñeca', 'muñeca'] },
    { correcta: 'carro', emoji: '🚗', opciones: ['carro', 'caro', 'carro'] },
    { correcta: 'bicicleta', emoji: '🚲', opciones: ['bicicleta', 'bisicleta', 'biciclata'] },
    { correcta: 'avión', emoji: '✈️', opciones: ['avión', 'avion', 'avián'] },
    { correcta: 'barco', emoji: '⛵', opciones: ['barco', 'barquito', 'barqu'] },
    { correcta: 'mano', emoji: '✋', opciones: ['mano', 'mono', 'mano'] },
    { correcta: 'pie', emoji: '🦶', opciones: ['pie', 'pio', 'pía'] },
    { correcta: 'cabeza', emoji: '👤', opciones: ['cabeza', 'cabella', 'cabesa'] },
    { correcta: 'corazón', emoji: '❤️', opciones: ['corazón', 'corazon', 'corason'] },
    { correcta: 'ojo', emoji: '👁️', opciones: ['ojo', 'ajo', 'oyo'] },
    { correcta: 'boca', emoji: '👄', opciones: ['boca', 'loca', 'boque'] },
    { correcta: 'nariz', emoji: '👃', opciones: ['nariz', 'naríz', 'naras'] },
    { correcta: 'oído', emoji: '👂', opciones: ['oído', 'oido', 'oydo'] },
    { correcta: 'diente', emoji: '🦷', opciones: ['diente', 'dinte', 'diante'] },
    { correcta: 'pelo', emoji: '💇', opciones: ['pelo', 'palo', 'pilo'] },
    { correcta: 'ropa', emoji: '👕', opciones: ['ropa', 'rupe', 'ropa'] },
    { correcta: 'zapato', emoji: '👞', opciones: ['zapato', 'sapato', 'zapato'] },
    { correcta: 'sombrero', emoji: '🎩', opciones: ['sombrero', 'sombreo', 'sombrita'] },
    { correcta: 'reloj', emoji: '⏰', opciones: ['reloj', 'relox', 'reloz'] },
    { correcta: 'teléfono', emoji: '☎️', opciones: ['teléfono', 'telefono', 'teleféno'] },
    { correcta: 'televisión', emoji: '📺', opciones: ['televisión', 'television', 'televisón'] },
    { correcta: 'lámpara', emoji: '🔦', opciones: ['lámpara', 'lampara', 'lámpira'] },
    { correcta: 'silla', emoji: '🪑', opciones: ['silla', 'silla', 'sília'] },
    { correcta: 'espejo', emoji: '🪞', opciones: ['espejo', 'espexo', 'espeho'] },
    { correcta: 'alfombra', emoji: '🧶', opciones: ['alfombra', 'alfombrita', 'alfomba'] },
    { correcta: 'cortina', emoji: '🪟', opciones: ['cortina', 'cortona', 'cortena'] },
    { correcta: 'escuela', emoji: '🏫', opciones: ['escuela', 'escuepla', 'escuelo'] },
    { correcta: 'profesor', emoji: '👨‍🏫', opciones: ['profesor', 'profesora', 'proferor'] },
    { correcta: 'estudiante', emoji: '👨‍🎓', opciones: ['estudiante', 'estudyante', 'estudante'] },
    { correcta: 'amigo', emoji: '👫', opciones: ['amigo', 'amija', 'amago'] },
    { correcta: 'hermano', emoji: '👨', opciones: ['hermano', 'hermeno', 'hermino'] },
    { correcta: 'hermana', emoji: '👩', opciones: ['hermana', 'hermena', 'hermona'] },
    { correcta: 'mamá', emoji: '👩‍👧', opciones: ['mamá', 'mama', 'mami'] },
    { correcta: 'papá', emoji: '👨‍👦', opciones: ['papá', 'papa', 'papi'] },
    { correcta: 'abuela', emoji: '👵', opciones: ['abuela', 'abulea', 'abuele'] },
    { correcta: 'abuelo', emoji: '👴', opciones: ['abuelo', 'abuleo', 'abuela'] },
    { correcta: 'bebé', emoji: '👶', opciones: ['bebé', 'bebe', 'bebi'] },
    { correcta: 'niño', emoji: '🧒', opciones: ['niño', 'nino', 'niñu'] },
    { correcta: 'doctor', emoji: '⚕️', opciones: ['doctor', 'docter', 'dotor'] },
    { correcta: 'enfermera', emoji: '👩‍⚕️', opciones: ['enfermera', 'enfermeira', 'enfermira'] },
    { correcta: 'policía', emoji: '👮', opciones: ['policía', 'policia', 'polisía'] },
    { correcta: 'bombero', emoji: '👨‍🚒', opciones: ['bombero', 'bombeira', 'bombero'] },
    { correcta: 'granja', emoji: '🚜', opciones: ['granja', 'granja', 'granja'] },
    { correcta: 'caballo', emoji: '🐴', opciones: ['caballo', 'cabayo', 'caballote'] },
    { correcta: 'gallina', emoji: '🐔', opciones: ['gallina', 'galina', 'gallena'] },
    { correcta: 'oveja', emoji: '🐑', opciones: ['oveja', 'ovaya', 'ovaja'] },
    { correcta: 'cerdo', emoji: '🐷', opciones: ['cerdo', 'cerdi', 'cirdo'] },
    { correcta: 'pez', emoji: '🐠', opciones: ['pez', 'pes', 'peez'] },
    { correcta: 'tortuga', emoji: '🐢', opciones: ['tortuga', 'tortiga', 'tortugo'] },
    { correcta: 'mariposa', emoji: '🦋', opciones: ['mariposa', 'maríposa', 'marisposa'] },
    { correcta: 'abeja', emoji: '🐝', opciones: ['abeja', 'abeya', 'abaja'] },
    { correcta: 'araña', emoji: '🕷️', opciones: ['araña', 'arana', 'aranico'] },
    { correcta: 'serpiente', emoji: '🐍', opciones: ['serpiente', 'serpinta', 'serpenta'] },
    { correcta: 'rojo', emoji: '🔴', opciones: ['rojo', 'raho', 'roho'] },
    { correcta: 'azul', emoji: '🔵', opciones: ['azul', 'azur', 'azol'] },
    { correcta: 'amarillo', emoji: '🟡', opciones: ['amarillo', 'amaríllo', 'amarilo'] },
    { correcta: 'verde', emoji: '🟢', opciones: ['verde', 'vende', 'verdi'] },
]

const paresMemoria = [
    { id: 1, emoji: '🐱', palabra: 'gato' },
    { id: 2, emoji: '🐕', palabra: 'perro' },
    { id: 3, emoji: '🐄', palabra: 'vaca' },
    { id: 4, emoji: '🦋', palabra: 'mariposa' },
    { id: 5, emoji: '🌻', palabra: 'flor' },
    { id: 6, emoji: '🏠', palabra: 'casa' },
    { id: 7, emoji: '☀️', palabra: 'sol' },
    { id: 8, emoji: '🍎', palabra: 'manzana' },
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

    let callbackEjecutado = false

    voz.onend = () => {
        if (callbackEjecutado) return
        callbackEjecutado = true

        try {
            recognition.start()
            escuchando = true
        } catch (e) {
            console.error('Error iniciando reconocimiento:', e)
        }

        if (callback) {
            callback()
        }
    }

    voz.onerror = () => {
        console.error('Error en síntesis de voz')
        if (!callbackEjecutado && callback) {
            callbackEjecutado = true
            callback()
        }
    }

    speechSynthesis.speak(voz)
}

function iniciarMicrofono() {
    if (!escuchando) {
        try {
            recognition.start()
            escuchando = true
        } catch (e) {
            console.error('Error iniciando micrófono:', e)
        }
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
    escuchando = false

    document.getElementById('puntaje').textContent = '⭐ Puntaje: 0'
    document.getElementById('respuesta').textContent = ''

    limpiarJuegoOpciones()
}

function abrirActividad(tipo, colorClass) {
    window.open(`activity.html?tipo=${tipo}&color=${colorClass}`, '_blank')
}

function abrirMenuJuegos() {
    window.open(`games.html`, '_blank')
}

function abrirLogros() {
    document.getElementById('menu').classList.remove('active')
    document.getElementById('actividad').classList.remove('active')
    document.getElementById('logros').classList.add('active')
}

function volverMenu() {
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
    tablaSeleccionada = null

    hablar('Hola Ximena, vamos a practicar tablas de multiplicar', () => {
        mostrarSelectorTablas()
    })
}

function mostrarSelectorTablas() {
    const selectorTablas = document.getElementById('selectorTablas')
    const pregunta = document.getElementById('pregunta')
    const juegoOpciones = document.getElementById('juegoOpciones')
    const respuesta = document.getElementById('respuesta')
    const puntaje = document.getElementById('puntaje')

    if (selectorTablas) selectorTablas.style.display = 'block'
    if (pregunta) pregunta.style.display = 'none'
    if (juegoOpciones) juegoOpciones.style.display = 'none'
    if (respuesta) respuesta.style.display = 'none'
    if (puntaje) puntaje.style.display = 'none'

    const contenedorTablas = document.getElementById('contenedorTablas')
    if (contenedorTablas) {
        contenedorTablas.innerHTML = ''

        // Botón para practicar todas las tablas
        const btnTodas = document.createElement('button')
        btnTodas.className = `tabla-card tabla-todas`
        btnTodas.innerHTML = `
            <div class="tabla-numero">🎓</div>
            <div class="tabla-label">Practicar todas</div>
        `
        btnTodas.onclick = () => seleccionarTabla(null)
        contenedorTablas.appendChild(btnTodas)

        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button')
            btn.className = `tabla-card tabla-${i}`
            btn.innerHTML = `
                <div class="tabla-numero">✖️ ${i}</div>
                <div class="tabla-label">Tabla del ${i}</div>
            `
            btn.onclick = () => seleccionarTabla(i)
            contenedorTablas.appendChild(btn)
        }
    }

    hablar('Selecciona una tabla. Puedes practicar todas las tablas o elegir una específica')
}

function seleccionarTabla(numero) {
    tablaSeleccionada = numero
    const selectorTablas = document.getElementById('selectorTablas')
    const pregunta = document.getElementById('pregunta')
    const juegoOpciones = document.getElementById('juegoOpciones')
    const respuesta = document.getElementById('respuesta')
    const puntaje = document.getElementById('puntaje')

    if (selectorTablas) selectorTablas.style.display = 'none'
    if (pregunta) pregunta.style.display = 'block'
    if (juegoOpciones) juegoOpciones.style.display = 'grid'
    if (respuesta) respuesta.style.display = 'block'
    if (puntaje) puntaje.style.display = 'block'

    if (numero === null) {
        hablar('Excelente. Vamos a practicar todas las tablas. Repite después de mí', () => {
            nuevaTablaPractica()
        })
    } else {
        const mensaje = `Excelente. Vamos a practicar la tabla del ${numero}`
        hablar(mensaje, () => {
            nuevaTabla()
        })
    }
}

function iniciarSumasRestas() {
    reiniciarJuego('matematicas')

    hablar('Hola Ximena, vamos a practicar sumas y restas', () => {
        mostrarSelectorOperacion()
    })
}

function mostrarSelectorOperacion() {
    estadoMate = 'selector'
    const pregunta = document.getElementById('pregunta')
    const juegoOpciones = document.getElementById('juegoOpciones')
    const respuesta = document.getElementById('respuesta')
    const puntaje = document.getElementById('puntaje')
    const titulo = document.getElementById('tituloActividad')

    if (titulo) {
        titulo.textContent = '🧮 Operaciones'
    }

    pregunta.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 20px;">🎯 ¿Qué deseas practicar?</div>
        <div style="font-size: 18px; color: #666; margin-bottom: 30px;">Selecciona una opción para jugar</div>
    `

    juegoOpciones.innerHTML = `
        <button class="operacion-btn suma-btn" id="btn-suma" onclick="seleccionarTipoOperacion('suma')">
            <span class="operacion-icon">➕</span>
            <span class="operacion-texto">Sumas</span>
        </button>
        <button class="operacion-btn resta-btn" id="btn-resta" onclick="seleccionarTipoOperacion('resta')">
            <span class="operacion-icon">➖</span>
            <span class="operacion-texto">Restas</span>
        </button>
        <button class="operacion-btn mixto-btn" id="btn-mixto" onclick="seleccionarTipoOperacion('mixto')">
            <span class="operacion-icon">🎲</span>
            <span class="operacion-texto">Mixto</span>
        </button>
    `

    if (respuesta) respuesta.style.display = 'none'
    if (puntaje) puntaje.style.display = 'block'

    hablar('Puedes seleccionar sumas, restas o una mezcla')
}

function seleccionarTipoOperacion(tipo) {
    modo = 'matematicas'
    tipoOperacionActual = tipo
    const respuesta = document.getElementById('respuesta')

    // Detener el micrófono para matemáticas
    try {
        recognition.stop()
        escuchando = false
    } catch (e) {}

    if (respuesta) respuesta.style.display = 'none'

    // Resaltar el botón seleccionado
    const btnSuma = document.getElementById('btn-suma')
    const btnResta = document.getElementById('btn-resta')
    const btnMixto = document.getElementById('btn-mixto')

    // Limpiar selección anterior
    if (btnSuma) {
        btnSuma.style.background = ''
        btnSuma.style.transform = ''
        btnSuma.style.boxShadow = ''
    }
    if (btnResta) {
        btnResta.style.background = ''
        btnResta.style.transform = ''
        btnResta.style.boxShadow = ''
    }
    if (btnMixto) {
        btnMixto.style.background = ''
        btnMixto.style.transform = ''
        btnMixto.style.boxShadow = ''
    }

    // Resaltar el seleccionado
    if (tipo === 'suma' && btnSuma) {
        btnSuma.style.background = 'linear-gradient(135deg, #0ec2a5, #0aa994)'
        btnSuma.style.color = 'white'
        btnSuma.style.transform = 'scale(1.08)'
        btnSuma.style.boxShadow = '0 12px 30px rgba(14, 194, 165, 0.4)'
    } else if (tipo === 'resta' && btnResta) {
        btnResta.style.background = 'linear-gradient(135deg, #ff4fa3, #e63a90)'
        btnResta.style.color = 'white'
        btnResta.style.transform = 'scale(1.08)'
        btnResta.style.boxShadow = '0 12px 30px rgba(255, 79, 163, 0.4)'
    } else if (tipo === 'mixto' && btnMixto) {
        btnMixto.style.background = 'linear-gradient(135deg, #8057ff, #6b42e5)'
        btnMixto.style.color = 'white'
        btnMixto.style.transform = 'scale(1.08)'
        btnMixto.style.boxShadow = '0 12px 30px rgba(128, 87, 255, 0.4)'
    }

    const mensajeInicio = tipo === 'suma' ? 'Excelente, vamos a practicar sumas. Elige la respuesta correcta' :
        tipo === 'resta' ? 'Excelente, vamos a practicar restas. Elige la respuesta correcta' :
        'Excelente, vamos a practicar una mezcla. Elige la respuesta correcta'

    hablar(mensajeInicio, () => {
        mostrarGridOperaciones(tipo)
    })
}

function generarOperacion(tipo) {
    const numero1 = Math.floor(Math.random() * 20) + 1
    const numero2 = Math.floor(Math.random() * 20) + 1

    let esSuma
    if (tipo === 'suma') {
        esSuma = true
    } else if (tipo === 'resta') {
        esSuma = false
    } else {
        esSuma = Math.random() > 0.5
    }

    if (esSuma) {
        const resultado = numero1 + numero2
        return {
            numero1,
            numero2,
            tipo: 'suma',
            resultado,
            texto: `${numero1} + ${numero2}`
        }
    } else {
        const mayor = Math.max(numero1, numero2)
        const menor = Math.min(numero1, numero2)
        const resultado = mayor - menor
        return {
            numero1: mayor,
            numero2: menor,
            tipo: 'resta',
            resultado,
            texto: `${mayor} - ${menor}`
        }
    }
}

function mostrarGridOperaciones(tipo) {
    estadoMate = 'grid'
    const pregunta = document.getElementById('pregunta')
    const juegoOpciones = document.getElementById('juegoOpciones')
    const titulo = document.getElementById('tituloActividad')

    const tituloTipo = tipo === 'suma' ? '➕ Sumas' : tipo === 'resta' ? '➖ Restas' : '🎲 Mixto'
    if (titulo) {
        titulo.textContent = tituloTipo
    }

    pregunta.innerHTML = `
        <div style="font-size: 28px; margin-bottom: 15px;">${tituloTipo}</div>
        <div style="font-size: 18px; color: #666; margin-bottom: 20px;">👇 Haz clic en una operación para resolver 👇</div>
    `

    const operaciones = []
    for (let i = 0; i < 4; i++) {
        operaciones.push(generarOperacion(tipo))
    }

    let html = '<div class="operaciones-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 600px; margin: 0 auto; width: 100%;">'
    operaciones.forEach((op, index) => {
        html += `
            <button class="operacion-card ${op.tipo}-card" id="op-btn-${index}" onclick="resolverOperacion(${op.numero1}, ${op.numero2}, '${op.tipo}', ${op.resultado}, ${index})" style="background: white; border: 3px solid #0ec2a5; border-radius: 20px; padding: 25px; cursor: pointer; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 140px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                <div class="operacion-display" style="font-size: 32px; font-weight: bold; margin-bottom: 10px; color: #333;">${op.texto}</div>
                <div class="operacion-icon-card" style="font-size: 40px;">${op.tipo === 'suma' ? '➕' : '➖'}</div>
            </button>
        `
    })
    html += '</div>'

    juegoOpciones.innerHTML = html
}

function resolverOperacion(num1, num2, tipo, resultado, indice) {
    estadoMate = 'resolviendo'
    const pregunta = document.getElementById('pregunta')
    const juegoOpciones = document.getElementById('juegoOpciones')
    const titulo = document.getElementById('tituloActividad')

    const tituloTipo = tipoOperacionActual === 'suma' ? '➕ Sumas' : tipoOperacionActual === 'resta' ? '➖ Restas' : '🎲 Mixto'
    if (titulo) {
        titulo.textContent = tituloTipo
    }

    // Marcar el botón como seleccionado
    const btnSeleccionado = document.getElementById(`op-btn-${indice}`)
    if (btnSeleccionado) {
        btnSeleccionado.style.background = 'linear-gradient(135deg, #0ec2a5, #0aa994)'
        btnSeleccionado.style.color = 'white'
        btnSeleccionado.style.boxShadow = '0 8px 24px rgba(14, 194, 165, 0.4)'
        btnSeleccionado.style.transform = 'scale(0.95)'

        // Cambiar el color del texto dentro del botón
        const display = btnSeleccionado.querySelector('.operacion-display')
        const icon = btnSeleccionado.querySelector('.operacion-icon-card')
        if (display) display.style.color = 'white'
    }

    // Mostrar la operación seleccionada
    const operacion = tipo === 'suma' ? `${num1} + ${num2}` : `${num1} - ${num2}`
    pregunta.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">${tipo === 'suma' ? '➕' : '➖'}</div>
        <div style="font-size: 48px; font-weight: bold; margin: 20px 0; color: #0ec2a5;">${operacion}</div>
        <div style="font-size: 24px; color: #666; margin-top: 20px;">👇 Selecciona la respuesta correcta 👇</div>
    `

    // Generar opciones de respuesta (correcta + 2 incorrectas)
    const opciones = [resultado]
    while (opciones.length < 3) {
        const opcion = Math.floor(Math.random() * 40) + 1
        if (!opciones.includes(opcion)) {
            opciones.push(opcion)
        }
    }

    // Barajar opciones
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]]
    }

    let html = '<div class="respuestas-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 600px; margin: 0 auto; width: 100%;">'
    opciones.forEach(opcion => {
        const esCorrecta = opcion === resultado
        html += `
            <button onclick="verificarRespuesta(${opcion}, ${resultado}, '${tipo}')" style="background: linear-gradient(135deg, #8057ff, #6b42e5); border: none; border-radius: 20px; padding: 20px; font-size: 32px; font-weight: 900; color: white; cursor: pointer; display: flex; justify-content: center; align-items: center; min-height: 120px; box-shadow: 0 6px 16px rgba(128, 87, 255, 0.25); transition: all 0.3s ease;">
                <span style="font-size: 48px; font-weight: bold;">${opcion}</span>
            </button>
        `
    })
    html += '</div>'

    juegoOpciones.innerHTML = html

    respuestaCorrecta = resultado
    setTimeout(() => {
        hablar(`¿Cuánto es ${num1} ${tipo === 'suma' ? 'más' : 'menos'} ${num2}?`)
    }, 300)
}

function iniciarMemoria() {
    reiniciarJuego('memoria')

    try {
        recognition.stop()
        escuchando = false
    } catch (e) {}

    document.getElementById('respuesta').style.display = 'none'
    document.getElementById('puntaje').style.display = 'block'

    cartasVolteadas = []
    cartasPareadas = []
    puntaje = 0

    const pregunta = document.getElementById('pregunta')
    pregunta.innerHTML = `🧠 Encuentra las parejas<br><br>
        👂 Haz clic en dos tarjetas para encontrar la pareja`

    document.getElementById('puntaje').textContent = '⭐ Parejas encontradas: 0/' + paresMemoria.length

    crearTableroMemoria()

    hablar('Hola Ximena. Vamos a jugar memoria. Encuentra las parejas de emojis. Haz clic en dos tarjetas para ver si son iguales')
}

function crearTableroMemoria() {
    const juegoOpciones = document.getElementById('juegoOpciones')

    const pares = []
    paresMemoria.forEach(par => {
        pares.push({ ...par, tipo: 'emoji' })
        pares.push({ ...par, tipo: 'palabra' })
    })

    // Barajar
    for (let i = pares.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pares[i], pares[j]] = [pares[j], pares[i]]
    }

    tableroMemoria = pares

    let html = '<div class="memoria-grid">'
    pares.forEach((par, index) => {
        html += `
            <button class="memoria-carta" id="carta-${index}" onclick="voltearCarta(${index})" data-par="${par.id}">
                <div class="memoria-cara-frontal">?</div>
                <div class="memoria-cara-trasera">${par.tipo === 'emoji' ? par.emoji : par.palabra}</div>
            </button>
        `
    })
    html += '</div>'

    juegoOpciones.innerHTML = html
}

function voltearCarta(index) {
    if (bloquearTablero) return
    if (cartasVolteadas.length >= 2) return
    if (cartasVolteadas.includes(index)) return
    if (cartasPareadas.includes(index)) return

    const carta = document.getElementById(`carta-${index}`)
    carta.classList.add('volteada')
    cartasVolteadas.push(index)

    if (cartasVolteadas.length === 2) {
        bloquearTablero = true
        verificarPareja()
    }
}

function verificarPareja() {
    const [index1, index2] = cartasVolteadas
    const par1 = tableroMemoria[index1].id
    const par2 = tableroMemoria[index2].id
    const tipo1 = tableroMemoria[index1].tipo
    const tipo2 = tableroMemoria[index2].tipo

    if (par1 === par2 && tipo1 !== tipo2) {
        // Pareja encontrada
        puntaje++
        document.getElementById('puntaje').textContent = '⭐ Parejas encontradas: ' + puntaje + '/' + paresMemoria.length

        cartasPareadas.push(index1, index2)
        cartasVolteadas = []
        bloquearTablero = false

        hablar('¡Muy bien! Encontraste una pareja')

        if (cartasPareadas.length === tableroMemoria.length) {
            setTimeout(() => {
                hablar('¡Excelente! ¡Encontraste todas las parejas! 🎉', () => {
                    setTimeout(() => {
                        iniciarMemoria()
                    }, 2000)
                })
            }, 1000)
        }
    } else {
        // No es pareja
        setTimeout(() => {
            const carta1 = document.getElementById(`carta-${index1}`)
            const carta2 = document.getElementById(`carta-${index2}`)
            carta1.classList.remove('volteada')
            carta2.classList.remove('volteada')
            cartasVolteadas = []
            bloquearTablero = false
        }, 1500)
    }
}

function iniciarJuego() {
    reiniciarJuego('juego')

    try {
        recognition.stop()
        escuchando = false
    } catch (e) {}

    document.getElementById('respuesta').style.display = 'none'

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

function nuevaTablaPractica() {
    intentos = 0

    const tabla = Math.floor(Math.random() * 10) + 1
    const multiplicador = Math.floor(Math.random() * 10) + 1
    const respuesta = tabla * multiplicador

    document.getElementById('pregunta').innerHTML =
        `✖️ ${tabla} × ${multiplicador} = <span style="color: #ff4fa3; font-size: 48px;">${respuesta}</span><br><br>
         <span style="font-size: 20px; color: #7c4dff;">Ahora tú, ¡contesta!</span>`

    hablar(
        `${tabla} por ${multiplicador}. Mira, la respuesta es ${respuesta}. Ahora dime, ¿cuánto es ${tabla} por ${multiplicador}?`
    )
}

function nuevaTabla() {
    intentos = 0

    const tabla = tablaSeleccionada || (Math.floor(Math.random() * 10) + 1)
    const multiplicador = Math.floor(Math.random() * 10) + 1

    respuestaCorrecta = tabla * multiplicador

    document.getElementById('pregunta').innerHTML =
        `✖️ Tabla del ${tabla}<br><br>
         ¿Cuánto es ${tabla} por ${multiplicador}?`

    hablar(
        `Ximena, ¿cuánto es ${tabla} por ${multiplicador}?`
    )
}

function nuevaOperacionMejorada(tipo) {
    intentos = 0

    const numero1 = Math.floor(Math.random() * 20) + 1
    const numero2 = Math.floor(Math.random() * 20) + 1

    let esSuma
    if (tipo === 'suma') {
        esSuma = true
    } else if (tipo === 'resta') {
        esSuma = false
    } else {
        esSuma = Math.random() > 0.5
    }

    if (esSuma) {
        respuestaCorrecta = numero1 + numero2

        document.getElementById('pregunta').innerHTML =
            `<span style="font-size: 48px;">➕</span><br>
             <span style="font-size: 32px; color: #0ec2a5;">Suma</span><br><br>
             <span style="font-size: 56px; font-weight: bold;">${numero1} + ${numero2}</span><br><br>
             <span style="font-size: 18px; color: #666;">¿Cuál es el resultado?</span>`

        hablar(`Ximena, ¿cuánto es ${numero1} más ${numero2}?`)
    } else {
        const mayor = Math.max(numero1, numero2)
        const menor = Math.min(numero1, numero2)

        respuestaCorrecta = mayor - menor

        document.getElementById('pregunta').innerHTML =
            `<span style="font-size: 48px;">➖</span><br>
             <span style="font-size: 32px; color: #ff4fa3;">Resta</span><br><br>
             <span style="font-size: 56px; font-weight: bold;">${mayor} - ${menor}</span><br><br>
             <span style="font-size: 18px; color: #666;">¿Cuál es el resultado?</span>`

        hablar(`Ximena, ¿cuánto es ${mayor} menos ${menor}?`)
    }
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

    try {
        recognition.stop()
        escuchando = false
    } catch (e) {}

    juegoActual =
        juegoPalabras[Math.floor(Math.random() * juegoPalabras.length)]

    document.getElementById('pregunta').innerHTML =
        `🎮 Atrapa la palabra correcta<br><br>
         👂 Escucha atentamente`

    const opcionesHTML =
        juegoActual.opciones.map(opcion => `
            <button class="option" id="opcion-${opcion}" onclick="validarJuego('${opcion}', this)">
                <span>${juegoActual.emoji}</span>
                ${opcion}
            </button>
        `).join('')

    document.getElementById('juegoOpciones').innerHTML = opcionesHTML

    hablar(`Ximena, selecciona la palabra ${juegoActual.correcta}`)
}

function validarJuego(opcion, elemento) {
    try {
        recognition.stop()
        escuchando = false
    } catch (e) {}

    speechSynthesis.cancel()

    if (elemento) {
        const botones = document.querySelectorAll('.option')
        botones.forEach(btn => {
            btn.disabled = true
            btn.style.pointerEvents = 'none'
        })

        if (opcion === juegoActual.correcta) {
            elemento.style.background = 'linear-gradient(135deg, #0ec2a5, #0aa994)'
            elemento.style.color = 'white'
            elemento.style.transform = 'scale(1.1)'
            elemento.style.boxShadow = '0 12px 30px rgba(14, 194, 165, 0.4)'
        } else {
            elemento.style.background = 'linear-gradient(135deg, #ff4fa3, #e63a90)'
            elemento.style.color = 'white'
            elemento.style.transform = 'scale(1.1)'
            elemento.style.boxShadow = '0 12px 30px rgba(255, 79, 163, 0.4)'

            botones.forEach(btn => {
                if (btn.textContent.includes(juegoActual.correcta)) {
                    btn.style.background = 'linear-gradient(135deg, #0ec2a5, #0aa994)'
                    btn.style.color = 'white'
                    btn.style.transform = 'scale(1.05)'
                    btn.style.boxShadow = '0 12px 30px rgba(14, 194, 165, 0.4)'
                } else if (btn !== elemento) {
                    btn.style.opacity = '0.4'
                }
            })
        }
    }

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
        const palabraSeleccionada = opcion
        const palabraCorrecta = juegoActual.correcta
        const mensaje = `No, seleccionaste ${palabraSeleccionada}, pero la respuesta correcta era ${palabraCorrecta}. Vamos con otra.`

        hablar(mensaje, () => {
            setTimeout(() => {
                nuevoJuego()
            }, 2000)
        })
    }
}

recognition.onresult = function(event) {
    if (!event.results || !event.results[0] || !event.results[0][0]) {
        return
    }

    const texto = event.results[0][0].transcript.toLowerCase().trim()

    if (!texto || texto.length === 0) {
        return
    }

    // En modo práctica de tablas, no validar respuestas, solo decir perfecto y continuar
    if (modo === 'tablas' && tablaSeleccionada === null) {
        document.getElementById('respuesta').textContent =
            '🗣️ Ximena dijo: ' + texto
        hablar('Perfecto. Muy bien', () => {
            setTimeout(() => {
                nuevaTablaPractica()
            }, 1000)
        })
        return
    }

    document.getElementById('respuesta').textContent =
        '🗣️ Ximena dijo: ' + texto

    if (modo === 'pronunciacion') {
        validarPronunciacion(texto)
    } else if (modo === 'silabas') {
        validarSilabas(texto)
    } else if (modo === 'tablas' || modo === 'matematicas') {
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

function verificarRespuesta(respuestaUsuario, respuestaCorrecta, tipo) {
    const juegoOpciones = document.getElementById('juegoOpciones')
    const pregunta = document.getElementById('pregunta')

    if (respuestaUsuario === respuestaCorrecta) {
        puntaje++
        document.getElementById('puntaje').textContent = '⭐ Puntaje: ' + puntaje

        pregunta.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
            <div style="font-size: 36px; font-weight: bold; color: #0ec2a5;">¡CORRECTO!</div>
            <div style="font-size: 24px; color: #666; margin-top: 15px;">Excelente trabajo Ximena 🎉</div>
        `

        juegoOpciones.innerHTML = ''

        hablar('Muy bien Ximena, ¡lo hiciste correctamente!', () => {
            setTimeout(() => {
                mostrarGridOperaciones(tipoOperacionActual)
            }, 3000)
        })
    } else {
        pregunta.innerHTML = `
            <div style="font-size: 80px; margin-bottom: 20px;">❌</div>
            <div style="font-size: 36px; font-weight: bold; color: #ff4fa3;">INCORRECTO</div>
            <div style="font-size: 28px; color: #333; margin-top: 15px;">La respuesta correcta es: <strong style="font-size: 36px;">${respuestaCorrecta}</strong></div>
        `

        juegoOpciones.innerHTML = ''

        hablar('No es correcto. La respuesta es ' + respuestaCorrecta + '. Vamos con otra operación más desafiante.', () => {
            setTimeout(() => {
                mostrarGridOperaciones(tipoOperacionActual)
            }, 3500)
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

        hablar('¡Excelente! ¡Muy bien Ximena! 🎉', () => {
            setTimeout(() => {
                if (modo === 'tablas') nuevaTabla()
                else if (tipoOperacionActual) nuevaOperacionMejorada(tipoOperacionActual)
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
    console.error('Error de reconocimiento de voz:', event.error)
    escuchando = false
}

recognition.onend = function() {
    if (escuchando) {
        try {
            recognition.start()
        } catch (e) {}
    }
}