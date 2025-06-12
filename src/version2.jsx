import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [n, setN] = useState(6)
  const [totalStructs, setTotalStructs] = useState([])
  const [nGrids, setnGrids] = useState(1000)
  const [totalGrid, setTotalGrids] = useState([])
  
  const shapes = [
    {
      num: 1,
      pieces: [[[0, 0]]],
      colors: ["red"]
    },
    {
      num: 4,
      pieces: [[[0, 0], [0, 1]], [[0, 0], [1, 0]]],
      colors: ["yellow", "red", "blue", "lightgreen"]
    },
    {
      num: 2,
      pieces: [[[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]]],
      colors: ["red", "blue"]
    },
    {
      num: 3,
      pieces: [[[0, 0], [1, 0], [1, 1]], [[0, 0], [1, 0], [1, -1]]],
      colors: ["yellow", "blue", "lightgreen"]
    }, {
      num: 3,
      pieces: [[[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [2, 0], [2, -1]]],
      colors: ["red", "yellow", "lightgreen"]
    }
  ]

  useEffect(() => {
    const grid = Array(n).fill(null).map(() => Array(n).fill(null))
    const results = []

    const CheckFree = (grid) => {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (!grid[i][j]) return [i, j]
        }
      }
      return null
    }

    const placePieces = (struct, grid, shapesLeft, shapeInstances = []) => {
      if (results.length >= nGrids) {
        return
      }

      const free = CheckFree(grid)
      if (!free) {
        results.push({
          structures: JSON.parse(JSON.stringify(struct)),
          shapeInstances: JSON.parse(JSON.stringify(shapeInstances))
        })
        return
      }

      const [row, col] = free
      for (let i = 0; i < shapesLeft.length; i++) {
        if (shapesLeft[i].num <= 0) continue
        const shapeType = shapesLeft[i]

        for (let pieceIdx = 0; pieceIdx < shapeType.pieces.length; pieceIdx++) {
          const piece = shapeType.pieces[pieceIdx]
          let coords = []
          let canPlace = true

          for (let [dx, dy] of piece) {
            const x = row + dx
            const y = col + dy
            if (x < 0 || x >= n || y < 0 || y >= n || grid[x][y]) {
              canPlace = false
              break
            }
            coords.push([x, y])
          }

          if (canPlace) {
            for (let [x, y] of coords) grid[x][y] = 1

            struct.push({
              cells: coords,
              shapeIdx: i,
              pieceIdx: pieceIdx
            })

            shapeInstances.push({
              shapeIdx: i,
              pieceIdx: pieceIdx,
              colorIdx: null
            })

            shapesLeft[i].num -= 1
            placePieces(struct, grid, shapesLeft, shapeInstances)
            shapesLeft[i].num += 1
            struct.pop()
            shapeInstances.pop()
            for (let [x, y] of coords) grid[x][y] = null
          }
        }
      }
    }

    const shapesCopy = JSON.parse(JSON.stringify(shapes))
    placePieces([], grid, shapesCopy, [])


    if (results.length === 0) return;

    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const coloredResults = []

    for (let result of results) {
      const { structures, shapeInstances } = result;
      const CheckColors = (structures) => {
        const sameStruct = (x, y) => {
          for (let group of structures) {
            const inGroup = group.cells.some(([r, c]) => r === x[0] && c === x[1]);
            const alsoInGroup = group.cells.some(([r, c]) => r === y[0] && c === y[1]);
            if (inGroup && alsoInGroup) return true;
          }
          return false;
        };
        for (let i = 0; i < structures.length; i++) {
          if (!structures[i].backgroundColor) continue;

          for (let [x, y] of structures[i].cells) {
            for (let [dx, dy] of directions) {
              const nx = x + dx, ny = y + dy;
              if (nx >= 0 && nx < n && ny >= 0 && ny < n) {
                for (let j = 0; j < structures.length; j++) {
                  if (i !== j && structures[j].backgroundColor === structures[i].backgroundColor) {
                    for (let [xr, yr] of structures[j].cells) {
                      if (xr === nx && yr === ny && !sameStruct([x, y], [xr, yr])) {
                        return false;
                      }
                    }
                  }
                }
              }
            }
          }
        }

        return true;
      };
      const colorTracking = shapes.map(shape => {
        return {
          colors: [...shape.colors],
          used: Array(shape.colors.length).fill(false)
        };
      });

      const hashStructure = (structure) => {
        return structure
          .map(group => {
            const cells = group.cells.map(([x, y]) => `${x},${y}`).sort().join(';');
            return `${cells}:${group.backgroundColor}`;
          })
          .sort()
          .join('|');
      };


      const uniqueHashes = new Set();

      const assignColors = (structIndex, structuresCopy) => {
        if (!structuresCopy) return;

        if (structIndex === structuresCopy.length) {
          const deepCopy = JSON.parse(JSON.stringify(structuresCopy));
          const hash = hashStructure(deepCopy);

          if (!uniqueHashes.has(hash)) {
            uniqueHashes.add(hash);
            coloredResults.push(deepCopy);
          }
          return;
        }

        const structure = structuresCopy[structIndex];
        const shapeInstance = shapeInstances[structIndex];
        const shapeIdx = shapeInstance.shapeIdx;
        const colorTracker = colorTracking[shapeIdx];

        for (let colorIdx = 0; colorIdx < colorTracker.colors.length; colorIdx++) {
          if (colorTracker.used[colorIdx]) continue;

          const color = colorTracker.colors[colorIdx];
          structure.backgroundColor = color;

          if (CheckColors(structuresCopy)) {
            colorTracker.used[colorIdx] = true;
            shapeInstance.colorIdx = colorIdx;
            assignColors(structIndex + 1, structuresCopy);
            colorTracker.used[colorIdx] = false;
            shapeInstance.colorIdx = null;
          }
        }

        structure.backgroundColor = null;
      };

      assignColors(0, structures)

    }

    setTotalStructs(coloredResults);

    const tGrids = [];
    for (let structure of coloredResults) {
      const tempGrid = Array(n).fill().map(() =>
        Array(n).fill().map(() => ({
          style: {
            backgroundColor: "white"
          }
        }))
      );

      for (let i = 0; i < structure.length; i++) {
        const group = structure[i];

        for (let [x, y] of group.cells) {
          tempGrid[x][y].style.backgroundColor = group.backgroundColor || "white";
        }

        for (let j = 0; j < group.cells.length; j++) {
          const [x1, y1] = group.cells[j];

          for (let k = j + 1; k < group.cells.length; k++) {
            const [x2, y2] = group.cells[k];

            if (x1 === x2 && Math.abs(y1 - y2) === 1) {
              if (y1 < y2) {
                tempGrid[x1][y1].style.borderRight = "none";
                tempGrid[x2][y2].style.borderLeft = "none";
              } else {
                tempGrid[x1][y1].style.borderLeft = "none";
                tempGrid[x2][y2].style.borderRight = "none";
              }
            }
            else if (y1 === y2 && Math.abs(x1 - x2) === 1) {
              if (x1 < x2) {
                tempGrid[x1][y1].style.borderBottom = "none";
                tempGrid[x2][y2].style.borderTop = "none";
              } else {
                tempGrid[x1][y1].style.borderTop = "none";
                tempGrid[x2][y2].style.borderBottom = "none";
              }
            }
          }
        }
      }

      tGrids.push(tempGrid);
    }

    setTotalGrids(tGrids);
  }, [n, nGrids]);

  return (
    <main>
      <div className="controls">
        <label>
          Grid Size:{n}
        </label><br />
        <label>
          Max Grids:{nGrids}
        </label>
      </div>

      <div className="grid-container">
        {totalGrid.map((grid, idx) => (
          <div
            key={idx}
            className="four-colors-grid"
            style={{
              gridTemplateRows: `repeat(${n}, 50px)`,
              gridTemplateColumns: `repeat(${n}, 50px)`,
              margin: '20px'
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  className="four-colors-cell"
                  key={`${rowIndex}-${colIndex}`}
                  style={cell.style}
                />
              ))
            )}
          </div>
        ))}
      </div>

      <div className="stats">
        Total solutions found: {totalGrid.length}
      </div>
    </main>
  );
}

export default App;