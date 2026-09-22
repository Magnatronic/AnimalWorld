/* ── PRESETS ── */
// A preset is a saved set-up: theme, scene, look, speed, how animals leave, weather,
// and each switch's job. Jobs are kept by switch number (switch 1, switch 2…), so a
// preset works with whichever switches are learned on this computer. Sound levels,
// switch labels and the switches themselves stay as they are on the computer.
//
// The ready-made presets are there the first time; like any preset they can be
// changed or deleted, and set-up can bring back any that were deleted. Their jobs
// suit the room's switches (see switches.js): the five-switch box red, yellow, green,
// blue, white, then the single white switch, which brings a random animal. Each theme's
// Weather play matches weather to colour where it can (red storm, yellow rainbow or the
// theme's bright weather, green wind, blue rain, white snow or fog), with Day / night on
// the single switch. `since`: the version of the list a ready-made preset arrived in.
// A preset can be opened directly: scenes.html#preset=<id>.
const PRESETS_KEY = 'animalScenes.presets';
const PRESETS_VERSION_KEY = 'animalScenes.presetsVersion';
const PRESETS_VERSION = 2;
const PRESET_KEYS = ['theme', 'look', 'pace', 'touchPlaces', 'showPlaces', 'wander', 'stay', 'fade', 'weather', 'weatherPress', 'weatherEase', 'lightning', 'others', 'pressGap', 'track'];
const READY_PRESETS = [
    { id: 'calm-garden',  name: '🌳 Calm garden',  theme: 'birds', scene: 'garden',   look: 'soft',  pace: 1.7,
      jobs: ['Sparrow', 'Pigeon', 'Duck', 'Hen', 'anything', 'anything'] },
    { id: 'weather-play', name: '🌦️ Weather play', theme: 'birds', scene: 'lake',     look: 'soft',
      jobs: ['storm', 'rainbow', 'wind', 'rain', 'snow', 'daynight'] },
    { id: 'night-owls',   name: '🦉 Night owls',   theme: 'birds', scene: 'woodland', look: 'night', pace: 1.7,
      jobs: ['Owl', 'Crow', 'Eagle', 'daynight', 'anything', 'anything'] },
    { id: 'busy-lake',    name: '🏞️ Busy lake',    theme: 'birds', scene: 'lake',     look: 'soft',  stay: 30,
      jobs: ['Duck', 'Swan', 'Goose', 'Flamingo', 'anything', 'anything'] },
    { id: 'peekaboo',     name: '🦊 Peek-a-boo',       theme: 'forest', scene: 'woodland', look: 'soft',
      jobs: ['Fox', 'Bear', 'Wolf', 'Owl', 'anything', 'anything'] },
    { id: 'riverbank',    name: '🦫 Riverbank',        theme: 'forest', scene: 'river',    look: 'soft',
      jobs: ['Beaver', 'Otter', 'Frog', 'Deer', 'anything', 'anything'] },
    { id: 'forest-night', name: '🦇 Forest at night',  theme: 'forest', scene: 'clearing', look: 'night', pace: 1.7,
      jobs: ['Owl', 'Bat', 'Hedgehog', 'Badger', 'anything', 'anything'] },
    { id: 'forest-weather', name: '🌦️ Weather play', theme: 'forest', scene: 'clearing', look: 'soft', since: 2,
      jobs: ['storm', 'rainbow', 'leaves', 'rain', 'snow', 'daynight'] },
    { id: 'farmyard',     name: '🚜 Busy farmyard',    theme: 'farm',   scene: 'farmyard', look: 'soft',
      jobs: ['Cow', 'Pig', 'Hen', 'Rooster', 'anything', 'anything'] },
    { id: 'in-the-fields', name: '🌾 In the fields',   theme: 'farm',   scene: 'fields',   look: 'soft',  pace: 1.7,
      jobs: ['Sheep', 'Horse', 'Cow', 'Goat', 'anything', 'anything'] },
    { id: 'rainy-pond',   name: '🦆 Rainy duck pond',  theme: 'farm',   scene: 'pond',     look: 'soft',  weather: 'rain',
      jobs: ['Duck', 'Goose', 'rain', 'Dog', 'anything', 'anything'] },
    { id: 'farm-weather', name: '🌦️ Weather play', theme: 'farm',   scene: 'fields',   look: 'soft', since: 2,
      jobs: ['storm', 'rainbow', 'wind', 'rain', 'snow', 'daynight'] },
    { id: 'savanna-day',  name: '🦒 Savanna day',       theme: 'safari', scene: 'savanna',  look: 'soft',
      jobs: ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'anything', 'anything'] },
    { id: 'rainy-jungle', name: '🌴 Rainy jungle',      theme: 'safari', scene: 'jungle',   look: 'soft',  weather: 'rain',
      jobs: ['Gorilla', 'Monkey', 'rain', 'Chameleon', 'anything', 'anything'] },
    { id: 'waterhole-night', name: '💧 Waterhole at night', theme: 'safari', scene: 'waterhole', look: 'night', pace: 1.7,
      jobs: ['Hippo', 'Elephant', 'Crocodile', 'Flamingo', 'anything', 'anything'] },
    { id: 'safari-weather', name: '🌦️ Weather play', theme: 'safari', scene: 'savanna', look: 'soft', since: 2,
      jobs: ['storm', 'rainbow', 'dust', 'rain', 'fog', 'daynight'] },
    { id: 'northern-lights', name: '🌌 Northern lights', theme: 'arctic', scene: 'tundra', look: 'night', weather: 'aurora', pace: 1.7,
      jobs: ['Reindeer', 'Arctic Fox', 'Snowy Owl', 'aurora', 'anything', 'anything'] },
    { id: 'snowy-day',    name: '❄️ Snowy day',         theme: 'arctic', scene: 'forest',   look: 'soft',  weather: 'snow',
      jobs: ['Moose', 'Reindeer', 'Arctic Hare', 'snow', 'anything', 'anything'] },
    { id: 'on-the-ice',   name: '🧊 On the ice',        theme: 'arctic', scene: 'ice',      look: 'soft',
      jobs: ['Polar Bear', 'Penguin', 'Seal', 'Whale', 'anything', 'anything'] },
    { id: 'arctic-weather', name: '🌦️ Weather play', theme: 'arctic', scene: 'tundra', look: 'soft', since: 2,
      jobs: ['nextweather', 'aurora', 'wind', 'fog', 'snow', 'daynight'] },
    { id: 'seaside',      name: '🏖️ Seaside',           theme: 'ocean',  scene: 'shore',    look: 'soft',
      jobs: ['Crab', 'Dolphin', 'Seal', 'Whale', 'anything', 'anything'] },
    { id: 'under-the-sea', name: '🪸 Under the sea',    theme: 'ocean',  scene: 'reef',     look: 'soft',  weather: 'sunbeams',
      jobs: ['Clownfish', 'Octopus', 'Turtle', 'bubbles', 'anything', 'anything'] },
    { id: 'glowing-deep', name: '✨ Glowing deep',      theme: 'ocean',  scene: 'kelp',     look: 'night', weather: 'glow', pace: 1.7,
      jobs: ['Whale', 'Jellyfish', 'Seal', 'glow', 'anything', 'anything'] },
    { id: 'ocean-weather', name: '🌦️ Weather play', theme: 'ocean',  scene: 'shore',   look: 'soft', since: 2,
      jobs: ['storm', 'rainbow', 'wind', 'rain', 'fog', 'daynight'] },
    { id: 'fish-tank',    name: '🐟 Fish tank',         theme: 'fish',   scene: 'tank',     look: 'soft',
      jobs: ['Goldfish', 'Betta', 'Angelfish', 'bubbles', 'anything', 'anything'] },
    { id: 'reef-fish',    name: '🐠 Reef fish',         theme: 'fish',   scene: 'reef',     look: 'soft',  weather: 'sunbeams',
      jobs: ['Clownfish', 'Blue Tang', 'Pufferfish', 'Shark', 'anything', 'anything'] },
    { id: 'river-fish',   name: '🏞️ River fish',        theme: 'fish',   scene: 'river',    look: 'soft',  pace: 1.7,
      jobs: ['Salmon', 'Rainbow Trout', 'Koi', 'current', 'anything', 'anything'] },
    { id: 'fish-weather', name: '🌦️ Weather play', theme: 'fish',   scene: 'reef',     look: 'soft', since: 2,
      jobs: ['nextweather', 'sunbeams', 'current', 'bubbles', 'glow', 'daynight'] },
    { id: 'busy-flowers', name: '🌼 Busy flowers',      theme: 'minibeasts', scene: 'flowers', look: 'soft',
      jobs: ['Bee', 'Butterfly', 'Ladybird', 'Spider', 'anything', 'anything'] },
    { id: 'under-the-logs', name: '🪵 Under the logs',  theme: 'minibeasts', scene: 'logs',  look: 'soft',
      jobs: ['Beetle', 'Worm', 'Snail', 'Spider', 'anything', 'anything'] },
    { id: 'rainy-veg',    name: '🌧️ Rainy veg patch',   theme: 'minibeasts', scene: 'veg',   look: 'soft',  weather: 'rain',
      jobs: ['Caterpillar', 'Snail', 'Worm', 'rain', 'anything', 'anything'] },
    { id: 'minibeasts-weather', name: '🌦️ Weather play', theme: 'minibeasts', scene: 'logs', look: 'soft', since: 2,
      jobs: ['leaves', 'rainbow', 'wind', 'rain', 'fog', 'daynight'] },
];
const presets = loadPresets();

function loadPresets() {
    try {
        const saved = JSON.parse(localStorage.getItem(PRESETS_KEY));
        if (Array.isArray(saved)) return addNewReady(saved.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string').map(p => {
            // Saved before the single switch had a job: give it the ready-made one's.
            const ready = READY_PRESETS.find(r => r.id === p.id);
            if (ready && Array.isArray(p.jobs) && p.jobs.length < ready.jobs.length) p.jobs.push(...ready.jobs.slice(p.jobs.length));
            return p;
        }));
    } catch (e) { /* private window or blocked storage: the ready-made ones */ }
    try { localStorage.setItem(PRESETS_VERSION_KEY, PRESETS_VERSION); } catch (e) {}
    return READY_PRESETS.map(p => JSON.parse(JSON.stringify(p)));
}
// Saved before some ready-made presets existed: add those (after the theme's others),
// and give Birds' Weather play its colour-matched jobs if they were never changed.
function addNewReady(list) {
    let version = 1;
    try { version = +localStorage.getItem(PRESETS_VERSION_KEY) || 1; } catch (e) {}
    if (version >= PRESETS_VERSION) return list;
    const play = list.find(q => q.id === 'weather-play');
    if (play && Array.isArray(play.jobs) && play.jobs.slice(0, 5).join() === 'rain,snow,wind,rainbow,storm')
        play.jobs = READY_PRESETS.find(r => r.id === 'weather-play').jobs.slice();
    READY_PRESETS.filter(r => (r.since || 1) > version && !list.some(q => q.id === r.id)).forEach(r => {
        const last = list.map(q => q.theme).lastIndexOf(r.theme);
        list.splice(last + 1 || list.length, 0, JSON.parse(JSON.stringify(r)));
    });
    try { localStorage.setItem(PRESETS_VERSION_KEY, PRESETS_VERSION); localStorage.setItem(PRESETS_KEY, JSON.stringify(list)); } catch (e) {}
    return list;
}
function savePresets() {
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch (e) {}
}
const presetById = id => presets.find(p => p.id === id) || null;
// Each preset belongs to one set of animals (its theme); set-up only shows those for the
// animals chosen on the start screen, so Birds and Forest presets never mix.
const presetTheme = p => SceneArt[p.theme] && themes[p.theme] ? p.theme : SCENE_DEFAULTS.theme;
const themePresets = () => presets.filter(p => presetTheme(p) === sceneSettings.theme);

// The set-up as it is now, as a preset.
function presetFromSettings(id, name) {
    const p = { id, name, theme: sceneSettings.theme, scene: chosenScene() };
    PRESET_KEYS.forEach(k => { p[k] = sceneSettings[k]; });
    p.jobs = Switches.slots.map(jobFor);
    return p;
}

// What a preset sets each thing to; anything it doesn't say takes the usual default.
function presetValue(p, key) {
    const v = p[key];
    return typeof v === typeof SCENE_DEFAULTS[key] ? v : SCENE_DEFAULTS[key];
}

// Has the set-up been changed since this preset was used (or saved)?
function presetDiffers(p) {
    const now = presetFromSettings(p.id, p.name);
    if (PRESET_KEYS.some(k => now[k] !== presetValue(p, k))) return true;
    if (p.scene && now.scene !== p.scene) return true;
    return (p.jobs || []).some((job, i) => i < now.jobs.length && now.jobs[i] !== job);
}

function usePreset(p) {
    const trackBefore = trackUrl();
    PRESET_KEYS.forEach(k => { sceneSettings[k] = presetValue(p, k); });
    tidySettings(sceneSettings);
    if (!SceneArt[sceneSettings.theme] || !themes[sceneSettings.theme]) sceneSettings.theme = SCENE_DEFAULTS.theme;
    if (typeof p.scene === 'string') sceneSettings.scenes[sceneSettings.theme] = p.scene;
    const jobs = {};
    (p.jobs || []).forEach((job, i) => { if (Switches.slots[i] && typeof job === 'string') jobs[Switches.slots[i].id] = job; });
    sceneSettings.jobs[sceneSettings.theme] = jobs;
    sceneSettings.preset = p.id;
    saveSceneSettings();
    // The scene starts afresh: its own weather, animals, look and track.
    liveWeather = homeWeather();
    strength = BASE_STRENGTH;
    lastWeatherPress = Date.now();
    buildScene();
    if (started && trackUrl() !== trackBefore) Ambient.start(trackUrl(), sceneSettings.ambientVolume);
    if (!started) showTapToStart(p.name);
}

// Save the set-up as a new preset, with an id made from its name (used in its link).
function addPreset(name) {
    name = name.trim() || 'Preset';
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'preset';
    let id = base;
    for (let k = 2; presetById(id); k++) id = `${base}-${k}`;
    const p = presetFromSettings(id, name);
    presets.push(p);
    sceneSettings.preset = id;
    saveSceneSettings();
    savePresets();
    return p;
}
// Keep the set-up as it is now in this preset (its name and link stay the same).
function updatePreset(id) {
    const i = presets.findIndex(p => p.id === id);
    if (i < 0) return;
    presets[i] = presetFromSettings(id, presets[i].name);
    sceneSettings.preset = id;
    saveSceneSettings();
    savePresets();
}
function renamePreset(id, name) {
    const p = presetById(id);
    if (p && name.trim()) { p.name = name.trim(); savePresets(); }
}
function deletePreset(id) {
    const i = presets.findIndex(p => p.id === id);
    if (i >= 0) { presets.splice(i, 1); savePresets(); }
}
const missingReadyPresets = () => READY_PRESETS.filter(r => r.theme === sceneSettings.theme && !presetById(r.id));
function restoreReadyPresets() {
    missingReadyPresets().forEach(r => presets.splice(READY_PRESETS.indexOf(r), 0, JSON.parse(JSON.stringify(r))));
    savePresets();
}
function presetLink(id) { return location.href.split('#')[0] + '#preset=' + id; }

// Opened with a preset's link (e.g. a shortcut on the sensory-room computer): use it.
(() => {
    const m = location.hash.match(/preset=([\w-]+)/);
    const p = m && presetById(m[1]);
    if (p) usePreset(p);
})();
