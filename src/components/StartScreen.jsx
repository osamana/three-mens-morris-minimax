export default function StartScreen({
  onStart,
  difficulty,
  setDifficulty,
  number_of_players,
  setNumberOfPlayers,
}) {
  return (
    <div>
      <h1>Start Screen</h1>

      <div className="select-menu">
        <label htmlFor="number_of_players">Players</label>
        <select
          id="number_of_players"
          name="number_of_players"
          onChange={(e) => setNumberOfPlayers(e.target.value)}
          value={number_of_players}
        >
          <option value="1">1 Player (Human vs Computer)</option>
          <option value="2">2 Players</option>
        </select>
      </div>

      <div className="select-menu">
        <label htmlFor="difficulty">Difficulty</label>
        <select
          id="difficulty"
          name="difficulty"
          onChange={(e) => setDifficulty(e.target.value)}
          value={difficulty}
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="game-button">
        <button onClick={() => onStart()}>Start</button>
      </div>
    </div>
  );
}
