import React, { useState } from 'react';
import { Button } from '../Button';

type Advantage = 'none' | 'adv' | 'disadv';

interface SimpleRollPanelProps {
    title: string;
    buttons: { name: string, formula: string }[];
    showAdvantage: boolean;
    onRoll: (name: string, formula: string, advantage: Advantage) => void;
    onBack: () => void;
}

export const SimpleRollPanel: React.FC<SimpleRollPanelProps> = ({ title, buttons, showAdvantage, onRoll, onBack }) => {
    const [advantage, setAdvantage] = useState<Advantage>('none');
    
    return (
        <div className="w-full mx-auto flex flex-col">
            <h3 className="text-xl font-bold tracking-wider text-center uppercase text-primary">{title}</h3>
            <hr className="border-primary/50 my-4" />
            <div className="space-y-3 flex-grow">
                {buttons.map(({ name, formula }) => (
                    <Button
                        key={name}
                        variant="secondary"
                        onClick={() => onRoll(name, formula, advantage)}
                        className="w-full"
                    >
                        {name} <span className="font-normal normal-case text-primary">({formula})</span>
                    </Button>
                ))}
            </div>
            {showAdvantage && (
                <>
                    <hr className="border-primary/50 my-3" />
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={advantage === 'adv' ? 'bg-tertiary text-background' : ''}>Advantage</Button>
                        <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={advantage === 'disadv' ? 'bg-tertiary text-background' : ''}>Disadvantage</Button>
                    </div>
                </>
            )}
            <Button variant="ghost" onClick={onBack} className="mt-4">Back</Button>
        </div>
    );
};
