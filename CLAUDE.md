# Animal World — notes for working on this project

Animal World is used by a therapist and teachers with students with additional needs, often on a
large touch projector in a sensory room, with switches (Pretorian SimplyWorks SEND-6, Bluetooth
switches, Xbox Adaptive Controller). Plain HTML, CSS and JavaScript: no build step, no framework,
no packages. It must keep working offline and when opened by double-clicking `index.html`, so use
classic `<script>` tags (not ES modules) and relative paths. Live at
https://Magnatronic.github.io/AnimalWorld (GitHub Pages serves `main`).

## Two parts
- **Animal Activities** — `index.html`, `styles.css`, `settings.js`, `app.js`. Front page → theme
  picker → Explore, Memory, Whack-a-Mole, Find the Animal. Settings panel (tap ⚙): Scanning,
  Play area, Games, Sound.
- **Animal Scenes** — `scenes.html`, `scenes/`. A calm full-screen scene; touch and switches bring
  animals in. Opens on a choice of animals (theme buttons, `showChooser()`; a preset link shows
  `showTapToStart()` instead); set-up's "Choose animals" and tapping ← (top left, while playing) return there. Set-up (tap ⚙): Presets,
  Scene, Weather, Switches, Sound tabs.

## Where things live
| Path | What |
|---|---|
| `shared/themes.js` | Every theme and animal (name, OpenMoji `code` or `src`, `sound`); `imgSrc()` |
| `shared/switches.js` | Learning/reading switches: keys + Gamepad API. Numbered switch list for Scenes (min 5 in Scenes, max 12, id + colour); `capture()` for one-off learning (Activities' scanning switches). `ROOM`: the sensory room's SimplyWorks switches (gamepad buttons 12–16 for the red/yellow/green/blue/white box, 18 for the single white), replacing whatever was learned the first time a browser opens it (flag `animalWorld.roomSwitches`), then when nothing is learned, and by `useRoom()`; ready-made presets have six jobs to match. Activities' scanning words (Space/Enter) also take a room switch per role (`ROOM_SCAN` in settings.js: single white; yellow move, green select) |
| `shared/hold.js/.css`, `shared/fonts.css` | The adult's ⚙/← buttons (plain tap) and no long-press menu; bundled Nunito |
| `scenes/art.js`, `scenes/art-<theme>.js` | art.js: the drawing pieces (`SceneDraw`, shared with the other files; art-ocean.js adds the underwater ones), tracks, weathers, Birds, Forest and Farm; each other theme in its own file, loaded after art.js. Per theme: `animals` (habitat perch/ground/water/hide/swim/seabed/flower/leaf/thread, width %, facing r/l/f, move fly/walk/bound/climb/swim/surface/peek/pop/drop, `hang`, `turn`, `sound`, `src`), `switchCast`, `weathers` (the SceneWeather ids that suit it), optional `covers`/`marks`/`markWords`, and `scenes` (each: SVG drawing, `spots`, `places`, `residents`, `track` (unique per scene), optional `cast` (the scene's animals: names, or names with changes such as a different habitat; `sceneAnimals()`), and any theme key to override it, e.g. `weathers`, `switchCast`, `marks`, `fx`, `splashes` = rain-ring points on its water). `SceneTracks` = background loops (set-up offers only the theme's, `themeTracks()`); `SceneWeather` = the weathers (label, hint, optional sound; `themeWeathers()`/`themeWeatherJobs()` filter them per theme) |
| `scenes/scenes.js` | Scene engine, settings (`animalScenes.settings`), jobs, `makeLooper()` crossfading loops (track and weather sounds), weather (`drawWeather`, `setWeather`, `pressWeather`, strength 1–5 as `st1..5` on each weather layer + `.lv2…lv5` (stage `wx-s1..5` only for lean and snowy ground), easing off, thunder) |
| `scenes/presets.js` | Presets (`animalScenes.presets`): ready-made list, save/update/rename/delete, `usePreset()`, `#preset=<id>` links. Jobs stored by switch number, not switch id. Each belongs to its `theme`; set-up lists only `themePresets()`. Ready-made ones added later carry `since: <version>`; `addNewReady()` puts them into saved lists once (`animalScenes.presetsVersion`), so deleted ones stay deleted |
| `scenes/setup.js` | Set-up screen |
| `scenes/pictures/` | OpenMoji pictures recoloured for a theme (white snowy owl, red squirrel…), used through a def's `src` in Scenes and an animal's `src` in `shared/themes.js` |
| `openmoji/`, `fish/`, `sounds/`, `sounds/ambient/`, `sounds/weather/` | All assets are local (offline) |
| `dev/` | Test server, scene checks (`checks.js`) and walk-through (see Testing) |

localStorage keys: `animalWorld.settings` (Activities), `animalWorld.switches` (shared), `animalScenes.settings`, `animalScenes.presets`.

## Adding things
- **A theme's animal**: add to `shared/themes.js`; download its SVG to `openmoji/` (see README),
  or give it `src` instead of `code` if it has its own artwork (the fish, the recoloured pictures).
- **A scene theme**: add `scenes/art-<theme>.js` setting `SceneArt.<theme>` (animals + scenes) and a script tag in scenes.html, CSS
  palettes `.scene-<theme>-<scene>.look-soft|line|night` in `scenes/scenes.css`, and a track in
  `sounds/ambient/`. Birds is the template. Scenes are 1600×900; keep spots within x 15–85% (squarer
  screens trim the sides). Two spots want about 9% between them, or one animal stands across the
  other; on stacked branches, that or about 28% of height, since a hanging bat reaches a long way
  down. Keep ground spots that far from a `hide` spot too, or a body ends up across a peeping head.
  OpenMoji pictures have different empty space under the feet: give each
  animal a `foot` (% down its picture where the feet are; for water birds, the waterline, below which
  it's cut off while sitting). Measure it by drawing the SVG to a canvas and finding the lowest opaque
  row. Light and shade in drawings: `ball()`, `trunk()`, `branch()` and the `shade-*`/`light-*`
  classes (see-through, so they suit every look). Each empty spot shows a marker per habitat
  (`PLACE_ART` in scenes.js: nest, seeds, lily pad; a theme can override per habitat or per cover with
  `marks`, and name them in `markWords` for set-up), "Subtle" or "Clear". Forest adds habitat `hide`
  for head-only pictures (fox, bear, wolf): the spot is the line a cover hides them from (`covers`,
  drawn 200×100 with the spot at (100, 30); a spot's `cover` picks bush, log or hay); `peek()` pops
  them up from behind (`.behind`, clipped; `.down`/`.up`) and then forward to sit in front of it. Moves: `climb` needs each of its spots to have
  `up: [x, y]`, the foot of the trunk or stem (`climb()` runs the path with the Web Animations API);
  `surface` rises out of the water at the spot; `pop` grows in place; `drop` comes down a thread;
  walkers come in from the nearer edge (a spot's `from: 'l'|'r'` forces a side). A def's `src` swaps the
  picture (recolours in scenes/pictures/). Scenes with more places than animals add copies ("Owl 2",
  `copy: true`); Random and touches prefer the originals. `windCarries: 'snow'|'sand'` replaces the
  wind's leaves. `dev/checks.js` (`#validate`, `#movecheck`, `#spacecheck`) checks every scene; see Testing. `hang: true` (bat) turns the picture over under a branch; its
  `foot` is then where it grips, near the top. `turn: -90` (the ant and the other top-down crawlers)
  turns the picture to face the way it goes, and turns it the other way instead of mirroring it;
  give those a side to face (`face: 'l'`) and `foot: 50`, the middle, which the turn goes round.
  A journey cut short by the next press ends cleanly (`journey()`/`ending()` in scenes.js: each
  journey holds a token, and stale timers, transitions and paths do nothing), and `a.at` is the
  place an animal is heading for from the moment it sets off. Animals are z-ordered by spot y (`standAt()`).
- **Sounds**: CC0 only (Freesound). Animal calls levelled to about −16 LUFS, background loops about
  −26 LUFS, peaks limited; credit each in `sounds/_Adding Sounds.md`. Tooling: `pip install
  imageio-ffmpeg` gives an ffmpeg binary; pass `-nostdin` when looping over a heredoc.

## Conventions
- Match the existing style: short comments that say *why*, UK spelling, plain words in the UI.
- Files are CRLF in the working tree (Git autocrlf); when editing with Python, read normally and
  write with `newline='\r\n'`.
- Settings loaders keep only known keys of the right type, so old saves can't break new defaults.
  When a setting changes meaning, migrate old values (see `loadSettings()` in `settings.js`).
- The browser's own long-press menu is off for the whole page (`shared/hold.js`), because holding is
  an ordinary gesture here and on the projector the menu appears by accident; text fields keep it.
- Gentle by design: slow motion, fades not jumps, nothing flashing; respect `prefers-reduced-motion`.
  (Lightning: thin bolts fading in over ~0.25 s, no flicker, never two within 0.8 s (BOLT_GAP), and a
  "Thunder only" setting; keep those limits for photosensitive users.)
- Presses and touches are paced by `accept(job)` (the "Wait between presses" setting: 1–3 s, or -1
  "When finished" using `takesMs(job)`; plus a longer wait for big changes); new input paths should go
  through it. Old settings are tidied in `tidySettings()`.
- Weather sits in two layers around the animals (`#wx-back`, `#wx-front`), neither catching touches;
  the rainbow goes into the scene's SVG just after the moon, so scenery is in front of it; lightning is
  in `#wx-back` above the darkened sky, masked to fade out towards the horizon.

## Testing
`python dev/serve.py`, then drive headless Chrome:
- Regression: dump `http://127.0.0.1:8765/__walkthrough` before and after a change and `diff`.
  (The "highlighted=" line counts elements with `scan-` in their class, so it shifts when such
  elements are added.)
- Specific checks: write `dev/test.js` (untracked) and load `/__app` or `/__scenes`; it runs in the
  real page, so top-level `const`s like `settings`, `Switches`, `cast` are reachable.
- Scenes (`dev/checks.js`, loaded into `/__scenes` before test.js): `#validate` builds every scene of every theme (spots, marks, covers, casts, tracks,
  weathers, presets, pictures loading), `#movecheck` checks how animals arrive — head-only
  pictures pop out, climbers' spots have `up`, every place can be filled, and no walk or climb crosses
  water (it samples the drawing with `elementsFromPoint`, so pass `--window-size=1600,900`) — and
  `#spacecheck` checks the room the spots leave: it puts every animal on every spot its habitat allows
  and measures the ink of the picture there, so it finds pairings a random filling would only sometimes
  show. All three print a `PROBLEMS:` list; keep it "none". checks.js also has `#shot=`, `#wx=`, `#midway=` and `#pics=` for
  screenshots — its top comment lists them.
- Command shape: `chrome --headless=new --disable-gpu --autoplay-policy=no-user-gesture-required
  --virtual-time-budget=60000 --dump-dom URL` (or `--screenshot=... --window-size=1280,720`).
- Gotchas: with virtual time, CSS transitions/animations may not advance once the page is idle, so
  test fades via `document.getAnimations()` (seek `currentTime`) rather than waiting. Audio doesn't
  actually play headless; check that `Audio` objects are created (wrap `window.Audio`). Simulate an
  Adaptive Controller by overriding `navigator.getGamepads` and dispatching `gamepadconnected`.
  Headless windows are at least 500 px wide. Never `taskkill` all of chrome.exe (it closes the
  user's browser); stop the test server by its port.

## Working with the owner
- Work on a feature branch; commit at each tested stage, but **push only when the owner says so**; **don't merge to
  `main` until asked** (merging publishes to the live site).
- Explain look-and-feel options before building bigger features; they like mock-ups for visuals.
- Animal names are spoken only when the Sound setting asks (Fish theme excepted); never add
  automatic speech for individual animals.
- Saved set-ups in Scenes are called "presets"; don't name anything after students.
