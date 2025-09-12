import React from 'react';
import type { Character, CharacterSaveData } from '@/types';
import { DockablePanel } from '@/components/DockablePanel';
import { DiceRollerBody } from '@/components/dice-roller/DiceRollerBody';

interface FloatingDiceRollerProps {
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const FloatingDiceRoller: React.FC<FloatingDiceRollerProps> = (props) => {
    return (
        <DockablePanel
            title="Dice Roller"
            className="w-full max-w-md"
            id="dice-roller"
        >
            <DiceRollerBody {...props} />
        </DockablePanel>
    );
};
