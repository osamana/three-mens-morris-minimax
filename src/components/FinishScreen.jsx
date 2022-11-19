export default function FinishScreen({ onRestart }) {
  return (
    <div>
      <h1>Finish Screen</h1>
      <p>Click to restart</p>
      <div className="game-button">
        <button onClick={onRestart}>Restart</button>
      </div>{" "}
    </div>
  );
}
