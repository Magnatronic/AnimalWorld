/* ── THE ADULT'S BUTTONS ── */
// The ⚙ (settings / set-up) and Animal Scenes' ← open on a plain tap. They used to
// need a two-second hold so a student couldn't open them by accident; the owner asked
// for taps instead, so the buttons stay dim and out of the way rather than slow to open.
// Shared by Animal Activities and Animal Scenes; styles are in shared/hold.css.
// This file also turns off the browser's own long-press menu — holding is still a thing
// students do on the projector, and the menu it pops up is theirs to get stuck behind.

// A long press on a touchscreen normally pops up the browser's menu ("open link",
// "save image"…). On the projector that happens by accident, over the top of the
// scene, and a student can't dismiss it. Naming a preset is the one place the menu
// is still worth having, so text fields keep it (as switches.js does for keys).
document.addEventListener('contextmenu', e => {
    if (e.target.matches && e.target.matches('input[type="text"], textarea')) return;
    e.preventDefault();
});

function openOnTap(btn, open) {
    btn.addEventListener('click', e => {
        e.preventDefault();
        open();
    });
}
