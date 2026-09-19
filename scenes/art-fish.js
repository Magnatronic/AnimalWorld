/* ── FISH: Coral reef, Fish tank and River ── */
// See art.js for how a theme is laid out, and art-ocean.js for the underwater pieces.
// Fish make no sound anyone could record, so here each plays a soft bubbling sound
// (sounds/scene-bubbles.mp3; Animal Activities keeps its own bubble cue and spoken names).
(() => {
    const { underwater, farReef, sand, seaweed, coral, brainCoral, anemone, starfish, shells, rock, WATER_MARKS } = SceneDraw;
    const bubbling = 'scene-bubbles';

    // Coloured aquarium gravel.
    function gravel(y) {
        const stones = Array.from({ length: 90 }, (_, i) => {
            const x = (i * 97) % 1640 - 20, yy = y + 30 + ((i * 53) % 120);
            return `<ellipse class="g${i % 4}" cx="${x}" cy="${yy}" rx="${10 + (i % 3) * 3}" ry="${6 + (i % 2) * 2}"/>`;
        }).join('');
        return `<path class="f-lawn ol" d="M-10 ${y} C 400 ${y - 20} 1200 ${y + 20} 1610 ${y - 6} L1610 910 L-10 910Z"/><g class="gravel">${stones}</g>`;
    }
    // A little castle ornament, (x, y) the middle of its foot.
    function castle(x, y, s) {
        const w = 180 * s, h = 190 * s, l = x - w / 2, top = y - h;
        const merlons = [0, 1, 2, 3].map(i => `<rect class="f-rock ol" x="${l + i * w / 3.5}" y="${top - 26 * s}" width="${w / 7}" height="${30 * s}"/>`).join('');
        return `${merlons}<rect class="f-rock ol" x="${l}" y="${top}" width="${w}" height="${h}"/><path class="shade-side" d="M${l} ${top} h${w} v${h} h${-w}Z"/>
          <rect class="f-rock ol" x="${l - 30 * s}" y="${top - 60 * s}" width="${56 * s}" height="${h + 60 * s}"/><path class="f-flower ol" d="M${l - 36 * s} ${top - 60 * s} L${l - 2 * s} ${top - 120 * s} L${l + 32 * s} ${top - 60 * s}Z"/>
          <path class="f-deep ol" d="M${x - 26 * s} ${y} V${y - 60 * s} A${26 * s} ${26 * s} 0 0 1 ${x + 26 * s} ${y - 60 * s} V${y}Z"/>
          <rect class="f-deep" x="${l + 30 * s}" y="${top + 40 * s}" width="${22 * s}" height="${34 * s}" rx="${11 * s}"/><rect class="f-deep" x="${l - 14 * s}" y="${top - 20 * s}" width="${22 * s}" height="${34 * s}" rx="${11 * s}"/>`;
    }
    // A treasure chest, lid open, with gold showing.
    function chest(x, y, s) {
        const w = 150 * s, h = 80 * s, l = x - w / 2;
        return `<path class="f-trunk ol" d="M${l + 6 * s} ${y - h} L${l + 16 * s} ${y - h - 70 * s} L${l + w - 4 * s} ${y - h - 60 * s} L${l + w - 6 * s} ${y - h}Z"/>
          <ellipse class="f-sun ol" cx="${x}" cy="${y - h}" rx="${w * .42}" ry="${16 * s}"/>
          <rect class="f-trunk ol" x="${l}" y="${y - h}" width="${w}" height="${h}" rx="${6 * s}"/><path class="shade-flat" d="M${l} ${y - h * .5} h${w} v${h * .5} h${-w}Z"/>
          <rect class="f-sun ol" x="${x - 12 * s}" y="${y - h * .7}" width="${24 * s}" height="${26 * s}" rx="${4 * s}"/>
          <path class="plank" d="M${l + w * .25} ${y - h} v${h} M${l + w * .75} ${y - h} v${h}"/>`;
    }
    // An air stone: a stream of little bubbles rising from it.
    function airStone(x, y) {
        const b = Array.from({ length: 8 }, (_, i) => `<circle class="rise-bubble" cx="${x + (i % 2 ? 6 : -6)}" cy="${y}" r="${4 + (i % 3) * 2}" style="animation-delay:${-i * .6}s"/>`).join('');
        return `<ellipse class="f-rock ol" cx="${x}" cy="${y + 6}" rx="22" ry="10"/>${b}`;
    }
    // A sunken branch lying on the riverbed.
    function sunkenLog(x, y, len) {
        return `<path class="f-trunk ol" d="M${x} ${y} L${x + len} ${y - 40} L${x + len + 8} ${y - 22} L${x + 10} ${y + 18}Z"/><path class="shade-flat" d="M${x + 5} ${y + 9} L${x + len + 4} ${y - 31} L${x + len + 8} ${y - 22} L${x + 10} ${y + 18}Z"/>`;
    }
    function pebbles(y) {
        return Array.from({ length: 26 }, (_, i) => {
            const x = (i * 131) % 1640 - 20, yy = y + 20 + ((i * 47) % 110), r = 18 + (i % 4) * 8;
            return rock(x, yy, r, r * .6);
        }).join('');
    }

    SceneArt.fish = {
        noun: 'fish',
        move: 'swim',
        fx: 'bubble',
        animals: {
            Clownfish:       { habitat: 'swim', w: 7,   face: 'r', foot: 55, sound: bubbling },
            'Blue Tang':     { habitat: 'swim', w: 7.5, face: 'r', foot: 55, sound: bubbling },
            Goldfish:        { habitat: 'swim', w: 7,   face: 'r', foot: 55, sound: bubbling },
            Koi:             { habitat: 'swim', w: 8.5, face: 'r', foot: 55, sound: bubbling },
            Angelfish:       { habitat: 'swim', w: 7.5, face: 'r', foot: 55, sound: bubbling },
            Betta:           { habitat: 'swim', w: 7.5, face: 'r', foot: 55, sound: bubbling },
            Pufferfish:      { habitat: 'swim', w: 7,   face: 'l', foot: 55, sound: bubbling },
            Shark:           { habitat: 'swim', w: 14,  face: 'r', foot: 52, sound: bubbling },
            Salmon:          { habitat: 'swim', w: 8.5, face: 'r', foot: 55, sound: bubbling },
            'Rainbow Trout': { habitat: 'swim', w: 8.5, face: 'r', foot: 55, sound: bubbling },
            Catfish:         { habitat: 'seabed', w: 9, face: 'r', foot: 76, sound: bubbling },
            Swordfish:       { habitat: 'swim', w: 13,  face: 'r', foot: 55, sound: bubbling },
        },
        switchCast: ['Clownfish', 'Goldfish', 'Blue Tang', 'Pufferfish', 'Angelfish', 'Shark'],
        weathers: ['bubbles', 'current', 'sunbeams', 'glow'],
        marks: WATER_MARKS,
        markWords: { swim: 'bubbles in the water', seabed: 'a shell on the bottom' },

        scenes: {
            reef: {
                name: '🐠 Coral reef',
                track: 'fishreef',
                cast: ['Clownfish', 'Blue Tang', 'Angelfish', 'Pufferfish', 'Shark', 'Swordfish'],
                switchCast: ['Clownfish', 'Blue Tang', 'Angelfish', 'Pufferfish', 'Shark', 'Swordfish'],
                places: { swim: 'in the water' },
                residents: ['Clownfish', 'Blue Tang'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${underwater('g-fishreef')}
                  ${farReef(600)}
                  ${sand(780)}
                  ${[[1540, 790, 220, 'f-leaf'], [620, 790, 160, 'f-leaf2'], [900, 800, 130, 'f-leaf']].map(([x, y, h, c], i) => seaweed(x, y, h, c, i)).join('')}
                  ${brainCoral(140, 830, 90)}${coral(300, 810, 1.4, 'c2')}${anemone(460, 830, 1.6, 0)}${anemone(520, 846, 1.1, 1)}
                  ${coral(1120, 810, 1.1, 'c1')}${brainCoral(1260, 836, 70)}${coral(1400, 800, 1.5, 'c2')}${anemone(1000, 846, 1.2, 2)}
                  ${rock(760, 850, 80, 30)}${starfish(640, 870, 1.1, 12)}${shells([[860, 880], [1180, 886]])}
                </svg>`,
                spots: [
                    { habitat: 'swim', x: 20, y: 34 }, { habitat: 'swim', x: 36, y: 54 }, { habitat: 'swim', x: 48, y: 28 },
                    { habitat: 'swim', x: 60, y: 48 }, { habitat: 'swim', x: 74, y: 30 }, { habitat: 'swim', x: 84, y: 56 },
                    { habitat: 'swim', x: 28, y: 76 }, { habitat: 'swim', x: 66, y: 72 },
                ],
                splashes: [],
            },

            tank: {
                name: '🐟 Fish tank',
                track: 'tank',
                cast: ['Goldfish', 'Betta', 'Angelfish', 'Clownfish', 'Blue Tang', 'Pufferfish', 'Catfish'],
                switchCast: ['Goldfish', 'Betta', 'Angelfish', 'Catfish', 'Clownfish', 'Pufferfish'],
                places: { swim: 'in the tank', seabed: 'on the gravel' },
                residents: ['Goldfish', 'Betta'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${underwater('g-tank')}
                  <path class="light-flat" d="M120 0 L220 0 L60 900 L-40 900Z M300 0 L340 0 L180 900 L140 900Z"/>
                  ${[[180, 790, 300, 'f-leaf'], [240, 790, 230, 'f-leaf2'], [1380, 790, 320, 'f-leaf2'], [1450, 790, 260, 'f-leaf'], [1520, 790, 200, 'f-leaf2'], [760, 790, 150, 'f-leaf']].map(([x, y, h, c], i) => seaweed(x, y, h, c, i)).join('')}
                  ${gravel(770)}
                  ${castle(520, 812, 1.1)}${chest(1120, 830, .9)}${airStone(900, 820)}
                  <rect class="f-rock" opacity=".35" x="-10" y="-10" width="1620" height="16"/>
                </svg>`,
                spots: [
                    { habitat: 'swim', x: 20, y: 30 }, { habitat: 'swim', x: 36, y: 50 }, { habitat: 'swim', x: 50, y: 26 },
                    { habitat: 'swim', x: 64, y: 44 }, { habitat: 'swim', x: 78, y: 28 }, { habitat: 'swim', x: 82, y: 58 },
                    { habitat: 'swim', x: 50, y: 64 },
                    { habitat: 'seabed', x: 22, y: 94 }, { habitat: 'seabed', x: 80, y: 95 },
                ],
                splashes: [],
            },

            river: {
                name: '🏞️ River',
                track: 'riverbed',
                cast: ['Salmon', 'Rainbow Trout', 'Catfish', 'Koi', 'Goldfish'],
                switchCast: ['Salmon', 'Rainbow Trout', 'Koi', 'Catfish', 'Goldfish'],
                places: { swim: 'in the river', seabed: 'on the riverbed' },
                residents: ['Salmon', 'Koi'],
                svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                  ${underwater('g-river-fish')}
                  ${farReef(640)}
                  ${[[100, 800, 380, 'f-leaf2'], [160, 800, 300, 'f-leaf'], [1280, 800, 340, 'f-leaf2'], [1500, 800, 420, 'f-leaf'], [1560, 800, 300, 'f-leaf2']].map(([x, y, h, c], i) => seaweed(x, y, h, c, i)).join('')}
                  ${sand(790)}
                  ${sunkenLog(560, 850, 320)}
                  ${pebbles(780)}
                </svg>`,
                spots: [
                    { habitat: 'swim', x: 22, y: 32 }, { habitat: 'swim', x: 40, y: 50 }, { habitat: 'swim', x: 56, y: 28 },
                    { habitat: 'swim', x: 70, y: 52 }, { habitat: 'swim', x: 82, y: 34 }, { habitat: 'swim', x: 30, y: 70 },
                    { habitat: 'seabed', x: 20, y: 95 }, { habitat: 'seabed', x: 78, y: 94 },
                ],
                splashes: [],
            },
        },
    };
})();
