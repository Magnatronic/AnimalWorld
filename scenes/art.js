/* ── SCENE ART ── */
// Each theme has its animals (how each behaves in any of its scenes), the first
// jobs for switches, and one or more scenes. Each scene is a background drawn as
// layered SVG shapes (no picture files, so it's sharp at any projector size and
// works offline), the spots animals can stand on, and its own background track.
//
// Scenes are 1600 × 900 (16:9); spot and animal positions are % of that. Squarer
// screens trim the sides, so spots stay between x 15% and 85%. Every shape takes
// its colour from CSS variables per scene and look (Soft flat, Matching outlines,
// Night-light) in scenes.css; `ol` marks shapes that get OpenMoji's black outline
// in the Matching outlines look. `splashes` are points on the water where rain
// makes rings. Light and shade (the `shade-*` and `light-*` shapes) are see-through
// white and dark laid over the colours, so they suit every look.

// Background tracks: any scene can play any of them.
const SceneTracks = {
    garden:   { label: 'Garden birdsong', file: 'sounds/ambient/garden.mp3' },
    woodland: { label: 'Woodland',        file: 'sounds/ambient/woodland.mp3' },
    lake:     { label: 'Lakeside water',  file: 'sounds/ambient/lake.mp3' },
};

// Weather: one at a time over any scene, fading in and out (drawn by scenes.js and
// scenes.css). `sound` loops while it lasts, under the background track.
const SceneWeather = {
    rain:    { label: '🌧️ Rain',    sound: 'sounds/weather/rain.mp3', hint: 'Rain falls, with rings on the water.' },
    storm:   { label: '⛈️ Storm',   sound: 'sounds/weather/rain.mp3',
               hint: 'Rain and a darker sky, with a faint flash of lightning and far-off thunder now and then.' },
    snow:    { label: '❄️ Snow',    hint: 'Snowflakes drift down, near and far; heavy snow slants into a blizzard and whitens the ground.' },
    wind:    { label: '🍃 Wind',    sound: 'sounds/weather/wind.mp3', hint: 'Leaves blow across and the trees lean; strong wind brings gusts.' },
    fog:     { label: '🌫️ Fog',     hint: 'Mist rolls in, some of it drifting low in front of the animals.' },
    rainbow: { label: '🌈 Rainbow', hint: 'A rainbow fades in; stronger, it sparkles, then a second one appears above it.' },
};

const SceneArt = (() => {

    // ── Shared pieces ──
    // Light and shade, cartoon style: hard-edged, so round things get a lit top-left and a
    // shaded bottom-right, trunks a shaded side, clouds a shaded belly.
    const shading = `
          <radialGradient id="sc-shade" cx=".4" cy=".36" r=".68"><stop offset=".74" stop-opacity="0"/><stop offset=".74" class="s-shade"/></radialGradient>
          <radialGradient id="sc-light" cx=".62" cy=".66" r=".7"><stop offset=".76" stop-opacity="0"/><stop offset=".76" class="s-light"/></radialGradient>
          <linearGradient id="sc-side"><stop offset=".6" stop-opacity="0"/><stop offset=".6" class="s-shade"/></linearGradient>
          <linearGradient id="sc-belly" x2="0" y2="1"><stop offset=".68" stop-opacity="0"/><stop offset=".68" class="s-shade"/></linearGradient>
          <linearGradient id="sc-glint" x2="0" y2="1"><stop offset="0" class="s-light"/><stop offset="1" stop-opacity="0"/></linearGradient>`;
    // A round shape (leaves, bushes) with its light and shade.
    function ball(cls, cx, cy, r, extra = '') {
        const at = `cx="${cx}" cy="${cy}" r="${r}"`;
        return `<circle class="${cls} ol" ${at}${extra}/><circle class="shade-ball" ${at}/><circle class="light-ball" ${at}/>`;
    }
    // A trunk or post, with its right-hand side in shade.
    function trunk(d) {
        return `<path class="f-trunk ol" d="${d}"/><path class="shade-side" d="${d}"/>`;
    }
    // A few leaves at a branch's tip; `dir` is the way the branch grows (1 right, -1 left).
    function tuft(x, y, dir) {
        return [[-38, 34, 'f-leaf2'], [4, 42, 'f-leaf'], [44, 30, 'f-leaf2']].map(([turn, len, cls]) =>
            `<path class="${cls} ol" transform="translate(${x - dir * 4} ${y + 4}) rotate(${dir > 0 ? turn : 180 - turn})" d="M0 0 Q${len / 2} ${-len * 0.34} ${len} 0 Q${len / 2} ${len * 0.34} 0 0Z"/>`).join('');
    }
    function cloud(i, y, s) {
        const dur = [140, 170, 200][i];
        return `<g class="cloud" style="--d:${dur}s;animation-delay:${-dur * (0.2 + i * 0.3)}s">
          <g transform="translate(0 ${y}) scale(${s})"><ellipse class="f-cloud ol" cx="0" cy="0" rx="120" ry="42"/><ellipse class="f-cloud ol" cx="-50" cy="-26" rx="60" ry="44"/><ellipse class="f-cloud ol" cx="40" cy="-38" rx="70" ry="52"/><ellipse class="f-cloud" cx="0" cy="0" rx="112" ry="36"/><ellipse class="shade-belly" cx="0" cy="0" rx="118" ry="41"/></g></g>`;
    }
    function stars() {
        const pts = [[120,80],[260,160],[420,60],[560,130],[700,40],[860,110],[980,60],[1120,150],[1480,70],[1540,210],[640,220],[300,260],[1010,240],[1300,90]];
        return pts.map(([x, y], i) => `<circle class="f-star" cx="${x}" cy="${y}" r="${i % 3 ? 3 : 4.5}" style="animation-delay:${-i * 0.7}s"/>`).join('');
    }
    function flowers(pts) {
        return pts.map(([x, y]) => `<g><circle class="f-flower ol" cx="${x - 9}" cy="${y}" r="9"/><circle class="f-flower ol" cx="${x + 9}" cy="${y}" r="9"/><circle class="f-flower ol" cx="${x}" cy="${y - 9}" r="9"/><circle class="f-flower ol" cx="${x}" cy="${y + 9}" r="9"/><circle class="f-centre" cx="${x}" cy="${y}" r="6"/></g>`).join('');
    }
    function skyAndSun(id, sunX) {
        return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="f-sky1"/><stop offset="1" class="f-sky2"/></linearGradient>${shading}</defs>
          <rect width="1600" height="900" fill="url(#${id})"/>
          <g class="night-only">${stars()}</g>
          <g class="day-only"><circle class="f-sun" cx="${sunX}" cy="140" r="112" fill-opacity=".14"/><circle class="f-sun" cx="${sunX}" cy="140" r="88" fill-opacity=".26"/></g>
          <circle class="f-sun ol day-only" cx="${sunX}" cy="140" r="66"/>
          <g class="night-only"><circle class="f-moon" cx="${sunX}" cy="140" r="58"/><circle class="f-cut" cx="${sunX + 26}" cy="124" r="50"/></g>`;
    }
    // A branch whose top edge runs from (x1, y1) at the trunk to (x2, y2) at its tip: birds
    // stand on that edge. Its underside is in shade, and it has a few leaves at the tip.
    function branch(x1, y1, x2, y2, thick = 20) {
        const t2 = thick * 0.7;
        return `<path class="f-trunk ol" d="M${x1} ${y1} L${x2} ${y2} L${x2} ${y2 + t2} L${x1} ${y1 + thick}Z"/>
          <path class="shade-flat" d="M${x1} ${y1 + thick * 0.55} L${x2} ${y2 + t2 * 0.55} L${x2} ${y2 + t2} L${x1} ${y1 + thick}Z"/>
          ${tuft(x2, y2, Math.sign(x2 - x1))}`;
    }
    // Glints of light on water: short lines that slowly come and go.
    function shine(pts) {
        return pts.map(([x, y, w], i) => `<path class="shine" d="M${x} ${y} h${w}" style="animation-delay:${-i * 1.7}s"/>`).join('');
    }
    // Grass tufts: three curved blades each.
    function tufts(pts) {
        return pts.map(([x, y]) => `<path class="grass" d="M${x - 5} ${y} Q${x - 7} ${y - 10} ${x - 16} ${y - 17} M${x} ${y} Q${x} ${y - 14} ${x + 3} ${y - 27} M${x + 5} ${y} Q${x + 8} ${y - 9} ${x + 16} ${y - 14}"/>`).join('');
    }
    // A small tree far off.
    function farTree(x, y, s) {
        return `<rect class="f-trunk ol" x="${x - 5 * s}" y="${y - 40 * s}" width="${10 * s}" height="${44 * s}"/>${ball('f-leaf', x, y - 52 * s, 30 * s)}`;
    }
    function bluebells(pts) {
        return pts.map(([x, y]) => `<g><path class="f-stem" d="M${x} ${y + 26} Q ${x + 2} ${y + 8} ${x + 6} ${y}"/><circle class="f-flower ol" cx="${x + 6}" cy="${y}" r="7"/><circle class="f-flower ol" cx="${x + 13}" cy="${y + 8}" r="6"/><circle class="f-flower ol" cx="${x - 2}" cy="${y + 9}" r="6"/></g>`).join('');
    }
    function reeds(x, y, n, spread = 16) {
        let s = '';
        for (let i = 0; i < n; i++) {
            const rx = x + i * spread, h = 90 + ((i * 37) % 50);
            s += `<g class="sway" style="--d:${7 + (i % 3) * 2}s;animation-delay:${-i * 1.3}s"><path class="f-leaf ol" d="M${rx} ${y} Q ${rx - 6} ${y - h * 0.6} ${rx + 2} ${y - h} L${rx + 8} ${y - h} Q ${rx + 6} ${y - h * 0.6} ${rx + 10} ${y}Z"/>${i % 2 ? `<rect class="f-trunk ol" x="${rx - 1}" y="${y - h - 30}" width="12" height="34" rx="6"/>` : ''}</g>`;
        }
        return s;
    }

    return {
        birds: {
            noun: 'birds',
            move: 'fly',            // how animals arrive unless they say otherwise
            fx: 'note',             // what rises when an animal calls
            // Every animal in the Birds theme: where it lives, its width (% of the scene),
            // which way its picture faces (r, l or f for front), how far down its picture
            // its feet are (%; for water birds, where the waterline crosses it), and how it arrives.
            animals: {
                Sparrow:  { habitat: 'perch',  w: 9,    face: 'r', foot: 78 },
                Crow:     { habitat: 'perch',  w: 10,   face: 'r', foot: 78 },
                Owl:      { habitat: 'perch',  w: 9,    face: 'f', foot: 85 },
                Eagle:    { habitat: 'perch',  w: 11.5, face: 'l', foot: 85 },
                Parrot:   { habitat: 'perch',  w: 9,    face: 'l', foot: 74 },
                Pigeon:   { habitat: 'ground', w: 9,    face: 'l', foot: 88 },
                Hen:      { habitat: 'ground', w: 9,    face: 'f', foot: 88, move: 'walk' },
                Rooster:  { habitat: 'ground', w: 10.5, face: 'l', foot: 85, move: 'walk' },
                Chick:    { habitat: 'ground', w: 7,    face: 'f', foot: 83.5, move: 'walk' },
                Turkey:   { habitat: 'ground', w: 11,   face: 'l', foot: 83.5, move: 'walk' },
                Peacock:  { habitat: 'ground', w: 13,   face: 'f', foot: 85.5, move: 'walk' },
                Penguin:  { habitat: 'ground', w: 9,    face: 'f', foot: 88.5, move: 'walk' },
                Duck:     { habitat: 'water',  w: 10.5, face: 'l', foot: 76 },
                Swan:     { habitat: 'water',  w: 11.5, face: 'l', foot: 80 },
                Goose:    { habitat: 'water',  w: 10.5, face: 'l', foot: 75 },
                Flamingo: { habitat: 'water',  w: 10,   face: 'l', foot: 80 },
            },
            switchCast: ['Sparrow', 'Owl', 'Duck', 'Swan', 'Parrot', 'Peacock'], // first jobs for switches 1, 2, 3…

            scenes: {
                garden: {
                    name: '🌳 Garden',
                    track: 'garden',
                    places: { perch: 'on the branches', ground: 'on the lawn', water: 'on the pond' },
                    residents: ['Sparrow', 'Duck'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-garden', 1110)}
                      ${cloud(0, 150, 1)}${cloud(1, 240, .8)}${cloud(2, 110, .6)}
                      <path class="f-hill ol" d="M-10 560 C 250 470 470 520 720 545 C 960 568 1220 470 1610 520 L1610 910 L-10 910Z"/>
                      ${farTree(560, 560, 1)}${farTree(640, 574, .8)}${farTree(1400, 530, .9)}
                      <path class="f-lawn ol" d="M-10 668 C 300 612 700 642 1000 632 C 1250 624 1450 600 1610 612 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 668 C 300 612 700 642 1000 632 C 1250 624 1450 600 1610 612 L1610 640 C 1450 628 1250 652 1000 660 C 700 670 300 640 -10 696Z"/>
                      <ellipse class="f-pond ol" cx="1220" cy="778" rx="320" ry="74"/>
                      <ellipse class="light-flat" cx="1220" cy="790" rx="298" ry="60"/>
                      ${shine([[1060, 770, 44], [1330, 808, 34], [1250, 752, 24]])}
                      <ellipse class="ring" cx="1180" cy="780" rx="90" ry="18"/><ellipse class="ring" cx="1300" cy="770" rx="70" ry="14" style="animation-delay:-3s"/>
                      ${tufts([[300,700],[560,690],[700,880],[930,700],[1580,700],[420,800]])}
                      ${flowers([[330,745],[470,860],[640,770],[770,850],[860,720]])}
                      ${trunk('M168 910 L186 380 Q200 330 214 380 L240 910Z')}
                      <path class="f-trunk ol" d="M205 452 Q 420 432 650 356 L656 374 Q 432 458 212 482Z"/>
                      <path class="shade-flat" d="M208 468 Q 426 446 653 366 L656 374 Q 432 458 212 482Z"/>
                      ${tuft(652, 362, 1)}
                      <g class="sway" style="--d:9s">${ball('f-leaf', 130, 300, 120)}${ball('f-leaf2', 255, 235, 105)}${ball('f-leaf', 80, 170, 95)}${ball('f-leaf2', 200, 120, 85)}</g>
                      <path class="f-trunk ol" d="M1610 246 Q 1350 262 1070 300 L1073 320 Q 1360 292 1610 290Z"/>
                      <path class="shade-flat" d="M1610 270 Q 1356 278 1071 311 L1073 320 Q 1360 292 1610 290Z"/>
                      ${tuft(1070, 304, -1)}
                      <g class="sway" style="--d:11s">${ball('f-leaf', 1560, 215, 95)}${ball('f-leaf2', 1470, 180, 70)}${ball('f-leaf', 1600, 120, 85)}</g>
                    </svg>`,
                    // Where animals can be: x, y = where their feet go (% of the scene)
                    spots: [
                        { habitat: 'perch', x: 24, y: 47.4 }, { habitat: 'perch', x: 36, y: 42.1 },
                        { habitat: 'perch', x: 70, y: 32.8 }, { habitat: 'perch', x: 81, y: 30.8 },
                        { habitat: 'ground', x: 25, y: 88 }, { habitat: 'ground', x: 35, y: 81 },
                        { habitat: 'ground', x: 45, y: 88 }, { habitat: 'ground', x: 52, y: 78 },
                        { habitat: 'water', x: 70, y: 86 },  { habitat: 'water', x: 83, y: 87.5 },
                    ],
                    splashes: [[62.5, 87.8], [70, 84.4], [78.8, 88.9], [86.3, 85.6], [75, 91]],
                },

                woodland: {
                    name: '🌲 Woodland',
                    track: 'woodland',
                    places: { perch: 'on the branches', ground: 'on the forest floor', water: 'in the stream' },
                    residents: ['Owl', 'Crow'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-woodland', 1290)}
                      ${cloud(0, 120, .8)}${cloud(2, 90, .6)}
                      ${[[70,34],[300,28],[470,40],[760,30],[880,26],[1160,36],[1320,30],[1560,34]].map(([x, w]) =>
                        `<rect class="f-hill" x="${x}" y="160" width="${w}" height="560" rx="${w / 2}"/>`).join('')}
                      ${[[40,210,120],[260,170,130],[480,220,110],[700,180,140],[930,230,120],[1150,190,130],[1370,220,120],[1580,180,120]].map(([x, y, r]) =>
                        `<circle class="f-leaf2" cx="${x}" cy="${y}" r="${r}" opacity=".75"/>`).join('')}
                      <g class="day-only"><polygon class="f-ray ray" points="560,0 660,0 900,690 760,690"/><polygon class="f-ray ray" points="1150,0 1220,0 1330,690 1230,690" style="animation-delay:-5s"/></g>
                      ${[[90,700,56],[330,690,62],[450,705,48],[640,698,60],[760,700,46],[900,690,58],[1180,684,54],[1300,690,44],[1560,686,58]].map(([x, y, r]) =>
                        ball('f-leaf', x, y, r)).join('')}
                      <path class="f-lawn ol" d="M-10 690 C 300 650 600 705 900 682 C 1200 660 1400 692 1610 672 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 690 C 300 650 600 705 900 682 C 1200 660 1400 692 1610 672 L1610 698 C 1400 718 1200 686 900 708 C 600 731 300 676 -10 716Z"/>
                      <path class="f-pond ol" d="M700 910 C 850 820 1050 800 1250 805 C 1420 810 1500 770 1610 760 L1610 910 Z"/>
                      <path class="shade-flat" d="M700 910 C 850 820 1050 800 1250 805 C 1420 810 1500 770 1610 760 L1610 782 C 1500 792 1420 830 1250 826 C 1050 822 870 838 742 910Z"/>
                      ${shine([[930, 868, 40], [1140, 836, 54], [1440, 818, 36], [1250, 880, 30]])}
                      <ellipse class="ring" cx="1080" cy="858" rx="70" ry="12"/><ellipse class="ring" cx="1300" cy="846" rx="60" ry="10" style="animation-delay:-3s"/>
                      ${tufts([[80,760],[450,790],[560,870],[690,760],[120,880]])}
                      ${bluebells([[300,760],[380,810],[520,745],[610,800],[140,820]])}
                      ${trunk('M175 910 L195 -10 L255 -10 L262 910Z')}
                      ${branch(240, 440, 640, 370)}${branch(230, 250, 470, 205, 16)}
                      ${trunk('M1000 910 L1012 -10 L1066 -10 L1078 910Z')}
                      ${branch(1005, 350, 720, 315, 18)}${branch(1065, 500, 1340, 455)}
                      ${trunk('M1438 910 L1446 -10 L1498 -10 L1506 910Z')}
                      ${branch(1445, 260, 1210, 235, 16)}
                      <g class="sway" style="--d:12s">${[[60,20,150],[240,-10,140],[420,30,120],[640,-20,150],[860,10,130],[1060,-10,150],[1260,20,130],[1460,-10,150],[1620,30,120]].map(([x, y, r], i) =>
                        ball(i % 2 ? 'f-leaf2' : 'f-leaf', x, y, r)).join('')}</g>
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 27,   y: 45.2 }, { habitat: 'perch', x: 36.5, y: 42.2 },
                        { habitat: 'perch', x: 24,   y: 24.6 }, { habitat: 'perch', x: 49,   y: 35.9 },
                        { habitat: 'perch', x: 76,   y: 52.8 }, { habitat: 'perch', x: 81,   y: 27.1 },
                        { habitat: 'ground', x: 25, y: 88 }, { habitat: 'ground', x: 36, y: 82 }, { habitat: 'ground', x: 48, y: 87 },
                        { habitat: 'water', x: 72.5, y: 94 }, { habitat: 'water', x: 82, y: 93 },
                    ],
                    splashes: [[56, 97.5], [65.5, 94.5], [74, 96], [84.5, 92.5], [92.5, 90]],
                },

                lake: {
                    name: '🏞️ Lakeside',
                    track: 'lake',
                    places: { perch: 'on the jetty', ground: 'on the shore', water: 'on the lake' },
                    residents: ['Duck', 'Swan'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-lake', 420)}
                      ${cloud(0, 140, .9)}${cloud(1, 210, .7)}${cloud(2, 100, .5)}
                      <path class="f-hill ol" d="M-10 520 L 140 430 Q 170 410 200 430 L 330 500 L 520 390 Q 550 370 580 390 L 760 490 L 930 420 Q 960 405 990 420 L 1180 500 L 1360 400 Q 1390 385 1420 400 L 1610 480 L1610 590 L-10 590Z"/>
                      <path class="shade-flat" d="M170 418 L200 430 L330 500 L330 590 L170 590Z M550 378 L580 390 L760 490 L760 590 L550 590Z M960 412 L990 420 L1180 500 L1180 590 L960 590Z M1390 392 L1420 400 L1610 480 L1610 590 L1390 590Z"/>
                      <path class="f-cloud ol" d="M434 440 L520 390 Q550 370 580 390 L670 440 L640 430 L612 446 L578 432 L546 448 L512 432 L478 447Z"/>
                      <path class="f-cloud ol" d="M1279 445 L1360 400 Q1390 385 1420 400 L1527 445 L1495 436 L1462 452 L1428 438 L1394 454 L1360 438 L1325 452 L1300 440Z"/>
                      ${Array.from({ length: 28 }, (_, i) => ball('f-leaf2', i * 60, 572 - (i % 3) * 6, 30 + (i * 7) % 14)).join('')}
                      <path class="f-pond ol" d="M-10 578 L1610 578 L1610 910 L-10 910Z"/>
                      <rect class="light-glint" x="-10" y="578" width="1620" height="150"/>
                      ${shine([[250, 630, 60], [700, 700, 40], [1000, 650, 70], [1300, 770, 44], [1460, 880, 56], [820, 850, 34], [140, 612, 40]])}
                      <ellipse class="ring" cx="520" cy="690" rx="120" ry="14"/><ellipse class="ring" cx="880" cy="760" rx="100" ry="12" style="animation-delay:-2s"/><ellipse class="ring" cx="1200" cy="820" rx="110" ry="13" style="animation-delay:-4s"/>
                      <path class="f-lawn ol" d="M-10 690 C 200 670 420 690 600 760 C 680 800 720 860 700 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 690 C 200 670 420 690 600 760 C 680 800 720 860 700 910 L680 910 C 690 860 650 810 580 776 C 410 708 200 692 -10 714Z"/>
                      ${tufts([[40,740],[160,800],[400,760],[280,880],[530,830]])}
                      ${flowers([[90,760],[210,835],[330,780],[450,860]])}
                      ${reeds(600, 790, 6)}${reeds(1470, 680, 5, 22)}
                      ${[1001, 1129, 1289, 1449, 1599].map(x => `<rect class="f-trunk reflect" x="${x - 9}" y="${x < 1100 ? 740 : 730}" width="18" height="44" rx="6"/>`).join('')}
                      ${trunk('M990 540 L1012 540 L1012 740 L990 740Z')}
                      <path class="f-trunk ol" d="M1000 590 L1610 590 L1610 612 L1000 612Z"/>
                      <path class="light-flat" d="M1000 590 L1610 590 L1610 597 L1000 597Z"/>
                      <path class="plank" d="${Array.from({ length: 12 }, (_, i) => `M${1050 + i * 50} 592 V610`).join(' ')}"/>
                      ${[1120, 1280, 1440, 1590].map(x => trunk(`M${x} 612 L${x + 18} 612 L${x + 18} 730 L${x} 730Z`)).join('')}
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 62.5, y: 60 },   { habitat: 'perch', x: 71, y: 65.6 }, { habitat: 'perch', x: 80, y: 65.6 },
                        { habitat: 'ground', x: 17, y: 81 },    { habitat: 'ground', x: 26, y: 88 },  { habitat: 'ground', x: 37, y: 95 },
                        { habitat: 'water', x: 31, y: 73 },     { habitat: 'water', x: 44, y: 82 },   { habitat: 'water', x: 54, y: 92 },
                        { habitat: 'water', x: 57, y: 70 },     { habitat: 'water', x: 72, y: 88 },
                    ],
                    splashes: [[37.5, 66.7], [43.8, 71], [53, 77.8], [68.8, 73.3], [59.4, 91], [81, 86.7]],
                },
            },
        },
    };
})();
