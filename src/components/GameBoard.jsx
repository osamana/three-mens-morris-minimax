import { useContext, useState, useReducer } from "react";
import { AppContext } from "../App";

export default function GameBoard({
  board,
  winner,
  selected_cell,
  dispatch,
  role,
}) {
  const { difficulty, number_of_players } = useContext(AppContext);

  const displayPlayer = (player) => {
    if (player === "a") {
      return "Player A";
    } else {
      // if one player mode, display computer
      if (number_of_players === 1) {
        return "Computer";
      }
      return "Player B";
    }
  };

  // board is a two dimensional array 3x3
  return (
    <div>
      <h1>Game Board</h1>
      {winner && (
        <h2 style={{ color: "blue" }}>Winner: {displayPlayer(winner)}</h2>
      )}

      <div className={`board ${winner ? "disabled" : ""}`}>
        {board.map((row, row_index) => {
          return (
            <div className="row" key={row_index}>
              {row.map((cell, cell_index) => {
                return (
                  <div
                    className={`cell ${
                      selected_cell &&
                      selected_cell[0] === row_index &&
                      selected_cell[1] === cell_index
                        ? "selected"
                        : ""
                    }`}
                    key={cell_index}
                    onClick={() => {
                      if (winner) {
                        return;
                      } else {
                        dispatch({
                          type: "CELL_CLICKED",
                          payload: { row_index, cell_index, difficulty },
                        });
                      }
                    }}
                  >
                    {cell === "a" ? "A" : cell === "b" ? "B" : "-"}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
