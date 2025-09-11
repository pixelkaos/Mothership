

import React from 'react';
import type { CharacterSaveData } from '../../../types';
import { rollDice } from '../../../utils/dice';
import { StatInput } from '../../ui/StatInput';
import { Button } from '../../Button';
import { Panel } from '../../ui/Panel';

export type StepProps = { 
    saveData: CharacterSaveData; 
    onUpdate: (path: string, value: any) => void; 
    onRollRequest?: (type: 'creation', name: string) => void;
};

export const Step1Stats: React.FC<StepProps> = ({ saveData, onUpdate, onRollRequest }) => {
    const handleRollAll = () => {
        onUpdate('baseStats.strength', rollDice('2d10+25'));
        onUpdate('baseStats.speed', rollDice('2d10+25'));
        onUpdate('baseStats.intellect', rollDice('2d10+25'));
        onUpdate('baseStats.combat', rollDice('2d10+25'));
        onUpdate('baseSaves.sanity', rollDice('2d10+10'));
        onUpdate('baseSaves.fear', rollDice('2d10+10'));
        onUpdate('baseSaves.body', rollDice('2d10+10'));
    };
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-primary uppercase tracking-wider">Stats & Saves</h2>
                <p className="text-sm text-muted mt-2">Roll your base stats and saves. These will be modified by your class later.</p>
                <Button variant="secondary" size="sm" onClick={handleRollAll} className="mt-4">Roll All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel title="Stats (2d10+25)">
                    <div className="flex justify-around">
                        <StatInput id="bs.str" label="Strength" value={saveData.baseStats.strength} onChange={e => onUpdate('baseStats.strength', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.strength') : undefined} />
                        <StatInput id="bs.spd" label="Speed" value={saveData.baseStats.speed} onChange={e => onUpdate('baseStats.speed', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.speed') : undefined} />
                        <StatInput id="bs.int" label="Intellect" value={saveData.baseStats.intellect} onChange={e => onUpdate('baseStats.intellect', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.intellect') : undefined} />
                        <StatInput id="bs.com" label="Combat" value={saveData.baseStats.combat} onChange={e => onUpdate('baseStats.combat', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.combat') : undefined} />
                    </div>
                </Panel>
                <Panel title="Saves (2d10+10)">
                    <div className="flex justify-around">
                        <StatInput id="sv.san" label="Sanity" value={saveData.baseSaves.sanity} onChange={e => onUpdate('baseSaves.sanity', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.sanity') : undefined} />
                        <StatInput id="sv.fer" label="Fear" value={saveData.baseSaves.fear} onChange={e => onUpdate('baseSaves.fear', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.fear') : undefined} />
                        <StatInput id="sv.bdy" label="Body" value={saveData.baseSaves.body} onChange={e => onUpdate('baseSaves.body', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.body') : undefined} />
                    </div>
                </Panel>
            </div>
        </div>
    );
};