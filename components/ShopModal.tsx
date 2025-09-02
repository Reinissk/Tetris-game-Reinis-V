import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { THEMES } from '../game/constants';
import { Theme, TetrominoType } from '../game/types';

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ThemePreview: React.FC<{ theme: Theme }> = ({ theme }) => (
    <div className="flex space-x-1">
        {['I', 'J', 'L', 'O', 'S', 'T', 'Z'].map(key => (
            <div key={key} className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.colors[key as TetrominoType] }} />
        ))}
    </div>
);


const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
    const { playerData, unlockTheme, setActiveThemeKey } = usePlayer();

    if (!isOpen) return null;

    const handleBuy = (themeKey: string) => {
        if(unlockTheme(themeKey)) {
            setActiveThemeKey(themeKey);
        }
    }

    const handleSelect = (themeKey: string) => {
        setActiveThemeKey(themeKey);
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg text-white"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-cyan-400">Theme Shop</h2>
                    <div className="bg-gray-900 px-3 py-1 rounded-full text-yellow-400 font-bold text-sm">
                        {playerData.coins.toLocaleString()} Coins
                    </div>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {Object.entries(THEMES).map(([key, theme]) => {
                        const isUnlocked = playerData.unlockedThemes.includes(key);
                        const isActive = playerData.activeThemeKey === key;
                        const canAfford = playerData.coins >= theme.price;

                        return (
                            <div key={key} className="bg-gray-700 p-4 rounded-md flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">{theme.name}</h3>
                                    <ThemePreview theme={theme} />
                                </div>
                                <div className="text-right">
                                    {isActive ? (
                                        <button disabled className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold cursor-not-allowed">
                                            Equipped
                                        </button>
                                    ) : isUnlocked ? (
                                         <button onClick={() => handleSelect(key)} className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                                            Select
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleBuy(key)}
                                            disabled={!canAfford} 
                                            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold"
                                        >
                                            Buy for {theme.price.toLocaleString()}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <button onClick={onClose} className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

export default ShopModal;
