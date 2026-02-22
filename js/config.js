// ─── Chart dimensions ───
export const MARGIN = { top: 30, right: 80, bottom: 10, left: 160 };
export const FULL_WIDTH = 1060;
export const FULL_HEIGHT = 620;
export const WIDTH = FULL_WIDTH - MARGIN.left - MARGIN.right;
export const HEIGHT = FULL_HEIGHT - MARGIN.top - MARGIN.bottom;

// ─── Bar race settings ───
export const MAX_BARS = 12; // max visible bars at once
export const BAR_PADDING = 0.15;

// ─── Date helper (avoids UTC-vs-local off-by-one) ───
export function parseLocalDate(str) {
  const [y, m, d] = str.replace(/\./g, "-").split("-").map(Number);
  return new Date(y, m - 1, d);
}

// ─── Deck themes (image + bar color overrides for deck views) ───
export const DECK_THEMES = {
  "Elves": {
    image: "images/decks/elves.png",
    barColor: "#7ee787",
  },
  "Caw Gates": {
    image: "images/decks/cawgates.png",
    barColor: "#d6e8f7",
  },
  "Gruul Ramp": {
    image: "images/decks/gruulramp.png",
    barColor: "#e8734a",
  },
  "Mono Blue Terror": {
    image: "images/decks/monoblueterror.png",
    barColor: "#6cb4ee",
  },
  "Gruul Ponza": {
    image: "images/decks/gruulponza.png",
    barColor: "#d4764e",
  },
  "Golgari Gardens": {
    image: "images/decks/golgarigardens.png",
    barColor: "#8a9a5b",
  },
  "Familiars": {
    image: "images/decks/familiars.png",
    barColor: "#a8b8d8",
  },
  "Jund": {
    image: "images/decks/jund.png",
    barColor: "#b5473a",
  },
  "Spy": {
    image: "images/decks/spy.png",
    barColor: "#4b0082",
  },
  "Whale Combo": {
    image: "images/decks/whalecombo.png",
    barColor: "#5bcefa",
  },
  "Mono Red Rally": {
    image: "images/decks/monoredrally.png",
    barColor: "#e05040",
  },
  "Naya Iniciativa": {
    image: "images/decks/nayainiciativa.png",
    barColor: "#d0a040",
  },
  "Mono Blue Faeries": {
    image: "images/decks/monobluefaeries.png",
    barColor: "#79c0ff",
  },
  "Dimir Terror": {
    image: "images/decks/dimirterror.png",
    barColor: "#536b90",
  },
  "Mono White": {
    image: "images/decks/monowhite.png",
    barColor: "#e8e0d0",
  },
  "Esper Affinity": {
    image: "images/decks/esperaffinity.png",
    barColor: "#a0b0c8",
  },
  "Altar Tron": {
    image: "images/decks/altartron.png",
    barColor: "#c0c0c0",
  },
  "Izzet Skred": {
    image: "images/decks/izzetskred.png",
    barColor: "#c84040",
  },
  "Turbo Fog": {
    image: "images/decks/turbofog.png",
    barColor: "#90c090",
  },
  "Mono Red Madness": {
    image: "images/decks/monoredmadness.png",
    barColor: "#d05030",
  },
  "Cyclestorm": {
    image: "images/decks/cyclestorm.png",
    barColor: "#404040",
  },
  "Simic Auras": {
    image: "images/decks/simicauras.png",
    barColor: "#50b070",
  },
  "Madness Burn": {
    image: "images/decks/madnessburn.png",
    barColor: "#ff6040",
  },
  "Fractius": {
    image: "images/decks/fractius.png",
    barColor: "#70b060",
  },
  "Frognito Rakdos": {
    image: "images/decks/frognitorakdos.png",
    barColor: "#a06830",
  },
  "Pestilence Cat": {
    image: "images/decks/pestilencecat.png",
    barColor: "#505050",
  },
  "Flicker Tron": {
    image: "images/decks/flickertron.png",
    barColor: "#6ea8d0",
  },
  "Petitioners": {
    image: "images/decks/petitioners.png",
    barColor: "#7895c0",
  },
  "Rakdos Madness": {
    image: "images/decks/rakdosmadness.png",
    barColor: "#c04050",
  },
  "Grixis Affinity": {
    image: "images/decks/grixisaffinity.png",
    barColor: "#8b4b6e",
  },
  "Mono Black Sacrifice": {
    image: "images/decks/monoblacksacrifice.png",
    barColor: "#6a4c6a",
  },
  "Dimir Criogenic": {
    image: "images/decks/dimircriogenic.png",
    barColor: "#4878a0",
  },
  "Bogles": {
    image: "images/decks/bogles.png",
    barColor: "#60b890",
  },
  "Dimir Control": {
    image: "images/decks/dimircontrol.png",
    barColor: "#384058",
  },
  "Boros Heroic": {
    image: "images/decks/borosheroic.png",
    barColor: "#e0a050",
  },
  "Eggs Tron": {
    image: "images/decks/eggstron.png",
    barColor: "#b0a080",
  },
  "Dimir Spirits": {
    image: "images/decks/dimirspirits.png",
    barColor: "#7090c0",
  },
  "Gruul Tokens": {
    image: "images/decks/gruultokens.png",
    barColor: "#b8843c",
  },
  "Izzet Dragons": {
    image: null,
    barColor: "#c06040",
  },
};

// ─── Color palette ───
export const PALETTE = [
  "#58a6ff", "#f78166", "#56d364", "#d2a8ff", "#e3b341",
  "#f778ba", "#79c0ff", "#ffa657", "#7ee787", "#bc8cff",
  "#db6d28", "#3fb950", "#388bfd", "#ff7b72", "#d29922",
  "#39d353", "#a371f7", "#f0883e", "#2ea043", "#8b949e",
  "#bf4b8a", "#56a0ce", "#c9d1d9", "#6e7681", "#e06c75",
];
