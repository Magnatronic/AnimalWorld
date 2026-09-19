# Animal World — notes for working on this project

Animal World is used by a therapist and teachers with students with additional needs, often on a
large touch projector in a sensory room, with switches (Pretorian SimplyWorks SEND-6, Bluetooth
switches, Xbox Adaptive Controller). Plain HTML, CSS and JavaScript: no build step, no framework,
no packages. It must keep working offline and when opened by double-clicking `index.html`, so use
classic `<script>` tags (not ES modules) and relative paths. Live at
https://Magnatronic.github.io/AnimalWorld (GitHub Pages serves `main`).

## Two parts
- **Animal Activities** — `index.html`, `styles.css`, `settings.js`, `app.js`. Front page → theme
  picker → Explore, Memory, Whack-a-Mole, Find the Animal. Settings panel (hold ⚙ 2 s): Scanning,
  Play area, Games, Sound.
- **Animal Scenes** — `scenes.html`, `scenes/`. A calm full-screen scene; touch and switches bring
  animals in. Set-up (hold ⚙ 2 s): Presets, Scene, Weather, Switches, Sound tabs.

## Where things live
| Path | What |
|---|---|
| `shared/themes.js` | Every theme and animal (name, OpenMoji `code` or `src`, `sound`); `imgSrc()` |
| `shared/switches.js` | Learning/reading switches: keys + Gamepad API. Numbered switch list for Scenes (min 5 in Scenes, max 12, id + colour); `capture()` for one-off learning (Activities' scanning switches) |
| `shared/hold.js/.css`, `shared/fonts.css` | Hold-to-open ⚙; bundled Nunito |
| `scenes/art.js` | Per theme: `animals` (habitat perch/ground/water, width %, facing r/l/f, move), `switchCast`, and `scenes` (each: SVG drawing, `spots`, `places`, `residents`, `track`, `splashes` = rain-ring points on its water). `SceneTracks` = background loops; `SceneWeather` = the weathers (label, hint, optional sound) |
| `scenes/scenes.js` | Scene engine, settings (`animalScenes.settings`), jobs, `makeLooper()` crossfading loops (track and weather sounds), weather (`drawWeather`, `setWeather`, `pressWeather`, strength 1–5 as `st1..5` on each weather layer + `.lv2…lv5` (stage `wx-s1..5` only for lean and snowy ground), easing off, thunder) |
| `scenes/presets.js` | Presets (`animalScenes.presets`): ready-made list, save/update/rename/delete, `usePreset()`, `#preset=<id>` links. Jobs stored by switch number, not switch id |
| `scenes/setup.js` | Set-up screen |
| `openmoji/`, `fish/`, `sounds/`, `sounds/ambient/`, `sounds/weather/` | All assets are local (offline) |
| `dev/` | Test server and walk-through (see Testing) |

localStorage keys: `animalWorld.settings` (Activities), `animalWorld.switches` (shared), `animalScenes.settings`, `animalScenes.presets`.

## Adding things
- **A theme's animal**: add to `shared/themes.js`; download its SVG to `openmoji/` (see README).
- **A scene theme**: add a theme entry to `SceneArt` in `scenes/art.js` (animals + scenes), CSS
  palettes `.scene-<theme>-<scene>.look-soft|line|night` in `scenes/scenes.css`, and a track in
  `sounds/ambient/`. Birds is the template. Scenes are 1600×900; keep spots within x 15–85% (squarer
  screens trim the sides). OpenMoji art has ~14% empty space under the feet (handled in CSS).
- **Sounds**: CC0 only (Freesound). Animal calls levelled to about −16 LUFS, background loops about
  −26 LUFS, peaks limited; credit each in `sounds/_Adding Sounds.md`. Tooling: `pip install
  imageio-ffmpeg` gives an ffmpeg binary; pass `-nostdin` when looping over a heredoc.

## Conventions
- Match the existing style: short comments that say *why*, UK spelling, plain words in the UI.
- Files are CRLF in the working tree (Git autocrlf); when editing with Python, read normally and
  write with `newline='\r\n'`.
- Settings loaders keep only known keys of the right type, so old saves can't break new defaults.
  When a setting changes meaning, migrate old values (see `loadSettings()` in `settings.js`).
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
- Command shape: `chrome --headless=new --disable-gpu --autoplay-policy=no-user-gesture-required
  --virtual-time-budget=60000 --dump-dom URL` (or `--screenshot=... --window-size=1280,720`).
- Gotchas: with virtual time, CSS transitions/animations may not advance once the page is idle, so
  test fades via `document.getAnimations()` (seek `currentTime`) rather than waiting. Audio doesn't
  actually play headless; check that `Audio` objects are created (wrap `window.Audio`). Simulate an
  Adaptive Controller by overriding `navigator.getGamepads` and dispatching `gamepadconnected`.
  Headless windows are at least 500 px wide. Never `taskkill` all of chrome.exe (it closes the
  user's browser); stop the test server by its port.

## Working with the owner
- Work on a feature branch; commit and push the branch at each tested stage; **don't merge to
  `main` until asked** (merging publishes to the live site).
- Explain look-and-feel options before building bigger features; they like mock-ups for visuals.
- Animal names are spoken only when the Sound setting asks (Fish theme excepted); never add
  automatic speech for individual animals.
- Saved set-ups in Scenes are called "presets"; don't name anything after students.
