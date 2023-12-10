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
        <div className="score">
          <h2 className="title">Score</h2>
          <h2 className="number">{score}</h2>
        </div>
        {isPlaying ? (<div className="blocks-container">
          <h2>Next Blocks</h2>
          <UpcomingBlocks upcomingBlocks={upcomingBlocks} />
        </div> ) : (
          <button className="start-btn" onClick={startGame}>START</button>
        )}
        {isPlaying && <button className="play-btn" onClick={() => setIsPaused((prevIsPaused) => !prevIsPaused)}>
          {isPaused ? (
            <img src={play} alt="Play" width="100%" height="100%" />
          ) : (
            <img src={pause} alt="Pause" width="100%" height="100%" />
          )}
        </button>}
      </div>


    </div>

  )
}

export default App
