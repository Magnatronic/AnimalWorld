/* ── PRESETS ── */
// A preset is a saved set-up: theme, scene, look, speed, how animals leave, weather,
// and each switch's job. Jobs are kept by switch number (switch 1, switch 2…), so a
// preset works with whichever switches are learned on this computer. Sound levels,
// switch labels and the switches themselves stay as they are on the computer.
//
// The ready-made presets are there the first time; like any preset they can be
// changed or deleted, and set-up can bring back any that were deleted.
// A preset can be opened directly: scenes.html#preset=<id>.
const PRESETS_KEY = 'animalScenes.presets';
const PRESET_KEYS = ['theme', 'look', 'pace', 'touchPlaces', 'showPlaces', 'wander', 'stay', 'fade', 'weather', 'weatherPress', 'weatherEase', 'lightning', 'others', 'pressGap', 'track'];
const READY_PRESETS = [
    { id: 'calm-garden',  name: '🌳 Calm garden',  theme: 'birds', scene: 'garden',   look: 'soft',  pace: 1.7,
      jobs: ['Sparrow', 'Pigeon', 'Duck', 'Hen', 'anything'] },
    { id: 'weather-play', name: '🌦️ Weather play', theme: 'birds', scene: 'lake',     look: 'soft',
      jobs: ['rain', 'snow', 'wind', 'rainbow', 'storm'] },
    { id: 'night-owls',   name: '🦉 Night owls',   theme: 'birds', scene: 'woodland', look: 'night', pace: 1.7,
      jobs: ['Owl', 'Crow', 'Eagle', 'daynight', 'anything'] },
    { id: 'busy-lake',    name: '🏞️ Busy lake',    theme: 'birds', scene: 'lake',     look: 'soft',  stay: 30,
      jobs: ['Duck', 'Swan', 'Goose', 'Flamingo', 'anything'] },
    { id: 'peekaboo',     name: '🦊 Peek-a-boo',       theme: 'forest', scene: 'woodland', look: 'soft',
      jobs: ['Fox', 'Bear', 'Wolf', 'Owl', 'anything'] },
    { id: 'riverbank',    name: '🦫 Riverbank',        theme: 'forest', scene: 'river',    look: 'soft',
      jobs: ['Beaver', 'Otter', 'Frog', 'Deer', 'anything'] },
    { id: 'forest-night', name: '🦇 Forest at night',  theme: 'forest', scene: 'clearing', look: 'night', pace: 1.7,
      jobs: ['Owl', 'Bat', 'Hedgehog', 'Badger', 'anything'] },
];
const presets = loadPresets();

function loadPresets() {
    try {
        const saved = JSON.parse(localStorage.getItem(PRESETS_KEY));
        if (Array.isArray(saved)) return saved.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string');
    } catch (e) { /* private window or blocked storage: the ready-made ones */ }
    return READY_PRESETS.map(p => JSON.parse(JSON.stringify(p)));
}
function savePresets() {
    try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch (e) {}
}
const presetById = id => presets.find(p => p.id === id) || null;

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
    if (!started) document.getElementById('start-theme').textContent = p.name;
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
const missingReadyPresets = () => READY_PRESETS.filter(r => !presetById(r.id));
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
