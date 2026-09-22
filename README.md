# Animal World 🌍

An interactive animal learning app for classroom use. Plain HTML, CSS and JavaScript — no build step.

The front page offers two parts:
- **Animal Activities** — pick a theme, then an activity (below). Open it directly at `index.html#activities`.
- **Animal Scenes** — calm, interactive animal scenes for touch screens and switches, for sensory rooms
  and large touch projectors. Open it directly at `scenes.html`. Every theme has scenes: Forest, Safari, Ocean, Mini Beasts, Polar, Fish, Birds and Farm.

## Animal Scenes
A full-screen scene drawn in code, so it fills any screen shape and works offline. It opens on a choice of
animals (one button per theme, like Animal Activities' theme picker); that tap starts the sound
and goes full screen, and a key press (or a keystroke switch) starts the animals used last time. Switches
that come in as a controller, like the sensory room's, can't start it — browsers only allow sound after a
tap or a key — so tap the screen first; after that they work. A preset's link skips the choice. Touch an animal to hear it. Touch near an
empty place (a branch, a bush, the ground or the water) and an animal that lives there comes to that spot (if they're all
here, the longest-staying one moves over); this can be turned off in set-up. Every touch makes a ripple. Animals fly, walk, bound, climb, swim or surface into the places the scene
has for them (branches, the ground, the water, or peeping over a bush); when every place of that kind is
taken, the one that has been there longest leaves. A quiet background track plays under the calls.

Every theme has three scenes:
- 🐦 **Birds** — 🌳 Garden, 🌲 Woodland (mostly branches, with a stream) and 🏞️ Lakeside (mostly water,
  with a jetty). The hen's picture is only a head, so she pops up from behind a bush.
- 🌲 **Forest Animals** — 🌲 Woodland, 🏞️ Riverbank (a beaver's lodge) and 🍄 Clearing (a fallen log and
  a pond). The fox, bear and wolf are only heads, so they pop up from behind a bush or log; the bat hangs
  upside down under its branch; the frog, otter and beaver sit in the water.
- 🚜 **Farm Animals** — 🚜 Farmyard (a red barn, hay bales, a fence and a pond), 🌾 Fields (a five-bar
  gate and round bales) and 🦆 Duck pond. The rooster, cat and chick sit on the fence, and the hen pops
  up from behind a hay bale.
- 🌅 **Safari Animals** — 🌅 Savanna (acacias and tall grass the lion pops up from), 💧 Waterhole (hippos,
  crocodiles and flamingos in the water) and 🌴 Jungle (gorilla, monkey, chameleon and a river).
- 🌊 **Ocean Animals** — 🏖️ Seashore (seals on the rocks, crabs and turtles on the beach, a whale's back
  and a shark's fin at sea), and 🪸 Coral reef and 🌿 Kelp forest, both underwater, where animals swim or
  live on the seabed and coral grows where it's placed.
- ❄️ **Polar Animals** — 🧊 Sea ice, 🌲 Snowy forest and ❄️ Tundra. The arctic fox and moose pop up from
  behind snowdrifts, and the seal and whale surface in the water.
- 🐛 **Mini Beasts** — close up: 🌼 Flower bed, 🪵 Log pile and 🥬 Veg patch, with insects landing on
  flower heads, crawlers on leaves, a spider letting itself down on a thread and a worm out of the soil.
- 🐠 **Fish** — 🐠 Coral reef, 🐟 Fish tank (a castle and a treasure chest) and 🏞️ River. Each fish
  bubbles when it arrives or is touched.

Animals arrive in ways that make sense: birds, bats and insects fly in; climbers (squirrels, monkeys, the
leopard, snails and caterpillars, a cat onto a fence) run in along the ground and up the trunk or stem;
swimmers surface in their pool rather than cross dry land; walkers come in from the nearer side, never
across water; head-only pictures pop up from behind something and then sit in front of it. Where a scene
has more places than animals to fill them, a second of the same animal can come. Some animals are
recoloured to suit their theme (a white snowy owl, arctic fox and arctic hare, a red squirrel, a brown
wild rabbit and wood mouse, a grey warthog; `scenes/pictures/`). Animal Activities shows those same
pictures, so an animal looks the same in both halves.

Each scene has its own animals (no camel in the jungle), its own background track, and weather that suits
it: in fog, animals further back fade into the mist, and over snow the wind blows fine snow, on the beach
sand, instead of leaves. Set-up only offers the tracks of the animals chosen, and shows how many animals
each scene has room for, and where. `scenes/art.js` holds Birds, Forest and Farm and the drawing pieces
they all share; each other theme is in `scenes/art-<theme>.js`.

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

While a scene plays, tap the dimmed **←** in the top-left corner to go back to the
choice of animals. Tap the dimmed ⚙ in the top-right corner to open **Set-up** (it
works from the start screen too):
- **Presets** — saved set-ups (scene, look, speed, weather, switch jobs). Each set of animals has its
  own, and set-up shows only those for the animals chosen. Ready-made for Birds: 🌳 Calm garden,
  🌦️ Weather play, 🦉 Night owls and 🏞️ Busy lake; for Forest Animals: 🦊 Peek-a-boo, 🦫 Riverbank and
  🦇 Forest at night; for Farm Animals: 🚜 Busy farmyard, 🌾 In the fields and 🦆 Rainy duck pond; and three
  for each of the other themes. Every theme also has a 🌦️ Weather play, made for the room's switches:
  the colours match the weather where the theme has it (red ⛈️ storm, yellow 🌈 rainbow, green 🍃 wind,
  blue 🌧️ rain, white ❄️ snow or 🌫️ fog), themes without those use their own (Polar's northern lights,
  the Fish tank's sunbeams, 🌦️ Next weather on red), and the single switch is 🌗 Day / night.
  Use one, save the set-up as a new preset,
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
  The sensory room's switches are already set up (the first time it opens, they replace any learned before): its
  SimplyWorks receiver shows up as a controller, and the five-switch box (red, yellow, green, blue,
  white = controller buttons 12–16) and the single white switch (button 18) are switches 1–6. In
  every ready-made preset the single switch is 🎲 Random. "Use the room's switches" puts them back.
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
Tap the ⚙ button (bottom right) to open Settings. It is small, dim and cornered to keep it out of
the students' way. Changes are saved in the browser, so each computer remembers its own setup.

- **Scanning** — switch scanning for AAC users. Three modes: **Auto** (the highlight moves on its
  own), **Press to Start**, and **Two Switches** (one switch moves the highlight, the other chooses,
  with no timer). Only the options for the chosen mode are shown. The scanning switch — or, for two
  switches, the Move and Select switches — are learned right there: tap Learn and press the switch.
  That works with anything that sends a keystroke (Pretorian SimplyWorks SEND-6, Bluetooth switches,
  keyboards) and with the Xbox Adaptive Controller; in Chrome and Edge a controller is only noticed
  after one of its buttons has been pressed on the page. Space / Enter (or any key) remain one tap
  away, Move and Select can't be the same switch, and whether scanning is on is remembered too.
  Space and Enter also take the sensory room's SimplyWorks switches, with nothing to learn: the
  single white switch for one-switch scanning, and for two switches yellow to move and green to choose.
- **Play area** — shrinks the app into a box for students who can't reach the whole of a large
  touchscreen, in any of six places: bottom left, centre or right, or the same three halfway up,
  which lifts the box off the floor on a projector hung very low. The Back button can move to the
  bottom, and the Switch and ⚙ buttons move up out of reach.
- **Games** — Whack-a-Mole hole count (4, 6 or 9), how many animals a Relaxed round has, and
  how long the timed levels last.
- **Sound** — volume, whether every animal's name is spoken after its sound, and the voice:
  which one, its speed and its pitch, with a button to test it. The voices on offer depend on the
  browser; Microsoft Edge has the most lifelike ("Natural") ones, which need the internet.

## Running it offline
Animal World needs no internet connection, no installation and no web server. Everything it uses —
pictures, sounds and the font — is in this folder.

1. **Get the folder.** On [the GitHub page](https://github.com/Magnatronic/AnimalWorld), choose
   **Code ▸ Download ZIP** (or `git clone https://github.com/Magnatronic/AnimalWorld.git`).
2. **Unzip it** somewhere the computer keeps — a Documents folder, or a USB stick to carry between
   rooms. Keep the whole folder together: `index.html` loads everything else from alongside it, so
   `index.html` on its own opens to a blank screen.
3. **Double-click `index.html`** for the front page and Animal Activities, or `scenes.html` to go
   straight to Animal Scenes. Any modern browser will do — Chrome, Edge or Firefox.
4. **Press F11** for full screen. Animal Scenes goes full screen by itself once the animals are chosen.

To put it one tap away on a classroom machine, drag `index.html` (or `scenes.html`, or a preset's
`scenes.html#preset=<name>` link) to the desktop to make a shortcut.

### What has to travel with it
Unzipping keeps everything together, so this only matters if you are copying files by hand. These are
what the two pages load; leave one out and its pictures or sounds go missing:

| Keep | What would be lost |
|------|--------------------|
| `index.html`, `scenes.html`, `app.js`, `settings.js`, `styles.css` | the app itself |
| `shared/` | the themes and their animals, the font, switches, the ⚙ button |
| `scenes/` | Animal Scenes, and the recoloured animals both halves use |
| `sounds/` | every animal's call, and Scenes' background and weather sounds |
| `openmoji/` | most of the animal pictures |
| `fish/` | the Fish theme's artwork |
| `fonts/` | Nunito — the app still works, in a plainer typeface |

`dev/` is only for working on the app; a classroom copy doesn't need it. Keep `LICENSE` with it if you
pass it on.

Settings, presets and learned switches are saved in that browser on that computer, so each machine
keeps its own setup — nothing is sent anywhere, and there is no account to sign in to.

One thing does want the internet: Microsoft Edge's most lifelike ("Natural") voices, if spoken animal
names are turned on in Settings ▸ Sound. Offline, pick one of the other voices in that list — those
come with the computer and work anywhere. Everything else is unaffected.

## Files
| Path | What it holds |
|------|---------------|
| `index.html` | Animal World's front page and Animal Activities' screens |
| `scenes.html` | Animal Scenes |
| `scenes/art.js`, `scenes/art-*.js` | Each scene's drawing, spots and how its animals behave (one file per theme after Birds, Forest and Farm) |
| `scenes/scenes.js`, `scenes/setup.js`, `scenes/presets.js`, `scenes/scenes.css` | Animal Scenes itself, its set-up screen and presets |
| `scenes/pictures/` | Animals recoloured for a theme (a white snowy owl, a red squirrel…), used by both parts |
| `sounds/ambient/` | Background loops for Animal Scenes, one per scene |
| `sounds/weather/` | Rain, wind and thunder for Animal Scenes' weather |
| `shared/hold.js`, `shared/hold.css` | The adult's ⚙ and ← buttons, and turning off the browser's long-press menu |
| `dev/` | A test server and a walk-through of every theme and activity, for development (see `CLAUDE.md`) |
| `styles.css` | Animal Activities' styling, including each theme's colours |
| `shared/themes.js` | The themes and their animals, used by both parts — start here to add or change a theme |
| `shared/fonts.css` | The Nunito font, used by both parts |
| `shared/switches.js` | Learning and reading switches (keys and the Xbox Adaptive Controller), used by both parts |
| `settings.js` | The Settings panel: defaults, saving and the Play area |
| `app.js` | The activities, sound playback and switch scanning |
| `sounds/` | One `.mp3` per animal, plus `scene-bubbles.mp3` for fish in Animal Scenes — see `sounds/_Adding Sounds.md` |
| `fish/` | Artwork for the Fish theme |
| `openmoji/` | The OpenMoji pictures the themes use, one SVG per hexcode |
| `fonts/` | The Nunito font |

To give a theme an OpenMoji animal it doesn't have yet, find its hexcode on
[openmoji.org](https://openmoji.org), download
`https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg/<HEXCODE>.svg` into `openmoji/`,
and use the hexcode as the animal's `code` in `shared/themes.js`.

## Hosting
Live at: [https://Magnatronic.github.io/AnimalWorld](https://Magnatronic.github.io/AnimalWorld)

## Licence
Animal World's own code — see [LICENSE](LICENSE). Use it, change it, pass it on, at no cost; keep the
copyright notice with it. No warranty of any kind.

A personal project, maintained in my own time. Happy to answer questions about setting it up, but
there is no support commitment attached.

The artwork, sounds and font that come with it are other people's work and keep their own terms:

## Credits
Font: [Nunito](https://github.com/googlefonts/nunito) by The Nunito Project Authors,
[SIL Open Font License 1.1](fonts/OFL.txt).

Animal images: [OpenMoji](https://openmoji.org/) — the open-source emoji and icon project.  
License: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

The fish in `fish/` are our own derivatives of OpenMoji glyphs (`1F41F` and `1F420`),
recoloured and remarked as named species, and the pictures in `scenes/pictures/` are OpenMoji glyphs
recoloured to suit a theme (a white snowy owl, a red squirrel…). Each file records the glyph it came
from. Under ShareAlike they are likewise CC BY-SA 4.0.

Background loops and animal sounds: CC0 recordings from [Freesound](https://freesound.org), each
credited in `sounds/_Adding Sounds.md`.
