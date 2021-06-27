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

var reversi = {

  father: null,
  score: null,
  rows: 8,
  cols: 8,
  grid: [],
  states: {
    'blank': { 'id': 0, 'color': 'white' },
    'white': { 'id': 1, 'color': 'white' },
    'black': { 'id': 2, 'color': 'black' }
  },
  turn: null,

  init: function (selector) {

    this.father = document.getElementById(selector);

    if (null === this.father) {

      return;
    }
    this.father.className = (this.father.className ? this.father.className + ' ' : '') + 'reversi';

    this.prepareGrid();

    this.initGame();
  },

  initGame: function () {
    this.setTurn(this.states.black);

    this.setItemState(4, 4, this.states.white);
    this.setItemState(4, 5, this.states.black);
    this.setItemState(5, 4, this.states.black);
    this.setItemState(5, 5, this.states.white);

    this.setScore(2, 2);
  },

  passTurn: function () {

    var turn = (this.turn.id === this.states.black.id) ? this.states.white : this.states.black;

    this.setTurn(turn);
  },

  setTurn: function (state) {
    this.turn = state;
    var isBlack = (state.id === this.states.black.id);
    this.score.black.elem.style.textDecoration = isBlack ? 'underline' : '';
    this.score.white.elem.style.textDecoration = isBlack ? '' : 'underline';
  },

  initItemState: function (elem) {

    return {
      'state': this.states.blank,
      'elem': elem
    };
  },

  isVisible: function (state) {
    return (state.id === this.states.white.id || state.id === this.states.black.id);
  },

  isVisibleItem: function (row, col) {
    return this.isVisible(this.grid[row][col].state);
  },

  isValidPosition: function (row, col) {
    return (row >= 1 && row <= this.rows) && (col >= 1 && col <= this.cols);
  },

  setItemState: function (row, col, state) {

    if (!this.isValidPosition(row, col)) {

      return;
    }

    this.grid[row][col].state = state;
    this.grid[row][col].elem.style.visibility = this.isVisible(state) ? 'visible' : 'hidden';
    this.grid[row][col].elem.style.backgroundColor = state.color;
  },

  prepareGrid: function () {

    var table = document.createElement('table');

    table.setAttribute('border', 0);
    table.setAttribute('cellpadding', 0);
    table.setAttribute('cellspacing', 0);

    for (var i = 1; i <= this.rows; i++) {

      var tr = document.createElement('tr');

      table.appendChild(tr);

      this.grid[i] = [];

      for (var j = 1; j <= this.cols; j++) {

        var td = document.createElement('td');

        tr.appendChild(td);

        this.bindMove(td, i, j);

        this.grid[i][j] = this.initItemState(td.appendChild(document.createElement('span')));
      }
    }

    var scoreBar = document.createElement('div'),
      scoreBlack = document.createElement('span'),
      scoreWhite = document.createElement('span');

    scoreBlack.className = 'score-node score-black';
    scoreWhite.className = 'score-node score-white';

    scoreBar.appendChild(scoreBlack);
    scoreBar.appendChild(scoreWhite);

    this.father.appendChild(scoreBar);

    // set the score object
    this.score = {
      'black': {
        'elem': scoreBlack,
        'state': 0
      },
      'white': {
        'elem': scoreWhite,
        'state': 0
      },
    }
    this.father.appendChild(table);
  },

  recalcuteScore: function () {

    var scoreWhite = 0,
      scoreBlack = 0;

    for (var i = 1; i <= this.rows; i++) {
      for (var j = 1; j <= this.cols; j++) {
        if (this.isValidPosition(i, j) && this.isVisibleItem(i, j)) {
          if (this.grid[i][j].state.id === this.states.black.id) {

            scoreBlack++;
          } else {

            scoreWhite++;
          }
        }
      }
    }

    this.setScore(scoreBlack, scoreWhite);
  },

  setScore: function (scoreBlack, scoreWhite) {

    this.score.black.state = scoreBlack;
    this.score.white.state = scoreWhite;

    this.score.black.elem.innerHTML = '&nbsp;' + scoreBlack + '&nbsp;';
    this.score.white.elem.innerHTML = '&nbsp;' + scoreWhite + '&nbsp;';
  },

  isValidMove: function (row, col) {

    var current = this.turn,
      rowCheck,
      colCheck,
      toCheck = (current.id === this.states.black.id) ? this.states.white : this.states.black;

    if (!this.isValidPosition(row, col) || this.isVisibleItem(row, col)) {

      return false;
    }

    for (var rowDir = -1; rowDir <= 1; rowDir++) {

      for (var colDir = -1; colDir <= 1; colDir++) {

        if (rowDir === 0 && colDir === 0) {

          continue;
        }
        rowCheck = row + rowDir;
        colCheck = col + colDir;

        var itemFound = false;

        while (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === toCheck.id) {

          // move to next position
          rowCheck += rowDir;
          colCheck += colDir;

          itemFound = true;
        }
        if (itemFound) {
          if (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === current.id) {

            return true;
          }
        }
      }
    }
    return false;
  },

  canMove: function () {

    for (var i = 1; i <= this.rows; i++) {
      for (var j = 1; j <= this.cols; j++) {
        if (this.isValidMove(i, j)) {

          return true;
        }
      }
    }

    return false;
  },

  bindMove: function (elem, row, col) {

    var self = this;
    elem.onclick = function (event) {

      if (self.canMove()) {
        if (self.isValidMove(row, col)) {
          self.move(row, col);
          if (!self.canMove()) {

            self.passTurn();
            if (!self.canMove()) {

              self.endGame();
            }
          }
          if (self.checkEnd()) {

            self.endGame();
          }
        }
      }
    };
  },

  endGame: function () {

    var result = (this.score.black.state > this.score.white.state)
      ?
      1
      : (
        (this.score.white.state > this.score.black.state) ? -1 : 0
      ), message;

    switch (result) {

      case 1: { message = 'Cierny vyhral.'; } break;
      case -1: { message = 'Biely vyhral.'; } break;
      case 0: { message = 'Remiza.'; } break;
    }

    alert(message);
    this.reset();
  },

  clear: function () {

    for (var i = 1; i <= this.rows; i++) {

      for (var j = 1; j <= this.cols; j++) {

        this.setItemState(i, j, this.states.blank);
      }
    }
  },

  reset: function () {
    this.clear();
    this.initGame();
  },

  checkEnd: function (lastMove) {

    for (var i = 1; i <= this.rows; i++) {
      for (var j = 1; j <= this.cols; j++) {
        if (this.isValidPosition(i, j) && !this.isVisibleItem(i, j)) {

          return false;
        }
      }
    }

    return true;
  },

  move: function (row, col) {

    var finalItems = [],
      current = this.turn,
      rowCheck,
      colCheck,
      toCheck = (current.id === this.states.black.id) ? this.states.white : this.states.black;
    for (var rowDir = -1; rowDir <= 1; rowDir++) {

      for (var colDir = -1; colDir <= 1; colDir++) {
        if (rowDir === 0 && colDir === 0) {

          continue;
        }

        rowCheck = row + rowDir;
        colCheck = col + colDir;

        var possibleItems = [];
        while (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === toCheck.id) {

          possibleItems.push([rowCheck, colCheck]);

          rowCheck += rowDir;
          colCheck += colDir;
        }

        if (possibleItems.length) {

          if (this.isValidPosition(rowCheck, colCheck) && this.isVisibleItem(rowCheck, colCheck) && this.grid[rowCheck][colCheck].state.id === current.id) {
            finalItems.push([row, col]);

            for (var item in possibleItems) {

              finalItems.push(possibleItems[item]);
            }
          }
        }
      }
    }

    if (finalItems.length) {

      for (var item in finalItems) {

        this.setItemState(finalItems[item][0], finalItems[item][1], current);
      }
    }
    this.setTurn(toCheck);
    this.recalcuteScore();
  }
};