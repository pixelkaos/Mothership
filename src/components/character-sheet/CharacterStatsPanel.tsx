
import React from 'react';
import type { Character } from '@/types';
import { Panel } from '@/components/ui/Panel';
import { StatDisplay } from '@/components/character-sheet/StatDisplay';

interface CharacterStatsPanelProps {
    character: Character;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
}

export const CharacterStatsPanel: React.FC<CharacterStatsPanelProps> = ({ character, onRollRequest }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Stats">
            <div className="flex justify-around py-2">
                <StatDisplay label="Strength" value={character.stats.strength} onClick={() => onRollRequest('stat', 'strength')} />
                <StatDisplay label="Speed" value={character.stats.speed} onClick={() => onRollRequest('stat', 'speed')} />
                <StatDisplay label="Intellect" value={character.stats.intellect} onClick={() => onRollRequest('stat', 'intellect')} />
                <StatDisplay label="Combat" value={character.stats.combat} onClick={() => onRollRequest('stat', 'combat')} />
            </div>
        </Panel>
        <Panel title="Saves">
            <div className="flex justify-around py-2">
                <StatDisplay label="Sanity" value={character.saves.sanity} onClick={() => onRollRequest('save', 'sanity')} />
                <StatDisplay label="Fear" value={character.saves.fear} onClick={() => onRollRequest('save', 'fear')} />
                <StatDisplay label="Body" value={character.saves.body} onClick={() => onRollRequest('save', 'body')} />
            </div>
        </Panel>
    </div>
);
