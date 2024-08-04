import data from './tableros.json' with { type: 'json' };

//Elementos seleccionados
const btnFacil = document.querySelector(".btn-facil");
const btnMedio = document.querySelector(".btn-medio");
const btnDificil = document.querySelector(".btn-dificil");
const btnComenzar = document.getElementById('btnComenzar');
const divStatus = document.getElementById('status');
const textoTiempo = document.getElementById("tiempo");
const textoErrores = document.getElementById("errores");
const btnPausa = document.getElementById('btnPausa');

let numSeleccionado = null
let juegoEmpezado = false;

//variables para manejo de tiempo
let intervalTiempo;
let tiempoActual = 0;
let pausado = false;

//Tablero inicial
let tablero = data["facil"][0].tablero;
let solucion = data["facil"][0].solucion;

//Contadores
let contErrores = 0;
let contFacil = 0;
let contMedio = 0;
let contDificil = 0;

//Arrays para deshabilitar los numeros ya encontrados
let objRepeticiones = {}
let arrNumerosTerminados = []


//Manejadores de eventos de los botones de dificultad
btnFacil.addEventListener("click", () => {
    if (!juegoEmpezado) {
        contFacil += 1;
        if (contFacil > 9) contFacil = 0
        //Cambiamos texto del boton
        btnFacil.innerHTML = `Facil ${contFacil + 1}/10`
        //Llamamos a la funcion que trae el tablero
        seleccionarTablero("facil", contFacil)
        //Reiniciamos e iniciamos los valores necesarios
        reiniciarContadores();
        contarNumTablero(tablero)
    }
})

btnMedio.addEventListener("click", () => {
    if (!juegoEmpezado) {
        contMedio += 1;
        if (contMedio > 9) contMedio = 0
        btnMedio.innerHTML = `Medio ${contMedio + 1}/10`
        seleccionarTablero("medio", contMedio)
        reiniciarContadores();
        contarNumTablero(tablero)
    }
})

btnDificil.addEventListener("click", () => {
    if (!juegoEmpezado) {
        contDificil += 1;
        if (contDificil > 9) contDificil = 0
        btnDificil.innerHTML = `Dificil ${contDificil + 1}/10`
        seleccionarTablero("dificil", contDificil)
        reiniciarContadores();
        contarNumTablero(tablero)
    }
})

//Manejador del evento click en el boton comenzar juego/reiniciar
btnComenzar.addEventListener("click", () => {
    reiniciarJuego()
})

const reiniciarJuego = () => {
    if (!juegoEmpezado) {
        juegoEmpezado = true;
        btnComenzar.textContent = "REINICIAR";

        if (btnPausa.classList.contains("reanudar")) {
            btnPausa.classList.remove("reanudar")
            pausado = false
        }

        start();
    }
    else {
        juegoEmpezado = false;
        btnComenzar.textContent = "COMENZAR JUEGO";

        if (numSeleccionado != null) numSeleccionado.classList.remove("numero-seleccionado")
        seleccionarTablero("facil", contFacil)
        reiniciarContadores();

        stop();
    }

    btnPausa.toggleAttribute("hidden")
    btnComenzar.classList.toggle("reiniciar")
}

//Manejador del evento click en el boton de play/pausa
btnPausa.addEventListener("click", () => {
    btnPausa.classList.toggle("reanudar")
    pausado = !pausado;

    pause();
})



//Función que cambia el tablero según el boton seleccionado
function seleccionarTablero(nivel, indice) {
    tablero = data[nivel][indice].tablero
    solucion = data[nivel][indice].solucion
    //Eliminamos el tablero actual y creamos otro
    document.getElementById("tablero").remove()
    const div = document.createElement("div")
    div.id = "tablero"
    //Agregamos el tablero luego del div status
    divStatus.insertAdjacentElement('afterend', div);
    crearTablero()
}

let cas = []
//Función que dibuja el tablero
function crearTablero() {
    for (let f = 0; f < 9; f++) {
        for (let c = 0; c < 9; c++) {
            let casilla = document.createElement("div");
            //id con fila y columna
            casilla.id = f.toString() + "-" + c.toString()

            //Si la casilla no debe empazar vacia, la llenamos
            if (tablero[f][c] != "-") {
                casilla.innerText = tablero[f][c]
                casilla.classList.add("casilla-inicial")
            }

            //Lineas que marcan los cuadrados de 3x3
            if (f == 2 || f == 5) {
                casilla.classList.add("linea-horizontal")
            }
            if (c == 2 || c == 5) {
                casilla.classList.add("linea-vertical")
            }

            casilla.classList.add("casilla")
            document.getElementById("tablero").appendChild(casilla)
            cas.push(casilla)
        }
    }
}

let casillaSelecionada = false
const tab = document.getElementById('tablero')
let casillaSelec;

tab.addEventListener('mousedown', () => {
    eventoCasilla()
})

const eventoCasilla = () => {
    cas.forEach(casilla => {
        casilla.classList.remove('casillaNumSeleccionado')
        casilla.classList.remove('filaColumnaNumSeleccionado')

        casilla.addEventListener('mouseup', () => {
            casillaSelecionada = true
            casillaSelec = casilla
            marcarNumero(casillaSelec)
        })
    })
}





//Carga del primer tablero al iniciar la página
window.onload = function () {
    cargarJuego()
}

//Cargar tablero de juego
function cargarJuego() {
    //creando los números que manejan el juego
    for (let i = 1; i <= 9; i++) {
        let numero = document.createElement("div");
        numero.id = i;
        numero.innerText = i;

        //Llamamos si selecciona un numero
        numero.addEventListener("click", seleccionarNumero)

        numero.classList.add("numero");
        numero.classList.add("num-en-uso")
        document.getElementById("numeros").appendChild(numero)
    }

    //Llamado a la funcion que cuenta los numeros iniciales del tablero
    contarNumTablero(tablero)
    //Llamado a función que dibuja el tablero
    crearTablero()
}





//Efecto el seleccionar un número
function seleccionarNumero() {
    if (juegoEmpezado && !pausado && casillaSelecionada && !arrNumerosTerminados.includes(this) && !casillaSelec.classList.contains("encontrado")) {
        numSeleccionado = this
        casillaSelec.innerHTML = numSeleccionado.id
        seleccionarCasilla(casillaSelec)
    }
}

let arrCasillasResueltas = []

//Efecto al seleccionar una casilla
function seleccionarCasilla(a) {

    if (numSeleccionado && !pausado) {

        //Armamos las coordenadas de la casilla
        let coords = a.id.split("-")
        let fila = parseInt(coords[0])
        let columna = parseInt(coords[1])

        //Si el tablero no estaba escrito inicialmente entramos
        if (solucion[fila][columna] == numSeleccionado.id && !arrCasillasResueltas.includes(tablero[fila][columna])) {

            arrCasillasResueltas.push(solucion[fila][columna])
            //Lo marcamos como encontrado
            a.classList.add("encontrado")
            //Si tiene le quitamos el efecto de fallo
            if (a.classList.contains("numErroneo")) a.classList.remove("numErroneo")

            numeroCompleto(numSeleccionado.id)
        }
        else {
            //Cambiamos el numero en pantalla
            a.innerText = numSeleccionado.id
            //Sumamos errores y lo mostramos
            contErrores++
            if (contErrores == 3) {
                reiniciarJuego()
            } else {
                textoErrores.innerText = contErrores;
                //Efecto de error
                a.classList.add("numErroneo")
            }
        }
    }
    marcarNumero(casillaSelec)
}



//Función para manejar el efecto cuando un número fue completado
function numeroCompleto(num) {
    //Bloqueamos el numero porque ya no hay más
    if (objRepeticiones[num] == 8) {
        numSeleccionado.classList.add("numTerminado")
        numSeleccionado.classList.remove("num-en-uso")
        arrNumerosTerminados.push(numSeleccionado)
        numSeleccionado = null
    }
    //Si todavia hay numeros solo sumamos
    else {
        objRepeticiones[num] = (objRepeticiones[num] || 0) + 1;
    }
}

//Función que cuenta los numeros iniciales en el tablero
function contarNumTablero(array) {
    array.forEach(function (string) {
        var arrString = string.split('')
        arrString.forEach(function (numero) {
            if (numero !== "-") objRepeticiones[numero] = (objRepeticiones[numero] || 0) + 1;
        })
    });
}




//Esta función reinicia contadores
const reiniciarContadores = () => {
    arrNumerosTerminados.forEach(e => {
        e.classList.remove("numTerminado")
        e.classList.add("num-en-uso")
    })

    contErrores = 0;
    document.getElementById("errores").innerText = contErrores;
    objRepeticiones = {}
    arrNumerosTerminados = []
    casillaSelec = null
    casillaSelecionada = false
    eventoCasilla()
}


//Función que reinicia el tiempo de juego
const stop = () => {
    tiempoActual = 0;
    clearInterval(intervalTiempo);
    textoTiempo.textContent = "00:00";
}
//Función que maneja la pausa del tiempo de juego
const pause = () => {
    if (pausado) {
        // btnPausa.textContent = "REANUDAR";
        clearInterval(intervalTiempo)
    } else {
        // btnPausa.textContent = "PAUSAR";
        start();
    }

}
//Función que maneja el inicio del tiempo de juego
const start = () => {
    let t = Date.now() - tiempoActual;
    intervalTiempo = setInterval(() => {
        tiempoActual = Date.now() - t;
        textoTiempo.textContent = calcularTiempo(tiempoActual);
    }, 1000)
}

//Función que retorna el tiempo actual en minutos y segundos
const calcularTiempo = (tiempoActual) => {
    const segundos = Math.floor(tiempoActual / 1000)
    const minutos = Math.floor(segundos / 60)

    const msjSegundos = (segundos % 60).toString().padStart(2, "0");
    const msjMinutos = minutos.toString().padStart(2, "0")

    return `${msjMinutos}:${msjSegundos}`
}



//Marcar las casillas que contengan el numero seleccionado
const marcarNumero = (a) => {
    if (juegoEmpezado) {

        for (let f = 0; f < 9; f++) {
            for (let c = 0; c < 9; c++) {

                let elem = document.getElementById(`${f}-${c}`)

                elem.classList.remove('filaColumnaNumSeleccionado')
                elem.classList.remove('casillaNumSeleccionado')

                let b = elem.id.split('-')
                let ab = a.id.split('-')


                if (a.innerHTML == '' && !elem.classList.contains("numErroneo")) {

                    if (b[0] == ab[0] && b[1] != ab[1]) {
                        elem.classList.add('filaColumnaNumSeleccionado')
                    } else if (b[1] == ab[1] && b[0] != ab[0]) {
                        elem.classList.add('filaColumnaNumSeleccionado')
                    }
                    a.classList.add('casillaNumSeleccionado')
                }
                else if (elem.innerHTML == a.innerHTML && !elem.classList.contains("numErroneo")) {
                    elem.classList.add('casillaNumSeleccionado')
                }
            }
        }
    }
}