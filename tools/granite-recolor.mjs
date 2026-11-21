// granite-recolor.mjs — recolore le logo source (main verte sur fond sombre) aux couleurs Granite :
// main en magnésie (--chalk) sur granite (--granite), halo vert → halo de magnésie neutre,
// coins noirs hors du carré arrondi → transparents. Sans dépendance.

export const GRANITE = [0x11, 0x13, 0x15]; // --granite #111315
export const CHALK = [0xee, 0xea, 0xe2];   // --chalk   #eeeae2

// Les deux couleurs du logo d'origine (assets/logo-source.png, mesurées).
const SRC_BG = [16, 18, 26];
const SRC_FG = [75, 218, 132];

const AXIS = SRC_FG.map((v, i) => v - SRC_BG[i]);
const AXIS_LEN2 = AXIS.reduce((s, v) => s + v * v, 0);
const BG_SUM = SRC_BG[0] + SRC_BG[1] + SRC_BG[2];
const NOISE = 12;
const clamp01 = x => Math.min(1, Math.max(0, x));

// img : { width, height, channels: 4, data: Buffer RGBA } → nouvelle image RGBA.
export function recolorGranite(img) {
  const { width, height, data } = img;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const s = i * 4;
    const p = [data[s], data[s + 1], data[s + 2]];
    // t : part de « main » du pixel, projeté sur l'axe fond → main (0 = fond, 1 = main).
    const t = clamp01(p.reduce((sum, v, k) => sum + (v - SRC_BG[k]) * AXIS[k], 0) / AXIS_LEN2);
    // Ce qui reste une fois la main retirée : fond (≈ SRC_BG) ou noir des coins.
    const rest = p.reduce((sum, v, k) => sum + Math.max(0, v - t * AXIS[k]), 0);
    // NOISE : somme RVB du bruit « presque noir » des coins de la source, ramené à transparent.
    const alpha = clamp01(Math.max((rest - NOISE) / (0.75 * BG_SUM - NOISE), t * 4)) * (data[s + 3] / 255);
    for (let k = 0; k < 3; k++) out[s + k] = Math.round(GRANITE[k] + t * (CHALK[k] - GRANITE[k]));
    out[s + 3] = Math.round(alpha * 255);
  }
  return { width, height, channels: 4, data: out };
}
