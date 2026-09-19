/* ── SWITCHES ── */
// Learning and reading switches for both parts of Animal World. An adult "learns"
// a switch by pressing it, so whatever the device sends works:
//   - a keystroke, from a Pretorian SimplyWorks SEND-6, a Bluetooth switch or a keyboard
//   - a controller button, from the Xbox Adaptive Controller (read through the
//     browser's Gamepad API; Chrome and Edge only see a controller once one of
//     its buttons has been pressed on the page)
// Animal Scenes keeps six numbered switches here (slots), each with a colour and
// jobs. Animal Activities learns its scanning switches with capture() and keeps
// them in its own settings. Both parts run from the same site, so the numbered
// switches are shared.
const Switches = (() => {
    const KEY    = 'animalWorld.switches';
    const COUNT  = 6;
    const COLOURS = ['red', 'yellow', 'green', 'blue', 'purple', 'orange'];
    const COLOUR_HEX = { red: '#e53935', yellow: '#fdd835', green: '#43a047', blue: '#1e88e5', purple: '#8e24aa', orange: '#fb8c00' };

    // Each slot: { binding: null | { type: 'key', code } | { type: 'pad', button }, colour }
    const slots = load();
    const pressListeners = [], releaseListeners = [], anyListeners = [];
    let learning = null;          // { finish } while waiting for a press to capture
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

    // Wait for the next key or controller button and return what it sends.
    // Resolves with the binding, or null if cancelled (Escape) or timed out.
    function capture(timeoutMs = 15000) {
        cancelLearn();
        startPolling();
        return new Promise(resolve => {
            const timer = setTimeout(() => finish(null), timeoutMs);
            function finish(binding) {
                clearTimeout(timer);
                learning = null;
                resolve(binding);
            }
            learning = { finish };
        });
    }

    // Learn numbered switch `index` (Animal Scenes) from the next press.
    async function learn(index, timeoutMs) {
        const binding = await capture(timeoutMs);
        if (binding) {
            // One switch can only have one number: take it off any other slot.
            const taken = indexOf(binding);
            if (taken >= 0 && taken !== index) slots[taken].binding = null;
            slots[index].binding = binding;
            save();
        }
        return binding;
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
    // Tell anything listening for every press; returns whether one of them used it.
    function emitAny(binding) { return anyListeners.map(fn => fn(binding) === true).some(Boolean); }

    // ── Keyboard switches ──
    document.addEventListener('keydown', e => {
        if (learning) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (e.code === 'Escape') learning.finish(null);
            else learning.finish({ type: 'key', code: e.code });
            return;
        }
        if (e.repeat) return;
        const binding = { type: 'key', code: e.code };
        const used = emitAny(binding);
        const i = indexOf(binding);
        if (i >= 0) emit(pressListeners, i, 'key');
        if (used || i >= 0) e.preventDefault();     // a switch press shouldn't also scroll or click
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
            const binding = { type: 'pad', button: n };
            if (learning) { learning.finish(binding); return; }
            emitAny(binding);
            const i = indexOf(binding);
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
        capture,
        learn,
        cancelLearn,
        clear,
        describe,
        isBinding,
        sameBinding: same,
        slotOf: indexOf,                             // which numbered switch sends this, or -1
        onPress:    fn => pressListeners.push(fn),   // a numbered switch: fn(index, source)
        onRelease:  fn => releaseListeners.push(fn),
        onAnyPress: fn => anyListeners.push(fn),     // every key and button: fn(binding); return true if used
    };
})();
