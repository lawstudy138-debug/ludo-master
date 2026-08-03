/* ==================== UI HELPERS ==================== */
const UI = (() => {
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('screen-' + id);
    if (el) el.classList.add('active');
  }

  function toast(msg, duration = 2200) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  function updateTurnIndicator(player, isAIThinking = false) {
    const box = document.getElementById('turn-indicator');
    const avatar = document.getElementById('turn-avatar');
    const name = document.getElementById('turn-name');
    const status = document.getElementById('turn-status');
    avatar.textContent = player.avatar;
    avatar.style.background = `linear-gradient(145deg, ${getColorHex(player.color)}, ${getColorHex(player.color)}99)`;
    name.textContent = player.name;
    status.textContent = isAIThinking ? 'Thinking...' : (player.isAI ? 'AI Turn' : 'Your Turn');
    box.classList.add('active-turn');
  }

  function getColorHex(c) {
    return { red: '#ef4444', green: '#22c55e', yellow: '#eab308', blue: '#3b82f6' }[c] || '#888';
  }

  function renderTokens(state) {
    const layer = document.getElementById('tokens-layer');
    layer.innerHTML = '';
    const boardEl = document.getElementById('ludo-board');
    const size = boardEl.offsetWidth || 400;

    state.players.forEach(player => {
      player.tokens.forEach((token, tIdx) => {
        const pos = Board.getTokenPixelPos(player.colorIdx, token, tIdx, size);
        const el = document.createElement('div');
        el.className = `token ${player.color}`;
        el.dataset.player = player.colorIdx;
        el.dataset.token = tIdx;
        el.style.left = pos.left + '%';
        el.style.top = pos.top + '%';
        el.textContent = (tIdx + 1);
        // Stacking offset if multiple on same cell
        const same = player.tokens.filter(t => t.pos === token.pos && t.pos !== -1);
        if (same.length > 1) {
          const stackIdx = same.findIndex(t => t.id === token.id);
          el.style.transform = `translate(calc(-50% + ${(stackIdx - (same.length-1)/2) * 8}px), -50%)`;
        }
        layer.appendChild(el);
      });
    });
  }

  function highlightMovable(movable, suggested) {
    document.querySelectorAll('.token').forEach(t => {
      t.classList.remove('selectable', 'suggested');
    });
    movable.forEach(idx => {
      // Find token belonging to current player
      const player = Game.currentPlayer();
      const el = document.querySelector(`.token[data-player="${player.colorIdx}"][data-token="${idx}"]`);
      if (el) {
        el.classList.add('selectable');
        if (idx === suggested) el.classList.add('suggested');
      }
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selectable', 'suggested'));
  }

  function setDice(val, rolling = false) {
    const dice = document.getElementById('dice');
    const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    if (rolling) {
      dice.classList.add('rolling');
      setTimeout(() => {
        dice.classList.remove('rolling');
        dice.querySelector('.dice-face').textContent = faces[val] || val;
        dice.classList.add('glow');
        setTimeout(() => dice.classList.remove('glow'), 600);
      }, 700 * Game.getAnimSpeed());
    } else {
      dice.querySelector('.dice-face').textContent = faces[val] || '⚀';
    }
  }

  function updatePlayerPanels(state) {
    const container = document.getElementById('player-panels');
    container.innerHTML = '';
    state.players.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'p-panel' + (i === state.currentIdx ? ' active' : '');
      el.innerHTML = `
        <div class="dot" style="background:${getColorHex(p.color)}"></div>
        <span>${p.avatar} ${p.name.slice(0,8)}</span>
        <small>${p.tokens.filter(t => t.pos === 57).length}/4</small>
      `;
      container.appendChild(el);
    });
  }

  function showCaptureEffect(xPercent, yPercent) {
    const layer = document.getElementById('tokens-layer');
    const flash = document.createElement('div');
    flash.className = 'capture-flash';
    flash.style.left = xPercent + '%';
    flash.style.top = yPercent + '%';
    flash.style.transform = 'translate(-50%,-50%)';
    layer.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
  }

  function confetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const colors = ['#ef4444','#22c55e','#eab308','#3b82f6','#8b5cf6','#f472b6'];
    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 4,
        vx: -2 + Math.random() * 4,
        rot: Math.random() * 360,
        vr: -4 + Math.random() * 8
      });
    }
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 180) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
  }

  function showResult(state) {
    const ranking = state.ranking.length ? state.ranking : state.players.slice().sort((a,b) => {
      const aHome = a.tokens.filter(t => t.pos === 57).length;
      const bHome = b.tokens.filter(t => t.pos === 57).length;
      return bHome - aHome;
    });

    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-msg');
    const trophy = document.getElementById('result-trophy');
    const list = document.getElementById('ranking-list');

    const first = ranking[0];
    if (first && !first.isAI) {
      title.textContent = 'You are the Champion!';
      msg.textContent = 'Congratulations!';
      trophy.textContent = '🏆';
      AudioManager.announce('win');
    } else {
      title.textContent = ranking[0]?.name + ' Wins!';
      msg.textContent = 'Well played everyone!';
      trophy.textContent = '🥇';
    }

    list.innerHTML = '';
    ranking.forEach((p, i) => {
      const rewards = i === 0 ? '🥇 +50 coins  +100 XP' : i === 1 ? '🥈 +30 coins  +60 XP' : i === 2 ? '🥉 +15 coins  +30 XP' : '💪 Keep practicing!';
      const el = document.createElement('div');
      el.className = 'rank-item';
      el.innerHTML = `
        <span class="rank-pos">#${i + 1}</span>
        <span class="rank-avatar">${p.avatar}</span>
        <span class="rank-name">${p.name}</span>
        <span class="rank-reward">${rewards}</span>
      `;
      list.appendChild(el);
    });

    confetti();
    showScreen('result');
  }

  return {
    showScreen, toast, updateTurnIndicator, renderTokens,
    highlightMovable, clearHighlights, setDice, updatePlayerPanels,
    showCaptureEffect, confetti, showResult, getColorHex
  };
})();
