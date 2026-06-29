import type { ScatterPoint } from '../types';

// Distribuzione incrociata (matrice di conteggi) tra due variabili categoriali/date.
export interface CrossDist {
  rowVar: string;
  colVar: string;
  rowCats: string[];
  colCats: string[];      // = serie
  matrix: number[][];     // matrix[r][c]
}

// Authoring solo per CARDIO-2024 (le altre collection rimandano qui in fallback).
const RAW: Record<string, CrossDist> = {
  'cardio-2024::age::gender': {
    rowVar: 'age', colVar: 'gender',
    rowCats: ['18–30', '31–45', '46–60', '61–75', '76–90'],
    colCats: ['F', 'M'],
    matrix: [[73, 67], [165, 145], [270, 250], [185, 175], [42, 48]],
  },
  'cardio-2024::lab_value::site_id': {
    rowVar: 'lab_value', colVar: 'site_id',
    rowCats: ['<50', '50–100', '100–200', '200–300', '>300'],
    colCats: ['Site A', 'Site B', 'Site C', 'Site D', 'Site E'],
    matrix: [
      [347, 310, 248, 186, 149],
      [941, 840, 672, 504, 403],
      [834, 745, 596, 447, 358],
      [202, 180, 144, 108, 86],
      [73, 65, 52, 39, 31],
    ],
  },
  'cardio-2024::site_id::severity': {
    rowVar: 'site_id', colVar: 'severity',
    rowCats: ['Site A', 'Site B', 'Site C', 'Site D', 'Site E'],
    colCats: ['Mild', 'Moderate', 'Severe'],
    matrix: [[72, 40, 16], [60, 35, 14], [48, 30, 12], [44, 25, 10], [36, 20, 8]],
  },
  'cardio-2024::enrollment_date::status': {
    rowVar: 'enrollment_date', colVar: 'status',
    rowCats: ['Q1', 'Q2', 'Q3', 'Q4'],
    colCats: ['Active', 'Completed', 'Withdrawn'],
    matrix: [[250, 80, 30], [285, 90, 35], [260, 90, 30], [185, 60, 25]],
  },
};

function transpose(d: CrossDist): CrossDist {
  const matrix = d.colCats.map((_, c) => d.rowCats.map((__, r) => d.matrix[r][c]));
  return { rowVar: d.colVar, colVar: d.rowVar, rowCats: d.colCats, colCats: d.rowCats, matrix };
}

// Ritorna una CrossDist orientata con rowVar===a, colVar===b (trasponendo se serve);
// le collection senza dati propri rimandano a CARDIO-2024.
export function getCrossDist(collectionId: string, a: string, b: string): CrossDist | null {
  const tries = [collectionId, 'cardio-2024'];
  for (const cid of tries) {
    const direct = RAW[`${cid}::${a}::${b}`];
    if (direct) return direct;
    const rev = RAW[`${cid}::${b}::${a}`];
    if (rev) return transpose(rev);
  }
  return null;
}

// Scatter età × valore lab (trend lievemente positivo) per la correlazione.
export const SCATTER_AGE_LAB: ScatterPoint[] = [
  { x: 24, y: 42 }, { x: 27, y: 55 }, { x: 31, y: 48 }, { x: 33, y: 70 }, { x: 36, y: 61 },
  { x: 38, y: 88 }, { x: 41, y: 75 }, { x: 43, y: 96 }, { x: 45, y: 84 }, { x: 47, y: 110 },
  { x: 49, y: 92 }, { x: 51, y: 121 }, { x: 53, y: 104 }, { x: 55, y: 138 }, { x: 56, y: 118 },
  { x: 58, y: 146 }, { x: 60, y: 129 }, { x: 61, y: 160 }, { x: 63, y: 142 }, { x: 64, y: 175 },
  { x: 66, y: 151 }, { x: 67, y: 188 }, { x: 69, y: 166 }, { x: 70, y: 142 }, { x: 71, y: 197 },
  { x: 73, y: 178 }, { x: 74, y: 152 }, { x: 76, y: 205 }, { x: 78, y: 181 }, { x: 80, y: 168 },
  { x: 82, y: 214 }, { x: 85, y: 196 }, { x: 88, y: 232 },
];

// Coppie con dati incrociati disponibili (per il grounding del modello AI).
export const CROSS_PAIRS = [
  { collection: 'cardio-2024', a: 'age', b: 'gender', kind: 'cat×cat' },
  { collection: 'cardio-2024', a: 'lab_value', b: 'site_id', kind: 'cat×cat' },
  { collection: 'cardio-2024', a: 'severity', b: 'site_id', kind: 'cat×cat' },
  { collection: 'cardio-2024', a: 'enrollment_date', b: 'status', kind: 'date×cat' },
  { collection: 'cardio-2024', a: 'age', b: 'lab_value', kind: 'num×num (scatter)' },
];
