import { useContext, useState, useReducer } from "react";
import { AppContext } from "../App";
import GameBoard from "./GameBoard";

const MINIMAX_DEPTH_MIN = 2;
const MINIMAX_DEPTH_MAX = 5;

const randIntBetween = (min, max) => {
  // inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const WINNING_COMBINATIONS = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [2, 1],
  ],
  [
    [0, 2],
    [1, 2],
    [2, 2],
  ],
];

const isPlacementComplete = (board) => {
  let count = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell !== null) {
        count++;
      }
    }
  }
  return count === 6;
};

const isAdjacent = (row1, cell1, row2, cell2) => {
  return (
    (row1 === row2 && Math.abs(cell1 - cell2) === 1) ||
    (cell1 === cell2 && Math.abs(row1 - row2) === 1)
  );
};

const isCurrentPlayerPiece = (state, row, cell) => {
  return state.board[row][cell] === state.current_player;
};

// check if current state player is a winner
const checkForWinner = (state) => {
  const { board, current_player } = state;
  for (let combination of WINNING_COMBINATIONS) {
    let count = 0;
    for (let [row, cell] of combination) {
      if (board[row][cell] === current_player) {
        count++;
      }
    }
    if (count === 3) {
      return current_player;
    }
  }
  return null;
};

// check if a given player is a winner
const winning = (board, player) => {
  for (let combination of WINNING_COMBINATIONS) {
    let count = 0;
    for (let [row, cell] of combination) {
      if (board[row][cell] === player) {
        count++;
      }
    }
    if (count === 3) {
      return true;
    }
  }
  return false;
};

const boardHasAtLeastPieces = (board, count) => {
  let pieces = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell !== null) {
        pieces++;
      }
    }
  }
  return pieces >= count;
};

const placePiece = (state, { row_index, cell_index }) => {
  const cell = state.board[row_index][cell_index];
  if (cell === null) {
    const new_board = [...state.board];
    new_board[row_index][cell_index] = state.current_player;

    // change is_placement_phase to false if all pieces are placed, 3 for each player
    const new_is_placement_phase = isPlacementComplete(new_board)
      ? false
      : true;
    const new_state = {
      ...state,
      board: new_board,
      current_player: state.current_player === "a" ? "b" : "a",
      is_placement_phase: new_is_placement_phase,
    };
    // check for winner
    if (boardHasAtLeastPieces(new_board, 5)) {
      // check for winner
      const winner = checkForWinner({
        ...new_state,
        current_player: state.current_player,
      });
      if (winner) {
        return {
          ...new_state,
          winner,
        };
      }
    }

    return new_state;
  }
  return state;
};

const selectPiece = (state, { row_index, cell_index }) => {
  const cell = state.board[row_index][cell_index];
  if (cell === state.current_player) {
    console.log("selecting piece");
    return {
      ...state,
      selected_piece: [row_index, cell_index],
    };
  }
  return state;
};

const moveSelectedPiece = (state, { row_index, cell_index }) => {
  console.log("moving piece");
  const [selected_row, selected_cell] = state.selected_piece;
  const cell = state.board[row_index][cell_index]; // cell we are moving to
  if (
    cell === null &&
    isAdjacent(selected_row, selected_cell, row_index, cell_index) &&
    isCurrentPlayerPiece(state, selected_row, selected_cell)
  ) {
    // move piece
    const new_board = [...state.board];
    new_board[selected_row][selected_cell] = null;
    new_board[row_index][cell_index] = state.current_player;
    const new_state = {
      ...state,
      board: new_board,
      selected_piece: null,
      current_player: state.current_player === "a" ? "b" : "a",
    };

    // check for winner
    const winner = checkForWinner({
      ...new_state,
      current_player: state.current_player,
    });
    if (winner) {
      return {
        ...new_state,
        winner,
      };
    }

    return new_state;
  }
  return state;
};

const isTerminalState = (state) => {
  const winner = checkForWinner(state);
  if (winner) {
    return true;
  }
  return false;
};

const playerHasTwoInALine = (board, player) => {
  for (let combination of WINNING_COMBINATIONS) {
    let count = 0;
    for (let [row, cell] of combination) {
      if (board[row][cell] === player) {
        count++;
      }
    }
    if (count === 2) {
      return true;
    }
  }
  return false;
};

const playerHasTwoInALineAndThirdIsEmpty = (board, player) => {
  for (let combination of WINNING_COMBINATIONS) {
    let count = 0;
    let empty = null;
    for (let [row, cell] of combination) {
      if (board[row][cell] === player) {
        count++;
      } else if (board[row][cell] === null) {
        empty = [row, cell];
      }
    }
    if (count === 2 && empty !== null) {
      return true;
    }
  }
  return false;
};

const heuristicOf = (state) => {
  const winner = checkForWinner(state);
  if (winner) {
    if (winner === "a") {
      return -10;
    } else {
      // winner is b
      return 10;
    }
  } else if (!isPlacementComplete(JSON.parse(JSON.stringify(state.board)))) {
    if (playerHasTwoInALineAndThirdIsEmpty(state.board, "a")) {
      console.log("a has two in a line and third is empty");
      return -5;
    } else if (playerHasTwoInALineAndThirdIsEmpty(state.board, "b")) {
      console.log("b has two in a line and third is empty");
      return 5;
    } else {
      return 0;
    }
  }
};

const minimax = (state, depth, isMaximizing) => {
  // check for terminal state or depth 0. must be aware of isMaximizing
  if (isTerminalState(state) || depth === 0) {
    return { score: heuristicOf(JSON.parse(JSON.stringify(state))) };
  }

  // the board size is 3x3
  // define the list of possible moves
  const moves = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // if it is a placement move
      if (state.is_placement_phase) {
        if (state.board[row][col] === null) {
          moves.push({ location: [row, col], direction: null });
        }
      } else {
        // if it is a movement move
        // check if there is a piece in the cell
        if (state.board[row][col] === (isMaximizing ? "b" : "a")) {
          // check if the piece can move left
          if (col > 0 && state.board[row][col - 1] === null) {
            moves.push({ location: [row, col], direction: "left" });
          }
          // check if the piece can move right
          if (col < 2 && state.board[row][col + 1] === null) {
            moves.push({ location: [row, col], direction: "right" });
          }
          // check if the piece can move up
          if (row > 0 && state.board[row - 1][col] === null) {
            moves.push({ location: [row, col], direction: "up" });
          }
          // check if the piece can move down
          if (row < 2 && state.board[row + 1][col] === null) {
            moves.push({ location: [row, col], direction: "down" });
          }
        }
      }
    }
  }

  // loop and evaluate each move
  for (let move of moves) {
    // make a copy of the state
    const new_state = JSON.parse(JSON.stringify(state));

    // make the move
    if (move.direction === null) {
      // placement move
      new_state.board[move.location[0]][move.location[1]] = isMaximizing
        ? "b"
        : "a";
      new_state.is_placement_phase = isPlacementComplete(new_state.board)
        ? false
        : true;
    } else {
      // movement move
      const [row, col] = move.location;
      new_state.board[row][col] = null;
      if (move.direction === "left") {
        new_state.board[row][col - 1] = isMaximizing ? "b" : "a";
      } else if (move.direction === "right") {
        new_state.board[row][col + 1] = isMaximizing ? "b" : "a";
      } else if (move.direction === "up") {
        new_state.board[row - 1][col] = isMaximizing ? "b" : "a";
      } else if (move.direction === "down") {
        new_state.board[row + 1][col] = isMaximizing ? "b" : "a";
      }
    }

    // switch player
    new_state.current_player = isMaximizing ? "a" : "b";

    // evaluate the move
    const result = minimax(new_state, depth - 1, !isMaximizing);
    move.score = result.score;
  }

  // find the best move
  let best_move;
  if (isMaximizing) {
    let best_score = -Infinity;
    for (let move of moves) {
      if (move.score > best_score) {
        best_score = move.score;
        best_move = move;
      }
    }
  } else {
    let best_score = Infinity;
    for (let move of moves) {
      if (move.score < best_score) {
        best_score = move.score;
        best_move = move;
      }
    }
  }

  if (best_move) {
    return best_move;
  } else {
    return { score: 0 };
  }
};

// minimax with alpha beta pruning
const minimaxWithAlphaBetaPruning = (
  state,
  depth,
  isMaximizing,
  alpha,
  beta
) => {
  // check for terminal state or depth 0. must be aware of isMaximizing
  if (isTerminalState(state) || depth === 0) {
    return { score: heuristicOf(JSON.parse(JSON.stringify(state))) };
  }

  // the board size is 3x3
  // define the list of possible moves
  const moves = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // if it is a placement move
      if (state.is_placement_phase) {
        if (state.board[row][col] === null) {
          moves.push({ location: [row, col], direction: null });
        }
      } else {
        // if it is a movement move
        // check if there is a piece in the cell
        if (state.board[row][col] === (isMaximizing ? "b" : "a")) {
          // check if the piece can move left
          if (col > 0 && state.board[row][col - 1] === null) {
            moves.push({ location: [row, col], direction: "left" });
          }
          // check if the piece can move right
          if (col < 2 && state.board[row][col + 1] === null) {
            moves.push({ location: [row, col], direction: "right" });
          }
          // check if the piece can move up
          if (row > 0 && state.board[row - 1][col] === null) {
            moves.push({ location: [row, col], direction: "up" });
          }
          // check if the piece can move down
          if (row < 2 && state.board[row + 1][col] === null) {
            moves.push({ location: [row, col], direction: "down" });
          }
        }
      }
    }
  }

  // loop and evaluate each move
  for (let move of moves) {
    // make a copy of the state
    const new_state = JSON.parse(JSON.stringify(state));

    // make the move
    if (move.direction === null) {
      // placement move
      new_state.board[move.location[0]][move.location[1]] = isMaximizing
        ? "b"
        : "a";
      new_state.is_placement_phase = isPlacementComplete(new_state.board)
        ? false
        : true;
    } else {
      // movement move
      const [row, col] = move.location;
      new_state.board[row][col] = null;
      if (move.direction === "left") {
        new_state.board[row][col - 1] = isMaximizing ? "b" : "a";
      } else if (move.direction === "right") {
        new_state.board[row][col + 1] = isMaximizing ? "b" : "a";
      } else if (move.direction === "up") {
        new_state.board[row - 1][col] = isMaximizing ? "b" : "a";
      } else if (move.direction === "down") {
        new_state.board[row + 1][col] = isMaximizing ? "b" : "a";
      }
    }

    // switch player
    new_state.current_player = isMaximizing ? "a" : "b";

    // evaluate the move
    const result = minimaxWithAlphaBetaPruning(
      new_state,
      depth - 1,
      !isMaximizing,
      alpha,
      beta
    );
    move.score = result.score;

    // alpha beta pruning
    if (isMaximizing) {
      alpha = Math.max(alpha, move.score);
      if (beta <= alpha) {
        break;
      }
    } else {
      beta = Math.min(beta, move.score);
      if (beta <= alpha) {
        break;
      }
    }
  }

  // find the best move
  let best_move;
  if (isMaximizing) {
    let best_score = -Infinity;
    for (let move of moves) {
      if (move.score > best_score) {
        best_score = move.score;
        best_move = move;
      }
    }
  }
  // if it is minimizing
  else {
    let best_score = Infinity;
    for (let move of moves) {
      if (move.score < best_score) {
        best_score = move.score;
        best_move = move;
      }
    }
  }

  if (best_move) {
    return best_move;
  }
  // if there is no best move
  else {
    return { score: 0 };
  }
};

const getValidRandomMoveForPlayerB = (state) => {
  // the board size is 3x3
  // define the list of possible moves
  const moves = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // if it is a placement move
      if (state.is_placement_phase) {
        if (state.board[row][col] === null) {
          moves.push({ location: [row, col], direction: null });
        }
      } else {
        // if it is a movement move
        // check if there is a piece in the cell
        if (state.board[row][col] === "b") {
          // check if the piece can move left
          if (col > 0 && state.board[row][col - 1] === null) {
            moves.push({ location: [row, col], direction: "left" });
          }
          // check if the piece can move right
          if (col < 2 && state.board[row][col + 1] === null) {
            moves.push({ location: [row, col], direction: "right" });
          }
          // check if the piece can move up
          if (row > 0 && state.board[row - 1][col] === null) {
            moves.push({ location: [row, col], direction: "up" });
          }
          // check if the piece can move down
          if (row < 2 && state.board[row + 1][col] === null) {
            moves.push({ location: [row, col], direction: "down" });
          }
        }
      }
    }
  }

  // return a random move
  return moves[Math.floor(Math.random() * moves.length)];
};

const getNextComputerMove = (state, difficulty) => {
  if (difficulty === "easy") {
    // do random move
    const move = getValidRandomMoveForPlayerB(
      JSON.parse(JSON.stringify(state))
    );
    console.log("> valid move for b is: ", JSON.stringify(move));
    return move;
  }
  if (difficulty === "normal") {
    // randomly choose between random move and minimax
    const random = Math.random();
    if (random < 0.5) {
      return getValidRandomMoveForPlayerB(JSON.parse(JSON.stringify(state)));
    }
    return minimax(state, 3, true);
  }
  if (difficulty === "hard") {
    // apply minimax algorithm to determine best move
    const depth = randIntBetween(MINIMAX_DEPTH_MIN, MINIMAX_DEPTH_MAX); // we don't want the user to expect the computer to always make the same move
    const move = minimaxWithAlphaBetaPruning(
      JSON.parse(JSON.stringify(state)),
      depth,
      true,
      -Infinity,
      Infinity
    );
    console.log("> best move is: ", JSON.stringify(move));
    return move;
  }
};

const doComputerTurn = (state, difficulty) => {
  /* sample move object
    move = {location: [row, col], direction: "left"} // if direction is null, it is a placement move
  */

  // current player is already computer
  let new_state = { ...state };
  const move = getNextComputerMove(new_state, difficulty);

  if (move) {
    // do move
    if (move.direction) {
      // move piece
      const [row, cell] = move.location;
      const new_board = [...state.board];
      new_board[row][cell] = null;
      switch (move.direction) {
        case "left":
          new_board[row][cell - 1] = state.current_player;
          break;
        case "right":
          new_board[row][cell + 1] = state.current_player;
          break;
        case "up":
          new_board[row - 1][cell] = state.current_player;
          break;
        case "down":
          new_board[row + 1][cell] = state.current_player;
          break;
        default:
          break;
      }
      new_state = {
        ...new_state,
        board: new_board,
        current_player: "a",
      };
    } else {
      // place piece
      const [row, cell] = move.location;
      const new_board = [...state.board];
      new_board[row][cell] = state.current_player;
      new_state = {
        ...new_state,
        board: new_board,
        current_player: "a",
      };
    }

    // check for winner
    if (boardHasAtLeastPieces(new_state.board, 5)) {
      // check for winner
      const winner = checkForWinner({
        ...new_state,
        current_player: state.current_player,
      });
      if (winner) {
        new_state.winner = winner;
      }
    }
  }

  new_state.current_player = "a";

  return new_state;
};

// reducer function
const reducer = (state, { type, payload }) => {
  // player will always be "a" when a dispatch is called
  if (state.is_placement_phase) {
    // placement phase...
    let new_state = placePiece(state, payload);
    new_state = doComputerTurn(
      JSON.parse(JSON.stringify(new_state)),
      payload.difficulty
    ); // this changes the player, flips it back to player a
    // check if placement phase is over
    if (isPlacementComplete(new_state.board)) {
      new_state.is_placement_phase = false;
    }
    return new_state;
  }
  // playing phase...
  if (state.selected_piece !== null) {
    // reselecting a piece for the same player
    if (
      state.selected_piece[0] === payload.row_index &&
      state.selected_piece[1] === payload.cell_index
    ) {
      return {
        ...state,
        selected_piece: null,
      };
    }

    // changing selected piece
    if (isCurrentPlayerPiece(state, payload.row_index, payload.cell_index)) {
      return selectPiece(state, payload);
    }

    // if a piece is selected, move it to the new cell
    return doComputerTurn(
      JSON.parse(JSON.stringify(moveSelectedPiece(state, payload))),
      payload.difficulty
    );
  } else {
    return selectPiece(state, payload);
  }
};

export default function OnePlayerGameScreen({ onRestart }) {
  // three men's morris game logic
  // player 1 is a
  // player 2 is b
  const { gameScreen, difficulty, number_of_players } = useContext(AppContext);

  const [state, dispatch] = useReducer(reducer, {
    board: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    current_player: "a",
    is_placement_phase: true,
    selected_piece: null, // [x, y]
    instruction_text: "Player 1, Place your stones",
    winner: null,
  });

  return (
    <div>
      <h1>Game Screen (Human vs AI)</h1>
      <p>
        Difficulty: {difficulty} | Number of players: {number_of_players}
      </p>
      <p>Click to restart</p>
      <div className="game-button">
        <button onClick={onRestart}>Restart</button>
      </div>

      <GameBoard
        board={state.board}
        selected_cell={state.selected_piece}
        dispatch={dispatch}
        winner={state.winner}
        role={state.current_player}
      />

      <p>{state.instruction_text}</p>
    </div>
  );
}
