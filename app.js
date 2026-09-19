/* ── SWITCH SCANNING ENGINE ── */
// Scan options live in settings.scan (see settings.js).

let scanMode      = false;
let scanItems     = [];
let scanIndex     = 0;
let scanTimer     = null;
let scanRunning   = false;
let scanLoopCount = 0;
let scanDelayTimer = null;
let _navigated    = false;

function toggleScanMode() {
    scanMode = !scanMode;
    settings.scan.on = scanMode;
    saveSettings();
    const btn = document.getElementById('scan-toggle');
    btn.textContent = scanMode ? '♿ Switch: ON' : '♿ Switch: OFF';
    btn.classList.toggle('scan-on', scanMode);
    if (!scanMode) stopScan();
    else           setScanForScreen(document.querySelector('.screen.active')?.id);
}

function stopScan() {
    clearTimeout(scanDelayTimer);
    clearInterval(scanTimer);
    scanTimer     = null;
    scanRunning   = false;
    scanLoopCount = 0;
    scanItems.forEach(el => el.classList.remove('scan-focus'));
    scanItems = [];
}

function startScan(items) {
    stopScan();
    if (!scanMode) return;
    scanItems = items.filter(Boolean);
    if (!scanItems.length) return;
    if (settings.scan.mode === 'auto') {
        scanDelayTimer = setTimeout(beginCycling, settings.scan.startDelay);
    }
    // press mode: wait for keypress to begin
}

function beginCycling() {
    if (!scanItems.length) return;
    scanRunning   = true;
    scanLoopCount = 0;
    scanIndex     = 0;
    applyFocus();
    scanTimer = setInterval(() => {
        scanItems[scanIndex]?.classList.remove('scan-focus');
        scanIndex++;
        if (scanIndex >= scanItems.length) {
            scanLoopCount++;
            if (settings.scan.loops > 0 && scanLoopCount >= settings.scan.loops) {
                stopScan(); return;
            }
            scanIndex = 0;
        }
        applyFocus();
    }, settings.scan.speed);
}

function applyFocus() {
    scanItems.forEach((el, i) => el.classList.toggle('scan-focus', i === scanIndex));
}

function selectCurrent() {
    if (!scanItems.length) return;
    const target = scanItems[scanIndex];
    _navigated = false;
    stopScan();
    target?.click();
    // Auto mode: if no navigation happened (e.g. animal sound), restart scan
    if (settings.scan.mode === 'auto') {
        setTimeout(() => {
            if (!_navigated) setScanForScreen(document.querySelector('.screen.active')?.id);
        }, 200);
    }
}

document.addEventListener('keydown', e => {
    if (!scanMode) return;
    // Ignore keydown inside the settings panel
    if (document.getElementById('settings-panel').classList.contains('open')) return;
    const isSwitch = settings.scan.anyKey || e.code === 'Space' || e.code === 'Enter';
    if (!isSwitch) return;
    e.preventDefault();

    if (settings.scan.mode === 'press') {
        if (!scanRunning) { clearTimeout(scanDelayTimer); beginCycling(); }
        else              { selectCurrent(); }
    } else {
        // auto mode: keypress = select
        if (scanRunning) selectCurrent();
    }
});

function setScanForScreen(id) {
    if (!scanMode || !id) return;
    _navigated = true;
    const q  = s => document.querySelector(s);
    const qa = s => [...document.querySelectorAll(s)];
    switch (id) {
        case 'home':           startScan(qa('#home .theme-btn')); break;
        case 'activities':     startScan([q('#activities .back-btn'),    ...qa('#activities .activity-btn')]); break;
        case 'animals':        startScan([q('#animals .back-btn'),        ...qa('#animal-grid .animal-card')]); break;
        case 'difficulty':     startScan([q('#difficulty .back-btn'),     ...qa('#difficulty .diff-btn')]); break;
        case 'memory':         startScan([q('#memory .back-btn'),         ...qa('#memory-grid .mem-card')]); break;
        case 'wam-difficulty': startScan([q('#wam-difficulty .back-btn'), ...qa('#wam-difficulty .diff-btn')]); break;
        case 'wam-game':
            // Relaxed: scan just the waiting animal, then Back, so one press whacks it.
            // Between animals nothing is highlighted, so a press can't land on Back by accident.
            if (wamRelaxed) {
                const animal = q('.wam-hole.active:not(.whacked)');
                if (animal) startScan([animal, q('#wam-game .back-btn')]); else stopScan();
            } else {
                startScan([q('#wam-game .back-btn'), ...qa('.wam-hole')]);
            }
            break;
        case 'fta-difficulty': startScan([q('#fta-difficulty .back-btn'), ...qa('#fta-difficulty .diff-btn')]); break;
        case 'fta-game':       startScan([q('#fta-game .back-btn'),        ...qa('#fta-grid .fta-card')]); break;
    }
}

// Most animals are OpenMoji glyphs, bundled in openmoji/ by hexcode so the app
// works offline. The fish theme also uses artwork in fish/ that we derived from
// those glyphs, named by `src`.
const OPENMOJI_DIR = 'openmoji/';

function imgSrc(animal) {
    return animal.src || OPENMOJI_DIR + animal.code + '.svg';
}

/* ── STATE ── */
let currentThemeKey  = null;
let currentAudio     = null;
let currentCard      = null;

// Memory game state
let memTotalCards   = 4;
let memCols         = 2;
let memFlipped      = [];
let memMatched      = 0;
let memLocked       = false;
let memMoves        = 0;

/* ── HELPERS ── */
function show(id, skipScan) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (!skipScan) setScanForScreen(id);
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (currentCard) {
        currentCard.classList.remove('playing');
        currentCard = null;
    }
    if (window.speechSynthesis) speechSynthesis.cancel();
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Play an animal's sound, then say its name if it should be spoken (see spokenName).
function playSound(soundName, card, name) {
    stopAudio();
    const spoken = spokenName(name);
    const audio = new Audio('sounds/' + soundName + '.mp3');
    audio.volume = settings.sound.volume;

    audio.addEventListener('canplaythrough', () => {
        if (card) card.classList.add('has-sound', 'playing');
        currentAudio = audio;
        currentCard  = card;
        audio.play();
    }, { once: true });

    audio.addEventListener('ended', () => {
        if (card) card.classList.remove('playing');
        currentAudio = null;
        currentCard  = null;
        if (spoken) speak(spoken);
    }, { once: true });

    // No recording for this animal: say its name rather than stay silent. The
    // fish theme leads with a synthesised bubble, so it works even with no
    // sound files installed.
    audio.addEventListener('error', () => {
        if (card) card.classList.add('has-sound', 'playing');
        const cue = themes[currentThemeKey]?.speakName ? bubbleCue : done => done();
        cue(() => {
            if (card) card.classList.remove('playing');
            speak(name);
        });
    }, { once: true });

    audio.load();
}

// Three short rising blips - a passable bubble with no file to download.
let bubbleCtx = null;
function bubbleCue(onDone) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { onDone(); return; }
    try {
        bubbleCtx = bubbleCtx || new Ctx();
        if (bubbleCtx.state === 'suspended') bubbleCtx.resume();
        const start = bubbleCtx.currentTime;
        [0, 0.09, 0.17].forEach((offset, i) => {
            const t    = start + offset;
            const osc  = bubbleCtx.createOscillator();
            const gain = bubbleCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(240 + i * 90, t);
            osc.frequency.exponentialRampToValueAtTime(700 + i * 220, t + 0.1);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.3 * settings.sound.volume, t + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
            osc.connect(gain).connect(bubbleCtx.destination);
            osc.start(t);
            osc.stop(t + 0.14);
            if (i === 2) osc.addEventListener('ended', onDone, { once: true });
        });
    } catch (e) { onDone(); }
}

// The name to speak after a card's sound, or null when names aren't spoken:
// always for themes or animals that ask (fish, and silent creatures such as
// the worm), otherwise only if the setting is on.
function spokenName(name) {
    const theme  = themes[currentThemeKey];
    const animal = theme && theme.animals.find(a => a.name === name);
    return (theme && theme.speakName) || (animal && animal.speakName) || settings.sound.speakNames ? name : null;
}

/* ── NAVIGATION ── */
function showHome() {
    stopAudio();
    hideWin();
    currentThemeKey = null;
    show('home');
}

function pickTheme(key) {
    currentThemeKey = key;
    const theme = themes[key];
    document.getElementById('act-title').textContent = theme.label;
    document.getElementById('act-header').className = 'screen-header';
    const screen = document.getElementById('activities');
    screen.className = 'screen active ' + theme.css;
    show('activities');
}

function showActivities() {
    stopAudio();
    pickTheme(currentThemeKey);
}

function showAnimals() {
    const theme = themes[currentThemeKey];
    document.getElementById('animals-title').textContent = theme.label;
    const screen = document.getElementById('animals');
    screen.className = 'screen active ' + theme.css;

    const grid = document.getElementById('animal-grid');
    grid.innerHTML = '';

    theme.animals.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'animal-card';
        card.innerHTML = `
            <span class="sound-badge">🔊</span>
            <img class="animal-img" src="${imgSrc(animal)}" alt="${animal.name}" loading="lazy"${animal.filter ? ` style="filter:${animal.filter}"` : ''}>
            <div class="animal-name">${animal.name}</div>
        `;
        card.addEventListener('click', () => playSound(animal.sound, card, animal.name));
        grid.appendChild(card);
    });

    show('animals', true);
    setScanForScreen('animals');
}

function showDifficulty() {
    hideWin();
    const theme = themes[currentThemeKey];
    const screen = document.getElementById('difficulty');
    screen.className = 'screen active ' + theme.css;
    show('difficulty');
}

/* ── MEMORY GAME ── */
function startMemory(totalCards, cols) {
    memTotalCards = totalCards;
    memCols       = cols;
    memFlipped    = [];
    memMatched    = 0;
    memLocked     = false;
    memMoves      = 0;
    hideWin();

    const theme   = themes[currentThemeKey];
    const pairs   = totalCards / 2;

    // Pick random animals and duplicate for pairs
    const picked  = shuffle(theme.animals).slice(0, pairs);
    const cards   = shuffle([...picked, ...picked]);

    const screen = document.getElementById('memory');
    screen.className = 'screen active ' + theme.css;

    document.getElementById('memory-title').textContent = theme.label;
    updateMoveCounter();

    const rows = totalCards / cols;
    const grid = document.getElementById('memory-grid');
    grid.className = 'memory-grid';
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    grid.innerHTML = '';

    cards.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'mem-card';
        card.dataset.animal = animal.name;
        card.dataset.sound  = animal.sound;
        card.innerHTML = `
            <div class="mem-card-inner">
                <div class="mem-face mem-back">⭐</div>
                <div class="mem-face mem-front">
                    <img src="${imgSrc(animal)}" alt="${animal.name}" loading="lazy"${animal.filter ? ` style="filter:${animal.filter}"` : ''}>
                    <div class="mem-name">${animal.name}</div>
                </div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });

    show('memory', true);
    setScanForScreen('memory');
}

function replayMemory() {
    startMemory(memTotalCards, memCols);
}

function flipCard(card) {
    if (memLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (memFlipped.length === 2) return;

    card.classList.add('flipped');
    playSound(card.dataset.sound, null, card.dataset.animal);
    memFlipped.push(card);

    if (memFlipped.length === 2) {
        memMoves++;
        updateMoveCounter();
        memLocked = true;
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const [a, b] = memFlipped;
    if (a.dataset.animal === b.dataset.animal) {
        a.classList.add('matched');
        b.classList.add('matched');
        memMatched++;
        memFlipped = [];
        memLocked  = false;
        if (memMatched === memTotalCards / 2) {
            setTimeout(showWin, 600);
        }
    } else {
        setTimeout(() => {
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            memFlipped = [];
            memLocked  = false;
        }, 1100);
    }
}

function updateMoveCounter() {
    const el = document.getElementById('move-counter');
    el.textContent = memMoves === 1 ? '1 move' : `${memMoves} moves`;
}

function showWin() {
    document.getElementById('win-moves').textContent =
        memMoves === 1 ? 'You did it in 1 move!' : `You did it in ${memMoves} moves!`;
    const overlay = document.getElementById('win-overlay');
    overlay.classList.add('visible');
    if (scanMode) startScan([...overlay.querySelectorAll('.win-btn')]);
}

function hideWin() {
    document.getElementById('win-overlay').classList.remove('visible');
}

/* ══ WHACK-A-MOLE ══ */
// Relaxed has no clock and no auto-hide: each animal waits to be tapped.
const WAM_CONFIGS = {
    relaxed: { simultaneous: 1, relaxed: true },
    starter: { simultaneous: 1, showMs: 3500, tickMs: 2000, stars: [5, 10, 16] },
    easy:    { simultaneous: 1, showMs: 2500, tickMs: 1500, stars: [8, 14, 20] },
    medium:  { simultaneous: 2, showMs: 2000, tickMs: 1100, stars: [12, 20, 28] },
    hard:    { simultaneous: 3, showMs: 1500, tickMs:  750, stars: [16, 26, 36] },
};

// Grid shape for each hole count the Games settings offer.
const WAM_LAYOUTS = { 4: [2, 2], 6: [3, 2], 9: [3, 3] };

let wamConfigKey = null;
let wamRelaxed   = false;
let wamRunning   = false;
let wamScore     = 0;
let wamTarget    = 0;     // Relaxed: animals in the round, 0 = no limit
let wamTimeLeft  = 30;
let wamTimer     = null;
let wamPopper    = null;

function showWamDifficulty() {
    const count = settings.wam.relaxedCount;
    document.getElementById('wam-relaxed-sub').textContent =
        'No timer · ' + (count ? count + ' animals' : 'keeps going') + ' · waits for you';
    const theme = themes[currentThemeKey];
    const screen = document.getElementById('wam-difficulty');
    screen.className = 'screen active ' + theme.css;
    show('wam-difficulty');
}

function stopWamTimers() {
    wamRunning = false;
    clearInterval(wamTimer);
    clearInterval(wamPopper);   // also clears Relaxed's setTimeout; they share one id pool
}

function startWam(configKey) {
    stopWamTimers();
    const cfg    = WAM_CONFIGS[configKey];
    wamConfigKey = configKey;
    wamRelaxed   = !!cfg.relaxed;
    wamRunning   = true;
    wamScore     = 0;
    wamTarget    = wamRelaxed ? settings.wam.relaxedCount : 0;
    wamTimeLeft  = settings.wam.roundSecs;

    const theme  = themes[currentThemeKey];
    const screen = document.getElementById('wam-game');
    screen.className = 'screen active ' + theme.css;
    document.getElementById('wam-title').textContent = theme.label;
    document.getElementById('wam-overlay').classList.remove('visible');

    // Build holes
    const holes = settings.wam.holes;
    const [cols, rows] = WAM_LAYOUTS[holes] || WAM_LAYOUTS[9];
    const grid = document.getElementById('wam-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    grid.innerHTML = '';
    for (let i = 0; i < cols * rows; i++) {
        const hole = document.createElement('div');
        hole.className = 'wam-hole';
        hole.innerHTML = `
            <div class="wam-burst"></div>
            <div class="wam-animal-wrap">
                <img class="wam-animal-img" alt="">
                <div class="wam-animal-name"></div>
            </div>`;
        hole.addEventListener('click', () => whackHole(hole));
        grid.appendChild(hole);
    }

    updateWamHud();
    show('wam-game');

    if (wamRelaxed) {
        wamPopper = setTimeout(() => popAnimal(cfg), 800);
    } else {
        wamTimer  = setInterval(wamTick, 1000);
        wamPopper = setInterval(() => popAnimal(cfg), cfg.tickMs);
    }
}

function replayWam() {
    document.getElementById('wam-overlay').classList.remove('visible');
    startWam(wamConfigKey);
}

function stopWam() {
    stopWamTimers();
    document.querySelectorAll('.wam-hole').forEach(h => retractHole(h));
    document.getElementById('wam-overlay').classList.remove('visible');
    showWamDifficulty();
}

function popAnimal(cfg) {
    if (!wamRunning) return;
    const active = document.querySelectorAll('.wam-hole.active').length;
    if (active >= cfg.simultaneous) return;

    const holes = Array.from(document.querySelectorAll('.wam-hole:not(.active):not(.whacked)'));
    if (!holes.length) return;

    const hole   = holes[Math.floor(Math.random() * holes.length)];
    const theme  = themes[currentThemeKey];
    const animal = theme.animals[Math.floor(Math.random() * theme.animals.length)];

    const wamImg = hole.querySelector('.wam-animal-img');
    wamImg.src = imgSrc(animal);
    wamImg.alt = animal.name;
    wamImg.style.filter = animal.filter || '';
    hole.querySelector('.wam-animal-name').textContent = animal.name;
    hole.dataset.sound = animal.sound;
    hole.dataset.name  = animal.name;
    hole.classList.add('active');

    // Auto-retract after showMs; Relaxed animals wait for the tap instead.
    if (cfg.relaxed) setScanForScreen('wam-game');
    else hole._wamTimer = setTimeout(() => retractHole(hole), cfg.showMs);
}

function retractHole(hole) {
    clearTimeout(hole._wamTimer);
    hole.classList.remove('active', 'whacked');
    // Clear image src to remove broken placeholder
    const img = hole.querySelector('.wam-animal-img');
    if (img) img.removeAttribute('src');
}

function whackHole(hole) {
    if (!hole.classList.contains('active') || hole.classList.contains('whacked')) return;
    clearTimeout(hole._wamTimer);
    hole.classList.add('whacked');
    wamScore++;
    updateWamHud();
    playSound(hole.dataset.sound, null, hole.dataset.name);

    // Pulse score
    const scoreEl = document.getElementById('wam-score');
    scoreEl.classList.remove('pulse');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('pulse');

    setTimeout(() => {
        retractHole(hole);
        if (!wamRelaxed || !wamRunning) return;
        if (wamTarget && wamScore >= wamTarget) endWam();
        else wamPopper = setTimeout(() => popAnimal(WAM_CONFIGS.relaxed), 600);
    }, 380);
}

function wamTick() {
    wamTimeLeft--;
    updateWamHud();
    if (wamTimeLeft <= 0) endWam();
}

function updateWamHud() {
    document.getElementById('wam-score').textContent = wamScore;
    // The second box counts down the clock, or the animals left in a Relaxed round.
    document.getElementById('wam-timer-stat').style.display = wamRelaxed && !wamTarget ? 'none' : '';
    document.getElementById('wam-timer-label').textContent  = wamRelaxed ? 'To go' : 'Time';
    document.getElementById('wam-timer').textContent        = wamRelaxed ? (wamTarget ? wamTarget - wamScore : '') : wamTimeLeft;
}

/* ── FIND THE ANIMAL ── */
let ftaCards       = 4;
let ftaAnimals     = [];
let ftaIndex       = 0;
let ftaLocked      = false;
let ftaCurrent     = null;
let ftaRewardAudio = null;

function showFtaDifficulty() {
    const theme  = themes[currentThemeKey];
    const screen = document.getElementById('fta-difficulty');
    screen.className = 'screen active ' + theme.css;
    show('fta-difficulty');
}

function startFta(numCards) {
    ftaCards   = numCards;
    ftaIndex   = 0;
    ftaLocked  = false;
    ftaAnimals = shuffle([...themes[currentThemeKey].animals]);
    const theme  = themes[currentThemeKey];
    const screen = document.getElementById('fta-game');
    screen.className = 'screen active ' + theme.css;
    show('fta-game', true); // skipScan — ftaRound registers after cards are built
    ftaRound();
}

function replayFta() {
    document.getElementById('fta-overlay').classList.remove('visible');
    startFta(ftaCards);
}

function ftaRound() {
    // Stop any still-playing reward audio and TTS from previous round
    if (ftaRewardAudio) { ftaRewardAudio.pause(); ftaRewardAudio = null; }
    speechSynthesis.cancel();
    ftaLocked  = false;
    ftaCurrent = ftaAnimals[ftaIndex];
    const theme = themes[currentThemeKey];

    // Progress label
    document.getElementById('fta-progress').textContent =
        `${ftaIndex + 1} of ${ftaAnimals.length}`;
    document.getElementById('fta-name').textContent = ftaCurrent.name;

    // Distractors from same theme, excluding the correct animal
    const pool       = theme.animals.filter(a => a.name !== ftaCurrent.name);
    const distractors = shuffle(pool).slice(0, ftaCards - 1);
    const cards      = shuffle([ftaCurrent, ...distractors]);

    const grid = document.getElementById('fta-grid');
    grid.className = `fta-grid cards-${ftaCards}`;
    grid.innerHTML = '';

    cards.forEach(animal => {
        const card = document.createElement('div');
        card.className = 'fta-card';
        card.innerHTML = `
            <img src="${imgSrc(animal)}" alt="${animal.name}" loading="lazy"${animal.filter ? ` style="filter:${animal.filter}"` : ''}>
        `;
        card.addEventListener('click', () => ftaTap(card, animal));
        grid.appendChild(card);
    });

    // Register scan now that cards are in the DOM
    setScanForScreen('fta-game');

    // Speak after a short delay so TTS doesn't clash with any previous utterance
    setTimeout(() => ftaSpeak(ftaCurrent.name), 300);
}

/* ── VOICE SELECTION ── */
let ftaVoice = null;

function pickVoice() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;

    // Priority list — best female voices across Chrome/Edge/Mac/iOS/Android
    const preferred = [
        'Google UK English Female',
        'Google US English Female',
        'Microsoft Aria Online (Natural) - English (United States)',
        'Microsoft Zira Desktop - English (United States)',
        'Microsoft Zira',
        'Samantha',          // macOS / iOS
        'Karen',             // macOS / iOS Australian
        'Moira',             // macOS Irish
        'Tessa',             // macOS South African
        'Fiona',             // macOS Scottish
    ];

    for (const name of preferred) {
        const v = voices.find(v => v.name === name);
        if (v) { ftaVoice = v; return; }
    }

    // Fall back: any English-language voice whose name suggests female
    const femaleEn = voices.find(v =>
        v.lang.startsWith('en') && /female|woman|girl/i.test(v.name)
    );
    if (femaleEn) { ftaVoice = femaleEn; return; }

    // Last resort: first English voice available
    ftaVoice = voices.find(v => v.lang.startsWith('en')) || null;
}

// Voices load asynchronously — try immediately then again on change
if (window.speechSynthesis) {
    pickVoice();
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

function speak(text, onDone) {
    if (!window.speechSynthesis) { if (onDone) onDone(); return; }
    speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(text);
    if (ftaVoice) utt.voice = ftaVoice;
    utt.rate   = 0.88;
    utt.pitch  = 1.15;
    utt.volume = settings.sound.volume;
    if (onDone) utt.addEventListener('end', onDone, { once: true });
    speechSynthesis.speak(utt);
}

function ftaSpeak(name) { speak('Find the ' + name); }

const FTA_PRAISE = [
    'Well done!', 'Fantastic!', 'That\'s right!', 'Brilliant!',
    'Amazing!', 'Great job!', 'Superstar!', 'Excellent!',
    'You got it!', 'Wonderful!', 'Spot on!', 'Terrific!'
];
let ftaLastPraise = '';

function ftaPraise() {
    const options = FTA_PRAISE.filter(p => p !== ftaLastPraise);
    const picked  = options[Math.floor(Math.random() * options.length)];
    ftaLastPraise = picked;
    return picked;
}

function ftaRepeat() {
    if (ftaCurrent) ftaSpeak(ftaCurrent.name);
}

function ftaTap(card, animal) {
    if (ftaLocked) return;
    if (animal.name === ftaCurrent.name) {
        ftaLocked = true;
        card.classList.add('correct');
        const advance = () => setTimeout(() => {
            ftaIndex++;
            if (ftaIndex >= ftaAnimals.length) ftaComplete();
            else ftaRound();
        }, 400);
        ftaRewardAudio = new Audio('sounds/' + ftaCurrent.sound + '.mp3');
        ftaRewardAudio.volume = settings.sound.volume;
        const praise = ftaPraise();
        ftaRewardAudio.addEventListener('ended', () => speak(praise, advance), { once: true });
        ftaRewardAudio.addEventListener('error', () => speak(praise, advance), { once: true });
        ftaRewardAudio.play().catch(() => speak(praise, advance));
    } else {
        card.classList.add('wrong');
        setTimeout(() => card.classList.remove('wrong'), 500);
        setTimeout(() => ftaSpeak(ftaCurrent.name), 700);
    }
}

function ftaComplete() {
    speak('Amazing! You found all ' + ftaAnimals.length + ' animals!');
    document.getElementById('fta-win-msg').textContent =
        `You found all ${ftaAnimals.length} animals!`;
    const overlay = document.getElementById('fta-overlay');
    overlay.classList.add('visible');
    if (scanMode) startScan([...overlay.querySelectorAll('.win-btn')]);
}

function endWam() {
    stopWamTimers();
    document.querySelectorAll('.wam-hole').forEach(h => retractHole(h));

    setTimeout(() => {
        // Star thresholds are set for a 30-second round; scale them to the round played.
        let stars = '⭐⭐⭐';
        if (!wamRelaxed) {
            const scale = settings.wam.roundSecs / 30;
            const [, two, three] = WAM_CONFIGS[wamConfigKey].stars.map(n => Math.round(n * scale));
            stars = wamScore >= three ? '⭐⭐⭐' : wamScore >= two ? '⭐⭐' : '⭐';
        }
        document.getElementById('wam-end-title').textContent = wamRelaxed ? 'All done!' : "Time's up!";
        document.getElementById('wam-stars').textContent = stars;
        document.getElementById('wam-final-score').textContent = wamScore;
        const wamOv = document.getElementById('wam-overlay');
        wamOv.classList.add('visible');
        if (scanMode) startScan([...wamOv.querySelectorAll('.win-btn')]);
    }, 500);
}

// Pick up where the last session left off.
if (settings.scan.on) toggleScanMode();
