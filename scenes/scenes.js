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
    weather:       'clear',    // the scene's own weather ('clear' or a SceneWeather id): it starts with it and eases back to it
    weatherPress:  'build',    // weather switches: 'build' (each press stronger, eases off) | 'toggle' (on / off)
    weatherEase:   20,         // building up: seconds each step lasts once nobody presses or touches the sky
    animalVolume:  1,
    ambientVolume: 0.5,        // the background loop; 0 = off
    weatherVolume: 0.5,        // rain, wind and thunder; 0 = off
    jobs:          {},         // { theme: { switchId: animal name | a scene or weather job | 'nothing' } }
    preset:        '',         // the preset last used (see presets.js)
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
    const wx = liveWeather === 'clear' ? 'wx-clear' : `wx-${liveWeather} wx-s${strength}`;
    stage.className = `stage scene-${t} scene-${t}-${art.id} look-${liveLook || sceneSettings.look} ${wx}`;
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
// One weather at a time, at a strength of 1 to 3. Some of it is behind the animals
// (a darker sky, mist, rings on the water; a rainbow goes into the sky itself, behind
// the scenery) and some in front (raindrops, snowflakes, leaves, low mist). None of it
// catches touches, so the animals can always be touched. Weather fades in and out
// over the "Look changes" time; a change of strength fades over a few seconds.
// Thunder is a faint lightning bolt and a distant rumble: at most one every few
// seconds, however often it's asked for, so it can never become flashing.
//
// Weather switches either build up (each press is a step stronger, and left alone
// the weather eases back to the scene's own) or turn the weather on and off.
const BASE_STRENGTH = 2;    // the scene's own weather, and weather turned on with On / off
const WEATHER_JOBS = {
    ...Object.fromEntries(Object.entries(SceneWeather).map(([id, w]) => [id, { label: w.label, hint: w.hint }])),
    nextweather: { label: '🌦️ Next weather', hint: 'Fades to the next weather: clear, rain, rainbow, wind, fog, snow. (Storm only comes from its own job.)' },
    thunder:     { label: '⚡ Thunder',       hint: 'A faint flash of lightning, then thunder rumbles far away, whatever the weather.' },
};
const WEATHER_CYCLE = ['clear', 'rain', 'rainbow', 'wind', 'fog', 'snow'];
const weatherLoops = {};    // sound file → its looper
let weatherShown = [];      // the live weather's elements
let strength = BASE_STRENGTH;
let lastWeatherPress = 0;   // when a weather switch was last pressed, or the sky touched
let nextThunder = 0;
let lastThunder = 0;
let rumble = null;

function building() { return sceneSettings.weatherPress !== 'toggle'; }
function homeWeather() { return SceneWeather[sceneSettings.weather] ? sceneSettings.weather : 'clear'; }

function drawWeather(id) {
    const n = (count, make) => Array.from({ length: count }, (_, i) => make(i)).join('');
    // Everything has a level: level 2 and 3 things only show at that strength
    // (.lv2, .lv3 in scenes.css), so building up fades more in.
    const lv = (i, count) => i < count / 3 ? '' : i < count * 2 / 3 ? 'lv2' : 'lv3';
    // Each falling or blowing thing runs along a track the size of the scene, so
    // its motion is a transform (smooth, and cheap for the browser).
    const rain = count => `<div class="rain">${n(count, i =>
        `<i class="${lv(i, count)}" style="left:${rand(-5, 105).toFixed(1)}%;--d:${rand(0.7, 1.05).toFixed(2)}s;animation-delay:${rand(-2, 0).toFixed(2)}s"></i>`)}</div>`;
    const overcast = storm => `<div class="overcast"></div><div class="overcast deep${storm ? '' : ' lv3'}"></div>`;
    const splashes = () => ['', 'lv2', 'lv3'].map((level, k) => `<div class="fill ${level}">${(art.splashes || []).map(([x, y]) =>
        `<i class="splash" style="left:${(x + k * 2.2).toFixed(1)}%;top:${(y - k * 0.8).toFixed(1)}%;animation-delay:${rand(-2, 0).toFixed(2)}s"></i>`).join('')}</div>`).join('');
    // Snow falls at three depths: small, faint and slow far away; big and soft close up.
    // Half the nearest are six-armed crystals, turning slowly as they fall.
    const flake = i => {
        const depth = i % 3, crystal = i % 6 === 5;
        const [size, fall, sway] = [[rand(0.25, 0.4), rand(20, 26), 0.8], [rand(0.45, 0.7), rand(13, 17), 1.4], [rand(0.9, 1.3), rand(8, 11), 2.2]][depth];
        return `<i class="d${depth} ${lv(i, 132)}" style="left:${rand(-3, 103).toFixed(1)}%;--d:${fall.toFixed(1)}s;animation-delay:${rand(-fall, 0).toFixed(1)}s">` +
            `<b${crystal ? ' class="crystal"' : ''} style="--s:${(crystal ? rand(1.6, 2.4) : size).toFixed(2)}vw;--x:${sway}vw;--w:${rand(2.5, 4.5).toFixed(1)}s;--r:${rand(14, 24).toFixed(0)}s"></b></i>`;
    };
    const mist = ([top, h, d, level], i) =>
        `<div class="mist ${level}" style="top:${top}%;height:${h}%;--d:${d}s;animation-delay:${-d * (0.2 + i * 0.3)}s"></div>`;
    const parts = {
        rain:  [overcast(false) + splashes(), rain(135)],
        storm: [overcast(true) + splashes(), rain(135)],
        snow:  [overcast(false), `<div class="snow">${n(132, flake)}</div>`],
        wind:  ['', `<div class="leaves">${n(36, i =>
            `<i class="${lv(i, 36)}" style="top:${rand(8, 80).toFixed(1)}%;--d:${rand(6, 10).toFixed(1)}s;animation-delay:${rand(-10, 0).toFixed(1)}s"><b class="c${i % 3}" style="--w:${rand(2.5, 4).toFixed(1)}s"></b></i>`)}</div>`],
        fog:   [`<div class="haze"></div>${[[20, 26, 70, ''], [42, 30, 95, ''], [60, 34, 80, '']].map(mist).join('')}`,
                // Low mist in front of the animals, for depth: light, and it doesn't stop touches.
                `<div class="front-fog">${[[66, 26, 60, ''], [50, 24, 85, 'lv2'], [78, 24, 72, 'lv3']].map(mist).join('')}</div>`],
        rainbow: ['', ''],
    };
    const [back, front] = parts[id] || ['', ''];
    const shown = [];
    if (id === 'rainbow') {
        // Into the scene's drawing, just after the sun and moon, so clouds, hills and trees are in front.
        // At full strength a fainter second bow, colours the other way round, as in a real double rainbow.
        const bow = (r, width, order) => order.map((c, i) =>
            `<path class="rb${c}" style="stroke-width:${width}" d="M${800 - r + i * width} 740 A ${r - i * width} ${r - i * width} 0 0 1 ${800 + r - i * width} 740"/>`).join('');
        const svg = document.querySelector('#bg svg');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'wx rainbow');
        g.setAttribute('mask', 'url(#rainbow-fade)');
        g.innerHTML = `<defs><linearGradient id="rainbow-grad" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="700">
            <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
            <mask id="rainbow-fade"><rect width="1600" height="900" fill="url(#rainbow-grad)"/></mask></defs>
            <g class="bows">${bow(560, 17, [1, 2, 3, 4, 5, 6])}<g class="lv3 second">${bow(700, 12, [6, 5, 4, 3, 2, 1])}</g></g>`;
        svg.querySelector('.f-moon').parentNode.after(g);
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

// Rain and wind have sounds; they fade with the weather, under the background track,
// louder as the weather gets stronger.
function weatherSound() {
    const w = SceneWeather[liveWeather];
    const file = started && w && w.sound && sceneSettings.weatherVolume > 0 ? w.sound : null;
    const fade = Math.max(sceneSettings.fade, 2);
    Object.entries(weatherLoops).forEach(([f, loop]) => { if (f !== file) loop.fadeOut(fade); });
    const volume = sceneSettings.weatherVolume * [0, 0.55, 0.8, 1][strength];
    if (file) (weatherLoops[file] = weatherLoops[file] || makeLooper()).start(file, volume, fade);
}

function setWeather(id, level = BASE_STRENGTH) {
    const was = liveWeather;
    liveWeather = SceneWeather[id] ? id : 'clear';
    strength = level;
    // A new storm's first thunder comes once it has mostly faded in.
    if (liveWeather === 'storm' && was !== 'storm') nextThunder = Date.now() + Math.min(sceneSettings.fade, 8) * 1000 + 2000;
    if (liveWeather === was) { applyLook(); weatherSound(); }
    else showWeather(true);
}

// A weather switch pressed, or the sky touched while that weather is here.
function pressWeather(id) {
    lastWeatherPress = Date.now();
    if (!building()) { setWeather(liveWeather === id ? 'clear' : id); return; }
    if (liveWeather !== id) { setWeather(id, 1); return; }
    if (id === 'storm') thunder();
    if (strength < 3) setWeather(id, strength + 1);
}

// Building up: left alone, the weather eases back a step at a time to the scene's own.
setInterval(() => {
    if (!started || setupOpen() || !building()) return;
    if (Date.now() - lastWeatherPress < sceneSettings.weatherEase * 1000) return;
    const home = homeWeather();
    if (liveWeather === home && strength <= BASE_STRENGTH) return;
    lastWeatherPress = Date.now();
    if (liveWeather === home) setWeather(home, strength - 1);
    else if (liveWeather !== 'clear' && strength > 1) setWeather(liveWeather, strength - 1);
    else setWeather(home);
}, 1000);

// A faint bolt of lightning, then a rumble a moment later, as if far away.
function thunder() {
    if (Date.now() - lastThunder < 6000) return;
    lastThunder = Date.now();
    // Into the scene's drawing, just after the sun and moon, so hills and trees are in front.
    const svg = document.querySelector('#bg svg');
    let bolt = svg.querySelector('.bolt');
    if (!bolt) {
        bolt = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        bolt.setAttribute('class', 'bolt');
        svg.querySelector('.f-moon').parentNode.after(bolt);
    }
    const d = boltPath();
    bolt.innerHTML = `<path class="bolt-halo" d="${d}"/><path class="bolt-core" d="${d}"/>`;
    bolt.classList.remove('strike'); bolt.getBoundingClientRect(); bolt.classList.add('strike');
    setTimeout(() => {
        if (!(sceneSettings.weatherVolume > 0)) return;
        if (rumble) rumble.pause();
        rumble = new Audio(`sounds/weather/thunder-${1 + Math.floor(Math.random() * 3)}.mp3`);
        rumble.volume = sceneSettings.weatherVolume;
        rumble.play().catch(() => {});
    }, rand(900, 2400));
}
// A jagged line from high in the sky down behind the hills, with one short fork.
function boltPath() {
    const pt = (x, y) => ` ${x.toFixed(0)} ${y.toFixed(0)}`;
    let x = rand(350, 1250), y = rand(30, 90), d = 'M' + pt(x, y), fork = '';
    const end = rand(560, 640), side = Math.random() < 0.5 ? -1 : 1;
    for (let i = 0; y < end; i++) {
        x += rand(-50, 50); y += rand(35, 65);
        d += ' L' + pt(x, y);
        if (i === 2) {
            let fx = x, fy = y;
            fork = ' M' + pt(fx, fy);
            for (let k = 0; k < 3; k++) { fx += side * rand(25, 60); fy += rand(30, 50); fork += ' L' + pt(fx, fy); }
        }
    }
    return d + fork;
}
function rand(a, b) { return a + Math.random() * (b - a); }

// In a storm, thunder now and then: more often when it's stronger, never closer
// than 20 seconds apart on its own, and less often at the Slower speed.
setInterval(() => {
    if (!started || setupOpen() || liveWeather !== 'storm' || Date.now() < nextThunder) return;
    thunder();
    const [a, b] = [[35, 55], [35, 55], [25, 40], [20, 30]][strength];
    nextThunder = Date.now() + rand(a, b) * 1000 * Math.max(1, sceneSettings.pace);
}, 1000);

function doJob(job) {
    if (job === 'anything') anything();
    else if (SceneWeather[job]) pressWeather(job);
    else if (job === 'nextweather') {
        lastWeatherPress = Date.now();
        setWeather(WEATHER_CYCLE[(WEATHER_CYCLE.indexOf(liveWeather) + 1) % WEATHER_CYCLE.length], building() ? 1 : BASE_STRENGTH);
    }
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
    // Building up: touching the sky (not an animal) works like pressing the weather's switch.
    if (building() && liveWeather !== 'clear' && (e.clientY - s.top) / s.height < 0.5) pressWeather(liveWeather);
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
    lastWeatherPress = Date.now();
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
