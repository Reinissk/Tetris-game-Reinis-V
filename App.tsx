import React, { useState } from 'react';
import GameScreen from './components/GameScreen';
import ShopModal from './components/ShopModal';
import { GameMode } from './types';
import { PlayerProvider, usePlayer } from './context/PlayerContext';

const MainMenu: React.FC<{ onStartGame: () => void }> = ({ onStartGame }) => {
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Marathon);
    const [isShopOpen, setShopOpen] = useState(false);
    const { playerData } = usePlayer();

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center w-full max-w-md relative">
                <div className="absolute top-4 right-4 bg-gray-900 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm">
                    {playerData.coins.toLocaleString()} Coins
                </div>

                <h1 className="text-4xl font-bold mb-4 text-cyan-400">React Tetris</h1>
                <p className="mb-6 text-gray-300">Select a game mode to start.</p>
                <div className="grid grid-cols-2 gap-4">
                    {Object.values(GameMode).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setGameMode(mode)}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                gameMode === mode
                                    ? 'bg-cyan-500 text-white shadow-lg'
                                    : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={onStartGame}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition-transform transform hover:scale-105"
                    >
                        Start Game
                    </button>
                    <button
                        onClick={() => setShopOpen(true)}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-transform transform hover:scale-105"
                    >
                        Shop / Themes
                    </button>
                </div>
            </div>
            <ShopModal isOpen={isShopOpen} onClose={() => setShopOpen(false)} />
        </div>
    );
};


const AppContent: React.FC = () => {
    const [gameMode, setGameMode] = useState<GameMode>(GameMode.Marathon);
    const [isGameActive, setGameActive] = useState(false);
    const [gameId, setGameId] = useState(1);
    const { addCoins } = usePlayer();

    const handleStartGame = (mode: GameMode) => {
        setGameMode(mode);
        setGameActive(true);
    };

    const handleGameOver = (score: number) => {
        const coinsEarned = Math.floor(score / 10);
        if (coinsEarned > 0) {
            addCoins(coinsEarned);
        }
    };

    const handleBackToMenu = () => {
        setGameId(prev => prev + 1); // Reset game state by changing key
        setGameActive(false);
    }

    return (
        <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-mono select-none">
            {!isGameActive ? (
                <MainMenu onStartGame={() => handleStartGame(gameMode)} />
            ) : (
                <GameScreen 
                  key={gameId} 
                  mode={gameMode} 
                  onGameOver={handleGameOver}
                  onBackToMenu={handleBackToMenu}
                />
            )}
        </div>
    );
};

const App: React.FC = () => (
    <PlayerProvider>
        <AppContent />
    </PlayerProvider>
);

export default App;
