/* ── SAFARI ANIMALS: Savanna, Waterhole and Jungle ── */
// See art.js for how a theme is laid out. The lion's picture is only a head, so it pops up
// from behind tall grass or a rock (`hide`) and sits in front of it. Each scene has its own
// animals (`cast`): no camel in the jungle, no gorilla on the savanna.
SceneArt.safari = (() => {
    const { ball, trunk, cloud, skyAndSun, branch, shine, tufts, reeds, rock } = SceneDraw;

    // An acacia: a forked trunk and a wide, flat top.
    function acacia(x, y, s, far = false) {
        if (far) return `<g opacity=".7"><path class="f-trunk" d="M${x - 3 * s} ${y} L${x - 2 * s} ${y - 40 * s} L${x - 26 * s} ${y - 62 * s} L${x - 22 * s} ${y - 65 * s} L${x} ${y - 46 * s} L${x + 22 * s} ${y - 66 * s} L${x + 26 * s} ${y - 62 * s} L${x + 3 * s} ${y - 40 * s} L${x + 4 * s} ${y}Z"/>
            <ellipse class="f-leaf" cx="${x}" cy="${y - 70 * s}" rx="${60 * s}" ry="${13 * s}"/></g>`;
        return `${trunk(`M${x - 22 * s} ${y} L${x - 14 * s} ${y - 190 * s} Q${x - 60 * s} ${y - 260 * s} ${x - 110 * s} ${y - 300 * s} L${x - 92 * s} ${y - 312 * s} Q${x - 30 * s} ${y - 270 * s} ${x} ${y - 225 * s} Q${x + 40 * s} ${y - 280 * s} ${x + 100 * s} ${y - 318 * s} L${x + 114 * s} ${y - 302 * s} Q${x + 50 * s} ${y - 250 * s} ${x + 16 * s} ${y - 180 * s} L${x + 22 * s} ${y}Z`)}
            <g class="sway" style="--d:13s"><ellipse class="f-leaf ol" cx="${x}" cy="${y - 318 * s}" rx="${250 * s}" ry="${50 * s}"/>
            <ellipse class="f-leaf2 ol" cx="${x - 20 * s}" cy="${y - 342 * s}" rx="${190 * s}" ry="${38 * s}"/><ellipse class="shade-belly" cx="${x}" cy="${y - 318 * s}" rx="${250 * s}" ry="${50 * s}"/></g>`;
    }
    // A termite mound: a tall lumpy cone of red earth.
    function mound(x, y, h) {
        const d = `M${x - h * .45} ${y} Q${x - h * .3} ${y - h * .5} ${x - h * .12} ${y - h} Q${x} ${y - h * 1.08} ${x + h * .08} ${y - h * .9} Q${x + h * .22} ${y - h * .45} ${x + h * .42} ${y}Z`;
        return `<path class="f-rock ol" d="${d}"/><path class="shade-side" d="${d}"/>`;
    }
    // A doum palm: a leaning trunk and a fan of fronds.
    function palm(x, y, lean, s) {
        const tx = x + lean, ty = y - 330 * s;
        const fronds = [-150, -115, -80, -45, -10, 20].map((a, i) => {
            const r = (a * Math.PI) / 180, len = (120 + (i % 2) * 30) * s;
            const ex = tx + Math.cos(r) * len, ey = ty + Math.sin(r) * len * .6 + 40 * s;
            return `<path class="${i % 2 ? 'f-leaf2' : 'f-leaf'} ol" d="M${tx} ${ty} Q${(tx + ex) / 2} ${ty + (ey - ty) / 2 - 40 * s} ${ex} ${ey} Q${(tx + ex) / 2 + 6} ${ty + (ey - ty) / 2 - 16 * s} ${tx} ${ty + 8}Z"/>`;
        }).join('');
        return `${trunk(`M${x - 14 * s} ${y} Q${x + lean * .3} ${y - 180 * s} ${tx - 8 * s} ${ty} L${tx + 8 * s} ${ty} Q${x + lean * .3 + 22 * s} ${y - 180 * s} ${x + 14 * s} ${y}Z`)}
            <g class="sway" style="--d:9s">${fronds}</g>`;
    }
    // A big jungle leaf on a stem, pointing `turn` degrees.
    function bigLeaf(x, y, len, turn, cls = 'f-leaf') {
        return `<g transform="translate(${x} ${y}) rotate(${turn})"><path class="${cls} ol" d="M0 0 Q${len * .5} ${-len * .42} ${len} 0 Q${len * .5} ${len * .42} 0 0Z"/>
            <path class="vein" d="M0 0 L${len * .92} 0 M${len * .3} 0 l${len * .12} ${-len * .12} M${len * .55} 0 l${len * .1} ${-len * .1} M${len * .3} 0 l${len * .12} ${len * .12} M${len * .55} 0 l${len * .1} ${len * .1}"/></g>`;
    }
    function vines(pts) {
        return `<g class="sway" style="--d:10s"><path class="vine" d="${pts.map(([x, y, len]) => `M${x} ${y} q${len * .12} ${len * .5} 0 ${len}`).join(' ')}"/></g>`;
    }

    return {
        noun: 'animals',
        move: 'walk',
        fx: 'note',
        animals: {
            Monkey:    { habitat: 'perch',  w: 9,   face: 'l', foot: 87.5, move: 'climb' },
            Eagle:     { habitat: 'perch',  w: 9.5, face: 'l', foot: 90,   move: 'fly' },
            Leopard:   { habitat: 'perch',  w: 12,  face: 'l', foot: 78.5, move: 'climb' },
            Chameleon: { habitat: 'perch',  w: 8,   face: 'l', foot: 75.3, move: 'climb' },
            Lion:      { habitat: 'hide',   w: 8.5, face: 'f', foot: 95.5, move: 'peek' },
            Hippo:     { habitat: 'water',  w: 13,  face: 'r', foot: 56,   move: 'surface' },
            Crocodile: { habitat: 'water',  w: 13,  face: 'r', foot: 66,   move: 'surface' },
            Flamingo:  { habitat: 'water',  w: 8,   face: 'l', foot: 80,   move: 'fly' },
            Elephant:  { habitat: 'ground', w: 16,  face: 'l', foot: 82.3 },
            Giraffe:   { habitat: 'ground', w: 13,  face: 'l', foot: 93.3 },
            Zebra:     { habitat: 'ground', w: 12,  face: 'l', foot: 86.5 },
            Rhino:     { habitat: 'ground', w: 13,  face: 'l', foot: 83 },
            Gorilla:   { habitat: 'ground', w: 10,  face: 'l', foot: 88 },
            Camel:     { habitat: 'ground', w: 13,  face: 'l', foot: 84.3 },
            Warthog:   { habitat: 'ground', w: 10,  face: 'l', foot: 80.8, src: 'scenes/pictures/warthog.svg' },
            Scorpion:  { habitat: 'ground', w: 5.5, face: 'l', foot: 50, turn: -90 },
        },
        switchCast: ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Hippo'],
        weathers: ['rain', 'storm', 'wind', 'dust', 'fog', 'rainbow'],     // no snow on the savanna
        covers: {
            grass: `<g class="sway" style="--d:7s">${Array.from({ length: 17 }, (_, i) => {
                const x = 14 + i * 10.5, top = 6 + ((i * 37) % 22), lean = ((i * 53) % 17) - 8;
                return `<path class="${i % 3 ? 'f-hay' : 'f-hay2'} ol" d="M${x - 9} 100 Q${x - 4} 50 ${x + lean} ${top} Q${x + 3} 52 ${x + 9} 100Z"/>`;
            }).join('')}<path class="shade-flat" d="M6 72 H194 V100 H6Z"/></g>`,
            rock: `<path class="f-rock ol" d="M8 100 Q2 46 52 24 Q100 6 150 22 Q198 44 192 100Z"/><path class="shade-side" d="M8 100 Q2 46 52 24 Q100 6 150 22 Q198 44 192 100Z"/>
                   <path class="light-flat" d="M40 38 Q90 14 140 30 Q100 22 60 44Z"/>`,
        },
        marks: {
            perch: [[40, 56], [55, 59], [63, 54]].map(([x, y]) => `<circle class="p-fruit o" cx="${x}" cy="${y}" r="6"/><path class="p-twig" d="M${x} ${y - 6} v-5"/>`).join(''),
            ground: [[38, 60, -12], [60, 57, 14]].map(([x, y, t]) => `<g transform="rotate(${t} ${x} ${y})"><ellipse class="p-print" cx="${x}" cy="${y}" rx="8" ry="6"/>
                <circle class="p-print" cx="${x - 8}" cy="${y - 8}" r="2.6"/><circle class="p-print" cx="${x - 2}" cy="${y - 11}" r="2.6"/><circle class="p-print" cx="${x + 5}" cy="${y - 10}" r="2.6"/><circle class="p-print" cx="${x + 10}" cy="${y - 5}" r="2.6"/></g>`).join(''),
            hide: `<ellipse class="p-print" cx="50" cy="58" rx="10" ry="8"/><circle class="p-print" cx="40" cy="47" r="3.4"/><circle class="p-print" cx="47" cy="43" r="3.4"/><circle class="p-print" cx="55" cy="43" r="3.4"/><circle class="p-print" cx="62" cy="47" r="3.4"/>`,
        },
        markWords: { perch: 'figs on a branch', hide: 'a paw print by the grass', ground: 'footprints on the ground', water: 'a water lily' },

        scenes: {
            savanna: {
                name: '🌅 Savanna',
                track: 'savanna',
                cast: ['Monkey', 'Eagle', 'Leopard', 'Chameleon', 'Lion', 'Hippo', 'Crocodile', 'Flamingo', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Camel', 'Warthog', 'Scorpion'],
                places: { perch: 'on the acacias', hide: 'in the tall grass', ground: 'on the plain', water: 'in the waterhole' },
                residents: ['Giraffe', 'Zebra'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-savanna', 1200)}
                  ${cloud(0, 150, .8)}${cloud(2, 100, .5)}
                  <path class="f-hill ol" d="M760 580 L1020 330 Q1070 296 1120 330 L1420 580Z"/>
                  <path class="shade-flat" d="M1070 310 Q1095 314 1120 330 L1420 580 L1070 580Z"/>
                  <path class="f-cloud ol" d="M968 380 L1020 330 Q1070 296 1120 330 L1176 384 L1150 372 L1122 392 L1094 374 L1066 394 L1038 376 L1004 392Z"/>
                  <path class="f-hill" opacity=".7" d="M-10 580 C 300 540 600 560 900 548 C 1200 536 1400 556 1610 546 L1610 610 L-10 610Z"/>
                  ${acacia(560, 592, 1, true)}${acacia(700, 596, .7, true)}${acacia(1480, 590, .9, true)}${acacia(90, 594, .8, true)}
                  <path class="f-lawn ol" d="M-10 596 C 400 578 1000 606 1610 586 L1610 910 L-10 910Z"/>
                  <path class="light-flat" d="M-10 596 C 400 578 1000 606 1610 586 L1610 612 C 1000 632 400 604 -10 622Z"/>
                  ${mound(1010, 700, 130)}
                  <ellipse class="f-pond ol" cx="1270" cy="836" rx="250" ry="54"/>
                  <ellipse class="light-flat" cx="1270" cy="846" rx="230" ry="40"/>
                  ${shine([[1120, 830, 44], [1350, 858, 36]])}
                  <ellipse class="ring" cx="1230" cy="838" rx="74" ry="13"/>
                  ${tufts([[300, 700], [520, 860], [760, 720], [880, 880], [140, 820], [620, 780], [940, 780]])}
                  ${acacia(250, 910, 1.3)}
                  ${trunk('M1398 910 L1406 560 L1426 560 L1436 910Z')}
                  ${branch(1410, 600, 1180, 566, 16)}
                  <g class="sway" style="--d:12s"><ellipse class="f-leaf ol" cx="1420" cy="548" rx="200" ry="40"/><ellipse class="f-leaf2 ol" cx="1400" cy="528" rx="150" ry="30"/><ellipse class="shade-belly" cx="1420" cy="548" rx="200" ry="40"/></g>
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 19, y: 46.6, up: [15.6, 90] }, { habitat: 'perch', x: 26, y: 48.3, up: [15.6, 90] },
                    { habitat: 'perch', x: 76, y: 64.4, up: [88.5, 84] }, { habitat: 'perch', x: 82, y: 65.3, up: [88.5, 84] },
                    { habitat: 'hide', x: 44, y: 72, cover: 'grass' }, { habitat: 'hide', x: 63, y: 71, cover: 'grass' },
                    { habitat: 'ground', x: 17, y: 94 }, { habitat: 'ground', x: 31, y: 85 }, { habitat: 'ground', x: 48, y: 95 },
                    { habitat: 'ground', x: 56, y: 83 },
                    { habitat: 'water', x: 73, y: 94 }, { habitat: 'water', x: 85, y: 92.5 },
                ],
                splashes: [[70, 92], [75, 95], [80, 91], [85, 94], [90, 92]],
            },

            waterhole: {
                name: '💧 Waterhole',
                track: 'waterhole',
                cast: ['Monkey', 'Eagle', 'Leopard', 'Lion', 'Hippo', 'Crocodile', 'Flamingo', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Warthog'],
                places: { perch: 'in the old tree', hide: 'behind the grass and the rock', ground: 'by the water', water: 'in the waterhole' },
                residents: ['Hippo', 'Elephant'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-waterhole', 420)}
                  ${cloud(0, 140, .9)}${cloud(1, 210, .7)}
                  <path class="f-hill ol" d="M-10 540 C 300 480 600 520 900 500 C 1200 480 1400 510 1610 490 L1610 620 L-10 620Z"/>
                  ${acacia(700, 596, .8, true)}${acacia(860, 592, 1, true)}${acacia(1250, 598, .7, true)}
                  <path class="f-lawn ol" d="M-10 590 C 400 574 1000 600 1610 582 L1610 910 L-10 910Z"/>
                  <path class="light-flat" d="M-10 590 C 400 574 1000 600 1610 582 L1610 606 C 1000 624 400 598 -10 614Z"/>
                  <ellipse class="f-rock ol" cx="800" cy="768" rx="560" ry="126"/>
                  <ellipse class="f-pond ol" cx="800" cy="770" rx="520" ry="108"/>
                  <ellipse class="light-flat" cx="800" cy="786" rx="490" ry="84"/>
                  ${shine([[520, 740, 60], [900, 800, 50], [700, 836, 40], [1050, 750, 36], [640, 710, 30]])}
                  <ellipse class="ring" cx="620" cy="770" rx="110" ry="16"/><ellipse class="ring" cx="980" cy="780" rx="90" ry="14" style="animation-delay:-3s"/>
                  ${reeds(1250, 760, 4, 18)}
                  ${palm(1440, 910, -40, 1)}${palm(1540, 900, 30, .8)}
                  ${tufts([[260, 640], [1320, 650], [1460, 870], [180, 880], [420, 890]])}
                  ${trunk('M120 910 L150 360 Q162 330 176 360 L206 910Z')}
                  ${branch(170, 420, 470, 370)}${branch(162, 560, 380, 530, 16)}
                  ${branch(150, 380, 60, 330, 14)}
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 20, y: 43.9, up: [10.2, 88] }, { habitat: 'perch', x: 26, y: 42.1, up: [10.2, 88] }, { habitat: 'perch', x: 18, y: 60.3, up: [10.2, 88] },
                    { habitat: 'hide', x: 45, y: 63, cover: 'grass' }, { habitat: 'hide', x: 68, y: 63, cover: 'rock' },
                    { habitat: 'ground', x: 30, y: 70 }, { habitat: 'ground', x: 16, y: 95 }, { habitat: 'ground', x: 83, y: 80 },
                    { habitat: 'ground', x: 80, y: 97 },
                    { habitat: 'water', x: 36, y: 84 }, { habitat: 'water', x: 52, y: 89 }, { habitat: 'water', x: 64, y: 81 },
                ],
                splashes: [[34, 86], [42, 92], [50, 84], [58, 94], [66, 88], [72, 82]],
            },

            jungle: {
                name: '🌴 Jungle',
                track: 'jungle',
                cast: ['Monkey', 'Eagle', 'Leopard', 'Chameleon', 'Hippo', 'Crocodile', 'Elephant', 'Gorilla', 'Warthog'],
                switchCast: ['Gorilla', 'Monkey', 'Chameleon', 'Leopard', 'Elephant', 'Crocodile'],
                weathers: ['rain', 'storm', 'wind', 'fog', 'rainbow'],           // no dust in the rainforest
                places: { perch: 'on the branches', ground: 'on the forest floor', water: 'in the river' },
                residents: ['Monkey', 'Gorilla'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-jungle', 1000)}
                  ${[[60, 26], [300, 22], [520, 30], [760, 24], [980, 28], [1180, 22], [1400, 30], [1560, 24]].map(([x, w]) =>
                    `<rect class="f-hill" x="${x}" y="120" width="${w}" height="640" rx="${w / 2}"/>`).join('')}
                  ${[[40, 160, 140], [260, 120, 150], [500, 170, 130], [740, 120, 160], [980, 170, 140], [1200, 130, 150], [1420, 170, 140], [1600, 130, 140]].map(([x, y, r]) =>
                    `<circle class="f-leaf2" cx="${x}" cy="${y}" r="${r}" opacity=".7"/>`).join('')}
                  ${[[100, 700, 70], [320, 690, 80], [560, 700, 64], [800, 690, 76], [1040, 694, 70], [1300, 690, 80], [1540, 700, 70]].map(([x, y, r]) => ball('f-leaf', x, y, r)).join('')}
                  <path class="f-lawn ol" d="M-10 700 C 300 670 600 712 900 690 C 1200 670 1400 700 1610 684 L1610 910 L-10 910Z"/>
                  <path class="light-flat" d="M-10 700 C 300 670 600 712 900 690 C 1200 670 1400 700 1610 684 L1610 708 C 1400 724 1200 694 900 714 C 600 736 300 694 -10 724Z"/>
                  <path class="f-pond ol" d="M720 910 C 860 830 1060 810 1250 812 C 1420 816 1500 780 1610 770 L1610 910Z"/>
                  <path class="shade-flat" d="M720 910 C 860 830 1060 810 1250 812 C 1420 816 1500 780 1610 770 L1610 792 C 1500 802 1420 836 1250 832 C 1060 830 880 846 764 910Z"/>
                  ${shine([[950, 870, 40], [1150, 844, 54], [1440, 826, 36]])}
                  <ellipse class="ring" cx="1090" cy="864" rx="70" ry="12"/>
                  ${bigLeaf(40, 900, 180, -60)}${bigLeaf(560, 910, 150, -120, 'f-leaf2')}${bigLeaf(640, 910, 170, -70)}${bigLeaf(1600, 760, 150, -150, 'f-leaf2')}
                  ${trunk('M170 910 L190 -10 L260 -10 L270 910Z')}
                  ${branch(250, 400, 700, 340)}${branch(240, 220, 480, 190, 16)}
                  ${trunk('M1440 910 L1452 -10 L1510 -10 L1522 910Z')}
                  ${branch(1448, 300, 1060, 262, 18)}${branch(1452, 540, 1200, 516, 16)}
                  ${vines([[360, -10, 330], [560, -10, 260], [860, -10, 380], [1100, -10, 300], [1300, -10, 240]])}
                  <g class="sway" style="--d:12s">${[[60, 10, 150], [240, -20, 140], [420, 20, 130], [640, -20, 150], [860, 0, 130], [1060, -20, 150], [1260, 10, 130], [1460, -20, 150], [1620, 20, 120]].map(([x, y, r], i) =>
                    ball(i % 2 ? 'f-leaf2' : 'f-leaf', x, y, r)).join('')}</g>
                </svg>`,
                spots: [
                    { habitat: 'perch', x: 26, y: 42.5, up: [13.75, 88] }, { habitat: 'perch', x: 37, y: 40.6, up: [13.75, 88] }, { habitat: 'perch', x: 25, y: 23, up: [13.75, 88] },
                    { habitat: 'perch', x: 72, y: 30.5, up: [92.6, 82] }, { habitat: 'perch', x: 81, y: 31.9, up: [92.6, 82] }, { habitat: 'perch', x: 79, y: 58.4, up: [92.6, 82] },
                    { habitat: 'ground', x: 20, y: 92 }, { habitat: 'ground', x: 34, y: 84 }, { habitat: 'ground', x: 48, y: 92 },
                    { habitat: 'ground', x: 58, y: 82 },
                    { habitat: 'water', x: 72, y: 95 }, { habitat: 'water', x: 84, y: 93 },
                ],
                splashes: [[56, 97.5], [65.5, 94.5], [74, 96], [84.5, 92.5], [92.5, 90]],
            },
        },
    };
})();
