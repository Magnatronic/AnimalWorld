/* ── SET-UP ── */
// The adult's screen, opened by holding ⚙ (also from the start screen). Every
// change is saved at once and shows in the scene behind when set-up closes.

const JOB_WORDS = [['anything', 'Anything happens'], ['nothing', 'Nothing'], ['daynight', 'Day / night']];

function optRow(label, key, options) {
    const buttons = options.map(([value, text]) =>
        `<button class="opt${sceneSettings[key] === value ? ' active' : ''}" data-key="${key}" data-value='${JSON.stringify(value)}'>${text}</button>`);
    return `<div class="opt-group"><span class="opt-label">${label}</span><div class="opts">${buttons.join('')}</div></div>`;
}

function switchRow(slot, i) {
    const colour = Switches.PALETTE.find(p => p.name === slot.colour);
    const job = jobFor(slot);
    const jobs = [...JOB_WORDS, ...Object.keys(art.animals).map(n => [n, n])];
    return `
        <div class="sw" data-id="${slot.id}">
            <div class="sw-top">
                <button class="sw-colour sw-${slot.colour}" style="background:${colour.hex}" aria-label="Switch ${i + 1} is ${colour.label}. Change colour"></button>
                <span class="sw-name">Switch ${i + 1}</span>
                <span class="sw-binding${slot.binding ? '' : ' unset'}">${Switches.describe(slot.binding)}</span>
                <button class="sw-learn">${slot.binding ? 'Learn again' : 'Learn'}</button>
                <button class="sw-remove" aria-label="Remove switch ${i + 1}">✕</button>
            </div>
            <div class="sw-palette" hidden>${Switches.PALETTE.map(p =>
                `<button class="swatch sw-${p.name}${p.name === slot.colour ? ' active' : ''}" data-colour="${p.name}" style="background:${p.hex}" aria-label="${p.label}" title="${p.label}"></button>`).join('')}</div>
            <label class="sw-job">Job in this scene
                <select>${jobs.map(([value, text]) => `<option value="${value}"${value === job ? ' selected' : ''}>${text}</option>`).join('')}</select>
            </label>
        </div>`;
}

function renderSetup() {
    const full = Switches.slots.length >= Switches.MAX;
    document.getElementById('setup-body').innerHTML = `
        <section>
            <h3>🎨 Scene: ${themes[sceneSettings.theme].label}</h3>
            ${optRow('Look', 'look', [['soft', 'Soft flat'], ['line', 'Matching outlines'], ['night', 'Night-light']])}
            ${optRow('Speed', 'pace', [[1.7, 'Slower'], [1, 'Normal'], [0.6, 'Faster']])}
        </section>
        <section>
            <h3>🎛️ Switches</h3>
            <p class="setup-note">Tap <strong>Learn</strong>, then press the switch. Works with SimplyWorks and Bluetooth
                switches, keyboards and the Xbox Adaptive Controller (press one of its buttons once first).
                Choose a colour to match the real switch.</p>
            <div class="sw-list">${Switches.slots.map(switchRow).join('') || '<p class="setup-note">No switches yet.</p>'}</div>
            <button class="sw-add"${full ? ' disabled' : ''}>${full ? `Twelve switches is the most` : '+ Add a switch'}</button>
            ${optRow('Switch labels on screen', 'labels', [[false, 'Hide'], [true, 'Show']])}
            ${optRow('Other keys and buttons', 'others', [['anything', 'Anything happens'], ['nothing', 'Nothing']])}
        </section>
        <section>
            <h3>🔊 Sound</h3>
            ${optRow('Animal sounds', 'animalVolume', [[0, 'Off'], [0.3, 'Quiet'], [0.6, 'Medium'], [1, 'Loud']])}
            ${optRow('Background sound', 'ambientVolume', [[0, 'Off'], [0.25, 'Quiet'], [0.5, 'Medium'], [1, 'Loud']])}
        </section>`;
}

function setScene(key, value) {
    sceneSettings[key] = value;
    saveSceneSettings();
    if (key === 'look' || key === 'pace') applyLook();
    if (key === 'ambientVolume' && started) Ambient.setLevel(value, art.ambient);
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

document.getElementById('setup-body').addEventListener('click', e => {
    const opt = e.target.closest('.opt');
    if (opt) { setScene(opt.dataset.key, JSON.parse(opt.dataset.value)); return; }

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
    renderLabels();
});
