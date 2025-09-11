
import React from 'react';
import { StepProps } from './Step1Stats';
import { SplitStatInput } from '../../ui/SplitStatInput';
import { StatInput } from '../../ui/StatInput';

export const Step3Vitals: React.FC<StepProps> = ({ saveData, onUpdate, onRollRequest }) => {
    const char = saveData.character;
    const maxWounds = 2 + (char.class?.max_wounds_mod || 0);
    
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Vitals & Condition</h2><p className="text-muted mt-2">Determine your starting health and condition. You can roll for max health or enter a value.</p></div>
            <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                 <StatInput
                    id="health.max"
                    label="Max Health (1d10+10)"
                    value={char.health.max}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onUpdate('character.health.max', val);
                        onUpdate('character.health.current', val);
                    }}
                    tooltipContent="Your maximum health. Current health will be set to this value."
                    onRollRequest={onRollRequest ? () => onRollRequest('creation', 'health.max') : undefined}
                />
                <div className="flex gap-8">
                    <SplitStatInput
                        label="Wounds"
                        id="wounds"
                        currentValue={char.wounds.current}
                        maxValue={maxWounds}
                        onCurrentChange={e => onUpdate('character.wounds.current', parseInt(e.target.value))}
                        onMaxChange={() => {}} // Read-only
                        isMaxReadOnly={true}
                        tooltipContent="The number of critical injuries you can sustain before dying. Maximum is based on your class."
                    />
                    <StatInput id="stress" label="Stress" value={char.stress.current} onChange={e => onUpdate('character.stress.current', parseInt(e.target.value))} tooltipContent="Your accumulated anxiety. Starts at 2." />
                </div>
            </div>
        </div>
    );
};
