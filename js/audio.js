/* ==================== AUDIO & VOICE ==================== */
const AudioManager = (() => {
  let soundOn = true;
  let voiceOn = true;
  let volMusic = 0.4;
  let volVoice = 0.8;
  let volFx = 0.7;
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', vol = 0.3) {
    if (!soundOn) return;
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol * volFx, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  function diceRoll() {
    playTone(400, 0.08, 'square', 0.15);
    setTimeout(() => playTone(600, 0.08, 'square', 0.15), 80);
    setTimeout(() => playTone(800, 0.1, 'square', 0.2), 160);
  }

  function tokenMove() {
    playTone(520, 0.07, 'triangle', 0.2);
  }

  function capture() {
    playTone(200, 0.15, 'sawtooth', 0.25);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.2), 100);
  }

  function home() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.25), i * 120);
    });
  }

  function win() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.3, 'sine', 0.3), i * 150);
    });
  }

  function click() {
    playTone(800, 0.05, 'sine', 0.15);
  }

  const numberWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

  function speak(text, rate = 1.05) {
    if (!voiceOn || !soundOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 1.05;
      u.volume = volVoice;
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha')));
      if (preferred) u.voice = preferred;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function announceDice(val) {
    speak(numberWords[val] || String(val));
  }

  function announce(event) {
    const phrases = {
      turn: 'Your turn',
      safe: 'Safe zone',
      capture: ['Excellent!', 'Great move!', 'Amazing!'][Math.floor(Math.random() * 3)],
      home: 'Congratulations! One token reached home.',
      win: 'Congratulations! You are the Champion!',
      second: 'Excellent! You secured Second Position!',
      third: 'Good job! You secured Third Position!',
      last: 'Better luck next time!',
      six: 'Six! Extra turn',
      skip: 'Three sixes. Turn skipped.',
      start: 'Game started. Good luck!',
      move: 'Nice move',
    };
    const p = phrases[event];
    if (p) speak(typeof p === 'string' ? p : p);
  }

  return {
    diceRoll, tokenMove, capture, home, win, click,
    announceDice, announce, speak,
    setSound(v) { soundOn = v; },
    setVoice(v) { voiceOn = v; },
    setVolMusic(v) { volMusic = v / 100; },
    setVolVoice(v) { volVoice = v / 100; },
    setVolFx(v) { volFx = v / 100; },
    isSoundOn() { return soundOn; },
    isVoiceOn() { return voiceOn; }
  };
})();
