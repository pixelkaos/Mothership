
import React from 'react';
import type { Character } from '../../types';
import { Panel } from '../ui/Panel';
import { VitalDisplay } from './VitalDisplay';

interface VitalsPanelProps {
    character: Character;
}

export const VitalsPanel: React.FC<VitalsPanelProps> = ({ character }) => (
    <Panel title="Status Report">
        <div className="flex justify-around items-start py-2">
            <VitalDisplay label="Health" current={character.health.current} max={character.health.max} currentLabel="Current" maxLabel="Max" />
            <VitalDisplay label="Wounds" current={character.wounds.current} max={character.wounds.max} currentLabel="Current" maxLabel="Max" />
            <VitalDisplay label="Stress" current={character.stress.current} max={character.stress.minimum} currentLabel="Current" maxLabel="Min" />
        </div>
    </Panel>
);
