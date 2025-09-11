
import React from 'react';
import type { Character, CharacterSaveData } from '../types';
import { DockablePanel } from './DockablePanel';
import { CharacterSheetBody } from './character-sheet/CharacterSheetBody';
import { useAppContext } from '../context/AppContext';

interface FloatingCharacterSheetProps {
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
}

export const FloatingCharacterSheet: React.FC<FloatingCharacterSheetProps> = (props) => {
    const { openPanel } = useAppContext();
    
    const handleRollRequest = (type: 'stat' | 'save', name: string) => {
        if (props.characterData) {
            openPanel('dice-roller', { type, name });
        }
    };

    return (
        <DockablePanel
            title="In-Game Character Sheet"
            initialPosition={{ x: 100, y: 100 }}
            className="w-full max-w-2xl"
            panelId="character-sheet"
        >
            <CharacterSheetBody {...props} onRollRequest={handleRollRequest} />
        </DockablePanel>
    );
};