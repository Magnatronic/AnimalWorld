/* ── POLAR ANIMALS: Sea ice, Snowy forest and Tundra ── */
// See art.js for how a theme is laid out. The arctic fox and moose pictures are only heads,
// so they pop up from behind a snowdrift or a block of ice (`hide`) and sit in front of it.
// Here --lawn is snow and --rock is ice (scenes.css).
SceneArt.arctic = (() => {
    const { ball, trunk, cloud, skyAndSun, branch, shine, rock } = SceneDraw;

    // Far mountains with snowy tops.
    function mountains(y) {
        const peaks = [[-10, y + 20], [150, y - 80], [260, y - 30], [420, y - 150], [560, y - 40], [720, y - 110], [880, y - 10], [1040, y - 130], [1200, y - 40], [1360, y - 120], [1500, y - 50], [1610, y - 90]];
        const d = 'M' + peaks.map(p => p.join(' ')).join(' L') + ` L1610 ${y + 80} L-10 ${y + 80}Z`;
        const caps = peaks.slice(1, -1).filter((p, i) => i % 2 === 0).map(([x, py]) => {
            const h = y - py;
            return `<path class="f-cloud" d="M${x - h * .45} ${py + h * .38} L${x} ${py} L${x + h * .45} ${py + h * .38} L${x + h * .2} ${py + h * .3} L${x} ${py + h * .42} L${x - h * .2} ${py + h * .3}Z"/>`;
        }).join('');
        return `<path class="f-hill ol" d="${d}"/>${caps}`;
    }
    // An iceberg or ice block from its outline points, with a lit face and a shaded one.
    function ice(pts, glint = true) {
        const d = 'M' + pts.map(p => p.join(' ')).join(' L') + 'Z';
        return `<path class="f-rock ol" d="${d}"/><path class="shade-side" d="${d}"/>${glint ? `<path class="light-flat" d="${d}" transform="translate(0 0)" style="opacity:.6"/>` : ''}`;
    }
    // A snowy fir: dark tiers, each with snow along its top.
    function snowPine(x, y, s) {
        return `<rect class="f-trunk ol" x="${x - 7 * s}" y="${y - 30 * s}" width="${14 * s}" height="${32 * s}"/>` + [0, 1, 2, 3].map(i => {
            const w = (74 - i * 15) * s, base = y - (22 + i * 40) * s, top = base - 62 * s;
            return `<path class="f-leaf ol" d="M${x - w} ${base} L${x} ${top} L${x + w} ${base}Z"/>` +
                `<path class="f-lawn" d="M${x - w * .55} ${base - 22 * s} L${x} ${top} L${x + w * .55} ${base - 22 * s} Q${x + w * .2} ${base - 14 * s} ${x} ${base - 24 * s} Q${x - w * .2} ${base - 12 * s} ${x - w * .55} ${base - 22 * s}Z"/>`;
        }).join('');
    }
    // A branch with a ridge of snow along its top (animals stand on the snow).
    function snowyBranch(x1, y1, x2, y2, thick = 18) {
        return `${branch(x1, y1 + 6, x2, y2 + 6, thick)}<path class="f-lawn ol" d="M${x1} ${y1 + 8} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 - 6} ${x2} ${y2 + 7} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + 4} ${x1} ${y1 + 12}Z"/>`;
    }
    function drifts(pts) {
        return pts.map(([x, y, w]) => `<path class="f-lawn ol" d="M${x - w} ${y} Q${x - w * .4} ${y - w * .45} ${x} ${y - w * .38} Q${x + w * .5} ${y - w * .3} ${x + w} ${y}Z"/><path class="rim" d="M${x - w} ${y} Q${x - w * .4} ${y - w * .45} ${x} ${y - w * .38} Q${x + w * .5} ${y - w * .3} ${x + w} ${y}"/>`).join('');
    }

    return {
        noun: 'animals',
        move: 'walk',
        fx: 'note',
        animals: {
            'Snowy Owl':   { habitat: 'perch',  w: 8.5, face: 'f', foot: 86,   move: 'fly', src: 'scenes/pictures/snowy-owl.svg' },
            'Arctic Fox':  { habitat: 'hide',   w: 7,   face: 'f', foot: 94,   move: 'peek', src: 'scenes/pictures/arctic-fox.svg' },
            Moose:         { habitat: 'hide',   w: 8.5, face: 'f', foot: 89.5, move: 'peek' },
            Seal:          { habitat: 'water',  w: 10,  face: 'r', foot: 68,   move: 'surface' },
            Whale:         { habitat: 'water',  w: 16,  face: 'l', foot: 64,   move: 'surface' },
            'Polar Bear':  { habitat: 'ground', w: 15,  face: 'l', foot: 77.5 },
            Penguin:       { habitat: 'ground', w: 7,   face: 'f', foot: 89.8 },
            Reindeer:      { habitat: 'ground', w: 13,  face: 'l', foot: 94.3 },
            'Arctic Hare': { habitat: 'ground', w: 7.5, face: 'l', foot: 80.5, move: 'bound', src: 'scenes/pictures/arctic-hare.svg' },
        },
        switchCast: ['Polar Bear', 'Penguin', 'Seal', 'Arctic Fox', 'Snowy Owl', 'Whale'],
        weathers: ['snow', 'wind', 'fog', 'aurora'],
        windCarries: 'snow',       // no leaves up here: the wind blows fine snow
        covers: {
            drift: `<path class="f-lawn ol" d="M4 100 Q10 40 60 22 Q100 8 140 20 Q196 42 196 100Z"/><path class="shade-ball" d="M4 100 Q10 40 60 22 Q100 8 140 20 Q196 42 196 100Z"/>
                    <path class="rim" d="M4 100 Q10 40 60 22 Q100 8 140 20 Q196 42 196 100"/><path class="f-rock" opacity=".5" d="M20 100 Q60 80 110 86 Q160 92 190 100Z"/>`,
            ice: `<path class="f-rock ol" d="M12 100 L20 28 L70 14 L118 20 L182 30 L188 100Z"/><path class="shade-side" d="M12 100 L20 28 L70 14 L118 20 L182 30 L188 100Z"/>
                  <path class="light-flat" d="M28 34 L70 22 L116 28 L60 44Z"/><path class="f-lawn" d="M20 28 L70 14 L118 20 L182 30 Q120 24 70 22 Q40 26 20 32Z"/>`,
        },
        marks: {
            perch: `<path class="p-feather o" d="M34 62 Q44 36 70 40 Q56 56 34 62Z"/><path class="p-twig" d="M34 62 Q50 50 66 42"/>`,
            ground: [[38, 60, -12], [60, 57, 14]].map(([x, y, t]) => `<g transform="rotate(${t} ${x} ${y})"><ellipse class="p-print" cx="${x}" cy="${y}" rx="8" ry="6"/>
                <circle class="p-print" cx="${x - 8}" cy="${y - 8}" r="2.6"/><circle class="p-print" cx="${x - 2}" cy="${y - 11}" r="2.6"/><circle class="p-print" cx="${x + 5}" cy="${y - 10}" r="2.6"/><circle class="p-print" cx="${x + 10}" cy="${y - 5}" r="2.6"/></g>`).join(''),
            hide: [[40, 60, 7], [55, 62, 6], [48, 51, 6]].map(([x, y, r]) => `<circle class="p-snowball o" cx="${x}" cy="${y}" r="${r}"/>`).join(''),
            water: `<path class="p-floe o" d="M22 62 L30 55 L58 53 L78 57 L74 64 L40 67Z"/>`,
        },
        markWords: { perch: 'a feather on the branch', hide: 'snowballs by the drift', ground: 'paw prints in the snow', water: 'a little floe of ice' },

        scenes: {
            ice: {
                name: '🧊 Sea ice',
                track: 'seaice',
                cast: ['Snowy Owl', 'Arctic Fox', 'Seal', 'Whale', 'Polar Bear', 'Penguin', 'Arctic Hare'],
                places: { perch: 'on the iceberg', hide: 'behind the ice blocks', ground: 'on the ice', water: 'in the sea' },
                residents: ['Polar Bear', 'Seal'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-ice', 1250)}
                  ${cloud(0, 140, .8)}${cloud(1, 210, .6)}
                  ${mountains(470)}
                  <rect class="f-pond ol" x="-10" y="500" width="1620" height="300"/>
                  <rect class="light-glint" x="-10" y="500" width="1620" height="120"/>
                  ${ice([[980, 548], [1010, 470], [1060, 440], [1130, 452], [1190, 500], [1230, 548]], false)}
                  ${ice([[640, 530], [660, 500], [700, 492], [740, 510], [760, 530]], false)}
                  ${shine([[520, 580, 60], [860, 620, 50], [1300, 600, 44], [1000, 660, 40], [680, 650, 30]])}
                  <ellipse class="ring" cx="880" cy="640" rx="100" ry="12"/><ellipse class="ring" cx="1260" cy="620" rx="90" ry="11" style="animation-delay:-3s"/>
                  ${ice([[180, 700], [200, 590], [250, 520], [420, 520], [460, 580], [490, 700]])}
                  <path class="f-lawn ol" d="M-10 700 C 200 680 400 704 560 694 L600 712 C 800 732 1100 702 1250 716 C 1400 726 1500 700 1610 706 L1610 910 L-10 910Z"/>
                  <path class="shade-flat" d="M-10 700 C 200 680 400 704 560 694 L600 712 C 800 732 1100 702 1250 716 C 1400 726 1500 700 1610 706 L1610 722 C 1500 716 1400 742 1250 732 C 1100 718 800 748 600 728 L560 710 C 400 720 200 696 -10 716Z"/>
                  ${drifts([[140, 860, 90], [980, 880, 120], [1480, 820, 80]])}
                  <path class="f-rock ol" d="M1320 700 L1340 690 L1420 692 L1440 702 L1410 708 L1340 708Z"/>
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 18.5, y: 57.8 }, { habitat: 'perch', x: 24.5, y: 57.8 },
                    { habitat: 'hide', x: 44, y: 77, cover: 'ice' }, { habitat: 'hide', x: 70, y: 79, cover: 'drift' },
                    { habitat: 'water', x: 54, y: 69 }, { habitat: 'water', x: 70, y: 67 }, { habitat: 'water', x: 84, y: 69.5 },
                    { habitat: 'ground', x: 18, y: 93 }, { habitat: 'ground', x: 32, y: 86 }, { habitat: 'ground', x: 56, y: 93 },
                    { habitat: 'ground', x: 84, y: 91 },
                ],
                splashes: [[48, 66], [58, 72], [66, 64], [74, 70], [82, 66], [90, 71]],
            },

            forest: {
                name: '🌲 Snowy forest',
                track: 'snowforest',
                cast: ['Snowy Owl', 'Arctic Fox', 'Moose', 'Reindeer', 'Arctic Hare'],
                switchCast: ['Reindeer', 'Moose', 'Snowy Owl', 'Arctic Fox', 'Arctic Hare'],
                places: { perch: 'on the snowy branches', hide: 'behind the snowdrifts', ground: 'in the snow' },
                residents: ['Snowy Owl', 'Reindeer'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-taiga', 1300)}
                  ${cloud(0, 130, .8)}${cloud(2, 90, .6)}
                  <path class="f-hill ol" d="M-10 560 C 300 490 600 530 900 500 C 1200 470 1400 520 1610 500 L1610 660 L-10 660Z"/>
                  ${[[60, .9], [180, 1.1], [320, .8], [470, 1], [610, .9], [760, 1.2], [900, .85], [1050, 1.05], [1190, .9], [1330, 1.1], [1470, .95], [1590, 1]].map(([x, s], i) =>
                    `<g opacity=".75">${snowPine(x, 640 - (i % 2) * 10, s)}</g>`).join('')}
                  <path class="f-lawn ol" d="M-10 650 C 400 626 1000 660 1610 636 L1610 910 L-10 910Z"/>
                  <path class="shade-flat" d="M-10 650 C 400 626 1000 660 1610 636 L1610 646 C 1000 672 400 638 -10 662Z"/>
                  ${drifts([[260, 760, 110], [900, 860, 140], [1300, 770, 100]])}
                  ${trunk('M175 910 L195 -10 L255 -10 L262 910Z')}
                  ${snowyBranch(240, 430, 540, 398)}
                  ${trunk('M1418 910 L1428 -10 L1478 -10 L1488 910Z')}
                  ${snowyBranch(1420, 360, 1150, 330, 16)}
                  <g class="sway" style="--d:13s">${snowPine(220, 250, 1.6)}${snowPine(1450, 200, 1.5)}</g>
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 20, y: 46 }, { habitat: 'perch', x: 29, y: 44.6 },
                    { habitat: 'perch', x: 75, y: 36.8 }, { habitat: 'perch', x: 82, y: 38.1 },
                    { habitat: 'hide', x: 44, y: 76, cover: 'drift' }, { habitat: 'hide', x: 66, y: 74, cover: 'drift' },
                    { habitat: 'ground', x: 18, y: 93 }, { habitat: 'ground', x: 32, y: 86 }, { habitat: 'ground', x: 55, y: 93 },
                    { habitat: 'ground', x: 82, y: 91 },
                ],
                splashes: [],
            },

            tundra: {
                name: '❄️ Tundra',
                track: 'tundra',
                cast: ['Snowy Owl', 'Arctic Fox', 'Moose', 'Seal', 'Polar Bear', 'Reindeer', 'Arctic Hare'],
                switchCast: ['Polar Bear', 'Reindeer', 'Arctic Fox', 'Snowy Owl', 'Arctic Hare', 'Moose'],
                places: { perch: 'on the rocks', hide: 'behind the snowdrifts', ground: 'on the snow', water: 'in the ice hole' },
                residents: ['Arctic Hare', 'Reindeer'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-tundra', 380)}
                  ${cloud(1, 160, .7)}${cloud(2, 100, .5)}
                  ${mountains(520)}
                  <path class="f-lawn ol" d="M-10 590 C 300 556 600 590 900 572 C 1200 556 1400 580 1610 566 L1610 910 L-10 910Z"/>
                  <path class="rim" d="M-10 700 C 300 668 700 706 1000 686 C 1300 666 1450 694 1610 680"/>
                  <ellipse class="f-rock ol" cx="1110" cy="820" rx="330" ry="66"/>
                  <ellipse class="light-flat" cx="1080" cy="806" rx="250" ry="40"/>
                  <ellipse class="f-pond ol" cx="1150" cy="826" rx="150" ry="34"/>
                  ${shine([[1080, 824, 40], [1180, 836, 30]])}
                  <ellipse class="ring" cx="1150" cy="828" rx="60" ry="10"/>
                  ${rock(700, 640, 60, 24)}${rock(1450, 640, 70, 26)}
                  <path class="f-rock ol" d="M170 740 L200 600 L260 556 L390 560 L440 620 L460 740Z"/><path class="shade-side" d="M170 740 L200 600 L260 556 L390 560 L440 620 L460 740Z"/>
                  <path class="f-lawn" d="M200 600 L260 556 L390 560 L440 620 Q380 580 320 580 Q250 578 200 606Z"/>
                  ${drifts([[120, 880, 100], [620, 890, 130], [1500, 880, 90]])}
                  ${[[560, 700], [820, 690], [1330, 700], [300, 820]].map(([x, y]) => `<path class="grass" d="M${x - 5} ${y} q-4 -12 -12 -18 M${x} ${y} q2 -14 4 -24 M${x + 5} ${y} q6 -8 14 -12"/>`).join('')}
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 18, y: 61.9 }, { habitat: 'perch', x: 23.5, y: 62.2 },
                    { habitat: 'hide', x: 38, y: 73, cover: 'drift' }, { habitat: 'hide', x: 84, y: 71, cover: 'drift' },
                    { habitat: 'water', x: 66, y: 92 }, { habitat: 'water', x: 76, y: 93 },
                    { habitat: 'ground', x: 30, y: 90 }, { habitat: 'ground', x: 50, y: 86 }, { habitat: 'ground', x: 63, y: 72 },
                    { habitat: 'ground', x: 16, y: 95 },
                ],
                splashes: [[66, 91], [72, 93], [76, 91]],
            },
        },
    };
})();
