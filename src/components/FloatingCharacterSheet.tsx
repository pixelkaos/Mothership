import React from 'react';
import type { Character, CharacterSaveData } from '@/types';
import { DockablePanel } from '@/components/DockablePanel';
import { CharacterSheetBody } from '@/components/character-sheet/CharacterSheetBody';
import { useInteraction } from '@/context/InteractionContext';

interface FloatingCharacterSheetProps {
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
}

export const FloatingCharacterSheet: React.FC<FloatingCharacterSheetProps> = (props) => {
    const { requestDiceRoll } = useInteraction();
    
    const handleRollRequest = (type: 'stat' | 'save', name: string) => {
        if (props.characterData) {
            requestDiceRoll({ type, name });
        }
    };

    return (
        <DockablePanel
            title="In-Game Character Sheet"
            className="w-full max-w-2xl"
            id="character-sheet"
        >
            <CharacterSheetBody {...props} onRollRequest={handleRollRequest} />
        </DockablePanel>
    );
};
