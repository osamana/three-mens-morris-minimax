export default function FinishScreen({ onRestart }) {
  return (
    <div>
      <h1>Finish Screen</h1>
      <p>Click to restart</p>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
}
