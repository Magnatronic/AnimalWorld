# Animal World 🌍

An interactive animal learning app for classroom use. Plain HTML, CSS and JavaScript — no build step.

The front page offers two parts:
- **Animal Activities** — pick a theme, then an activity (below). Open it directly at `index.html#activities`.
- **Animal Scenes** — calm, interactive animal scenes for touch screens and switches, for sensory rooms
  and large touch projectors. Open it directly at `scenes.html`. *(Birds so far; more themes coming.)*

## Animal Scenes
A full-screen scene drawn in code, so it fills any screen shape and works offline. Tap to start (the
first tap or key press starts the sound and goes full screen). Touch an animal to hear it, or anywhere
for a ripple. Animals fly, walk or swim in; when every spot for them is taken, the one that has been
there longest leaves. A quiet background loop (garden birdsong for Birds) plays under the calls.

Hold the dimmed ⚙ in the top corner for two seconds to open **Set-up** (it works from the start
screen too):
- **Scene** — the look (Soft flat, Matching outlines, Night-light), speed, and how long animals stay
  (until replaced, or they leave after 30 seconds to 2 minutes without being touched or called).
- **Switches** — add up to twelve switches: tap Learn and press the switch (SimplyWorks, Bluetooth,
  keyboard, Xbox Adaptive Controller), pick a colour to match the real switch, and give each a job:
  bring in a particular animal, 🎲 Random, 🌗 Day / night, 🎨 Next look, 👋 Goodbye (the longest-
  staying animal leaves), 🌙 Everyone leaves, or nothing. Five switches are always ready to learn.
  Switch labels in those colours can be shown along the top of the screen. Keys and buttons that
  aren't learned do something random (or nothing), so any switch works straight away. Look changes
  fade gently rather than jump.
- **Sound** — animal sounds and background sound, each Off, Quiet, Medium or Loud.


## Activities
- **Explore Animals** — tap each animal to hear its sound
- **Memory Game** — find the matching pairs, with four difficulty levels
- **Whack-a-Mole** — tap the animals before they disappear, or play the untimed Relaxed level
- **Find the Animal** — listen to the animal name and tap the correct picture

## Themes
Forest 🌲 · Safari 🌅 · Ocean 🌊 · Mini Beasts 🐛 · Polar ❄️ · Fish 🐠 · Birds 🐦 · Farm 🚜

## Settings
Press and hold the ⚙ button (bottom right) for two seconds to open Settings. A quick tap only
shows a reminder, so students can't open it by accident. Changes are saved in the browser, so
each computer remembers its own setup.

- **Scanning** — switch scanning for AAC users. Three modes: **Auto** (the highlight moves on its
  own), **Press to Start**, and **Two Switches** (one switch moves the highlight, the other chooses,
  with no timer). Only the options for the chosen mode are shown. The scanning switch — or, for two
  switches, the Move and Select switches — are learned right there: tap Learn and press the switch.
  That works with anything that sends a keystroke (Pretorian SimplyWorks SEND-6, Bluetooth switches,
  keyboards) and with the Xbox Adaptive Controller; in Chrome and Edge a controller is only noticed
  after one of its buttons has been pressed on the page. Space / Enter (or any key) remain one tap
  away, Move and Select can't be the same switch, and whether scanning is on is remembered too.
- **Play area** — shrinks the app into a box at the bottom left, centre or right of the screen,
  for students who can't reach the top of a large touchscreen. The Back button can move to the
  bottom, and the Switch and ⚙ buttons move up out of reach.
- **Games** — Whack-a-Mole hole count (4, 6 or 9), how many animals a Relaxed round has, and
  how long the timed levels last.
- **Sound** — volume, whether every animal's name is spoken after its sound, and the voice:
  which one, its speed and its pitch, with a button to test it. The voices on offer depend on the
  browser; Microsoft Edge has the most lifelike ("Natural") ones, which need the internet.

## Usage
Open `index.html` in any modern browser. Everything it needs — pictures, sounds and font — is in this
folder, so it works with no internet connection.

Keep the whole folder together — `index.html` loads the files and folders below from alongside it.

## Files
| Path | What it holds |
|------|---------------|
| `index.html` | Animal World's front page and Animal Activities' screens |
| `scenes.html` | Animal Scenes |
| `scenes/art.js` | Each scene's drawing, spots and how its animals behave |
| `scenes/scenes.js`, `scenes/setup.js`, `scenes/scenes.css` | Animal Scenes itself and its set-up screen |
| `sounds/ambient/` | Background loops for Animal Scenes |
| `shared/hold.js`, `shared/hold.css` | The hold-to-open ⚙ button, used by both parts |
| `styles.css` | Animal Activities' styling, including each theme's colours |
| `shared/themes.js` | The themes and their animals, used by both parts — start here to add or change a theme |
| `shared/fonts.css` | The Nunito font, used by both parts |
| `shared/switches.js` | Learning and reading switches (keys and the Xbox Adaptive Controller), used by both parts |
| `settings.js` | The Settings panel: defaults, saving and the Play area |
| `app.js` | The activities, sound playback and switch scanning |
| `sounds/` | One `.mp3` per animal — see `sounds/_Adding Sounds.md` |
| `fish/` | Artwork for the Fish theme |
| `openmoji/` | The OpenMoji pictures the themes use, one SVG per hexcode |
| `fonts/` | The Nunito font |

To give a theme an OpenMoji animal it doesn't have yet, find its hexcode on
[openmoji.org](https://openmoji.org), download
`https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/<HEXCODE>.svg` into `openmoji/`,
and use the hexcode as the animal's `code` in `shared/themes.js`.

## Hosting
Live at: [https://Magnatronic.github.io/AnimalWorld](https://Magnatronic.github.io/AnimalWorld)

## Credits
Font: [Nunito](https://github.com/googlefonts/nunito) by The Nunito Project Authors,
[SIL Open Font License 1.1](fonts/OFL.txt).

Animal images: [OpenMoji](https://openmoji.org/) — the open-source emoji and icon project.  
License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

The fish in `fish/` are our own derivatives of OpenMoji glyphs (`1F41F` and `1F420`),
recoloured and remarked as named species. Each file records the glyph it came from.
Under ShareAlike they are likewise CC BY-SA 4.0.
