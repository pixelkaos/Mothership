import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Character, CharacterSaveData } from '../types';

interface CharacterContextType {
    activeCharacterData: CharacterSaveData | null;
    setActiveCharacterData: React.Dispatch<React.SetStateAction<CharacterSaveData | null>>;
    handleCharacterUpdate: (updatedCharacter: Character) => void;
    isCharacterLoaded: boolean;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const useCharacter = () => {
    const context = useContext(CharacterContext);
    if (!context) throw new Error('useCharacter must be used within a CharacterProvider');
    return context;
};

export const CharacterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeCharacterData, setActiveCharacterData] = useState<CharacterSaveData | null>(null);

    const handleCharacterUpdate = useCallback((updatedCharacter: Character) => {
        setActiveCharacterData(prevData => {
            if (prevData) {
                return { ...prevData, character: updatedCharacter };
            }
            return null;
        });
    }, []);

    const isCharacterLoaded = useMemo(() => activeCharacterData !== null, [activeCharacterData]);

    const value = {
        activeCharacterData,
        setActiveCharacterData,
        handleCharacterUpdate,
        isCharacterLoaded,
    };

    return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};
