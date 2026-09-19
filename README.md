# Animal World 🌍

An interactive animal learning app for classroom use. Plain HTML, CSS and JavaScript — no build step.

The front page offers two parts:
- **Animal Activities** — pick a theme, then an activity (below). Open it directly at `index.html#activities`.
- **Animal Scenes** — calm, interactive animal scenes for touch screens and switches, for sensory rooms
  and large touch projectors. Open it directly at `scenes.html`. Every theme has scenes: Forest, Safari, Ocean, Mini Beasts, Polar, Fish, Birds and Farm.

## Animal Scenes
A full-screen scene drawn in code, so it fills any screen shape and works offline. It opens on a choice of
animals (one button per theme, like Animal Activities' theme picker); that tap starts the sound
and goes full screen, and a switch or key press starts the animals used last time. A preset's link skips
the choice. Touch an animal to hear it. Touch near an
empty place (a branch, a bush, the ground or the water) and an animal that lives there comes to that spot (if they're all
here, the longest-staying one moves over); this can be turned off in set-up. Every touch makes a ripple. Animals fly, walk, bound or swim in to the places the scene has for them (branches, ground,
water, or peeping over a bush); when every place of that kind is taken, the one that has been there longest leaves. A quiet
background track plays under the calls.

Birds has three scenes, each with its own track: 🌳 **Garden** (room for 10 birds), 🌲 **Woodland**
(11, mostly on branches, with a stream) and 🏞️ **Lakeside** (11, mostly on the water, with a jetty).
Forest Animals has three scenes too: 🌲 **Woodland** (room for 14), 🏞️ **Riverbank** (15, with a
beaver's lodge) and 🍄 **Clearing** (13, with a log and a pond). The fox, bear and wolf pictures are
only heads, so they pop up from behind a bush or log and then sit in front of it (and go back behind
it to leave); the bat hangs upside down under its branch; the frog, otter and beaver sit in the water.
Farm Animals has 🚜 **Farmyard** (a red barn, hay bales, a fence and a pond), 🌾 **Fields** (a
five-bar gate, round bales and a far-off farmhouse) and 🦆 **Duck pond** (a farmhouse and a willow);
the rooster, cat and chick sit on the fence or gate, and the hen (only a head) pops up from behind a
hay bale.
Safari Animals has 🌅 **Savanna** (acacias, a mountain, tall grass the lion pops up from), 💧 **Waterhole**
(hippos, crocodiles and flamingos in the water) and 🌴 **Jungle** (gorilla, monkey, chameleon, a river).
Ocean Animals has 🏖️ **Seashore** (seals on the rocks, crabs and turtles on the beach, dolphins, a whale's
back and a shark's fin at sea), 🪸 **Coral reef** and 🌿 **Kelp forest**, both underwater (animals swim,
or live on the seabed; coral grows where it's placed). Mini Beasts is close up: 🌼 **Flower bed**,
🪵 **Log pile** and 🥬 **Veg patch**, with insects landing on flowers, crawlers on leaves, a spider letting
itself down on a thread and a worm popping out of the soil. Polar Animals has 🧊 **Sea ice**,
🌲 **Snowy forest** and ❄️ **Tundra** (the arctic fox and moose pop up from behind snowdrifts). Fish has
🐠 **Coral reef**, 🐟 **Fish tank** (a castle and a treasure chest) and 🏞️ **River**.
Each scene has its own animals (no camel in the jungle), its own background track, and weather that
suits it; set-up only offers the tracks of the animals chosen. Set-up shows how many animals each
scene has room for, and where. `scenes/art.js` has Birds, Forest and Farm and the shared drawing
pieces; each other theme is in `scenes/art-<theme>.js`.

Any scene can have **weather**, one at a time, fading in and out; each theme (or scene) has the weathers
that suit it. Forest and Mini Beasts have 🍂 Falling leaves (the trees turn golden, then orange); Safari
has 💨 Dusty wind and no snow; Polar has 🌌 Northern lights and no rain; underwater scenes have 🫧 Bubbles,
🌊 Current, ☀️ Sunbeams and ✨ Glow instead. The others: 🌧️ Rain (with rings on the water),
⛈️ Storm (rain, a darker sky, and now and then a faint bolt of lightning and far-off thunder), ❄️ Snow
(crystal snowflakes near and far, turning as they fall; heavy snow slants and whitens the ground), 🍃 Wind (leaves blow across,
the trees lean, and strong wind brings gusts), 🌫️ Fog (some drifting in front of the animals) and 🌈 Rainbow (sparkles, then a second
bow as it strengthens). Rain and wind have their own quiet sounds. Weather has five strengths, each heavier and quicker than the
last: by default each press of a weather switch, or a touch on the sky, makes it a step stronger
(a new weather starts at the lightest), and left alone it eases back to the scene's own weather,
which sits in the middle. A strong storm brings bigger, brighter bolts every few
seconds (never two within a second, and set-up can switch lightning off), a blizzard frosts the trees
and freezes the pond, and thick fog becomes a near white-out.

While a scene plays, hold the dimmed **←** in the top-left corner for two seconds to go back to the
choice of animals. Hold the dimmed ⚙ in the top-right corner for two seconds to open **Set-up** (it
works from the start screen too):
- **Presets** — saved set-ups (scene, look, speed, weather, switch jobs). Each set of animals has its
  own, and set-up shows only those for the animals chosen. Ready-made for Birds: 🌳 Calm garden,
  🌦️ Weather play, 🦉 Night owls and 🏞️ Busy lake; for Forest Animals: 🦊 Peek-a-boo, 🦫 Riverbank and
  🦇 Forest at night; for Farm Animals: 🚜 Busy farmyard, 🌾 In the fields and 🦆 Rainy duck pond; and three
  for each of the other themes. Use one, save the set-up as a new preset,
  save changes into a preset, rename or delete (deleted ready-made ones can be brought back). Each has
  a link, `scenes.html#preset=<name>`, that opens straight into it — handy as a desktop shortcut.
- **Scene** — which scene, the look (Soft flat, Matching outlines, Night-light), speed, whether touching an
  empty place brings an animal, when animals leave (never,
  when touched, or after 30 seconds to 2 minutes without being touched or called), and how long look
  and weather changes take to fade (2 to 20 seconds).
- **Weather** — the scene's own weather (Clear by default), whether weather switches build up (the
  default) or turn weather on and off, and how long each step lasts before it eases off.
- **Switches** — add up to twelve switches: tap Learn and press the switch (SimplyWorks, Bluetooth,
  keyboard, Xbox Adaptive Controller), pick a colour to match the real switch, and give each a job:
  bring in a particular animal, 🎲 Random, 🌗 Day / night, 🎨 Next look, 🗺️ Next scene, 👋 Goodbye
  (the longest-staying animal leaves), 🌙 Everyone leaves, a weather, 🌦️ Next weather, ⚡ Thunder, or
  nothing. Five switches are always ready to learn.
  Switch labels in those colours can be shown along the top of the screen. A wait between presses (1, 2 or 3
  seconds, or "When finished": until an animal has arrived or a change has faded in) stops a flurry of
  presses setting everything off at once. Keys and buttons that
  aren't learned do something random (or nothing), so any switch works straight away. Look changes
  fade gently rather than jump.
- **Sound** — animal sounds, background sound and weather sounds, each Off, Quiet, Medium or Loud, and the
  background track: the scene's own (each scene has its own), or any of the others.


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
| `scenes/art.js`, `scenes/art-*.js` | Each scene's drawing, spots and how its animals behave (one file per theme after Birds, Forest and Farm) |
| `scenes/scenes.js`, `scenes/setup.js`, `scenes/presets.js`, `scenes/scenes.css` | Animal Scenes itself, its set-up screen and presets |
| `sounds/ambient/` | Background loops for Animal Scenes |
| `sounds/weather/` | Rain, wind and thunder for Animal Scenes' weather |
| `shared/hold.js`, `shared/hold.css` | The hold-to-open ⚙ button, used by both parts |
| `dev/` | A test server and a walk-through of every theme and activity, for development (see `CLAUDE.md`) |
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
