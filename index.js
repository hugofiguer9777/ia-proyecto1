const express = require('express')
const app = express()
const port = process.env.PORT || 3000


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
  console.log(jugador, "oponente: ", oponente);

  res.send(resultado)
})

app.listen(port, () => {
  console.log(` Running on port :${port}`)
});

function iniciar(tablero, jug) {

  let valor = minimax(tablero, 0, true, 0);
  let cad = getY(valor[1]) + '' + getX(valor[1]);
  console.log("RESULTADO (", valor, getY(valor[1]), ',', getX(valor[1]), ')');

  return cad;

}

function minimax(tablero, depth, isMaximizing, indice) {

  if (depth == 3) {

    return [heuristicas[indice], indice];
  }
  if (isMaximizing) {
    let best = [-999, 0]

    let tempMovs = allPosibleMovements(tablero, jugador);
    let indexBest = [0, 0];

    if (tempMovs.length == 0) { return [heuristicas[indice], indice]; }

    for (var item of tempMovs) {

      if (depth == 0 && heuristicas[item[1]] == 120) { return [heuristicas[item[1]], item[1]]; }

      let tempTablero = fillingMovs(tablero, item, jugador);

      let valor = minimax(tempTablero, depth + 1, false, item[1]);
      if (valor[0] > best[0]) indexBest = item;
      best = valor[0] > best[0] ? valor : best;

      if (depth == 0) { console.log("mov (origen,destino,direccion):", item, "heuristica ", valor[0]); }
    }

    if (depth == 0) {
      best[1] = indexBest[1];
    }

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

    return best;
  }
}