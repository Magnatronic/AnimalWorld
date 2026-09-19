/* ── ANIMAL SCENES ── */
// A calm, full-screen animal scene for touch screens and switches. Touch an
// animal and it calls; touch anywhere for a ripple. Each numbered switch
// (shared/switches.js) has a job in each theme: bring in a particular animal,
// something random, change the look, or send animals away.

/* ── Settings (saved in this browser, like Animal Activities') ── */
const SCENES_KEY = 'animalScenes.settings';
const SCENE_DEFAULTS = {
    theme:         'birds',
    scenes:        {},         // the scene chosen for each theme, e.g. { birds: 'lake' }; the theme's first by default
    track:         'scene',    // background track: 'scene' (the scene's own) or a SceneTracks id
    look:          'soft',     // 'soft' | 'line' (matching outlines) | 'night' (night-light)
    pace:          1,          // 1.7 slower, 1 normal, 0.6 faster
    labels:        false,      // show each switch's colour and job on screen
    others:        'anything', // what keys and buttons that aren't numbered switches do: 'anything' (Random) | 'nothing'
    stay:          0,          // when animals leave: 0 never (unless a newcomer needs the spot), -1 when touched,
                               // or seconds after they were last touched or called
    fade:          5,          // seconds a change of look or weather takes
    weather:       'clear',    // the weather a scene starts with: 'clear' or a SceneWeather id
    animalVolume:  1,
    ambientVolume: 0.5,        // the background loop; 0 = off
    weatherVolume: 0.5,        // rain, wind and thunder; 0 = off
    jobs:          {},         // { theme: { switchId: animal name | a scene job (see SCENE_JOBS) | 'nothing' } }
};
const sceneSettings = loadSceneSettings();

// Animal Scenes always has at least five switches ready, so an adult only has to tap Learn.
const SCENE_SWITCHES_MIN = 5;
const LOOKS = ['soft', 'line', 'night'];

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

/* ── Background loops: two players crossfading, so the join is never heard ── */
// Used for the scene's track and for each weather sound. Fades take `seconds`.
function makeLooper() {
    const CROSSFADE = 3;              // seconds
    let players = [], active = 0, level = 0, timer = null, step = 0, url = null;

    // Set how fast volumes move, so a fade across `span` takes `seconds`.
    function ramp(seconds, span) { step = Math.max(span, 0.05) / (Math.max(seconds, 0.1) * 10); }
    function begin(i) {
        const p = players[i];
        active = i;
        p.currentTime = 0;
        p.target = level;
        p.play().catch(() => {});
    }
    function tick() {
        const cur = players[active];
        if (level && cur.duration && cur.currentTime >= cur.duration - CROSSFADE) {
            cur.target = 0;           // this play fades out as the next starts from the top
            ramp(CROSSFADE, level);
            begin(1 - active);
        }
        players.forEach(p => {
            const v = p.volume + Math.max(-step, Math.min(step, p.target - p.volume));
            p.volume = Math.max(0, Math.min(1, v));
            if (p.volume === 0 && p.target === 0 && !p.paused) p.pause();
        });
        if (!level && players.every(p => p.paused)) stop();
    }
    function start(file, volume, seconds = CROSSFADE) {
        if (file === url && players.length) { setLevel(volume, file, seconds); return; }
        stop();
        level = volume;
        if (!file || !level) return;
        url = file;
        players = [new Audio(file), new Audio(file)];
        players.forEach(p => { p.volume = 0; p.target = 0; });
        ramp(seconds, level);
        begin(0);
        timer = setInterval(tick, 100);
    }
    function stop() {
        clearInterval(timer);
        timer = null;
        players.forEach(p => p.pause());
        players = [];
        url = null;
    }
    function setLevel(volume, file, seconds = CROSSFADE) {
        if (!players.length) { start(file, volume, seconds); return; }
        ramp(seconds, Math.max(level, volume));
        level = volume;
        players[active].target = level;
        players[1 - active].target = 0;
    }
    // Fade to silence, then stop.
    function fadeOut(seconds = CROSSFADE) {
        if (!players.length) return;
        ramp(seconds, Math.max(...players.map(p => p.volume)));
        level = 0;
        players.forEach(p => { p.target = 0; });
    }
    return { start, stop, setLevel, fadeOut };
}
const Ambient = makeLooper();

/* ── The scene ── */
const stage  = document.getElementById('stage');
const layer  = document.getElementById('layer');
const labels = document.getElementById('labels');
let art = null;             // the theme's SceneArt merged with the chosen scene (see buildScene)
let cast = {};              // name → { el, def, sound, spot, arrivedAt, calledAt, leaving }
let spots = [];             // art.spots, each with .animal = name or null
let liveLook = null;        // the look on screen: set-up's choice, changed by the Day / night and Next look jobs
let liveWeather = SceneWeather[sceneSettings.weather] ? sceneSettings.weather : 'clear';   // changed by weather jobs
let started = false;
let calling = null;         // the animal sound playing now; one at a time

// Changing the class fades the scene to the new look and weather (see "look changes" in scenes.css).
function applyLook() {
    const t = sceneSettings.theme;
    stage.className = `stage scene-${t} scene-${t}-${art.id} look-${liveLook || sceneSettings.look} wx-${liveWeather}`;
    stage.style.setProperty('--pace', sceneSettings.pace);
    stage.style.setProperty('--fade', sceneSettings.fade + 's');
}

// The scenes a theme has, and the one chosen for it.
function sceneIds() { return Object.keys((SceneArt[sceneSettings.theme] || SceneArt.birds).scenes); }
function chosenScene() {
    const chosen = sceneSettings.scenes[sceneSettings.theme];
    return sceneIds().includes(chosen) ? chosen : sceneIds()[0];
}

function buildScene() {
    if (calling) { calling.pause(); calling = null; }
    // The theme's animals and switch jobs, with this scene's drawing, spots and track.
    const themeArt = SceneArt[sceneSettings.theme] || SceneArt.birds;
    const id = chosenScene();
    art = { ...themeArt, ...themeArt.scenes[id], id };
    const themeAnimals = themes[sceneSettings.theme].animals;
    liveLook = sceneSettings.look;
    // A new scene appears in its own colours at once, not fading from the last one's.
    stage.style.transitionDuration = '0s';
    applyLook();
    void stage.offsetWidth;
    stage.style.transitionDuration = '';
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
        el.addEventListener('pointerdown', e => { e.stopPropagation(); if (started) touched(name); });
        layer.appendChild(el);
        cast[name] = { el, def, sound: animal.sound, spot: null, arrivedAt: 0, calledAt: 0, leaving: false };
    });
    art.residents.forEach(name => {
        const spot = freeSpot(cast[name].def.habitat);
        if (spot) settle(name, spot);
    });
    showWeather(false);
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
    a.arrivedAt = a.calledAt = Date.now();
    a.el.hidden = false;
    a.el.style.left = spot.x + '%';
    a.el.style.top = spot.y + '%';
}

// An animal comes into the scene, or calls if it's already here. If every spot
// for its habitat is taken, whoever has been there longest leaves first.
function arrive(name) {
    const a = cast[name];
    if (!a) return;
    if (a.spot && !a.leaving) { touched(name); return; }
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
    a.arrivedAt = a.calledAt = Date.now();
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
    a.calledAt = Date.now();             // attention keeps an animal in the scene longer
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

// Random: someone new arrives (preferring a free spot), or someone here calls.
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

// Jobs that change the scene rather than bring in one animal. Set-up lists these
// with a line explaining each; labels on screen show the icon and name.
const SCENE_JOBS = {
    anything: { label: '🎲 Random',          hint: 'A random animal arrives, or one already here calls.' },
    daynight: { label: '🌗 Day / night',     hint: 'Fades between the chosen look and Night-light.' },
    nextlook: { label: '🎨 Next look',       hint: 'Fades to the next look: Soft flat, then Matching outlines, then Night-light.' },
    goodbye:  { label: '👋 Goodbye',         hint: 'The animal that has been here longest leaves.' },
    clear:    { label: '🌙 Everyone leaves', hint: 'All the animals leave. Other switches bring them back.' },
    nextscene:{ label: '🗺️ Next scene',      hint: 'Fades to the next scene for this theme.' },
};
function jobInfo(job) { return SCENE_JOBS[job] || WEATHER_JOBS[job]; }
function jobLabel(job) {
    return job === 'nothing' ? 'Nothing' : jobInfo(job) ? jobInfo(job).label : job;
}

// The background track playing: the scene's own, or the one chosen in set-up.
function trackUrl() {
    const id = sceneSettings.track === 'scene' ? art.track : sceneSettings.track;
    return (SceneTracks[id] || SceneTracks[art.track]).file;
}

// Change to another of this theme's scenes, fading through a soft veil; or at
// once (`now`) when set-up is covering the scene, so set-up answers straight away.
function changeScene(id, now) {
    sceneSettings.scenes[sceneSettings.theme] = id;
    saveSceneSettings();
    const veil = document.getElementById('veil');
    const trackBefore = trackUrl();
    const change = () => {
        buildScene();
        if (started && trackUrl() !== trackBefore) Ambient.start(trackUrl(), sceneSettings.ambientVolume);
        veil.classList.remove('on');
    };
    if (now) { change(); return; }
    veil.classList.add('on');
    setTimeout(change, 900);
}

// The animal that has been here longest leaves.
function goodbye() {
    const here = Object.keys(cast).filter(n => cast[n].spot && !cast[n].leaving);
    if (here.length) leave(here.sort((x, y) => cast[x].arrivedAt - cast[y].arrivedAt)[0]);
}
// Everyone leaves, one after another.
function everyoneLeaves() {
    Object.keys(cast).filter(n => cast[n].spot).forEach((n, i) => setTimeout(() => leave(n), i * 350));
}

/* ── Weather ── */
// One weather at a time. Some of it is behind the animals (a darker sky, mist, rings
// on the water; a rainbow goes into the sky itself, behind the scenery) and some in
// front (raindrops, snowflakes, leaves), so the animals stay clear. Each fades in and out over the "Look changes" time,
// and is only on the page while it shows. Thunder is a slow, soft glow in the sky
// and a distant rumble: never a sharp flash.
const WEATHER_JOBS = {
    ...Object.fromEntries(Object.entries(SceneWeather).map(([id, w]) => [id, { label: w.label, hint: w.hint }])),
    nextweather: { label: '🌦️ Next weather', hint: 'Fades to the next weather: clear, rain, rainbow, wind, fog, snow. (Storm only comes from its own job.)' },
    thunder:     { label: '⚡ Thunder',       hint: 'The sky glows softly and thunder rumbles far away, whatever the weather.' },
};
const WEATHER_CYCLE = ['clear', 'rain', 'rainbow', 'wind', 'fog', 'snow'];
const weatherLoops = {};    // sound file → its looper
let weatherShown = [];      // the live weather's elements
let nextThunder = 0;
let lastThunder = 0;
let rumble = null;

function drawWeather(id) {
    const n = (count, make) => Array.from({ length: count }, (_, i) => make(i)).join('');
    // Each falling or blowing thing runs along a track the size of the scene, so
    // its motion is a transform (smooth, and cheap for the browser).
    const rain = count => `<div class="rain">${n(count, () =>
        `<i style="left:${rand(-5, 105).toFixed(1)}%;--d:${rand(0.75, 1.1).toFixed(2)}s;animation-delay:${rand(-2, 0).toFixed(2)}s"></i>`)}</div>`;
    const overcast = deep => `<div class="overcast"></div>${deep ? '<div class="overcast deep"></div>' : ''}`;
    const splashes = () => (art.splashes || []).map(([x, y]) => [0, 1].map(k =>
        `<i class="splash" style="left:${(x + k * 2.5).toFixed(1)}%;top:${(y - k).toFixed(1)}%;animation-delay:${rand(-2, 0).toFixed(2)}s"></i>`).join('')).join('');
    const parts = {
        rain:  [overcast(false) + splashes(), rain(70)],
        storm: [overcast(true) + splashes(), rain(90)],
        snow:  [overcast(false), `<div class="snow">${n(70, () =>
            `<i style="left:${rand(-3, 103).toFixed(1)}%;--d:${rand(11, 19).toFixed(1)}s;animation-delay:${rand(-19, 0).toFixed(1)}s"><b style="--s:${rand(0.4, 0.95).toFixed(2)}vw;--w:${rand(2.5, 4.5).toFixed(1)}s"></b></i>`)}</div>`],
        wind:  ['', `<div class="leaves">${n(22, i =>
            `<i style="top:${rand(8, 80).toFixed(1)}%;--d:${rand(6, 10).toFixed(1)}s;animation-delay:${rand(-10, 0).toFixed(1)}s"><b class="c${i % 3}" style="--w:${rand(2.5, 4).toFixed(1)}s"></b></i>`)}</div>`],
        fog:   [`<div class="haze"></div>${[[20, 26, 70], [42, 30, 95], [60, 34, 80]].map(([top, h, d], i) =>
            `<div class="mist" style="top:${top}%;height:${h}%;--d:${d}s;animation-delay:${-d * (0.2 + i * 0.3)}s"></div>`).join('')}`, ''],
        rainbow: ['', ''],
    };
    const [back, front] = parts[id] || ['', ''];
    const shown = [];
    if (id === 'rainbow') {
        // Into the scene's drawing, just after the sun and moon, so clouds, hills and trees are in front.
        const svg = document.querySelector('#bg svg');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'wx rainbow');
        g.setAttribute('mask', 'url(#rainbow-fade)');
        g.innerHTML = `<defs><linearGradient id="rainbow-grad" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="700">
            <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
            <mask id="rainbow-fade"><rect width="1600" height="900" fill="url(#rainbow-grad)"/></mask></defs>` +
            n(6, i => `<path d="M${240 + i * 16} 740 A ${560 - i * 16} ${560 - i * 16} 0 0 1 ${1360 - i * 16} 740"/>`);
        const moon = svg.querySelector('.f-moon').parentNode;
        moon.after(g);
        shown.push(g);
    }
    [[back, 'wx-back'], [front, 'wx-front']].forEach(([html, where]) => {
        if (!html) return;
        const el = document.createElement('div');
        el.className = 'wx';
        el.innerHTML = html;
        document.getElementById(where).appendChild(el);
        shown.push(el);
    });
    return shown;
}

// Show the live weather: at once (a new scene), or fading from the last.
function showWeather(fade) {
    const ms = sceneSettings.fade * 1000;
    weatherShown.forEach(el => {
        if (!fade) { el.remove(); return; }
        el.classList.remove('on');
        setTimeout(() => el.remove(), ms + 500);
    });
    weatherShown = drawWeather(liveWeather);
    if (fade) void stage.offsetWidth;          // so the new weather fades in from nothing
    weatherShown.forEach(el => el.classList.add('on'));
    applyLook();
    weatherSound();
}

// Rain and wind have sounds; they fade with the weather, under the background track.
function weatherSound() {
    const w = SceneWeather[liveWeather];
    const file = started && w && w.sound && sceneSettings.weatherVolume > 0 ? w.sound : null;
    const fade = Math.max(sceneSettings.fade, 2);
    Object.entries(weatherLoops).forEach(([f, loop]) => { if (f !== file) loop.fadeOut(fade); });
    if (file) (weatherLoops[file] = weatherLoops[file] || makeLooper()).start(file, sceneSettings.weatherVolume, fade);
}

function setWeather(id) {
    liveWeather = SceneWeather[id] ? id : 'clear';
    // A new storm's first thunder comes once it has mostly faded in.
    if (liveWeather === 'storm') nextThunder = Date.now() + Math.min(sceneSettings.fade, 8) * 1000 + 2000;
    showWeather(true);
}

// A slow glow somewhere in the sky, then a rumble a moment later, as if far away.
// Never more than one glow every few seconds, however often a switch is pressed,
// so it can't build into flashing.
function thunder() {
    if (Date.now() - lastThunder < 6000) return;
    lastThunder = Date.now();
    const glow = document.getElementById('glow');
    glow.style.setProperty('--gx', rand(20, 80).toFixed(0) + '%');
    glow.classList.remove('strike'); void glow.offsetWidth; glow.classList.add('strike');
    setTimeout(() => {
        if (!(sceneSettings.weatherVolume > 0)) return;
        if (rumble) rumble.pause();
        rumble = new Audio(`sounds/weather/thunder-${1 + Math.floor(Math.random() * 3)}.mp3`);
        rumble.volume = sceneSettings.weatherVolume;
        rumble.play().catch(() => {});
    }, rand(900, 2400));
}
function rand(a, b) { return a + Math.random() * (b - a); }

// In a storm, thunder every 20 to 40 seconds (longer at the Slower speed, never shorter).
setInterval(() => {
    if (!started || setupOpen() || liveWeather !== 'storm' || Date.now() < nextThunder) return;
    thunder();
    nextThunder = Date.now() + rand(20, 40) * 1000 * Math.max(1, sceneSettings.pace);
}, 1000);

function doJob(job) {
    if (job === 'anything') anything();
    else if (SceneWeather[job]) setWeather(liveWeather === job ? 'clear' : job);
    else if (job === 'nextweather') setWeather(WEATHER_CYCLE[(WEATHER_CYCLE.indexOf(liveWeather) + 1) % WEATHER_CYCLE.length]);
    else if (job === 'thunder') thunder();
    else if (job === 'daynight') {
        const day = sceneSettings.look === 'night' ? 'soft' : sceneSettings.look;
        liveLook = liveLook === 'night' ? day : 'night';
        applyLook();
    } else if (job === 'nextlook') {
        liveLook = LOOKS[(LOOKS.indexOf(liveLook) + 1) % LOOKS.length];
        applyLook();
    } else if (job === 'nextscene') {
        const ids = sceneIds();
        changeScene(ids[(ids.indexOf(art.id) + 1) % ids.length]);
    } else if (job === 'goodbye') goodbye();
    else if (job === 'clear') everyoneLeaves();
    else if (job !== 'nothing') arrive(job);
}

// An animal touched on screen, or its own switch pressed while it's here: it calls,
// and with "Animals leave: When touched" it then goes.
function touched(name) {
    sing(name);
    if (sceneSettings.stay === -1) setTimeout(() => { if (cast[name].spot) leave(name); }, 1200);
}

// "Animals leave" after a time: an animal goes once it has been left alone that long.
// The clock only runs while the scene is playing, so it restarts when the scene
// starts and when set-up closes.
function restartStayClock() {
    Object.values(cast).forEach(a => { if (a.spot) a.calledAt = Date.now(); });
}
setInterval(() => {
    if (!started || setupOpen() || !(sceneSettings.stay > 0)) return;
    const limit = sceneSettings.stay * 1000;
    Object.keys(cast).forEach(n => {
        const a = cast[n];
        if (a.spot && !a.leaving && Date.now() - a.calledAt > limit) leave(n);
    });
}, 1000);

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
// Keys and buttons that aren't numbered switches: start the scene, or something random.
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
    restartStayClock();
    document.getElementById('start').hidden = true;
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().catch(() => {});
    Ambient.start(trackUrl(), sceneSettings.ambientVolume);
    weatherSound();
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
    restartStayClock();
    applyLook();
    renderLabels();
}
function leaveScenes() {
    Ambient.stop();
    Object.values(weatherLoops).forEach(loop => loop.stop());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    location.href = 'index.html';
}
holdToOpen(document.getElementById('settings-btn'), document.getElementById('hold-hint'), openSetup);

while (Switches.slots.length < SCENE_SWITCHES_MIN) Switches.add();
document.getElementById('start-theme').textContent = themes[sceneSettings.theme].label;
buildScene();
