
import React from 'react';
import type { Character, CharacterSaveData } from '../types';
import { DockablePanel } from './DockablePanel';
import { CharacterSheetBody } from './character-sheet/CharacterSheetBody';

interface FloatingCharacterSheetProps {
    isVisible: boolean;
    onClose: () => void;
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
}

export const FloatingCharacterSheet: React.FC<FloatingCharacterSheetProps> = (props) => {
    if (!props.isVisible) {
        return null;
    }

    return (
        <DockablePanel
            title="In-Game Character Sheet"
            isVisible={props.isVisible}
            onClose={props.onClose}
            initialPosition={{ x: 100, y: 100 }}
            className="w-full max-w-2xl"
            panelId="character-sheet"
        >
            <CharacterSheetBody {...props} />
        </DockablePanel>
    );
};
