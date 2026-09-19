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
    return `
        <div class="sw" data-id="${slot.id}">
            <div class="sw-top">
                <button class="sw-colour sw-${slot.colour}" style="background:${colour.hex}" aria-label="Switch ${i + 1} is ${colour.label}. Change colour"></button>
                <span class="sw-name">Switch ${i + 1}</span>
                <span class="sw-binding${slot.binding ? '' : ' unset'}">${Switches.describe(slot.binding)}</span>
                <button class="sw-learn">${slot.binding ? 'Learn again' : 'Learn'}</button>
                ${keep ? `<button class="sw-forget"${slot.binding ? '' : ' disabled'}>Forget</button>`
                       : `<button class="sw-remove" aria-label="Remove switch ${i + 1}">✕</button>`}
            </div>
            <div class="sw-palette" hidden>${Switches.PALETTE.map(p =>
                `<button class="swatch sw-${p.name}${p.name === slot.colour ? ' active' : ''}" data-colour="${p.name}" style="background:${p.hex}" aria-label="${p.label}" title="${p.label}"></button>`).join('')}</div>
            <label class="sw-job">Job in this scene
                <select>
                    <optgroup label="Animals">${Object.keys(art.animals).map(n => option(n, n)).join('')}</optgroup>
                    <optgroup label="Scene">${Object.entries(SCENE_JOBS).map(([value, j]) => option(value, j.label)).join('')}</optgroup>
                    <optgroup label="Weather">${Object.entries(WEATHER_JOBS).map(([value, j]) => option(value, j.label)).join('')}</optgroup>
                    ${option('nothing', 'Nothing')}
                </select>
            </label>
            <p class="sw-hint">${jobHint(job)}</p>
        </div>`;
}

function jobHint(job) {
    if (SceneWeather[job]) return SceneWeather[job].hint + (building()
        ? ` Each press makes it stronger, in five steps${job === 'storm' ? ', with thunder' : ''}; left alone, it eases off.`
        : ' Press again to stop it.');
    if (jobInfo(job)) return jobInfo(job).hint;
    if (job === 'nothing') return 'This switch does nothing in this scene.';
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
        (jobs.length ? `<br>Switches: ${jobs.join(', ')}` : '');
}

function presetCard(p) {
    const inUse = sceneSettings.preset === p.id;
    const changed = inUse && presetDiffers(p);
    return `
        <div class="preset${inUse ? ' in-use' : ''}" data-id="${p.id}">
            <div class="preset-top">
                <span class="preset-name">${escapeHtml(p.name)}</span>
                ${inUse ? `<span class="preset-state">${changed ? 'In use, changed since' : '✓ In use'}</span>` : ''}
                <button class="preset-use">${inUse ? 'Start again' : 'Use'}</button>
            </div>
            <p class="preset-sum">${presetSummary(p)}</p>
            <div class="preset-tools">
                <button class="preset-update">Save changes here</button>
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
            <p class="setup-note">A preset is a saved set-up: scene, look, speed, weather and what each switch does.
                Sound levels and the switches themselves stay as they are on this computer.</p>
            <div class="preset-list">${presets.map(presetCard).join('') || '<p class="setup-note">No presets.</p>'}</div>
            <div class="preset-new">
                <input type="text" id="preset-name" maxlength="40" value="Preset ${presets.length + 1}" aria-label="Name for the new preset">
                <button class="preset-add">+ Save as a new preset</button>
            </div>
            <p class="setup-note">Saves everything as it is set now. To change a preset: use it, change what you like, then tap
                <strong>Save changes here</strong>. Each preset has a <strong>Link</strong> that opens Animal Scenes straight
                into it, handy as a shortcut on the sensory-room computer.</p>
            ${missingReadyPresets().length ? '<button class="preset-restore">Bring back the ready-made presets</button>' : ''}
        </section>`,
        weather: `
        <section>
            ${optRow("The scene's own weather", 'weather', [['clear', '☀️ Clear'], ...Object.entries(SceneWeather).map(([id, w]) => [id, w.label])])}
            <p class="setup-note">The scene starts with this weather${building() ? ', and goes back to it when left alone' : ''}.
                Give switches weather jobs (Switches tab) to change it while playing.</p>
            ${optRow('Weather switches', 'weatherPress', [['build', 'Build up'], ['toggle', 'On / off']])}
            <p class="setup-note">${building()
                ? "Each press makes the weather stronger, in five steps (a new weather starts at the lightest), and touching the sky does the same. Left alone, it eases back a step at a time to the scene's own weather, which sits in the middle."
                : 'A press turns that weather on; another press turns it off.'}</p>
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
            ${optRow('Animals leave', 'stay', [[0, 'Never'], [-1, 'When touched'], [30, 'After 30 seconds'], [60, 'After 1 minute'], [120, 'After 2 minutes']])}
            <p class="setup-note">${leaveHint()}</p>
            ${optRow('Look changes', 'fade', [[2, 'Quick (2 s)'], [5, 'Gentle (5 s)'], [10, 'Slow (10 s)'], [20, 'Very slow (20 s)']])}
            <p class="setup-note">How long Day / night, Next look and the weather take to fade.</p>
        </section>`,
        switches: `
        <section>
            <p class="setup-note">Tap <strong>Learn</strong>, then press the switch. Works with SimplyWorks and Bluetooth
                switches, keyboards and the Xbox Adaptive Controller (press one of its buttons once first).
                Choose a colour to match the real switch.</p>
            <div class="sw-list">${Switches.slots.map(switchRow).join('') || '<p class="setup-note">No switches yet.</p>'}</div>
            <button class="sw-add"${full ? ' disabled' : ''}>${full ? `Twelve switches is the most` : '+ Add a switch'}</button>
            ${optRow('Switch labels on screen', 'labels', [[false, 'Hide'], [true, 'Show']])}
            ${optRow('Other keys and buttons', 'others', [['anything', '🎲 Random'], ['nothing', 'Nothing']])}
        </section>`,
        sound: `
        <section>
            ${optRow('Animal sounds', 'animalVolume', [[0, 'Off'], [0.3, 'Quiet'], [0.6, 'Medium'], [1, 'Loud']])}
            ${optRow('Background sound', 'ambientVolume', [[0, 'Off'], [0.25, 'Quiet'], [0.5, 'Medium'], [1, 'Loud']])}
            ${optRow('Weather sounds', 'weatherVolume', [[0, 'Off'], [0.25, 'Quiet'], [0.5, 'Medium'], [1, 'Loud']])}
            <p class="setup-note">Rain, wind and far-off thunder.</p>
            ${optRow('Background track', 'track', [['scene', `Matches the scene (${SceneTracks[art.track].label})`],
                ...Object.entries(SceneTracks).map(([id, t]) => [id, t.label])])}
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
    if (btn.classList.contains('preset-use')) { usePreset(presetById(id)); renderLabels(); renderSetup(); }
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
