export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
export type Cell = TetrominoType | 'E' | 'G'; // E for Empty, G for Garbage
export type Board = Cell[][];
export type Shape = (TetrominoType | 'E')[][];

export enum Rotation {
  UP = 0,    // 0
  RIGHT = 1, // R
  DOWN = 2,  // 2
  LEFT = 3,  // L
}

export interface Piece {
  type: TetrominoType;
  shape: Shape;
  x: number;
  y: number;
  rotation: Rotation;
}

export interface GameState {
  board: Board;
  currentPiece: Piece | null;
  ghostPiece: Piece;
  nextPieces: Piece[];
  holdPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  combo: number;
  b2b: number;
}

export enum TSpinStatus {
    NONE,
    MINI,
    FULL,
}

export interface Theme {
  name: string;
  price: number;
  colors: { [key in TetrominoType | 'G' | 'board' | 'grid']: string };
}
