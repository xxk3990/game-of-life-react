import React, { useState, useCallback, useRef, useEffect } from 'react';
import logo from './logo.svg';
import {produce} from 'immer';
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
    https://www.youtube.com/watch?v=DvVt11mPuM0&ab_channel=BenAwad
    I did change some variable names that were in that tutorial and added a few new features of my own!
  */
  useEffect(() => {
    document.title = "Game of Life"
  })
  const rows = 25;
  const columns = 35; //adjustable columns
  const getRandomColor = () => {
    //Found this on StackOverflow: https://stackoverflow.com/questions/1484506/random-color-generator
    const options: string = '0123456789ABCDEF'
    let color: string = '#'
    for(let i = 0; i < 6; i++) {
      color += options[Math.floor(Math.random() * 16)]
    }
    return color;
  }
  const [cellSize, setCellSize] = useState<number>(20); //adjustable cell size
  const [isRunning, setIsRunning] = useState<boolean>(false); //playing or paused
  const [randomCellColor, setRandomCellColor] = useState(getRandomColor());
  const [randomBGColor, setRandomBGColor] = useState(getRandomColor())
  const [gradientStart, setGradientStart] = useState(getRandomColor()) //random gradient start
  const [gradientEnd, setGradientEnd] = useState(getRandomColor()) //random gradient end
  const [gradientMode, setGradientMode] = useState<boolean>(false) //boolean for gradient mode
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const runGame = useCallback(() => {
    if(!isRunningRef.current) {
      return; //bail out if game not running
    } 
    setGrid((g: number[][]) => {
      console.log('set grid in run game reached')
      return produce(g, (gridCopy) => {
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            let neighbors = 0;
            positions.forEach(([x, y]) => {
              const newX = i + x; //nearby cells
              const newY = j + y;
              if (newX >= 0 && newX < rows && newY >= 0 && newY < columns) {
                neighbors += g[newX][newY];
              }
            });

            if (neighbors < 2 || neighbors > 3) { 
              gridCopy[i][j] = 0; //clear cell if neighbors in this range
            } else if (g[i][j] === 0 && neighbors === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    })
    setTimeout(runGame, 500)
  }, [])

  

  const handlePlay = () => {
    setIsRunning(!isRunning); //pause or play game
    if(!isRunning) {
      isRunningRef.current = true;
      runGame();
    }
  }

  const clearGrid = () => {
    const emptyRows = []
    for(let i = 0; i < rows; i++) {
      emptyRows.push(Array.from(Array(columns), () => 0))
    }
    return emptyRows;
  }

  const changeCellSize = (newCellSize: number) => { //change size of cells
    setCellSize(newCellSize)
  }

  const randomGrid = () => {
    const randomRows = []
    for (let i = 0; i < rows; i++) {
      //initialize grid with random setup
      randomRows.push(Array.from(Array(columns), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    return randomRows;
  }

  const [grid, setGrid] = useState(() => {
    const emptyRows = [] //initialize grid
    for(let i = 0; i < rows; i++) {
      emptyRows.push(Array.from(Array(columns), () => 0))
    }
    return emptyRows;
  })
  return (
    <div className="App">
      <h1>Game of Life</h1>
      <section className='UI'> {/* UI for adjusting board */}
        <section className="UI-btns">
          <button onClick={() => handlePlay()}>{isRunning ? 'Pause' : 'Play'}</button>
          <button onClick={() => setGrid(clearGrid)}>Clear Grid</button>
          <button onClick={() => setGrid(randomGrid)}>Random Grid</button>
          <button onClick={() => setRandomCellColor(getRandomColor)}>Change Cell Color</button>
          <button onClick={() => {
            setGradientMode(false) //turn off gradient mode
            setRandomBGColor(getRandomColor)
          }}>
            Change Background Color</button>
          <button onClick={() => {
            setGradientStart(getRandomColor()) //new gradient start
            setGradientEnd(getRandomColor()) //new gradient end
            setGradientMode(true) //turn on gradient mode
          }}>Toggle Gradient</button>
        </section>
        <section className="UI-ranges">
          <span>
            Change Cell Size: <input type ='range' min="10" max="40" value={cellSize} step="5" onChange={(e) => changeCellSize(parseInt(e.target.value))}/> Cell size: {cellSize} x {cellSize}
          </span>
        </section>
      </section>
      <section style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        backgroundColor: gradientMode === false ? randomBGColor : 'none', //if gradient mode off, one bg color
        //if gradient on, set gradient in bg image attribute
        backgroundImage: gradientMode ? `linear-gradient(to right, ${gradientStart}, ${gradientEnd})` : 'none'
      }}>
        {grid.map((rws: any, x: any) =>
          rws.map((col: any, y: any) => (
            <section className="cell"
              key={`${x}-${y}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: grid[x][y] ? randomCellColor : undefined,
                border: '1px solid black'
              }}
              onClick={() => {
                const newGrid = produce(grid,(gridCopy) => {
                  gridCopy[x][y] = grid[x][y] ? 0 : 1;
                });
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
