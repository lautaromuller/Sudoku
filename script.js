import data from './tableros.json' with { type: 'json' };

const btnFacil = document.querySelector(".btn-facil");
const btnMedio = document.querySelector(".btn-medio");
const btnDificil = document.querySelector(".btn-dificil");
const errores = document.getElementById('errores');

//numero que vamos a colocar en el tablero
var numSeleccionado = null

//Tablero inicial
var tablero = data["facil"][0].tablero;
var solucion = data["facil"][0].solucion;

//Contadores
var contErrores = 0;
var contFacil = 0;
var contMedio = 0;
var contDificil = 0;

//Arrays para deshabilitar los numeros ya encontrados
var objRepeticiones = {}
var arrNumerosTerminados = []

//Manejadores de eventos de los botones de dificultad
btnFacil.addEventListener("click", () => {
    contFacil += 1;
    if (contFacil > 9) contFacil = 0
    //Cambiamos texto del boton
    btnFacil.innerHTML = `Facil ${contFacil + 1}/10`
    //Llamamos a la funcion que trae el tablero
    seleccionarTablero("facil", contFacil)
    //Reiniciamos e iniciamos los valores necesarios
    reiniciarContadores();
    contarNumTablero(tablero)
})

btnMedio.addEventListener("click", () => {
    contMedio += 1;
    if (contMedio > 9) contMedio = 0
    btnMedio.innerHTML = `Medio ${contMedio + 1}/10`
    seleccionarTablero("medio", contMedio)
    reiniciarContadores();
    contarNumTablero(tablero)
})

btnDificil.addEventListener("click", () => {
    contDificil += 1;
    if (contDificil > 9) contDificil = 0
    btnDificil.innerHTML = `Dificil ${contDificil + 1}/10`
    seleccionarTablero("dificil", contDificil)
    reiniciarContadores();
    contarNumTablero(tablero)
})


//Función que cambia el tablero según el boton seleccionado
function seleccionarTablero(nivel, indice) {
    tablero = data[nivel][indice].tablero
    solucion = data[nivel][indice].solucion
    //Eliminamos el tablero actual y creamos otro
    document.getElementById("tablero").remove()
    const div = document.createElement("div")
    div.id = "tablero"
    //Agregamos el tablero arriba del div
    errores.insertAdjacentElement('afterend', div);
    crearTablero()
}


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
            //Si seleccionan una casilla llamamos
            casilla.addEventListener("click", seleccionarCasilla)

            casilla.classList.add("casilla")
            document.getElementById("tablero").appendChild(casilla)
        }
    }
}

//Carga del primer tablero al iniciar la página
window.onload = function () {
    cargarJuego()
}


function cargarJuego() {
    //creando los números que manejan el juego
    for (let i = 1; i <= 9; i++) {
        let numero = document.createElement("div");
        numero.id = i;
        numero.innerText = i;

        //Llamamos si selecciona un numero
        numero.addEventListener("click", seleccionarNumero)
        numero.classList.add("numero");
        document.getElementById("numeros").appendChild(numero)
    }
    //Llamado a la funcion que cuenta los numeros iniciales del tablero
    contarNumTablero(tablero)
    //Llamado a función que dibuja el tablero
    crearTablero()
}

//Efecto el seleccionar un número
function seleccionarNumero() {
    //Si el numero no está completado entramos
    if (!arrNumerosTerminados.includes(this.id)) {
        if (numSeleccionado != null) {
            numSeleccionado.classList.remove("numero-seleccionado")
        }
        numSeleccionado = this;
        numSeleccionado.classList.add("numero-seleccionado")
    }
}

//Efecto al seleccionar una casilla
function seleccionarCasilla() {
    if (numSeleccionado) {
        //Armamos las coordenadas de la casilla
        let coords = this.id.split("-")
        let fila = parseInt(coords[0])
        let columna = parseInt(coords[1])
        //Si el tablero no estaba escrito inicialmente entramos
        if (tablero[fila][columna] == "-") {

            //Si acierta entramos aca
            if (solucion[fila][columna] == numSeleccionado.id) {
                this.innerText = numSeleccionado.id
                // llamado a función que verifica si encontramos las 9 apariciones del numero
                numeroCompleto(numSeleccionado.id)

                //Lo marcamos como encontrado
                this.classList.add("encontrado")
                //Si tiene le quitamos el efecto de fallo
                if (this.classList.contains("numErroneo")) this.classList.remove("numErroneo")
            }
            //Si erra y no es el mismo numero que está puesto entramos aca
            else if (!(this.classList.contains("encontrado")) && this.innerText != numSeleccionado.id) {
                //Cambiamos el numero en pantalla
                this.innerText = numSeleccionado.id
                //Sumamos errores y lo mostramos
                contErrores++
                document.getElementById("errores").innerText = contErrores;
                //Efecto de error
                this.classList.add("numErroneo")
            }
        }
    }
}


function numeroCompleto(num) {
    //Bloqueamos el numero porque ya no hay más
    if (objRepeticiones[num] == 8) {
        numSeleccionado.classList.add("numTerminado")
        arrNumerosTerminados.push(num)
    }
    //Si todavia hay numeros solo sumamos
    else {
        objRepeticiones[num] = (objRepeticiones[num] || 0) + 1;
    }
}

//Funcion que cuenta los numeros iniciales en el tablero
function contarNumTablero(array) {
    array.forEach(function (string) {
        var arrString = string.split('')
        arrString.forEach(function (numero) {
            if (numero !== "-") objRepeticiones[numero] = (objRepeticiones[numero] || 0) + 1;
        })
    });
    console.log(objRepeticiones)
}

const reiniciarContadores = () => {
    numSeleccionado = null

    contErrores = 0;

    objRepeticiones = {}
    arrNumerosTerminados = []

}
