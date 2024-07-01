import React, { useState, useCallback, useRef, useEffect } from 'react';
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
/* 
  Used this tutorial but converted it to typescript and added new features! 
  https://www.geeksforgeeks.org/conways-game-of-life-using-react/#
*/
function App() {
  useEffect(() => {
    document.title = "Game of Life"
  })
  const rows = 25;
  const columns = 35;
  const getRandomColor = () => {
    //Found this on StackOverflow: https://stackoverflow.com/questions/1484506/random-color-generator
    const options: string = '0123456789ABCDEF'
    let color: string = '#'
    for(let i = 0; i < 6; i++) {
      color += options[Math.floor(Math.random() * 16)]
    }
    return color;
  }
  const [cellWidth, setCellWidth] = useState<number>(20); //adjustable cell width
  const [cellHeight, setCellHeight] = useState<number>(20); //adjustable cell height
  const [isRunning, setIsRunning] = useState<boolean>(false); //playing or paused
  const [randomCellColor, setRandomCellColor] = useState(getRandomColor()); //save random color in variable so all are same color
  const [randomBGColor, setRandomBGColor] = useState(getRandomColor()) //color for uniform bg color
  const [gradientStart, setGradientStart] = useState(getRandomColor()) //random gradient start
  const [gradientEnd, setGradientEnd] = useState(getRandomColor()) //random gradient end
  const [gradientMode, setGradientMode] = useState<boolean>(false) //boolean for gradient mode
  const [ellipseMode, setEllipseMode] = useState<boolean>(false); //ellipse mode. If on, cells change to ellipses
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;
  const runGame = useCallback(() => {
    if(!isRunningRef.current) {
      return; //bail out if game not running
    } 
    setGrid((g: number[][]) => {
      return produce(g, (gridCopy) => { //mutate using immer produce
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < columns; j++) {
            let neighbors = 0; //nearby cells
            positions.forEach(([x, y]) => {
              const newX = i + x; //new cells to move to
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
    const emptyRows = [] //reset the grid
    for(let i = 0; i < rows; i++) {
      emptyRows.push(Array.from(Array(columns), () => 0))
    }
    return emptyRows;
  }

  const changeCellWidth = (newCellWidth: number) => { //change width of cells
    setCellWidth(newCellWidth)
  }

  const changeCellHeight = (newCellHeight: number) => { //change height of cells
    setCellHeight(newCellHeight)
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
    const emptyRows = [] //initialize grid as empty
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
            setRandomBGColor(getRandomColor) //change to one bg color
          }}>
            {gradientMode === false ? 'Change Background Color': 'Switch to One Background Color'}</button>
          <button onClick={() => {
            setGradientStart(getRandomColor()) //new gradient start
            setGradientEnd(getRandomColor()) //new gradient end
            setGradientMode(true) //turn on gradient mode
          }}>{gradientMode === true ? 'Change Gradient': 'Switch to Gradient'}</button>
        </section>
        <section className="UI-inputs">
          <span>
            Change Cell Width: <input type ='range' min="10" max="30" value={cellWidth} step="5" onChange={(e) => changeCellWidth(parseInt(e.target.value))}/>
            Change Cell Height: <input type ='range' min="10" max="30" value={cellHeight} step="5" onChange={(e) => changeCellHeight(parseInt(e.target.value))}/> <br/>
            Cell Dimensions: {cellWidth} x {cellHeight} <br/>
          </span>
          <span>
            <label htmlFor='rectangles'>Rectangles</label> <input name="shape-select" id="rectangles" type="radio" onClick={() => {
              setEllipseMode(false); //disable ellipse mode
            }}/>
            <label htmlFor='ellipses'>Ellipses</label> <input name="shape-select" id="ellipses" type="radio" onClick={() => {
              setEllipseMode(true) //turn on ellipse mode
            }}/>
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
                width: cellWidth,
                height: cellHeight,
                backgroundColor: grid[x][y] ? randomCellColor : undefined,
                border: '1px solid black',
                borderRadius: ellipseMode === true ? '50px' : '0px', //add border radius for ellipse mode
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