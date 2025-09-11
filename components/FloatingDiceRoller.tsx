import React from 'react';
// FIX: Import `Character` type to resolve missing type error.
import type { Character, CharacterSaveData } from '../types';
import { DockablePanel } from './DockablePanel';
import { DiceRollerBody } from './dice-roller/DiceRollerBody';

interface FloatingDiceRollerProps {
    isVisible: boolean;
    onClose: () => void;
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const FloatingDiceRoller: React.FC<FloatingDiceRollerProps> = (props) => {
    if (!props.isVisible) {
        return null;
    }

    return (
        <DockablePanel
            title="Dice Roller"
            isVisible={props.isVisible}
            onClose={props.onClose}
            initialPosition={{ x: window.innerWidth / 2 - 224, y: 100 }}
            className="w-full max-w-md"
            panelId="dice-roller"
        >
            <DiceRollerBody {...props} />
        </DockablePanel>
    );
};