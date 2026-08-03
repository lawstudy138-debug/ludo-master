/* ==================== CORE GAME LOGIC ==================== */
const Game = (() => {
  const COLORS = Board.COLORS;
  const COLOR_EMOJI = { red: '🔴', green: '🟢', yellow: '🟡', blue: '🔵' };
  const AVATARS = ['😎', '🤖', '🦁', '🐯', '🦊', '🐼', '🐸', '🦄', '🐶', '🐱'];

  let state = null;
  let animSpeed = 1;

  function createPlayer(name, colorIdx, isAI, avatar, difficulty) {
    return {
      name: name || (isAI ? 'AI ' + COLORS[colorIdx] : 'Player ' + (colorIdx + 1)),
      colorIdx,
      color: COLORS[colorIdx],
      isAI: !!isAI,
      avatar: avatar || (isAI ? '🤖' : AVATARS[colorIdx % AVATARS.length]),
      difficulty: difficulty || 'hard',
      tokens: [
        { id: 0, pos: -1 },
        { id: 1, pos: -1 },
        { id: 2, pos: -1 },
        { id: 3, pos: -1 }
      ],
      finished: false,
      rank: 0,
      stats: { rolls: 0, cuts: 0, home: 0 }
    };
  }

  function init(config) {
    // config: { numPlayers, difficulty, players: [{name, colorIdx, avatar, isAI}] }
    const players = config.players.map(p =>
      createPlayer(p.name, p.colorIdx, p.isAI, p.avatar, config.difficulty)
    );

    state = {
      players,
      currentIdx: 0,
      diceValue: 0,
      consecutiveSixes: 0,
      phase: 'roll', // roll | select | moving | gameover
      movableTokens: [],
      suggestedToken: null,
      ranking: [],
      startTime: Date.now(),
      gameOver: false,
      winnerAnnounced: false
    };
    return state;
  }

  function getState() { return state; }

  function currentPlayer() {
    return state.players[state.currentIdx];
  }

  function getMovableTokens(player, dice) {
    const list = [];
    player.tokens.forEach((t, idx) => {
      const np = Board.calcNewPos(player.colorIdx, t.pos, dice);
      if (np !== null) list.push(idx);
    });
    return list;
  }

  function rollDice() {
    if (state.phase !== 'roll' || state.gameOver) return null;
    const val = 1 + Math.floor(Math.random() * 6);
    state.diceValue = val;
    const player = currentPlayer();
    player.stats.rolls++;

    if (val === 6) {
      state.consecutiveSixes++;
      if (state.consecutiveSixes >= 3) {
        state.consecutiveSixes = 0;
        state.phase = 'roll';
        return { value: val, skip: true };
      }
    } else {
      state.consecutiveSixes = 0;
    }

    const movable = getMovableTokens(player, val);
    state.movableTokens = movable;

    if (movable.length === 0) {
      // No moves → next turn (unless 6 which already handled consecutive)
      state.phase = 'roll';
      return { value: val, noMove: true };
    }

    state.phase = 'select';
    // Suggestion for human
    if (!player.isAI) {
      state.suggestedToken = AI.suggestMove(player, val, state.players);
    } else {
      state.suggestedToken = null;
    }
    return { value: val, movable };
  }

  function moveToken(tokenIdx) {
    if (state.phase !== 'select') return null;
    const player = currentPlayer();
    if (!state.movableTokens.includes(tokenIdx)) return null;

    const token = player.tokens[tokenIdx];
    const oldPos = token.pos;
    const newPos = Board.calcNewPos(player.colorIdx, oldPos, state.diceValue);
    if (newPos === null) return null;

    token.pos = newPos;
    state.phase = 'moving';

    // Check capture
    let captured = null;
    if (newPos >= 0 && newPos < 52 && !Board.isSafe(newPos)) {
      state.players.forEach(p => {
        if (p.colorIdx === player.colorIdx) return;
        p.tokens.forEach(ot => {
          if (ot.pos === newPos) {
            ot.pos = -1; // back to yard
            captured = { player: p, token: ot };
            player.stats.cuts++;
          }
        });
      });
    }

    // Check home entry
    let reachedHome = false;
    if (newPos === 57) {
      player.stats.home++;
      reachedHome = true;
    }

    // Check if player finished all tokens
    const allHome = player.tokens.every(t => t.pos === 57);
    if (allHome && !player.finished) {
      player.finished = true;
      player.rank = state.ranking.length + 1;
      state.ranking.push(player);
    }

    // Check game over (at least one finished and others can't, or all but one finished)
    const activePlayers = state.players.filter(p => !p.finished);
    if (state.ranking.length >= state.players.length - 1 && state.players.length > 1) {
      // Last one gets last rank
      activePlayers.forEach(p => {
        p.finished = true;
        p.rank = state.ranking.length + 1;
        state.ranking.push(p);
      });
      state.gameOver = true;
    } else if (state.players.length === 1 && player.finished) {
      state.gameOver = true;
      state.ranking = [player];
    }

    return {
      oldPos,
      newPos,
      captured,
      reachedHome,
      finished: player.finished,
      extraTurn: state.diceValue === 6 && state.consecutiveSixes < 3,
      gameOver: state.gameOver
    };
  }

  function endTurn() {
    if (state.gameOver) {
      state.phase = 'gameover';
      return;
    }
    // If rolled 6 and not skipped, same player continues
    if (state.diceValue === 6 && state.consecutiveSixes > 0 && state.consecutiveSixes < 3) {
      state.phase = 'roll';
      state.diceValue = 0;
      state.movableTokens = [];
      state.suggestedToken = null;
      return;
    }
    // Next player
    let next = (state.currentIdx + 1) % state.players.length;
    let safety = 0;
    while (state.players[next].finished && safety < 10) {
      next = (next + 1) % state.players.length;
      safety++;
    }
    state.currentIdx = next;
    state.phase = 'roll';
    state.diceValue = 0;
    state.consecutiveSixes = 0;
    state.movableTokens = [];
    state.suggestedToken = null;
  }

  function setAnimSpeed(s) { animSpeed = s; }
  function getAnimSpeed() { return animSpeed; }

  return {
    init, getState, currentPlayer, rollDice, moveToken, endTurn,
    getMovableTokens, setAnimSpeed, getAnimSpeed,
    COLORS, COLOR_EMOJI, AVATARS
  };
})();
