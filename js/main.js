/* ==================== MAIN CONTROLLER ==================== */
(function () {
  // App state for setup flow
  let numPlayers = 4;
  let difficulty = 'hard';
  let setupPlayers = [];
  let profile = JSON.parse(localStorage.getItem('ludo_profile') || '{"name":"Player","avatar":"😎","games":0,"wins":0,"coins":0,"xp":0}');

  // ---------- Navigation ----------
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      AudioManager.click();
      const a = btn.dataset.action;
      if (a === 'play') UI.showScreen('mode');
      else if (a === 'settings') UI.showScreen('settings');
      else if (a === 'profile') { loadProfile(); UI.showScreen('profile'); }
      else if (a === 'help') UI.showScreen('help');
      else if (a === 'about') UI.showScreen('about');
    });
  });

  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AudioManager.click();
      UI.showScreen(btn.dataset.back);
    });
  });

  // Mode select
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      AudioManager.click();
      numPlayers = parseInt(card.dataset.players);
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      if (numPlayers === 1) {
        UI.showScreen('difficulty');
      } else {
        prepareSetup();
        UI.showScreen('setup');
      }
    });
  });

  // Difficulty
  document.querySelectorAll('.diff-card').forEach(card => {
    card.addEventListener('click', () => {
      AudioManager.click();
      difficulty = card.dataset.diff;
      document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  document.getElementById('diff-continue').addEventListener('click', () => {
    AudioManager.click();
    prepareSetup();
    UI.showScreen('setup');
  });

  function prepareSetup() {
    setupPlayers = [];
    const colors = [0, 1, 2, 3]; // red green yellow blue
    if (numPlayers === 1) {
      setupPlayers.push({ name: profile.name || 'You', colorIdx: 0, avatar: profile.avatar || '😎', isAI: false });
      setupPlayers.push({ name: 'AI Bot', colorIdx: 2, avatar: '🤖', isAI: true }); // opposite color
    } else {
      for (let i = 0; i < numPlayers; i++) {
        setupPlayers.push({
          name: i === 0 ? (profile.name || 'Player 1') : `Player ${i + 1}`,
          colorIdx: colors[i],
          avatar: Game.AVATARS[i % Game.AVATARS.length],
          isAI: false
        });
      }
    }
    renderSetup();
  }

  function renderSetup() {
    const container = document.getElementById('setup-players');
    container.innerHTML = '';
    const usedColors = new Set();

    setupPlayers.forEach((p, idx) => {
      usedColors.add(p.colorIdx);
      const card = document.createElement('div');
      card.className = 'setup-card';
      card.innerHTML = `
        <div class="color-dot" style="background:${UI.getColorHex(Game.COLORS[p.colorIdx])}"></div>
        <input type="text" value="${p.name}" maxlength="12" data-idx="${idx}" class="name-input" />
        <div class="avatar-pick">
          ${Game.AVATARS.map(a => `<button class="avatar-btn ${a === p.avatar ? 'selected' : ''}" data-idx="${idx}" data-avatar="${a}">${a}</button>`).join('')}
        </div>
        <div class="color-picker">
          ${Game.COLORS.map((c, ci) => `
            <button class="color-btn ${ci === p.colorIdx ? 'selected' : ''}" 
              style="background:${UI.getColorHex(c)}" 
              data-idx="${idx}" data-color="${ci}"
              ${usedColors.has(ci) && ci !== p.colorIdx ? 'disabled' : ''}></button>
          `).join('')}
        </div>
        ${p.isAI ? '<span style="font-size:0.8rem;color:var(--muted)">AI</span>' : ''}
      `;
      container.appendChild(card);
    });

    // Bind inputs
    container.querySelectorAll('.name-input').forEach(inp => {
      inp.addEventListener('change', e => {
        setupPlayers[+e.target.dataset.idx].name = e.target.value.trim() || 'Player';
      });
    });
    container.querySelectorAll('.avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.idx;
        setupPlayers[i].avatar = btn.dataset.avatar;
        renderSetup();
      });
    });
    container.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        const i = +btn.dataset.idx;
        const newC = +btn.dataset.color;
        // Swap if taken
        const takenBy = setupPlayers.findIndex(p => p.colorIdx === newC);
        if (takenBy !== -1 && takenBy !== i) {
          setupPlayers[takenBy].colorIdx = setupPlayers[i].colorIdx;
        }
        setupPlayers[i].colorIdx = newC;
        renderSetup();
      });
    });
  }

  // Start game
  document.getElementById('start-game-btn').addEventListener('click', () => {
    AudioManager.click();
    startMatch();
  });

  function startMatch() {
    const config = {
      numPlayers: setupPlayers.length,
      difficulty,
      players: setupPlayers
    };
    Game.init(config);
    Board.createBoardDOM(document.getElementById('ludo-board'));
    UI.renderTokens(Game.getState());
    UI.updatePlayerPanels(Game.getState());
    UI.updateTurnIndicator(Game.currentPlayer());
    UI.setDice(1);
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('suggestion-box').classList.add('hidden');
    UI.showScreen('game');
    AudioManager.announce('start');
    // If first player is AI, auto play
    setTimeout(checkAITurn, 800);
  }

  // ---------- Game controls ----------
  const rollBtn = document.getElementById('roll-btn');
  rollBtn.addEventListener('click', onRoll);

  function onRoll() {
    const state = Game.getState();
    if (state.phase !== 'roll' || state.gameOver) return;
    const player = Game.currentPlayer();
    if (player.isAI) return;

    rollBtn.disabled = true;
    AudioManager.diceRoll();
    const result = Game.rollDice();
    UI.setDice(result.value, true);

    setTimeout(() => {
      AudioManager.announceDice(result.value);
      if (result.skip) {
        UI.toast('Three 6s! Turn skipped');
        AudioManager.announce('skip');
        setTimeout(() => { Game.endTurn(); afterTurnChange(); }, 1200 * Game.getAnimSpeed());
        return;
      }
      if (result.noMove) {
        UI.toast('No moves available');
        setTimeout(() => { Game.endTurn(); afterTurnChange(); }, 900 * Game.getAnimSpeed());
        return;
      }
      // Show suggestion
      const sug = Game.getState().suggestedToken;
      UI.highlightMovable(result.movable, sug);
      if (sug !== null) {
        document.getElementById('suggestion-box').classList.remove('hidden');
      }
      // Wait for token click
    }, 750 * Game.getAnimSpeed());
  }

  // Token click
  document.getElementById('tokens-layer').addEventListener('click', e => {
    const tokenEl = e.target.closest('.token');
    if (!tokenEl || !tokenEl.classList.contains('selectable')) return;
    const tIdx = +tokenEl.dataset.token;
    const pIdx = +tokenEl.dataset.player;
    if (pIdx !== Game.getState().currentIdx) return;
    executeMove(tIdx);
  });

  function executeMove(tokenIdx) {
    const state = Game.getState();
    if (state.phase !== 'select') return;

    UI.clearHighlights();
    document.getElementById('suggestion-box').classList.add('hidden');
    rollBtn.disabled = true;

    const result = Game.moveToken(tokenIdx);
    if (!result) return;

    // Animate token (re-render after short delay for CSS transition)
    AudioManager.tokenMove();
    UI.renderTokens(Game.getState());

    setTimeout(() => {
      if (result.captured) {
        AudioManager.capture();
        AudioManager.announce('capture');
        // Find position for flash
        const pos = Board.getTokenPixelPos(result.captured.player.colorIdx, { pos: -1 }, 0);
        UI.showCaptureEffect(pos.left, pos.top);
        UI.toast('Token captured! 💥');
        UI.renderTokens(Game.getState());
      }
      if (result.reachedHome) {
        AudioManager.home();
        AudioManager.announce('home');
        UI.toast('Token reached home! 🏠');
      }
      if (result.finished) {
        UI.toast(`${Game.currentPlayer().name} finished!`);
      }

      if (result.gameOver) {
        setTimeout(() => finishGame(), 1000);
        return;
      }

      // End turn or extra
      setTimeout(() => {
        Game.endTurn();
        afterTurnChange();
      }, 600 * Game.getAnimSpeed());
    }, 400 * Game.getAnimSpeed());
  }

  function afterTurnChange() {
    const state = Game.getState();
    if (state.gameOver) {
      finishGame();
      return;
    }
    UI.updateTurnIndicator(Game.currentPlayer());
    UI.updatePlayerPanels(state);
    UI.setDice(1);
    rollBtn.disabled = Game.currentPlayer().isAI;
    document.getElementById('suggestion-box').classList.add('hidden');
    checkAITurn();
  }

  function checkAITurn() {
    const state = Game.getState();
    const player = Game.currentPlayer();
    if (!player.isAI || state.gameOver || state.phase !== 'roll') return;

    UI.updateTurnIndicator(player, true);
    rollBtn.disabled = true;

    setTimeout(() => {
      AudioManager.diceRoll();
      const result = Game.rollDice();
      UI.setDice(result.value, true);

      setTimeout(() => {
        AudioManager.announceDice(result.value);
        if (result.skip || result.noMove) {
          if (result.skip) UI.toast('AI skipped (3 sixes)');
          setTimeout(() => { Game.endTurn(); afterTurnChange(); }, 1000 * Game.getAnimSpeed());
          return;
        }
        // AI chooses
        const choice = AI.chooseMove(player, result.value, state.players, player.difficulty);
        if (choice === null) {
          setTimeout(() => { Game.endTurn(); afterTurnChange(); }, 800);
          return;
        }
        // Highlight briefly then move
        UI.highlightMovable([choice], choice);
        setTimeout(() => executeMove(choice), 700 * Game.getAnimSpeed());
      }, 800 * Game.getAnimSpeed());
    }, 900 * Game.getAnimSpeed());
  }

  function finishGame() {
    const state = Game.getState();
    // Update profile stats
    profile.games = (profile.games || 0) + 1;
    const human = state.players.find(p => !p.isAI);
    if (human && human.rank === 1) {
      profile.wins = (profile.wins || 0) + 1;
      profile.coins = (profile.coins || 0) + 50;
      profile.xp = (profile.xp || 0) + 100;
    } else if (human) {
      profile.coins = (profile.coins || 0) + (human.rank === 2 ? 30 : 15);
      profile.xp = (profile.xp || 0) + (human.rank === 2 ? 60 : 30);
    }
    localStorage.setItem('ludo_profile', JSON.stringify(profile));
    AudioManager.win();
    UI.showResult(state);
  }

  // Pause
  document.getElementById('pause-btn').addEventListener('click', () => {
    document.getElementById('overlay-pause').classList.add('show');
  });
  document.querySelectorAll('[data-pause]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.pause;
      document.getElementById('overlay-pause').classList.remove('show');
      if (a === 'resume') return;
      if (a === 'restart') startMatch();
      if (a === 'home') UI.showScreen('home');
      if (a === 'settings') UI.showScreen('settings');
      if (a === 'quit') UI.showScreen('home');
    });
  });

  // Result buttons
  document.getElementById('play-again-btn').addEventListener('click', () => {
    AudioManager.click();
    startMatch(); // same setup
  });
  document.getElementById('new-match-btn').addEventListener('click', () => {
    AudioManager.click();
    UI.showScreen('mode');
  });
  document.getElementById('result-home-btn').addEventListener('click', () => {
    AudioManager.click();
    UI.showScreen('home');
  });

  // Theme
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('light', btn.dataset.theme === 'light');
      document.body.classList.toggle('dark', btn.dataset.theme === 'dark');
      document.querySelectorAll('[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === btn.dataset.theme));
      localStorage.setItem('ludo_theme', btn.dataset.theme);
    });
  });
  function toggleTheme() {
    const isLight = document.body.classList.toggle('light');
    document.body.classList.toggle('dark', !isLight);
    document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('ludo_theme', isLight ? 'light' : 'dark');
  }
  // Load theme
  const savedTheme = localStorage.getItem('ludo_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
    document.getElementById('theme-toggle').textContent = '☀️';
  }

  // Sound toggles
  document.getElementById('sound-toggle').addEventListener('click', () => {
    const on = !AudioManager.isSoundOn();
    AudioManager.setSound(on);
    document.getElementById('sound-toggle').textContent = on ? '🔊' : '🔇';
    document.getElementById('sound-btn-game').textContent = on ? '🔊' : '🔇';
  });
  document.getElementById('sound-btn-game').addEventListener('click', () => {
    document.getElementById('sound-toggle').click();
  });

  // Settings bindings
  document.getElementById('set-sound').addEventListener('change', e => {
    AudioManager.setSound(e.target.checked);
  });
  document.getElementById('set-voice').addEventListener('change', e => {
    AudioManager.setVoice(e.target.checked);
  });
  document.getElementById('vol-voice').addEventListener('input', e => AudioManager.setVolVoice(+e.target.value));
  document.getElementById('vol-fx').addEventListener('input', e => AudioManager.setVolFx(+e.target.value));
  document.getElementById('anim-speed').addEventListener('change', e => {
    Game.setAnimSpeed(+e.target.value);
  });
  document.getElementById('reset-settings').addEventListener('click', () => {
    AudioManager.setSound(true);
    AudioManager.setVoice(true);
    document.getElementById('set-sound').checked = true;
    document.getElementById('set-voice').checked = true;
    document.getElementById('vol-music').value = 40;
    document.getElementById('vol-voice').value = 80;
    document.getElementById('vol-fx').value = 70;
    document.getElementById('anim-speed').value = '1';
    Game.setAnimSpeed(1);
    UI.toast('Settings reset');
  });

  // Profile
  function loadProfile() {
    document.getElementById('profile-name').value = profile.name || 'Player';
    document.getElementById('profile-avatar').textContent = profile.avatar || '😎';
    document.getElementById('stat-games').textContent = profile.games || 0;
    document.getElementById('stat-wins').textContent = profile.wins || 0;
    document.getElementById('stat-coins').textContent = profile.coins || 0;
    document.getElementById('stat-xp').textContent = profile.xp || 0;
  }
  document.getElementById('profile-name').addEventListener('change', e => {
    profile.name = e.target.value.trim() || 'Player';
    localStorage.setItem('ludo_profile', JSON.stringify(profile));
  });

  // Resize handler for tokens
  window.addEventListener('resize', () => {
    if (document.getElementById('screen-game').classList.contains('active')) {
      UI.renderTokens(Game.getState());
    }
  });

  // Prefetch voices
  if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  console.log('%c Ludo Master loaded — Offline Premium Edition', 'color:#8b5cf6;font-weight:bold;font-size:14px');
})();
