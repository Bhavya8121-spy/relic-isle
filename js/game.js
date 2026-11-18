'use strict';
/* =====================================================================
   Relic Isle — a top-down survival / exploration game.
   All art & audio comes from free assets in /assets (see assets/CREDITS.md).
   ===================================================================== */

// ---------- Config ----------
const TILE = 16, SCALE = 3, TS = TILE * SCALE;
const W = 112, H = 112, CX = 56, CY = 56, BOUND = 50;
const G = { DEEP: 0, WATER: 1, GRASS: 2, SAND: 3, RUIN: 4, FLOOR: 5, DIRT: 6 };
const DAY_LEN = 360;           // seconds for a full day/night cycle
const REACH = 2.8;             // tiles
const SEED = 7331;

// ---------- Sprite sheets ----------
const SHEETS = {
  town:    { src: 'assets/sprites/tiny_town.png',        cols: 12, stride: 16 },
  dungeon: { src: 'assets/sprites/tiny_dungeon.png',     cols: 12, stride: 16 },
  farm:    { src: 'assets/sprites/tiny_farm.png',        cols: 12, stride: 16 },
  battle:  { src: 'assets/sprites/tiny_battle.png',      cols: 18, stride: 16 },
  indoor:  { src: 'assets/sprites/roguelike_indoor.png', cols: 27, stride: 17 },
};
const UI_IMGS = { slot: 'assets/ui/slot_tan_inlay.png', panel: 'assets/ui/panel_brown.png' };

const SP = {
  grass: ['battle', 0], grass2: ['battle', 1], flowers: ['battle', 2], water: ['battle', 37],
  sand: ['dungeon', 48], ruinFloor: ['dungeon', 48], floor: ['town', 43], dirt: ['town', 25],
  treeG: ['town', 4], pineG: ['town', 16], treeGs: ['town', 28],
  treeA: ['town', 3], pineA: ['town', 15], treeAs: ['town', 27],
  bush: ['town', 5], mushroom: ['town', 29], berryBush: ['farm', 78], carrotPlant: ['farm', 6],
  rock: ['farm', 89], stones: ['farm', 77], log: ['town', 106],
  wallWood: ['town', 73], wallStone: ['town', 77], door: ['town', 85], doorOpen: ['town', 74],
  fence: ['town', 81], bed: ['indoor', [10, 6]], candle: ['indoor', [19, 1]],
  chest: ['dungeon', 89], chestOpen: ['dungeon', 91], sign: ['town', 83],
  ruinWall: ['dungeon', 57], vaultWall: ['dungeon', 40], vaultDoor: ['dungeon', 45], vaultDoorOpen: ['dungeon', 33],
  standingStone: ['dungeon', 65], well: ['town', 104], buoy: ['town', 95],
  player: ['dungeon', 85],
  slime: ['dungeon', 108], spider: ['dungeon', 122], ghost: ['dungeon', 121], bat: ['dungeon', 120],
  imp: ['dungeon', 110], cyclops: ['dungeon', 109],
  sheep: ['farm', 120], cow: ['farm', 121], chicken: ['farm', 122],
  heart: ['battle', 195], food: ['farm', 125], flag: ['battle', 194], lock: ['battle', 193],
  axe: ['town', 127], pickaxe: ['town', 115], woodSword: ['dungeon', 107], stoneSword: ['dungeon', 104],
  potionRed: ['dungeon', 115], wool: ['farm', 74], meat: ['farm', 125], carrot: ['farm', 8], berries: ['farm', 78],
  key: ['town', 117], elixir: ['dungeon', 116], sunflower: ['farm', 83], staff: ['dungeon', 129],
  shield: ['dungeon', 102], sunblade: ['dungeon', 106],
};

// ---------- Items, recipes, objects, mobs ----------
const ITEMS = {
  wood:       { name: 'Wood', icon: 'log', mat: 1, desc: 'Chopped from trees and bushes.' },
  stone:      { name: 'Stone', icon: 'stones', mat: 1, desc: 'From pebbles, or rocks with a pickaxe.' },
  wool:       { name: 'Wool', icon: 'wool', mat: 1, desc: 'From sheep (and spider silk). Used for beds.' },
  berries:    { name: 'Wild Berries', icon: 'berries', food: 3, desc: 'Restores a little hunger.' },
  carrot:     { name: 'Carrot', icon: 'carrot', food: 4, desc: 'Crunchy. Restores hunger.' },
  mushroom:   { name: 'Mushroom', icon: 'mushroom', food: 2, heal: 2, desc: 'Restores hunger and a heart.' },
  meat:       { name: 'Meat', icon: 'meat', food: 7, desc: 'Very filling.' },
  potion:     { name: 'Healing Potion', icon: 'potionRed', heal: 12, desc: 'Restores 6 hearts.' },
  woodSword:  { name: 'Wooden Sword', icon: 'woodSword', dmg: 3, desc: '3 damage.' },
  stoneSword: { name: 'Stone Sword', icon: 'stoneSword', dmg: 5, desc: '5 damage.' },
  axe:        { name: 'Axe', icon: 'axe', dmg: 2, tool: 'axe', desc: 'Chops trees fast.' },
  pickaxe:    { name: 'Pickaxe', icon: 'pickaxe', dmg: 2, tool: 'pickaxe', desc: 'Breaks rocks and stone.' },
  wallWood:   { name: 'Wooden Wall', icon: 'wallWood', place: 'wallWood', desc: 'Blocks monsters.' },
  wallStone:  { name: 'Stone Wall', icon: 'wallStone', place: 'wallStone', desc: 'Sturdy. Blocks monsters.' },
  door:       { name: 'Door', icon: 'door', place: 'door', desc: 'You can walk through. Monsters cannot.' },
  fence:      { name: 'Fence', icon: 'fence', place: 'fence', desc: 'A cheap barrier.' },
  floor:      { name: 'Stone Floor', icon: 'floor', placeGround: 1, desc: 'Monsters never spawn on floors.' },
  bed:        { name: 'Bed', icon: 'bed', place: 'bed', desc: 'Sleep through the night. Sets respawn.' },
  candle:     { name: 'Candle Stand', icon: 'candle', place: 'candle', desc: 'Lights the night; stops spawns nearby.' },
  // Legendary relics
  key:        { name: 'Ancient Key', icon: 'key', legend: 1, desc: 'Opens the Sealed Vault.' },
  elixir:     { name: 'Elixir of Ages', icon: 'elixir', legend: 1, desc: '+5 max hearts, fully healed.' },
  sunflower:  { name: 'Eternal Sunflower', icon: 'sunflower', legend: 1, desc: 'Hunger drains half as fast.' },
  staff:      { name: 'Storm Staff', icon: 'staff', legend: 1, usable: 1, desc: 'Select it and click to call lightning.' },
  shield:     { name: 'Aegis Shield', icon: 'shield', legend: 1, desc: 'Halves all damage you take.' },
  sunblade:   { name: 'Sunblade', icon: 'sunblade', legend: 1, usable: 1, dmg: 14, desc: 'A blade of daylight. 14 damage.' },
};
const RELICS = ['key', 'elixir', 'sunflower', 'staff', 'shield', 'sunblade'];
const RELIC_HINTS = {
  key: 'Where old stones crumble in the far north, a chest still waits.',
  elixir: 'A lonely islet sits off the south-east shore. Swim for it.',
  sunflower: 'Deep in the golden autumn woods of the east, one flower never wilts.',
  staff: 'Boulders hide a chest in the western stone hills. Bring a pickaxe.',
  shield: 'When the moon is up, a one-eyed giant walks the stone circle in the south-west.',
  sunblade: 'The Sealed Vault in the north-east opens only for the Ancient Key.',
};
const RECIPES = [
  { out: 'pickaxe', n: 1, cost: { wood: 5 } },
  { out: 'axe', n: 1, cost: { wood: 3, stone: 2 } },
  { out: 'woodSword', n: 1, cost: { wood: 4 } },
  { out: 'stoneSword', n: 1, cost: { wood: 2, stone: 5 } },
  { out: 'wallWood', n: 4, cost: { wood: 3 } },
  { out: 'wallStone', n: 4, cost: { stone: 4 } },
  { out: 'door', n: 1, cost: { wood: 4 } },
  { out: 'floor', n: 4, cost: { stone: 2 } },
  { out: 'fence', n: 4, cost: { wood: 2 } },
  { out: 'bed', n: 1, cost: { wood: 6, wool: 3 } },
  { out: 'candle', n: 2, cost: { wood: 2, stone: 1 } },
  { out: 'potion', n: 1, cost: { berries: 3, mushroom: 2 } },
];

const OBJ = {
  treeG:  { spr: 'treeG', solid: 1, hp: 6, drops: { wood: [2, 4] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#2f7a32' },
  pineG:  { spr: 'pineG', solid: 1, hp: 6, drops: { wood: [2, 4] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#2f7a32' },
  treeGs: { spr: 'treeGs', solid: 1, hp: 4, drops: { wood: [1, 3] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#3c8a3a' },
  treeA:  { spr: 'treeA', solid: 1, hp: 6, drops: { wood: [2, 4] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#d28a1f' },
  pineA:  { spr: 'pineA', solid: 1, hp: 6, drops: { wood: [2, 4] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#d28a1f' },
  treeAs: { spr: 'treeAs', solid: 1, hp: 4, drops: { wood: [1, 3] }, tool: 'axe', sfx: 'chop', fx: 'wood', mapC: '#e09a2a' },
  bush:   { spr: 'bush', solid: 1, hp: 2, drops: { wood: [1, 1], berries: [0, 1] }, sfx: 'cloth2', fx: 'leaf' },
  berryBush:   { spr: 'berryBush', hp: 1, drops: { berries: [2, 3] }, sfx: 'cloth2', fx: 'leaf' },
  carrotPlant: { spr: 'carrotPlant', hp: 1, drops: { carrot: [1, 2] }, sfx: 'pluck_001', fx: 'leaf' },
  mushroom:    { spr: 'mushroom', hp: 1, drops: { mushroom: [1, 2] }, sfx: 'pluck_001', fx: 'leaf' },
  stones: { spr: 'stones', hp: 2, drops: { stone: [1, 2] }, sfx: 'metalPot1', fx: 'stone' },
  rock:   { spr: 'rock', solid: 1, hp: 8, drops: { stone: [2, 4] }, tool: 'pickaxe', need: 1, sfx: 'metalPot1', fx: 'stone', mapC: '#8d8d8d' },
  wallWood:  { spr: 'wallWood', solid: 1, hp: 8, drops: { wallWood: [1, 1] }, built: 1, sfx: 'chop', fx: 'wood', mapC: '#8a5a2b' },
  wallStone: { spr: 'wallStone', solid: 1, hp: 16, drops: { wallStone: [1, 1] }, built: 1, sfx: 'metalPot1', fx: 'stone', mapC: '#7d8590' },
  door:   { spr: 'door', mobSolid: 1, hp: 8, drops: { door: [1, 1] }, built: 1, sfx: 'chop', fx: 'wood', mapC: '#a0682f' },
  fence:  { spr: 'fence', solid: 1, hp: 4, drops: { fence: [1, 1] }, built: 1, sfx: 'chop', fx: 'wood', mapC: '#a0682f' },
  bed:    { spr: 'bed', hp: 4, drops: { bed: [1, 1] }, built: 1, sfx: 'cloth2', fx: 'wood', interact: 'sleep', label: 'Sleep', mapC: '#c0582a' },
  candle: { spr: 'candle', hp: 2, drops: { candle: [1, 1] }, built: 1, sfx: 'metalPot1', fx: 'stone', light: 4.5, mapC: '#ffd75e' },
  chest:     { spr: 'chest', solid: 1, unbreak: 1, interact: 'chest', label: 'Open chest', mapC: '#ffd75e' },
  chestOpen: { spr: 'chestOpen', solid: 1, unbreak: 1 },
  sign:      { spr: 'sign', solid: 1, unbreak: 1, interact: 'sign', label: 'Read sign' },
  ruinWall:  { spr: 'ruinWall', solid: 1, unbreak: 1, mapC: '#6d7180' },
  vaultWall: { spr: 'vaultWall', solid: 1, unbreak: 1, mapC: '#555a66' },
  vaultDoor: { spr: 'vaultDoor', solid: 1, unbreak: 1, interact: 'vault', label: 'Unlock vault', mapC: '#555a66' },
  vaultOpen: { spr: 'vaultDoorOpen', unbreak: 1 },
  standingStone: { spr: 'standingStone', solid: 1, unbreak: 1, mapC: '#9aa0aa' },
  well:      { spr: 'well', solid: 1, unbreak: 1 },
  sunflower: { spr: 'sunflower', unbreak: 1, interact: 'relic', label: 'Pick the Eternal Sunflower', glow: 1, relic: 'sunflower' },
};

const MOB = {
  slime:   { spr: 'slime', name: 'Bog Slime', hp: 10, dmg: 2, speed: 1.9, hostile: 1, drops: { mushroom: [0, 1] } },
  spider:  { spr: 'spider', name: 'Spider', hp: 8, dmg: 2, speed: 3.0, hostile: 1, drops: { wool: [0, 1] } },
  ghost:   { spr: 'ghost', name: 'Ghost', hp: 12, dmg: 3, speed: 2.2, hostile: 1, fly: 1 },
  bat:     { spr: 'bat', name: 'Bat', hp: 4, dmg: 1, speed: 3.6, hostile: 1, fly: 1 },
  imp:     { spr: 'imp', name: 'Ruin Imp', hp: 14, dmg: 3, speed: 2.4, hostile: 1, guard: 1, drops: { stone: [1, 2] } },
  cyclops: { spr: 'cyclops', name: 'Cyclops', hp: 80, dmg: 5, speed: 2.0, hostile: 1, boss: 1, size: 1.7 },
  sheep:   { spr: 'sheep', name: 'Sheep', hp: 6, speed: 1.2, drops: { meat: [1, 1], wool: [1, 2] } },
  cow:     { spr: 'cow', name: 'Cow', hp: 10, speed: 1.0, drops: { meat: [2, 3] } },
  chicken: { spr: 'chicken', name: 'Chicken', hp: 3, speed: 1.6, drops: { meat: [1, 1] } },
};

// ---------- Utilities ----------
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(x, y, s) { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, s) { let t = 0, a = .5, f = 1; for (let i = 0; i < 4; i++) { t += a * vnoise(x * f, y * f, s + i * 17); f *= 2; a *= .5; } return t / .9375; }

// ---------- Canvas ----------
const cv = $('game'), ctx = cv.getContext('2d');
const dark = document.createElement('canvas'), dctx = dark.getContext('2d');
let VW = 0, VH = 0;
function resize() { cv.width = VW = innerWidth; cv.height = VH = innerHeight; dark.width = VW; dark.height = VH; ctx.imageSmoothingEnabled = false; }
addEventListener('resize', resize); resize();

// ---------- Asset loading ----------
const IMG = {};
function loadImg(key, src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[key] = i; res(); }; i.onerror = () => rej(new Error('Missing image ' + src)); i.src = src; }); }

const SFX_NAMES = ['chop', 'metalPot1', 'cloth1', 'cloth2', 'knifeSlice', 'knifeSlice2', 'drawKnife1', 'doorOpen_1', 'doorClose_1',
  'dropLeather', 'pluck_001', 'creak1', 'metalLatch', 'handleCoins', 'handleSmallLeather', 'bookOpen', 'footstep00', 'footstep01',
  'footstep02', 'footstep03', 'footstep04', 'drop_002', 'glass_002', 'glitch_001', 'confirmation_001', 'confirmation_002',
  'error_001', 'click_001', 'select_001', 'open_001', 'close_001', 'maximize_006', 'bong_001'];
const AC = new (window.AudioContext || window.webkitAudioContext)();
const SFX = {};
async function loadSfx(name) {
  try { const r = await fetch(`assets/audio/sfx/${name}.ogg`); SFX[name] = await AC.decodeAudioData(await r.arrayBuffer()); }
  catch (e) { console.warn('sfx failed', name, e); }
}
function sfx(name, vol = .5, rate = 1) {
  const b = SFX[name]; if (!b || AC.state !== 'running') return;
  const s = AC.createBufferSource(); s.buffer = b; s.playbackRate.value = rate * (0.93 + Math.random() * .14);
  const g = AC.createGain(); g.gain.value = vol; s.connect(g); g.connect(AC.destination); s.start();
}
const music = {
  day: Object.assign(new Audio('assets/audio/music/feel_good_island_loop.ogg'), { loop: true, volume: 0 }),
  night: Object.assign(new Audio('assets/audio/music/spooky_island.mp3'), { loop: true, volume: 0 }),
};

const iconCache = {};
function iconURL(name) {
  if (iconCache[name]) return iconCache[name];
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const [img, sx, sy] = sprSrc(name); c.getContext('2d').drawImage(img, sx, sy, 16, 16, 0, 0, 16, 16);
  return (iconCache[name] = c.toDataURL());
}
function sprSrc(name) {
  const d = SP[name]; const sh = SHEETS[d[0]]; let c, r;
  if (Array.isArray(d[1])) [c, r] = d[1]; else { c = d[1] % sh.cols; r = Math.floor(d[1] / sh.cols); }
  return [IMG[d[0]], c * sh.stride, r * sh.stride];
}
function drawSpr(name, x, y, size = TS, flip = false) {
  const [img, sx, sy] = sprSrc(name);
  if (flip) { ctx.save(); ctx.translate(x + size, y); ctx.scale(-1, 1); ctx.drawImage(img, sx, sy, 16, 16, 0, 0, size, size); ctx.restore(); }
  else ctx.drawImage(img, sx, sy, 16, 16, x, y, size, size);
}
function drawIdx(sheet, idx, x, y, size = TS) {
  const sh = SHEETS[sheet]; ctx.drawImage(IMG[sheet], (idx % sh.cols) * 16, Math.floor(idx / sh.cols) * 16, 16, 16, x, y, size, size);
}

// ---------- World ----------
let ground, obj, reserved, shoreIdx, seen, buoys = [];
const sites = {};
const idx = (x, y) => y * W + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const gAt = (x, y) => inMap(x, y) ? ground[idx(x, y)] : G.DEEP;
const isLand = g => g >= G.GRASS;
const oAt = (x, y) => inMap(x, y) ? obj[idx(x, y)] : null;
function setObj(x, y, t, data) { if (!inMap(x, y)) return; obj[idx(x, y)] = t ? { t, hp: OBJ[t].hp || 1, data: data || null, shake: 0 } : null; mapDirty = true; }

function islandR(a) { return 35 + (fbm(Math.cos(a) * 1.4 + 5, Math.sin(a) * 1.4 + 5, SEED) - .5) * 16; }
function sitePos(a, f) { const r = islandR(a) * f; return { x: Math.round(CX + Math.cos(a) * r), y: Math.round(CY + Math.sin(a) * r) }; }

function genWorld() {
  const rnd = mulberry32(SEED);
  ground = new Uint8Array(W * H); obj = new Array(W * H).fill(null); reserved = new Uint8Array(W * H); seen = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const r = islandR(a) + (fbm(x * .15, y * .15, SEED + 3) - .5) * 5;
    ground[idx(x, y)] = d > BOUND ? G.DEEP : (d < r ? G.GRASS : G.WATER);
  }
  // ponds
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - CX, y - CY), r = islandR(Math.atan2(y - CY, x - CX));
    if (d < r - 7 && d > 9 && fbm(x * .1, y * .1, SEED + 9) > .7) ground[idx(x, y)] = G.WATER;
  }
  // smoothing
  for (let p = 0; p < 2; p++) {
    const copy = ground.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (copy[idx(x, y)] === G.DEEP) continue;
      let n = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) if (isLand(copy[idx(x + i, y + j)])) n++;
      ground[idx(x, y)] = n >= 5 ? G.GRASS : G.WATER;
    }
  }
  // islet (south-east)
  const ia = Math.PI / 4, isl = { x: Math.round(CX + Math.cos(ia) * 44), y: Math.round(CY + Math.sin(ia) * 44) };
  for (let y = isl.y - 9; y <= isl.y + 9; y++) for (let x = isl.x - 9; x <= isl.x + 9; x++) {
    if (!inMap(x, y)) continue; const d = Math.hypot(x - isl.x, y - isl.y);
    if (d < 3.3) ground[idx(x, y)] = G.GRASS;
    else if (d < 8.5 && ground[idx(x, y)] !== G.DEEP) ground[idx(x, y)] = G.WATER;
  }
  sites.islet = { ...isl, name: 'Lonely Islet' };

  const stamp = (cx, cy, rad, g) => {
    for (let y = cy - rad; y <= cy + rad; y++) for (let x = cx - rad; x <= cx + rad; x++) {
      if (!inMap(x, y) || Math.hypot(x - cx, y - cy) > rad + .3) continue;
      if (g !== null) ground[idx(x, y)] = g; reserved[idx(x, y)] = 1; obj[idx(x, y)] = null;
    }
  };
  // Spawn
  sites.spawn = { x: CX, y: CY + 4, name: 'Castaway Camp' };
  stamp(sites.spawn.x, sites.spawn.y, 4, G.GRASS);

  // Ruins (north)
  const ru = sitePos(-Math.PI / 2, .62); sites.ruins = { ...ru, name: 'Ancient Ruins' };
  stamp(ru.x, ru.y, 7, G.GRASS);
  for (let y = ru.y - 4; y <= ru.y + 4; y++) for (let x = ru.x - 5; x <= ru.x + 5; x++) {
    ground[idx(x, y)] = G.RUIN;
    const edge = (y === ru.y - 4 || y === ru.y + 4 || x === ru.x - 5 || x === ru.x + 5);
    if (edge && !(y === ru.y + 4 && Math.abs(x - ru.x) <= 1) && rnd() > .3) setObj(x, y, 'ruinWall');
  }
  setObj(ru.x - 2, ru.y - 1, 'ruinWall'); setObj(ru.x + 2, ru.y - 1, 'ruinWall');
  setObj(ru.x, ru.y - 1, 'chest', { loot: { key: 1, stone: 4 } });

  // Sealed vault (north-east)
  const va = sitePos(-0.8, .58); sites.vault = { ...va, name: 'Sealed Vault' };
  stamp(va.x, va.y, 6, G.GRASS);
  for (let y = va.y - 3; y <= va.y + 3; y++) for (let x = va.x - 3; x <= va.x + 3; x++) {
    ground[idx(x, y)] = G.RUIN;
    const edge = (y === va.y - 3 || y === va.y + 3 || x === va.x - 3 || x === va.x + 3);
    if (edge) setObj(x, y, 'vaultWall');
  }
  setObj(va.x, va.y + 3, 'vaultDoor');
  setObj(va.x, va.y - 1, 'chest', { loot: { sunblade: 1 } });

  // Golden grove (east)
  const gr = sitePos(0, .68); sites.grove = { ...gr, name: 'Golden Grove' };
  stamp(gr.x, gr.y, 3, G.GRASS);
  setObj(gr.x, gr.y, 'sunflower');

  // Stone hills chest (west)
  const hi = sitePos(Math.PI, .62); sites.hills = { ...hi, name: 'Stone Hills' };
  stamp(hi.x, hi.y, 4, G.GRASS);
  for (let y = hi.y - 2; y <= hi.y + 2; y++) for (let x = hi.x - 2; x <= hi.x + 2; x++) if (x !== hi.x || y !== hi.y) setObj(x, y, 'rock');
  setObj(hi.x, hi.y, 'chest', { loot: { staff: 1, stone: 3 } });

  // Stone circle (south-west)
  const sc = sitePos(3 * Math.PI / 4, .6); sites.circle = { ...sc, name: 'Stone Circle' };
  stamp(sc.x, sc.y, 6, G.GRASS);
  stamp(sc.x, sc.y, 2, G.DIRT);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; setObj(Math.round(sc.x + Math.cos(a) * 4), Math.round(sc.y + Math.sin(a) * 4), 'standingStone'); }

  // Islet chest
  setObj(isl.x, isl.y, 'chest', { loot: { elixir: 1, meat: 2 } });
  setObj(isl.x - 2, isl.y, 'treeGs'); setObj(isl.x + 1, isl.y + 2, 'berryBush');

  // Paths from camp to sites
  const path = (a, b) => {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y));
    for (let i = 0; i <= n; i++) {
      const x = Math.round(a.x + (b.x - a.x) * i / n), y = Math.round(a.y + (b.y - a.y) * i / n);
      for (const [px, py] of [[x, y], [x + 1, y]]) {
        if (!inMap(px, py)) continue; const g = ground[idx(px, py)];
        if (g === G.GRASS || g === G.WATER) { ground[idx(px, py)] = G.DIRT; reserved[idx(px, py)] = 1; const o = obj[idx(px, py)]; if (o && !OBJ[o.t].unbreak) obj[idx(px, py)] = null; }
      }
    }
  };
  const sp = sites.spawn;
  path(sp, { x: ru.x, y: ru.y + 6 }); path(sp, { x: va.x, y: va.y + 5 }); path(sp, { x: gr.x - 3, y: gr.y });
  path(sp, { x: hi.x + 4, y: hi.y }); path(sp, { x: sc.x + 3, y: sc.y - 3 });

  // remove 1-wide channels / notches so the shoreline tiles join cleanly
  for (let p = 0; p < 5; p++) for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (ground[idx(x, y)] !== G.WATER) continue;
    const n = isLand(gAt(x, y - 1)), s = isLand(gAt(x, y + 1)), w = isLand(gAt(x - 1, y)), e = isLand(gAt(x + 1, y));
    if ((n && s) || (w && e) || (n + s + w + e >= 3)) ground[idx(x, y)] = G.GRASS;
  }

  // Vegetation & resources
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = idx(x, y); if (ground[i] !== G.GRASS || reserved[i] || obj[i]) continue;
    const a = Math.atan2(y - CY, x - CX), d = Math.hypot(x - CX, y - CY), r = islandR(a);
    const near = (s, rad) => Math.hypot(x - s.x, y - s.y) < rad;
    if (near(sp, 6)) continue;
    const dens = fbm(x * .12, y * .12, SEED + 21), q = rnd();
    const east = Math.abs(a) < .75 && d > r * .3;
    const west = Math.abs(a) > Math.PI - .65 && d > r * .35;
    if (east) {
      if (q < .34) setObj(x, y, ['treeA', 'pineA', 'treeAs'][rint(0, 2)]);
      else if (q < .37) setObj(x, y, 'mushroom'); else if (q < .40) setObj(x, y, 'berryBush');
    } else if (west) {
      if (q < .16) setObj(x, y, 'rock'); else if (q < .22) setObj(x, y, 'stones'); else if (q < .27) setObj(x, y, 'pineG');
      else if (q < .29) setObj(x, y, 'carrotPlant');
    } else if (dens > .58) {
      if (q < .42) setObj(x, y, ['treeG', 'pineG', 'treeGs'][rint(0, 2)]);
      else if (q < .46) setObj(x, y, 'mushroom'); else if (q < .49) setObj(x, y, 'bush');
    } else {
      if (q < .04) setObj(x, y, ['treeG', 'treeGs'][rint(0, 1)]);
      else if (q < .06) setObj(x, y, 'bush'); else if (q < .085) setObj(x, y, 'berryBush');
      else if (q < .10) setObj(x, y, 'carrotPlant'); else if (q < .11) setObj(x, y, 'mushroom');
      else if (q < .125) setObj(x, y, 'stones'); else if (q < .132) setObj(x, y, 'rock');
    }
  }
  // starter pebbles & a well at camp
  setObj(sp.x - 3, sp.y + 1, 'stones'); setObj(sp.x + 3, sp.y - 2, 'stones'); setObj(sp.x - 2, sp.y - 3, 'berryBush');
  setObj(sp.x + 2, sp.y + 2, 'well');

  // Signs
  setObj(sp.x + 1, sp.y - 1, 'sign', { text: 'Welcome, castaway. Six legendary relics are hidden on this island. Find them all to lift its curse.<br><br>Gather wood and stone, craft tools with <b>C</b>, and build a shelter before nightfall. Your <b>Journal (J)</b> holds clues.' });
  setObj(sp.x - 1, sp.y - 1, 'sign', { text: 'North: Ancient Ruins · North-east: Sealed Vault<br>East: Golden Grove · West: Stone Hills<br>South-west: Stone Circle' });
  setObj(ru.x + 3, ru.y + 6, 'sign', { text: '<b>Ancient Ruins.</b> Imps still guard what the old ones left behind.' });
  setObj(va.x + 2, va.y + 5, 'sign', { text: '<b>The Sealed Vault.</b> The door bears a keyhole of ancient design.' });
  setObj(sc.x + 5, sc.y - 4, 'sign', { text: '<b>The Stone Circle.</b> Something stirs here when the moon is up.' });
  setObj(hi.x + 5, hi.y + 1, 'sign', { text: '<b>Stone Hills.</b> Something glints behind the boulders… bare hands won\'t move them.' });
  setObj(gr.x - 4, gr.y + 1, 'sign', { text: '<b>The Golden Woods.</b> Follow the light.' });
  // sign on the shore facing the islet
  let best = null, bd = 1e9;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (ground[idx(x, y)] !== G.GRASS || obj[idx(x, y)] || Math.hypot(x - isl.x, y - isl.y) < 5) continue;
    const dd = Math.hypot(x - isl.x, y - isl.y); if (dd < bd) { bd = dd; best = { x, y }; }
  }
  if (best) { setObj(best.x, best.y, 'sign', { text: 'A little islet lies across the water to the south-east.<br>You can swim, but swimming makes you hungry fast!' }); sites.shore = best; }

  // Precompute shoreline tiles and buoys
  shoreIdx = new Int16Array(W * H).fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const g = ground[idx(x, y)];
    if (g === G.WATER) shoreIdx[idx(x, y)] = shoreTile(x, y);
    if (g === G.DEEP && (x + y) % 3 === 0) {
      const d = Math.hypot(x - CX, y - CY);
      if (d < BOUND + 1.2) buoys.push({ x, y, ph: Math.random() * 6 });
    }
  }
  buildMapBase();
}
function shoreTile(x, y) {
  const L = (a, b) => isLand(gAt(a, b));
  const n = L(x, y - 1), s = L(x, y + 1), w = L(x - 1, y), e = L(x + 1, y);
  if (n && w) return 18; if (n && e) return 20; if (s && w) return 54; if (s && e) return 56;
  if (n) return 19; if (s) return 55; if (w) return 36; if (e) return 38;
  return 37;
}

// ---------- Map (minimap + fog) ----------
const mapBase = document.createElement('canvas'); mapBase.width = W; mapBase.height = H;
const fogC = document.createElement('canvas'); fogC.width = W; fogC.height = H;
let mapDirty = true, fogData;
const GCOL = ['#1b3768', '#3d8fd8', '#6cbf4a', '#e2c08a', '#b9a27a', '#9aa4ad', '#c58a4f'];
function buildMapBase() {
  const m = mapBase.getContext('2d'); const id = m.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const o = obj[i]; const col = (o && OBJ[o.t].mapC) || GCOL[ground[i]];
    const v = parseInt(col.slice(1), 16); id.data[i * 4] = v >> 16; id.data[i * 4 + 1] = (v >> 8) & 255; id.data[i * 4 + 2] = v & 255; id.data[i * 4 + 3] = 255;
  }
  m.putImageData(id, 0, 0); mapDirty = false;
  if (!fogData) { const f = fogC.getContext('2d'); fogData = f.createImageData(W, H); for (let i = 0; i < W * H; i++) { fogData.data[i * 4 + 3] = 255; fogData.data[i * 4] = 18; fogData.data[i * 4 + 1] = 22; fogData.data[i * 4 + 2] = 34; } }
}
function reveal(px, py, rad) {
  let changed = false;
  for (let y = Math.floor(py - rad); y <= py + rad; y++) for (let x = Math.floor(px - rad); x <= px + rad; x++) {
    if (!inMap(x, y) || seen[idx(x, y)] || Math.hypot(x - px, y - py) > rad) continue;
    seen[idx(x, y)] = 1; fogData.data[idx(x, y) * 4 + 3] = 0; changed = true;
  }
  if (changed) fogC.getContext('2d').putImageData(fogData, 0, 0);
}

// ---------- Game state ----------
let state = 'title';          // title | play | dead | win
let paused = false;
const player = { x: 0, y: 0, hp: 20, maxHp: 20, hunger: 20, face: 1, moving: false, swim: false, inv: 0, atkCd: 0, swing: 0, isPlayer: true };
let inv = {}, hotbar = new Array(10).fill(null), sel = 0;
let mobs = [], particles = [], floats = [];
let worldTime = DAY_LEN * 0.04, lastNight = false, dayNum = 1;
let spawnPoint = { x: 0, y: 0 }, bossDefeated = false, staffCd = 0, bolts = [];
let hungerAcc = 0, starveAcc = 0, regenAcc = 0, stepAcc = 0, spawnAcc = 0, animalAcc = 0, guardAcc = 0, revealAcc = 0, warnCd = 0;
let relicsFound = 0, startTime = 0, kills = 0, flash = 0, onDoor = false, hotbarNameT = 0;
const discovered = new Set();
const cam = { x: 0, y: 0 };
const keys = new Set(); const mouse = { x: 0, y: 0, down: false, right: false };

// ---------- Inventory ----------
function addItem(k, n = 1, quiet = false) {
  if (n <= 0) return;
  const had = inv[k] || 0; inv[k] = had + n;
  const def = ITEMS[k];
  if (def.legend) { onRelic(k); }
  if (!had && !def.mat && (!def.legend || def.usable) && !hotbar.includes(k)) { const e = hotbar.indexOf(null); if (e >= 0) hotbar[e] = k; }
  if (!quiet) floatText(player.x, player.y - .9, `+${n} ${def.name}`, def.legend ? '#ffd75e' : '#ffffff');
  refreshPanels();
}
function removeItem(k, n = 1) {
  inv[k] = (inv[k] || 0) - n;
  if (inv[k] <= 0) { delete inv[k]; const i = hotbar.indexOf(k); if (i >= 0) hotbar[i] = null; }
  refreshPanels();
}
const has = (k, n = 1) => (inv[k] || 0) >= n;
const canAfford = cost => Object.entries(cost).every(([k, n]) => has(k, n));
function craft(r) {
  if (!canAfford(r.cost)) { sfx('error_001', .4); return; }
  for (const [k, n] of Object.entries(r.cost)) removeItem(k, n);
  addItem(r.out, r.n, true);
  toast(`Crafted ${r.n > 1 ? r.n + '× ' : ''}${ITEMS[r.out].name}`, 'good');
  sfx(ITEMS[r.out].dmg ? 'drawKnife1' : 'maximize_006', .5);
}

// ---------- Relics ----------
function onRelic(k) {
  relicsFound = RELICS.filter(r => inv[r]).length;
  const def = ITEMS[k];
  if (k === 'elixir') { player.maxHp = 30; player.hp = player.maxHp; }
  showBanner(`Legendary relic found!`, `${def.name} — ${def.desc}`);
  sfx('confirmation_002', .7);
  for (let i = 0; i < 40; i++) particles.push({ x: player.x, y: player.y - .3, vx: (Math.random() - .5) * 6, vy: (Math.random() - .5) * 6 - 2, t: 1.2, c: '#ffd75e', s: 4 });
  if (relicsFound === RELICS.length) setTimeout(winGame, 2600);
  setTimeout(() => saveGame(false), 100);
}
function winGame() {
  if (state !== 'play') return;
  state = 'win';
  const mins = Math.round((performance.now() - startTime) / 60000);
  $('winMsg').textContent = `You gathered all six relics in ${dayNum} day${dayNum > 1 ? 's' : ''} (${mins} min) and defeated ${kills} monsters.`;
  $('winRelics').innerHTML = RELICS.map(r => `<img src="${iconURL(ITEMS[r].icon)}" alt="${ITEMS[r].name}" title="${ITEMS[r].name}">`).join('');
  $('win').classList.remove('hidden'); sfx('confirmation_001', .7);
}

// ---------- UI helpers ----------
function toast(msg, cls = '') { const d = document.createElement('div'); d.className = 'toast ' + cls; d.innerHTML = msg; $('toasts').appendChild(d); setTimeout(() => d.remove(), 3300); while ($('toasts').children.length > 4) $('toasts').firstChild.remove(); }
function showBanner(t, sub) { const b = $('banner'); b.classList.add('hidden'); void b.offsetWidth; b.innerHTML = `${t}<small>${sub}</small>`; b.classList.remove('hidden'); clearTimeout(showBanner.t); showBanner.t = setTimeout(() => b.classList.add('hidden'), 4000); }
function floatText(x, y, text, color = '#fff') { const n = floats.filter(f => f.t > .9 && Math.abs(f.x - x) < 1).length; floats.push({ x, y: y - n * .5, text, color, t: 1.3 }); }
let dialogObj = null;
function openDialog(html, o) { $('dialog').innerHTML = html + '<small>Walk away or press Esc to close.</small>'; $('dialog').classList.remove('hidden'); dialogObj = o; }
function closeDialog() { $('dialog').classList.add('hidden'); dialogObj = null; }

const PANELS = { craft: 'panelCraft', inv: 'panelInv', journal: 'panelJournal', map: 'panelMap' };
let openPanel = null;
function togglePanel(p) {
  if (state !== 'play') return;
  if (openPanel === p) { closePanels(); return; }
  closePanels(true); openPanel = p; $(PANELS[p]).classList.remove('hidden'); paused = true; refreshPanels();
  sfx(p === 'journal' ? 'bookOpen' : 'open_001', .45);
}
function closePanels(silent) {
  if (!openPanel) return; $(PANELS[openPanel]).classList.add('hidden'); openPanel = null; paused = false; if (!silent) sfx('close_001', .4);
}
function costHTML(cost) { return Object.entries(cost).map(([k, n]) => `<span class="${has(k, n) ? '' : 'lack'}"><img src="${iconURL(ITEMS[k].icon)}" alt="">${inv[k] || 0}/${n}</span>`).join(''); }
function refreshPanels() {
  if (openPanel === 'craft') {
    $('craftList').innerHTML = RECIPES.map((r, i) => {
      const d = ITEMS[r.out];
      return `<div class="row"><img class="icon" src="${iconURL(d.icon)}" alt=""><div class="info"><div class="name">${d.name}${r.n > 1 ? ' ×' + r.n : ''}</div><div class="desc">${d.desc}</div><div class="cost">${costHTML(r.cost)}</div></div><button class="btn" data-r="${i}" ${canAfford(r.cost) ? '' : 'disabled'}>Craft</button></div>`;
    }).join('');
  } else if (openPanel === 'inv') {
    const ks = Object.keys(inv);
    $('invList').innerHTML = ks.length ? ks.map(k => `<div class="cell" data-k="${k}" title="${ITEMS[k].desc}"><img src="${iconURL(ITEMS[k].icon)}" alt=""><span>${ITEMS[k].name}</span><b>×${inv[k]}</b></div>`).join('') : '<p>Your pockets are empty. Go gather something!</p>';
  } else if (openPanel === 'journal') {
    const rel = RELICS.map(r => {
      const f = has(r); const d = ITEMS[r];
      return `<div class="row ${f ? 'found' : 'locked'}"><img class="icon" src="${iconURL(d.icon)}" alt="" style="${f ? '' : 'filter:brightness(0) opacity(.45)'}"><div class="info"><div class="name">${f ? d.name + ' ✓' : 'Unknown relic'}</div><div class="desc">${f ? d.desc : RELIC_HINTS[r]}</div></div></div>`;
    }).join('');
    const placeNames = ['spawn', 'ruins', 'vault', 'grove', 'hills', 'circle', 'islet'];
    const pl = placeNames.map(k => discovered.has(k) ? `✓ ${sites[k].name}` : '? ???').join(' · ');
    $('journalList').innerHTML = `<div class="desc" style="margin-bottom:4px"><b>Relics ${relicsFound}/6</b> · Day ${dayNum} · Monsters defeated: ${kills}</div>${rel}<div class="row"><div class="info"><div class="name">Places discovered ${discovered.size}/7</div><div class="desc">${pl}</div></div></div>`;
  } else if (openPanel === 'map') drawBigMap();
}
$('craftList').addEventListener('click', e => { const b = e.target.closest('button[data-r]'); if (b) { craft(RECIPES[+b.dataset.r]); refreshPanels(); } });
$('invList').addEventListener('click', e => {
  const c = e.target.closest('.cell'); if (!c) return; const k = c.dataset.k;
  if (ITEMS[k].legend && !ITEMS[k].usable) { toast(`${ITEMS[k].name} works passively — no need to hold it.`); return; }
  const prev = hotbar.indexOf(k); if (prev >= 0) hotbar[prev] = hotbar[sel]; hotbar[sel] = k; sfx('click_001', .4);
  toast(`${ITEMS[k].name} → slot ${(sel + 1) % 10}`);
});

// ---------- Collision & movement ----------
const HS = .3;
function blockedTile(tx, ty, e) {
  if (!inMap(tx, ty)) return true;
  const g = ground[idx(tx, ty)];
  if (g === G.DEEP) return true;
  const fly = e.def && e.def.fly;
  if (g === G.WATER && !e.isPlayer && !fly) return true;
  const o = obj[idx(tx, ty)];
  if (o) { const d = OBJ[o.t]; if (d.solid) return true; if (d.mobSolid && !e.isPlayer) return true; }
  return false;
}
function collides(x, y, e) {
  const hs = HS * (e.def && e.def.size ? e.def.size * .8 : 1);
  return blockedTile(Math.floor(x - hs), Math.floor(y - hs), e) || blockedTile(Math.floor(x + hs), Math.floor(y - hs), e) ||
    blockedTile(Math.floor(x - hs), Math.floor(y + hs), e) || blockedTile(Math.floor(x + hs), Math.floor(y + hs), e);
}
function moveEntity(e, dx, dy) {
  let hit = false;
  if (dx) { if (!collides(e.x + dx, e.y, e)) e.x += dx; else hit = true; }
  if (dy) { if (!collides(e.x, e.y + dy, e)) e.y += dy; else hit = true; }
  if (hit && e.isPlayer && warnCd <= 0) {
    const tx = Math.floor(e.x + Math.sign(dx) * .6), ty = Math.floor(e.y + Math.sign(dy) * .6);
    if (gAt(tx, ty) === G.DEEP || gAt(Math.floor(e.x), ty) === G.DEEP || gAt(tx, Math.floor(e.y)) === G.DEEP) {
      toast('⚠ Restricted waters! The currents beyond the buoys are too strong.', 'warn'); sfx('error_001', .35); warnCd = 3;
    }
  }
  return hit;
}

// ---------- Mobs ----------
function spawnMob(type, x, y, home) {
  const d = MOB[type];
  mobs.push({ type, def: d, x: x + .5, y: y + .5, hp: d.hp, cd: 0, hurt: 0, face: 1, wt: 0, dir: { x: 0, y: 0 }, flee: 0, home: home || null, kb: { x: 0, y: 0 }, burn: 0 });
}
function freeLand(x, y, allowRuin) {
  const g = gAt(x, y); if (!(g === G.GRASS || g === G.SAND || g === G.DIRT || (allowRuin && g === G.RUIN))) return false;
  const o = oAt(x, y); return !o || !OBJ[o.t].solid && !OBJ[o.t].mobSolid;
}
function nearLight(x, y, r) {
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const o = oAt(x + i, y + j); if (o && OBJ[o.t].light) return true; }
  return false;
}
function hostileCount() { return mobs.filter(m => m.def.hostile && !m.def.guard && !m.def.boss).length; }
function trySpawnNight() {
  if (hostileCount() >= 12) return;
  for (let t = 0; t < 12; t++) {
    const a = Math.random() * Math.PI * 2, r = 13 + Math.random() * 8;
    const x = Math.floor(player.x + Math.cos(a) * r), y = Math.floor(player.y + Math.sin(a) * r);
    if (!freeLand(x, y) || nearLight(x, y, 5)) continue;
    const q = Math.random(); spawnMob(q < .35 ? 'slime' : q < .65 ? 'spider' : q < .85 ? 'bat' : 'ghost', x, y); return;
  }
}
function trySpawnAnimal(far) {
  if (mobs.filter(m => !m.def.hostile).length >= 18) return;
  for (let t = 0; t < 20; t++) {
    const x = rint(10, W - 10), y = rint(10, H - 10);
    if (!freeLand(x, y) || gAt(x, y) !== G.GRASS) continue;
    if (far && Math.hypot(x - player.x, y - player.y) < 16) continue;
    const q = Math.random(); spawnMob(q < .45 ? 'sheep' : q < .75 ? 'chicken' : 'cow', x, y); return;
  }
}
function tryGuards() {
  for (const [k, cap] of [['ruins', 3], ['vault', 2]]) {
    const s = sites[k]; if (Math.hypot(player.x - s.x, player.y - s.y) > 16) continue;
    if (mobs.filter(m => m.home === k).length >= cap) continue;
    for (let t = 0; t < 15; t++) {
      const x = s.x + rint(-6, 6), y = s.y + rint(-6, 6);
      if (k === 'vault' && Math.abs(x - s.x) <= 3 && Math.abs(y - s.y) <= 3) continue;
      if (!freeLand(x, y, true) || Math.hypot(x - player.x, y - player.y) < 7) continue;
      spawnMob('imp', x, y, k); break;
    }
  }
}
function updateMobs(dt, night) {
  for (const m of mobs) {
    const d = m.def; m.cd -= dt; m.hurt -= dt; m.flee -= dt;
    const dx = player.x - m.x, dy = player.y - m.y, dist = Math.hypot(dx, dy) || 1;
    let vx = 0, vy = 0, sp = d.speed;
    if (d.hostile && state === 'play') {
      const aggro = d.boss ? 16 : d.guard ? 9 : 12;
      const homeS = m.home && sites[m.home];
      const leashed = homeS && Math.hypot(m.x - homeS.x, m.y - homeS.y) > 11;
      if (dist < aggro && !leashed) { vx = dx / dist; vy = dy / dist; }
      else if (leashed) { const hx = homeS.x - m.x, hy = homeS.y - m.y, hd = Math.hypot(hx, hy); vx = hx / hd; vy = hy / hd; }
      else wander(m, dt), vx = m.dir.x * .5, vy = m.dir.y * .5;
      if (dist < .75 * (d.size || 1) + .2 && m.cd <= 0) { hurtPlayer(d.dmg, m); m.cd = d.boss ? 1.4 : 1.0; }
      if (m.type === 'slime') sp *= (Math.sin(performance.now() / 160 + m.x) > 0 ? 1.4 : .3);
      if (m.type === 'bat') { vx += Math.sin(performance.now() / 200 + m.y) * .6; vy += Math.cos(performance.now() / 230 + m.x) * .6; }
    } else if (!d.hostile) {
      if (m.flee > 0) { vx = -dx / dist; vy = -dy / dist; sp *= 2.3; }
      else { wander(m, dt); vx = m.dir.x; vy = m.dir.y; }
    }
    // separation
    for (const o of mobs) { if (o === m) continue; const ox = m.x - o.x, oy = m.y - o.y, od = Math.hypot(ox, oy); if (od < .7 && od > 0) { vx += ox / od * .6; vy += oy / od * .6; } }
    m.kb.x *= Math.pow(.004, dt); m.kb.y *= Math.pow(.004, dt);
    const mx = (vx * sp + m.kb.x) * dt, my = (vy * sp + m.kb.y) * dt;
    if (Math.abs(vx) > .05) m.face = vx > 0 ? 1 : -1;
    moveEntity(m, mx, my);
    m.moving = Math.abs(mx) + Math.abs(my) > .001;
    // dawn: night creatures burn away
    if (!night && d.hostile && !d.guard) { m.burn += dt; if (m.burn > 1.5 + (m.x % 1) * 2) { m.hp = 0; m.burned = true; } }
    if (dist > 45 && !d.boss) m.gone = true;
  }
  for (const m of mobs) if (m.hp <= 0 && !m.dead) killMob(m);
  mobs = mobs.filter(m => !m.dead && !m.gone);
}
function wander(m, dt) {
  m.wt -= dt;
  if (m.wt <= 0) { m.wt = 1 + Math.random() * 3; if (Math.random() < .4) m.dir = { x: 0, y: 0 }; else { const a = Math.random() * Math.PI * 2; m.dir = { x: Math.cos(a) * .6, y: Math.sin(a) * .6 }; } }
}
function hitMob(m, dmg) {
  m.hp -= dmg; m.hurt = .2; m.flee = 2.5;
  const dx = m.x - player.x, dy = m.y - player.y, d = Math.hypot(dx, dy) || 1, kbk = m.def.boss ? 3 : 8;
  m.kb.x = dx / d * kbk; m.kb.y = dy / d * kbk;
  floatText(m.x, m.y - .8, '-' + dmg, '#ff8a80'); sfx('knifeSlice', .5);
  for (let i = 0; i < 6; i++) particles.push({ x: m.x, y: m.y - .2, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 4, t: .5, c: m.def.hostile ? '#7a1f3d' : '#b33', s: 3 });
}
function killMob(m) {
  m.dead = true;
  for (let i = 0; i < 14; i++) particles.push({ x: m.x, y: m.y - .2, vx: (Math.random() - .5) * 5, vy: (Math.random() - .5) * 5, t: .8, c: m.burned ? '#555' : '#eee', s: 4 });
  if (m.burned) return;
  sfx('knifeSlice2', .5, .8);
  if (m.def.hostile) kills++;
  for (const [k, [a, b]] of Object.entries(m.def.drops || {})) addItem(k, rint(a, b));
  if (m.def.boss) { bossDefeated = true; addItem('shield', 1); }
}
function hurtPlayer(dmg, src) {
  if (player.inv > 0 || state !== 'play') return;
  const real = has('shield') ? Math.max(1, Math.round(dmg / 2)) : dmg;
  player.hp -= real; player.inv = .7; flash = .35;
  sfx('dropLeather', .6, .9);
  if (src) { const dx = player.x - src.x, dy = player.y - src.y, d = Math.hypot(dx, dy) || 1; player.kbx = dx / d * 9; player.kby = dy / d * 9; }
  if (player.hp <= 0) die(src ? `Defeated by a ${src.def.name}.` : 'You starved.');
}
function die(msg) {
  player.hp = 0; state = 'dead'; closePanels(true); closeDialog();
  $('deathMsg').textContent = msg + ' Your belongings are safe.'; $('death').classList.remove('hidden');
  sfx('bong_001', .5, .7);
}
function respawn() {
  player.x = spawnPoint.x; player.y = spawnPoint.y; player.hp = player.maxHp; player.hunger = Math.max(player.hunger, 14);
  mobs = mobs.filter(m => !m.def.hostile || Math.hypot(m.x - player.x, m.y - player.y) > 16);
  $('death').classList.add('hidden'); state = 'play'; sfx('maximize_006', .4);
}

// ---------- Player actions ----------
function mouseWorld() { return { x: (mouse.x - VW / 2) / TS + cam.x, y: (mouse.y - VH / 2) / TS + cam.y }; }
function eat(k) {
  const d = ITEMS[k];
  if (d.food && player.hunger >= 20 && (!d.heal || player.hp >= player.maxHp)) { toast("You're not hungry."); return false; }
  if (!d.food && d.heal && player.hp >= player.maxHp) { toast('You are already at full health.'); return false; }
  if (d.food) player.hunger = Math.min(20, player.hunger + d.food);
  if (d.heal) player.hp = Math.min(player.maxHp, player.hp + d.heal);
  removeItem(k); sfx(k === 'potion' ? 'glass_002' : 'cloth1', .5, .8); floatText(player.x, player.y - .9, d.food ? `+${d.food / 2} hunger` : `+${d.heal / 2} hearts`, '#9ef59e');
  return true;
}
function primaryAction() {
  if (player.atkCd > 0) return;
  const k = hotbar[sel], d = k ? ITEMS[k] : null, mw = mouseWorld();
  player.face = mw.x >= player.x ? 1 : -1;
  if (d && (d.food || (d.heal && !d.legend))) { eat(k); player.atkCd = .4; return; }
  if (k === 'staff') { castLightning(mw); return; }
  player.atkCd = .33; player.swing = .2;
  // mobs first
  let target = null, best = 1e9;
  for (const m of mobs) {
    const sz = m.def.size || 1, dm = Math.hypot(m.x - mw.x, m.y - .2 - mw.y), dp = Math.hypot(m.x - player.x, m.y - player.y);
    if (dm < .75 * sz && dp < 1.9 + sz * .35 && dm < best) { best = dm; target = m; }
  }
  if (target) { hitMob(target, (d && d.dmg) || 1); return; }
  const tx = Math.floor(mw.x), ty = Math.floor(mw.y);
  if (Math.hypot(tx + .5 - player.x, ty + .5 - player.y) > REACH) { sfx('cloth2', .15, 1.4); return; }
  const o = oAt(tx, ty);
  if (o) { hitObj(tx, ty, o, d); return; }
  if (d && (d.place || d.placeGround)) { place(tx, ty, k, d); return; }
  sfx('cloth2', .15, 1.4);
}
function hitObj(tx, ty, o, d) {
  const od = OBJ[o.t];
  if (od.unbreak) { if (od.interact) interact(tx, ty, o); return; }
  const tool = d && d.tool;
  if (od.need && tool !== od.tool) { toast(`You need a ${od.tool} for that.`, 'warn'); sfx('error_001', .35); player.atkCd = .5; return; }
  let dmg = od.built ? 2 : (tool && tool === od.tool ? 3 : 1);
  if (od.built && tool) dmg = 3;
  o.hp -= dmg; o.shake = .2; sfx(od.sfx || 'cloth2', .45);
  const pc = od.fx === 'wood' ? '#8a5a2b' : od.fx === 'stone' ? '#9a9a9a' : '#4caf50';
  for (let i = 0; i < 5; i++) particles.push({ x: tx + .5, y: ty + .5, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 4 - 1, t: .5, c: pc, s: 3 });
  if (o.hp <= 0) {
    setObj(tx, ty, null);
    for (const [k, [a, b]] of Object.entries(od.drops || {})) addItem(k, rint(a, b));
    sfx('pluck_001', .4);
  }
}
function place(tx, ty, k, d) {
  const g = gAt(tx, ty);
  if (!isLand(g)) { toast("You can't build on water.", 'warn'); sfx('error_001', .3); return; }
  const overlaps = e => Math.abs(e.x - (tx + .5)) < .5 + HS && Math.abs(e.y - (ty + .5)) < .5 + HS;
  if (d.placeGround) {
    if (g === G.FLOOR || g === G.RUIN) return;
    ground[idx(tx, ty)] = G.FLOOR; mapDirty = true;
  } else {
    const def = OBJ[d.place];
    if ((def.solid || def.mobSolid) && (overlaps(player) && def.solid || mobs.some(overlaps))) { sfx('error_001', .3); return; }
    setObj(tx, ty, d.place);
  }
  removeItem(k); sfx('creak1', .45, 1.2); player.atkCd = .18;
  for (let i = 0; i < 5; i++) particles.push({ x: tx + .5, y: ty + .9, vx: (Math.random() - .5) * 3, vy: -Math.random() * 2, t: .4, c: '#d9c8a0', s: 3 });
}
function castLightning(mw) {
  if (staffCd > 0) { floatText(player.x, player.y - 1, 'Recharging…', '#9ecbff'); player.atkCd = .3; return; }
  if (Math.hypot(mw.x - player.x, mw.y - player.y) > 8) { toast('Too far for the Storm Staff.', 'warn'); player.atkCd = .3; return; }
  staffCd = 2.2; player.atkCd = .4; player.swing = .25;
  bolts.push({ x: mw.x, y: mw.y, t: .35 }); flash = -.25;
  sfx('glitch_001', .6, .7); sfx('knifeSlice2', .5, .6);
  for (const m of mobs) if (Math.hypot(m.x - mw.x, m.y - mw.y) < 1.6) hitMob(m, 18);
  for (let i = 0; i < 20; i++) particles.push({ x: mw.x, y: mw.y, vx: (Math.random() - .5) * 7, vy: (Math.random() - .5) * 7, t: .5, c: '#bfe3ff', s: 3 });
}
function nearestInteract() {
  let best = null, bd = 1.7;
  for (let y = Math.floor(player.y) - 2; y <= Math.floor(player.y) + 2; y++) for (let x = Math.floor(player.x) - 2; x <= Math.floor(player.x) + 2; x++) {
    const o = oAt(x, y); if (!o || !OBJ[o.t].interact) continue;
    const d = Math.hypot(x + .5 - player.x, y + .5 - player.y); if (d < bd) { bd = d; best = { x, y, o }; }
  }
  return best;
}
function secondaryAction() {
  const mw = mouseWorld(), tx = Math.floor(mw.x), ty = Math.floor(mw.y), o = oAt(tx, ty);
  if (o && OBJ[o.t].interact && Math.hypot(tx + .5 - player.x, ty + .5 - player.y) <= REACH) { interact(tx, ty, o); return; }
  const n = nearestInteract(); if (n) { interact(n.x, n.y, n.o); return; }
  const k = hotbar[sel]; if (k && (ITEMS[k].food || ITEMS[k].heal) && !ITEMS[k].legend) eat(k);
}
function interact(x, y, o) {
  const kind = OBJ[o.t].interact;
  if (kind === 'sign') { if (dialogObj === o) closeDialog(); else { openDialog(o.data.text, o); sfx('bookOpen', .35); } }
  else if (kind === 'chest') {
    setObj(x, y, 'chestOpen'); sfx('metalLatch', .6); sfx('handleCoins', .4);
    for (const [k, n] of Object.entries(o.data.loot)) addItem(k, n);
  } else if (kind === 'vault') {
    if (!has('key')) { toast('The vault is sealed. It needs an ancient key.', 'warn'); sfx('error_001', .35); return; }
    setObj(x, y, 'vaultOpen'); sfx('doorOpen_1', .6, .7); toast('The Ancient Key turns… the vault opens!', 'good');
  } else if (kind === 'relic') { setObj(x, y, null); addItem(OBJ[o.t].relic, 1); }
  else if (kind === 'sleep') sleep(x, y);
}
function isNight() { return darkness() > .5; }
function sleep(x, y) {
  spawnPoint = { x: x + .5, y: y + 1.5 };
  if (collides(spawnPoint.x, spawnPoint.y, player)) spawnPoint = { x: player.x, y: player.y };
  if (!isNight()) { toast('Respawn point set. You can only sleep at night.'); sfx('select_001', .4); return; }
  if (mobs.some(m => m.def.hostile && Math.hypot(m.x - player.x, m.y - player.y) < 9)) { toast('You may not rest now — there are monsters nearby!', 'warn'); sfx('error_001', .35); return; }
  paused = true; $('fade').classList.add('on'); sfx('maximize_006', .4, .7);
  setTimeout(() => {
    const t = (worldTime / DAY_LEN) % 1; worldTime += (1 - t + .02) * DAY_LEN;
    mobs = mobs.filter(m => !m.def.hostile || m.def.guard);
    player.hunger = Math.max(2, player.hunger - 3); player.hp = Math.min(player.maxHp, player.hp + 6);
    $('fade').classList.remove('on'); paused = false; toast('You slept soundly. Respawn point set. Game saved.', 'good'); saveGame(false);
  }, 1200);
}

// ---------- Day / night ----------
function dayT() { return (worldTime / DAY_LEN) % 1; }
function darkness() {
  const t = dayT();
  if (t < .58) return 0; if (t < .66) return (t - .58) / .08 * .86; if (t < .94) return .86; return (1 - (t - .94) / .06) * .86;
}

// ---------- Update ----------
function update(dt) {
  if (state !== 'play' || paused) return;
  worldTime += dt;
  const night = isNight();
  if (night && !lastNight) { toast('Night falls… monsters roam the island. Find shelter!', 'warn'); sfx('bong_001', .5); }
  if (!night && lastNight) { dayNum = Math.floor(worldTime / DAY_LEN) + 1; toast(`Dawn breaks — Day ${dayNum}`, 'good'); }
  dayNum = Math.floor(worldTime / DAY_LEN) + 1;
  lastNight = night;
  player.inv -= dt; player.atkCd -= dt; player.swing -= dt; staffCd -= dt; warnCd -= dt; flash = flash > 0 ? flash - dt : Math.min(0, flash + dt);

  // movement
  let ix = 0, iy = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iy--; if (keys.has('KeyS') || keys.has('ArrowDown')) iy++;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix--; if (keys.has('KeyD') || keys.has('ArrowRight')) ix++;
  const len = Math.hypot(ix, iy) || 1;
  player.swim = gAt(Math.floor(player.x), Math.floor(player.y)) === G.WATER;
  const sprint = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && player.hunger > 3 && !player.swim;
  let speed = player.swim ? 2.4 : sprint ? 6.2 : 4.2;
  if (has('staff')) speed *= 1.1;
  player.kbx = (player.kbx || 0) * Math.pow(.003, dt); player.kby = (player.kby || 0) * Math.pow(.003, dt);
  const mx = ix / len * speed * dt + player.kbx * dt, my = iy / len * speed * dt + player.kby * dt;
  player.moving = !!(ix || iy);
  if (ix) player.face = ix > 0 ? 1 : -1;
  if (dialogObj && player.moving) closeDialog();
  moveEntity(player, mx, my);

  // footsteps / swimming strokes
  if (player.moving) {
    stepAcc += dt;
    const iv = player.swim ? .6 : sprint ? .24 : .34;
    if (stepAcc > iv) { stepAcc = 0; if (player.swim) sfx('drop_002', .18, .6); else sfx('footstep0' + rint(0, 4), .22); }
  }
  // doors
  const onD = (() => { const o = oAt(Math.floor(player.x), Math.floor(player.y)); return o && o.t === 'door'; })();
  if (onD && !onDoor) sfx('doorOpen_1', .35); if (!onD && onDoor) sfx('doorClose_1', .3); onDoor = onD;

  // hunger & health
  let rate = 1 / 13; if (sprint && player.moving) rate *= 2; if (player.swim) rate *= 2.5; if (has('sunflower')) rate *= .5;
  hungerAcc += dt * rate; if (hungerAcc >= 1) { hungerAcc -= 1; player.hunger = Math.max(0, player.hunger - 1); }
  if (player.hunger <= 0) { starveAcc += dt; if (starveAcc > 4) { starveAcc = 0; player.hp -= 1; flash = .25; sfx('dropLeather', .4, .7); floatText(player.x, player.y - 1, 'Starving!', '#ff8a80'); if (player.hp <= 0) die('You starved.'); } }
  else if (player.hunger >= 14 && player.hp < player.maxHp) { regenAcc += dt; if (regenAcc > 3) { regenAcc = 0; player.hp++; hungerAcc += .35; } }

  // held mouse = repeated action
  if (mouse.down && !openPanel) primaryAction();

  // spawns
  spawnAcc += dt; if (night && spawnAcc > 2.4) { spawnAcc = 0; trySpawnNight(); }
  animalAcc += dt; if (animalAcc > 15) { animalAcc = 0; trySpawnAnimal(true); }
  guardAcc += dt; if (guardAcc > 3) { guardAcc = 0; tryGuards(); }
  if (night && !bossDefeated && !mobs.some(m => m.def.boss) && Math.hypot(player.x - sites.circle.x, player.y - sites.circle.y) < 15) {
    spawnMob('cyclops', sites.circle.x, sites.circle.y);
    toast('The ground trembles… a one-eyed giant rises in the Stone Circle!', 'warn'); sfx('bong_001', .7, .6);
  }
  updateMobs(dt, night);
  saveAcc += dt; if (saveAcc > 30) { saveAcc = 0; saveGame(false); }

  // exploration
  revealAcc += dt; if (revealAcc > .2) {
    revealAcc = 0; reveal(player.x, player.y, 10);
    for (const k of ['spawn', 'ruins', 'vault', 'grove', 'hills', 'circle', 'islet']) {
      if (!discovered.has(k) && Math.hypot(player.x - sites[k].x, player.y - sites[k].y) < 8) {
        discovered.add(k); if (k !== 'spawn') { toast(`Discovered: <b>${sites[k].name}</b>`, 'good'); sfx('select_001', .5); }
      }
    }
  }
  if (dialogObj && !nearestInteract()) closeDialog();

  // fx
  for (const p of particles) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 6 * dt; }
  particles = particles.filter(p => p.t > 0);
  for (const f of floats) { f.t -= dt; f.y -= dt * .8; } floats = floats.filter(f => f.t > 0);
  for (const b of bolts) b.t -= dt; bolts = bolts.filter(b => b.t > 0);
  for (const o of obj) if (o && o.shake > 0) o.shake -= dt;
  if (hotbarNameT > 0) hotbarNameT -= dt;
  // relic sparkle hints
  if (Math.random() < dt * 6) {
    for (let y = Math.floor(cam.y - 9); y < cam.y + 9; y++) for (let x = Math.floor(cam.x - 15); x < cam.x + 15; x++) {
      const o = oAt(x, y); if (o && (o.t === 'chest' || o.t === 'sunflower') && Math.random() < .3)
        particles.push({ x: x + Math.random(), y: y + Math.random(), vx: 0, vy: -1.2, t: .8, c: '#ffe680', s: 2, nograv: 1 });
    }
  }

  // music crossfade
  const nd = darkness() / .86;
  music.day.volume = clamp(.38 * (1 - nd), 0, 1); music.night.volume = clamp(.42 * nd, 0, 1);
}

// ---------- Render ----------
function render() {
  ctx.imageSmoothingEnabled = false;
  cam.x += (player.x - cam.x) * .18; cam.y += (player.y - cam.y) * .18;
  if (state === 'title') { cam.x = player.x + Math.sin(performance.now() / 6000) * 6; }
  const ox = Math.round(VW / 2 - cam.x * TS), oy = Math.round(VH / 2 - cam.y * TS);
  const x0 = Math.floor(cam.x - VW / 2 / TS) - 1, x1 = Math.ceil(cam.x + VW / 2 / TS) + 1;
  const y0 = Math.floor(cam.y - VH / 2 / TS) - 1, y1 = Math.ceil(cam.y + VH / 2 / TS) + 2;
  const now = performance.now() / 1000;
  ctx.fillStyle = '#1b3768'; ctx.fillRect(0, 0, VW, VH);

  // ground
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const sx = ox + x * TS, sy = oy + y * TS, g = gAt(x, y);
    if (g === G.DEEP || g === G.WATER) {
      drawIdx('battle', g === G.WATER ? shoreIdx[idx(x, y)] : 37, sx, sy);
      if (g === G.DEEP || !inMap(x, y)) { ctx.fillStyle = 'rgba(10,30,90,.38)'; ctx.fillRect(sx, sy, TS, TS); }
      if ((hash2(x, y, 5) < .06) && Math.sin(now * 2 + x * 1.7 + y) > .6) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(sx + 12, sy + 18 + Math.sin(now + x) * 3, 18, 3); }
    } else if (g === G.GRASS) { const h = hash2(x, y, 1); drawSpr(h < .8 ? 'grass' : h < .94 ? 'grass2' : 'flowers', sx, sy); }
    else drawSpr(g === G.SAND ? 'sand' : g === G.RUIN ? 'ruinFloor' : g === G.FLOOR ? 'floor' : 'dirt', sx, sy);
  }
  // buoys
  for (const b of buoys) {
    if (b.x < x0 || b.x > x1 || b.y < y0 || b.y > y1) continue;
    drawSpr('buoy', ox + b.x * TS, oy + b.y * TS + Math.sin(now * 2 + b.ph) * 4, TS);
  }
  // y-sorted objects & entities
  const list = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const o = oAt(x, y); if (o) list.push({ y: y + .99, o, x, ty: y }); }
  for (const m of mobs) list.push({ y: m.y + .3, m });
  if (state !== 'title') list.push({ y: player.y + .3, p: 1 });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.o) {
      const o = it.o, d = OBJ[o.t], sx = ox + it.x * TS + (o.shake > 0 ? Math.sin(o.shake * 80) * 3 : 0), sy = oy + it.ty * TS;
      if (d.glow) { const r = 30 + Math.sin(now * 3) * 6; const gr = ctx.createRadialGradient(sx + TS / 2, sy + TS / 2, 2, sx + TS / 2, sy + TS / 2, r); gr.addColorStop(0, 'rgba(255,220,90,.75)'); gr.addColorStop(1, 'rgba(255,220,90,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - r, sy - r, TS + 2 * r, TS + 2 * r); }
      let spr = d.spr; if (o.t === 'door' && Math.floor(player.x) === it.x && Math.floor(player.y) === it.ty) spr = 'doorOpen';
      drawSpr(spr, sx, sy);
    } else if (it.m) drawMob(it.m, ox, oy, now);
    else drawPlayer(ox, oy, now);
  }
  // particles
  for (const p of particles) { ctx.globalAlpha = clamp(p.t * 2, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(ox + p.x * TS - p.s, oy + p.y * TS - p.s, p.s * 2, p.s * 2); }
  ctx.globalAlpha = 1;

  // target highlight
  if (state === 'play' && !openPanel) {
    const mw = mouseWorld(), tx = Math.floor(mw.x), ty = Math.floor(mw.y);
    if (Math.hypot(tx + .5 - player.x, ty + .5 - player.y) <= REACH) {
      const k = hotbar[sel], d = k && ITEMS[k];
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.strokeRect(ox + tx * TS + 1, oy + ty * TS + 1, TS - 2, TS - 2);
      if (d && d.place && !oAt(tx, ty) && isLand(gAt(tx, ty))) { ctx.globalAlpha = .5; drawSpr(OBJ[d.place].spr, ox + tx * TS, oy + ty * TS); ctx.globalAlpha = 1; }
      if (d && d.placeGround && !oAt(tx, ty) && isLand(gAt(tx, ty))) { ctx.globalAlpha = .5; drawSpr('floor', ox + tx * TS, oy + ty * TS); ctx.globalAlpha = 1; }
    }
  }
  // lightning bolts
  for (const b of bolts) {
    const bx = ox + b.x * TS, by = oy + b.y * TS; ctx.strokeStyle = `rgba(220,240,255,${b.t * 3})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx + 20, by - 400);
    for (let i = 1; i <= 8; i++) ctx.lineTo(bx + (i < 8 ? (Math.random() - .5) * 40 : 0), by - 400 + i * 50); ctx.stroke();
  }

  // darkness + lights
  const dk = darkness();
  if (dk > 0.01) {
    dctx.globalCompositeOperation = 'source-over'; dctx.clearRect(0, 0, VW, VH);
    dctx.fillStyle = `rgba(6,8,30,${dk})`; dctx.fillRect(0, 0, VW, VH);
    dctx.globalCompositeOperation = 'destination-out';
    const light = (x, y, r, a = 1) => { const px = ox + x * TS, py = oy + y * TS, R = r * TS; const g = dctx.createRadialGradient(px, py, R * .15, px, py, R); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); dctx.fillStyle = g; dctx.fillRect(px - R, py - R, R * 2, R * 2); };
    if (state !== 'title') light(player.x, player.y - .2, 4.6 + Math.sin(now * 3) * .1, .95);
    for (let y = y0 - 4; y <= y1 + 4; y++) for (let x = x0 - 4; x <= x1 + 4; x++) { const o = oAt(x, y); if (o && (OBJ[o.t].light || OBJ[o.t].glow)) light(x + .5, y + .4, (OBJ[o.t].light || 2.5) + Math.sin(now * 5 + x) * .15, .9); }
    for (const b of bolts) light(b.x, b.y, 7, 1);
    ctx.drawImage(dark, 0, 0);
    const t = dayT(); const dusk = t > .56 && t < .7 ? Math.sin((t - .56) / .14 * Math.PI) : t > .92 ? Math.sin((t - .92) / .08 * Math.PI) : 0;
    if (dusk > 0) { ctx.fillStyle = `rgba(255,110,40,${dusk * .14})`; ctx.fillRect(0, 0, VW, VH); }
  }
  if (flash > 0) { ctx.fillStyle = `rgba(200,0,0,${flash})`; ctx.fillRect(0, 0, VW, VH); }
  if (flash < 0) { ctx.fillStyle = `rgba(220,235,255,${-flash * 1.6})`; ctx.fillRect(0, 0, VW, VH); }

  // floating text
  ctx.font = '700 18px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
  for (const f of floats) { ctx.globalAlpha = clamp(f.t, 0, 1); shadowText(f.text, ox + f.x * TS, oy + f.y * TS, f.color); }
  ctx.globalAlpha = 1;
  if (state === 'play' || state === 'dead' || state === 'win') drawHUD(now);
}
function shadowText(t, x, y, c = '#fff') { ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillText(t, x + 2, y + 2); ctx.fillStyle = c; ctx.fillText(t, x, y); }
function drawMob(m, ox, oy, now) {
  const sz = TS * (m.def.size || 1), bob = m.moving ? Math.abs(Math.sin(now * 10 + m.x)) * 4 : 0;
  const fly = m.def.fly ? Math.sin(now * 4 + m.x) * 5 - 6 : 0;
  const sx = ox + m.x * TS - sz / 2, sy = oy + m.y * TS - sz + TS * .35 - bob + fly;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(ox + m.x * TS, oy + m.y * TS + TS * .3, sz * .3, sz * .1, 0, 0, 7); ctx.fill();
  if (m.def.boss) { const gr = ctx.createRadialGradient(sx + sz / 2, sy + sz / 2, 4, sx + sz / 2, sy + sz / 2, sz); gr.addColorStop(0, 'rgba(255,60,60,.35)'); gr.addColorStop(1, 'rgba(255,60,60,0)'); ctx.fillStyle = gr; ctx.fillRect(sx - sz / 2, sy - sz / 2, sz * 2, sz * 2); }
  ctx.globalAlpha = m.burned || m.burn > 0 && m.def.hostile && !m.def.guard ? clamp(1 - m.burn / 3, .2, 1) : 1;
  if (m.hurt > 0) ctx.filter = 'brightness(2.2)';
  drawSpr(m.def.spr, sx, sy, sz, m.face < 0);
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  if (m.hp < m.def.hp) {
    const w = sz * .8; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(sx + (sz - w) / 2, sy - 8, w, 5);
    ctx.fillStyle = m.def.hostile ? '#e74c3c' : '#7bd36b'; ctx.fillRect(sx + (sz - w) / 2, sy - 8, w * clamp(m.hp / m.def.hp, 0, 1), 5);
  }
}
function drawPlayer(ox, oy, now) {
  const p = player, px = ox + p.x * TS, py = oy + p.y * TS;
  const bob = p.moving && !p.swim ? Math.abs(Math.sin(now * 12)) * 4 : 0;
  const sx = px - TS / 2, sy = py - TS + TS * .35 - bob;
  if (p.inv > 0 && Math.floor(now * 20) % 2) ctx.globalAlpha = .45;
  if (p.swim) {
    ctx.save(); ctx.beginPath(); ctx.rect(sx - 10, sy - 20, TS + 20, TS * .62 + 20 + 6); ctx.clip();
    drawSpr('player', sx, sy + 10 + Math.sin(now * 4) * 2, TS, p.face < 0); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, sy + TS * .62 + 14, TS * .45 + Math.sin(now * 4) * 2, 6, 0, 0, 7); ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(px, py + TS * .3, TS * .3, TS * .1, 0, 0, 7); ctx.fill();
    drawSpr('player', sx, sy, TS, p.face < 0);
    const k = hotbar[sel];
    if (k && (ITEMS[k].dmg || ITEMS[k].tool || k === 'staff')) {
      const sw = p.swing > 0 ? (1 - p.swing / .2) : 0;
      ctx.save(); ctx.translate(px + p.face * TS * .32, sy + TS * .62); ctx.scale(p.face, 1); ctx.rotate(-0.6 + sw * 2.2);
      drawSpr(ITEMS[k].icon, -TS * .1, -TS * .62, TS * .62); ctx.restore();
    }
  }
  ctx.globalAlpha = 1;
}
function drawHUD(now) {
  ctx.textAlign = 'left';
  const hs = 26;
  // hearts
  const hearts = player.maxHp / 2;
  for (let i = 0; i < hearts; i++) {
    const x = 16 + (i % 10) * (hs + 2), y = 14 + Math.floor(i / 10) * (hs + 2);
    const v = player.hp - i * 2, shake = player.hp <= 4 && player.hp > 0 ? Math.sin(now * 30 + i) * 1.5 : 0;
    ctx.globalAlpha = .25; drawSpr('heart', x, y + shake, hs); ctx.globalAlpha = 1;
    if (v >= 2) drawSpr('heart', x, y + shake, hs);
    else if (v === 1) { ctx.save(); ctx.beginPath(); ctx.rect(x, y - 4, hs / 2, hs + 8); ctx.clip(); drawSpr('heart', x, y + shake, hs); ctx.restore(); }
  }
  const hy = 14 + Math.ceil(hearts / 10) * (hs + 2) + 2;
  for (let i = 0; i < 10; i++) {
    const x = 16 + i * (hs + 2), v = player.hunger - i * 2, shake = player.hunger <= 4 ? Math.sin(now * 25 + i) * 1.5 : 0;
    ctx.globalAlpha = .25; drawSpr('food', x, hy + shake, hs); ctx.globalAlpha = 1;
    if (v >= 2) drawSpr('food', x, hy + shake, hs);
    else if (v === 1) { ctx.save(); ctx.beginPath(); ctx.rect(x, hy - 4, hs / 2, hs + 8); ctx.clip(); drawSpr('food', x, hy + shake, hs); ctx.restore(); }
  }
  // materials
  ctx.font = '700 17px "Pixelify Sans", monospace';
  let mx = 16; const my = hy + hs + 8;
  for (const k of ['wood', 'stone', 'wool']) { drawSpr(ITEMS[k].icon, mx, my, 24); shadowText(String(inv[k] || 0), mx + 28, my + 19); mx += 72; }

  // relic bar (top center)
  const rs = 34, rw = RELICS.length * (rs + 8);
  let rx = VW / 2 - rw / 2;
  ctx.fillStyle = 'rgba(20,14,8,.55)'; ctx.fillRect(rx - 10, 8, rw + 12, rs + 26);
  ctx.font = '600 13px "Pixelify Sans", monospace'; ctx.textAlign = 'center'; shadowText(`Legendary relics ${relicsFound}/6`, VW / 2, 22, '#ffd75e'); ctx.textAlign = 'left';
  for (const r of RELICS) {
    if (has(r)) drawSpr(ITEMS[r].icon, rx, 26, rs); else { ctx.save(); ctx.filter = 'brightness(0) opacity(.5)'; drawSpr(ITEMS[r].icon, rx, 26, rs); ctx.restore(); }
    rx += rs + 8;
  }

  // clock + minimap (top right)
  const mmS = 150, mmX = VW - mmS - 16, mmY = 40;
  ctx.font = '700 18px "Pixelify Sans", monospace'; ctx.textAlign = 'right';
  const night = isNight(), t = dayT();
  const phase = night ? 'Night' : t > .54 && t < .66 ? 'Dusk' : t > .94 ? 'Dawn' : 'Day';
  shadowText(`Day ${dayNum} · ${phase}`, VW - 16, 28, night ? '#a9b8ff' : '#ffe9a8');
  ctx.textAlign = 'left';
  if (mapDirty) buildMapBase();
  ctx.fillStyle = 'rgba(20,14,8,.7)'; ctx.fillRect(mmX - 4, mmY - 4, mmS + 8, mmS + 8);
  ctx.drawImage(mapBase, mmX, mmY, mmS, mmS); ctx.drawImage(fogC, mmX, mmY, mmS, mmS);
  const k = mmS / W;
  for (const s of discovered) { const st = sites[s]; drawSpr('flag', mmX + st.x * k - 7, mmY + st.y * k - 12, 14); }
  ctx.fillStyle = '#ff3b3b'; ctx.fillRect(mmX + player.x * k - 3, mmY + player.y * k - 3, 6, 6);
  ctx.font = '600 12px "Pixelify Sans", monospace'; shadowText('M: map · J: journal', mmX, mmY + mmS + 18, '#ddd');

  // hotbar
  const ss = 54, gap = 4, n = hotbar.length, hw = n * ss + (n - 1) * gap, hx = VW / 2 - hw / 2, hyb = VH - ss - 16;
  for (let i = 0; i < n; i++) {
    const x = hx + i * (ss + gap);
    ctx.drawImage(IMG.slot, x, hyb, ss, ss);
    const it = hotbar[i];
    if (it) {
      drawSpr(ITEMS[it].icon, x + 9, hyb + 8, 36);
      if (inv[it] > 1) { ctx.font = '700 15px "Pixelify Sans", monospace'; ctx.textAlign = 'right'; shadowText(String(inv[it]), x + ss - 6, hyb + ss - 6); ctx.textAlign = 'left'; }
    }
    ctx.font = '600 11px "Pixelify Sans", monospace'; ctx.fillStyle = 'rgba(60,36,20,.8)'; ctx.fillText(String((i + 1) % 10), x + 7, hyb + 16);
    if (i === sel) { ctx.strokeStyle = '#ffd75e'; ctx.lineWidth = 4; ctx.strokeRect(x - 2, hyb - 2, ss + 4, ss + 4); }
  }
  const selK = hotbar[sel];
  if (selK && hotbarNameT > 0) { ctx.globalAlpha = clamp(hotbarNameT, 0, 1); ctx.font = '700 18px "Pixelify Sans", monospace'; ctx.textAlign = 'center'; shadowText(ITEMS[selK].name, VW / 2, hyb - 30); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
  ctx.font = '600 13px "Pixelify Sans", monospace'; shadowText('C: craft · I: inventory · F: interact', hx, hyb - 8, '#ddd');

  // interaction prompt
  if (state === 'play') {
    const ni = nearestInteract();
    if (ni && !dialogObj) {
      const d = OBJ[ni.o.t]; const ox = Math.round(VW / 2 - cam.x * TS), oy = Math.round(VH / 2 - cam.y * TS);
      ctx.font = '700 16px "Pixelify Sans", monospace'; ctx.textAlign = 'center';
      const label = `[F] ${d.label}`, tw = ctx.measureText(label).width + 16, px = ox + (ni.x + .5) * TS, py = oy + ni.y * TS - 12;
      ctx.fillStyle = 'rgba(20,14,8,.8)'; ctx.fillRect(px - tw / 2, py - 18, tw, 24); shadowText(label, px, py, '#fff'); ctx.textAlign = 'left';
    }
    if (player.swim) { ctx.font = '700 15px "Pixelify Sans", monospace'; ctx.textAlign = 'center'; shadowText('Swimming — hunger drains faster', VW / 2, hyb - 54, '#9ed8ff'); ctx.textAlign = 'left'; }
  }
}
function drawBigMap() {
  const c = $('mapCanvas'), m = c.getContext('2d'); m.imageSmoothingEnabled = false;
  if (mapDirty) buildMapBase();
  const k = c.width / W;
  m.clearRect(0, 0, c.width, c.height); m.drawImage(mapBase, 0, 0, c.width, c.height); m.drawImage(fogC, 0, 0, c.width, c.height);
  m.font = '700 13px "Pixelify Sans", monospace'; m.textAlign = 'center';
  for (const s of discovered) {
    const st = sites[s]; const [img, sx, sy] = sprSrc('flag'); m.drawImage(img, sx, sy, 16, 16, st.x * k - 10, st.y * k - 22, 20, 20);
    m.fillStyle = '#000'; m.fillText(st.name, st.x * k + 1, st.y * k + 13); m.fillStyle = '#fff'; m.fillText(st.name, st.x * k, st.y * k + 12);
  }
  m.fillStyle = '#ff3b3b'; m.fillRect(player.x * k - 4, player.y * k - 4, 8, 8);
  m.strokeStyle = 'rgba(255,80,80,.6)'; m.setLineDash([4, 4]); m.beginPath(); m.arc(CX * k, CY * k, BOUND * k, 0, 7); m.stroke(); m.setLineDash([]);
}

// ---------- Save / Load ----------
const SAVE_KEY = 'relic-isle-save-v1';
let saveAcc = 0;
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function saveGame(manual) {
  if (state !== 'play' && state !== 'win') return false;
  const objs = [];
  for (let i = 0; i < obj.length; i++) { const o = obj[i]; if (o) objs.push([i, o.t, o.hp, o.data]); }
  const data = {
    v: 1, savedAt: Date.now(),
    ground: Array.from(ground).join(''), seen: Array.from(seen).join(''), objs,
    player: { x: player.x, y: player.y, hp: player.hp, maxHp: player.maxHp, hunger: player.hunger },
    inv, hotbar, sel, worldTime, spawnPoint, bossDefeated, kills, discovered: [...discovered],
    playMs: performance.now() - startTime,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    if (manual) { toast('Game saved.', 'good'); sfx('confirmation_001', .4); }
    return true;
  } catch (e) {
    if (manual) { toast('Could not save — browser storage is unavailable.', 'warn'); sfx('error_001', .35); }
    return false;
  }
}
function loadGame() {
  let d; try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return false; }
  if (!d || d.v !== 1) return false;
  for (let i = 0; i < W * H; i++) { ground[i] = +d.ground[i]; seen[i] = +d.seen[i]; obj[i] = null; }
  for (const [i, t, hp, data] of d.objs) if (OBJ[t]) obj[i] = { t, hp, data, shake: 0 };
  shoreIdx.fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (ground[idx(x, y)] === G.WATER) shoreIdx[idx(x, y)] = shoreTile(x, y);
  Object.assign(player, d.player);
  inv = d.inv || {}; hotbar = d.hotbar || new Array(10).fill(null); sel = d.sel || 0;
  worldTime = d.worldTime; dayNum = Math.floor(worldTime / DAY_LEN) + 1; lastNight = isNight();
  spawnPoint = d.spawnPoint; bossDefeated = d.bossDefeated; kills = d.kills || 0;
  discovered.clear(); for (const k of d.discovered || []) discovered.add(k);
  relicsFound = RELICS.filter(r => inv[r]).length;
  for (let i = 0; i < W * H; i++) fogData.data[i * 4 + 3] = seen[i] ? 0 : 255;
  fogC.getContext('2d').putImageData(fogData, 0, 0);
  mobs = mobs.filter(m => !m.def.hostile);
  buildMapBase();
  startTime = performance.now() - (d.playMs || 0);
  return true;
}
function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } }

// ---------- Input ----------
addEventListener('keydown', e => {
  if (state === 'title') return;
  keys.add(e.code);
  if (state !== 'play') return;
  if (e.code === 'Escape') { closePanels(); closeDialog(); }
  else if (e.code === 'KeyC') togglePanel('craft');
  else if (e.code === 'KeyI' || e.code === 'Tab') { e.preventDefault(); togglePanel('inv'); }
  else if (e.code === 'KeyJ') togglePanel('journal');
  else if (e.code === 'KeyM') togglePanel('map');
  else if (e.code === 'KeyP') saveGame(true);
  else if (paused) return;
  else if (/^Digit\d$/.test(e.code)) { const d = +e.code.slice(5); sel = d === 0 ? 9 : d - 1; hotbarNameT = 2; sfx('click_001', .2); }
  else if (e.code === 'KeyF') { const n = nearestInteract(); if (n) interact(n.x, n.y, n.o); }
  else if (e.code === 'KeyE') { const k = hotbar[sel]; const f = (k && (ITEMS[k].food || ITEMS[k].heal) && !ITEMS[k].legend) ? k : Object.keys(inv).filter(i => ITEMS[i].food).sort((a, b) => ITEMS[a].food - ITEMS[b].food)[0]; if (f) eat(f); else toast('You have nothing to eat.'); }
  else if (e.code === 'Space') { e.preventDefault(); let t = null, bd = 1.9; for (const m of mobs) { const d = Math.hypot(m.x - player.x, m.y - player.y); if (d < bd) { bd = d; t = m; } } if (t && player.atkCd <= 0) { player.face = t.x > player.x ? 1 : -1; player.atkCd = .33; player.swing = .2; const k = hotbar[sel]; hitMob(t, (k && ITEMS[k].dmg) || 1); } }
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); mouse.down = false; });
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
cv.addEventListener('mousedown', e => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  if (state !== 'play' || paused) return;
  if (e.button === 0) { mouse.down = true; primaryAction(); }
  if (e.button === 2) secondaryAction();
});
addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('wheel', e => { if (state !== 'play' || paused) return; sel = (sel + (e.deltaY > 0 ? 1 : 9)) % 10; hotbarNameT = 2; }, { passive: true });

function beginPlay(loaded) {
  try { AC.resume(); } catch (e) { /* ignore */ }
  sfx('confirmation_001', .5);
  $('title').classList.add('hidden'); state = 'play'; if (!loaded) startTime = performance.now();
  music.day.play().catch(() => {}); music.night.play().catch(() => {});
  cam.x = player.x; cam.y = player.y;
  $('btnSave').classList.remove('hidden');
  if (loaded) setTimeout(() => toast(`Welcome back — Day ${dayNum}, relics ${relicsFound}/6.`, 'good'), 400);
  else { setTimeout(() => toast('Read the sign near camp to begin (walk up & press <b>F</b>).'), 600); saveGame(false); }
}
$('btnStart').addEventListener('click', () => {
  if (hasSave() && !confirm('Start a new game? Your saved game will be overwritten.')) return;
  deleteSave(); beginPlay(false);
});
$('btnContinue2').addEventListener('click', () => { if (loadGame()) beginPlay(true); else { toast('Saved game could not be loaded.', 'warn'); $('btnContinue2').classList.add('hidden'); } });
$('btnSave').addEventListener('click', () => { saveGame(true); cv.focus(); });
addEventListener('beforeunload', () => { if (state === 'play') saveGame(false); });
$('btnRespawn').addEventListener('click', () => { respawn(); saveGame(false); });
$('btnContinue').addEventListener('click', () => { $('win').classList.add('hidden'); state = 'play'; });

// ---------- Boot ----------
let last = performance.now();
function frame(t) {
  const dt = Math.min(.05, (t - last) / 1000); last = t;
  update(dt); render();
  requestAnimationFrame(frame);
}
(async function boot() {
  $('btnStart').disabled = true; $('btnStart').textContent = 'Loading…';
  await Promise.all([...Object.entries(SHEETS).map(([k, s]) => loadImg(k, s.src)), ...Object.entries(UI_IMGS).map(([k, s]) => loadImg(k, s))]);
  genWorld();
  player.x = sites.spawn.x + .5; player.y = sites.spawn.y + .5; spawnPoint = { x: player.x, y: player.y };
  cam.x = player.x; cam.y = player.y;
  for (let i = 0; i < 16; i++) trySpawnAnimal(false);
  reveal(player.x, player.y, 10);
  requestAnimationFrame(frame);
  await Promise.all(SFX_NAMES.map(loadSfx));
  $('btnStart').disabled = false; $('btnStart').textContent = hasSave() ? 'New game' : 'Start';
  if (hasSave()) $('btnContinue2').classList.remove('hidden');
})().catch(err => { console.error(err); $('btnStart').textContent = 'Failed to load assets'; });
