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
