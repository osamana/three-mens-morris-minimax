import "./App.css";
import { useState, createContext } from "react";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";
import FinishScreen from "./components/FinishScreen";
import Header from "./components/Header";

const AppContext = createContext();

function App() {
  const [gameScreen, setGameScreen] = useState("start");
  const [winner, setWinner] = useState(null); // null, "player1", "player2", "computer"
  const [number_of_players, setNumberOfPlayers] = useState(1);
  const [difficulty, setDifficulty] = useState("easy");

  const startGame = () => {
    setGameScreen("game");
    console.log(
      `Starting game with ${number_of_players} players and difficulty ${difficulty}`
    );
  };

  const restartGame = () => {
    setGameScreen("start");
  };

  const finishGame = () => {
    setGameScreen("finish");
  };

  return (
    <AppContext.Provider value={{ gameScreen, difficulty, number_of_players }}>
      <div className="App">
        <Header></Header>
        <hr />
        {gameScreen === "start" && (
          <StartScreen
            onStart={startGame}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            number_of_players={number_of_players}
            setNumberOfPlayers={setNumberOfPlayers}
          />
        )}
        {gameScreen === "game" && <GameScreen onRestart={restartGame} />}
        {gameScreen === "finish" && <FinishScreen onRestart={restartGame} />}
      </div>
    </AppContext.Provider>
  );
}

export default App;
export { AppContext };
