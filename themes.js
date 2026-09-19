// The themes shown on the home screen. Each animal needs:
//   name   - the label on its card
//   code   - an OpenMoji hexcode; the SVG must be in openmoji/ (see README), or
//   src    - a path to our own artwork, as the fish theme does
//   sound  - a file in sounds/, without the .mp3
// Set `speakName: true` on a theme to say each name after its sound (see fish).
// A theme also needs a home-screen button in index.html and colours in styles.css
// (search for the theme's css class, e.g. theme-birds).

const themes = {
    forest: {
        label: '🌲 Forest Animals',
        css: 'theme-forest',
        icon: '⭐',
        animals: [
            { name: 'Fox',       code: '1F98A', sound: 'fox' },
            { name: 'Owl',       code: '1F989', sound: 'owl' },
            { name: 'Bear',      code: '1F43B', sound: 'bear' },
            { name: 'Wolf',      code: '1F43A', sound: 'wolf' },
            { name: 'Badger',    code: '1F9A1', sound: 'badger' },
            { name: 'Squirrel',  code: '1F43F', sound: 'squirrel' },
            { name: 'Deer',      code: '1F98C', sound: 'deer' },
            { name: 'Hedgehog',  code: '1F994', sound: 'hedgehog' },
            { name: 'Rabbit',    code: '1F407', sound: 'rabbit' },
            { name: 'Frog',      code: '1F438', sound: 'frog' },
            { name: 'Wild Boar', code: '1F417', sound: 'boar' },
            { name: 'Bat',       code: '1F987', sound: 'bat' },
            { name: 'Snake',     code: '1F40D', sound: 'snake' },
            { name: 'Beaver',    code: '1F9AB', sound: 'beaver' },
            { name: 'Otter',     code: '1F9A6', sound: 'otter' },
            { name: 'Mouse',     code: '1F401', sound: 'mouse' },
        ]
    },
    safari: {
        label: '🌅 Safari Animals',
        css: 'theme-safari',
        icon: '⭐',
        animals: [
            { name: 'Lion',      code: '1F981', sound: 'lion' },
            { name: 'Elephant',  code: '1F418', sound: 'elephant' },
            { name: 'Giraffe',   code: '1F992', sound: 'giraffe' },
            { name: 'Zebra',     code: '1F993', sound: 'zebra' },
            { name: 'Hippo',     code: '1F99B', sound: 'hippo' },
            { name: 'Rhino',     code: '1F98F', sound: 'rhino' },
            { name: 'Monkey',    code: '1F412', sound: 'monkey' },
            { name: 'Crocodile', code: '1F40A', sound: 'crocodile' },
            { name: 'Leopard',   code: '1F406', sound: 'leopard' },
            { name: 'Gorilla',   code: '1F98D', sound: 'gorilla' },
            { name: 'Flamingo',  code: '1F9A9', sound: 'flamingo' },
            { name: 'Chameleon', code: '1F98E', sound: 'chameleon' },
            { name: 'Camel',     code: '1F42A', sound: 'camel' },
            { name: 'Scorpion',  code: '1F982', sound: 'scorpion' },
            { name: 'Warthog',   code: '1F417', sound: 'warthog' },
            { name: 'Eagle',     code: '1F985', sound: 'eagle' },
        ]
    },
    ocean: {
        label: '🌊 Ocean Animals',
        css: 'theme-ocean',
        icon: '⭐',
        animals: [
            { name: 'Dolphin',    code: '1F42C', sound: 'dolphin' },
            { name: 'Whale',      code: '1F433', sound: 'whale' },
            { name: 'Seal',       code: '1F9AD', sound: 'seal' },
            { name: 'Penguin',    code: '1F427', sound: 'penguin' },
            { name: 'Sea Otter',  code: '1F9A6', sound: 'sea-otter' },
            { name: 'Shark',      code: '1F988', sound: 'shark' },
            { name: 'Crab',       code: '1F980', sound: 'crab' },
            { name: 'Turtle',     code: '1F422', sound: 'turtle' },
            { name: 'Octopus',    code: '1F419', sound: 'octopus' },
            { name: 'Jellyfish',  code: '1FABC', sound: 'jellyfish' },
            { name: 'Lobster',    code: '1F99E', sound: 'lobster' },
            { name: 'Clownfish',  code: '1F420', sound: 'clownfish' },
            { name: 'Squid',      code: '1F991', sound: 'squid' },
            { name: 'Coral',      code: '1FAB8', sound: 'coral' },
            { name: 'Shrimp',     code: '1F990', sound: 'shrimp' },
            { name: 'Pufferfish', code: '1F421', sound: 'pufferfish' },
        ]
    },
    arctic: {
        label: '❄️ Polar Animals',
        css: 'theme-arctic',
        icon: '⭐',
        animals: [
            { name: 'Polar Bear',  code: '1F43B-200D-2744-FE0F', sound: 'polar-bear' },
            { name: 'Penguin',     code: '1F427', sound: 'penguin' },
            { name: 'Seal',        code: '1F9AD', sound: 'seal' },
            { name: 'Whale',       code: '1F40B', sound: 'whale' },
            { name: 'Moose',       code: '1FACE', sound: 'moose' },
            { name: 'Reindeer',    code: '1F98C', sound: 'reindeer' },
            { name: 'Arctic Fox',  code: '1F98A', sound: 'arctic-fox' },
            { name: 'Snowy Owl',   code: '1F989', sound: 'snowy-owl' },
            { name: 'Arctic Hare', code: '1F407', sound: 'arctic-hare' },
        ]
    },
    minibeasts: {
        label: '🐛 Mini Beasts',
        css: 'theme-minibeasts',
        icon: '⭐',
        animals: [
            { name: 'Bee',         code: '1F41D', sound: 'bee' },
            { name: 'Butterfly',   code: '1F98B', sound: 'butterfly' },
            { name: 'Caterpillar', code: '1F41B', sound: 'caterpillar' },
            { name: 'Snail',       code: '1F40C', sound: 'snail' },
            { name: 'Ant',         code: '1F41C', sound: 'ant' },
            { name: 'Cricket',     code: '1F997', sound: 'cricket' },
            { name: 'Spider',      code: '1F577', sound: 'spider' },
            { name: 'Mosquito',    code: '1F99F', sound: 'mosquito' },
            { name: 'Ladybird',    code: '1F41E', sound: 'ladybird' },
            { name: 'Beetle',      code: '1FAB2', sound: 'beetle' },
            { name: 'Cockroach',   code: '1FAB3', sound: 'cockroach' },
            { name: 'Fly',         code: '1FAB0', sound: 'fly' },
            { name: 'Worm',        code: '1FAB1', sound: 'worm' },
            { name: 'Scorpion',    code: '1F982', sound: 'scorpion' },
        ]
    },
    // Fish are effectively silent, so this theme speaks each name after the
    // sound cue (see speakName / playSound). Artwork marked `src` lives in
    // fish/ and is derived from the OpenMoji glyph named in that file.
    fish: {
        label: '🐠 Fish',
        css: 'theme-fish',
        icon: '⭐',
        speakName: true,
        animals: [
            { name: 'Clownfish',     src: 'fish/clownfish.svg',     sound: 'bubbles' },
            { name: 'Blue Tang',     src: 'fish/blue-tang.svg',     sound: 'bubbles' },
            { name: 'Goldfish',      code: 'E000',                  sound: 'bubbles' },
            { name: 'Koi',           src: 'fish/koi.svg',           sound: 'bubbles' },
            { name: 'Angelfish',     code: '1F420',                 sound: 'bubbles' },
            { name: 'Betta',         src: 'fish/betta.svg',         sound: 'bubbles' },
            { name: 'Pufferfish',    code: '1F421',                 sound: 'bubbles' },
            { name: 'Shark',         code: '1F988',                 sound: 'bubbles' },
            { name: 'Salmon',        src: 'fish/salmon.svg',        sound: 'bubbles' },
            { name: 'Rainbow Trout', src: 'fish/rainbow-trout.svg', sound: 'bubbles' },
            { name: 'Catfish',       src: 'fish/catfish.svg',       sound: 'bubbles' },
            { name: 'Swordfish',     src: 'fish/swordfish.svg',     sound: 'bubbles' },
        ]
    },
    birds: {
        label: '🐦 Birds',
        css: 'theme-birds',
        icon: '⭐',
        animals: [
            { name: 'Sparrow',  code: '1F426',           sound: 'sparrow' },
            { name: 'Crow',     code: '1F426-200D-2B1B', sound: 'crow' },
            { name: 'Owl',      code: '1F989',           sound: 'owl' },
            { name: 'Eagle',    code: '1F985',           sound: 'eagle' },
            { name: 'Duck',     code: '1F986',           sound: 'duck' },
            { name: 'Swan',     code: '1F9A2',           sound: 'swan' },
            { name: 'Goose',    code: '1FABF',           sound: 'goose' },
            { name: 'Pigeon',   code: 'E009',            sound: 'pigeon' },
            { name: 'Hen',      code: '1F414',           sound: 'hen' },
            { name: 'Rooster',  code: '1F413',           sound: 'rooster' },
            { name: 'Chick',    code: '1F425',           sound: 'chick' },
            { name: 'Turkey',   code: '1F983',           sound: 'turkey' },
            { name: 'Parrot',   code: '1F99C',           sound: 'parrot' },
            { name: 'Peacock',  code: '1F99A',           sound: 'peacock' },
            { name: 'Flamingo', code: '1F9A9',           sound: 'flamingo' },
            { name: 'Penguin',  code: '1F427',           sound: 'penguin' },
        ]
    },
    // Hen, Rooster, Chick, Duck, Goose, Turkey and Mouse share their sounds with
    // the Birds and Forest themes. The llama's call is an alpaca, a close relative.
    farm: {
        label: '🚜 Farm Animals',
        css: 'theme-farm',
        icon: '⭐',
        animals: [
            { name: 'Cow',     code: '1F404', sound: 'cow' },
            { name: 'Pig',     code: '1F416', sound: 'pig' },
            { name: 'Sheep',   code: '1F411', sound: 'sheep' },
            { name: 'Goat',    code: '1F410', sound: 'goat' },
            { name: 'Horse',   code: '1F40E', sound: 'horse' },
            { name: 'Donkey',  code: 'E001',  sound: 'donkey' },
            { name: 'Dog',     code: '1F415', sound: 'dog' },
            { name: 'Cat',     code: '1F408', sound: 'cat' },
            { name: 'Hen',     code: '1F414', sound: 'hen' },
            { name: 'Rooster', code: '1F413', sound: 'rooster' },
            { name: 'Chick',   code: '1F425', sound: 'chick' },
            { name: 'Duck',    code: '1F986', sound: 'duck' },
            { name: 'Goose',   code: '1FABF', sound: 'goose' },
            { name: 'Turkey',  code: '1F983', sound: 'turkey' },
            { name: 'Llama',   code: '1F999', sound: 'llama' },
            { name: 'Mouse',   code: '1F401', sound: 'mouse' },
        ]
    }
};
