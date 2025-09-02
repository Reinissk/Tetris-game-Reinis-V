import React from 'react';
import { GameMode } from '../types';
import Board from './Board';
import InfoPanel from './InfoPanel';
import PiecePreview from './PiecePreview';
import useGameEngine from '../hooks/useGameEngine';
import { usePlayer } from '../context/PlayerContext';

interface GameScreenProps {
  mode: GameMode;
  onGameOver: (score: number) => void;
  onBackToMenu: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ mode, onGameOver, onBackToMenu }) => {
  const { activeTheme, playerData } = usePlayer();
  const { gameState, isPaused, isGameOver, actions } = useGameEngine({ mode, isPlayer: true, onGameOver });
  const { gameState: aiGameState } = useGameEngine({ mode, isPlayer: false });
  
  const isVsMode = mode === GameMode.VsAI;
  const coinsEarned = isGameOver ? Math.floor(gameState.score / 10) : 0;

  return (
    <div className={`flex items-start justify-center gap-4 ${isVsMode ? 'flex-row' : ''}`}>
      {isVsMode && (
          <div className="flex flex-col items-center gap-4">
              <h2 className="text-xl font-bold text-red-400">AI OPPONENT</h2>
              <div className="flex items-start justify-center gap-4">
                  <InfoPanel 
                      score={aiGameState.score}
                      level={aiGameState.level}
                      lines={aiGameState.lines}
                      b2b={aiGameState.b2b}
                      combo={aiGameState.combo}
                      isPlayer={false}
                   />
                  <Board gameState={aiGameState} theme={activeTheme} />
                  <div className="w-24 flex flex-col gap-2">
                      <PiecePreview piece={aiGameState.holdPiece} title="HOLD" theme={activeTheme} />
                      <div className="flex flex-col gap-1">
                          <h3 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">NEXT</h3>
                          {aiGameState.nextPieces.slice(0, 5).map((p, i) => (
                              <PiecePreview key={i} piece={p} theme={activeTheme}/>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
      <div className="flex flex-col items-center gap-4">
        {isVsMode && <h2 className="text-xl font-bold text-cyan-400">PLAYER</h2>}
        <div className="flex items-start justify-center gap-4">
            <div className="w-24 flex flex-col gap-2">
                <PiecePreview piece={gameState.holdPiece} title="HOLD" theme={activeTheme} />
                <div className="flex flex-col gap-1">
                    <h3 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400">NEXT</h3>
                    {gameState.nextPieces.slice(0, 5).map((p, i) => (
                        <PiecePreview key={i} piece={p} theme={activeTheme} />
                    ))}
                </div>
            </div>
            <Board gameState={gameState} theme={activeTheme} />
            <InfoPanel 
                score={gameState.score}
                level={gameState.level}
                lines={gameState.lines}
                b2b={gameState.b2b}
                combo={gameState.combo}
                coins={playerData.coins}
                isPlayer={true}
            />
        </div>
      </div>
       {isGameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                  <h2 className="text-5xl font-bold text-red-500 mb-2">GAME OVER</h2>
                  <p className="text-2xl text-yellow-400 mb-4">You earned {coinsEarned.toLocaleString()} coins!</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={actions.restart} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-md text-lg font-bold">
                        Restart
                    </button>
                    <button onClick={onBackToMenu} className="px-6 py-2 bg-gray-500 hover:bg-gray-600 rounded-md text-lg font-bold">
                        Main Menu
                    </button>
                  </div>
              </div>
          </div>
      )}
       {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
                <div className="text-center">
                    <h2 className="text-5xl font-bold text-yellow-400 mb-4">PAUSED</h2>
                    <button onClick={actions.togglePause} className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-md text-lg font-bold">
                        Resume
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default GameScreen;
