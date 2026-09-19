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
    touchPlaces:   true,       // touching near an empty branch, ground or water brings an animal that lives there
    showPlaces:    'subtle',   // …and each empty place shows it: 'off' | 'subtle' (a nest, seeds, a lily pad) | 'clear' (with a glow and a twinkle)
    wander:        0,          // animals move to another place by themselves: 0 never, or about every this many seconds
    stay:          0,          // when animals leave: 0 never (unless a newcomer needs the spot), -1 when touched,
                               // or seconds after they were last touched or called
    fade:          5,          // seconds a change of look or weather takes
    weather:       'clear',    // the scene's own weather ('clear' or a SceneWeather id): it starts with it and eases back to it
    weatherPress:  'build',    // weather switches: 'build' (each press stronger, eases off) | 'toggle' (on / off)
    weatherEase:   20,         // building up: seconds each step lasts once nobody presses or touches the sky
    lightning:     true,       // storms show lightning bolts (false: thunder only)
    pressGap:      1,          // seconds after a press or touch does something before another can (1, 2 or 3),
                               // or -1: until what it started has finished
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
    tidySettings(s);
    return s;
}
// Values that are no longer offered move to the nearest that is (a wait under a second
// used to be allowed).
function tidySettings(s) {
    if (s.pressGap !== -1 && !(s.pressGap >= 1)) s.pressGap = 1;
    if (!SceneArt[s.theme] || !themes[s.theme]) s.theme = SCENE_DEFAULTS.theme;
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
let liveWeather = 'clear';  // changed by weather jobs; the scene's own at the start (buildScene)
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
    // A track or weather chosen for other animals doesn't carry over
    if (sceneSettings.track !== 'scene' && !themeTracks().includes(sceneSettings.track)) sceneSettings.track = 'scene';
    if (sceneSettings.weather !== 'clear' && !weatherFits(sceneSettings.weather)) sceneSettings.weather = 'clear';
    if (liveWeather !== 'clear' && !weatherFits(liveWeather)) { liveWeather = homeWeather(); strength = BASE_STRENGTH; }
    const themeAnimals = themes[sceneSettings.theme].animals;
    liveLook = sceneSettings.look;
    // A new scene appears in its own colours at once, not fading from the last one's.
    stage.style.transitionDuration = '0s';
    applyLook();
    void stage.offsetWidth;
    stage.style.transitionDuration = '';
    document.getElementById('bg').innerHTML = art.svg();
    layer.innerHTML = '';
    art.spots.forEach(s => { if (s.habitat === 'hide') cover(s); });
    spots = art.spots.map(s => ({ ...s, animal: null, mark: placeMark(s) }));
    cast = {};
    Object.entries(art.animals).forEach(([name, def]) => {
        const animal = themeAnimals.find(a => a.name === name);
        if (!animal) return;
        const el = document.createElement('div');
        el.className = `animal ${def.move || art.move} on-${def.habitat}${def.hang ? ' hang' : ''}`;
        el.style.width = def.w + '%';
        el.style.setProperty('--foot', (def.foot || 86) + '%');
        el.hidden = true;
        // Water birds sit in the water: a ring where they meet it, and the picture cut off below.
        el.innerHTML = (def.habitat === 'water' ? '<i class="wake"></i>' : '') +
            `<span class="body"><img alt="${name}" src="${imgSrc(animal)}"></span>`;
        el.querySelector('img').style.animationDelay = (-Math.random() * 3).toFixed(2) + 's';
        el.addEventListener('pointerdown', e => { e.stopPropagation(); if (started && accept('call')) touched(name); });
        layer.appendChild(el);
        cast[name] = { el, def, sound: animal.sound, spot: null, arrivedAt: 0, calledAt: 0, leaving: false };
    });
    art.residents.forEach(name => {
        const spot = freeSpot(cast[name].def.habitat);
        if (spot) settle(name, spot);
    });
    markPlaces();
    showWeather(false);
    renderLabels();
}

// Each empty place shows something that belongs there, so it's clear where touching
// brings an animal: a nest on a branch, seeds on the ground, a lily pad on the water
// (a theme can have its own: `marks` in art.js).
// "Clear" adds a warm glow and a twinkling star (scenes.css). Drawn 100 × 70 with the
// spot at (50, 62); colours come from the scene's palette.
const PLACE_ART = {
    perch: `<path class="p-trunk o" d="M17 50 Q19 67 50 67 Q81 67 83 50Z"/><ellipse class="p-trunk o" cx="50" cy="50" rx="33" ry="7"/>
        <ellipse class="p-hollow" cx="50" cy="50" rx="25" ry="4"/><path class="p-twig" d="M22 56 Q50 63 78 55 M27 62 Q50 67 73 61"/>`,
    ground: [[30, 60, 20], [39, 64, -30], [47, 58, 60], [55, 63, 10], [63, 59, -50], [70, 64, 30], [43, 67, 80], [59, 67, -10], [51, 61, 45]]
        .map(([x, y, turn], i) => `<ellipse class="${i % 3 ? 'p-seed' : 'p-seed2'} o" cx="${x}" cy="${y}" rx="4.2" ry="2.6" transform="rotate(${turn} ${x} ${y})"/>`).join(''),
    water: `<ellipse class="p-leaf o" cx="50" cy="61" rx="34" ry="9"/><path class="p-pond" d="M50 61 L85 58 L84 65Z"/>
        <path class="p-vein" d="M50 61 L24 57 M50 61 L30 67 M50 61 L64 69"/>
        <circle class="p-flower o" cx="36" cy="57" r="3.6"/><circle class="p-flower o" cx="42" cy="56" r="3.6"/><circle class="p-flower o" cx="39" cy="52" r="3.6"/>`,
};
function markArt(spot) {
    const own = art.marks || {};
    return own[spot.cover] || own[spot.habitat] || PLACE_ART[spot.habitat] || '';
}
function placeMark(spot) {
    const m = document.createElement('i');
    m.className = 'place';
    m.style.left = spot.x + '%';
    m.style.top = spot.y + '%';
    m.innerHTML = `<svg viewBox="0 0 100 70" aria-hidden="true"><path class="p-star" d="M50 4 L55 15 L66 18 L55 21 L50 32 L45 21 L34 18 L45 15Z"/>
        <g class="p-thing">${markArt(spot)}</g></svg>`;
    layer.appendChild(m);
    return m;
}
// A bush or log in front of a place where animals hide (see `covers` in art.js).
function cover(spot) {
    const c = document.createElement('i');
    c.className = 'cover';
    c.style.left = spot.x + '%';
    c.style.top = spot.y + '%';
    c.innerHTML = `<svg viewBox="0 0 200 100" aria-hidden="true">${art.covers[spot.cover || 'bush']}</svg>`;
    layer.appendChild(c);
}
// Nearer animals are in front; those hiding stay behind their bush (scenes.css).
function standAt(a, spot) {
    if (a.def.habitat !== 'hide') a.el.style.zIndex = 10 + Math.round(spot.y);
}

function markPlaces() {
    const style = sceneSettings.touchPlaces ? sceneSettings.showPlaces : 'off';
    layer.dataset.places = style;
    spots.forEach(s => s.mark.classList.toggle('free', style !== 'off' && !s.animal));
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
    a.el.classList.remove('down', 'behind', 'up');
    a.el.style.left = spot.x + '%';
    a.el.style.top = spot.y + '%';
    standAt(a, spot);
    markPlaces();
}

// An animal comes into the scene, or calls if it's already here. If every spot
// for its habitat is taken, whoever has been there longest leaves first.
function arrive(name, at) {
    const a = cast[name];
    if (!a) return;
    if (a.spot && !a.leaving) { touched(name); return; }
    let spot = at || freeSpot(a.def.habitat);
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

// Fly, walk, bound or swim between the edge of the scene and a spot, facing the way it goes.
function travel(a, spot, coming, done) {
    const move = a.def.move || art.move;
    const el = a.el;
    markPlaces();                                  // a place's glow fades as someone heads for it
    if (move === 'peek') { peek(a, spot, coming, done); return; }
    if (spot) standAt(a, spot);
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

// Peeping animals pop up from behind their bush or log, then come forward to sit in
// front of it (scenes.css: .behind, .down, .up). To leave, or to move to another bush,
// they go back up over it, behind it, and down out of sight.
function peek(a, spot, coming, done) {
    const el = a.el, ms = 800 * sceneSettings.pace;
    el.classList.add('moving');
    const finish = () => { el.classList.remove('moving'); done(); };
    const rise = () => {
        el.style.left = spot.x + '%';
        el.style.top = spot.y + '%';
        el.hidden = false;
        void el.offsetWidth;
        el.classList.remove('down');
        el.classList.add('up');                        // up from behind, clear of the top…
        setTimeout(() => {
            el.classList.remove('behind', 'up');       // …then forward, in front of it
            setTimeout(finish, ms);
        }, ms);
    };
    if (coming) { el.classList.add('behind', 'down'); rise(); return; }
    el.classList.add('up');
    setTimeout(() => {
        el.classList.add('behind', 'down');
        el.classList.remove('up');
        setTimeout(spot ? rise : finish, ms);
    }, ms);
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
    if (saved && (!WEATHER_JOBS[saved] || themeWeatherJobs().includes(saved))) return saved;
    return art.switchCast[Switches.slots.indexOf(slot)] || 'anything';
}

// Jobs that change the scene rather than bring in one animal. Set-up lists these
// with a line explaining each; labels on screen show the icon and name.
const SCENE_JOBS = {
    anything: { label: '🎲 Random',          hint: 'A random animal arrives, or one already here calls.' },
    daynight: { label: '🌗 Day / night',     hint: 'Fades between the chosen look and Night-light.' },
    nextlook: { label: '🎨 Next look',       hint: 'Fades to the next look: Soft flat, then Matching outlines, then Night-light.' },
    move:     { label: '🔀 Move about',      hint: 'An animal here moves to an empty place (or two swap places), and calls when it gets there. If nobody is here yet, someone arrives.' },
    goodbye:  { label: '👋 Goodbye',         hint: 'The animal that has been here longest leaves.' },
    clear:    { label: '🌙 Everyone leaves', hint: 'All the animals leave. Other switches bring them back.' },
    nextscene:{ label: '🗺️ Next scene',      hint: 'Fades to the next scene for this theme.' },
};
function jobInfo(job) { return SCENE_JOBS[job] || WEATHER_JOBS[job]; }
function jobLabel(job) {
    return job === 'nothing' ? 'Nothing' : jobInfo(job) ? jobInfo(job).label : job;
}

// The background tracks that belong to this theme: one for each of its scenes.
function themeTracks() { return [...new Set(Object.values(SceneArt[sceneSettings.theme].scenes).map(s => s.track))]; }
// The background track playing: the scene's own, or another of this theme's chosen in set-up.
function trackUrl() {
    const id = themeTracks().includes(sceneSettings.track) ? sceneSettings.track : art.track;
    return SceneTracks[id].file;
}

// Change to another theme's scenes (chosen on the start screen).
function changeTheme(id) {
    if (!SceneArt[id] || !themes[id] || id === sceneSettings.theme) return;
    const trackBefore = trackUrl();
    sceneSettings.theme = id;
    saveSceneSettings();
    buildScene();
    if (started && trackUrl() !== trackBefore) Ambient.start(trackUrl(), sceneSettings.ambientVolume);
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
// One weather at a time, at a strength of 1 to 5. Some of it is behind the animals
// (a darker sky, mist, rings on the water; a rainbow and lightning go into the sky
// itself, behind the scenery) and some in front (raindrops, snowflakes, leaves, low
// mist). None of it catches touches, so the animals can always be touched. Weather
// fades in and out over the "Look changes" time; a change of strength shows within
// a second or two.
//
// Each strength adds its own set of drops, flakes or leaves, faster than the last, so
// stronger weather is both heavier and quicker (a drop can't change speed mid-fall
// without jumping). Thunder is a lightning bolt and a distant rumble, more and closer
// together as a storm strengthens, within firm limits (see thunder()).
//
// Weather switches either build up (each press is a step stronger, and left alone
// the weather eases back to the scene's own) or turn the weather on and off.
const MAX_STRENGTH = 5;
const BASE_STRENGTH = 3;    // the scene's own weather, and weather turned on with On / off
const WEATHER_JOBS = {
    ...Object.fromEntries(Object.entries(SceneWeather).map(([id, w]) => [id, { label: w.label, hint: w.hint }])),
    nextweather: { label: '🌦️ Next weather', hint: "Fades to the next of this theme's weathers, starting from clear. (Storm only comes from its own job.)" },
    thunder:     { label: '⚡ Thunder',       hint: 'A faint flash of lightning, then thunder rumbles far away, whatever the weather.' },
};
const WEATHER_CYCLE = ['clear', 'rain', 'rainbow', 'wind', 'leaves', 'fog', 'snow'];
const weatherLoops = {};    // sound file → its looper
let weatherShown = [];      // the live weather's elements
let strength = BASE_STRENGTH;
let lastWeatherPress = 0;   // when a weather switch was last pressed, or the sky touched
let nextThunder = 0;
let lastThunder = 0;

function building() { return sceneSettings.weatherPress !== 'toggle'; }
// Each theme has the weathers that suit it (`weathers` in art.js): no snow in a jungle.
function themeWeathers() { return (SceneArt[sceneSettings.theme] || SceneArt.birds).weathers || Object.keys(SceneWeather); }
function weatherFits(id) { return themeWeathers().includes(id); }
// The weather jobs a switch can have in this theme (thunder only where there are storms).
function themeWeatherJobs() {
    return Object.keys(WEATHER_JOBS).filter(j => SceneWeather[j] ? weatherFits(j) : j !== 'thunder' || weatherFits('storm'));
}
function homeWeather() { return weatherFits(sceneSettings.weather) ? sceneSettings.weather : 'clear'; }

function drawWeather(id) {
    // For each strength 1…5, `count[level]` things made by `make(level)`. Things of
    // level 2 and up are marked lv2…lv5 and only show from that strength (scenes.css).
    const levels = (counts, make) => counts.map((count, k) => {
        const lv = k ? ` lv${k + 1}` : '';
        return Array.from({ length: count }, () => make(k + 1, lv)).join('');
    }).join('');
    const speed = level => 1 - (level - 1) * 0.15;           // level 5 moves two and a half times as fast as level 1
    // Each falling or blowing thing runs along a track the size of the scene, so
    // its motion is a transform (smooth, and cheap for the browser).
    const rain = () => `<div class="rain">${levels([20, 40, 70, 110, 160], (level, lv) => {
        const d = rand(1.1, 1.4) * speed(level);
        return `<i class="${lv}" style="left:${rand(-5, 105).toFixed(1)}%;--d:${d.toFixed(2)}s;--len:${4 + level * 2.5}%;animation-delay:${rand(-d, 0).toFixed(2)}s"></i>`;
    })}</div>`;
    // A downpour throws up a low spray of mist over the ground and water.
    const spray = () => '<div class="spray lv4"></div><div class="spray lv5"></div>';
    // The sky darkens at each step; a storm has a deeper, darker layer from the start and another from 3.
    const overcast = storm => `<div class="overcast"></div><div class="overcast deep${storm ? '' : ' lv4'}"></div>` +
        (storm ? '<div class="overcast deeper lv3"></div>' : '');
    const splashes = () => [0, 1, 2, 3, 4].map(k => `<div class="fill${k ? ' lv' + (k + 1) : ''}">${(art.splashes || []).map(([x, y]) =>
        `<i class="splash" style="left:${(x + (k % 2 ? 1 : -1) * k * 1.4).toFixed(1)}%;top:${(y - k * 0.5).toFixed(1)}%;animation-delay:${rand(-2, 0).toFixed(2)}s"></i>`).join('')}</div>`).join('');
    // Snow: six-armed crystals at three depths (small, faint and slow far away; big
    // close up), turning slowly and drifting from side to side as they fall.
    const snow = () => `<div class="snow">${levels([20, 45, 80, 120, 160], (level, lv) => {
        const depth = Math.floor(Math.random() * 3);
        const [size, fall, sway] = [[rand(0.7, 1), rand(20, 26), 0.8], [rand(0.95, 1.4), rand(13, 17), 1.4], [rand(1.6, 2.4), rand(8, 11), 2.2]][depth];
        const d = fall * speed(level);
        return `<i class="d${depth}${lv}" style="left:${rand(-3, 103).toFixed(1)}%;--d:${d.toFixed(1)}s;animation-delay:${rand(-d, 0).toFixed(1)}s">` +
            `<b style="--s:${size.toFixed(2)}vw;--x:${sway}vw;--w:${rand(2.5, 4.5).toFixed(1)}s;--r:${rand(12, 24).toFixed(0)}s"></b></i>`;
    })}</div>` +
        // A blizzard: snow blowing in white bands, and a white-out haze
        `<div class="blowing lv4">${[[55, 30, 14], [25, 26, 18], [75, 26, 11]].map(([top, h, d], i) =>
            `<div class="mist" style="top:${top}%;height:${h}%;--d:${d}s;animation-delay:${-d * i * 0.4}s"></div>`).join('')}</div>` +
        '<div class="whiteout lv4"></div><div class="whiteout lv5"></div>';
    // Autumn leaves drifting down, rocking and turning as they fall, like the snow.
    const fallingLeaves = () => `<div class="snow fall">${levels([10, 20, 32, 45, 60], (level, lv) => {
        const depth = Math.floor(Math.random() * 3);
        const [size, fall, sway] = [[rand(1, 1.3), rand(18, 22), 1.5], [rand(1.4, 1.9), rand(12, 15), 2.2], [rand(2.1, 2.8), rand(8, 10), 3]][depth];
        const d = fall * speed(level);
        return `<i class="d${depth}${lv}" style="left:${rand(-3, 103).toFixed(1)}%;--d:${d.toFixed(1)}s;animation-delay:${rand(-d, 0).toFixed(1)}s">` +
            `<b class="c${Math.floor(Math.random() * 4)}" style="--s:${size.toFixed(2)}vw;--x:${sway}vw;--w:${rand(2.5, 4).toFixed(1)}s;--r:${rand(6, 12).toFixed(0)}s"></b></i>`;
    })}</div>`;
    const leaves = () => `<div class="leaves">${levels([8, 16, 28, 45, 70], (level, lv) => {
        const d = rand(9, 12) * speed(level);
        return `<i class="${lv}" style="top:${rand(8, 80).toFixed(1)}%;--d:${d.toFixed(1)}s;animation-delay:${rand(-d, 0).toFixed(1)}s">` +
            `<b class="c${Math.floor(Math.random() * 3)}" style="--w:${(rand(2.5, 4) * speed(level)).toFixed(1)}s"></b></i>`;
    })}</div>`;
    // Strong wind: white streaks whipping across, more and quicker each level from 3.
    const gusts = () => `<div class="gusts">${levels([0, 3, 8, 14, 22], (level, lv) => {
        const d = rand(2.2, 3) * speed(level);
        return `<i class="${lv}" style="top:${rand(10, 75).toFixed(1)}%;--d:${d.toFixed(2)}s;animation-delay:${rand(-d * 2, 0).toFixed(2)}s"><b></b></i>`;
    })}</div>`;
    const mist = ([top, h, d, lv], i) =>
        `<div class="mist${lv ? ' ' + lv : ''}" style="top:${top}%;height:${h}%;--d:${d}s;animation-delay:${-d * (0.2 + i * 0.3)}s"></div>`;
    const parts = {
        rain:  [overcast(false) + splashes() + spray(), rain()],
        storm: [overcast(true) + splashes() + spray(), rain()],
        snow:  [overcast(false), snow()],
        wind:  ['', leaves() + gusts()],
        fog:   [`<div class="haze"></div><div class="haze high lv3"></div>${[[42, 30, 95, ''], [20, 26, 70, 'lv2'], [60, 34, 80, 'lv3'], [8, 30, 60, 'lv4']].map(mist).join('')}`,
                // Mist in front of the animals, for depth, thickening to a near white-out at 5.
                // It doesn't stop touches.
                `<div class="front-fog">${[[66, 26, 60, 'lv2'], [50, 24, 85, 'lv3'], [78, 24, 72, 'lv4'], [36, 30, 90, 'lv5'], [58, 30, 50, 'lv5']].map(mist).join('')}` +
                `<div class="haze high lv4"></div><div class="haze high lv5"></div></div>`],
        rainbow: ['', ''],
        leaves: ['', fallingLeaves()],
    };
    const [back, front] = parts[id] || ['', ''];
    const shown = [];
    if (id === 'rainbow') {
        // Into the scene's drawing, just after the sun and moon, so clouds, hills and trees are in front.
        // Stronger, a fainter second bow, colours the other way round, as in a real double rainbow.
        const bow = (r, width, order) => order.map((c, i) =>
            `<path class="rb${c}" style="stroke-width:${width}" d="M${800 - r + i * width} 740 A ${r - i * width} ${r - i * width} 0 0 1 ${800 + r - i * width} 740"/>`).join('');
        const svg = document.querySelector('#bg svg');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `wx rainbow st${strength}`);
        g.setAttribute('mask', 'url(#rainbow-fade)');
        g.innerHTML = `<defs><linearGradient id="rainbow-grad" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="700">
            <stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
            <mask id="rainbow-fade"><rect width="1600" height="900" fill="url(#rainbow-grad)"/></mask></defs>
            <path class="halo lv5" d="M190 740 A 610 610 0 0 1 1410 740"/>
            <g class="bows">${bow(560, 17, [1, 2, 3, 4, 5, 6])}<g class="lv4 second">${bow(700, 12, [6, 5, 4, 3, 2, 1])}</g></g>
            ${[[3, 8], [4, 12], [5, 20]].map(([level, count]) => `<g class="lv${level}">${Array.from({ length: count }, () => {
                // Gentle sparkles along the bow, twinkling slowly (never flashing)
                const angle = rand(0.12, 0.88) * Math.PI, r = rand(450, 720);
                return `<path class="sparkle" style="animation-delay:${rand(-4, 0).toFixed(1)}s" transform="translate(${(800 - r * Math.cos(angle)).toFixed(0)} ${(740 - r * Math.sin(angle)).toFixed(0)})"
                    d="M0 -14 Q2 -2 14 0 Q2 2 0 14 Q-2 2 -14 0 Q-2 -2 0 -14Z"/>`;
            }).join('')}</g>`).join('')}`;
        svg.querySelector('.f-moon').parentNode.after(g);
        shown.push(g);
    }
    [[back, 'wx-back'], [front, 'wx-front']].forEach(([html, where]) => {
        if (!html) return;
        const el = document.createElement('div');
        el.className = `wx st${strength}`;
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
    applyLook();                               // first, so the new weather is drawn at its own strength
    weatherShown = drawWeather(liveWeather);
    if (fade) void stage.offsetWidth;          // so the new weather fades in from nothing
    weatherShown.forEach(el => el.classList.add('on'));
    weatherSound();
}

// Rain and wind have sounds; they fade with the weather, under the background track,
// louder as the weather gets stronger (quickly, so a press is heard as well as seen).
function weatherSound(seconds = Math.max(sceneSettings.fade, 2)) {
    const w = SceneWeather[liveWeather];
    const file = started && w && w.sound && sceneSettings.weatherVolume > 0 ? w.sound : null;
    Object.entries(weatherLoops).forEach(([f, loop]) => { if (f !== file) loop.fadeOut(seconds); });
    const volume = sceneSettings.weatherVolume * [0, 0.4, 0.55, 0.7, 0.85, 1][strength];
    if (file) (weatherLoops[file] = weatherLoops[file] || makeLooper()).start(file, volume, seconds);
}

function setWeather(id, level = BASE_STRENGTH) {
    const was = liveWeather;
    liveWeather = SceneWeather[id] ? id : 'clear';
    strength = Math.max(1, Math.min(MAX_STRENGTH, level));
    // A new storm's first thunder comes once it has mostly faded in.
    if (liveWeather === 'storm' && was !== 'storm') nextThunder = Date.now() + Math.min(sceneSettings.fade, 8) * 1000 + 2000;
    if (liveWeather === was) {
        weatherShown.forEach(el => { el.classList.remove('st1', 'st2', 'st3', 'st4', 'st5'); el.classList.add('st' + strength); });
        applyLook();
        weatherSound(1.5);
    } else showWeather(true);
}

// A weather switch pressed, or the sky touched while that weather is here.
function pressWeather(id) {
    lastWeatherPress = Date.now();
    if (!building()) { setWeather(liveWeather === id ? 'clear' : id); return; }
    if (liveWeather !== id) { setWeather(id, 1); return; }
    if (strength < MAX_STRENGTH) setWeather(id, strength + 1);
    if (id === 'storm') thunder();
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

// Thunder: a bolt of lightning, then a rumble a moment later, as if far away. The
// stronger the storm, the thicker and brighter the bolt, the louder the rumble and
// the sooner the next; in a strong storm a second bolt sometimes follows. Limits for
// photosensitive students: never two bolts within BOLT_GAP (so at most about one a
// second), each fades in over a quarter of a second, and none flickers.
const BOLT_GAP = 800;
let rumbles = [];
function thunder() {
    const level = liveWeather === 'storm' ? strength : BASE_STRENGTH;
    const wait = [0, 6, 6, 4, 2.5, 1.5][level] * 1000;          // between thunders asked for by switches
    if (Date.now() - lastThunder < wait) return;
    strike(level);
    if (level >= 4 && Math.random() < (level === 5 ? 0.5 : 0.3)) setTimeout(() => strike(level), rand(1000, 1500));
}
function strike(level) {
    if (Date.now() - lastThunder < BOLT_GAP) return;
    lastThunder = Date.now();
    if (sceneSettings.lightning) {
        // In front of the darkened sky (so a stronger storm doesn't hide it) but behind the
        // animals; its lower end fades away towards the horizon (see .bolt in scenes.css).
        const bolt = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        bolt.setAttribute('class', 'bolt strike');
        bolt.setAttribute('viewBox', '0 0 1600 900');
        bolt.setAttribute('preserveAspectRatio', 'none');
        const d = boltPath(level >= 4 ? 2 : 1);
        bolt.innerHTML = `<path class="bolt-halo" style="stroke-width:${10 + level * 4}" d="${d}"/>` +
                         `<path class="bolt-core" style="stroke-width:${(2 + level * 0.9).toFixed(1)}" d="${d}"/>`;
        bolt.style.setProperty('--peak', (0.5 + level * 0.1).toFixed(2));
        document.getElementById('wx-back').appendChild(bolt);
        setTimeout(() => bolt.remove(), 2200);
    }
    setTimeout(() => {
        if (!(sceneSettings.weatherVolume > 0)) return;
        // Up to two rumbles at once, so a strong storm rolls on
        rumbles = rumbles.filter(r => !r.paused && !r.ended);
        if (rumbles.length >= 2) rumbles.shift().pause();
        const r = new Audio(`sounds/weather/thunder-${1 + Math.floor(Math.random() * 3)}.mp3`);
        r.volume = Math.min(1, sceneSettings.weatherVolume * (0.5 + level * 0.1));
        r.play().catch(() => {});
        rumbles.push(r);
    }, rand(700, 2000) / (level >= 4 ? 1.5 : 1));
}
// A jagged line from high in the sky down behind the hills, with one or two short forks.
function boltPath(forks) {
    const pt = (x, y) => ` ${x.toFixed(0)} ${y.toFixed(0)}`;
    let x = rand(300, 1300), y = rand(30, 90), d = 'M' + pt(x, y), branches = '';
    const end = rand(560, 640);
    for (let i = 0; y < end; i++) {
        x += rand(-50, 50); y += rand(35, 65);
        d += ' L' + pt(x, y);
        if (i === 2 || (forks > 1 && i === 5)) {
            const side = Math.random() < 0.5 ? -1 : 1;
            let fx = x, fy = y;
            branches += ' M' + pt(fx, fy);
            for (let k = 0; k < 3; k++) { fx += side * rand(25, 60); fy += rand(30, 50); branches += ' L' + pt(fx, fy); }
        }
    }
    return d + branches;
}
function rand(a, b) { return a + Math.random() * (b - a); }

// In a storm, thunder by itself now and then: every half a minute or so when it's
// light, every few seconds at full strength (a little less often at the Slower speed).
setInterval(() => {
    if (!started || setupOpen() || liveWeather !== 'storm' || Date.now() < nextThunder) return;
    thunder();
    const [a, b] = [null, [30, 45], [18, 28], [10, 16], [5, 9], [2.5, 5]][strength];
    nextThunder = Date.now() + rand(a, b) * 1000 * Math.max(1, sceneSettings.pace);
}, 500);

// ── A calm pace, however fast the presses come ──
// After a switch press or a touch does something, others wait: `pressGap` seconds,
// or with "When finished" until what it started has finished (a bird has landed, a
// look or weather has faded in). So a flurry of presses doesn't set everything off at
// once. Big changes (a scene, a look, a different weather, everyone leaving) also
// wait for the last big change to finish. Ripples always show, so a touch is seen.
// `job` is a switch job, or 'call' (an animal touched), 'place' (an empty place
// touched) or 'sky' (open sky touched, building the weather).
let quietUntil = 0, bigQuietUntil = 0;
function accept(job) {
    const now = Date.now(), big = isBig(job);
    if (now < quietUntil || (big && now < bigQuietUntil)) return false;
    const takes = takesMs(job);
    quietUntil = now + (sceneSettings.pressGap === -1 ? takes : sceneSettings.pressGap * 1000);
    if (big) bigQuietUntil = now + (sceneSettings.pressGap === -1 ? takes : Math.max(2, Math.min(sceneSettings.fade, 5)) * 1000);
    return true;
}
const BIG_JOBS = ['daynight', 'nextlook', 'nextscene', 'clear', 'nextweather'];
// Making the same weather stronger is small; changing the weather is big.
function isBig(job) {
    return BIG_JOBS.includes(job) || (!!SceneWeather[job] && (liveWeather !== job || !building()));
}
// Roughly how long a job takes to play out, for "When finished".
function takesMs(job) {
    const journey = 3000 * sceneSettings.pace + 1000;        // fly, walk or swim in, then call
    const fade = sceneSettings.fade * 1000;
    if (job === 'call') return 1500;
    if (job === 'place' || job === 'anything' || job === 'move') return journey;
    if (job === 'sky') return 1500;
    if (SceneWeather[job]) return isBig(job) ? fade : 1500;
    if (job === 'daynight' || job === 'nextlook' || job === 'nextweather') return fade;
    if (job === 'nextscene') return 2000;
    if (job === 'thunder') return 2500;
    if (job === 'goodbye') return journey;
    if (job === 'clear') return journey + 350 * Object.values(cast).filter(a => a.spot).length;
    if (job === 'nothing') return 0;
    return cast[job] && cast[job].spot && !cast[job].leaving ? 1500 : journey;   // an animal: calls, or comes in
}

function doJob(job) {
    if (WEATHER_JOBS[job] && !themeWeatherJobs().includes(job)) return;    // a weather this theme doesn't have
    if (job === 'anything') anything();
    else if (job === 'move') { if (!moveAbout()) anything(); }
    else if (SceneWeather[job]) pressWeather(job);
    else if (job === 'nextweather') {
        lastWeatherPress = Date.now();
        const cycle = WEATHER_CYCLE.filter(w => w === 'clear' || weatherFits(w));
        setWeather(cycle[(cycle.indexOf(liveWeather) + 1) % cycle.length], building() ? 1 : BASE_STRENGTH);
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
    const job = jobFor(slot);
    if (accept(job)) doJob(job);
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
    if (accept('anything')) anything();
    return true;
});

// Touching the scene near an empty place (a branch, the ground, the water) brings an
// animal that lives there to that very spot. If all of them are here already, the one
// that has been here longest moves over to it. Returns whether a place was touched.
const TOUCH_REACH = 9;      // how near a place a touch must be, in % of the scene's width
function placeNear(x, y) {
    const near = spots.filter(p => !p.animal)
        .map(p => ({ p, d: Math.hypot(p.x - x, (p.y - y) * 9 / 16) }))
        .filter(o => o.d < TOUCH_REACH)
        .sort((m, n) => m.d - n.d)[0];
    return near ? near.p : null;
}
function touchPlace(spot) {
    const lives = Object.keys(cast).filter(n => cast[n].def.habitat === spot.habitat);
    const away = lives.filter(n => !cast[n].spot);
    if (away.length) { arrive(away[Math.floor(Math.random() * away.length)], spot); return true; }
    const longest = lives.filter(n => !cast[n].leaving).sort((m, n) => cast[m].arrivedAt - cast[n].arrivedAt)[0];
    if (longest) moveTo(longest, spot);
    return !!longest;
}
// An animal already here goes to another spot, and calls when it gets there (unless
// it's moving by itself: then quietly, and it isn't counted as having been called).
function moveTo(name, spot, quiet = false) {
    const a = cast[name];
    if (a.spot && a.spot.animal === name) a.spot.animal = null;
    spot.animal = name;
    a.spot = spot;
    if (!quiet) a.arrivedAt = a.calledAt = Date.now();
    travel(a, spot, false, () => { if (!quiet) sing(name); });
}

// Someone here moves: to an empty place where it lives if there is one, or else two
// that live in the same place swap. Returns whether anyone moved.
function moveAbout(quiet = false) {
    const settled = Object.keys(cast).filter(n => cast[n].spot && !cast[n].leaving && !cast[n].el.classList.contains('moving'));
    const pick = list => list[Math.floor(Math.random() * list.length)];
    const moves = [];
    settled.forEach(n => spots.filter(s => s.habitat === cast[n].def.habitat && !s.animal).forEach(s => moves.push([n, s])));
    if (moves.length) { const [n, s] = pick(moves); moveTo(n, s, quiet); return true; }
    const pairs = [];
    settled.forEach((m, i) => settled.slice(i + 1).forEach(n => { if (cast[m].def.habitat === cast[n].def.habitat) pairs.push([m, n]); }));
    if (!pairs.length) return false;
    const [m, n] = pick(pairs), ms = cast[m].spot, ns = cast[n].spot;
    moveTo(m, ns, quiet);
    moveTo(n, ms, true);                 // only one of the two calls
    return true;
}
// "Animals move about by themselves": now and then, while nobody is in set-up.
let nextWander = 0;
setInterval(() => {
    const every = sceneSettings.wander * 1000;
    if (!started || setupOpen() || !every) { nextWander = 0; return; }
    if (!nextWander) nextWander = Date.now() + every * (0.7 + Math.random() * 0.6);
    if (Date.now() < nextWander) return;
    moveAbout(true);
    nextWander = Date.now() + every * (0.7 + Math.random() * 0.6);
}, 1000);

stage.addEventListener('pointerdown', e => {
    if (!started) return;
    const s = stage.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = (e.clientX - s.left) + 'px';
    r.style.top  = (e.clientY - s.top) + 'px';
    stage.appendChild(r);
    setTimeout(() => r.remove(), 1900);
    const x = (e.clientX - s.left) / s.width * 100, y = (e.clientY - s.top) / s.height * 100;
    const spot = sceneSettings.touchPlaces && placeNear(x, y);
    if (spot) { if (accept('place')) touchPlace(spot); return; }
    // Building up: touching the sky (not an animal or a place) works like pressing the weather's switch.
    if (building() && liveWeather !== 'clear' && y < 50 && accept('sky')) pressWeather(liveWeather);
});

/* ── Start: choose the animals, and that tap starts the sound and goes full screen ── */
// Each theme with scenes has a big button, like Animal Activities' theme picker; the one
// used last time is marked, and a switch or key press starts it. A preset's link skips
// the choice: the start screen just says the preset's name (showTapToStart).
function showChooser() {
    document.getElementById('start-themes').innerHTML = Object.keys(SceneArt).filter(id => themes[id]).map(id => {
        const [icon, ...words] = themes[id].label.split(' ');
        const count = Object.keys(SceneArt[id].scenes).length;
        return `<button class="theme-btn btn-${id}" data-theme="${id}"><span class="btn-icon">${icon}</span>
            <span class="btn-label">${words.join(' ')}<span class="front-sub">${count} scenes${id === sceneSettings.theme ? ' · used last time' : ''}</span></span>
            <span class="btn-arrow">▶</span></button>`;
    }).join('');
    const box = document.getElementById('start');
    box.classList.add('choosing');
    document.getElementById('start-choose').hidden = false;
    document.getElementById('start-go').hidden = true;
    box.hidden = false;
}
function showTapToStart(text) {
    document.getElementById('start').classList.remove('choosing');
    document.getElementById('start-choose').hidden = true;
    document.getElementById('start-go').hidden = false;
    document.getElementById('start-theme').textContent = text;
}
function start() {
    if (started) return;
    started = true;
    restartStayClock();
    document.getElementById('start').hidden = true;
    document.getElementById('back-corner').hidden = false;
    const root = document.documentElement;
    if (root.requestFullscreen && !document.fullscreenElement) root.requestFullscreen().catch(() => {});
    Ambient.start(trackUrl(), sceneSettings.ambientVolume);
    weatherSound();
}
document.getElementById('start').addEventListener('click', e => {
    if (e.target.closest('.start-back')) return;
    const pick = e.target.closest('[data-theme]');
    if (pick) { changeTheme(pick.dataset.theme); start(); }
    else if (!document.getElementById('start').classList.contains('choosing')) start();
});
// From set-up, or holding ← in the corner: back to the start screen to choose other
// animals (the scene goes quiet meanwhile).
function chooseAnimals() {
    closeSetup();
    started = false;
    document.getElementById('back-corner').hidden = true;
    Ambient.stop();
    Object.values(weatherLoops).forEach(loop => loop.stop());
    if (calling) { calling.pause(); calling = null; }
    showChooser();
}

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
holdToOpen(document.getElementById('back-btn'), document.getElementById('back-hint'), chooseAnimals);

while (Switches.slots.length < SCENE_SWITCHES_MIN) Switches.add();
liveWeather = homeWeather();
buildScene();
showChooser();
