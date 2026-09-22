/* ── SET-UP ── */
// The adult's screen, opened by holding ⚙ (also from the start screen). Every
// change is saved at once and shows in the scene behind when set-up closes.


function optRow(label, key, options) {
    const buttons = options.map(([value, text]) =>
        `<button class="opt${sceneSettings[key] === value ? ' active' : ''}" data-key="${key}" data-value='${JSON.stringify(value)}'>${text}</button>`);
    return `<div class="opt-group"><span class="opt-label">${label}</span><div class="opts">${buttons.join('')}</div></div>`;
}

function switchRow(slot, i) {
    const colour = Switches.PALETTE.find(p => p.name === slot.colour);
    const job = jobFor(slot);
    const option = (value, text) => `<option value="${value}"${value === job ? ' selected' : ''}>${text}</option>`;
    // The first few switches are always there: they can be forgotten, not removed.
    const keep = i < SCENE_SWITCHES_MIN;
    // One line: colour, name and key, its job in this scene, Learn; what the job does underneath.
    return `
        <div class="sw" data-id="${slot.id}">
            <div class="sw-top">
                <button class="sw-colour sw-${slot.colour}" style="background:${colour.hex}" aria-label="Switch ${i + 1} is ${colour.label}. Change colour"></button>
                <span class="sw-id"><span class="sw-name">Switch ${i + 1}</span>
                    <span class="sw-binding${slot.binding ? '' : ' unset'}">${Switches.describe(slot.binding)}</span></span>
                <select aria-label="Job for switch ${i + 1} in this scene">
                    <optgroup label="Animals">${Object.keys(art.animals).map(n => option(n, n)).join('')}${
                        !cast[job] && !jobInfo(job) && job !== 'nothing' ? option(job, `${job} (not in this scene)`) : ''}</optgroup>
                    <optgroup label="Scene">${Object.entries(SCENE_JOBS).map(([value, j]) => option(value, j.label)).join('')}</optgroup>
                    <optgroup label="Weather">${themeWeatherJobs().map(value => option(value, WEATHER_JOBS[value].label)).join('')}</optgroup>
                    ${option('nothing', 'Nothing')}
                </select>
                <button class="sw-learn">${slot.binding ? 'Learn again' : 'Learn'}</button>
                ${keep ? `<button class="sw-forget"${slot.binding ? '' : ' disabled'}>Forget</button>`
                       : `<button class="sw-remove" aria-label="Remove switch ${i + 1}">✕</button>`}
            </div>
            <div class="sw-palette" hidden>${Switches.PALETTE.map(p =>
                `<button class="swatch sw-${p.name}${p.name === slot.colour ? ' active' : ''}" data-colour="${p.name}" style="background:${p.hex}" aria-label="${p.label}" title="${p.label}"></button>`).join('')}</div>
            <p class="sw-hint">${jobHint(job)}</p>
        </div>`;
}

function jobHint(job) {
    if (SceneWeather[job]) return SceneWeather[job].hint + (building()
        ? ` Each press makes it stronger, in five steps${job === 'storm' ? ', with thunder' : ''}; left alone, it eases off.`
        : ' Press again to stop it.');
    if (jobInfo(job)) return jobInfo(job).hint;
    if (job === 'nothing') return 'This switch does nothing in this scene.';
    if (!cast[job]) return `The ${job.toLowerCase()} isn't in this scene, so here this switch brings a random animal instead.`;
    return `The ${job.toLowerCase()} comes into the scene, or calls if it's already here.`;
}

// Set-up has five tabs; it opens on Presets, then reopens on the one last used.
let setupTab = 'presets';

const LOOK_NAMES = { soft: 'Soft flat', line: 'Matching outlines', night: 'Night-light' };

// One line saying what a preset does.
function presetSummary(p) {
    const theme = SceneArt[p.theme] || SceneArt.birds;
    const scene = theme.scenes[p.scene] || Object.values(theme.scenes)[0];
    const weather = SceneWeather[presetValue(p, 'weather')];
    const jobs = (p.jobs || []).slice(0, Switches.slots.length).map(jobLabel);
    return [scene.name, LOOK_NAMES[presetValue(p, 'look')], weather ? weather.label : '☀️ Clear'].join(' · ') +
        (jobs.length ? ` · Switches: ${jobs.join(', ')}` : '');
}

function presetCard(p) {
    const inUse = sceneSettings.preset === p.id;
    const changed = inUse && presetDiffers(p);
    const summary = presetSummary(p);
    return `
        <div class="preset${inUse ? ' in-use' : ''}" data-id="${p.id}">
            <div class="preset-top">
                <div class="preset-main">
                    <span class="preset-name">${escapeHtml(p.name)}</span>
                    ${inUse ? `<span class="preset-state">${changed ? 'In use, changed since' : '✓ In use'}</span>` : ''}
                    <p class="preset-sum" title="${escapeHtml(summary)}">${summary}</p>
                </div>
                ${changed ? '<button class="preset-update">Save changes here</button>' : ''}
                <button class="preset-use">${inUse ? 'Start again' : 'Use'}</button>
                <button class="preset-more" aria-label="More for ${escapeHtml(p.name)}" aria-expanded="false">⋯</button>
            </div>
            <div class="preset-tools" hidden>
                ${changed ? '' : '<button class="preset-update">Save changes here</button>'}
                <button class="preset-rename">Rename</button>
                <button class="preset-link">Link</button>
                <button class="preset-delete">Delete</button>
            </div>
            <p class="preset-linkline" hidden></p>
        </div>`;
}
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// How many animals the scene has room for, and where.
function roomText() {
    const counts = {};
    art.spots.forEach(s => { counts[s.habitat] = (counts[s.habitat] || 0) + 1; });
    const parts = Object.entries(counts).map(([habitat, n]) => `${n} ${art.places[habitat]}`);
    const list = parts.length > 1 ? parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1] : parts[0];
    return `Room for ${art.spots.length} ${art.noun} at once: ${list}.`;
}

// What marks each empty place in this scene, e.g. "a nest on a branch, seeds on the ground or a lily pad on the water".
const MARK_WORDS = { perch: 'a nest on a branch', ground: 'seeds on the ground', water: 'a lily pad on the water' };
function marksText() {
    const words = { ...MARK_WORDS, ...art.markWords };
    const list = [...new Set(art.spots.map(s => words[s.cover] || words[s.habitat]))].filter(Boolean);
    return list.length > 1 ? list.slice(0, -1).join(', ') + ' or ' + list[list.length - 1] : list[0] || '';
}

function leaveHint() {
    const s = sceneSettings.stay;
    if (s === 0)  return 'Animals stay. When every spot is full, the one that has been there longest makes room for a new arrival.';
    if (s === -1) return 'Touch an animal, or press its switch, and it calls and then leaves.';
    return `An animal leaves after ${s < 60 ? s + ' seconds' : s / 60 + (s === 60 ? ' minute' : ' minutes')} without being touched or called.`;
}

function renderSetup() {
    const full = Switches.slots.length >= Switches.MAX;
    document.querySelectorAll('#setup-tabs .setup-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === setupTab));
    const sections = {
        presets: `
        <section>
            <div class="preset-new">
                <input type="text" id="preset-name" maxlength="40" value="Preset ${themePresets().length + 1}" aria-label="Name for the new preset">
                <button class="preset-add">+ Save as a new preset</button>
            </div>
            <div class="preset-list">${themePresets().map(presetCard).join('') || '<p class="setup-note">No presets for these animals yet.</p>'}</div>
            <p class="setup-note">These are the presets for ${themes[sceneSettings.theme].label}; each set of animals has its own
                (choose other animals on the start screen to see theirs). A preset is a saved set-up: scene, look, speed, weather and what each switch does (sound
                levels and the switches themselves stay as they are on this computer). To change one: use it, change what you
                like, then tap <strong>Save changes here</strong>. <strong>⋯</strong> has Rename, Delete and a <strong>Link</strong>
                that opens Animal Scenes straight into the preset, handy as a shortcut on the sensory-room computer.</p>
            ${missingReadyPresets().length ? '<button class="preset-restore">Bring back the ready-made presets</button>' : ''}
        </section>`,
        weather: `
        <section>
            ${optRow("The scene's own weather", 'weather', [['clear', '☀️ Clear'], ...themeWeathers().map(id => [id, SceneWeather[id].label])])}
            <p class="setup-note">The scene starts with this weather${building() ? ', and goes back to it when left alone' : ''}.
                Give switches weather jobs (Switches tab) to change it while playing.</p>
            ${optRow('Weather switches', 'weatherPress', [['build', 'Build up'], ['toggle', 'On / off']])}
            <p class="setup-note">${building()
                ? "Each press makes the weather stronger, in five steps (a new weather starts at the lightest), and touching open sky (away from the branches) does the same. Left alone, it eases back a step at a time to the scene's own weather, which sits in the middle."
                : 'A press turns that weather on; another press turns it off.'}</p>
            ${optRow('Lightning in storms', 'lightning', [[true, 'Show'], [false, 'Thunder only']])}
            <p class="setup-note">Lightning is thin bolts that fade in (never a flash or flicker), at most about one a second
                even in the strongest storm. Choose Thunder only if anyone watching could be sensitive to it.</p>
            ${building() ? optRow('Each step lasts', 'weatherEase', [[10, '10 seconds'], [20, '20 seconds'], [60, '1 minute']]) +
                '<p class="setup-note">How long before the weather eases off a step, once nobody is pressing or touching the sky.</p>' : ''}
        </section>`,
        scene: `
        <section>
            <h3>${themes[sceneSettings.theme].label}</h3>
            <div class="opt-group"><span class="opt-label">Scene</span><div class="opts">${sceneIds().map(id =>
                `<button class="opt${id === art.id ? ' active' : ''}" data-key="scene" data-value='"${id}"'>${SceneArt[sceneSettings.theme].scenes[id].name}</button>`).join('')}</div></div>
            <p class="setup-note">${roomText()}</p>
            ${optRow('Look', 'look', [['soft', 'Soft flat'], ['line', 'Matching outlines'], ['night', 'Night-light']])}
            ${optRow('Speed', 'pace', [[1.7, 'Slower'], [1, 'Normal'], [0.6, 'Faster']])}
            ${optRow('Touching an empty place', 'touchPlaces', [[true, 'Brings an animal'], [false, 'Just a ripple']])}
            <p class="setup-note">${sceneSettings.touchPlaces
                ? "Touch near an empty place and an animal that lives there comes to that spot (if they're all here, one moves over). Touching an animal makes it call."
                : 'Touching an animal makes it call; touching anywhere else just makes a ripple. Switches bring animals in.'}</p>
            ${sceneSettings.touchPlaces ? optRow('Empty places', 'showPlaces', [['subtle', 'Subtle'], ['clear', 'Clear'], ['off', "Don't show"]]) +
                `<p class="setup-note">${{ subtle: `Each empty place shows something that belongs there: ${marksText()}.`,
                    clear: `Each empty place shows ${marksText()}, with a warm glow and a star twinkling above it.`,
                    off: 'Empty places look like the rest of the scene.' }[sceneSettings.showPlaces]}</p>` : ''}
            ${optRow('Animals move about', 'wander', [[0, 'Only when asked'], [40, 'Now and then'], [15, 'Often']])}
            <p class="setup-note">${sceneSettings.wander
                ? 'Now and then an animal quietly moves to an empty place (or two swap places), without calling.'
                : "Animals stay where they are unless a switch with the 🔀 Move about job is pressed, or an empty place is touched when everyone who lives there is already here."}</p>
            ${optRow('Animals leave', 'stay', [[0, 'Never'], [-1, 'When touched'], [30, 'After 30 seconds'], [60, 'After 1 minute'], [120, 'After 2 minutes']])}
            <p class="setup-note">${leaveHint()}</p>
            ${optRow('Look changes', 'fade', [[2, 'Quick (2 s)'], [5, 'Gentle (5 s)'], [10, 'Slow (10 s)'], [20, 'Very slow (20 s)']])}
            <p class="setup-note">How long Day / night, Next look and the weather take to fade.</p>
        </section>`,
        switches: `
        <section>
            <div class="opt-stack">
                ${optRow('Labels on screen', 'labels', [[false, 'Hide'], [true, 'Show']])}
                ${optRow('Other keys', 'others', [['anything', '🎲 Random'], ['nothing', 'Nothing']])}
                ${optRow('Wait between presses', 'pressGap', [[1, '1 s'], [2, '2 s'], [3, '3 s'], [-1, 'When finished']])}
            </div>
            <p class="setup-note">${sceneSettings.pressGap === -1
                ? 'After a press or touch does something, nothing else happens until it has finished (an animal has arrived, a change has faded in).'
                : "After a press or touch does something, others are ignored for this long, so lots at once don't set everything off together; changing the scene, look or weather waits for the last change to finish."}
                Other keys: any key or button that isn't a numbered switch.</p>
            <div class="sw-list">${Switches.slots.map(switchRow).join('') || '<p class="setup-note">No switches yet.</p>'}</div>
            <button class="sw-add"${full ? ' disabled' : ''}>${full ? `Twelve switches is the most` : '+ Add a switch'}</button>
            <button class="sw-room">Use the room's switches</button>
            <p class="setup-note">Tap <strong>Learn</strong>, then press the switch. Works with SimplyWorks and Bluetooth
                switches, keyboards and the Xbox Adaptive Controller (press one of its buttons once first).
                Tap the coloured circle to match the real switch's colour.
                <strong>Use the room's switches</strong> sets up the sensory room's SimplyWorks switches without learning them:
                the box's red, yellow, green, blue and white, then the single white switch.</p>
        </section>`,
        sound: `
        <section>
            ${optRow('Animal sounds', 'animalVolume', [[0, 'Off'], [0.3, 'Quiet'], [0.6, 'Medium'], [1, 'Loud']])}
            ${optRow('Background sound', 'ambientVolume', [[0, 'Off'], [0.25, 'Quiet'], [0.5, 'Medium'], [1, 'Loud']])}
            ${optRow('Weather sounds', 'weatherVolume', [[0, 'Off'], [0.25, 'Quiet'], [0.5, 'Medium'], [1, 'Loud']])}
            <p class="setup-note">Rain, wind and far-off thunder.</p>
            ${optRow('Background track', 'track', [['scene', 'Matches the scene'], ...themeTracks().map(id => [id, SceneTracks[id].label])])}
            <p class="setup-note">Each scene has its own track (now: ${SceneTracks[art.track].label}); or choose one of the others for these animals.</p>
        </section>`,
    };
    document.getElementById('setup-body').innerHTML = sections[setupTab];
}

document.getElementById('setup-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.setup-tab');
    if (!tab) return;
    Switches.cancelLearn();
    setupTab = tab.dataset.tab;
    renderSetup();
    document.getElementById('setup-body').scrollTop = 0;
});

function setScene(key, value) {
    if (key === 'scene') { changeScene(value, true); renderSetup(); renderLabels(); return; }
    const trackBefore = key === 'track' ? trackUrl() : null;
    sceneSettings[key] = value;
    saveSceneSettings();
    if (key === 'track' && started && trackUrl() !== trackBefore) Ambient.start(trackUrl(), sceneSettings.ambientVolume);
    if (key === 'look') liveLook = value;
    if (key === 'look' || key === 'pace') applyLook();
    if (key === 'touchPlaces' || key === 'showPlaces') markPlaces();
    if (key === 'ambientVolume' && started) Ambient.setLevel(value, trackUrl());
    if (key === 'weather') { lastWeatherPress = Date.now(); setWeather(value); }
    if (key === 'weatherVolume') weatherSound();
    renderLabels();
    renderSetup();
}

async function learnInSetup(row) {
    // Move focus off the Learn button, so learning Space or Enter can't also "click" it.
    if (document.activeElement) document.activeElement.blur();
    row.classList.add('learning');
    row.querySelector('.sw-binding').textContent = 'Press the switch now…';
    row.querySelector('.sw-learn').textContent = 'Cancel';
    await Switches.learn(row.dataset.id);
    renderSetup();
    renderLabels();
}

// Buttons that need two taps, so a stray one can't delete or overwrite anything.
function confirmTap(btn, text) {
    if (btn.classList.contains('confirm')) return true;
    const before = btn.textContent;
    btn.classList.add('confirm');
    btn.textContent = text;
    setTimeout(() => { if (btn.isConnected) { btn.classList.remove('confirm'); btn.textContent = before; } }, 3000);
    return false;
}

function presetClick(e) {
    if (e.target.closest('.preset-add')) {
        addPreset(document.getElementById('preset-name').value);
        renderSetup();
        return true;
    }
    if (e.target.closest('.preset-restore')) { restoreReadyPresets(); renderSetup(); return true; }
    const card = e.target.closest('.preset');
    if (!card) return false;
    const id = card.dataset.id;
    const btn = e.target.closest('button');
    if (!btn) return true;
    if (btn.classList.contains('preset-more')) {
        const tools = card.querySelector('.preset-tools');
        tools.hidden = !tools.hidden;
        btn.setAttribute('aria-expanded', String(!tools.hidden));
    }
    else if (btn.classList.contains('preset-use')) { usePreset(presetById(id)); renderLabels(); renderSetup(); }
    else if (btn.classList.contains('preset-update')) { if (confirmTap(btn, 'Save over it?')) { updatePreset(id); renderSetup(); } }
    else if (btn.classList.contains('preset-delete')) { if (confirmTap(btn, 'Delete?')) { deletePreset(id); renderSetup(); } }
    else if (btn.classList.contains('preset-rename')) {
        const name = card.querySelector('.preset-name');
        name.innerHTML = `<input type="text" maxlength="40" value="${escapeHtml(presetById(id).name)}" aria-label="New name">`;
        const input = name.querySelector('input');
        input.focus();
        input.select();
        let finished = false;
        const done = keep => { if (finished) return; finished = true; if (keep) renamePreset(id, input.value); renderSetup(); };
        input.addEventListener('keydown', ev => { if (ev.key === 'Enter') done(true); if (ev.key === 'Escape') done(false); });
        input.addEventListener('blur', () => done(true));
    } else if (btn.classList.contains('preset-link')) {
        const line = card.querySelector('.preset-linkline');
        const link = presetLink(id);
        line.hidden = false;
        line.textContent = link;
        if (navigator.clipboard) navigator.clipboard.writeText(link).then(() => { line.textContent = 'Link copied: ' + link; }).catch(() => {});
    }
    return true;
}

document.getElementById('setup-body').addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt) { setScene(opt.dataset.key, JSON.parse(opt.dataset.value)); return; }
    if (presetClick(e)) return;

    if (e.target.closest('.sw-add')) {
        const slot = Switches.add();
        renderSetup();
        if (slot) learnInSetup(document.querySelector(`.sw[data-id="${slot.id}"]`));
        return;
    }

    const room = e.target.closest('.sw-room');
    if (room) {
        // Two taps, as it replaces the switches learned here.
        if (!room.classList.contains('confirm')) {
            room.classList.add('confirm');
            room.textContent = 'Replace these switches?';
            setTimeout(() => { if (room.isConnected) { room.classList.remove('confirm'); room.textContent = "Use the room's switches"; } }, 3000);
            return;
        }
        Switches.useRoom();
        renderSetup();
        renderLabels();
        return;
    }

    const row = e.target.closest('.sw');
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest('.sw-colour')) {
        const palette = row.querySelector('.sw-palette');
        palette.hidden = !palette.hidden;
    } else if (e.target.closest('.swatch')) {
        Switches.setColour(id, e.target.closest('.swatch').dataset.colour);
        renderSetup();
        renderLabels();
    } else if (e.target.closest('.sw-forget')) {
        Switches.clear(id);
        renderSetup();
        renderLabels();
    } else if (e.target.closest('.sw-learn')) {
        if (row.classList.contains('learning')) Switches.cancelLearn();
        else learnInSetup(row);
    } else if (e.target.closest('.sw-remove')) {
        // Two taps, so a stray one can't remove a switch.
        const btn = e.target.closest('.sw-remove');
        if (!btn.classList.contains('confirm')) {
            btn.classList.add('confirm');
            btn.textContent = 'Remove?';
            setTimeout(() => { if (btn.isConnected) { btn.classList.remove('confirm'); btn.textContent = '✕'; } }, 3000);
            return;
        }
        Switches.remove(id);
        Object.values(sceneSettings.jobs).forEach(themeJobs => delete themeJobs[id]);
        saveSceneSettings();
        renderSetup();
        renderLabels();
    }
});

document.getElementById('setup-body').addEventListener('change', e => {
    const row = e.target.closest('.sw');
    if (!row || e.target.tagName !== 'SELECT') return;
    const theme = sceneSettings.theme;
    sceneSettings.jobs[theme] = sceneSettings.jobs[theme] || {};
    sceneSettings.jobs[theme][row.dataset.id] = e.target.value;
    saveSceneSettings();
    row.querySelector('.sw-hint').textContent = jobHint(e.target.value);
    renderLabels();
});
