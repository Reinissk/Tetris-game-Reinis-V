import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { THEMES, DEFAULT_THEME_KEY } from '../game/constants';
import { Theme } from '../game/types';

interface PlayerData {
    coins: number;
    unlockedThemes: string[];
    activeThemeKey: string;
}

interface PlayerContextType {
    playerData: PlayerData;
    activeTheme: Theme;
    addCoins: (amount: number) => void;
    unlockTheme: (themeKey: string) => boolean;
    setActiveThemeKey: (themeKey: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const initialPlayerData: PlayerData = {
    coins: 0,
    unlockedThemes: [DEFAULT_THEME_KEY],
    activeThemeKey: DEFAULT_THEME_KEY,
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [playerData, setPlayerData] = useState<PlayerData>(() => {
        try {
            const savedData = localStorage.getItem('playerData');
            return savedData ? JSON.parse(savedData) : initialPlayerData;
        } catch (error) {
            console.error('Failed to load player data from localStorage', error);
            return initialPlayerData;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('playerData', JSON.stringify(playerData));
        } catch (error) {
            console.error('Failed to save player data to localStorage', error);
        }
    }, [playerData]);

    const addCoins = (amount: number) => {
        setPlayerData(prev => ({ ...prev, coins: prev.coins + amount }));
    };

    const unlockTheme = (themeKey: string): boolean => {
        const theme = THEMES[themeKey];
        if (!theme || playerData.unlockedThemes.includes(themeKey) || playerData.coins < theme.price) {
            return false;
        }
        setPlayerData(prev => ({
            ...prev,
            coins: prev.coins - theme.price,
            unlockedThemes: [...prev.unlockedThemes, themeKey],
        }));
        return true;
    };

    const setActiveThemeKey = (themeKey: string) => {
        if (THEMES[themeKey] && playerData.unlockedThemes.includes(themeKey)) {
            setPlayerData(prev => ({ ...prev, activeThemeKey: themeKey }));
        }
    };

    const activeTheme = useMemo(() => THEMES[playerData.activeThemeKey] || THEMES[DEFAULT_THEME_KEY], [playerData.activeThemeKey]);

    const value = {
        playerData,
        activeTheme,
        addCoins,
        unlockTheme,
        setActiveThemeKey,
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
