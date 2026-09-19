/* ── MINI BEASTS: Flower bed, Log pile and Veg patch ── */
// See art.js for how a theme is laid out. Drawn close up, so flowers and leaves are huge:
// flying minibeasts land on the flower heads (`flower`), crawlers sit on leaves (`leaf`) or the
// ground, the spider lets itself down on a thread (`thread`, move 'drop'), and the worm pops up
// out of the soil (`hide`, cover 'soil').
(() => {
    const { ball, trunk, cloud, skyAndSun, rock, toadstools, tufts } = SceneDraw;

    function stem(x, y1, y2, bend = 0) {
        return `<path class="stem-thick" d="M${x} ${y1} Q${x + bend} ${(y1 + y2) / 2} ${x} ${y2}"/>`;
    }
    // A daisy: white petals round a yellow middle; insects land at (x, y - r * .1).
    function daisy(x, ground, y, r, bend = 0) {
        const petals = Array.from({ length: 12 }, (_, i) => `<ellipse class="f-cloud ol" cx="${x}" cy="${y - r * .55}" rx="${r * .16}" ry="${r * .5}" transform="rotate(${i * 30} ${x} ${y})"/>`).join('');
        return `${stem(x, ground, y, bend)}<g class="sway" style="--d:${7 + (x % 3)}s">${petals}<circle class="f-sun ol" cx="${x}" cy="${y}" r="${r * .32}"/><circle class="shade-ball" cx="${x}" cy="${y}" r="${r * .32}"/></g>`;
    }
    // A tulip: a cup of petals; insects sit on its rim (y is the rim).
    function tulip(x, ground, y, r, cls = 'f-flower', bend = 0) {
        return `${stem(x, ground, y + r, bend)}<g class="sway" style="--d:${8 + (x % 3)}s"><path class="${cls} ol" d="M${x - r} ${y} Q${x - r * 1.05} ${y + r * 1.2} ${x} ${y + r * 1.2} Q${x + r * 1.05} ${y + r * 1.2} ${x + r} ${y} L${x + r * .5} ${y + r * .3} L${x} ${y - r * .1} L${x - r * .5} ${y + r * .3}Z"/>
          <path class="shade-side" d="M${x - r} ${y} Q${x - r * 1.05} ${y + r * 1.2} ${x} ${y + r * 1.2} Q${x + r * 1.05} ${y + r * 1.2} ${x + r} ${y} L${x + r * .5} ${y + r * .3} L${x} ${y - r * .1} L${x - r * .5} ${y + r * .3}Z"/></g>`;
    }
    // A sunflower: golden petals round a brown middle.
    function sunflower(x, ground, y, r) {
        const petals = Array.from({ length: 16 }, (_, i) => `<ellipse class="f-sun ol" cx="${x}" cy="${y - r * .62}" rx="${r * .15}" ry="${r * .42}" transform="rotate(${i * 22.5} ${x} ${y})"/>`).join('');
        return `${stem(x, ground, y)}<g class="sway" style="--d:10s">${petals}<circle class="f-trunk ol" cx="${x}" cy="${y}" r="${r * .42}"/><circle class="shade-ball" cx="${x}" cy="${y}" r="${r * .42}"/></g>`;
    }
    // A big leaf held out sideways (`dir` 1 right, -1 left); its top edge is where crawlers sit.
    function leaf(x, y, len, dir = 1, cls = 'f-leaf') {
        const e = x + dir * len;
        return `<path class="${cls} ol" d="M${x} ${y} Q${x + dir * len * .5} ${y - len * .32} ${e} ${y - len * .06} Q${x + dir * len * .5} ${y + len * .26} ${x} ${y}Z"/>
          <path class="vein" d="M${x} ${y} Q${x + dir * len * .5} ${y - len * .04} ${e - dir * len * .06} ${y - len * .06}"/>`;
    }
    // A foxglove: a tall spike of hanging bells.
    function foxglove(x, ground, top) {
        const bells = Array.from({ length: 7 }, (_, i) => {
            const y = top + 40 + i * 44, side = i % 2 ? 1 : -1;
            return `<path class="f-flower ol" d="M${x + side * 6} ${y} q${side * 34} 6 ${side * 40} 34 q${-side * 18} 6 ${-side * 30} -4Z"/>`;
        }).join('');
        return `${stem(x, ground, top)}<g class="sway" style="--d:9s">${bells}<circle class="f-flower ol" cx="${x}" cy="${top + 10}" r="12"/></g>`;
    }
    function cabbage(x, y, r) {
        return `${ball('f-leaf2', x, y - r * .7, r)}<path class="f-leaf ol" d="M${x - r * 1.3} ${y} Q${x - r * 1.4} ${y - r} ${x - r * .4} ${y - r * .9} Q${x - r * .6} ${y - r * .3} ${x} ${y}Z"/>
          <path class="f-leaf ol" d="M${x + r * 1.3} ${y} Q${x + r * 1.4} ${y - r} ${x + r * .4} ${y - r * .9} Q${x + r * .6} ${y - r * .3} ${x} ${y}Z"/>
          <path class="vein" d="M${x} ${y - r * .2} Q${x - r * .3} ${y - r} ${x} ${y - r * 1.5} M${x} ${y - r * .2} Q${x + r * .4} ${y - r * .9} ${x + r * .5} ${y - r * 1.3}"/>`;
    }
    // Logs seen end-on (a stack) and a log lying along the ground.
    function logEnd(x, y, r) {
        return `<circle class="f-trunk ol" cx="${x}" cy="${y}" r="${r}"/><circle class="f-log" cx="${x}" cy="${y}" r="${r * .82}"/>
          <path class="groove" d="M${x} ${y} m${-r * .25} 0 a${r * .25} ${r * .25} 0 1 1 ${r * .5} 0 a${r * .5} ${r * .5} 0 1 1 ${-r * .9} ${r * .1}"/>`;
    }
    function logSide(x1, x2, y, r) {
        return `<rect class="f-trunk ol" x="${x1}" y="${y - r}" width="${x2 - x1}" height="${r * 2}" rx="${r * .3}"/><path class="shade-flat" d="M${x1} ${y + r * .1} H${x2} V${y + r} H${x1}Z"/>
          <path class="groove" d="M${x1 + 40} ${y - r * .4} h${(x2 - x1) * .3} M${x1 + (x2 - x1) * .5} ${y - r * .1} h${(x2 - x1) * .35} M${x1 + 80} ${y + r * .4} h${(x2 - x1) * .25}"/>${logEnd(x2, y, r)}`;
    }
    function fern(x, y, len, dir) {
        const fronds = Array.from({ length: 9 }, (_, i) => {
            const t = (i + 1) / 10, px = x + dir * len * t, py = y - len * .45 * Math.sin(t * Math.PI * .9), l = len * .22 * (1 - t * .6);
            return `<path class="f-leaf2 ol" d="M${px} ${py} q${dir * l * .3} ${-l * .7} ${dir * l * .1} ${-l}Z"/><path class="f-leaf2 ol" d="M${px} ${py} q${dir * l * .5} ${l * .2} ${dir * l * .9} ${l * .5}Z"/>`;
        }).join('');
        return `<g class="sway" style="--d:8s"><path class="stem-thin" d="M${x} ${y} Q${x + dir * len * .5} ${y - len * .5} ${x + dir * len} ${y - len * .1}"/>${fronds}</g>`;
    }
    function fallenLeaves(pts) {
        return pts.map(([x, y, t, c]) => `<path class="p-autumn${c}" transform="translate(${x} ${y}) rotate(${t})" d="M-18 0 Q-6 -12 18 0 Q-6 12 -18 0Z"/>`).join('');
    }
    function soilRows(y) {
        return `<path class="f-soil ol" d="M-10 ${y} C 400 ${y - 16} 1200 ${y + 16} 1610 ${y - 6} L1610 910 L-10 910Z"/>` +
            [y + 40, y + 90, y + 140].map(ry => `<path class="groove" d="M-10 ${ry} C 400 ${ry - 12} 1200 ${ry + 12} 1610 ${ry - 4}"/>`).join('');
    }
    function canes(x, ground, top) {
        return `<path class="cane" d="M${x - 70} ${ground} L${x} ${top} M${x + 70} ${ground} L${x} ${top} M${x} ${ground + 6} L${x} ${top}"/>
          <path class="stem-thin" d="M${x - 60} ${ground - 40} q40 -60 20 -120 q-20 -80 30 -150 M${x + 60} ${ground - 40} q-40 -80 -10 -160 q20 -60 -10 -120"/>`;
    }
    function wateringCan(x, y) {
        return `<path class="f-pond ol" d="M${x - 50} ${y} L${x - 44} ${y - 70} L${x + 44} ${y - 70} L${x + 50} ${y}Z"/><path class="f-pond ol" d="M${x + 44} ${y - 40} L${x + 110} ${y - 90} L${x + 118} ${y - 80} L${x + 48} ${y - 22}Z"/>
          <path class="stalk" d="M${x - 30} ${y - 70} Q${x} ${y - 120} ${x + 30} ${y - 70}"/><path class="shade-side" d="M${x - 50} ${y} L${x - 44} ${y - 70} L${x + 44} ${y - 70} L${x + 50} ${y}Z"/>`;
    }

    SceneArt.minibeasts = {
        noun: 'minibeasts',
        move: 'walk',
        fx: 'note',
        animals: {
            Bee:         { habitat: 'flower', w: 7,   face: 'r', foot: 78.5, move: 'fly' },
            Butterfly:   { habitat: 'flower', w: 8,   face: 'f', foot: 77.5, move: 'fly' },
            Fly:         { habitat: 'flower', w: 5.5, face: 'f', foot: 89.8, move: 'fly' },
            Mosquito:    { habitat: 'flower', w: 5.5, face: 'f', foot: 86,   move: 'fly' },
            Caterpillar: { habitat: 'leaf',   w: 8,   face: 'l', foot: 79.5 },
            Ladybird:    { habitat: 'leaf',   w: 5.5, face: 'f', foot: 82.8, move: 'fly' },
            Snail:       { habitat: 'leaf',   w: 8,   face: 'r', foot: 78.5 },
            Spider:      { habitat: 'thread', w: 7,   face: 'f', foot: 50,   move: 'drop' },
            Worm:        { habitat: 'hide',   w: 7,   face: 'l', foot: 72.5, move: 'peek' },
            Ant:         { habitat: 'ground', w: 5,   face: 'f', foot: 85.5 },
            Cricket:     { habitat: 'ground', w: 8,   face: 'l', foot: 83.3, move: 'bound' },
            Beetle:      { habitat: 'ground', w: 5.5, face: 'f', foot: 86.8 },
            Cockroach:   { habitat: 'ground', w: 5.5, face: 'f', foot: 86.3 },
            Scorpion:    { habitat: 'ground', w: 6,   face: 'f', foot: 85.3 },
        },
        switchCast: ['Bee', 'Butterfly', 'Ladybird', 'Caterpillar', 'Spider', 'Snail'],
        weathers: ['rain', 'wind', 'leaves', 'fog', 'rainbow'],     // no snow or storms for the minibeasts
        covers: {
            soil: `<path class="f-mound ol" d="M8 100 Q24 42 100 30 Q176 42 192 100Z"/><path class="shade-ball" d="M8 100 Q24 42 100 30 Q176 42 192 100Z"/>
                   <path class="light-flat" d="M40 56 Q70 36 110 34 Q80 42 56 62Z"/>
                   ${[[60, 60], [120, 52], [150, 76], [40, 84], [96, 80]].map(([x, y]) => `<circle class="f-log" cx="${x}" cy="${y}" r="5"/>`).join('')}`,
        },
        marks: {
            flower: [[42, 56], [52, 52], [58, 60], [47, 63], [55, 45]].map(([x, y]) => `<circle class="p-pollen" cx="${x}" cy="${y}" r="3.4"/>`).join(''),
            leaf: `<path class="p-drop o" d="M50 42 Q58 56 56 60 A7 7 0 0 1 44 60 Q42 56 50 42Z"/>`,
            thread: `<path class="p-thread" d="M50 -30 V48"/><path class="p-drop o" d="M50 46 Q56 56 55 59 A5.5 5.5 0 0 1 45 59 Q44 56 50 46Z"/>`,
            hide: `<ellipse class="p-hole" cx="50" cy="60" rx="14" ry="6"/><circle class="p-crumb" cx="34" cy="58" r="3"/><circle class="p-crumb" cx="66" cy="57" r="3"/>`,
            ground: [[30, 60, 20], [39, 64, -30], [47, 58, 60], [55, 63, 10], [63, 59, -50], [70, 64, 30]]
                .map(([x, y, turn], i) => `<ellipse class="${i % 3 ? 'p-seed' : 'p-seed2'} o" cx="${x}" cy="${y}" rx="4.2" ry="2.6" transform="rotate(${turn} ${x} ${y})"/>`).join(''),
        },
        markWords: { flower: 'pollen on a flower', leaf: 'a raindrop on a leaf', thread: 'a dewdrop on a thread', hide: 'a hole in the soil', ground: 'seeds on the ground' },

        scenes: {
            flowers: {
                name: '🌼 Flower bed',
                track: 'flowerbed',
                cast: ['Bee', 'Butterfly', 'Fly', 'Ladybird', 'Caterpillar', 'Snail', 'Spider', 'Worm', 'Ant', 'Cricket', 'Beetle'],
                places: { flower: 'on the flowers', leaf: 'on the leaves', thread: 'on threads', hide: 'in the soil', ground: 'on the ground' },
                residents: ['Bee', 'Ladybird'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-flowers', 1360)}
                  ${cloud(0, 140, .9)}${cloud(1, 220, .7)}
                  ${Array.from({ length: 16 }, (_, i) => ball(i % 2 ? 'f-leaf2' : 'f-leaf', i * 110, 600 - (i % 3) * 16, 80 + (i % 2) * 20)).join('')}
                  <path class="f-lawn ol" d="M-10 700 C 400 680 1100 716 1610 694 L1610 910 L-10 910Z"/>
                  ${soilRows(812)}
                  ${daisy(300, 830, 360, 120, 20)}${leaf(300, 600, 170, 1)}
                  ${tulip(560, 830, 420, 60, 'f-flower', -16)}${leaf(560, 690, 130, -1, 'f-leaf2')}
                  ${sunflower(900, 830, 290, 150)}${leaf(900, 560, 190, -1)}
                  ${daisy(1180, 830, 410, 100, -18)}${leaf(1180, 640, 150, 1, 'f-leaf2')}
                  ${tulip(1340, 830, 350, 56, 'f-cap', 14)}
                  ${tufts([[60, 760], [440, 780], [700, 770], [1040, 780], [1500, 770], [800, 890], [200, 890]])}
                  ${rock(1480, 860, 70, 30)}
                </svg>`,
                spots: [
                    { habitat: 'flower', x: 18.75, y: 39.3 }, { habitat: 'flower', x: 35, y: 46.7 }, { habitat: 'flower', x: 56.25, y: 31.4 },
                    { habitat: 'flower', x: 73.75, y: 44.6 }, { habitat: 'flower', x: 83.75, y: 38.9 },
                    { habitat: 'leaf', x: 24, y: 63.4 }, { habitat: 'leaf', x: 30.9, y: 74.1 }, { habitat: 'leaf', x: 50.3, y: 58.6 },
                    { habitat: 'leaf', x: 78.5, y: 67.5 },
                    { habitat: 'thread', x: 44, y: 26 }, { habitat: 'thread', x: 66, y: 20 },
                    { habitat: 'hide', x: 28, y: 90, cover: 'soil' }, { habitat: 'hide', x: 66, y: 91, cover: 'soil' },
                    { habitat: 'ground', x: 16, y: 88 }, { habitat: 'ground', x: 46, y: 90 }, { habitat: 'ground', x: 82, y: 88 },
                ],
                splashes: [],
            },

            logs: {
                name: '🪵 Log pile',
                track: 'logpile',
                cast: ['Bee', 'Fly', 'Ladybird', 'Caterpillar', 'Snail', 'Spider', 'Worm', 'Ant', 'Cricket', 'Beetle', 'Cockroach', 'Scorpion'],
                switchCast: ['Beetle', 'Spider', 'Snail', 'Worm', 'Ant', 'Ladybird'],
                places: { flower: 'on the foxgloves', leaf: 'on the ferns', thread: 'on threads', hide: 'in the soil', ground: 'on the logs and the ground' },
                residents: ['Beetle', 'Snail'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-logs', 1300)}
                  ${[[80, 40], [330, 34], [620, 46], [900, 38], [1180, 44], [1450, 36]].map(([x, w]) => `<rect class="f-hill" x="${x}" y="-10" width="${w}" height="740" rx="${w / 2}"/>`).join('')}
                  ${Array.from({ length: 10 }, (_, i) => `<circle class="f-leaf2" cx="${i * 180}" cy="${40 + (i % 2) * 50}" r="150" opacity=".7"/>`).join('')}
                  <path class="f-soil ol" d="M-10 690 C 400 670 1100 706 1610 684 L1610 910 L-10 910Z"/>
                  ${fallenLeaves([[120, 760, 20, 1], [240, 860, -30, 2], [680, 840, 50, 3], [820, 770, -10, 1], [1100, 880, 30, 2], [1500, 800, -40, 3], [960, 820, 10, 1], [420, 890, 70, 3]])}
                  ${fern(80, 820, 300, 1)}${fern(1560, 800, 280, -1)}
                  ${foxglove(1320, 700, 250)}
                  ${logEnd(300, 760, 72)}${logEnd(446, 760, 72)}${logEnd(592, 760, 72)}${logEnd(373, 632, 72)}${logEnd(519, 632, 72)}${logEnd(446, 506, 72)}
                  ${logSide(820, 1240, 800, 56)}
                  ${toadstools([[420, 440, .9], [860, 746, .8], [1180, 744, 1]])}
                </svg>`,
                spots: [
                    { habitat: 'flower', x: 82.5, y: 27.8 }, { habitat: 'flower', x: 84.5, y: 47 },
                    { habitat: 'leaf', x: 17, y: 81.5 }, { habitat: 'leaf', x: 85, y: 80.5 },
                    { habitat: 'thread', x: 60, y: 30 }, { habitat: 'thread', x: 70, y: 18 },
                    { habitat: 'hide', x: 64, y: 93, cover: 'soil' }, { habitat: 'hide', x: 16, y: 92, cover: 'soil' },
                    { habitat: 'ground', x: 28, y: 48.2 }, { habitat: 'ground', x: 23.3, y: 62.3 }, { habitat: 'ground', x: 32.4, y: 62.3 },
                    { habitat: 'ground', x: 60, y: 82.7 }, { habitat: 'ground', x: 70, y: 82.7 }, { habitat: 'ground', x: 44, y: 95 },
                ],
                splashes: [],
            },

            veg: {
                name: '🥬 Veg patch',
                track: 'vegpatch',
                cast: ['Bee', 'Butterfly', 'Fly', 'Mosquito', 'Ladybird', 'Caterpillar', 'Snail', 'Spider', 'Worm', 'Ant', 'Beetle', 'Cricket'],
                switchCast: ['Caterpillar', 'Butterfly', 'Snail', 'Worm', 'Bee', 'Ladybird'],
                places: { flower: 'on the bean flowers', leaf: 'on the cabbages', thread: 'on threads', hide: 'in the soil', ground: 'on the soil' },
                residents: ['Caterpillar', 'Butterfly'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${skyAndSun('g-veg', 380)}
                  ${cloud(0, 150, .8)}${cloud(2, 100, .6)}
                  ${[80, 240, 400, 560, 720, 880, 1040, 1200, 1360, 1520].map(x => `<rect class="f-trunk ol" x="${x - 30}" y="420" width="60" height="240" rx="6"/>`).join('')}
                  <rect class="f-trunk ol" x="-10" y="470" width="1620" height="18"/><rect class="f-trunk ol" x="-10" y="600" width="1620" height="18"/>
                  <path class="f-lawn ol" d="M-10 650 C 400 636 1100 664 1610 644 L1610 910 L-10 910Z"/>
                  ${soilRows(700)}
                  ${canes(1250, 720, 220)}
                  ${[[1190, 330], [1300, 290], [1230, 450], [1310, 520]].map(([x, y]) => `<circle class="f-flower ol" cx="${x}" cy="${y}" r="16"/><circle class="f-flower ol" cx="${x + 14}" cy="${y + 6}" r="12"/>`).join('')}
                  ${cabbage(260, 800, 90)}${cabbage(560, 790, 80)}${cabbage(860, 810, 88)}
                  ${[[120, 880], [420, 890], [720, 885], [1020, 890]].map(([x, y]) => ball('f-leaf2', x, y, 40)).join('')}
                  ${wateringCan(1470, 830)}
                </svg>`,
                spots: [
                    { habitat: 'flower', x: 74.4, y: 34.4 }, { habitat: 'flower', x: 81.3, y: 30 }, { habitat: 'flower', x: 77, y: 48.4 },
                    { habitat: 'flower', x: 82, y: 56.3 },
                    { habitat: 'leaf', x: 16.3, y: 71.9 }, { habitat: 'leaf', x: 35, y: 72.7 }, { habitat: 'leaf', x: 53.8, y: 73.4 },
                    { habitat: 'thread', x: 44, y: 24 }, { habitat: 'thread', x: 62, y: 32 },
                    { habitat: 'hide', x: 28, y: 94, cover: 'soil' }, { habitat: 'hide', x: 66, y: 93, cover: 'soil' },
                    { habitat: 'ground', x: 45, y: 82 }, { habitat: 'ground', x: 70, y: 84 }, { habitat: 'ground', x: 16, y: 96 },
                ],
                splashes: [],
            },
        },
    };
})();
