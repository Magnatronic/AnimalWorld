/* ── OCEAN ANIMALS: Seashore, Coral reef and Kelp forest ── */
// See art.js for how a theme is laid out. Underwater, animals `swim` (their spot is the middle
// of the picture) or live on the `seabed`; on the Seashore the same animals sit on the beach,
// the rocks or the water's surface (the scene's `cast` changes where they live). Underwater
// scenes have underwater weather: bubbles, current, sunbeams and glow.
// The underwater pieces are shared with the Fish theme (SceneDraw).
(() => {
    const { shading, stars, ball } = SceneDraw;

    // The water from the surface down: lighter above, deeper below, a shimmering surface,
    // shafts of light by day and glinting plankton at night.
    function underwater(id) {
        let surface = 'M-10 0 H1610 V22';
        for (let x = 1610; x > -10; x -= 100) surface += ` Q${x - 50} ${x % 200 ? 40 : 6} ${x - 100} 22`;
        return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="f-sky1"/><stop offset="1" class="f-sky2"/></linearGradient>${shading}</defs>
          <rect width="1600" height="900" fill="url(#${id})"/>
          <path class="f-cloud" opacity=".35" d="${surface}Z"/>
          <g class="day-only"><polygon class="f-ray ray" points="380,0 470,0 700,760 560,760"/><polygon class="f-ray ray" points="900,0 960,0 1120,760 1020,760" style="animation-delay:-4s"/>
            <polygon class="f-ray ray" points="1300,0 1350,0 1420,760 1330,760" style="animation-delay:-7s"/></g>
          <g class="night-only">${stars()}</g>`;
    }
    // Far-off reef or rocks, faded, along the back.
    function farReef(y) {
        let d = `M-10 ${y + 60}`;
        [[120, -40], [260, -10], [380, -70], [520, -20], [700, -60], [860, -10], [1000, -80], [1180, -30], [1340, -70], [1500, -20], [1610, -50]]
            .forEach(([x, dy], i) => { d += ` Q${x - 60} ${y + dy - 30} ${x} ${y + dy}`; });
        return `<path class="f-hill" opacity=".55" d="${d} L1610 ${y + 160} L-10 ${y + 160}Z"/>`;
    }
    function sand(y) {
        return `<path class="f-lawn ol" d="M-10 ${y} C 300 ${y - 30} 700 ${y + 10} 1000 ${y - 10} C 1300 ${y - 30} 1450 ${y} 1610 ${y - 14} L1610 910 L-10 910Z"/>
          <path class="light-flat" d="M-10 ${y} C 300 ${y - 30} 700 ${y + 10} 1000 ${y - 10} C 1300 ${y - 30} 1450 ${y} 1610 ${y - 14} L1610 ${y + 12} C 1450 ${y + 24} 1300 ${y - 6} 1000 ${y + 14} C 700 ${y + 34} 300 ${y - 6} -10 ${y + 24}Z"/>`;
    }
    // Seaweed: a wavy ribbon, swaying.
    function seaweed(x, y, h, cls = 'f-leaf', i = 0) {
        let d = `M${x - 8} ${y}`;
        const n = 5;
        for (let k = 1; k <= n; k++) d += ` Q${x + (k % 2 ? 26 : -26)} ${y - h * (k - .5) / n} ${x + (k === n ? 0 : 0)} ${y - h * k / n}`;
        for (let k = n - 1; k >= 0; k--) d += ` Q${x + (k % 2 ? -14 : 38)} ${y - h * (k + .5) / n} ${x + 10} ${y - h * k / n}`;
        return `<g class="sway" style="--d:${6 + (i % 3) * 2}s;animation-delay:${-i * 1.1}s"><path class="${cls} ol" d="${d}Z"/></g>`;
    }
    // Kelp: a tall stalk with long leaves, from the seabed nearly to the surface.
    function kelp(x, y, h, i = 0) {
        const leaves = Array.from({ length: 7 }, (_, k) => {
            const ly = y - h * (k + 1) / 8, side = k % 2 ? 1 : -1;
            return `<path class="${k % 2 ? 'f-leaf2' : 'f-leaf'} ol" d="M${x} ${ly} Q${x + side * 50} ${ly - 30} ${x + side * 90} ${ly - 12} Q${x + side * 50} ${ly - 4} ${x} ${ly + 8}Z"/>`;
        }).join('');
        return `<g class="sway" style="--d:${9 + (i % 3) * 2}s;animation-delay:${-i * 1.7}s"><path class="stalk" d="M${x} ${y} Q${x + 20} ${y - h / 2} ${x} ${y - h}"/>${leaves}</g>`;
    }
    // Branching coral, drawn as thick rounded strokes (outlined in Matching outlines).
    function coral(x, y, s, cls = 'c1') {
        const d = `M${x} ${y} V${y - 70 * s} M${x} ${y - 30 * s} L${x - 40 * s} ${y - 80 * s} V${y - 110 * s} M${x - 22 * s} ${y - 55 * s} L${x - 58 * s} ${y - 70 * s}
            M${x} ${y - 45 * s} L${x + 38 * s} ${y - 90 * s} V${y - 120 * s} M${x + 20 * s} ${y - 68 * s} L${x + 60 * s} ${y - 78 * s} M${x} ${y - 70 * s} L${x + 6 * s} ${y - 104 * s}`;
        return `<path class="coral-ol" style="stroke-width:${18 * s + 5}" d="${d}"/><path class="coral ${cls}" style="stroke-width:${18 * s}" d="${d}"/>`;
    }
    // Brain coral: a round lump with wiggly grooves.
    function brainCoral(x, y, r) {
        return `<path class="f-cap ol" d="M${x - r} ${y} A${r} ${r * .8} 0 0 1 ${x + r} ${y}Z"/><path class="shade-flat" d="M${x} ${y - r * .8} A${r} ${r * .8} 0 0 1 ${x + r} ${y} L${x} ${y}Z"/>
          <path class="groove" d="M${x - r * .7} ${y - r * .2} q${r * .2} ${-r * .3} ${r * .4} 0 t${r * .4} 0 t${r * .4} 0 M${x - r * .5} ${y - r * .5} q${r * .2} ${-r * .2} ${r * .4} 0 t${r * .4} 0"/>`;
    }
    // A sea anemone: soft tentacles waving.
    function anemone(x, y, s, i = 0) {
        const t = Array.from({ length: 9 }, (_, k) => {
            const a = -150 + k * 15, r = (a * Math.PI) / 180;
            return `M${x + Math.cos(r) * 14 * s} ${y - 10 * s} q${Math.cos(r) * 20 * s} ${-20 * s} ${Math.cos(r) * 34 * s} ${Math.sin(r) * 40 * s}`;
        }).join(' ');
        return `<rect class="f-flower ol" x="${x - 18 * s}" y="${y - 16 * s}" width="${36 * s}" height="${16 * s}" rx="${6 * s}"/>
          <g class="sway" style="--d:${5 + i % 3}s"><path class="tentacle" style="stroke-width:${9 * s}" d="${t}"/></g>`;
    }
    function starfish(x, y, s, turn = 0) {
        const pts = Array.from({ length: 10 }, (_, k) => {
            const r = (k % 2 ? 9 : 24) * s, a = (k * 36 - 90 + turn) * Math.PI / 180;
            return `${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r * .6).toFixed(1)}`;
        });
        return `<path class="f-sun ol" d="M${pts.join(' L')}Z"/>`;
    }
    function shells(pts) {
        return pts.map(([x, y]) => `<path class="f-cloud ol" d="M${x - 12} ${y} Q${x} ${y - 22} ${x + 12} ${y}Z"/><path class="groove" d="M${x} ${y} L${x} ${y - 14} M${x - 6} ${y} L${x - 4} ${y - 12} M${x + 6} ${y} L${x + 4} ${y - 12}"/>`).join('');
    }
    Object.assign(SceneDraw, { underwater, farReef, sand, seaweed, kelp, coral, brainCoral, anemone, starfish, shells });

    // Marks for the empty places underwater: bubbles where a swimmer can come, a shell on the seabed.
    const WATER_MARKS = {
        swim: [[44, 58, 5], [56, 50, 4], [48, 41, 3.2]].map(([x, y, r]) => `<circle class="p-bubble o" cx="${x}" cy="${y}" r="${r}"/>`).join(''),
        seabed: `<path class="p-shell o" d="M36 62 Q50 38 64 62Z"/><path class="p-twig" d="M50 62 V46 M43 62 L45 49 M57 62 L55 49"/>`,
    };
    SceneDraw.WATER_MARKS = WATER_MARKS;

    const { cloud, skyAndSun, shine, rock, tufts } = SceneDraw;
    const UNDERWATER = ['bubbles', 'current', 'sunbeams', 'glow'];

    SceneArt.ocean = {
        noun: 'animals',
        move: 'swim',
        fx: 'bubble',
        animals: {
            Dolphin:    { habitat: 'swim',   w: 12,  face: 'l', foot: 55 },
            Whale:      { habitat: 'swim',   w: 22,  face: 'l', foot: 55 },
            Shark:      { habitat: 'swim',   w: 14,  face: 'r', foot: 52 },
            Seal:       { habitat: 'swim',   w: 10,  face: 'r', foot: 55 },
            Penguin:    { habitat: 'swim',   w: 6.5, face: 'f', foot: 55 },
            'Sea Otter':{ habitat: 'swim',   w: 9,   face: 'l', foot: 55 },
            Turtle:     { habitat: 'swim',   w: 11,  face: 'l', foot: 55 },
            Jellyfish:  { habitat: 'swim',   w: 8,   face: 'f', foot: 55 },
            Clownfish:  { habitat: 'swim',   w: 7,   face: 'r', foot: 55, src: 'fish/clownfish.svg' },
            Squid:      { habitat: 'swim',   w: 7,   face: 'f', foot: 55 },
            Pufferfish: { habitat: 'swim',   w: 7.5, face: 'l', foot: 55 },
            Crab:       { habitat: 'seabed', w: 7,   face: 'f', foot: 77.5, move: 'walk' },
            Lobster:    { habitat: 'seabed', w: 7,   face: 'l', foot: 50,   move: 'walk', turn: -90 },   // drawn from above, head up
            Octopus:    { habitat: 'seabed', w: 9,   face: 'f', foot: 81,   move: 'walk' },
            Shrimp:     { habitat: 'seabed', w: 6,   face: 'l', foot: 89.5, move: 'walk' },
            Coral:      { habitat: 'seabed', w: 8,   face: 'f', foot: 90.5, move: 'pop' },
        },
        switchCast: ['Dolphin', 'Whale', 'Turtle', 'Octopus', 'Crab', 'Shark'],
        weathers: UNDERWATER,
        marks: WATER_MARKS,
        markWords: { swim: 'bubbles in the water', seabed: 'a shell on the seabed' },

        scenes: {
            shore: {
                name: '🏖️ Seashore',
                track: 'seashore',
                fx: 'note',
                weathers: ['rain', 'storm', 'wind', 'fog', 'rainbow'],
                windCarries: 'sand',
                // Above the water here: on the beach, on the rocks, or at the surface
                cast: {
                    Seal:       { habitat: 'perch',  foot: 86, move: 'climb' },      // swims to the rock and hauls up onto it
                    Penguin:    { habitat: 'ground', foot: 89.8, move: 'walk' },
                    Crab:       { habitat: 'ground' },
                    Turtle:     { habitat: 'ground', foot: 78.5, move: 'walk' },
                    'Sea Otter':{ habitat: 'water',  foot: 62, move: 'surface' },
                    Dolphin:    { habitat: 'water',  foot: 62, move: 'surface' },
                    Whale:      { habitat: 'water',  w: 16, foot: 46, move: 'surface' },
                    Shark:      { habitat: 'water',  foot: 47, move: 'surface' },
                },
                switchCast: ['Dolphin', 'Seal', 'Crab', 'Whale', 'Turtle', 'Penguin'],
                marks: {
                    perch: `<path class="p-leaf o" d="M34 62 Q40 44 50 58 Q56 42 66 62Z"/>`,
                    ground: `<path class="p-starfish o" d="M50 44 L54 55 L66 56 L56 62 L60 72 L50 65 L40 72 L44 62 L34 56 L46 55Z"/>`,
                    water: `<ellipse class="p-foam" cx="50" cy="60" rx="26" ry="6"/><ellipse class="p-foam" cx="50" cy="60" rx="14" ry="3"/>`,
                },
                markWords: { perch: 'seaweed on the rocks', ground: 'a starfish on the sand', water: 'a ripple on the sea' },
                places: { perch: 'on the rocks', ground: 'on the beach', water: 'in the sea' },
                residents: ['Crab', 'Seal'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-shore', 1250)}
                  ${cloud(0, 140, .9)}${cloud(1, 220, .7)}${cloud(2, 100, .5)}
                  <path class="f-hill ol" d="M1180 500 Q1260 420 1380 430 Q1480 440 1610 470 L1610 500Z"/>
                  <rect class="f-cloud ol" x="1330" y="370" width="30" height="80"/><rect class="f-flower" x="1330" y="390" width="30" height="16"/><path class="f-flower ol" d="M1322 372 L1345 348 L1368 372Z"/>
                  <rect class="f-pond ol" x="-10" y="496" width="1620" height="420"/>
                  <rect class="light-glint" x="-10" y="496" width="1620" height="140"/>
                  ${[560, 630, 720, 820].map((y, i) => `<path class="wave" d="M${-10 + i * 40} ${y} ${Array.from({ length: 9 }, (_, k) => `q50 -14 100 0 t100 0`).join(' ')}" style="animation-delay:${-i * 1.5}s"/>`).join('')}
                  ${shine([[600, 540, 60], [900, 600, 50], [1300, 580, 44], [700, 680, 40]])}
                  <path class="f-rock ol" d="M1120 760 L1150 650 Q1200 600 1260 612 L1320 600 Q1400 596 1440 640 L1480 760Z"/><path class="shade-side" d="M1120 760 L1150 650 Q1200 600 1260 612 L1320 600 Q1400 596 1440 640 L1480 760Z"/>
                  <ellipse class="ring" cx="1300" cy="760" rx="200" ry="16"/>
                  <path class="f-lawn ol" d="M-10 600 C 250 610 520 690 660 780 C 720 820 760 870 780 910 L-10 910Z"/>
                  <path class="foam" d="M-10 604 C 250 614 520 694 660 784 C 720 824 760 874 780 910"/>
                  ${shells([[120, 700], [300, 820], [460, 760], [200, 880]])}${starfish(380, 870, 1, 10)}
                  ${tufts([[40, 640], [80, 660]])}
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 76.5, y: 67.8, up: [74, 84] }, { habitat: 'perch', x: 84, y: 67.2, up: [74, 84] },
                    { habitat: 'water', x: 50, y: 64 }, { habitat: 'water', x: 64, y: 58 }, { habitat: 'water', x: 58, y: 80 },
                    { habitat: 'water', x: 82, y: 92 },
                    { habitat: 'ground', x: 16, y: 78 }, { habitat: 'ground', x: 28, y: 88 }, { habitat: 'ground', x: 40, y: 96 },
                    { habitat: 'ground', x: 15, y: 94 },
                ],
                splashes: [[46, 62], [56, 70], [66, 60], [60, 80], [74, 86], [88, 90]],
            },

            reef: {
                name: '🪸 Coral reef',
                track: 'reef',
                cast: ['Clownfish', 'Pufferfish', 'Squid', 'Jellyfish', 'Turtle', 'Shark', 'Dolphin', 'Octopus', 'Crab', 'Lobster', 'Shrimp', 'Coral'],
                switchCast: ['Clownfish', 'Turtle', 'Octopus', 'Jellyfish', 'Pufferfish', 'Shark'],
                places: { swim: 'in the water', seabed: 'on the seabed' },
                residents: ['Clownfish', 'Crab'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${underwater('g-reef')}
                  ${farReef(620)}
                  ${sand(770)}
                  ${[[60, 800, 220, 'f-leaf'], [1540, 790, 240, 'f-leaf2'], [700, 780, 150, 'f-leaf2'], [1000, 790, 170, 'f-leaf']].map(([x, y, h, c], i) => seaweed(x, y, h, c, i)).join('')}
                  ${coral(200, 800, 1.3, 'c1')}${coral(330, 790, .9, 'c2')}${brainCoral(120, 820, 70)}${anemone(430, 820, 1.2, 1)}
                  ${coral(1300, 800, 1.2, 'c2')}${coral(1440, 800, 1, 'c1')}${brainCoral(1190, 820, 60)}${anemone(1100, 836, 1, 2)}
                  ${rock(560, 830, 70, 30)}${rock(880, 850, 60, 24)}
                  ${shells([[640, 870], [980, 880]])}${starfish(760, 860, 1, 20)}
                </svg>`,
                spots: [
                    { habitat: 'swim', x: 22, y: 30 }, { habitat: 'swim', x: 40, y: 46 }, { habitat: 'swim', x: 54, y: 26 },
                    { habitat: 'swim', x: 64, y: 52 }, { habitat: 'swim', x: 79, y: 32 }, { habitat: 'swim', x: 30, y: 62 },
                    { habitat: 'swim', x: 82, y: 60 },
                    { habitat: 'seabed', x: 36, y: 92 }, { habitat: 'seabed', x: 50, y: 95 }, { habitat: 'seabed', x: 62, y: 91 },
                    { habitat: 'seabed', x: 76, y: 94 },
                ],
                splashes: [],
            },

            kelp: {
                name: '🌿 Kelp forest',
                track: 'kelp',
                cast: ['Whale', 'Dolphin', 'Shark', 'Seal', 'Penguin', 'Sea Otter', 'Turtle', 'Jellyfish', 'Squid', 'Octopus', 'Crab', 'Lobster'],
                switchCast: ['Whale', 'Seal', 'Sea Otter', 'Dolphin', 'Penguin', 'Octopus'],
                places: { swim: 'in the water', seabed: 'on the rocks' },
                residents: ['Sea Otter', 'Seal'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${underwater('g-kelp')}
                  ${farReef(560)}
                  ${[[180, 900, 760], [420, 900, 640], [1180, 900, 700], [1420, 900, 780], [820, 900, 520]].map(([x, y, h], i) => kelp(x, y, h, i)).join('')}
                  ${sand(800)}
                  ${rock(260, 840, 150, 60)}${rock(700, 860, 110, 40)}${rock(1240, 846, 170, 64)}${rock(1520, 860, 90, 40)}
                  ${[[120, 820, 120], [1000, 830, 110], [1560, 820, 140]].map(([x, y, h], i) => seaweed(x, y, h, 'f-leaf2', i)).join('')}
                  ${starfish(560, 880, 1, 30)}${shells([[930, 880], [1100, 890]])}
                </svg>`,
                spots: [
                    { habitat: 'swim', x: 24, y: 32 }, { habitat: 'swim', x: 42, y: 22 }, { habitat: 'swim', x: 58, y: 38 },
                    { habitat: 'swim', x: 76, y: 24 }, { habitat: 'swim', x: 36, y: 56 }, { habitat: 'swim', x: 64, y: 62 },
                    { habitat: 'swim', x: 84, y: 50 },
                    { habitat: 'seabed', x: 18, y: 88 }, { habitat: 'seabed', x: 44, y: 94 }, { habitat: 'seabed', x: 60, y: 92 },
                    { habitat: 'seabed', x: 80, y: 90 },
                ],
                splashes: [],
            },
        },
    };
})();
