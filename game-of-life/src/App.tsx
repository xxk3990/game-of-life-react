import React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
const positions = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
]
function App() {
  /* 
    I followed this tutorial: https://dev.to/toluagboola/build-the-game-of-life-with-react-and-typescript-5e0d
    I did change some variable names that were in that tutorial and added a few new features of my own!
  */
  useEffect(() => {
    document.title = "Game of Life"
  })
  const rows = 25;
  const [columns, setColumns] = useState<number>(35);
  const [cellSize, setCellSize] = useState<number>(20);
  const setupTiles = () => {
    const rowsArray = []
    for (let i = 0; i < rows; i++) {
      rowsArray.push(Array.from(Array(columns), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    return rowsArray;
  }
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const runGame = useCallback((tempGrid: any) => {
    if(!isRunningRef.current) {
      return; //bail out if game not running
    }
    const gridCopy = JSON.parse(JSON.stringify(tempGrid)) 
      for(let i = 0; i < rows; i++) {
        for(let j = 0; j < columns; j++) {
          let cellsNearby: number = 0;
          positions.forEach(([x, y]) => {
            const newI = i + x; //checking for cells near current one
            const newJ = j + y;
            if(newI >= 0 && newI < rows) { //if the new cell index is greater than zero and less than the max row #
              if(newJ >= 0 && newJ < columns) { //if the new cell index is greater than zero and less than the max column #
                cellsNearby += tempGrid[newI][newJ]
              }
            }
          })
          if(cellsNearby < 2 || cellsNearby > 3) {
            gridCopy[i][j] = 0; //if the # of cells nearby is < 2 or > 3, kill the cell
          } else if(grid[i][j] === 0 && cellsNearby === 3) {
            gridCopy[i][j] = 1;

          }
        }
      }
    setGrid(gridCopy);
  }, [])

  const randomCellColor = () => {
    //Found this on StackOverflow: https://stackoverflow.com/questions/1484506/random-color-generator
    const options: string = '0123456789ABCDEF'
    let color: string = '#'
    for(let i = 0; i < 6; i++) {
      color += options[Math.floor(Math.random() * 16)]
    }
    return color;
  }

  const handlePlay = () => {
    setIsRunning(!isRunning); //pause or play game
    if(!isRunning) {
      isRunningRef.current = true;
    }
    setInterval(() => {
      runGame(grid)
    }, 1500)
  }

  const clearGrid = () => {
    const emptyRows = []
    for(let i = 0; i < rows; i++) {
      emptyRows.push(Array.from(Array(columns), () => 0))
    }
    return emptyRows;
  }
  
  const changeNumColumns = (newColNum: number) => { //change # of columns
    setColumns(newColNum);
  }

  const changeCellSize = (newCellSize: number) => { //change size of cells
    setCellSize(newCellSize)
  }


  const [grid, setGrid] = useState<any>(() => {
    return setupTiles(); //set up tiles
  })
  return (
    <div className="App">
      <h1>Game of Life – Xander K</h1>
      <section className='UI'> {/* UI for adjusting board */}
        <button onClick={handlePlay}>{isRunning ? 'Pause' : 'Play'}</button>
        <button onClick={() => setGrid(clearGrid)}>Clear Grid</button>
        <span>Change Column #: <input type="range" min="10" step="5" max="40" value={columns} onChange={(e) => changeNumColumns(parseInt(e.target.value))}/> Columns: {columns}</span>
        <span>Change Cell Size: <input type ='range' min="10" max="40" value={cellSize} step="5" onChange={(e) => changeCellSize(parseInt(e.target.value))}/> Cell size: {cellSize} x {cellSize}</span>
      </section>
      <section className="grid-of-cells" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}>
        {grid.map((rws: any, i: any) =>
          rws.map((col: any, j: any) => (
            <section className="cell"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: grid[i][j] ? randomCellColor() : undefined,
              }}
              onClick={() => {
                const newGrid = JSON.parse(JSON.stringify(grid)) //create new grid if cell clicked
                newGrid[i][j] = grid[i][j] ? 0 : 1
                setGrid(newGrid);
              }}
            />
          ))
        )}
      </section>
        
    </div>
  );
}

export default App;
