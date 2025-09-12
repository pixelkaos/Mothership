import React from 'react';
import type { Character, Stat, Save } from '@/types';
import { Button } from '@/components/Button';

type Advantage = 'none' | 'adv' | 'disadv';

interface CheckPanelProps {
    type: 'stat' | 'save';
    character: Character;
    allCharacterSkills: { name: string; bonus: number }[];
    selectedTarget: string | null;
    onSelectedTargetChange: (target: string) => void;
    selectedSkills: string[];
    onSelectedSkillsChange: (skills: string[]) => void;
    advantage: Advantage;
    onAdvantageChange: (advantage: Advantage) => void;
    onRoll: () => void;
    onBack: () => void;
}

export const CheckPanel: React.FC<CheckPanelProps> = ({
    type, character, allCharacterSkills,
    selectedTarget, onSelectedTargetChange,
    selectedSkills, onSelectedSkillsChange,
    advantage, onAdvantageChange,
    onRoll, onBack
}) => {
    const targets = type === 'stat' ? character.stats : character.saves;
    
    return (
        <div className="w-full mx-auto flex flex-col">
            <h3 className="text-xl font-bold tracking-wider text-center uppercase text-primary">{type} Check</h3>
            <div className="flex justify-around my-4">
                {Object.entries(targets).map(([key, value]) => (
                    <button key={key} onClick={() => onSelectedTargetChange(key)} className="flex flex-col items-center group">
                        <span className={`w-16 h-16 flex items-center justify-center text-2xl font-bold border transition-colors ${selectedTarget === key ? 'bg-primary text-background border-primary' : 'bg-black/20 text-foreground border-muted group-hover:bg-muted/20'}`}>{value}</span>
                        <span className="text-xs uppercase mt-2 tracking-wider text-muted">{key}</span>
                    </button>
                ))}
            </div>
            <hr className="border-primary/50" />
            <div className="my-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {allCharacterSkills.map(({name, bonus}) => (
                    <button 
                        key={name} 
                        onClick={() => onSelectedSkillsChange(selectedSkills.includes(name) ? selectedSkills.filter(s => s !== name) : [...selectedSkills, name])} 
                        className={`p-2 text-xs text-left flex items-center justify-between transition-colors ${selectedSkills.includes(name) ? 'bg-primary/20 text-primary' : 'bg-black/20 text-foreground hover:bg-muted/20'}`}
                    >
                        <span className="font-bold bg-muted text-background px-1 mr-2">+{bonus}</span>
                        <span className="flex-1 uppercase text-ellipsis overflow-hidden whitespace-nowrap">{name}</span>
                    </button>
                ))}
            </div>
            <hr className="border-primary/50" />
            <div className="my-3 grid grid-cols-2 gap-3">
                <Button variant="tertiary" size="sm" onClick={() => onAdvantageChange(advantage === 'adv' ? 'none' : 'adv')} className={advantage === 'adv' ? 'bg-tertiary text-background' : ''}>Advantage</Button>
                <Button variant="tertiary" size="sm" onClick={() => onAdvantageChange(advantage === 'disadv' ? 'none' : 'disadv')} className={advantage === 'disadv' ? 'bg-tertiary text-background' : ''}>Disadvantage</Button>
            </div>
            <Button
                onClick={onRoll}
                disabled={!selectedTarget}
                className="w-full mt-2"
            >
                Roll
            </Button>
            <Button variant="ghost" onClick={onBack} className="mt-4">Back</Button>
        </div>
    );
};
