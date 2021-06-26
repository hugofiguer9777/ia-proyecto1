const express = require('express')
const app = express()
const port = process.env.PORT || 3000

var jugadores = ["NEGRAS", "BLANCAS"];

var jugador;
var oponente;

var heuristicas = [
  120, -20, 20, 5, 5, 20, -20, 120,
  -20, -40, -5, -5, -5, -5, -40, -20,
  20, -5, 15, 3, 3, 15, -5, 20,
  5, -5, 3, 3, 3, 3, -5, 5,
  5, -5, 3, 3, 3, 3, -5, 5,
  20, -5, 15, 3, 3, 15, -5, 20,
  -20, -40, -5, -5, -5, -5, -40, -20,
  120, -20, 20, 5, 5, 20, -20, 120,
];

var cadTablero = ''

var board = [];

function convertCadToArray() {
  board = [];
  for (var c of cadTablero) {
    board.push(c);
  }
  console.log(cadTablero);
}

function printTablero(tablero) {
  let cadTemp = '';
  let indiceX = 0;
  for (var i = 0; i < tablero.length; i++) {
    if (i % 8 == 0 && i != 0) {
      console.log(indiceX, cadTemp + '|');
      cadTemp = '';
      indiceX++;
    }
    cadTemp += '|' + tablero[i];
  }
  console.log(indiceX, cadTemp);
}

function getOponente(jugador) {
  return jugador == 1 ? 1 : 0;
}

function getX(pos) { return pos % 8; }
function getY(pos) { return Math.floor(pos / 8); }


function minimax(tablero, depth, isMaximizing, indice) {
  //printTablero(tablero);
  //console.log(isMaximizing,"profundidad ",depth);
  if (depth == 3) {
    //console.log("RET ",indice,heuristicas[indice]);
    return [heuristicas[indice], indice];
  }
  if (isMaximizing) {
    let best = [-999, 0] // heuristica, indiceDestino

    let tempMovs = allPosibleMovements(tablero, jugador);
    let indexBest = [0, 0]; // origen, destino

    if (tempMovs.length == 0) { return [heuristicas[indice], indice]; }

    for (var item of tempMovs) {

      if (depth == 0 && heuristicas[item[1]] == 120) { return [heuristicas[item[1]], item[1]]; } // si tiene el mejor movimiento lo retorna

      let tempTablero = fillingMovs(tablero, item, jugador); // llena la tabla temporal de movimientos

      let valor = minimax(tempTablero, depth + 1, false, item[1]); // obtiene el valor minimo
      if (valor[0] > best[0]) indexBest = item; // si es el mejor, asignar el indice  
      best = valor[0] > best[0] ? valor : best; // se guarda la mejor heuristica

      if (depth == 0) { console.log("mov (origen,destino,direccion):", item, "heuristica ", valor[0]); }
    }

    if (depth == 0) {
      best[1] = indexBest[1];
      console.log("Movimientos depth 0 ", tempMovs);
      console.log(" Finalizando Mejor (heuristica,indexDestino)", best, "DE: origen, destino,direccion ", indexBest);
    }
    //console.log('Finalizando iteracion max',best,'profundidad',depth,"jugador", jugador);
    return best;
  } else {
    let best = [999, 0];
    let tempMovs = allPosibleMovements(tablero, oponente);
    if (tempMovs.length == 0) { return [heuristicas[indice], indice]; }
    for (var item of tempMovs) {
      let tempTablero = fillingMovs(tablero, item, oponente);
      let valor = minimax(tempTablero, depth + 1, true, item[1]);
      best = valor[0] < best[0] ? valor : best;
    }
    //console.log('Finalizando iteracion MIN',best,'profundidad',depth,"jugador",oponente);

    return best;
  }
}



function getPosiblesMovimientos(tablero, indice, jug) {
  let tempIndex = 0;
  let step = [-1, -9, -8, -7, 1, 9, 8, 7];
  let dir = [-1, -1, 0, 1, 1, 1, 2, -1];
  let movimientos = [];
  let maxLeft = 0;
  let maxUp = 0;

  let maxX = getX(indice);
  let maxY = getY(indice);
  let indexX = 0;
  let indexY = 0;
  let enemigo = false;
  let maxMovs = 0;

  for (var i = 0; i < step.length; i++) { // posibles direcciones
    enemigo = false;
    tempIndex = indice;
    //maxMovs=dir[i]==-1?maxX:(dir[i]==1?8-maxX:(dir[i]==0?maxY:8-maxY));
    if (step[i] == -1) maxMovs = maxX;
    else if (step[i] == -9) maxMovs = Math.min(maxX, maxY);
    else if (step[i] == -8) maxMovs = maxY;
    else if (step[i] == -7) maxMovs = Math.min(7 - maxX, maxY);
    else if (step[i] == 1) maxMovs = 7 - maxX;
    else if (step[i] == 9) maxMovs = Math.min((7 - maxX), (7 - maxY));
    else if (step[i] == 8) maxMovs = 7 - maxY;
    else if (step[i] == 7) maxMovs = Math.min(maxX, 7 - maxY);

    //console.log("Limite movs for:",indice," cant. ",maxMovs," step: ",step[i]," dir:",dir[i]);
    for (var j = 0; j < maxMovs; j++) { // cantidad maxima de pasos maximos
      tempIndex += step[i];

      if (tempIndex >= 0 && tempIndex <= 64) {
        if (tempIndex == 0 && enemigo && tablero[tempIndex] == 2) console.log('------------> ', indice, heuristicas[tempIndex]);
        //console.log(tablero[tempIndex],jug);
        if (tablero[tempIndex] == jug) {
          //console.log("Jugadores iguales ",indice,tempIndex);
          break;
        } else if (tablero[tempIndex] == 2 && !enemigo) {
          break;
        } else if (tablero[tempIndex] == 2 && enemigo) {
          movimientos.push([indice, tempIndex, step[i]]);
          break;
        } else if (tablero[tempIndex] != jug) {
          enemigo = true;
        }
      } else {
        break;
      }
      indexX++;
      indexY++;
    }
  }

  return movimientos;
}


function fillingMovs(tablero, arr, jug) {
  let newTablero = Object.assign([], tablero);
  //console.log(arr);
  tempIndex = arr[0];

  for (var i = 0; i < 8; i++) {
    tempIndex += arr[2];
    //console.log("Indice Actual",tempIndex,arr[2]>0 && tempIndex<=arr[1],
    //  arr[2]<0 && tempIndex>=arr[1]);
    if (arr[2] > 0 && tempIndex <= arr[1] // si step es positivo el indice debe ser menor que el limite superior
      || arr[2] < 0 && tempIndex >= arr[1]) { //si step es negativo, el indice debe ser mayor al limite inferior
      newTablero[tempIndex] = jug + '';
    } else {
      break;
    }
  }
  //console.log("TABLERO NUEVO" ,newTablero);
  return newTablero;
}

function allPosibleMovements(tablero, jug) {
  let movimientos = [];
  for (var i = 0; i < tablero.length; i++) {
    if (tablero[i] == jug) {
      //console.log("MOV. POS., pos ",i," - x:",getX(i),"y:",getY(i),jugadores[jugador]);
      movimientos = movimientos.concat(getPosiblesMovimientos(tablero, i, jug));

    }
  }

  return movimientos;
}


function iniciar(tablero, jug) {

  let valor = minimax(tablero, 0, true, 0);
  let cad = getY(valor[1]) + '' + getX(valor[1]);
  console.log("RESULTADO (", valor, getY(valor[1]), ',', getX(valor[1]), ')');

  return cad;

}


app.get('/', (req, res) => {
  turno = req.query.turno;
  estado = req.query.estado;
  console.log(turno, estado);
  jugador = turno;
  oponente = jugador == 1 ? 0 : 1;
  cadTablero = estado;
  convertCadToArray();
  printTablero(board);
  let resultado = iniciar(board, jugador);
  //let s= allPosibleMovements(board,jugador);
  //let cad= getY(s[0][1])+''+getX(s[0][1]);
  //console.log("Final ",cad);
  console.log(jugador, "oponente: ", oponente);

  res.send(resultado)
})

app.listen(port, () => {
  console.log(` Running on port :${port}`)
});