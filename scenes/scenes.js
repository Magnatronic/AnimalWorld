/* ── ANIMAL SCENES ── */
// A calm, full-screen animal scene for touch screens and switches. Touch an
// animal and it calls; touch anywhere for a ripple. Each numbered switch
// (shared/switches.js) has a job in each theme: bring in a particular animal,
// make "anything happen", or change day and night.

/* ── Settings (saved in this browser, like Animal Activities') ── */
const SCENES_KEY = 'animalScenes.settings';
const SCENE_DEFAULTS = {
    theme:         'birds',
    look:          'soft',     // 'soft' | 'line' (matching outlines) | 'night' (night-light)
    pace:          1,          // 1.7 slower, 1 normal, 0.6 faster
    labels:        false,      // show each switch's colour and job on screen
    others:        'anything', // what keys and buttons that aren't numbered switches do: 'anything' | 'nothing'
    animalVolume:  1,
    ambientVolume: 0.5,        // the background loop; 0 = off
    jobs:          {},         // { theme: { switchId: animal name | 'anything' | 'nothing' | 'daynight' } }
};
const sceneSettings = loadSceneSettings();

function loadSceneSettings() {
    const s = JSON.parse(JSON.stringify(SCENE_DEFAULTS));
    try {
        const saved = JSON.parse(localStorage.getItem(SCENES_KEY));
        for (const key in s) if (saved && typeof saved[key] === typeof s[key] && saved[key] !== null) s[key] = saved[key];
    } catch (e) { /* private window or blocked storage: run on defaults */ }
    return s;
}
function saveSceneSettings() {
    try { localStorage.setItem(SCENES_KEY, JSON.stringify(sceneSettings)); } catch (e) {}
}

/* ── The background loop: two players crossfading, so the join is never heard ── */
const Ambient = (() => {
    const CROSSFADE = 3;              // seconds
    let players = [], active = 0, level = 0, timer = null;

    function begin(i) {
        const p = players[i];
        active = i;
        p.currentTime = 0;
        p.target = level;
        p.play().catch(() => {});
    }
    function tick() {
        const cur = players[active];
        if (cur.duration && cur.currentTime >= cur.duration - CROSSFADE) {
            cur.target = 0;           // this play fades out as the next starts from the top
            begin(1 - active);
        }
        const step = Math.max(level, 0.05) / (CROSSFADE * 10);
        players.forEach(p => {
            const v = p.volume + Math.max(-step, Math.min(step, p.target - p.volume));
            p.volume = Math.max(0, Math.min(1, v));
            if (p.volume === 0 && p.target === 0 && !p.paused) p.pause();
        });
    }
    function start(url, volume) {
        stop();
        level = volume;
        if (!url || !level) return;
        players = [new Audio(url), new Audio(url)];
        players.forEach(p => { p.volume = 0; p.target = 0; });
        begin(0);
        timer = setInterval(tick, 100);
    }
    function stop() {
        clearInterval(timer);
        timer = null;
        players.forEach(p => p.pause());
        players = [];
    }
    function setLevel(volume, url) {
        if (!players.length) { start(url, volume); return; }
        level = volume;
        if (!level) { stop(); return; }
        players[active].target = level;
    }
    return { start, stop, setLevel };
})();

/* ── The scene ── */
const stage  = document.getElementById('stage');
const layer  = document.getElementById('layer');
const labels = document.getElementById('labels');
let art = null;             // SceneArt for the current theme
let cast = {};              // name → { el, def, sound, spot, arrivedAt, leaving }
let spots = [];             // art.spots, each with .animal = name or null
let night = false;          // the day / night job flips this
let started = false;
let calling = null;         // the animal sound playing now; one at a time

function applyLook() {
    const base = sceneSettings.look;
    const look = night ? (base === 'night' ? 'soft' : 'night') : base;
    stage.className = `stage scene-${sceneSettings.theme} look-${look}`;
    stage.style.setProperty('--pace', sceneSettings.pace);
}

function buildScene() {
    if (calling) { calling.pause(); calling = null; }
    art = SceneArt[sceneSettings.theme] || SceneArt.birds;
    const themeAnimals = themes[sceneSettings.theme].animals;
    night = false;
    applyLook();
    document.getElementById('bg').innerHTML = art.svg();
    layer.innerHTML = '';
    spots = art.spots.map(s => ({ ...s, animal: null }));
    cast = {};
    Object.entries(art.animals).forEach(([name, def]) => {
        const animal = themeAnimals.find(a => a.name === name);
        if (!animal) return;
        const el = document.createElement('div');
        el.className = 'animal ' + (def.move || art.move);
        el.style.width = def.w + '%';
        el.hidden = true;
        el.innerHTML = `<img alt="${name}" src="${imgSrc(animal)}">`;
        el.querySelector('img').style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
        el.addEventListener('pointerdown', e => { e.stopPropagation(); if (started) sing(name); });
        layer.appendChild(el);
        cast[name] = { el, def, sound: animal.sound, spot: null, arrivedAt: 0, leaving: false };
    });
    art.residents.forEach(name => {
        const spot = freeSpot(cast[name].def.habitat);
        if (spot) settle(name, spot);
    });
    renderLabels();
}

function freeSpot(habitat) {
    const free = spots.filter(s => s.habitat === habitat && !s.animal);
    return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

// Put an animal straight onto a spot, no journey (residents at the start).
function settle(name, spot) {
    const a = cast[name];
    spot.animal = name;
    a.spot = spot;
    a.arrivedAt = Date.now();
    a.el.hidden = false;
    a.el.style.left = spot.x + '%';
    a.el.style.top = spot.y + '%';
}

// An animal comes into the scene, or calls if it's already here. If every spot
// for its habitat is taken, whoever has been there longest leaves first.
function arrive(name) {
    const a = cast[name];
    if (!a) return;
    if (a.spot && !a.leaving) { sing(name); return; }
    let spot = freeSpot(a.def.habitat);
    if (!spot) {
        const oldest = spots.filter(s => s.habitat === a.def.habitat && s.animal)
            .map(s => s.animal).sort((x, y) => cast[x].arrivedAt - cast[y].arrivedAt)[0];
        if (!oldest) return;
        spot = cast[oldest].spot;
        leave(oldest);
    }
    spot.animal = name;
    a.spot = spot;
    a.arrivedAt = Date.now();
    a.leaving = false;
    travel(a, spot, true, () => sing(name));
}

function leave(name) {
    const a = cast[name];
    if (!a.spot) return;
    a.spot.animal = null;
    a.spot = null;
    a.leaving = true;
    travel(a, null, false, () => { if (a.leaving) { a.el.hidden = true; a.leaving = false; } });
}

// Fly, walk or swim between the edge of the scene and a spot, facing the way it goes.
function travel(a, spot, coming, done) {
    const move = a.def.move || art.move;
    const el = a.el;
    const here = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
    const target = spot || { x: here.x > 50 ? 112 : -12, y: move === 'fly' ? 4 : here.y };
    if (coming) {
        const fromLeft = spot.x > 50;              // right-hand spots are reached from the left edge
        el.hidden = false;
        el.classList.remove('moving');
        el.style.left = (fromLeft ? -12 : 112) + '%';
        el.style.top  = (move === 'fly' ? 4 : spot.y) + '%';
        void el.offsetWidth;
    }
    const heading = target.x > parseFloat(el.style.left) ? 'r' : 'l';
    // Pictures face different ways: mirror only when travelling against the picture.
    el.classList.toggle('flip', a.def.face !== 'f' && a.def.face !== heading);
    el.classList.add('moving');
    el.style.left = target.x + '%';
    el.style.top  = target.y + '%';
    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        el.classList.remove('moving');
        done();
    };
    el.addEventListener('transitionend', function once(e) {
        if (e.propertyName !== 'left') return;
        el.removeEventListener('transitionend', once);
        finish();
    });
    setTimeout(finish, 3000 * sceneSettings.pace + 400);   // in case the transition never ends (reduced motion)
}

// An animal calls: its sound, a hop, and notes (or bubbles) rising.
function sing(name) {
    const a = cast[name];
    if (!a || a.el.hidden) return;
    if (calling) calling.pause();
    if (sceneSettings.animalVolume > 0) {
        calling = new Audio('sounds/' + a.sound + '.mp3');
        calling.volume = sceneSettings.animalVolume;
        calling.play().catch(() => {});
    }
    a.el.classList.remove('hop'); void a.el.offsetWidth; a.el.classList.add('hop');
    setTimeout(() => a.el.classList.remove('hop'), 750);
    const r = a.el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    for (let k = 0; k < 3; k++) {
        const n = document.createElement('span');
        if (art.fx === 'bubble') { n.className = 'bubble-fx'; n.style.width = n.style.height = (10 + k * 6) + 'px'; }
        else { n.className = 'note'; n.textContent = k % 2 ? '♫' : '♪'; }
        n.style.left = (r.left - s.left + r.width * (0.35 + k * 0.18)) + 'px';
        n.style.top  = (r.top - s.top + r.height * 0.1) + 'px';
        n.style.animationDelay = (k * 0.25) + 's';
        stage.appendChild(n);
        setTimeout(() => n.remove(), 2800 * sceneSettings.pace + 800);
    }
}

// "Anything happens": someone new arrives (preferring a free spot), or someone here calls.
function anything() {
    const away = Object.keys(cast).filter(n => !cast[n].spot);
    const fits = away.filter(n => spots.some(s => s.habitat === cast[n].def.habitat && !s.animal));
    const pool = fits.length ? fits : away;
    if (pool.length) { arrive(pool[Math.floor(Math.random() * pool.length)]); return; }
    const here = Object.keys(cast).filter(n => cast[n].spot);
    if (here.length) sing(here[Math.floor(Math.random() * here.length)]);
}

/* ── Switch jobs ── */
// A switch's job in this theme: saved in set-up, or by default the scene's
// switchCast in order (switch 1 the first animal, and so on), then "anything".
function jobFor(slot) {
    const saved = sceneSettings.jobs[sceneSettings.theme]?.[slot.id];
    if (saved) return saved;
    return art.switchCast[Switches.slots.indexOf(slot)] || 'anything';
}
function jobLabel(job) {
    return { anything: 'Anything', nothing: 'Nothing', daynight: 'Day / night' }[job] || job;
}
function doJob(job) {
    if (job === 'anything') anything();
    else if (job === 'daynight') { night = !night; applyLook(); }
    else if (job !== 'nothing') arrive(job);
}

function renderLabels() {
    const learned = Switches.slots.filter(s => s.binding);
    labels.hidden = !sceneSettings.labels || !learned.length;
    labels.innerHTML = learned.map(slot => {
        const tone = slot.colour === 'white' || slot.colour === 'yellow' ? 'light' : 'dark';
        return `<span class="chip"><i class="${tone}" style="background:${Switches.colourHex(slot.colour)}"></i>${jobLabel(jobFor(slot))}</span>`;
    }).join('');
}

/* ── Input ── */
function setupOpen() { return !document.getElementById('setup').hidden; }

Switches.onPress(slot => {
    if (!started || setupOpen()) return;
    doJob(jobFor(slot));
});
// Keys and buttons that aren't numbered switches: start the scene, or make anything happen.
Switches.onAnyPress(binding => {
    if (setupOpen()) return false;
    if (!started) {
        // A key press lets the browser play sound; a controller button doesn't, so that needs a tap.
        if (binding.type === 'key') { start(); return true; }
        return false;
    }
    if (Switches.slotOf(binding) >= 0) return false;       // a numbered switch: onPress does its job
    if (sceneSettings.others !== 'anything') return false;
    anything();
    return true;
});

stage.addEventListener('pointerdown', e => {
    if (!started) return;
    const s = stage.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = (e.clientX - s.left) + 'px';
    r.style.top  = (e.clientY - s.top) + 'px';
    stage.appendChild(r);
    setTimeout(() => r.remove(), 1900);
});

/* ── Start: the first tap or key press starts the sound and goes full screen ── */
function start() {
    if (started) return;
    started = true;
    document.getElementById('start').hidden = true;
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().catch(() => {});
    Ambient.start(art.ambient, sceneSettings.ambientVolume);
}
document.getElementById('start').addEventListener('click', start);

/* ── Set-up (the adult's screen, opened by holding ⚙) ── */
function openSetup() {
    document.getElementById('setup').hidden = false;
    if (typeof renderSetup === 'function') renderSetup();
}
function closeSetup() {
    Switches.cancelLearn();
    document.getElementById('setup').hidden = true;
    applyLook();
    renderLabels();
}
function leaveScenes() {
    Ambient.stop();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    location.href = 'index.html';
}
holdToOpen(document.getElementById('settings-btn'), document.getElementById('hold-hint'), openSetup);

document.getElementById('start-theme').textContent = themes[sceneSettings.theme].label;
buildScene();
