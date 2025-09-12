import React from 'react';
import { Button } from '@/components/Button';

// FIX: Removed 'custom' from DiceScreen to match the type in FloatingDiceRoller.tsx, resolving the type mismatch error.
type DiceScreen = 'main' | 'stat' | 'save' | 'damage' | 'wound' | 'other';

interface ActionPanelProps {
    onNavigate: (screen: DiceScreen) => void;
    onSimpleRoll: (name: string, formula: string) => void;
    isCharacterLoaded: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ onNavigate, onSimpleRoll, isCharacterLoaded }) => (
    <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
            <Button variant="tertiary" size="lg" disabled={!isCharacterLoaded} onClick={() => onNavigate('stat')}>STAT</Button>
            <Button variant="tertiary" size="lg" disabled={!isCharacterLoaded} onClick={() => onNavigate('save')}>SAVE</Button>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <Button variant="tertiary" size="lg" onClick={() => onNavigate('damage')}>DAMAGE</Button>
            <Button variant="primary" onClick={() => onSimpleRoll('Dice', '1d100')} className="w-20 h-20 rounded-md">DICE</Button>
            <Button variant="tertiary" size="lg" onClick={() => onNavigate('wound')}>WOUND</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Button variant="tertiary" size="lg" onClick={() => onSimpleRoll('Panic', '1d20')}>PANIC</Button>
            <Button variant="tertiary" size="lg" onClick={() => onNavigate('other')}>OTHER</Button>
        </div>
    </div>
);