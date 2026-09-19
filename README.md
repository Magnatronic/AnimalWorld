# Animal World 🌍

An interactive animal learning app for classroom use. Plain HTML, CSS and JavaScript — no build step.

## Activities
- **Explore Animals** — tap each animal to hear its sound
- **Memory Game** — find the matching pairs, with four difficulty levels
- **Whack-a-Mole** — tap the animals before they disappear, or play the untimed Relaxed level
- **Find the Animal** — listen to the animal name and tap the correct picture

## Themes
Forest 🌲 · Safari 🌅 · Ocean 🌊 · Mini Beasts 🐛 · Polar ❄️ · Fish 🐠 · Birds 🐦

## Settings
Press and hold the ⚙ button (bottom right) for two seconds to open Settings. A quick tap only
shows a reminder, so students can't open it by accident. Changes are saved in the browser, so
each computer remembers its own setup.

- **Switch** — switch scanning for AAC users: scan mode, speed, start delay, loops and switch key.
  Whether scanning is on is remembered too.
- **Play area** — shrinks the app into a box at the bottom left, centre or right of the screen,
  for students who can't reach the top of a large touchscreen. The Back button can move to the
  bottom, and the Switch and ⚙ buttons move up out of reach.
- **Games** — Whack-a-Mole hole count (4, 6 or 9), how many animals a Relaxed round has, and
  how long the timed levels last.
- **Sound** — volume, and whether every animal's name is spoken after its sound.

## Usage
Open `index.html` in any modern browser. An internet connection is required to load animal images.

Keep the whole folder together — `index.html` loads the files and folders below from alongside it.

## Files
| Path | What it holds |
|------|---------------|
| `index.html` | The screens and buttons |
| `styles.css` | All styling, including each theme's colours |
| `themes.js` | The themes and their animals — start here to add or change a theme |
| `settings.js` | The Settings panel: defaults, saving and the Play area |
| `app.js` | The activities, sound playback and switch scanning |
| `sounds/` | One `.mp3` per animal — see `sounds/_Adding Sounds.md` |
| `fish/` | Artwork for the Fish theme |

## Hosting
Live at: [https://Magnatronic.github.io/AnimalWorld](https://Magnatronic.github.io/AnimalWorld)

## Credits
Animal images: [OpenMoji](https://openmoji.org/) — the open-source emoji and icon project.  
License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

The fish in `fish/` are our own derivatives of OpenMoji glyphs (`1F41F` and `1F420`),
recoloured and remarked as named species. Each file records the glyph it came from.
Under ShareAlike they are likewise CC BY-SA 4.0.
