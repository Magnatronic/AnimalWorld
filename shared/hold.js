/* ── HOLD TO OPEN ── */
// The ⚙ button opens settings only after a two-second hold, with a ring filling as
// it's held, so a passing tap from a student just shows a reminder. Shared by
// Animal Activities and Animal Scenes; styles are in shared/hold.css.
const HOLD_TO_OPEN_MS = 2000;

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
    btn.addEventListener('contextmenu', e => e.preventDefault());
}
