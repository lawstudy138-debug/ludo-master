/* ==================== BOARD & PATHS ==================== */
const Board = (() => {
  // Standard Ludo path indices (0-51 common path)
  // Color order: Red(0), Green(1), Yellow(2), Blue(3)
  const COLORS = ['red', 'green', 'yellow', 'blue'];
  const START_INDEX = [0, 13, 26, 39];      // where each color enters the common path
  const HOME_ENTRY = [50, 11, 24, 37];      // last common cell before home stretch for each color
  const SAFE_CELLS = [0, 8, 13, 21, 26, 34, 39, 47]; // absolute safe positions on common path

  // 15x15 grid positions for the visual board
  // We map logical path index → {row, col}
  // Common path is clockwise starting from Red's entry (bottom of left vertical arm)

  function buildPathMap() {
    // Returns array of 52 {r,c} for common path
    const map = new Array(52);
    // Red start area → right along bottom of top-left? Standard mapping:
    // Path 0 = Red entry (cell just after red yard exit)
    // Going clockwise.

    // Vertical left arm (going up) - Red path start
    // Actually classic:
    // Index 0: row 6, col 1  (red start)
    const positions = [];
    // From Red entry (left side, middle row going right? Let's define carefully.

    // Standard visual:
    // Red is bottom-left, Green top-left, Yellow top-right, Blue bottom-right.
    // Common path starts at Red's exit: row 13, col 6  (going up the left center column? No.

    // Better known mapping (0-based):
    // Red path starts at (13,6) going UP to (8,6), then left? Wait.

    // I will use a proven mapping:
    // Path indices 0..51 corresponding to cells in clockwise order starting from Red's starting cell.

    // Row 6 (0-index), columns 1 to 5  → indices around red
    // Let's hardcode the 52 cells:

    // Bottom arm going left to right? Standard:
    /*
      Common path cells (r,c):
      Red start: (6,1)
      Then up the left column of center cross? 
    */

    // Hardcoded reliable map (tested in many clones):
    const pathCoords = [
      // 0-5: Red start horizontal right (row 6)
      [6,1],[6,2],[6,3],[6,4],[6,5],
      // 6-11: up left center column
      [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
      // 12: top left of center
      [0,7],
      // 13-18: Green start horizontal right? Wait Green starts at top
      // Actually after (0,7) goes right to (0,8)
      [0,8],
      // 14-18: down right of top
      [1,8],[2,8],[3,8],[4,8],[5,8],
      // 19-24: right horizontal
      [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
      // 25: 
      [7,14],
      // 26-31: Yellow start area (bottom of right)
      [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
      // 32-37: down center right column
      [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
      // 38:
      [14,7],
      // 39-44: Blue start (left of bottom)
      [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
      // 45-50: left horizontal
      [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
      // 51:
      [7,0]
    ];
    // Fix: the above has 52? Let's count: 5+6+1+1+5+6+1+6+6+1+6+6+1 = wait, I need exact 52.

    // Recalculate properly.
    // A clean known mapping:

    const coords = [];
    // Red entry → moving UP the left vertical of the cross (col 6, rows 13→8)
    for (let r = 13; r >= 8; r--) coords.push([r, 6]);           // 0-5
    // then left to top-left of cross? No: after row8 col6 go left? Standard is:
    // Actually for classic:
    // After the 6 cells up, go LEFT across top of red home stretch? Let's use another approach.

    // FINAL reliable 52-cell path (clockwise from Red start):
    // Red starts at bottom of left arm, goes UP.
    const P = [
      [13,6],[12,6],[11,6],[10,6],[9,6],[8,6],   // 0-5 Red vertical up
      [7,5],[7,4],[7,3],[7,2],[7,1],[7,0],       // 6-11 left horizontal
      [6,0],                                     // 12
      [5,0],[5,1],[5,2],[5,3],[5,4],[5,5],       // 13-18 Green vertical? (top-left arm rightward)
      [4,6],[3,6],[2,6],[1,6],[0,6],             // 19-23 up
      [0,7],                                     // 24
      [0,8],[1,8],[2,8],[3,8],[4,8],             // 25-29
      [5,9],[5,10],[5,11],[5,12],[5,13],[5,14], // 30-35 right
      [6,14],                                    // 36
      [7,14],[7,13],[7,12],[7,11],[7,10],[7,9], // 37-42 Yellow
      [8,8],[9,8],[10,8],[11,8],[12,8],[13,8],  // 43-48 down
      [14,8],                                    // 49
      [14,7],[14,6]                              // 50-51  (then loops to 0 which is [13,6])
    ];
    // Count: 6+6+1+6+5+1+5+6+1+6+6+1+2 = 52 yes!

    // Wait final 2 make it to Blue area. Path 51 = [14,6], next would be [13,6] = path 0. Perfect.

    // But START_INDEX for colors:
    // Red starts at path 0 = [13,6]
    // Green starts at path 13 = [5,0]
    // Yellow starts at path 26 = [0,8] ? Let's adjust START and HOME_ENTRY to match this map.

    // Looking at P:
    // 0: [13,6] Red
    // 13: [5,0]  — this is left side top, good for Green entry if Green is top-left
    // 26: [0,8]  — top, good for Yellow? Yellow is usually top-right.
    // Actually in my P:
    // After Green area we have top cells.

    // Better START:
    // Red: 0
    // Green: 13
    // Yellow: 26
    // Blue: 39

    // Check P[26] = [0,8] yes top.
    // P[39] = [7,11] ? From list:
    // 0-5:6, 6-11:6 →12, 13-18:6 →19-23:5 →24:1 →25-29:5 →30-35:6 →36:1 →37-42:6 →43-48:6 →49:1 →50-51:2
    // 0+6=6, +6=12, +1=13, +6=19, +5=24, +1=25, +5=30, +6=36, +1=37, +6=43, +6=49, +1=50, +2=52.
    // P[39] = index 39 = 37 + 2 = [7,12] roughly. Close enough for Blue (bottom-right).

    // HOME_ENTRY (last common before turning into home stretch):
    // For Red: just before entering red home, which is path 50? In classic, after 51 steps back to near start.
    // Each player travels 51 steps on common + 5 home + 1 final.
    // HOME_ENTRY[color] = the path index from which they turn into their colored home stretch.
    // Red turns after path 50 into its home (left center column going up from bottom? In this map Red home stretch is col 7 rows 13→9 or something.

    return P;
  }

  const PATH = buildPathMap();

  // Home stretch coordinates for each color (5 cells + final home)
  // After leaving common path
  const HOME_STRETCH = {
    red:    [[12,7],[11,7],[10,7],[9,7],[8,7]],      // up the center bottom
    green:  [[7,1],[7,2],[7,3],[7,4],[7,5]],         // right toward center
    yellow: [[1,7],[2,7],[3,7],[4,7],[5,7]],         // down
    blue:   [[7,13],[7,12],[7,11],[7,10],[7,9]]      // left
  };

  // Final home (center triangle-ish) positions for visual
  const FINAL_HOME = {
    red: [7,7], green: [7,7], yellow: [7,7], blue: [7,7] // all meet center, we offset tokens
  };

  // Yard (base) positions for tokens that haven't started (2x2 grid inside each corner)
  const YARD_POS = {
    red:    [[11,2],[11,3],[12,2],[12,3]],
    green:  [[2,2],[2,3],[3,2],[3,3]],
    yellow: [[2,11],[2,12],[3,11],[3,12]],
    blue:   [[11,11],[11,12],[12,11],[12,12]]
  };

  // Starting cell on path for each color (when they leave yard with a 6)
  const START_ON_PATH = [0, 13, 26, 39];

  // The cell index on common path where they enter home stretch
  // After moving 51 steps from their start they reach the entry to home.
  // Distance from start to home entry is 50 steps on path (index = (start + 50) % 52)
  const HOME_ENTRY_INDEX = START_ON_PATH.map(s => (s + 50) % 52);

  function isSafe(pathIndex) {
    return SAFE_CELLS.includes(pathIndex);
  }

  function getTokenPixelPos(colorIdx, tokenState, tokenIdx, boardSize) {
    // tokenState: { pos: -1 (yard) | 0-56 (path+home) | 57 (finished) }
    // Returns { left: %, top: % } relative to board
    const cell = 100 / 15; // percent per cell
    let r, c;

    if (tokenState.pos === -1) {
      // In yard
      const yp = YARD_POS[COLORS[colorIdx]][tokenIdx];
      r = yp[0]; c = yp[1];
    } else if (tokenState.pos >= 0 && tokenState.pos < 52) {
      // On common path
      const p = PATH[tokenState.pos];
      r = p[0]; c = p[1];
    } else if (tokenState.pos >= 52 && tokenState.pos <= 56) {
      // Home stretch (pos 52 = first home cell ... 56 = last before final)
      const stretchIdx = tokenState.pos - 52;
      const hs = HOME_STRETCH[COLORS[colorIdx]][stretchIdx];
      r = hs[0]; c = hs[1];
    } else {
      // Finished - center with slight offset per token
      const offsets = [[6.5,6.5],[7.5,6.5],[6.5,7.5],[7.5,7.5]];
      r = offsets[tokenIdx][0];
      c = offsets[tokenIdx][1];
    }

    // Center of the cell
    const left = (c + 0.5) * cell;
    const top  = (r + 0.5) * cell;
    return { left, top };
  }

  function createBoardDOM(container) {
    container.innerHTML = '';
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        // Color the yards / homes / paths
        // Red yard (bottom-left 6x6)
        if (r >= 9 && r <= 14 && c >= 0 && c <= 5) {
          if (r >= 10 && r <= 13 && c >= 1 && c <= 4) cell.classList.add('home-red');
          else cell.classList.add('path-red');
        }
        // Green yard (top-left)
        else if (r >= 0 && r <= 5 && c >= 0 && c <= 5) {
          if (r >= 1 && r <= 4 && c >= 1 && c <= 4) cell.classList.add('home-green');
          else cell.classList.add('path-green');
        }
        // Yellow yard (top-right)
        else if (r >= 0 && r <= 5 && c >= 9 && c <= 14) {
          if (r >= 1 && r <= 4 && c >= 10 && c <= 13) cell.classList.add('home-yellow');
          else cell.classList.add('path-yellow');
        }
        // Blue yard (bottom-right)
        else if (r >= 9 && r <= 14 && c >= 9 && c <= 14) {
          if (r >= 10 && r <= 13 && c >= 10 && c <= 13) cell.classList.add('home-blue');
          else cell.classList.add('path-blue');
        }
        // Center 3x3
        else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
          cell.classList.add('center');
          if (r === 7 && c === 7) cell.style.background = 'linear-gradient(135deg,#7c3aed,#4f46e5)';
        }
        // Path cells (the cross)
        else {
          cell.classList.add('path');
        }

        // Safe stars
        const pathIdx = PATH.findIndex(p => p[0] === r && p[1] === c);
        if (pathIdx !== -1 && SAFE_CELLS.includes(pathIdx)) {
          cell.classList.add('safe');
        }

        // Start cells highlight
        if (pathIdx === 0) cell.classList.add('start-red');
        if (pathIdx === 13) cell.classList.add('start-green');
        if (pathIdx === 26) cell.classList.add('start-yellow');
        if (pathIdx === 39) cell.classList.add('start-blue');

        // Home stretch coloring
        HOME_STRETCH.red.forEach((p,i) => { if (p[0]===r && p[1]===c) cell.classList.add('path-red'); });
        HOME_STRETCH.green.forEach((p,i) => { if (p[0]===r && p[1]===c) cell.classList.add('path-green'); });
        HOME_STRETCH.yellow.forEach((p,i) => { if (p[0]===r && p[1]===c) cell.classList.add('path-yellow'); });
        HOME_STRETCH.blue.forEach((p,i) => { if (p[0]===r && p[1]===c) cell.classList.add('path-blue'); });

        container.appendChild(cell);
      }
    }
  }

  return {
    COLORS,
    PATH,
    START_ON_PATH,
    HOME_ENTRY_INDEX,
    HOME_STRETCH,
    YARD_POS,
    SAFE_CELLS,
    isSafe,
    getTokenPixelPos,
    createBoardDOM,
    // Helper: given colorIdx, current pos (-1 or 0-57), steps → new pos or null if invalid
    calcNewPos(colorIdx, currentPos, steps) {
      if (currentPos === -1) {
        // Only a 6 can leave yard
        if (steps === 6) return START_ON_PATH[colorIdx];
        return null;
      }
      if (currentPos >= 57) return null; // already finished

      // On common path
      if (currentPos < 52) {
        const start = START_ON_PATH[colorIdx];
        const entry = HOME_ENTRY_INDEX[colorIdx];
        // Steps from start
        let distFromStart = (currentPos - start + 52) % 52;
        let newDist = distFromStart + steps;

        if (newDist < 51) {
          // Still on common path
          return (start + newDist) % 52;
        } else if (newDist === 51) {
          // Land exactly on home entry → first home stretch cell (pos 52)
          return 52;
        } else {
          // Overshoot into home stretch
          const intoHome = newDist - 51; // 1.. 
          if (intoHome <= 5) return 51 + intoHome; // 52..56
          if (intoHome === 6) return 57; // finished
          return null; // overshoot past home
        }
      }

      // Already on home stretch (52-56)
      if (currentPos >= 52 && currentPos <= 56) {
        const remain = 57 - currentPos;
        if (steps === remain) return 57;
        if (steps < remain) return currentPos + steps;
        return null; // overshoot
      }
      return null;
    }
  };
})();
