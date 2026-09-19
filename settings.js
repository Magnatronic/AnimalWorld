/* ── SETTINGS ── */
// Everything an adult can change from the ⚙ panel. Saved in this browser's
// localStorage, so each classroom computer keeps its own settings.
const SETTINGS_KEY = 'animalWorld.settings';

const DEFAULT_SETTINGS = {
    scan: {
        on:         false,   // switch scanning; remembered so a switch user's device starts ready
        mode:       'auto',  // 'auto' | 'press' | 'two' (one switch moves, one selects)
        speed:       1800,   // ms per item
        startDelay:  1000,   // ms before auto-scan begins
        loops:          0,   // 0 = continuous, n = stop after n loops
        // Which switch does what: 'space' (Space, or Space / Enter for one-switch
        // scanning), 'enter', 'any' (any key or switch), or a switch learned in the
        // Scanning tab, e.g. { type: 'key', code: 'Digit1' } (see shared/switches.js).
        select:   'space',   // the one scanning switch, in Auto and Press to Start
        move:     'space',   // Two Switches: moves the highlight
        pick:     'enter',   // Two Switches: chooses
    },
    area: {
        size:         100,   // % of the screen the app fills: 100, 80 or 60
        pos:     'centre',   // where a smaller app sits: 'left' | 'centre' | 'right' along the bottom
        nav:        'top',   // Back button and title bar: 'top' | 'bottom'
    },
    wam: {
        holes:          9,   // 4, 6 or 9
        relaxedCount:  10,   // animals in a Relaxed round; 0 = until the adult stops it
        roundSecs:     30,   // length of a timed round
    },
    sound: {
        volume:         1,   // 0.3 quiet, 0.6 medium, 1 loud
        speakNames: false,   // say every animal's name after its sound, not just fish
        voice:         '',   // speechSynthesis voice name; '' = pick the best available
        rate:         0.9,   // speaking speed
        pitch:          1,   // 1 is the voice's natural pitch
    },
};

const settings = loadSettings();

function loadSettings() {
    const s = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        // Take only keys we still use, so an old save can't drop a new default.
        for (const group in s) for (const key in s[group]) {
            const value = saved?.[group]?.[key];
            if (typeof value === typeof s[group][key]) s[group][key] = value;
        }
        // Scanning switches are a word or a learned switch. Earlier versions saved
        // "Any key" as scan.anyKey, and briefly a numbered switch ('s0'…) instead.
        const WORDS = { select: ['space', 'any'], move: ['space', 'enter'], pick: ['enter', 'space'] };
        for (const key in WORDS) {
            const v = saved?.scan?.[key];
            if (Switches.isBinding(v)) s.scan[key] = v;
            else if (/^s\d$/.test(v) && Switches.slots[+v[1]]?.binding) s.scan[key] = Switches.slots[+v[1]].binding;
            else if (!WORDS[key].includes(v)) s.scan[key] = DEFAULT_SETTINGS.scan[key];
        }
        if (saved?.scan?.anyKey === true && saved.scan.select === undefined) s.scan.select = 'any';
    } catch (e) { /* private window or blocked storage: run on defaults */ }
    return s;
}

function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
}

// Set a value by its data-setting path, e.g. setSetting('scan.speed', 3000).
function setSetting(path, value) {
    const [group, key] = path.split('.');
    // Shrinking the app is for students who can't reach the top, so bring the
    // Back button down with it. The adult can put it back up afterwards.
    if (path === 'area.size' && value < 100 && settings.area.size === 100) settings.area.nav = 'bottom';
    settings[group][key] = value;
    saveSettings();
    renderSettings();
    if (group === 'area') applyPlayArea();
    if (group === 'sound' && currentAudio) currentAudio.volume = settings.sound.volume;
    if (path === 'sound.voice') { pickVoice(); renderVoiceOptions(); }
}

// The Play area is drawn entirely by these body classes (see PLAY AREA in styles.css);
// they drive the preview in the settings panel too.
function applyPlayArea() {
    const { size, pos, nav } = settings.area;
    const body = document.body;
    [80, 60].forEach(n => body.classList.toggle('area-size-' + n, size === n));
    ['left', 'centre', 'right'].forEach(p => body.classList.toggle('area-pos-' + p, size < 100 && pos === p));
    body.classList.toggle('nav-bottom', nav === 'bottom');
}

// data-value is always a string; turn it back into the type the setting holds.
function parseSettingValue(v) {
    if (v === 'true')  return true;
    if (v === 'false') return false;
    if (v !== '' && !isNaN(v)) return Number(v);
    return v;
}

// ── Scanning switches: learned right here, in the Scanning tab ──
const SCAN_WORDS = { space: 'Space', enter: 'Enter', any: 'Any key or switch' };
const SCAN_ROLE  = { move: 'Move', pick: 'Select' };

function scanSwitchName(key) {
    const v = settings.scan[key];
    if (typeof v === 'object') return Switches.describe(v);
    return v === 'space' && key === 'select' ? 'Space / Enter' : SCAN_WORDS[v];
}

// What a setting presses, as a binding, so it can be compared (null for "any").
function scanBinding(value) {
    if (typeof value === 'object') return value;
    return { space: { type: 'key', code: 'Space' }, enter: { type: 'key', code: 'Enter' } }[value] || null;
}

// With two switches, Move and Select must be different. Returns a warning, or ''.
function scanClash(key, value) {
    if (key === 'select') return '';
    const other = key === 'move' ? 'pick' : 'move';
    return Switches.sameBinding(scanBinding(value), scanBinding(settings.scan[other]))
        ? `That's already the ${SCAN_ROLE[other]} switch. Choose a different one.` : '';
}

function renderScanSwitches() {
    document.querySelectorAll('#settings-panel .scan-switch').forEach(group => {
        const key = group.dataset.scan, value = settings.scan[key];
        group.querySelector('.learn-current').textContent = scanSwitchName(key);
        group.querySelectorAll('.word-btn').forEach(b => b.classList.toggle('active', b.dataset.word === value));
        // The same switch doing a job in Animal Scenes is fine: just say so.
        const slot = Switches.slotOf(scanBinding(value));
        const info = group.querySelector('.learn-info');
        info.classList.remove('warn');
        info.textContent = slot >= 0 ? `Also Switch ${slot + 1} in Animal Scenes.` : '';
    });
}

function warnScanSwitch(key, text) {
    const info = document.querySelector(`.scan-switch[data-scan="${key}"] .learn-info`);
    info.textContent = text;
    info.classList.add('warn');
}

async function learnScanSwitch(key) {
    const group = document.querySelector(`.scan-switch[data-scan="${key}"]`);
    // Move focus off the Learn button, so learning Space or Enter can't also "click" it.
    if (document.activeElement) document.activeElement.blur();
    group.classList.add('learning');
    group.querySelector('.learn-current').textContent = 'Press the switch now…';
    group.querySelector('.learn-btn').textContent = 'Cancel';
    const binding = await Switches.capture();
    group.classList.remove('learning');
    group.querySelector('.learn-btn').textContent = 'Learn';
    const clash = binding && scanClash(key, binding);
    if (binding && !clash) setSetting('scan.' + key, binding);
    else renderSettings();
    if (clash) warnScanSwitch(key, clash);
}

function useScanWord(key, word) {
    const clash = scanClash(key, word);
    if (clash) { warnScanSwitch(key, clash); return; }
    setSetting('scan.' + key, word);
}

const SCAN_MODE_NOTES = {
    auto:  'The highlight moves on its own. Press the switch to choose.',
    press: 'Press the switch to start the highlight moving, and again to choose.',
    two:   'One switch moves the highlight, the other chooses. There is no timer.',
};

function renderSettings() {
    renderScanSwitches();
    document.querySelectorAll('#settings-panel [data-setting]').forEach(row => {
        const [group, key] = row.dataset.setting.split('.');
        row.querySelectorAll('.setting-opt').forEach(btn =>
            btn.classList.toggle('active', parseSettingValue(btn.dataset.value) === settings[group][key]));
    });
    // Show only the scanning rows that apply to the chosen mode.
    const mode = settings.scan.mode, two = mode === 'two';
    const showRow = (id, on) => { document.getElementById(id).style.display = on ? '' : 'none'; };
    showRow('speed-group',  !two);
    showRow('delay-group',  mode === 'auto');
    showRow('loops-group',  !two);
    showRow('select-group', !two);
    showRow('move-group',    two);
    showRow('pick-group',    two);
    document.getElementById('scan-mode-note').textContent = SCAN_MODE_NOTES[mode];
    document.getElementById('area-pos-group').style.display = settings.area.size < 100 ? '' : 'none';
    renderVoiceOptions();
}

function resetSettings() {
    // Two taps, so a stray one can't wipe a student's setup.
    const btn = document.getElementById('settings-reset');
    if (!btn.classList.contains('confirm')) {
        btn.classList.add('confirm');
        btn.textContent = 'Tap again to reset';
        btn._timer = setTimeout(() => { btn.classList.remove('confirm'); btn.textContent = 'Reset to defaults'; }, 3000);
        return;
    }
    clearTimeout(btn._timer);
    btn.classList.remove('confirm');
    btn.textContent = 'Reset to defaults';
    const wasScanning = settings.scan.on;
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    for (const group in fresh) Object.assign(settings[group], fresh[group]);
    settings.scan.on = wasScanning;   // the Switch button owns this, not the panel
    saveSettings();
    pickVoice();
    renderSettings();
    applyPlayArea();
}

function showSettingsTab(name) {
    document.querySelectorAll('#settings-panel .settings-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('#settings-panel .settings-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
}

function openSettings() {
    renderSettings();
    document.getElementById('settings-panel').classList.add('open');
}
function closeSettings() {
    Switches.cancelLearn();
    document.getElementById('settings-panel').classList.remove('open');
}

document.getElementById('voice-select').addEventListener('change', e => setSetting('sound.voice', e.target.value));

document.getElementById('settings-panel').addEventListener('click', e => {
    const opt = e.target.closest('.setting-opt');
    if (opt) { setSetting(opt.closest('[data-setting]').dataset.setting, parseSettingValue(opt.dataset.value)); return; }
    const tab = e.target.closest('.settings-tab');
    if (tab) { showSettingsTab(tab.dataset.tab); return; }
    const group = e.target.closest('.scan-switch');
    if (!group) return;
    if (e.target.closest('.learn-btn')) {
        if (group.classList.contains('learning')) Switches.cancelLearn();
        else learnScanSwitch(group.dataset.scan);
    } else if (e.target.closest('.word-btn')) {
        useScanWord(group.dataset.scan, e.target.closest('.word-btn').dataset.word);
    }
});

applyPlayArea();

/* ── HOLD TO OPEN ── */
const SETTINGS_HOLD_MS = 2000;
(function () {
    const btn  = document.getElementById('settings-btn');
    const hint = document.getElementById('hold-hint');
    let timer = null, hintTimer = null;

    btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        btn.classList.add('holding');
        timer = setTimeout(() => {
            timer = null;
            btn.classList.remove('holding');
            openSettings();
        }, SETTINGS_HOLD_MS);
    });
    const cancel = () => {
        if (!timer) return;
        clearTimeout(timer);
        timer = null;
        btn.classList.remove('holding');
        hint.classList.add('visible');
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => hint.classList.remove('visible'), 2000);
    };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, cancel));
    btn.addEventListener('contextmenu', e => e.preventDefault());
})();
