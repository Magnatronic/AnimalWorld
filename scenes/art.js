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

// Background tracks: each scene has its own, and set-up offers those of the same theme.
const SceneTracks = {
    garden:   { label: 'Garden birdsong', file: 'sounds/ambient/garden.mp3' },
    woodland: { label: 'Woodland',        file: 'sounds/ambient/woodland.mp3' },
    lake:     { label: 'Lakeside water',  file: 'sounds/ambient/lake.mp3' },
    forest:   { label: 'Forest birds and breeze', file: 'sounds/ambient/forest.mp3' },
    river:    { label: 'Woodland stream', file: 'sounds/ambient/river.mp3' },
    clearing: { label: 'Summer meadow',   file: 'sounds/ambient/clearing.mp3' },
    farmyard: { label: 'Farmyard',        file: 'sounds/ambient/farmyard.mp3' },
    fields:   { label: 'Sheep bells in a field', file: 'sounds/ambient/fields.mp3' },
    duckpond: { label: 'Duck pond',       file: 'sounds/ambient/duckpond.mp3' },
    savanna:  { label: 'Savanna',         file: 'sounds/ambient/savanna.mp3' },
    waterhole:{ label: 'Waterhole',       file: 'sounds/ambient/waterhole.mp3' },
    jungle:   { label: 'Rainforest',      file: 'sounds/ambient/jungle.mp3' },
    seaice:   { label: 'Icy sea',         file: 'sounds/ambient/seaice.mp3' },
    snowforest: { label: 'Snowy forest',  file: 'sounds/ambient/snowforest.mp3' },
    tundra:   { label: 'Tundra wind',     file: 'sounds/ambient/tundra.mp3' },
    seashore: { label: 'Waves on the shore', file: 'sounds/ambient/seashore.mp3' },
    reef:     { label: 'Coral reef',      file: 'sounds/ambient/reef.mp3' },
    kelp:     { label: 'Deep water',      file: 'sounds/ambient/kelp.mp3' },
    fishreef: { label: 'Reef bubbles',    file: 'sounds/ambient/fishreef.mp3' },
    tank:     { label: 'Fish tank',       file: 'sounds/ambient/tank.mp3' },
    riverbed: { label: 'Flowing river',   file: 'sounds/ambient/riverbed.mp3' },
    flowerbed:{ label: 'Buzzing flowers', file: 'sounds/ambient/flowerbed.mp3' },
    logpile:  { label: 'Log pile',        file: 'sounds/ambient/logpile.mp3' },
    vegpatch: { label: 'Veg patch',       file: 'sounds/ambient/vegpatch.mp3' },
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
    leaves:  { label: '🍂 Falling leaves', hint: 'Autumn leaves drift down, rocking as they fall; stronger, the trees turn golden, then orange.' },
    dust:    { label: '💨 Dusty wind', sound: 'sounds/weather/wind.mp3', hint: 'A warm wind blows sand and dust across and the trees lean; stronger, a golden haze.' },
    aurora:  { label: '🌌 Northern lights', hint: 'Soft ribbons of green and pink light ripple slowly across the sky; stronger, more ribbons, brighter.' },
    sunbeams:{ label: '☀️ Sunbeams', hint: 'Beams of sunlight slant down through the water, slowly shimmering.' },
    bubbles: { label: '🫧 Bubbles', hint: 'Bubbles wobble up through the water, near and far; more and quicker as it strengthens.' },
    current: { label: '🌊 Current', hint: 'The water flows: bits drift past and the seaweed leans; stronger, it streams.' },
    glow:    { label: '✨ Glow', hint: 'Tiny lights twinkle slowly in the water, as glowing plankton do (lovely with Night-light).' },
};
// Which of these each theme has is its `weathers` below (a jungle shouldn't have snow).

// The drawing pieces below (ball, trunk, branch, cloud…), shared with the themes that have
// their own files (scenes/art-<theme>.js), which add themselves to SceneArt.
const SceneDraw = {};

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

    // A fir tree far off: three tiers, a little faded.
    function pine(x, y, s, cls = 'f-leaf2') {
        return `<g opacity=".8"><rect class="f-trunk" x="${x - 5 * s}" y="${y - 22 * s}" width="${10 * s}" height="${24 * s}"/>` +
            [0, 1, 2].map(i => `<path class="${cls}" d="M${x - (62 - i * 14) * s} ${y - (18 + i * 36) * s} L${x} ${y - (80 + i * 36) * s} L${x + (62 - i * 14) * s} ${y - (18 + i * 36) * s}Z"/>`).join('') + '</g>';
    }
    // Toadstools: red caps with white spots; `s` scales each.
    function toadstools(pts) {
        return pts.map(([x, y, s = 1]) => `<g><path class="f-stalk ol" d="M${x - 6 * s} ${y} L${x - 4 * s} ${y - 22 * s} L${x + 4 * s} ${y - 22 * s} L${x + 6 * s} ${y}Z"/>
          <path class="f-cap ol" d="M${x - 22 * s} ${y - 20 * s} Q${x} ${y - 54 * s} ${x + 22 * s} ${y - 20 * s}Z"/><path class="shade-flat" d="M${x - 22 * s} ${y - 20 * s} Q${x} ${y - 30 * s} ${x + 22 * s} ${y - 20 * s}Z"/>
          <circle class="f-dot" cx="${x - 8 * s}" cy="${y - 30 * s}" r="${3.5 * s}"/><circle class="f-dot" cx="${x + 7 * s}" cy="${y - 34 * s}" r="${3 * s}"/><circle class="f-dot" cx="${x + 13 * s}" cy="${y - 25 * s}" r="${2.5 * s}"/></g>`).join('');
    }
    function rock(x, y, rx, ry) {
        const at = `cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"`;
        return `<ellipse class="f-rock ol" ${at}/><ellipse class="shade-ball" ${at}/><ellipse class="light-ball" ${at}/>`;
    }
    // A beaver's lodge: a mound of sticks standing in the water, (x, y) the middle of its foot.
    function lodge(x, y, w, h) {
        const sticks = [[-.42, -.1, -.1, -.55], [-.3, -.02, .15, -.75], [-.1, -.05, .38, -.4], [.05, -.85, .45, -.08], [-.38, -.4, .2, -.3], [-.2, -.7, .3, -.62]]
            .map(([a, b, c, d]) => `M${x + a * w} ${y + b * h} L${x + c * w} ${y + d * h}`).join(' ');
        return `<path class="f-trunk ol" d="M${x - w / 2} ${y} Q${x - w * .3} ${y - h * 1.1} ${x} ${y - h} Q${x + w * .3} ${y - h * 1.1} ${x + w / 2} ${y}Z"/>
          <path class="shade-side" d="M${x - w / 2} ${y} Q${x - w * .3} ${y - h * 1.1} ${x} ${y - h} Q${x + w * .3} ${y - h * 1.1} ${x + w / 2} ${y}Z"/>
          <path class="stick" d="${sticks}"/><ellipse class="ring" cx="${x}" cy="${y}" rx="${w * .55}" ry="${h * .12}"/>`;
    }

    // ── Farm pieces ──
    // A red barn, (x, y) the middle of its foot: a gambrel roof, big doors with white braces,
    // and hay showing in the loft.
    function barn(x, y, w, h) {
        const l = x - w / 2, r = x + w / 2, top = y - h, dw = w * 0.28, dh = h * 0.58;
        const roof = `M${l - w * .05} ${top + 12} L${l + w * .14} ${top - h * .42} L${x} ${top - h * .66} L${r - w * .14} ${top - h * .42} L${r + w * .05} ${top + 12}Z`;
        return `<rect class="f-barn ol" x="${l}" y="${top}" width="${w}" height="${h}"/><path class="shade-side" d="M${l} ${top} H${r} V${y} H${l}Z"/>
          <path class="f-barn ol" d="${roof}"/><path class="shade-flat" d="M${x} ${top - h * .66} L${r - w * .14} ${top - h * .42} L${r + w * .05} ${top + 12} L${x} ${top + 12}Z"/>
          <path class="trim" d="M${l - w * .05} ${top + 12} L${l + w * .14} ${top - h * .42} L${x} ${top - h * .66} L${r - w * .14} ${top - h * .42} L${r + w * .05} ${top + 12}"/>
          <rect class="f-hay ol" x="${x - w * .08}" y="${top - h * .38}" width="${w * .16}" height="${h * .26}"/>
          <path class="trim" d="M${x - w * .08} ${top - h * .38} h${w * .16} v${h * .26} h${-w * .16}Z"/>
          <rect class="f-barn ol" x="${x - dw / 2}" y="${y - dh}" width="${dw}" height="${dh}"/><path class="shade-flat" d="M${x - dw / 2} ${y - dh} h${dw} v${dh} h${-dw}Z"/>
          <path class="trim" d="M${x - dw / 2} ${y - dh} h${dw} v${dh} h${-dw}Z M${x} ${y - dh} V${y} M${x - dw / 2} ${y - dh} L${x} ${y} L${x + dw / 2} ${y - dh} M${x - dw / 2} ${y} L${x} ${y - dh} L${x + dw / 2} ${y}"/>`;
    }
    // A farmhouse: cream walls, a red roof and chimney, windows and a door.
    function farmhouse(x, y, w, h) {
        const l = x - w / 2, top = y - h;
        const win = (wx, wy) => `<rect class="f-pond ol" x="${wx}" y="${wy}" width="${w * .13}" height="${h * .26}"/><path class="trim" d="M${wx} ${wy} h${w * .13} v${h * .26} h${-w * .13}Z M${wx + w * .065} ${wy} v${h * .26} M${wx} ${wy + h * .13} h${w * .13}"/>`;
        return `<rect class="f-barn ol" x="${x + w * .22}" y="${top - h * .62}" width="${w * .09}" height="${h * .4}"/>
          <rect class="f-house ol" x="${l}" y="${top}" width="${w}" height="${h}"/><path class="shade-side" d="M${l} ${top} h${w} v${h} h${-w}Z"/>
          <path class="f-barn ol" d="M${l - w * .06} ${top + 6} L${x} ${top - h * .55} L${l + w * 1.06} ${top + 6}Z"/><path class="shade-belly" d="M${l - w * .06} ${top + 6} L${x} ${top - h * .55} L${l + w * 1.06} ${top + 6}Z"/>
          ${win(l + w * .1, top + h * .2)}${win(l + w * .77, top + h * .2)}${win(l + w * .1, top + h * .6)}${win(l + w * .77, top + h * .6)}
          <rect class="f-trunk ol" x="${x - w * .08}" y="${y - h * .5}" width="${w * .16}" height="${h * .5}" rx="${w * .08}"/>`;
    }
    // A wooden fence: posts every `gap`, two rails; animals perch on the top rail's top edge (y).
    function fence(x1, x2, y, gap = 120) {
        let posts = '';
        for (let x = x1; x <= x2; x += gap) posts += trunk(`M${x - 9} ${y - 12} L${x + 9} ${y - 12} L${x + 9} ${y + 86} L${x - 9} ${y + 86}Z`);
        return `<rect class="f-trunk ol" x="${x1 - 20}" y="${y + 40}" width="${x2 - x1 + 40}" height="14"/>${posts}
          <rect class="f-trunk ol" x="${x1 - 20}" y="${y}" width="${x2 - x1 + 40}" height="16"/><path class="light-flat" d="M${x1 - 20} ${y} h${x2 - x1 + 40} v5 h${-(x2 - x1 + 40)}Z"/>`;
    }
    // A five-bar gate between two posts, with its diagonal brace.
    function gate(x1, x2, y) {
        const bars = [0, 20, 40, 60, 80].map(dy => `<rect class="f-trunk ol" x="${x1}" y="${y + dy}" width="${x2 - x1}" height="11"/>`).join('');
        return `${bars}<path class="f-trunk ol" d="M${x1 + 6} ${y + 88} L${x2 - 14} ${y} L${x2 - 4} ${y + 6} L${x1 + 16} ${y + 91}Z"/>
          ${trunk(`M${x1 - 12} ${y - 14} h20 v112 h-20Z`)}${trunk(`M${x2 - 8} ${y - 14} h20 v112 h-20Z`)}`;
    }
    // A haystack (a golden mound) and a round bale seen end-on.
    function haystack(x, y, w, h) {
        return `<path class="f-hay ol" d="M${x - w / 2} ${y} Q${x - w * .45} ${y - h} ${x} ${y - h} Q${x + w * .45} ${y - h} ${x + w / 2} ${y}Z"/>
          <path class="shade-side" d="M${x - w / 2} ${y} Q${x - w * .45} ${y - h} ${x} ${y - h} Q${x + w * .45} ${y - h} ${x + w / 2} ${y}Z"/>
          <path class="straw" d="M${x - w * .3} ${y - h * .3} q${w * .1} -8 ${w * .2} 0 M${x} ${y - h * .6} q${w * .1} -8 ${w * .2} 0 M${x - w * .15} ${y - h * .15} q${w * .12} -8 ${w * .24} 0"/>`;
    }
    function roundBale(x, y, r) {
        return `<circle class="f-hay ol" cx="${x}" cy="${y - r}" r="${r}"/><circle class="shade-ball" cx="${x}" cy="${y - r}" r="${r}"/>
          <path class="straw" d="M${x} ${y - r} m${-r * .3} 0 a${r * .3} ${r * .3} 0 1 1 ${r * .3} ${r * .3} a${r * .55} ${r * .55} 0 1 1 ${r * .5} ${-r * .55}"/>`;
    }
    // Far hills in a patchwork of fields, with hedges between them.
    function patchwork(y) {
        return `<path class="f-hill ol" d="M-10 ${y + 30} C 300 ${y - 50} 600 ${y - 10} 900 ${y - 30} C 1200 ${y - 50} 1400 ${y - 20} 1610 ${y - 40} L1610 ${y + 150} L-10 ${y + 150}Z"/>
          <path class="f-leaf2" opacity=".55" d="M180 ${y - 4} C 330 ${y - 30} 480 ${y - 28} 620 ${y - 18} L680 ${y + 60} L120 ${y + 60}Z"/>
          <path class="f-hay" opacity=".6" d="M900 ${y - 30} C 1050 ${y - 42} 1200 ${y - 46} 1330 ${y - 30} L1360 ${y + 50} L880 ${y + 50}Z"/>
          <path class="hedge" d="M-10 ${y + 60} H1610"/>`;
    }

    // The woodland: tall trunks with branches, a stream, and `extra` drawn on the forest
    // floor in front of the stream but behind the trunks (both themes have a woodland).
    function woodland(extra = '') {
        return `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
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
          ${extra}
          ${trunk('M175 910 L195 -10 L255 -10 L262 910Z')}
          ${branch(240, 440, 640, 370)}${branch(230, 250, 470, 205, 16)}
          ${trunk('M1000 910 L1012 -10 L1066 -10 L1078 910Z')}
          ${branch(1005, 350, 720, 315, 18)}${branch(1065, 500, 1340, 455)}
          ${trunk('M1438 910 L1446 -10 L1498 -10 L1506 910Z')}
          ${branch(1445, 260, 1210, 235, 16)}
          <g class="sway" style="--d:12s">${[[60,20,150],[240,-10,140],[420,30,120],[640,-20,150],[860,10,130],[1060,-10,150],[1260,20,130],[1460,-10,150],[1620,30,120]].map(([x, y, r], i) =>
            ball(i % 2 ? 'f-leaf2' : 'f-leaf', x, y, r)).join('')}</g>
        </svg>`;
    }

    // A bush that head-only animals pop up from behind, and the berries that mark an empty one.
    const bushCover = `<g class="sway" style="--d:8s"><ellipse class="f-leaf ol" cx="100" cy="68" rx="96" ry="34"/>${ball('f-leaf2', 40, 66, 36)}${ball('f-leaf', 100, 56, 42)}${ball('f-leaf2', 160, 66, 36)}</g>`;
    const berries = `<path class="p-leaf o" d="M34 58 Q40 46 52 50 Q44 60 34 58Z"/><path class="p-leaf o" d="M66 58 Q60 46 48 50 Q56 60 66 58Z"/>` +
        [[43, 56], [51, 60], [58, 55], [50, 51], [41, 63], [59, 63], [50, 66]].map(([x, y]) => `<circle class="p-berry o" cx="${x}" cy="${y}" r="5.4"/>`).join('');

    Object.assign(SceneDraw, { bushCover, berries, shading, ball, trunk, tuft, cloud, stars, flowers, skyAndSun, branch, shine, tufts, farTree,
        bluebells, reeds, pine, toadstools, rock, lodge, barn, farmhouse, fence, gate, haystack, roundBale, patchwork, woodland });

    return {
        birds: {
            noun: 'birds',
            move: 'fly',            // how animals arrive unless they say otherwise
            fx: 'note',             // what rises when an animal calls
            // Every animal in the Birds theme: where it lives, its width (% of the scene),
            // which way its picture faces (r, l or f for front), how far down its picture
            // its feet are (%; for water birds, where the waterline crosses it), and how it arrives.
            // (A picture drawn from above, head up, also has a `turn`: see the mini beasts.)
            animals: {
                Sparrow:  { habitat: 'perch',  w: 9,    face: 'r', foot: 78 },
                Crow:     { habitat: 'perch',  w: 10,   face: 'r', foot: 78 },
                Owl:      { habitat: 'perch',  w: 9,    face: 'f', foot: 85 },
                Eagle:    { habitat: 'perch',  w: 11.5, face: 'l', foot: 85 },
                Parrot:   { habitat: 'perch',  w: 9,    face: 'l', foot: 74 },
                Pigeon:   { habitat: 'ground', w: 9,    face: 'l', foot: 88 },
                Hen:      { habitat: 'hide',   w: 7,    face: 'f', foot: 90, move: 'peek' },   // only a head: pops up from a bush
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
            covers: { bush: bushCover },
            marks: { hide: berries },
            markWords: { hide: 'berries on a bush' },
            weathers: ['rain', 'storm', 'snow', 'wind', 'fog', 'rainbow'],    // the weathers that suit it (SceneWeather)

            scenes: {
                garden: {
                    name: '🌳 Garden',
                    track: 'garden',
                    places: { perch: 'on the branches', hide: 'behind the bush', ground: 'on the lawn', water: 'on the pond' },
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
                        { habitat: 'hide', x: 18, y: 75, cover: 'bush' },
                        { habitat: 'ground', x: 25, y: 88 }, { habitat: 'ground', x: 35, y: 81 },
                        { habitat: 'ground', x: 45, y: 88 }, { habitat: 'ground', x: 52, y: 78 },
                        { habitat: 'water', x: 70, y: 86 },  { habitat: 'water', x: 83, y: 87.5 },
                    ],
                    splashes: [[62.5, 87.8], [70, 84.4], [78.8, 88.9], [86.3, 85.6], [75, 91]],
                },

                woodland: {
                    name: '🌲 Woodland',
                    track: 'woodland',
                    places: { perch: 'on the branches', hide: 'behind the bush', ground: 'on the forest floor', water: 'in the stream' },
                    residents: ['Owl', 'Crow'],
                    svg: () => woodland(),
                    spots: [
                        { habitat: 'perch', x: 27,   y: 45.2 }, { habitat: 'perch', x: 36.5, y: 42.2 },
                        { habitat: 'perch', x: 24,   y: 24.6 }, { habitat: 'perch', x: 49,   y: 35.9 },
                        { habitat: 'perch', x: 76,   y: 52.8 }, { habitat: 'perch', x: 81,   y: 27.1 },
                        { habitat: 'hide', x: 58, y: 74, cover: 'bush' },
                        { habitat: 'ground', x: 25, y: 88 }, { habitat: 'ground', x: 36, y: 82 }, { habitat: 'ground', x: 48, y: 87 },
                        { habitat: 'water', x: 72.5, y: 94 }, { habitat: 'water', x: 82, y: 93 },
                    ],
                    splashes: [[56, 97.5], [65.5, 94.5], [74, 96], [84.5, 92.5], [92.5, 90]],
                },

                lake: {
                    name: '🏞️ Lakeside',
                    track: 'lake',
                    places: { perch: 'on the jetty', hide: 'behind the bush', ground: 'on the shore', water: 'on the lake' },
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
                        { habitat: 'hide', x: 30, y: 78, cover: 'bush' },
                        { habitat: 'ground', x: 17, y: 81 },    { habitat: 'ground', x: 26, y: 88 },  { habitat: 'ground', x: 37, y: 95 },
                        { habitat: 'water', x: 31, y: 73 },     { habitat: 'water', x: 44, y: 82 },   { habitat: 'water', x: 54, y: 92 },
                        { habitat: 'water', x: 57, y: 70 },     { habitat: 'water', x: 72, y: 88 },
                    ],
                    splashes: [[37.5, 66.7], [43.8, 71], [53, 77.8], [68.8, 73.3], [59.4, 91], [81, 86.7]],
                },
            },
        },

        forest: {
            noun: 'animals',
            move: 'walk',
            fx: 'note',
            // Four places: branches, the forest floor, the water, and `hide`: a bush or log that
            // the animals whose pictures are only a head (fox, bear, wolf) pop up from behind,
            // then sit in front of. For them `foot` is the chin; for water animals it's the
            // waterline. The bat hangs upside down under its branch (`hang`; `foot` is then
            // where its feet grip, near the top of the turned-over picture). Water and ground
            // animals come after the others, so they're in front when they cross.
            animals: {
                Owl:        { habitat: 'perch',  w: 8.5, face: 'f', foot: 86,   move: 'fly' },
                Squirrel:   { habitat: 'perch',  w: 8,   face: 'l', foot: 88.5, move: 'climb', src: 'scenes/pictures/red-squirrel.svg' },
                Bat:        { habitat: 'perch',  w: 9,   face: 'f', foot: 4,    move: 'fly', hang: true },
                Fox:        { habitat: 'hide',   w: 7,   face: 'f', foot: 94,   move: 'peek' },
                Bear:       { habitat: 'hide',   w: 7.8, face: 'f', foot: 87,   move: 'peek' },
                Wolf:       { habitat: 'hide',   w: 7,   face: 'f', foot: 94,   move: 'peek' },
                Frog:       { habitat: 'water',  w: 8,   face: 'f', foot: 70,   move: 'surface' },
                Otter:      { habitat: 'water',  w: 11,  face: 'l', foot: 60,   move: 'surface' },
                Beaver:     { habitat: 'water',  w: 10,  face: 'l', foot: 64,   move: 'surface' },
                Deer:       { habitat: 'ground', w: 13,  face: 'l', foot: 94.3 },
                Badger:     { habitat: 'ground', w: 11,  face: 'l', foot: 73.8 },
                Hedgehog:   { habitat: 'ground', w: 8,   face: 'l', foot: 77.8 },
                Rabbit:     { habitat: 'ground', w: 8,   face: 'l', foot: 80.5, move: 'bound', src: 'scenes/pictures/wild-rabbit.svg' },
                'Wild Boar':{ habitat: 'ground', w: 12,  face: 'l', foot: 80.8 },
                Mouse:      { habitat: 'ground', w: 6,   face: 'l', foot: 86.8, src: 'scenes/pictures/wood-mouse.svg' },
                Snake:      { habitat: 'ground', w: 8,   face: 'r', foot: 84.5 },
            },
            switchCast: ['Fox', 'Owl', 'Frog', 'Deer', 'Squirrel', 'Bear'],
            weathers: ['rain', 'storm', 'snow', 'wind', 'leaves', 'fog', 'rainbow'],
            // What hides the peeping animals: drawn 200 × 100 in front of them, with the line
            // they're hidden from (the spot) at (100, 30).
            covers: {
                bush: bushCover,
                log:  `<rect class="f-trunk ol" x="6" y="22" width="182" height="52" rx="22"/><path class="shade-flat" d="M6 52 H188 V52 Q188 74 166 74 H28 Q6 74 6 52Z"/>
                       <path class="light-flat" d="M28 22 H166 V30 H28Z"/>
                       <ellipse class="f-trunk ol" cx="186" cy="48" rx="13" ry="26"/><ellipse class="light-flat" cx="186" cy="48" rx="13" ry="26"/>
                       <path class="plank" d="M186 36 A 6 12 0 1 1 186 60 A 3 6 0 1 1 186 42"/>`,
            },
            // The empty places' markers (see PLACE_ART in scenes.js), and what set-up calls them.
            marks: {
                perch: [[38, 55], [60, 56]].map(([x, y]) => `<ellipse class="p-seed2 o" cx="${x}" cy="${y}" rx="6.5" ry="8"/>
                    <path class="p-trunk o" d="M${x - 8} ${y - 4} Q${x} ${y - 14} ${x + 8} ${y - 4}Z"/><path class="p-trunk" d="M${x} ${y - 11} v-5"/>`).join(''),
                // Fallen leaves (not toadstools, which are part of the scenery)
                ground: [[36, 60, -30, 1], [52, 64, 20, 2], [64, 59, 70, 3], [46, 56, 110, 2]].map(([x, y, turn, c]) =>
                    `<path class="p-autumn${c} o" transform="translate(${x} ${y}) rotate(${turn})" d="M-11 0 Q-4 -7 11 0 Q-4 7 -11 0Z"/>`).join(''),
                // A log's empty place has little toadstools on it
                log: [[42, 60, 1], [55, 61, .75]].map(([x, y, s]) => `<path class="p-stalk o" d="M${x - 3 * s} ${y} L${x - 2.5 * s} ${y - 9 * s} H${x + 2.5 * s} L${x + 3 * s} ${y}Z"/>
                    <path class="p-cap o" d="M${x - 11 * s} ${y - 8 * s} Q${x} ${y - 27 * s} ${x + 11 * s} ${y - 8 * s}Z"/><circle class="p-stalk" cx="${x - 3 * s}" cy="${y - 14 * s}" r="${2 * s}"/>`).join(''),
                hide: berries,
            },
            // Marks and words go by a spot's cover if it has its own, or else by where it is.
            markWords: { perch: 'acorns on a branch', hide: 'berries on a bush', log: 'toadstools on the log', ground: 'leaves on the ground', water: 'a lily pad on the water' },

            scenes: {
                woodland: {
                    name: '🌲 Woodland',
                    track: 'forest',
                    places: { perch: 'on the branches', hide: 'behind the bushes', ground: 'on the forest floor', water: 'in the stream' },
                    residents: ['Owl', 'Hedgehog'],
                    svg: () => woodland(toadstools([[560, 815, 1], [120, 872, .8], [650, 752, .9], [420, 885, 1.1]]) +
                        rock(1500, 800, 60, 26) + rock(760, 870, 44, 20)),
                    spots: [
                        { habitat: 'perch', x: 27,   y: 45.2, up: [14, 80] }, { habitat: 'perch', x: 36.5, y: 42.2, up: [14, 80] },
                        { habitat: 'perch', x: 24,   y: 24.6, up: [14, 80] }, { habitat: 'perch', x: 49,   y: 35.9, up: [64, 80] },
                        { habitat: 'perch', x: 76,   y: 52.8, up: [66, 80] }, { habitat: 'perch', x: 81,   y: 27.1, up: [91.5, 79] },
                        { habitat: 'hide', x: 44, y: 71 }, { habitat: 'hide', x: 62, y: 70 },
                        { habitat: 'ground', x: 20, y: 90 }, { habitat: 'ground', x: 32, y: 84 },
                        { habitat: 'ground', x: 47, y: 92 }, { habitat: 'ground', x: 59, y: 87, from: 'l' },
                        { habitat: 'water', x: 72.5, y: 94 }, { habitat: 'water', x: 84, y: 92.5 },
                    ],
                    splashes: [[56, 97.5], [65.5, 94.5], [74, 96], [84.5, 92.5], [92.5, 90]],
                },

                river: {
                    name: '🏞️ Riverbank',
                    track: 'river',
                    places: { perch: 'on the branches', hide: 'behind the bushes', ground: 'on the riverbank', water: 'in the river' },
                    residents: ['Beaver', 'Deer'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-river', 1250)}
                      ${cloud(0, 130, .9)}${cloud(1, 200, .7)}${cloud(2, 90, .5)}
                      <path class="f-hill ol" d="M-10 500 C 200 430 420 470 640 440 C 900 405 1150 470 1400 430 C 1500 415 1560 430 1610 440 L1610 600 L-10 600Z"/>
                      ${[[40, .9], [150, 1.2], [270, 1], [390, 1.3], [520, .9], [640, 1.15], [770, 1], [900, 1.3], [1030, .95], [1150, 1.2], [1280, 1], [1400, 1.25], [1520, .9], [1610, 1.1]]
                        .map(([x, s], i) => pine(x, 572 - (i % 2) * 8, s)).join('')}
                      <path class="f-lawn ol" d="M-10 566 C 400 546 900 580 1610 552 L1610 670 L-10 670Z"/>
                      <path class="f-pond ol" d="M-10 650 C 400 634 1000 666 1610 642 L1610 792 C 1100 774 500 802 -10 784Z"/>
                      <path class="light-flat" d="M-10 650 C 400 634 1000 666 1610 642 L1610 682 C 1000 704 400 676 -10 690Z"/>
                      ${shine([[120, 720, 50], [420, 700, 60], [700, 752, 40], [980, 712, 70], [1500, 740, 44], [300, 768, 34]])}
                      <ellipse class="ring" cx="620" cy="720" rx="110" ry="13"/><ellipse class="ring" cx="1000" cy="750" rx="90" ry="11" style="animation-delay:-3s"/>
                      ${lodge(1310, 716, 290, 125)}
                      ${rock(210, 752, 40, 15)}${rock(880, 770, 34, 13)}
                      <path class="f-lawn ol" d="M-10 784 C 500 802 1100 774 1610 792 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 784 C 500 802 1100 774 1610 792 L1610 812 C 1100 796 500 826 -10 806Z"/>
                      ${reeds(20, 812, 5)}${reeds(1480, 816, 5, 20)}
                      ${tufts([[300, 850], [560, 880], [820, 840], [1080, 870], [1330, 860]])}
                      ${flowers([[430, 860], [700, 890], [960, 850], [1220, 885]])}
                      ${toadstools([[160, 880, .9], [1390, 895, .8]])}
                      ${trunk('M110 910 L140 -10 L210 -10 L230 910Z')}
                      ${branch(200, 300, 520, 250)}${branch(205, 480, 450, 450, 18)}
                      ${trunk('M1460 910 L1478 -10 L1530 -10 L1545 910Z')}
                      ${branch(1465, 380, 1180, 345)}
                      <g class="sway" style="--d:12s">${[[40, 40, 140], [220, -20, 130], [360, 30, 100], [1420, 20, 120], [1570, -10, 140], [1610, 150, 90]].map(([x, y, r], i) =>
                        ball(i % 2 ? 'f-leaf2' : 'f-leaf', x, y, r)).join('')}</g>
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 22, y: 30.7, up: [10.6, 90] }, { habitat: 'perch', x: 29, y: 28.75, up: [10.6, 90] },
                        { habitat: 'perch', x: 24, y: 50.9, up: [10.6, 90] },
                        { habitat: 'perch', x: 76, y: 38.8, up: [93.5, 90] }, { habitat: 'perch', x: 82, y: 40.1, up: [93.5, 90] },
                        { habitat: 'hide', x: 38, y: 60 }, { habitat: 'hide', x: 54, y: 61 }, { habitat: 'hide', x: 70, y: 59.5 },
                        { habitat: 'water', x: 36, y: 80 }, { habitat: 'water', x: 52, y: 81 }, { habitat: 'water', x: 67, y: 79.5 },
                        { habitat: 'ground', x: 20, y: 95 }, { habitat: 'ground', x: 40, y: 96 },
                        { habitat: 'ground', x: 62, y: 95 }, { habitat: 'ground', x: 80, y: 96 },
                    ],
                    splashes: [[28, 77], [40, 82], [47, 76], [58, 83], [64, 77.5], [76, 84], [90, 80]],
                },

                clearing: {
                    name: '🍄 Clearing',
                    track: 'clearing',
                    places: { perch: 'on the branches', hide: 'behind the log and the bush', ground: 'in the clearing', water: 'in the pond' },
                    residents: ['Rabbit', 'Squirrel'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-clearing', 1150)}
                      ${cloud(0, 150, 1)}${cloud(1, 230, .75)}${cloud(2, 100, .55)}
                      <path class="f-hill ol" d="M-10 540 C 260 470 520 520 800 500 C 1080 480 1340 440 1610 490 L1610 640 L-10 640Z"/>
                      ${[[380, .9], [470, 1.2], [560, 1], [660, 1.3], [760, .95], [860, 1.2], [960, 1], [1060, 1.3], [1160, .9], [1250, 1.15]]
                        .map(([x, s], i) => pine(x, 622 - (i % 3) * 6, s)).join('')}
                      ${[[420, 1], [610, 1.1], [810, .9], [1010, 1.05], [1210, .95]].map(([x, s]) => pine(x, 630, s, 'f-leaf')).join('')}
                      <path class="f-lawn ol" d="M-10 618 C 400 594 1100 628 1610 604 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 618 C 400 594 1100 628 1610 604 L1610 630 C 1100 654 400 620 -10 646Z"/>
                      <ellipse class="f-pond ol" cx="1180" cy="806" rx="250" ry="62"/>
                      <ellipse class="light-flat" cx="1180" cy="816" rx="230" ry="48"/>
                      ${shine([[1030, 800, 44], [1270, 832, 36], [1190, 784, 26]])}
                      <ellipse class="ring" cx="1140" cy="808" rx="80" ry="15"/><ellipse class="ring" cx="1260" cy="800" rx="64" ry="12" style="animation-delay:-3s"/>
                      ${reeds(1398, 810, 4, 18)}
                      ${tufts([[330, 700], [560, 690], [700, 880], [880, 700], [420, 810], [940, 860]])}
                      ${flowers([[380, 750], [520, 860], [640, 770], [800, 845], [900, 740]])}
                      ${toadstools([[380, 694, .9], [410, 704, .65], [860, 800, .9], [380, 880, 1.1]])}
                      ${rock(1560, 700, 70, 30)}
                      ${trunk('M110 910 L140 250 L215 250 L240 910Z')}
                      ${branch(205, 430, 470, 370)}${branch(195, 580, 400, 555, 16)}
                      <g class="sway" style="--d:10s">${ball('f-leaf', 80, 230, 130)}${ball('f-leaf2', 220, 170, 115)}${ball('f-leaf', 330, 250, 95)}${ball('f-leaf2', 20, 80, 110)}${ball('f-leaf', 170, 50, 100)}</g>
                      ${trunk('M1455 910 L1470 -10 L1520 -10 L1535 910Z')}
                      ${branch(1462, 330, 1200, 300, 18)}
                      <g class="sway" style="--d:12s">${ball('f-leaf2', 1380, -20, 110)}${ball('f-leaf', 1510, 20, 130)}${ball('f-leaf2', 1610, 140, 100)}</g>
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 20, y: 44.9, up: [11, 88] }, { habitat: 'perch', x: 26.25, y: 42.4, up: [11, 88] },
                        { habitat: 'perch', x: 21, y: 62.5, up: [11, 88] },
                        { habitat: 'perch', x: 78, y: 33.9, up: [93.4, 88] }, { habitat: 'perch', x: 84, y: 35.2, up: [93.4, 88] },
                        { habitat: 'hide', x: 44, y: 73, cover: 'log' }, { habitat: 'hide', x: 80, y: 69 },
                        { habitat: 'ground', x: 17, y: 92 }, { habitat: 'ground', x: 31, y: 84 },
                        { habitat: 'ground', x: 46, y: 93 }, { habitat: 'ground', x: 59, y: 83, from: 'l' },
                        { habitat: 'water', x: 66, y: 89 }, { habitat: 'water', x: 79, y: 88.5 },
                    ],
                    splashes: [[63, 88], [68, 92], [73, 86], [77, 91], [83, 88]],
                },
            },
        },
        farm: {
            noun: 'animals',
            move: 'walk',
            fx: 'note',
            // The fence is where the rooster, cat and chick perch; the hen's picture is only a
            // head, so she pops up from behind a hay bale (`hide`) and sits in front of it.
            // Ducks and geese sit in the pond (`foot` is the waterline).
            animals: {
                Rooster: { habitat: 'perch',  w: 8.5, face: 'l', foot: 85,   move: 'fly' },
                Cat:     { habitat: 'perch',  w: 9,   face: 'l', foot: 79,   move: 'climb' },
                Chick:   { habitat: 'perch',  w: 5.5, face: 'f', foot: 83.5, move: 'climb' },
                Hen:     { habitat: 'hide',   w: 6.5, face: 'f', foot: 90,   move: 'peek' },
                Duck:    { habitat: 'water',  w: 9.5, face: 'l', foot: 76, move: 'fly' },
                Goose:   { habitat: 'water',  w: 9.5, face: 'l', foot: 75, move: 'fly' },
                Cow:     { habitat: 'ground', w: 14,  face: 'l', foot: 80.3 },
                Horse:   { habitat: 'ground', w: 13,  face: 'l', foot: 89.3 },
                Donkey:  { habitat: 'ground', w: 12,  face: 'l', foot: 85.3 },
                Llama:   { habitat: 'ground', w: 10,  face: 'l', foot: 85 },
                Pig:     { habitat: 'ground', w: 11,  face: 'r', foot: 80.5 },
                Sheep:   { habitat: 'ground', w: 11,  face: 'l', foot: 87 },
                Goat:    { habitat: 'ground', w: 10,  face: 'l', foot: 89 },
                Dog:     { habitat: 'ground', w: 9.5, face: 'l', foot: 85.5, move: 'bound' },
                Turkey:  { habitat: 'ground', w: 9.5, face: 'l', foot: 83.5 },
                Mouse:   { habitat: 'ground', w: 5.5, face: 'l', foot: 86.8 },
            },
            switchCast: ['Cow', 'Pig', 'Sheep', 'Duck', 'Rooster', 'Horse'],
            weathers: ['rain', 'storm', 'snow', 'wind', 'fog', 'rainbow'],
            covers: {
                hay: `<rect class="f-hay ol" x="14" y="16" width="172" height="78" rx="8"/><path class="shade-flat" d="M14 60 H186 V86 Q186 94 178 94 H22 Q14 94 14 86Z"/>
                      <path class="light-flat" d="M22 16 H178 V24 H22Z"/>
                      <path class="straw" d="M30 36 h40 M92 44 h36 M140 34 h30 M40 70 h34 M110 76 h44 M26 54 h22 M150 58 h24"/>
                      <path class="twine" d="M64 16 V94 M136 16 V94"/>`,
            },
            marks: {
                perch: `<path class="p-leaf o" d="M36 60 Q40 44 54 42 Q46 54 36 60Z"/><ellipse class="p-corn o" cx="54" cy="54" rx="15" ry="7" transform="rotate(-14 54 54)"/>
                    <path class="p-twig" d="M44 52 L46 60 M52 50 L54 59 M60 48 L62 57 M67 47 L68 55"/><path class="p-leaf o" d="M34 62 Q48 64 58 58 Q46 58 34 62Z"/>`,
                ground: `<path class="p-straw" d="M28 62 L64 55 M34 57 L72 62 M38 64 L66 52 M30 59 L58 64 M44 66 L74 59 M40 54 L60 60"/>`,
                hide: `<path class="p-straw" d="M36 64 L64 60 M38 60 L62 65"/><ellipse class="p-egg o" cx="50" cy="55" rx="8" ry="10.5"/>`,
            },
            markWords: { perch: 'corn on the fence', hide: 'an egg by a hay bale', ground: 'straw on the ground', water: 'a lily pad on the water' },

            scenes: {
                farmyard: {
                    name: '🚜 Farmyard',
                    track: 'farmyard',
                    places: { perch: 'on the fence', hide: 'behind the hay bales', ground: 'in the yard', water: 'on the pond' },
                    residents: ['Rooster', 'Pig'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-farmyard', 1320)}
                      ${cloud(0, 140, .9)}${cloud(1, 220, .7)}${cloud(2, 100, .55)}
                      ${patchwork(560)}
                      ${farTree(700, 560, .9)}${farTree(780, 570, .7)}${farTree(1500, 540, .8)}
                      <path class="f-lawn ol" d="M-10 640 C 400 616 1000 650 1610 626 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 640 C 400 616 1000 650 1610 626 L1610 650 C 1000 674 400 640 -10 664Z"/>
                      ${barn(330, 650, 420, 250)}
                      <path class="f-rock ol" d="M40 910 C 60 780 220 700 420 690 C 640 680 860 720 900 800 C 930 860 900 890 880 910Z"/>
                      <path class="light-flat" d="M120 800 C 240 720 420 706 560 712 C 420 730 260 760 180 830Z"/>
                      ${haystack(640, 660, 190, 120)}
                      ${fence(860, 1610, 600, 125)}
                      <ellipse class="f-pond ol" cx="1300" cy="832" rx="235" ry="56"/>
                      <ellipse class="light-flat" cx="1300" cy="842" rx="215" ry="42"/>
                      ${shine([[1150, 826, 44], [1380, 856, 36], [1300, 810, 26]])}
                      <ellipse class="ring" cx="1250" cy="834" rx="74" ry="13"/><ellipse class="ring" cx="1370" cy="826" rx="60" ry="11" style="animation-delay:-3s"/>
                      ${reeds(1520, 836, 4, 16)}
                      ${tufts([[980, 700], [1060, 760], [960, 880], [60, 690], [1560, 700]])}
                      ${flowers([[1000, 730], [1100, 880], [940, 820]])}
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 59, y: 66.7, up: [59, 79] }, { habitat: 'perch', x: 66.5, y: 66.7, up: [66.5, 79] },
                        { habitat: 'perch', x: 74.5, y: 66.7, up: [74.5, 79] }, { habitat: 'perch', x: 82, y: 66.7, up: [82, 79] },
                        { habitat: 'hide', x: 45, y: 72, cover: 'hay' }, { habitat: 'hide', x: 18, y: 76, cover: 'hay' },
                        { habitat: 'ground', x: 28, y: 93 }, { habitat: 'ground', x: 45, y: 95 },
                        { habitat: 'ground', x: 60, y: 85 }, { habitat: 'ground', x: 68, y: 97 },
                        { habitat: 'water', x: 75, y: 93.5 }, { habitat: 'water', x: 85, y: 92.5 },
                    ],
                    splashes: [[73, 92], [78, 95], [82, 91], [87, 94], [91, 92]],
                },

                fields: {
                    name: '🌾 Fields',
                    track: 'fields',
                    places: { perch: 'on the gate', hide: 'behind the hay bales', ground: 'in the field', water: 'in the pond' },
                    residents: ['Sheep', 'Cow'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-fields', 380)}
                      ${cloud(0, 150, 1)}${cloud(1, 230, .75)}${cloud(2, 110, .6)}
                      ${patchwork(520)}
                      ${farmhouse(1180, 505, 110, 70)}
                      ${farTree(1080, 520, .7)}${farTree(560, 530, .8)}
                      ${roundBale(760, 612, 22)}${roundBale(840, 606, 18)}${roundBale(920, 614, 20)}
                      <path class="f-lawn ol" d="M-10 620 C 400 600 1000 636 1610 612 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 620 C 400 600 1000 636 1610 612 L1610 636 C 1000 660 400 624 -10 646Z"/>
                      ${fence(-10, 230, 612, 120)}${gate(250, 520, 612)}${fence(540, 660, 612, 120)}
                      <ellipse class="f-pond ol" cx="1230" cy="842" rx="220" ry="50"/>
                      <ellipse class="light-flat" cx="1230" cy="852" rx="200" ry="36"/>
                      ${shine([[1100, 838, 40], [1300, 862, 34]])}
                      <ellipse class="ring" cx="1200" cy="842" rx="70" ry="12"/>
                      ${trunk('M1420 910 L1440 280 Q1460 250 1480 280 L1500 910Z')}
                      <g class="sway" style="--d:11s">${ball('f-leaf', 1340, 260, 110)}${ball('f-leaf2', 1480, 180, 120)}${ball('f-leaf', 1600, 260, 110)}${ball('f-leaf2', 1440, 340, 90)}</g>
                      ${tufts([[120, 780], [380, 860], [700, 720], [880, 880], [1000, 700], [600, 810]])}
                      ${flowers([[250, 820], [520, 880], [760, 800], [960, 760], [1040, 880]])}
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 18, y: 68, up: [18, 80] }, { habitat: 'perch', x: 24, y: 68, up: [24, 80] }, { habitat: 'perch', x: 31, y: 68, up: [31, 80] },
                        { habitat: 'hide', x: 58, y: 71, cover: 'hay' }, { habitat: 'hide', x: 72, y: 68, cover: 'hay' },
                        { habitat: 'ground', x: 17, y: 94 }, { habitat: 'ground', x: 32, y: 86 }, { habitat: 'ground', x: 44, y: 95 },
                        { habitat: 'ground', x: 45, y: 78 }, { habitat: 'ground', x: 60, y: 90, from: 'l' },
                        { habitat: 'water', x: 74, y: 95 }, { habitat: 'water', x: 83, y: 94 },
                    ],
                    splashes: [[70, 93], [75, 96], [80, 92], [85, 95]],
                },

                pond: {
                    name: '🦆 Duck pond',
                    track: 'duckpond',
                    places: { perch: 'on the fence', hide: 'behind the hay bale', ground: 'by the pond', water: 'on the pond' },
                    residents: ['Duck', 'Goose'],
                    svg: () => `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
                      ${skyAndSun('g-pond', 1000)}
                      ${cloud(0, 130, .9)}${cloud(1, 210, .7)}${cloud(2, 100, .5)}
                      <path class="f-hill ol" d="M-10 520 C 300 450 600 500 900 470 C 1200 440 1400 480 1610 460 L1610 620 L-10 620Z"/>
                      ${farmhouse(1240, 600, 380, 200)}
                      ${[[1020, 600, 50], [1470, 600, 56], [1540, 590, 48], [960, 604, 40]].map(([x, y, r]) => ball('f-leaf', x, y, r)).join('')}
                      <path class="f-lawn ol" d="M-10 596 C 400 580 1000 610 1610 590 L1610 910 L-10 910Z"/>
                      <path class="light-flat" d="M-10 596 C 400 580 1000 610 1610 590 L1610 614 C 1000 634 400 604 -10 620Z"/>
                      ${fence(-10, 480, 574, 122)}
                      <ellipse class="f-pond ol" cx="780" cy="790" rx="470" ry="98"/>
                      <ellipse class="light-flat" cx="780" cy="806" rx="440" ry="76"/>
                      ${shine([[520, 770, 60], [900, 820, 50], [700, 846, 40], [1050, 770, 36], [640, 740, 30]])}
                      <ellipse class="ring" cx="650" cy="790" rx="110" ry="16"/><ellipse class="ring" cx="960" cy="800" rx="90" ry="14" style="animation-delay:-3s"/>
                      ${reeds(290, 800, 5)}${reeds(1210, 780, 5, 18)}
                      ${trunk('M60 910 L90 320 Q110 290 130 320 L160 910Z')}
                      <g class="sway" style="--d:10s">${ball('f-leaf', 40, 260, 120)}${ball('f-leaf2', 170, 200, 110)}${ball('f-leaf', 110, 110, 100)}
                        <path class="willow" d="${[20, 60, 100, 140, 180, 220, 250].map((x, i) => `M${x} ${300 + (i % 2) * 20} q${i % 2 ? 12 : -12} 120 ${i % 2 ? 4 : -4} ${220 + (i % 3) * 30}`).join(' ')}"/></g>
                      ${tufts([[240, 700], [1320, 700], [1440, 860], [180, 880], [1560, 760]])}
                      ${flowers([[330, 690], [1380, 760], [1500, 880], [250, 860]])}
                    </svg>`,
                    spots: [
                        { habitat: 'perch', x: 17, y: 63.8, up: [17, 75] }, { habitat: 'perch', x: 24, y: 63.8, up: [24, 75] },
                        { habitat: 'hide', x: 84, y: 75, cover: 'hay' },
                        { habitat: 'ground', x: 36, y: 70 }, { habitat: 'ground', x: 55, y: 69 },
                        { habitat: 'ground', x: 18, y: 93 }, { habitat: 'ground', x: 83, y: 95 },
                        { habitat: 'water', x: 38, y: 84 }, { habitat: 'water', x: 52, y: 92 },
                        { habitat: 'water', x: 64, y: 81 },
                    ],
                    splashes: [[34, 86], [42, 92], [50, 84], [58, 94], [66, 88], [72, 82]],
                },
            },
        },
    };
})();
