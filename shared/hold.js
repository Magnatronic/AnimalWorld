/* ── HOLD TO OPEN ── */
// The ⚙ button opens settings only after a two-second hold, with a ring filling as
// it's held, so a passing tap from a student just shows a reminder. Shared by
// Animal Activities and Animal Scenes; styles are in shared/hold.css.
// This file also turns off the browser's own long-press menu, for the same reason:
// holding is a thing students do here (see below).
const HOLD_TO_OPEN_MS = 2000;

// A long press on a touchscreen normally pops up the browser's menu ("open link",
// "save image"…). On the projector that happens by accident, over the top of the
// scene, and a student can't dismiss it. Naming a preset is the one place the menu
// is still worth having, so text fields keep it (as switches.js does for keys).
document.addEventListener('contextmenu', e => {
    if (e.target.matches && e.target.matches('input[type="text"], textarea')) return;
    e.preventDefault();
});

function holdToOpen(btn, hint, open) {
    let timer = null, hintTimer = null;
    btn.addEventListener('pointerdown', e => {
        e.preventDefault();
        btn.classList.add('holding');
        timer = setTimeout(() => {
            timer = null;
            btn.classList.remove('holding');
            open();
        }, HOLD_TO_OPEN_MS);
    });
    const cancel = () => {
        if (!timer) return;
        clearTimeout(timer);
        timer = null;
        btn.classList.remove('holding');
        hint.classList.add('visible');
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => hint.classList.remove('visible'), 2000);
    };
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => btn.addEventListener(t, cancel));
}
