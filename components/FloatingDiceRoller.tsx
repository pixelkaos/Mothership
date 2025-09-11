
import React from 'react';
import type { Character, CharacterSaveData } from '../types';
import { DockablePanel } from './DockablePanel';
import { DiceRollerBody } from './dice-roller/DiceRollerBody';
import { useAppContext } from '../context/AppContext';

interface FloatingDiceRollerProps {
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const FloatingDiceRoller: React.FC<FloatingDiceRollerProps> = (props) => {
    const { openPanel } = useAppContext();

    React.useEffect(() => {
        if (props.activeCheck) {
            openPanel('dice-roller');
        }
    }, [props.activeCheck, openPanel]);

    return (
        <DockablePanel
            title="Dice Roller"
            initialPosition={{ x: window.innerWidth / 2 - 224, y: 100 }}
            className="w-full max-w-md"
            panelId="dice-roller"
        >
            <DiceRollerBody {...props} />
        </DockablePanel>
    );
};