import { GameMode } from '../types';
import { 
  BOARD_WIDTH, TOTAL_BOARD_HEIGHT, PIECE_TYPES, PIECE_SHAPES, INITIAL_PIECE_POSITIONS, 
  SRS_KICKS, DEFAULT_DAS, DEFAULT_ARR, GRAVITY_LEVELS, SCORING, ATTACK_TABLE
} from './constants';
import { 
  Board, Cell, GameState, Piece, Rotation, Shape, TetrominoType, TSpinStatus 
} from './types';

export class GameEngine {
  private mode: GameMode;
  private isPlayer: boolean;

  private board: Board = [];
  private currentPiece: Piece | null = null;
  private nextPieces: Piece[] = [];
  private holdPiece: Piece | null = null;
  private canHold: boolean = true;
  private score: number = 0;
  private level: number = 1;
  private lines: number = 0;
  private isGameOver: boolean = false;
  private combo: number = -1; // -1 means no combo
  private b2b: number = 0;

  // Timers
  private gravityTimer: number = 0;
  private lockDelayTimer: number = 0;
  private lockResets: number = 0;

  // Input handling
  private dasTimer: number = 0;
  private arrTimer: number = 0;
  private keysDown: { [key: string]: boolean } = {};
  private softDrop: boolean = false;

  // Randomizer
  private bag: TetrominoType[] = [];
  
  // AI related
  private aiMoveQueue: string[] = [];
  private aiThinkTimer: number = 0;
  
  private lastMoveWasRotation = false;

  constructor(mode: GameMode, isPlayer: boolean) {
    this.mode = mode;
    this.isPlayer = isPlayer;
    this.reset();
  }

  public reset(): void {
    this.board = Array.from({ length: TOTAL_BOARD_HEIGHT }, () => 
      Array(BOARD_WIDTH).fill('E')
    );
    this.bag = [];
    this.nextPieces = [];
    this.fillNextPieces();
    this.spawnNewPiece();

    this.holdPiece = null;
    this.canHold = true;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.isGameOver = false;
    this.combo = -1;
    this.b2b = 0;
    
    this.gravityTimer = 0;
    this.lockDelayTimer = 0;
    this.lockResets = 0;

    this.keysDown = {};
    
    if (!this.isPlayer) {
        this.aiThinkTimer = 0;
        this.aiMoveQueue = [];
    }
  }
  
  private fillNextPieces(): void {
    while (this.nextPieces.length < 6) {
      if (this.bag.length === 0) {
        this.bag = [...PIECE_TYPES];
        // Shuffle bag (Fisher-Yates)
        for (let i = this.bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
      }
      const type = this.bag.pop()!;
      const rotation = Rotation.UP;
      const shape = PIECE_SHAPES[type][rotation];
      this.nextPieces.push({
        type,
        shape,
        rotation,
        x: INITIAL_PIECE_POSITIONS[type].x,
        y: INITIAL_PIECE_POSITIONS[type].y,
      });
    }
  }

  private spawnNewPiece(): void {
    this.currentPiece = this.nextPieces.shift()!;
    this.fillNextPieces();
    this.canHold = true;
    this.lockDelayTimer = 0;
    this.lockResets = 0;
    this.lastMoveWasRotation = false;

    if (!this.isValid(this.currentPiece)) {
      this.isGameOver = true;
    }
  }

  public getState(): GameState {
    return {
      board: this.board,
      currentPiece: this.currentPiece,
      ghostPiece: this.getGhostPiece(),
      nextPieces: this.nextPieces,
      holdPiece: this.holdPiece,
      score: this.score,
      level: this.level,
      lines: this.lines,
      isGameOver: this.isGameOver,
      combo: this.combo > 0 ? this.combo + 1 : 0,
      b2b: this.b2b,
    };
  }
  
  private getGhostPiece(): Piece {
    if (!this.currentPiece) return { type: 'I', shape: [], x: 0, y: 0, rotation: 0 };
    let ghost = { ...this.currentPiece };
    while (this.isValid({ ...ghost, y: ghost.y + 1 })) {
      ghost.y++;
    }
    return ghost;
  }

  public update(deltaTime: number): void {
    if (this.isGameOver) return;
    
    if (this.isPlayer) {
        this.handleInputs(deltaTime);
    } else {
        this.updateAI(deltaTime);
    }
    
    this.updateGravity(deltaTime);
  }

  private updateGravity(deltaTime: number): void {
    if (!this.currentPiece) return;

    const gravityInterval = this.softDrop ? 
      GRAVITY_LEVELS[Math.min(this.level - 1, GRAVITY_LEVELS.length - 1)] / 20 :
      GRAVITY_LEVELS[Math.min(this.level - 1, GRAVITY_LEVELS.length - 1)];
      
    this.gravityTimer += deltaTime * 1000;
    
    if (this.gravityTimer >= gravityInterval) {
        this.gravityTimer = 0;
        this.move(0, 1);
    }
    
    // Lock delay logic
    if (!this.isValid({ ...this.currentPiece, y: this.currentPiece.y + 1 })) {
        this.lockDelayTimer += deltaTime * 1000;
        if(this.lockDelayTimer >= 500) {
            this.lockPiece();
        }
    } else {
        this.lockDelayTimer = 0;
    }
  }

  private lockPiece(): void {
    if (!this.currentPiece) return;
    
    const tSpinStatus = this.checkTSpin();

    this.currentPiece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell !== 'E') {
          const boardX = this.currentPiece!.x + dx;
          const boardY = this.currentPiece!.y + dy;
          if (boardY >= 0 && boardY < TOTAL_BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            this.board[boardY][boardX] = this.currentPiece!.type;
          }
        }
      });
    });

    const linesCleared = this.clearLines();
    this.updateScore(linesCleared, tSpinStatus);

    if (linesCleared > 0) {
        this.combo++;
    } else {
        this.combo = -1;
    }
    
    this.spawnNewPiece();
  }

  private checkTSpin(): TSpinStatus {
    if (!this.currentPiece || this.currentPiece.type !== 'T' || !this.lastMoveWasRotation) {
      return TSpinStatus.NONE;
    }

    const { x, y } = this.currentPiece;
    const corners = [
        this.isOccupied(x, y),       // Top-left
        this.isOccupied(x + 2, y),   // Top-right
        this.isOccupied(x, y + 2),   // Bottom-left
        this.isOccupied(x + 2, y + 2) // Bottom-right
    ];
    
    const cornersFilled = corners.filter(Boolean).length;
    
    if (cornersFilled < 3) return TSpinStatus.NONE;
    
    // Check for mini T-spin (T-spin check but one of the front corners is open)
    const frontCorners = this.currentPiece.rotation === Rotation.UP ? [corners[0], corners[1]]
                       : this.currentPiece.rotation === Rotation.RIGHT ? [corners[1], corners[3]]
                       : this.currentPiece.rotation === Rotation.DOWN ? [corners[3], corners[2]]
                       : [corners[2], corners[0]];

    if(cornersFilled === 3 && frontCorners.some(c => !c)){
        return TSpinStatus.MINI;
    }

    return TSpinStatus.FULL;
  }
  
  private isOccupied(x: number, y: number): boolean {
    return x < 0 || x >= BOARD_WIDTH || y < 0 || y >= TOTAL_BOARD_HEIGHT || this.board[y][x] !== 'E';
  }

  private clearLines(): number {
    let linesCleared = 0;
    for (let y = TOTAL_BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell !== 'E')) {
        linesCleared++;
        this.board.splice(y, 1);
        this.board.unshift(Array(BOARD_WIDTH).fill('E'));
        y++; // Re-check the same row index as it's now a new row
      }
    }
    
    if (linesCleared > 0) {
        this.lines += linesCleared;
        this.level = Math.floor(this.lines / 10) + 1;
    }
    return linesCleared;
  }
  
  private updateScore(linesCleared: number, tSpin: TSpinStatus) {
    if (linesCleared === 0 && tSpin === TSpinStatus.NONE) return;

    let baseScore = 0;
    let difficultMove = false;

    if (tSpin !== TSpinStatus.NONE) {
        difficultMove = true;
        if (linesCleared === 1) baseScore = tSpin === TSpinStatus.MINI ? SCORING.TSPIN_MINI : SCORING.TSPIN_SINGLE;
        else if (linesCleared === 2) baseScore = SCORING.TSPIN_DOUBLE;
        else if (linesCleared === 3) baseScore = SCORING.TSPIN_TRIPLE;
        else baseScore = SCORING.TSPIN_MINI;
    } else {
        if (linesCleared === 1) baseScore = SCORING.SINGLE;
        else if (linesCleared === 2) baseScore = SCORING.DOUBLE;
        else if (linesCleared === 3) baseScore = SCORING.TRIPLE;
        else if (linesCleared === 4) {
             baseScore = SCORING.TETRIS;
             difficultMove = true;
        }
    }

    let scoreMultiplier = this.level;
    
    // B2B bonus
    if (difficultMove) {
        if (this.b2b > 0) {
            baseScore *= SCORING.B2B_MULTIPLIER;
        }
        this.b2b++;
    } else if (linesCleared > 0) {
        this.b2b = 0;
    }
    
    // Combo bonus
    if (this.combo > 0) {
        baseScore += SCORING.COMBO_BONUS * this.combo;
    }

    this.score += Math.floor(baseScore * scoreMultiplier);
  }

  private isValid(piece: Piece): boolean {
    for (let dy = 0; dy < piece.shape.length; dy++) {
      for (let dx = 0; dx < piece.shape[dy].length; dx++) {
        if (piece.shape[dy][dx] !== 'E') {
          const boardX = piece.x + dx;
          const boardY = piece.y + dy;
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= TOTAL_BOARD_HEIGHT) {
            return false;
          }
          if (boardY >= 0 && this.board[boardY][boardX] !== 'E') {
            return false;
          }
        }
      }
    }
    return true;
  }

  private move(dx: number, dy: number): boolean {
    if (!this.currentPiece) return false;
    const newPiece = { ...this.currentPiece, x: this.currentPiece.x + dx, y: this.currentPiece.y + dy };
    if (this.isValid(newPiece)) {
      this.currentPiece = newPiece;
      this.lastMoveWasRotation = false;
      this.resetLockDelay();
      return true;
    }
    return false;
  }
  
  private resetLockDelay() {
    if(this.lockResets < 15) {
        this.lockDelayTimer = 0;
        this.lockResets++;
    }
  }

  private rotate(clockwise: boolean) {
    if (!this.currentPiece || this.currentPiece.type === 'O') return;

    const oldRotation = this.currentPiece.rotation;
    const newRotation = ((clockwise ? oldRotation + 1 : oldRotation - 1) + 4) % 4;
    
    const kickTable = this.currentPiece.type === 'I' ? SRS_KICKS.I : SRS_KICKS.JLSTZ;
    const kickKey = `${oldRotation}->${newRotation}`;
    const kicks = kickTable[kickKey] || [];
    
    for (const [kx, ky] of kicks) {
      const newPiece = {
        ...this.currentPiece,
        rotation: newRotation as Rotation,
        shape: PIECE_SHAPES[this.currentPiece.type][newRotation],
        x: this.currentPiece.x + kx,
        y: this.currentPiece.y - ky, // SRS y-axis is inverted
      };
      if (this.isValid(newPiece)) {
        this.currentPiece = newPiece;
        this.lastMoveWasRotation = true;
        this.resetLockDelay();
        return;
      }
    }
  }

  private hold() {
    if (!this.canHold) return;
    
    const holding = this.holdPiece;
    this.holdPiece = {
      ...this.currentPiece!,
      x: INITIAL_PIECE_POSITIONS[this.currentPiece!.type].x,
      y: INITIAL_PIECE_POSITIONS[this.currentPiece!.type].y,
      rotation: Rotation.UP,
      shape: PIECE_SHAPES[this.currentPiece!.type][Rotation.UP],
    };
    
    if (holding) {
      this.currentPiece = holding;
    } else {
      this.spawnNewPiece();
    }

    this.canHold = false;
  }
  
  private hardDrop() {
      if (!this.currentPiece) return;
      this.currentPiece = this.getGhostPiece();
      this.lockPiece();
  }

  public handleKeyDown(code: string): void {
      this.keysDown[code] = true;
      if (code === 'ArrowDown') this.softDrop = true;
      
      switch(code) {
          case 'ArrowUp':
          case 'KeyX':
              this.rotate(true);
              break;
          case 'KeyZ':
              this.rotate(false);
              break;
          case 'Space':
              this.hardDrop();
              break;
          case 'KeyC':
          case 'ShiftLeft':
              this.hold();
              break;
      }
  }

  public handleKeyUp(code: string): void {
      this.keysDown[code] = false;
      if (code === 'ArrowLeft' || code === 'ArrowRight') {
          this.dasTimer = 0;
          this.arrTimer = 0;
      }
       if (code === 'ArrowDown') this.softDrop = false;
  }
  
  private handleInputs(deltaTime: number): void {
      const isLeft = this.keysDown['ArrowLeft'];
      const isRight = this.keysDown['ArrowRight'];

      if(isLeft && !isRight) {
          if (this.dasTimer === 0) this.move(-1, 0);
          this.dasTimer += deltaTime * 1000;
          if (this.dasTimer > DEFAULT_DAS) {
              this.arrTimer += deltaTime * 1000;
              if (this.arrTimer > DEFAULT_ARR) {
                  this.move(-1, 0);
                  this.arrTimer = 0;
              }
          }
      } else if (isRight && !isLeft) {
          if (this.dasTimer === 0) this.move(1, 0);
          this.dasTimer += deltaTime * 1000;
          if (this.dasTimer > DEFAULT_DAS) {
              this.arrTimer += deltaTime * 1000;
              if (this.arrTimer > DEFAULT_ARR) {
                  this.move(1, 0);
                  this.arrTimer = 0;
              }
          }
      } else {
          this.dasTimer = 0;
          this.arrTimer = 0;
      }
  }
  
  private updateAI(deltaTime: number): void {
    if (!this.currentPiece) return;
    this.aiThinkTimer += deltaTime * 1000;

    if (this.aiThinkTimer > 500 && this.aiMoveQueue.length === 0) { // Think every 500ms if no moves
        this.aiThinkTimer = 0;
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.aiMoveQueue = this.getMoveSequence(bestMove);
        }
    }

    if (this.aiMoveQueue.length > 0) {
        const move = this.aiMoveQueue.shift();
        switch(move) {
            case 'L': this.move(-1, 0); break;
            case 'R': this.move(1, 0); break;
            case 'CW': this.rotate(true); break;
            case 'HD': this.hardDrop(); break;
        }
    }
  }
  
  private findBestMove() {
      if(!this.currentPiece) return null;
      
      let bestScore = -Infinity;
      let bestMove = null;

      const rotationCount = PIECE_SHAPES[this.currentPiece.type].length;
      
      for (let r = 0; r < rotationCount; r++) {
          const pieceWithRotation = {
              ...this.currentPiece,
              rotation: r as Rotation,
              shape: PIECE_SHAPES[this.currentPiece.type][r]
          };

          for (let x = -2; x < BOARD_WIDTH; x++) {
              let testPiece = { ...pieceWithRotation, x: x, y: 0 };
              
              // Find landing position
              if (this.isValid(testPiece)) {
                 while(this.isValid({...testPiece, y: testPiece.y + 1})) {
                     testPiece.y++;
                 }

                 const score = this.evaluateBoardState(testPiece);
                 if (score > bestScore) {
                     bestScore = score;
                     bestMove = testPiece;
                 }
              }
          }
      }
      return bestMove;
  }
  
  private evaluateBoardState(piece: Piece): number {
      // Simulate placing the piece
      const tempBoard = this.board.map(row => [...row]);
      piece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 'E') {
            tempBoard[piece.y + dy][piece.x + dx] = piece.type;
          }
        });
      });
      
      let aggregateHeight = 0;
      let holes = 0;
      let bumpiness = 0;
      let linesCleared = 0;
      let columnHeights = Array(BOARD_WIDTH).fill(TOTAL_BOARD_HEIGHT);

      for (let y = 0; y < TOTAL_BOARD_HEIGHT; y++) {
          let isLineFull = true;
          for (let x = 0; x < BOARD_WIDTH; x++) {
              if (tempBoard[y][x] !== 'E') {
                if (y < columnHeights[x]) {
                    columnHeights[x] = y;
                }
              } else {
                  isLineFull = false;
                  // check for holes
                  if (y > columnHeights[x]) {
                      holes++;
                  }
              }
          }
          if(isLineFull) linesCleared++;
      }
      
      aggregateHeight = columnHeights.reduce((sum, h) => sum + (TOTAL_BOARD_HEIGHT - h), 0);
      for (let i = 0; i < columnHeights.length - 1; i++) {
          bumpiness += Math.abs(columnHeights[i] - columnHeights[i+1]);
      }
      
      // Heuristics weights - these can be tuned
      return -0.51 * aggregateHeight - 0.35 * holes - 0.18 * bumpiness + 0.76 * linesCleared;
  }
  
  private getMoveSequence(targetPiece: Piece): string[] {
      const moves: string[] = [];
      if (!this.currentPiece) return [];
      
      // Rotations
      const rotations = (targetPiece.rotation - this.currentPiece.rotation + 4) % 4;
      for (let i = 0; i < rotations; i++) moves.push('CW');
      
      // Horizontal
      let dx = targetPiece.x - this.currentPiece.x;
      while(dx !== 0) {
          if (dx > 0) {
              moves.push('R');
              dx--;
          } else {
              moves.push('L');
              dx++;
          }
      }
      
      moves.push('HD');
      return moves;
  }
}