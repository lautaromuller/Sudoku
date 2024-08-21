import data from './tableros.json' with { type: 'json' };

//Elementos seleccionados
const btnFacil = document.querySelector(".btn-facil");
const btnMedio = document.querySelector(".btn-medio");
const btnDificil = document.querySelector(".btn-dificil");
const btnComenzar = document.getElementById('btnComenzar');
const textoTiempo = document.getElementById("tiempo");
const textoErrores = document.getElementById("errores");
const btnPausa = document.getElementById('btnPausa');
const contenedorTablero = document.getElementById("contenedor-tablero")
const btnBorrar = document.createElement("button");
const contenedorNumeros = document.getElementById("numeros")


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
let dificultad = "facil";
let indice = 0;

//Arrays para ordenar casillas
let arrCasillas = []
let casillaSelecionada = false
let casillaSelec;

//Arrays para deshabilitar los numeros ya encontrados
let arrCasillasResueltas = []
let arrNumerosTerminados = []
let numColocado = false


//Manejadores de eventos de los botones de dificultad
btnFacil.addEventListener("click", () => {
    if (!juegoEmpezado) {
        if (dificultad == 'facil') {

            contFacil += 1;
            if (contFacil > 9) contFacil = 0

            //Cambiamos texto del boton
            btnFacil.innerHTML = `Facil ${contFacil + 1}/10`
            //Llamamos a la funcion que trae el tablero
            indice = contFacil
            //Reiniciamos e iniciamos los valores necesarios
            reiniciarContadores();
        }
        else {
            btnMedio.classList.remove('btn-dificultad-actual')
            btnDificil.classList.remove('btn-dificultad-actual')
            dificultad = "facil"
            btnFacil.classList.add('btn-dificultad-actual')
        }
        seleccionarTablero("facil", contFacil)
    }
})

btnMedio.addEventListener("click", () => {
    if (!juegoEmpezado) {
        if (dificultad == 'medio') {

            contMedio += 1;
            if (contMedio > 9) contMedio = 0

            btnMedio.innerHTML = `Medio ${contMedio + 1}/10`
            indice = contMedio
            reiniciarContadores();
        }
        else {
            btnFacil.classList.remove('btn-dificultad-actual')
            btnDificil.classList.remove('btn-dificultad-actual')
            dificultad = "medio"
            btnMedio.classList.add('btn-dificultad-actual')
        }
        seleccionarTablero("medio", contMedio)
    }
})

btnDificil.addEventListener("click", () => {
    if (!juegoEmpezado) {
        if (dificultad == 'dificil') {

            contDificil += 1;
            if (contDificil > 9) contDificil = 0

            btnDificil.innerHTML = `Dificil ${contDificil + 1}/10`
            indice = contDificil
            reiniciarContadores();
        }
        else {
            btnFacil.classList.remove('btn-dificultad-actual')
            btnMedio.classList.remove('btn-dificultad-actual')
            dificultad = "dificil"
            btnDificil.classList.add('btn-dificultad-actual')
        }
        seleccionarTablero("dificil", contDificil)
    }
})

//Manejador del evento click en el boton comenzar juego/reiniciar
btnComenzar.addEventListener("click", () => {
    reiniciarJuego()
})

//Manejador del evento click en el boton de play/pausa
btnPausa.addEventListener("click", () => {
    btnPausa.classList.toggle("btn-reanudar")
    pausado = !pausado;

    pause();
})

btnBorrar.addEventListener("click", () => {
    if (casillaSelec != null && casillaSelec.classList.contains("num-erroneo")) {
        casillaSelec.classList.remove("num-erroneo")
        casillaSelec.innerText = ''
        casillaSelec = null
    }
})

function reiniciarJuego(){

    if (!juegoEmpezado) {
        juegoEmpezado = true;
        btnComenzar.textContent = "TERMINAR JUEGO";

        btnPausa.classList.remove("btn-reanudar")
        pausado = false

        start();
    }
    else {
        juegoEmpezado = false;
        btnComenzar.textContent = "COMENZAR JUEGO";

        seleccionarTablero(dificultad, indice)
        stop();
    }

    btnPausa.toggleAttribute("hidden")
    btnComenzar.classList.toggle("reiniciar")
}

//Función que cambia el tablero según el boton seleccionado
function seleccionarTablero(nivel, indice) {
    tablero = data[nivel][indice].tablero
    solucion = data[nivel][indice].solucion
    //Eliminamos el tablero actual y creamos otro
    document.getElementById("tablero").remove()
    const div = document.createElement("div")
    div.id = "tablero"
    //Agregamos el tablero dentro de su contenedor
    contenedorTablero.appendChild(div)
    reiniciarContadores()
    crearTablero()
}

//Función que dibuja el tablero
function crearTablero() {
    let c1 = []
    let c2 = []
    let c3 = []
    let c4 = []
    let c5 = []
    let c6 = []
    let c7 = []
    let c8 = []
    let c9 = []

    for (let f = 0; f < 9; f++) {
        for (let c = 0; c < 9; c++) {
            let casilla = document.createElement("div");
            //id con fila y columna
            casilla.id = f.toString() + "-" + c.toString()

            //Si la casilla no debe empazar vacia, la llenamos
            if (tablero[f][c] != "-") {
                casilla.innerText = tablero[f][c]
                casilla.classList.add("casilla-inicial")
                arrCasillasResueltas.push(solucion[f][c])
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

            casilla.addEventListener('mouseup', () => {
                casillaSelecionada = true
                casillaSelec = casilla
                marcarNumero()
            })

            switch (f) {
                case 0:
                case 1:
                case 2:
                    if (c < 3) c1.push(casilla)
                    else if (c < 6) c2.push(casilla)
                    else c3.push(casilla)
                    break
                case 3:
                case 4:
                case 5:
                    if (c < 3) c4.push(casilla)
                    else if (c < 6) c5.push(casilla)
                    else c6.push(casilla)
                    break
                case 6:
                case 7:
                case 8:
                    if (c < 3) c7.push(casilla)
                    else if (c < 6) c8.push(casilla)
                    else c9.push(casilla)
                    break
            }
        }
    }
    arrCasillas.push(c1, c2, c3, c4, c5, c6, c7, c8, c9)
}

//Carga del primer tablero al iniciar la página
window.onload = function () {
    cargarJuego()
}

//Cargar tablero de juego
function cargarJuego() {

    btnBorrar.innerHTML = "Borrar"
    btnBorrar.id = "btnBorrar"
    btnBorrar.classList.add("btn-borrar");
    contenedorNumeros.appendChild(btnBorrar)

    //creando los números que manejan el juego
    for (let i = 1; i <= 9; i++) {
        let numero = document.createElement("button");
        numero.id = i;
        numero.innerText = i;

        //Llamamos si selecciona un numero
        numero.addEventListener("click", seleccionarNumero)

        numero.classList.add("numero");
        numero.classList.add("num-en-uso")
        contenedorNumeros.appendChild(numero)
    }

    //Llamado a función que dibuja el tablero
    crearTablero()
}

//Efecto el seleccionar un número
function seleccionarNumero(){
    if (juegoEmpezado && !pausado && casillaSelecionada && casillaSelec && !arrNumerosTerminados.includes(this) && !casillaSelec.classList.contains("num-encontrado") && !casillaSelec.classList.contains("casilla-inicial")) {
        numSeleccionado = this
        seleccionarCasilla()
    }
}

//Efecto al seleccionar una casilla
function seleccionarCasilla() {

    //Armamos las coordenadas de la casilla
    let coords = casillaSelec.id.split("-")
    let fila = parseInt(coords[0])
    let columna = parseInt(coords[1])

    let numAnterior = casillaSelec.innerHTML
    casillaSelec.innerHTML = numSeleccionado.id
    //Si el numero es correcto, entramos
    if (solucion[fila][columna] == numSeleccionado.id && !arrCasillasResueltas.includes(tablero[fila][columna])) {

        arrCasillasResueltas.push(solucion[fila][columna])

        //Lo marcamos como encontrado
        casillaSelec.classList.add("num-encontrado")
        //Si tiene le quitamos el efecto de fallo
        if (casillaSelec.classList.contains("num-erroneo")) casillaSelec.classList.remove("num-erroneo")
        numColocado = true
        numeroCompleto(numSeleccionado.id)
    }
    else {

        if (numAnterior != numSeleccionado.id) {
            //Sumamos errores y lo mostramos
            contErrores++
            if (contErrores == 3) {
                reiniciarJuego()
            } else {
                textoErrores.innerText = contErrores;
                //Efecto de error
                casillaSelec.classList.add("num-erroneo")
            }
        }
    }
    marcarNumero()
}

//Función para manejar el efecto cuando un número fue completado
const numeroCompleto = (num) => {
    let contApariciones = 0
    //Bloqueamos el numero porque ya no hay más
    for (let i = 0; i < arrCasillasResueltas.length; i++) {
        if (arrCasillasResueltas[i] == num) {
            contApariciones++
        }
    }
    if (contApariciones == 9) {
        numSeleccionado.classList.add("num-terminado")
        numSeleccionado.classList.remove("num-en-uso")
        arrNumerosTerminados.push(numSeleccionado)
        numSeleccionado = null
    }
}

//Esta función reinicia contadores
const reiniciarContadores = () => {
    arrNumerosTerminados.forEach(e => {
        e.classList.remove("num-terminado")
        e.classList.add("num-en-uso")
    })

    contErrores = 0;
    document.getElementById("errores").innerText = contErrores;
    arrNumerosTerminados = []
    arrCasillasResueltas = []
    casillaSelec = null
    casillaSelecionada = false
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
        clearInterval(intervalTiempo)
    } else {
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
function calcularTiempo(tiempoActual){
    const segundos = Math.floor(tiempoActual / 1000)
    const minutos = Math.floor(segundos / 60)

    const msjSegundos = (segundos % 60).toString().padStart(2, "0");
    const msjMinutos = minutos.toString().padStart(2, "0")

    return `${msjMinutos}:${msjSegundos}`
}

//Marcar las casillas que contengan el numero seleccionado
function marcarNumero(){
    if (juegoEmpezado && !pausado) {
        borrarCasillasSeleccionadas()
        if (casillaSelec != null) {

            let indexCuadro;
            arrCasillas.forEach((arr, index) => {
                if (arr.includes(casillaSelec)) {
                    indexCuadro = index
                }
            })

            let arrCuadro = []
            let arrColumna = []
            let arrFila = []

            for (let f = 0; f < 9; f++) {
                for (let c = 0; c < 9; c++) {

                    let elem = document.getElementById(`${f}-${c}`)
                    let elemId = elem.id.split('-')
                    let casSeleccionadaId = casillaSelec.id.split('-')

                    if (casillaSelec.classList.contains("num-erroneo")) {
                        if ((elemId[0] == casSeleccionadaId[0] && elemId[1] != casSeleccionadaId[1]) || (elemId[1] == casSeleccionadaId[1] && elemId[0] != casSeleccionadaId[0])) {
                            if (elem.innerHTML == casillaSelec.innerHTML) {
                                elem.classList.add('num-igual-erroneo')
                            }
                            else {
                                elem.classList.add('fila-col-errada')
                            }
                        }
                        casillaSelec.classList.add('casilla-erronea-seleccionada')
                    }

                    else {
                        if (elem.id == casillaSelec.id) {
                            elem.classList.add('casilla-seleccionada')
                            arrFila.push(elem)
                            arrColumna.push(elem)
                        }

                        else if (elem.innerHTML == casillaSelec.innerHTML && elem.innerHTML != '') {
                            if (elem.classList.contains('num-erroneo')) {
                                elem.classList.add('casilla-erronea-seleccionada')
                            }
                            else {
                                elem.classList.add('casilla-seleccionada')
                            }
                        }

                        else if ((elemId[0] == casSeleccionadaId[0] && elemId[1] != casSeleccionadaId[1])) {
                            elem.classList.add('fila-col-activa')
                            arrFila.push(elem)
                        }
                        else if ((elemId[1] == casSeleccionadaId[1] && elemId[0] != casSeleccionadaId[0])) {
                            elem.classList.add('fila-col-activa')
                            arrColumna.push(elem)
                        }
                    }
                }
            }

            if (casillaSelec.classList.contains("num-erroneo")) {
                arrCasillas[indexCuadro].forEach(cas => {

                    if (cas.innerHTML == casillaSelec.innerHTML && cas.id != casillaSelec.id) {
                        cas.classList.add('num-igual-erroneo')
                    }
                    else if (cas.innerHTML != casillaSelec.innerHTML) {
                        cas.classList.add('fila-col-errada')
                    }
                })
            }
            else {
                arrCasillas[indexCuadro].forEach(cas => {
                    if (cas.id != casillaSelec.id) {
                        cas.classList.add('fila-col-activa')
                    }
                    arrCuadro.push(cas)
                })
            }

            if(numColocado){
                efectoDeCompletado(arrCuadro, arrFila, arrColumna)
                numColocado = !numColocado
            }
        }
    }
}

//Función que recorre todas las casillas y borra sus efectos actuales
const borrarCasillasSeleccionadas = (soloIguales = false) => {
    for (let f = 0; f < 9; f++) {
        for (let c = 0; c < 9; c++) {

            let elem = document.getElementById(`${f}-${c}`)
            elem.classList.remove('casilla-seleccionada')
            if(!soloIguales){

                elem.classList.remove('fila-col-activa')
                elem.classList.remove('fila-col-errada')
                elem.classList.remove('num-igual-erroneo')
                elem.classList.remove('casilla-erronea-seleccionada')
            }
        }
    }
}

//Función principal para manejar el efecto de los cuadros, filas o columnas completadas
function efectoDeCompletado(cuadro, fila, columna){
    if (estaCompleto(cuadro)) efectoCompleto1(cuadro)
    if (estaCompleto(fila)) efectoCompleto1(fila)
    if (estaCompleto(columna)) efectoCompleto1(columna)
}

//Retorna true si todos los elementos del array contienen texto
const estaCompleto = (arr) => {
    let completado = true
    arr.forEach(e => {
        if (e.innerHTML == '') {
            completado = false
        }
    })
    if(completado) borrarCasillasSeleccionadas(true)
    return completado
}

//Primera parte del efecto. Espera que la segunda parte agregue el efecto y despues lo borra
const efectoCompleto1 = async (arr) => {
    for (const e of arr) {
        if(!e.classList.contains("fila-col-activa")){
            e.classList.add("fila-col-activa")
        }
        await efectoCompleto2(e);
        e.classList.remove("efecto-completo");
    }
    marcarNumero()
}

//Segunda parte del efecto. Agrega el efecto y espera un tiempo
const efectoCompleto2 = e => {
    return new Promise((resolve) => {
        e.classList.add("efecto-completo");
        setTimeout(() => {
            resolve();
        }, 80);
    });
}
