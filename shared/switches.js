/* ── SWITCHES ── */
// Learning and reading switches for both parts of Animal World. An adult "learns"
// a switch by pressing it, so whatever the device sends works:
//   - a keystroke, from a Pretorian SimplyWorks SEND-6, a Bluetooth switch or a keyboard
//   - a controller button, from the Xbox Adaptive Controller (read through the
//     browser's Gamepad API; Chrome and Edge only see a controller once one of
//     its buttons has been pressed on the page)
// Animal Scenes keeps a list of numbered switches here (up to MAX), each with a
// colour matching the real switch and a stable id its jobs are saved against.
// Animal Activities learns its scanning switches with capture() and keeps them in
// its own settings. Both parts run from the same site, so the list is shared.
const Switches = (() => {
    const KEY = 'animalWorld.switches';
    const MAX = 12;
    const POLL_MS = 30;           // about 30 checks a second: quicker than any switch press

    // Colours to match the switches in the room. White and black get an outline where shown.
    const PALETTE = [
        { name: 'red',        label: 'Red',         hex: '#e53935' },
        { name: 'orange',     label: 'Orange',      hex: '#fb8c00' },
        { name: 'yellow',     label: 'Yellow',      hex: '#fdd835' },
        { name: 'lightgreen', label: 'Light green', hex: '#9ccc65' },
        { name: 'green',      label: 'Green',       hex: '#2e9d4a' },
        { name: 'turquoise',  label: 'Turquoise',   hex: '#1bb5a8' },
        { name: 'lightblue',  label: 'Light blue',  hex: '#64b5f6' },
        { name: 'blue',       label: 'Blue',        hex: '#1e5fd6' },
        { name: 'purple',     label: 'Purple',      hex: '#8e24aa' },
        { name: 'pink',       label: 'Pink',        hex: '#f06292' },
        { name: 'white',      label: 'White',       hex: '#ffffff' },
        { name: 'black',      label: 'Black',       hex: '#222222' },
    ];
    // The order new switches take colours in: the commonest switch colours first.
    const NEXT_COLOURS = ['red', 'yellow', 'green', 'blue', 'purple', 'orange', 'pink', 'white', 'black', 'turquoise', 'lightblue', 'lightgreen'];
    const isColour = c => PALETTE.some(p => p.name === c);

    // The switches in the sensory room, through its SimplyWorks receiver (which shows up as a
    // controller): the five-switch box, in the order of the buttons it sends, then the single
    // white switch. A computer with no switches learned starts with these, so they work at once;
    // set-up can put them back ("Use the room's switches").
    const ROOM = [
        { colour: 'red',    button: 12 },
        { colour: 'yellow', button: 13 },
        { colour: 'green',  button: 14 },
        { colour: 'blue',   button: 15 },
        { colour: 'white',  button: 16 },
        { colour: 'white',  button: 18 },   // the single switch
    ];
    // The room's switches, keeping the ids of any switches already here, so their jobs stay.
    const roomSlots = (old = []) => ROOM.map((r, i) => ({ id: old[i] ? old[i].id : newId(), binding: { type: 'pad', button: r.button }, colour: r.colour }));
    // Set once the room's switches have replaced what was here, so switches learned after that are kept.
    const ROOM_KEY = 'animalWorld.roomSwitches';

    // Each slot: { id, binding: null | { type: 'key', code } | { type: 'pad', button }, colour }
    const slots = load();
    save();                       // so the room's switches keep their ids, which jobs are saved against
    const pressListeners = [], releaseListeners = [], anyListeners = [];
    let learning = null;          // { finish } while waiting for a press to capture
    let padDown  = [];            // which controller buttons were down at the last check
    let pollTimer = null;

    function newId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

    function load() {
        const list = [];
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (Array.isArray(saved)) saved.slice(0, MAX).forEach((s, i) => {
                if (!s || typeof s !== 'object') return;
                list.push({
                    id:      typeof s.id === 'string' ? s.id : newId(),
                    binding: isBinding(s.binding) ? s.binding : null,
                    colour:  isColour(s.colour) ? s.colour : NEXT_COLOURS[i % NEXT_COLOURS.length],
                });
            });
        } catch (e) { /* private window or blocked storage: no switches yet */ }
        // The first time, the room's switches replace any learned before they were built in.
        let placed = false;
        try { placed = localStorage.getItem(ROOM_KEY) === '1'; localStorage.setItem(ROOM_KEY, '1'); } catch (e) {}
        return placed && list.some(s => s.binding) ? list : roomSlots(list);
    }
    function save() {
        try { localStorage.setItem(KEY, JSON.stringify(slots)); } catch (e) {}
    }
    function isBinding(b) {
        return !!b && ((b.type === 'key' && typeof b.code === 'string') || (b.type === 'pad' && Number.isInteger(b.button)));
    }
    function same(a, b) {
        return !!a && !!b && a.type === b.type && (a.type === 'key' ? a.code === b.code : a.button === b.button);
    }
    function indexOf(binding) {
        return slots.findIndex(s => same(s.binding, binding));
    }
    const byId = id => slots.find(s => s.id === id) || null;

    // ── The list of numbered switches ──
    function add() {
        if (slots.length >= MAX) return null;
        const used = slots.map(s => s.colour);
        const colour = NEXT_COLOURS.find(c => !used.includes(c)) || NEXT_COLOURS[slots.length % NEXT_COLOURS.length];
        const slot = { id: newId(), binding: null, colour };
        slots.push(slot);
        save();
        return slot;
    }
    function remove(id) {
        const i = slots.findIndex(s => s.id === id);
        if (i >= 0) { slots.splice(i, 1); save(); }
    }
    function setColour(id, colour) {
        const slot = byId(id);
        if (slot && isColour(colour)) { slot.colour = colour; save(); }
    }
    function clear(id) {
        const slot = byId(id);
        if (slot) { slot.binding = null; save(); }
    }
    // Back to the room's switches.
    function useRoom() {
        slots.splice(0, slots.length, ...roomSlots(slots));
        save();
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
    function cancelLearn() { if (learning) learning.finish(null); }

    // Learn the numbered switch with this id from the next press.
    async function learn(id, timeoutMs) {
        const binding = await capture(timeoutMs);
        const slot = byId(id);
        if (binding && slot) {
            // One real switch can only be one numbered switch: take it off any other.
            slots.forEach(s => { if (s !== slot && same(s.binding, binding)) s.binding = null; });
            slot.binding = binding;
            save();
        }
        return binding;
    }

    // A name an adult will recognise: "Key 1", "Space", "Controller button 0 (A)". Buttons
    // are numbered from 0, as controller testing websites show them.
    const PAD_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'Left stick', 'Right stick', 'D-pad up', 'D-pad down', 'D-pad left', 'D-pad right', 'Xbox'];
    function describe(binding) {
        if (!binding) return 'Not set';
        if (binding.type === 'pad') return `Controller button ${binding.button}` + (PAD_NAMES[binding.button] ? ` (${PAD_NAMES[binding.button]})` : '');
        const c = binding.code;
        if (/^Key[A-Z]$/.test(c))    return 'Key ' + c.slice(3);
        if (/^Digit\d$/.test(c))     return 'Key ' + c.slice(5);
        if (/^Numpad\d$/.test(c))    return 'Number pad ' + c.slice(6);
        if (/^F\d+$/.test(c))        return 'Key ' + c;
        if (/^Arrow/.test(c))        return c.replace('Arrow', 'Arrow ');
        return c.replace(/([a-z])([A-Z])/g, '$1 $2');     // "Space", "Enter", "Page Down"…
    }

    function emit(list, i, source) { list.forEach(fn => fn(slots[i], i, source)); }
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
        // Typing in a text box (a preset's name) is typing, even with keys that are switches.
        if (e.target.matches && e.target.matches('input[type="text"], textarea')) return;
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
        MAX,
        PALETTE,
        colourHex: name => (PALETTE.find(p => p.name === name) || PALETTE[0]).hex,
        slots,                                       // the numbered switches, in order
        byId,
        add,
        remove,
        setColour,
        clear,
        useRoom,
        capture,
        learn,
        cancelLearn,
        describe,
        isBinding,
        sameBinding: same,
        slotOf: indexOf,                             // which numbered switch sends this (0-based), or -1
        onPress:    fn => pressListeners.push(fn),   // a numbered switch: fn(slot, index, source)
        onRelease:  fn => releaseListeners.push(fn),
        onAnyPress: fn => anyListeners.push(fn),     // every key and button: fn(binding); return true if used
    };
})();
