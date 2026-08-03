/* ==================== AI OPPONENT ==================== */
const AI = (() => {
  /**
   * Decide which token to move.
   * @param {Object} player - current AI player {colorIdx, tokens: [{pos, id}], ...}
   * @param {number} dice
   * @param {Array} allPlayers
   * @param {string} difficulty - 'easy'|'medium'|'hard'
   * @returns {number|null} token index to move, or null if no moves
   */
  function chooseMove(player, dice, allPlayers, difficulty = 'hard') {
    const colorIdx = player.colorIdx;
    const possible = [];

    player.tokens.forEach((t, idx) => {
      const newPos = Board.calcNewPos(colorIdx, t.pos, dice);
      if (newPos !== null) {
        possible.push({ idx, token: t, newPos, score: 0 });
      }
    });

    if (possible.length === 0) return null;
    if (possible.length === 1) return possible[0].idx;

    // Score each possible move
    possible.forEach(m => {
      m.score = scoreMove(m, player, dice, allPlayers, difficulty);
    });

    // Sort by score descending
    possible.sort((a, b) => b.score - a.score);

    if (difficulty === 'easy') {
      // Mostly random, sometimes best
      if (Math.random() < 0.35) return possible[0].idx;
      return possible[Math.floor(Math.random() * possible.length)].idx;
    }
    if (difficulty === 'medium') {
      // Prefer good moves but with noise
      if (Math.random() < 0.7) return possible[0].idx;
      return possible[Math.floor(Math.random() * Math.min(2, possible.length))].idx;
    }
    // Hard: always best
    return possible[0].idx;
  }

  function scoreMove(m, player, dice, allPlayers, difficulty) {
    let score = 0;
    const { newPos, token } = m;
    const colorIdx = player.colorIdx;

    // 1. Capture opportunity (very high value)
    if (newPos >= 0 && newPos < 52) {
      allPlayers.forEach(p => {
        if (p.colorIdx === colorIdx) return;
        p.tokens.forEach(ot => {
          if (ot.pos === newPos && !Board.isSafe(newPos)) {
            score += 120; // capture
          }
        });
      });
    }

    // 2. Finish a token
    if (newPos === 57) score += 100;

    // 3. Enter home stretch
    if (token.pos < 52 && newPos >= 52) score += 40;

    // 4. Leave yard (getting a token out is good)
    if (token.pos === -1 && newPos !== null) score += 50;

    // 5. Move onto safe cell
    if (newPos >= 0 && newPos < 52 && Board.isSafe(newPos)) score += 25;

    // 6. Progress (prefer tokens further ahead)
    if (token.pos >= 0) {
      const progress = token.pos === -1 ? 0 : (token.pos >= 52 ? 52 + (token.pos - 52) : ((token.pos - Board.START_ON_PATH[colorIdx] + 52) % 52));
      score += progress * 0.4;
    }

    // 7. Safety: avoid leaving a token vulnerable if possible
    if (difficulty === 'hard' && newPos >= 0 && newPos < 52 && !Board.isSafe(newPos)) {
      // Check if any opponent can land on this newPos with a common dice (1-6)
      let danger = 0;
      allPlayers.forEach(p => {
        if (p.colorIdx === colorIdx) return;
        p.tokens.forEach(ot => {
          if (ot.pos >= 0 && ot.pos < 52) {
            for (let d = 1; d <= 6; d++) {
              const oppNew = Board.calcNewPos(p.colorIdx, ot.pos, d);
              if (oppNew === newPos) danger += 8;
            }
          }
        });
      });
      score -= danger;
    }

    // 8. Prefer spreading / not stacking too much (minor)
    const samePosCount = player.tokens.filter(t => t.pos === newPos).length;
    if (samePosCount > 0) score -= 5;

    // 9. Extra turn value already handled by dice==6 logic outside
    return score;
  }

  /**
   * Suggest best move for human player (Smart Move Suggestion)
   */
  function suggestMove(player, dice, allPlayers) {
    return chooseMove(player, dice, allPlayers, 'hard');
  }

  return { chooseMove, suggestMove };
})();
