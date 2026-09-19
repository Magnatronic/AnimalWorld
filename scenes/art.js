/* ── SCENE ART ── */
// Each scene: a background drawn as layered SVG shapes (no picture files, so it's
// sharp at any projector size and works offline), the spots animals can stand
// on, and how each of the theme's animals behaves in it. The scene is 1600 × 900
// (16:9); spot and animal positions are % of that. Squarer screens trim the
// sides, so spots stay between x 15% and 85%.
//
// Every shape takes its colour from CSS variables per look (Soft flat, Matching
// outlines, Night-light) in scenes.css; `ol` marks shapes that get OpenMoji's
// black outline in the Matching outlines look.

const SceneArt = (() => {

    function cloud(i, y, s) {
        const dur = [140, 170, 200][i];
        return `<g class="cloud" style="--d:${dur}s;animation-delay:${-dur * (0.2 + i * 0.3)}s">
          <g transform="translate(0 ${y}) scale(${s})"><ellipse class="f-cloud ol" cx="0" cy="0" rx="120" ry="42"/><ellipse class="f-cloud ol" cx="-50" cy="-26" rx="60" ry="44"/><ellipse class="f-cloud ol" cx="40" cy="-38" rx="70" ry="52"/><ellipse class="f-cloud" cx="0" cy="0" rx="112" ry="36"/></g></g>`;
    }
    function stars() {
        const pts = [[120,80],[260,160],[420,60],[560,130],[700,40],[860,110],[980,60],[1120,150],[1480,70],[1540,210],[640,220],[300,260],[1010,240],[1300,90]];
        return pts.map(([x, y], i) => `<circle class="f-star" cx="${x}" cy="${y}" r="${i % 3 ? 3 : 4.5}" style="animation-delay:${-i * 0.7}s"/>`).join('');
    }
    function flowers(pts) {
        return pts.map(([x, y]) => `<g><circle class="f-flower ol" cx="${x - 9}" cy="${y}" r="9"/><circle class="f-flower ol" cx="${x + 9}" cy="${y}" r="9"/><circle class="f-flower ol" cx="${x}" cy="${y - 9}" r="9"/><circle class="f-flower ol" cx="${x}" cy="${y + 9}" r="9"/><circle class="f-centre" cx="${x}" cy="${y}" r="6"/></g>`).join('');
    }
    function skyAndSun(id, sunX) {
        return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="f-sky1"/><stop offset="1" class="f-sky2"/></linearGradient></defs>
          <rect width="1600" height="900" fill="url(#${id})"/>
          <g class="night-only">${stars()}</g>
          <circle class="f-sun ol day-only" cx="${sunX}" cy="140" r="66"/>
          <g class="night-only"><circle class="f-moon" cx="${sunX}" cy="140" r="58"/><circle class="f-cut" cx="${sunX + 26}" cy="124" r="50"/></g>`;
    }

    return {
        birds: {
            ambient: 'sounds/ambient/birds.mp3',
            move: 'fly',            // how animals arrive unless they say otherwise
            fx: 'note',             // what rises when an animal calls
            svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
              ${skyAndSun('g-birds', 1110)}
              ${cloud(0, 150, 1)}${cloud(1, 240, .8)}${cloud(2, 110, .6)}
              <path class="f-hill ol" d="M-10 560 C 250 470 470 520 720 545 C 960 568 1220 470 1610 520 L1610 910 L-10 910Z"/>
              <path class="f-lawn ol" d="M-10 668 C 300 612 700 642 1000 632 C 1250 624 1450 600 1610 612 L1610 910 L-10 910Z"/>
              <ellipse class="f-pond ol" cx="1220" cy="778" rx="320" ry="74"/>
              <ellipse class="ring" cx="1180" cy="780" rx="90" ry="18"/><ellipse class="ring" cx="1300" cy="770" rx="70" ry="14" style="animation-delay:-3s"/>
              ${flowers([[330,745],[470,860],[640,770],[770,850],[860,720]])}
              <path class="f-trunk ol" d="M168 910 L186 380 Q200 330 214 380 L240 910Z"/>
              <path class="f-trunk ol" d="M205 452 Q 420 432 650 356 L656 374 Q 432 458 212 482Z"/>
              <g class="sway" style="--d:9s"><circle class="f-leaf ol" cx="130" cy="300" r="120"/><circle class="f-leaf2 ol" cx="255" cy="235" r="105"/><circle class="f-leaf ol" cx="80" cy="170" r="95"/><circle class="f-leaf2 ol" cx="200" cy="120" r="85"/></g>
              <path class="f-trunk ol" d="M1610 246 Q 1350 262 1070 300 L1073 320 Q 1360 292 1610 290Z"/>
              <g class="sway" style="--d:11s"><circle class="f-leaf ol" cx="1560" cy="215" r="95"/><circle class="f-leaf2 ol" cx="1470" cy="180" r="70"/><circle class="f-leaf ol" cx="1600" cy="120" r="85"/></g>
            </svg>`,
            // Where animals can be: x, y = where their feet go (% of the scene)
            spots: [
                { habitat: 'perch', x: 24, y: 47.4 },
                { habitat: 'perch', x: 36, y: 42.1 },
                { habitat: 'perch', x: 70, y: 32.8 },
                { habitat: 'perch', x: 81, y: 30.8 },
                { habitat: 'ground', x: 25, y: 88 },
                { habitat: 'ground', x: 35, y: 81 },
                { habitat: 'ground', x: 45, y: 88 },
                { habitat: 'ground', x: 52, y: 78 },
                { habitat: 'water', x: 70, y: 86 },
                { habitat: 'water', x: 83, y: 87.5 },
            ],
            // Every animal in the Birds theme: where it lives, its width (% of the
            // scene), which way its picture faces (r, l or f for front), and how it arrives.
            animals: {
                Sparrow:  { habitat: 'perch',  w: 9,    face: 'r' },
                Crow:     { habitat: 'perch',  w: 10,   face: 'r' },
                Owl:      { habitat: 'perch',  w: 9,    face: 'f' },
                Eagle:    { habitat: 'perch',  w: 11.5, face: 'l' },
                Parrot:   { habitat: 'perch',  w: 9,    face: 'l' },
                Pigeon:   { habitat: 'ground', w: 9,    face: 'l' },
                Hen:      { habitat: 'ground', w: 9,    face: 'f', move: 'walk' },
                Rooster:  { habitat: 'ground', w: 10.5, face: 'l', move: 'walk' },
                Chick:    { habitat: 'ground', w: 7,    face: 'f', move: 'walk' },
                Turkey:   { habitat: 'ground', w: 11,   face: 'l', move: 'walk' },
                Peacock:  { habitat: 'ground', w: 13,   face: 'f', move: 'walk' },
                Penguin:  { habitat: 'ground', w: 9,    face: 'f', move: 'walk' },
                Duck:     { habitat: 'water',  w: 10.5, face: 'l' },
                Swan:     { habitat: 'water',  w: 11.5, face: 'l' },
                Goose:    { habitat: 'water',  w: 10.5, face: 'l' },
                Flamingo: { habitat: 'water',  w: 10,   face: 'l' },
            },
            residents: ['Sparrow', 'Duck'],                                   // there when the scene opens
            switchCast: ['Sparrow', 'Owl', 'Duck', 'Swan', 'Parrot', 'Peacock'], // first jobs for switches 1, 2, 3…
        },
    };
})();
