import React, { useRef, useEffect } from 'react';
import { Piece, Theme } from '../game/types';
import { PIECE_SHAPES } from '../game/constants';

interface PiecePreviewProps {
  piece: Piece | null;
  title?: string;
  theme: Theme;
}

const CELL_SIZE = 12;
const CANVAS_SIZE = 4 * CELL_SIZE;

const PiecePreview: React.FC<PiecePreviewProps> = ({ piece, title, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = theme.colors.board;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (piece) {
      const shape = PIECE_SHAPES[piece.type][0]; // Use default rotation
      const color = theme.colors[piece.type];
      
      const w = shape[0].length;
      const h = shape.length;
      const offsetX = (CANVAS_SIZE - w * CELL_SIZE) / 2;
      const offsetY = (CANVAS_SIZE - h * CELL_SIZE) / 2;

      shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 'E') {
            ctx.fillStyle = color;
            ctx.fillRect(offsetX + x * CELL_SIZE, offsetY + y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        });
      });
    }
  }, [piece, theme]);

  return (
    <div className="bg-gray-800 p-2 rounded-md flex flex-col items-center">
      {title && <h3 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</h3>}
      <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
    </div>
  );
};

export default PiecePreview;
