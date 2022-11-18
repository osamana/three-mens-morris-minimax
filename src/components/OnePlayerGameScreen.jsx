import { useContext, useState, useReducer } from "react";
import { AppContext } from "../App";
import GameBoard from "./GameBoard";

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

const checkForWinner = (state) => {
  const { board, current_player } = state;
  const winning_combinations = [
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
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];
  for (let combination of winning_combinations) {
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
      console.log("checking for winner");
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

// reducer function
const reducer = (state, { type, payload }) => {
  if (state.is_placement_phase) {
    // placement phase...
    return placePiece(state, payload); // this changes player after the piece is placed
  }
  // playing phase... player a is human, player b is computer (bot)
  if (state.current_player === "a") {
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
      return moveSelectedPiece(state, payload);
    } else {
      return selectPiece(state, payload);
    }
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
      <button onClick={onRestart}>Restart</button>

      <GameBoard
        board={state.board}
        selected_cell={state.selected_piece}
        dispatch={dispatch}
        winner={state.winner}
      />

      <p>{state.instruction_text}</p>
    </div>
  );
}
