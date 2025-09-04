
import React, { useState, useCallback } from 'react';
import { GeneratorPanel } from '../components/GeneratorPanel';
import { AILogDisplay } from '../components/AILogDisplay';
import type { DerelictShip, ShipClassStatus } from '../types';
import { SHIP_CLASS_STATUS, CAUSE_OF_RUINATION, WEIRD, CARGO_TYPE, SHIP_NAME_PART1, SHIP_NAME_PART2, SHIP_NAME_PART3 } from '../constants';
import { generateDerelictDescription } from '../services/geminiService';
import { rollDice } from '../utils/dice';

export const DerelictGeneratorView: React.FC = () => {
    const [derelictShip, setDerelictShip] = useState<DerelictShip | null>(null);
    const [aiDescription, setAiDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateShip = useCallback(() => {
        setAiDescription('');
        setError('');
        
        // A d100 roll results in 1-100. The table uses 0-99 ranges.
        const roll = rollDice('1d100') - 1; // Correctly maps to 0-99

        let shipInfo = SHIP_CLASS_STATUS.find(item => roll >= item.range[0] && roll <= item.range[1]);

        if (!shipInfo) {
            // This case should not be reached if SHIP_CLASS_STATUS covers all 0-99 outcomes.
            // As a fallback, log an error and use the first entry to prevent a crash.
            console.error(`Could not find ship info for roll: ${roll}. Defaulting to the first entry.`);
            shipInfo = SHIP_CLASS_STATUS[0];
        }

        const cause = CAUSE_OF_RUINATION[rollDice('1d100') - 1];
        const weird = WEIRD[rollDice('1d100') - 1];
        const cargo = CARGO_TYPE[rollDice('1d100') - 1];
        
        const salvageResults = shipInfo.salvage.map(s => {
            const amount = rollDice(s.dice);
            return `${amount} ${s.item}`;
        });
        
        const part1 = SHIP_NAME_PART1[Math.floor(Math.random() * SHIP_NAME_PART1.length)];
        const part2 = SHIP_NAME_PART2[Math.floor(Math.random() * SHIP_NAME_PART2.length)];
        const part3 = SHIP_NAME_PART3[Math.floor(Math.random() * SHIP_NAME_PART3.length)];
        const shipName = `${part1} ${part2} ${part3}`;

        const newShip: DerelictShip = {
            name: shipName,
            shipClass: shipInfo.class,
            status: shipInfo.status,
            systems: shipInfo.systems,
            survivors: shipInfo.survivors,
            causeOfRuination: cause,
            weirdTrait: weird,
            cargo: cargo,
            salvage: salvageResults.join(', ')
        };

        setDerelictShip(newShip);
    }, []);

    const handleEnhanceWithAI = useCallback(async () => {
        if (!derelictShip) return;

        setIsLoading(true);
        setError('');
        setAiDescription('');

        try {
            const description = await generateDerelictDescription(derelictShip);
            setAiDescription(description);
        } catch (e) {
            console.error(e);
            setError('Failed to get a response from the AI. The signal might be lost...');
        } finally {
            setIsLoading(false);
        }
    }, [derelictShip]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GeneratorPanel
                ship={derelictShip}
                onGenerate={handleGenerateShip}
                onEnhance={handleEnhanceWithAI}
                isLoading={isLoading}
            />
            <AILogDisplay
                description={aiDescription}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
};
