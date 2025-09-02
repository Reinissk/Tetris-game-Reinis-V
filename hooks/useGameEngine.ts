import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
import { GameMode } from '../types';

interface UseGameEngineProps {
  mode: GameMode;
  isPlayer: boolean;
  onGameOver?: (score: number) => void;
}

const useGameEngine = ({ mode, isPlayer, onGameOver }: UseGameEngineProps) => {
  const [engine] = useState(() => new GameEngine(mode, isPlayer));
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // FIX: The call `useRef<number>()` is invalid because an initial value is required when a generic type is provided. Initializing with `null` and adjusting the type to `number | null` resolves the error.
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const onGameOverCalled = useRef(false);

  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    if (!isPaused && !isGameOver) {
      engine.update(deltaTime);
      setGameState(engine.getState());
      if (engine.getState().isGameOver && !onGameOverCalled.current) {
          setIsGameOver(true);
          if (onGameOver) {
              onGameOver(engine.getState().score);
          }
          onGameOverCalled.current = true;
      }
    }
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [engine, isPaused, isGameOver, onGameOver]);

  useEffect(() => {
    if (isPlayer) {
      const handleKeyDown = (e: KeyboardEvent) => engine.handleKeyDown(e.code);
      const handleKeyUp = (e: KeyboardEvent) => engine.handleKeyUp(e.code);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      gameLoopRef.current = requestAnimationFrame(gameLoop);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
        }
      };
    } else { // AI logic
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameLoop, engine, isPlayer]);

  const togglePause = useCallback(() => {
    if (isGameOver) return;
    setIsPaused(prev => !prev);
    lastTimeRef.current = 0; // Reset delta time calculation
  }, [isGameOver]);

  const restart = useCallback(() => {
      engine.reset();
      setIsGameOver(false);
      setIsPaused(false);
      setGameState(engine.getState());
      lastTimeRef.current = 0;
      onGameOverCalled.current = false;
  }, [engine]);
  
  // Expose pause toggle via keyboard
   useEffect(() => {
    if(!isPlayer) return;
    const handlePauseKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handlePauseKey);
    return () => window.removeEventListener('keydown', handlePauseKey);
  }, [togglePause, isPlayer]);

  return {
    gameState,
    isPaused,
    isGameOver,
    actions: {
      togglePause,
      restart
    },
  };
};

export default useGameEngine;