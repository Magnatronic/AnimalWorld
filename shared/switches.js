/* ── SWITCHES ── */
// Up to six switches, shared by Animal Activities and Animal Scenes. An adult
// "learns" each one by pressing it, so whatever the device sends works:
//   - a keystroke, from a Pretorian SimplyWorks SEND-6, a Bluetooth switch or a keyboard
//   - a controller button, from the Xbox Adaptive Controller (read through the
//     browser's Gamepad API; Chrome and Edge only see a controller once one of
//     its buttons has been pressed on the page)
// Both parts of Animal World run from the same site, so a switch learned in one
// works in the other.
const Switches = (() => {
    const KEY    = 'animalWorld.switches';
    const COUNT  = 6;
    const COLOURS = ['red', 'yellow', 'green', 'blue', 'purple', 'orange'];
    const COLOUR_HEX = { red: '#e53935', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5', purple: '#8e24aa', orange: '#fb8c00' };

    // Each slot: { binding: null | { type: 'key', code } | { type: 'pad', button }, colour }
    const slots = load();
    const pressListeners = [], releaseListeners = [];
    let learning = null;          // { index, finish } while waiting for a press to learn
    let padDown  = [];            // which controller buttons were down at the last check
    let pollTimer = null;
    const POLL_MS = 30;           // about 30 checks a second: quicker than any switch press

    function load() {
        const fresh = Array.from({ length: COUNT }, (_, i) => ({ binding: null, colour: COLOURS[i] }));
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (Array.isArray(saved)) saved.slice(0, COUNT).forEach((s, i) => {
                if (s && isBinding(s.binding)) fresh[i].binding = s.binding;
                if (s && COLOURS.includes(s.colour)) fresh[i].colour = s.colour;
            });
        } catch (e) { /* private window or blocked storage: nothing learned */ }
        return fresh;
    }
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(slots)); } catch (e) {}
    }
    function isBinding(b) {
        return b && ((b.type === 'key' && typeof b.code === 'string') || (b.type === 'pad' && Number.isInteger(b.button)));
    }
    function same(a, b) {
        return a && b && a.type === b.type && (a.type === 'key' ? a.code === b.code : a.button === b.button);
    }
    function indexOf(binding) {
        return slots.findIndex(s => same(s.binding, binding));
    }

    // Learn a binding for slot `index` from the next key or controller button.
    // Resolves with the binding, or null if cancelled (Escape) or timed out.
    function learn(index, timeoutMs = 15000) {
        cancelLearn();
        startPolling();
        return new Promise(resolve => {
            const timer = setTimeout(() => finish(null), timeoutMs);
            function finish(binding) {
                clearTimeout(timer);
                learning = null;
                if (binding) {
                    // One switch can only have one job: take it off any other slot.
                    const taken = indexOf(binding);
                    if (taken >= 0 && taken !== index) slots[taken].binding = null;
                    slots[index].binding = binding;
                    save();
                }
                resolve(binding);
            }
            learning = { index, finish };
        });
    }
    function cancelLearn() { if (learning) learning.finish(null); }

    function clear(index) { slots[index].binding = null; save(); }

    // A name an adult will recognise: "Key 1", "Space", "Controller button A".
    const PAD_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'Left stick', 'Right stick', 'D-pad up', 'D-pad down', 'D-pad left', 'D-pad right', 'Xbox'];
    function describe(binding) {
        if (!binding) return 'Not set';
        if (binding.type === 'pad') return 'Controller button ' + (PAD_NAMES[binding.button] || binding.button + 1);
        const c = binding.code;
        if (/^Key[A-Z]$/.test(c))    return 'Key ' + c.slice(3);
        if (/^Digit\d$/.test(c))     return 'Key ' + c.slice(5);
        if (/^Numpad\d$/.test(c))    return 'Number pad ' + c.slice(6);
        if (/^F\d+$/.test(c))        return 'Key ' + c;
        if (/^Arrow/.test(c))        return c.replace('Arrow', 'Arrow ');
        return c.replace(/([a-z])([A-Z])/g, '$1 $2');     // "Space", "Enter", "Page Down"…
    }

    function emit(list, index, source) { list.forEach(fn => fn(index, source)); }

    // ── Keyboard switches ──
    document.addEventListener('keydown', e => {
        if (learning) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (e.code === 'Escape') learning.finish(null);
            else learning.finish({ type: 'key', code: e.code });
            return;
        }
        const i = indexOf({ type: 'key', code: e.code });
        if (i < 0) return;
        e.preventDefault();                 // a learned switch shouldn't also scroll or click
        if (!e.repeat) emit(pressListeners, i, 'key');
    }, true);
    document.addEventListener('keyup', e => {
        const i = indexOf({ type: 'key', code: e.code });
        if (i >= 0) emit(releaseListeners, i, 'key');
    }, true);

    // ── Controller switches: check while a controller is connected ──
    function startPolling() {
        if (pollTimer || !navigator.getGamepads) return;
        pollTimer = setInterval(poll, POLL_MS);
        poll();
    }
    function poll() {
        const pads = [...(navigator.getGamepads ? navigator.getGamepads() : [])].filter(Boolean);
        const down = [];
        pads.forEach(pad => pad.buttons.forEach((b, n) => { if (b.pressed) down[n] = true; }));
        down.forEach((isDown, n) => {
            if (!isDown || padDown[n]) return;
            if (learning) { learning.finish({ type: 'pad', button: n }); return; }
            const i = indexOf({ type: 'pad', button: n });
            if (i >= 0) emit(pressListeners, i, 'pad');
        });
        padDown.forEach((wasDown, n) => {
            if (!wasDown || down[n]) return;
            const i = indexOf({ type: 'pad', button: n });
            if (i >= 0) emit(releaseListeners, i, 'pad');
        });
        padDown = down;
        if (!pads.length && !learning) { clearInterval(pollTimer); pollTimer = null; }
    }
    window.addEventListener('gamepadconnected', startPolling);
    startPolling();

    return {
        COUNT,
        COLOUR_HEX,
        slots,
        learn,
        cancelLearn,
        clear,
        describe,
        // Is this key event one of the learned switches? (so other key handling can leave it alone)
        isLearnedKey: e => indexOf({ type: 'key', code: e.code }) >= 0,
        anyLearned: () => slots.some(s => s.binding),
        onPress:   fn => pressListeners.push(fn),
        onRelease: fn => releaseListeners.push(fn),
    };
})();
