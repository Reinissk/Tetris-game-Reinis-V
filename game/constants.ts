import { TetrominoType, Shape, Rotation, Theme } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const HIDDEN_ROWS = 2;
export const TOTAL_BOARD_HEIGHT = BOARD_HEIGHT + HIDDEN_ROWS;

export const PIECE_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const THEMES: { [key: string]: Theme } = {
  classic: {
    name: 'Classic',
    price: 0,
    colors: {
      I: '#00FFFF', O: '#FFFF00', T: '#800080', S: '#00FF00',
      Z: '#FF0000', J: '#0000FF', L: '#FFA500', G: '#4B5563',
      board: '#111827', grid: '#374151',
    },
  },
  synthwave: {
    name: 'Synthwave',
    price: 1000,
    colors: {
      I: '#f92672', O: '#fd971f', T: '#ae81ff', S: '#a6e22e',
      Z: '#f92672', J: '#66d9ef', L: '#fd971f', G: '#49483e',
      board: '#272822', grid: '#75715e',
    },
  },
  ocean: {
    name: 'Ocean',
    price: 1500,
    colors: {
        I: '#67D5F0', O: '#F0E68C', T: '#9370DB', S: '#3CB371',
        Z: '#FF6347', J: '#1E90FF', L: '#FFD700', G: '#B0C4DE',
        board: '#000080', grid: '#ADD8E6',
    },
  }
};

export const DEFAULT_THEME_KEY = 'classic';


export const PIECE_SHAPES: { [key in TetrominoType]: Shape[] } = {
  I: [
    [['E','E','E','E'], ['I','I','I','I'], ['E','E','E','E'], ['E','E','E','E']],
    [['E','E','I','E'], ['E','E','I','E'], ['E','E','I','E'], ['E','E','I','E']],
    [['E','E','E','E'], ['E','E','E','E'], ['I','I','I','I'], ['E','E','E','E']],
    [['E','I','E','E'], ['E','I','E','E'], ['E','I','E','E'], ['E','I','E','E']],
  ],
  O: [[['O','O'], ['O','O']]],
  T: [
    [['E','T','E'], ['T','T','T'], ['E','E','E']],
    [['E','T','E'], ['E','T','T'], ['E','T','E']],
    [['E','E','E'], ['T','T','T'], ['E','T','E']],
    [['E','T','E'], ['T','T','E'], ['E','T','E']],
  ],
  S: [
    [['E','S','S'], ['S','S','E'], ['E','E','E']],
    [['E','S','E'], ['E','S','S'], ['E','E','S']],
    [['E','E','E'], ['E','S','S'], ['S','S','E']],
    [['S','E','E'], ['S','S','E'], ['E','S','E']],
  ],
  Z: [
    [['Z','Z','E'], ['E','Z','Z'], ['E','E','E']],
    [['E','E','Z'], ['E','Z','Z'], ['E','Z','E']],
    [['E','E','E'], ['Z','Z','E'], ['E','Z','Z']],
    [['E','Z','E'], ['Z','Z','E'], ['Z','E','E']],
  ],
  J: [
    [['J','E','E'], ['J','J','J'], ['E','E','E']],
    [['E','J','J'], ['E','J','E'], ['E','J','E']],
    [['E','E','E'], ['J','J','J'], ['E','E','J']],
    [['E','J','E'], ['E','J','E'], ['J','J','E']],
  ],
  L: [
    [['E','E','L'], ['L','L','L'], ['E','E','E']],
    [['E','L','E'], ['E','L','E'], ['E','L','L']],
    [['E','E','E'], ['L','L','L'], ['L','E','E']],
    [['L','L','E'], ['E','L','E'], ['E','L','E']],
  ],
};

export const INITIAL_PIECE_POSITIONS: { [key in TetrominoType]: { x: number; y: number } } = {
  I: { x: 3, y: 0 },
  O: { x: 4, y: 0 },
  T: { x: 3, y: 1 },
  S: { x: 3, y: 1 },
  Z: { x: 3, y: 1 },
  J: { x: 3, y: 1 },
  L: { x: 3, y: 1 },
};

type KickData = { [key: string]: [number, number][] };
export const SRS_KICKS: { JLSTZ: KickData; I: KickData } = {
  JLSTZ: {
    '0->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]], '1->0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
    '1->2': [[0,0], [1,0], [1,-1], [0,2], [1,2]], '2->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
    '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]], '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
    '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]], '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  },
  I: {
    '0->1': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]], '1->0': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
    '1->2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]], '2->1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
    '2->3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]], '3->2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
    '3->0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]], '0->3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
  },
};

// Default settings
export const DEFAULT_DAS = 160; // ms
export const DEFAULT_ARR = 30; // ms
export const DEFAULT_SDF = 2; // Gravity multiplier for soft drop

export const GRAVITY_LEVELS = [
    1, 0.8, 0.6, 0.4, 0.2, 0.1, 0.08, 0.06, 0.04, 0.02, 0.01,
    0.008, 0.006, 0.004, 0.002, 0.001
].map(g => g * 1000); // in ms per line

export const SCORING = {
    SINGLE: 100,
    DOUBLE: 300,
    TRIPLE: 500,
    TETRIS: 800,
    TSPIN_MINI: 100,
    TSPIN_SINGLE: 800,
    TSPIN_DOUBLE: 1200,
    TSPIN_TRIPLE: 1600,
    B2B_MULTIPLIER: 1.5,
    COMBO_BONUS: 50,
    PERFECT_CLEAR: 3000,
};

export const ATTACK_TABLE = {
    SINGLE: 0,
    DOUBLE: 1,
    TRIPLE: 2,
    TETRIS: 4,
    TSPIN_MINI: 0,
    TSPIN_SINGLE: 2,
    TSPIN_DOUBLE: 4,
    TSPIN_TRIPLE: 6,
    PERFECT_CLEAR: 10,
    B2B_BONUS: 1,
    COMBO_BONUS: (combo: number) => {
        if (combo <= 1) return 0;
        if (combo <= 3) return 1;
        if (combo <= 5) return 2;
        if (combo <= 7) return 3;
        return 4;
    }
};