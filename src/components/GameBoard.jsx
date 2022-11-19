export default function GameBoard({
  board,
  winner,
  selected_cell,
  dispatch,
  role,
}) {
  // board is a two dimensional array 3x3
  return (
    <div>
      <h1>Game Board</h1>
      {winner && (
        <h2 style={{ color: "blue" }}>
          Winner: {winner === "a" ? "Human - A" : "Computer - B"}
        </h2>
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
                          payload: { row_index, cell_index },
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
