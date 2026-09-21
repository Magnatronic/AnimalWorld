/* ── SCENE CHECKS (development) ── */
// Loaded into Animal Scenes by dev/serve.py, before dev/test.js. Drive it with headless Chrome:
//   /__scenes#validate    every scene of every theme: spots, marks, covers, casts, tracks, weathers,
//                         presets and pictures. Prints a PROBLEMS list; keep it "none".
//   /__scenes#movecheck   how animals arrive: head-only pictures pop out, climbers' spots have `up`,
//                         every place can be filled, and no walk or climb crosses water (it samples
//                         the drawing with elementsFromPoint, so give Chrome --window-size=1600,900).
// And for screenshots:
//   /__scenes#shot=theme,scene,look[,full|empty][,subtle|clear]   a scene, filled or empty
//   /__scenes#wx=theme,scene,weather,strength[,look]              a scene in some weather
//   /__scenes#midway=theme,scene,animal,0.45                      an arrival paused part-way
//   /__scenes#pics=theme                                          every picture the theme's scenes use
(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    const errors = []; window.addEventListener('error', e => errors.push(e.message));
    // shot=theme,scene,look[,full|empty][,places]: a scene with every place taken (or none)
    if (hash.startsWith('shot=')) {
        const [theme, scene, look, fill, places] = hash.slice(5).split(',');
        sceneSettings.theme = theme; sceneSettings.scenes[theme] = scene;
        if (places) sceneSettings.showPlaces = places;
        buildScene(); liveLook = look; applyLook(); start();
        document.getElementById('start').hidden = true;
        lastWeatherPress = Date.now() + 1e9; nextThunder = Infinity;
        if (fill === 'full') spots.forEach(sp => { if (sp.animal) return;
            const n = Object.keys(cast).find(n => !cast[n].spot && cast[n].def.habitat === sp.habitat); if (n) settle(n, sp); });
        if (fill === 'empty') Object.keys(cast).forEach(n => { if (cast[n].spot) { cast[n].spot.animal = null; cast[n].spot = null; cast[n].el.hidden = true; } });
        markPlaces();
        document.getAnimations().filter(a => a.transitionProperty).forEach(a => a.finish());
        return;
    }
    if (hash === 'logic') {
        const out = []; const log = (...a) => out.push(a.join(' '));
        sceneSettings.theme = 'forest'; sceneSettings.scenes.forest = 'woodland'; buildScene(); start();
        log('theme', sceneSettings.theme, 'scene', art.id, 'animals', Object.keys(cast).length, 'covers', document.querySelectorAll('.cover').length,
            'here', Object.keys(cast).filter(n => cast[n].spot).join('+'));
        log('bat hang', cast.Bat.el.classList.contains('hang'), 'fox classes', cast.Fox.el.className);
        arrive('Fox');
        const f = cast.Fox.el;
        log('fox arriving: hidden', f.hidden, 'down', f.classList.contains('down'), 'moving', f.classList.contains('moving'), 'spot', cast.Fox.spot && cast.Fox.spot.habitat);
        arrive('Deer'); log('deer z', cast.Deer.el.style.zIndex);
        setTimeout(() => {
            log('fox after: down', f.classList.contains('down'), 'moving', f.classList.contains('moving'));
            const other = spots.find(s => s.habitat === 'hide' && !s.animal);
            moveTo('Fox', other);
            log('fox moving: down', f.classList.contains('down'));
            setTimeout(() => {
                log('fox moved: at', f.style.left, 'down', f.classList.contains('down'), 'spot ok', cast.Fox.spot === other);
                leave('Fox');
                setTimeout(() => {
                    log('fox left: hidden', f.hidden, 'spot', cast.Fox.spot);
                    // theme change from set-up
                    setScene('theme', 'birds'); log('back to birds:', sceneSettings.theme, art.id, 'covers', document.querySelectorAll('.cover').length, 'cast', Object.keys(cast).length);
                    setScene('theme', 'forest'); log('forest again:', art.id);
                    setupTab = 'scene'; openSetup();
                    log('setup scene tab:', document.getElementById('setup-body').textContent.replace(/\s+/g, ' ').slice(0, 700));
                    setupTab = 'presets'; renderSetup();
                    log('presets:', [...document.querySelectorAll('.preset-sum')].map(e => e.textContent).join(' | '));
                    log('errors', errors.length ? errors.join('; ') : 'none');
                    document.body.insertAdjacentHTML('beforeend', `<pre id="result">${out.join('\n')}</pre>`);
                }, 3000);
            }, 4000);
        }, 3000);
    }
})();

(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash === 'themes') {
        const out = []; const log = (...a) => out.push(a.join(' '));
        const errors = []; window.addEventListener('error', e => errors.push(e.message));
        const txt = () => document.getElementById('setup-body').textContent.replace(/\s+/g, ' ');
        log('chooser:', [...document.querySelectorAll('[data-theme]')].map(b => b.dataset.theme).join(', '));
        sceneSettings.weather = 'snow'; sceneSettings.track = 'lake'; saveSceneSettings();
        document.querySelector('[data-theme="birds"]').click();
        for (const t of ['birds', 'forest', 'farm']) {
            if (sceneSettings.theme !== t) { chooseAnimals(); document.querySelector(`[data-theme="${t}"]`).click(); }
            setupTab = 'weather'; openSetup();
            log(`[${t}] weather:`, txt().match(/The scene's own weather(.*?)The scene starts/)[1]);
            setupTab = 'sound'; renderSetup();
            log(`[${t}] tracks:`, txt().match(/Background track(.*?)Each scene/)[1], '| playing', trackUrl());
            setupTab = 'switches'; renderSetup();
            log(`[${t}] switch weather jobs:`, [...document.querySelector('.sw select optgroup[label="Weather"]').children].map(o => o.value).join(','));
            setupTab = 'presets'; renderSetup();
            log(`[${t}] presets:`, [...document.querySelectorAll('.preset-name')].map(e => e.textContent).join(', '));
            closeSetup();
            log(`[${t}] live weather`, liveWeather, 'home', sceneSettings.weather, 'track setting', sceneSettings.track);
        }
        // switch jobs cycling next weather in forest includes leaves
        chooseAnimals(); document.querySelector('[data-theme="forest"]').click();
        const seen = []; for (let k = 0; k < 8; k++) { doJob('nextweather'); seen.push(liveWeather); }
        log('forest next weather cycle:', seen.join(' > '));
        chooseAnimals(); document.querySelector('[data-theme="farm"]').click();
        const seen2 = []; for (let k = 0; k < 7; k++) { doJob('nextweather'); seen2.push(liveWeather); }
        log('farm next weather cycle:', seen2.join(' > '));
        doJob('leaves'); log('farm: leaves job ignored -> weather still', liveWeather);
        const hen = cast.Hen.el; arrive('Hen');
        log('hen arriving: behind', hen.classList.contains('behind'), 'up', hen.classList.contains('up'));
        setTimeout(() => {
            log('hen settled: behind', hen.classList.contains('behind'), 'up', hen.classList.contains('up'), 'z', getComputedStyle(hen).zIndex, 'clip', getComputedStyle(hen).clipPath);
            log('errors', errors.length ? errors.join('; ') : 'none');
            document.body.insertAdjacentHTML('beforeend', `<pre id="result">${out.join('\n')}</pre>`);
        }, 2500);
    }
    if (hash.startsWith('wx=')) {           // wx=theme,scene,weather,strength,look
        const [t, sc, w, st, look] = hash.slice(3).split(',');
        sceneSettings.theme = t; sceneSettings.scenes[t] = sc; buildScene(); liveLook = look || 'soft'; start();
        document.getElementById('start').hidden = true;
        spots.forEach(sp => { if (sp.animal) return; const n = Object.keys(cast).find(n => !cast[n].spot && cast[n].def.habitat === sp.habitat); if (n) settle(n, sp); });
        liveWeather = w; strength = +st; showWeather(false); lastWeatherPress = Date.now() + 1e9; nextThunder = Infinity;
        document.getAnimations().filter(a => a.transitionProperty).forEach(a => a.finish());
    }
})();

(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash.startsWith('midway=')) return;       // midway=theme,scene,animal,fraction
    const [t, sc, name, f] = hash.slice(7).split(',');
    sceneSettings.theme = t; sceneSettings.scenes[t] = sc; buildScene(); start();
    document.getElementById('start').hidden = true;
    const spot = spots.find(s => s.habitat === cast[name].def.habitat && !s.animal);
    arrive(name, spot);
    requestAnimationFrame(() => document.getAnimations().forEach(a => {
        const d = a.effect.getTiming().duration; if (typeof d === 'number') { a.pause(); a.currentTime = d * +f; }
    }));
})();

(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash.startsWith('pics=')) return;
    const theme = hash.slice(5), T = SceneArt[theme];
    const names = [...new Set(Object.values(T.scenes).flatMap(s => Object.keys(sceneAnimals(T, s))))];
    document.body.innerHTML = '<div style="display:flex;flex-wrap:wrap;background:#dfe9f0;font:bold 14px sans-serif;color:#000">' + names.map(n => {
        const d = T.animals[n], a = themes[theme].animals.find(x => x.name === n);
        return `<div style="width:150px;text-align:center"><img src="${d.src || imgSrc(a)}" style="width:140px"><br>${n}</div>`;
    }).join('') + '</div>';
})();

(() => {
    if (location.hash !== '#validate') return;
    const out = [], problems = [];
    const errors = []; window.addEventListener('error', e => errors.push(e.message));
    const bad = (...a) => problems.push(a.join(' '));
    const imgs = [];
    for (const theme of Object.keys(themes).filter(t => SceneArt[t])) {
        const T = SceneArt[theme];
        for (const sc of Object.keys(T.scenes)) {
            sceneSettings.theme = theme; sceneSettings.scenes[theme] = sc; buildScene();
            const where = `${theme}/${sc}:`;
            const habs = new Set(spots.map(s => s.habitat));
            const castHabs = new Set(Object.values(cast).map(a => a.def.habitat));
            habs.forEach(h => { if (!castHabs.has(h)) bad(where, 'no animal lives', h); if (!markArt({ habitat: h })) bad(where, 'no mark for', h);
                if (!art.places[h]) bad(where, 'no place words for', h); });
            castHabs.forEach(h => { if (!habs.has(h)) bad(where, 'animals that live', h, 'have no spot'); });
            spots.filter(s => s.habitat === 'hide').forEach(s => { if (!art.covers) bad(where, 'no cover'); });
            spots.forEach(s => { if (s.x < 14.5 || s.x > 85.5) bad(where, 'spot outside 15-85%', s.habitat, s.x); });
            art.residents.forEach(n => { if (!cast[n]) bad(where, 'resident not in cast', n); });
            (art.switchCast || []).forEach(n => { if (!cast[n] && !jobInfo(n)) bad(where, 'switchCast not in cast', n); });
            if (!SceneTracks[art.track]) bad(where, 'no track', art.track);
            themeWeathers().forEach(w => { if (!SceneWeather[w]) bad(where, 'unknown weather', w); });
            Object.keys(art.animals).forEach(n => { if (!themes[theme].animals.find(a => a.name === n)) bad(where, 'animal not in themes.js', n); });
            Object.values(cast).forEach(a => imgs.push(a.el.querySelector('img')));
            Object.keys(cast).forEach(n => arrive(n));
            Object.keys(cast).forEach(n => leave(n));
            for (const w of themeWeathers()) setWeather(w, 5);
            setWeather('clear');
            for (const tab of ['scene', 'switches', 'weather', 'sound', 'presets']) { setupTab = tab; openSetup(); }
            closeSetup();
            out.push(`${where} ${spots.length} spots, ${Object.keys(cast).length} animals, habitats ${[...habs].join('/')}, weathers ${themeWeathers().join(',')}`);
        }
    }
    const tracks = new Set(Object.values(SceneArt).flatMap(t => Object.values(t.scenes).map(s => s.track)));
    out.push(`scenes ${Object.values(SceneArt).reduce((n, t) => n + Object.keys(t.scenes).length, 0)}, unique tracks ${tracks.size}`);
    READY_PRESETS.forEach(p => {
        const T = SceneArt[p.theme];
        if (!T || !T.scenes[p.scene]) { bad('preset', p.id, 'bad theme/scene'); return; }
        const sceneCast = Object.keys(sceneAnimals(T, T.scenes[p.scene]));
        const ws = T.scenes[p.scene].weathers || T.weathers;
        (p.jobs || []).forEach(j => { if (!sceneCast.includes(j) && !SCENE_JOBS[j] && !WEATHER_JOBS[j]) bad('preset', p.id, 'job not in scene', j);
            if (SceneWeather[j] && !ws.includes(j)) bad('preset', p.id, 'weather job not in scene', j); });
        if (p.weather && !ws.includes(p.weather)) bad('preset', p.id, 'weather not in scene', p.weather);
    });
    if (new Set(READY_PRESETS.map(p => p.id)).size !== READY_PRESETS.length) bad('duplicate preset ids');
    setTimeout(() => {
        imgs.forEach(i => { if (!i.complete || !i.naturalWidth) bad('image not loaded', i.alt, i.src); });
        out.push('PROBLEMS: ' + (problems.length ? '\n  ' + problems.join('\n  ') : 'none'));
        out.push('errors: ' + (errors.length ? errors.join('; ') : 'none'));
        document.body.insertAdjacentHTML('beforeend', `<pre id="result">${out.join('\n')}</pre>`);
    }, 3000);
})();

(() => {
    if (location.hash !== '#movecheck') return;
    const out = [], problems = [];
    const errors = []; window.addEventListener('error', e => errors.push(e.message));
    const bad = (...a) => problems.push(a.join(' '));
    const HEADS = ['Fox', 'Bear', 'Wolf', 'Lion', 'Hen', 'Moose', 'Arctic Fox', 'Frog'];
    const fliers = {};
    // What the drawing has at a point of the scene (x, y in %): the topmost shape's classes
    const drawnAt = (x, y) => {
        const r = stage.getBoundingClientRect();
        const px = r.left + r.width * x / 100, py = r.top + r.height * y / 100;
        const el = document.elementsFromPoint(px, py).find(e => e.closest && e.closest('#bg') && e.tagName !== 'svg' && !/light-|shade-|shine|groove|straw|plank/.test(e.getAttribute('class') || ''));
        return el ? (el.getAttribute('class') || '') : '';
    };
    const wet = c => /f-pond|ring|shine|splash/.test(c);
    for (const theme of Object.keys(themes).filter(t => SceneArt[t])) {
        const T = SceneArt[theme];
        for (const sc of Object.keys(T.scenes)) {
            sceneSettings.theme = theme; sceneSettings.scenes[theme] = sc; buildScene();
            const where = `${theme}/${sc}:`;
            const underwater = themeWeathers().includes('bubbles');
            Object.entries(art.animals).forEach(([n, d]) => {
                const move = d.move || art.move;
                if (HEADS.includes(n) && !['peek', 'surface'].includes(move)) bad(where, 'head-only', n, 'moves by', move);
                if (d.turn && d.face === 'f') bad(where, n, 'is turned but faces front, so it never turns round');
                if (move === 'fly') (fliers[theme] = fliers[theme] || new Set()).add(n);
                if (move === 'climb') spots.filter(s => s.habitat === d.habitat).forEach(s => { if (!s.up) bad(where, n, 'climbs but spot has no up', s.x, s.y); });
            });
            // every place can be filled
            [...new Set(spots.map(s => s.habitat))].forEach(h => {
                const n = Object.values(cast).filter(a => a.def.habitat === h).length, room = spots.filter(s => s.habitat === h).length;
                if (n < room) bad(where, 'only', n, 'animals for', room, h, 'places');
            });
            if (!underwater) {
                // walkers: from the nearer edge along the spot's height, never across water
                const walkers = Object.values(art.animals).filter(d => ['walk', 'bound'].includes(d.move || art.move)).map(d => d.habitat);
                spots.filter(s => walkers.includes(s.habitat)).forEach(s => {
                    const x0 = s.from ? (s.from === 'l' ? 0.5 : 99.5) : s.x < 50 ? 0.5 : 99.5;
                    for (let k = 0; k <= 30; k++) {
                        const x = x0 + (s.x - x0) * k / 30;
                        if (wet(drawnAt(x, s.y))) { bad(where, `walk to ${s.habitat} (${s.x}, ${s.y}) crosses water at x ${x.toFixed(1)}`); break; }
                    }
                });
                // climbers: along the ground to the foot of the tree, never across water
                if (Object.values(art.animals).some(d => d.move === 'climb')) spots.filter(s => s.up).forEach(s => {
                    const [ux, uy] = s.up, x0 = ux < 50 ? 0.5 : 99.5;
                    for (let k = 0; k <= 30; k++) {
                        const x = x0 + (ux - x0) * k / 30;
                        if (wet(drawnAt(x, uy)) && !(sc === 'shore')) { bad(where, `climb to (${s.x}, ${s.y}) crosses water at x ${x.toFixed(1)}`); break; }
                    }
                });
                // ground and hide spots are on dry land; water spots are in water
                spots.forEach(s => {
                    const c = drawnAt(s.x, s.y + 0.8);
                    if (s.habitat === 'water' && c && !wet(c)) bad(where, 'water spot not on water', s.x, s.y, c);
                    if (s.habitat === 'ground' && wet(c)) bad(where, 'ground spot in water', s.x, s.y);
                });
            }
        }
    }
    out.push('fliers: ' + Object.entries(fliers).map(([t, s]) => `${t}: ${[...s].join(', ')}`).join(' | '));
    out.push('PROBLEMS: ' + (problems.length ? '\n  ' + problems.join('\n  ') : 'none'));
    out.push('errors: ' + (errors.length ? errors.join('; ') : 'none'));
    document.body.insertAdjacentHTML('beforeend', `<pre id="result">${out.join('\n')}</pre>`);
})();
