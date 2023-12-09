import Board from "./components/Board"

const board = Array(20).fill(null).map(() => Array(12).fill('empty'));

function App() {

  return (

    <div className="App">
      <h1>Tetris</h1>
      <Board currentBoard={board} />
    </div>

  )
}

export default App
