import play from "./assets/play.svg";
import pause from "./assets/pause.svg";
import Board from "./components/Board"
import UpcomingBlocks from "./components/UpcomingBlocks";
import { useTetris } from "./hooks/useTetris"
import { useCallback } from "react";



function App() {

  const { board, startGame, isPlaying, score, upcomingBlocks, isPaused, setIsPaused } = useTetris();

  return (

    <div className="App">
      <h1>Tetris</h1>
      <Board currentBoard={board} />
      <div className="controls">
        <h2>Score: {score}</h2>
        {isPlaying ? (<UpcomingBlocks upcomingBlocks={upcomingBlocks} />) : (
          <button onClick={startGame}>New Game</button>
        )}
      </div>
      {isPlaying && <button className="play-btn" onClick={() => setIsPaused((prevIsPaused) => !prevIsPaused)}>
        {isPaused ? (
          <img src={play} alt="Play" width="100%" height="100%"  />
        ) : (
          <img src={pause} alt="Pause" width="100%" height="100%" />
        )}
      </button>}

    </div>

  )
}

export default App
