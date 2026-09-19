/* ── SETTINGS ── */
// Everything an adult can change from the ⚙ panel. Saved in this browser's
// localStorage, so each classroom computer keeps its own settings.
const SETTINGS_KEY = 'animalWorld.settings';

const DEFAULT_SETTINGS = {
    scan: {
        on:         false,   // switch scanning; remembered so a switch user's device starts ready
        mode:       'auto',  // 'auto' | 'press'
        speed:       1800,   // ms per item
        startDelay:  1000,   // ms before auto-scan begins
        loops:          0,   // 0 = continuous, n = stop after n loops
        anyKey:     false,   // true = any keydown acts as switch
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

function renderSettings() {
    document.querySelectorAll('#settings-panel [data-setting]').forEach(row => {
        const [group, key] = row.dataset.setting.split('.');
        row.querySelectorAll('.setting-opt').forEach(btn =>
            btn.classList.toggle('active', parseSettingValue(btn.dataset.value) === settings[group][key]));
    });
    document.getElementById('delay-group').style.display = settings.scan.mode === 'auto' ? '' : 'none';
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

// ── Learned switches (shared/switches.js) ──
function renderSwitchList() {
    const list = document.getElementById('switch-list');
    list.innerHTML = Switches.slots.map((slot, i) => `
        <div class="switch-row" data-switch="${i}">
            <span class="switch-dot" style="background:${Switches.COLOUR_HEX[slot.colour]}"></span>
            <span class="switch-name">Switch ${i + 1}</span>
            <span class="switch-binding${slot.binding ? '' : ' unset'}">${Switches.describe(slot.binding)}</span>
            <button class="switch-learn" id="switch-learn-${i}">${slot.binding ? 'Learn again' : 'Learn'}</button>
            <button class="switch-clear" id="switch-clear-${i}" aria-label="Forget switch ${i + 1}"${slot.binding ? '' : ' disabled'}>✕</button>
        </div>`).join('');
}

async function learnSwitch(i) {
    const row = document.querySelector(`.switch-row[data-switch="${i}"]`);
    // Move focus off the Learn button, so learning Space or Enter can't also "click" it.
    if (document.activeElement) document.activeElement.blur();
    row.classList.add('learning');
    row.querySelector('.switch-binding').textContent = 'Press the switch now…';
    row.querySelector('.switch-learn').textContent = 'Cancel';
    await Switches.learn(i);
    renderSwitchList();
}

document.getElementById('switch-list').addEventListener('click', e => {
    const row = e.target.closest('.switch-row');
    if (!row) return;
    const i = +row.dataset.switch;
    if (e.target.closest('.switch-learn')) {
        if (row.classList.contains('learning')) Switches.cancelLearn();
        else learnSwitch(i);
    } else if (e.target.closest('.switch-clear')) {
        Switches.clear(i);
        renderSwitchList();
    }
});

function showSettingsTab(name) {
    document.querySelectorAll('#settings-panel .settings-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('#settings-panel .settings-pane').forEach(p => p.classList.toggle('active', p.dataset.pane === name));
}

function openSettings() {
    renderSettings();
    renderSwitchList();
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
    if (tab) showSettingsTab(tab.dataset.tab);
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
