import React, { useRef, useEffect } from 'react';
import { GameState, Theme } from '../game/types';
import { BOARD_WIDTH, BOARD_HEIGHT, HIDDEN_ROWS } from '../game/constants';

interface BoardProps {
  gameState: GameState;
  theme: Theme;
}

const CELL_SIZE = 24;
const CANVAS_WIDTH = BOARD_WIDTH * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_HEIGHT * CELL_SIZE;

const Board: React.FC<BoardProps> = ({ gameState, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = theme.colors.board;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid lines
    ctx.strokeStyle = theme.colors.grid;
    ctx.lineWidth = 1;
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }

    // Draw board state
    for (let y = 0; y < gameState.board.length; y++) {
      for (let x = 0; x < gameState.board[y].length; x++) {
        const cell = gameState.board[y][x];
        if (cell !== 'E') {
          drawCell(ctx, x, y - HIDDEN_ROWS, theme.colors[cell]);
        }
      }
    }
    
    // Draw ghost piece
    if (gameState.currentPiece) {
      const ghostPiece = gameState.ghostPiece;
      ctx.globalAlpha = 0.3;
      ghostPiece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 'E') {
            drawCell(ctx, ghostPiece.x + dx, ghostPiece.y + dy - HIDDEN_ROWS, theme.colors[ghostPiece.type]);
          }
        });
      });
      ctx.globalAlpha = 1.0;
    }

    // Draw current piece
    if (gameState.currentPiece) {
      const { currentPiece } = gameState;
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 'E') {
            drawCell(ctx, currentPiece.x + dx, currentPiece.y + dy - HIDDEN_ROWS, theme.colors[currentPiece.type]);
          }
        });
      });
    }

  }, [gameState, theme]);

  const drawCell = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    if (y < 0) return; // Don't draw in hidden rows
    
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    // Add a slight bevel effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x * CELL_SIZE, (y + 1) * CELL_SIZE - 2, CELL_SIZE, 2);
  };

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-gray-700 rounded-md" />;
};

export default Board;
