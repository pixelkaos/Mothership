import React, { useState, useCallback } from 'react';
import { GeneratorPanel } from '../components/GeneratorPanel';
import { AILogDisplay } from '../components/AILogDisplay';
import type { DerelictShip } from '../types';
import { DERELICT_GENERATION_TABLE, CAUSE_OF_RUINATION, WEIRD, CARGO_TYPE, SHIP_NAME_PART1, SHIP_NAME_PART2, SHIP_NAME_PART3 } from '../constants';
import { SHIP_DATA } from '../data/shipData';
import { generateDerelictDescription } from '../services/geminiService';
import { rollDice } from '../utils/dice';
import { useShip } from '../context/ShipContext';

export const DerelictGeneratorView: React.FC = () => {
    const { handleOpenDerelictManifest } = useShip();
    const [derelictShip, setDerelictShip] = useState<DerelictShip | null>(null);
    const [aiDescription, setAiDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateShip = useCallback(() => {
        setAiDescription('');
        setError('');
        
        const roll = rollDice('1d100') - 1; // 1-100 -> 0-99 for table lookup

        let generationInfo = DERELICT_GENERATION_TABLE.find(item => roll >= item.range[0] && roll <= item.range[1]);

        if (!generationInfo) {
            console.error(`Could not find ship info for roll: ${roll}. Defaulting to the first entry.`);
            generationInfo = DERELICT_GENERATION_TABLE[0];
        }

        const shipDetails = SHIP_DATA.find(s => s.name === generationInfo!.model);

        if (!shipDetails) {
            console.error(`Could not find ship details for model: ${generationInfo.model}.`);
            return;
        }

        const cause = CAUSE_OF_RUINATION[rollDice('1d100') - 1];
        const weird = WEIRD[rollDice('1d100') - 1];
        const cargo = CARGO_TYPE[rollDice('1d100') - 1];
        
        const salvageResults = generationInfo.salvage.map(s => {
            const amount = rollDice(s.dice);
            return `${amount} ${s.item}`;
        });
        
        const part1 = SHIP_NAME_PART1[Math.floor(Math.random() * SHIP_NAME_PART1.length)];
        const part2 = SHIP_NAME_PART2[Math.floor(Math.random() * SHIP_NAME_PART2.length)];
        const part3 = SHIP_NAME_PART3[Math.floor(Math.random() * SHIP_NAME_PART3.length)];
        const shipName = `${part1} ${part2} ${part3}`;

        const newShip: DerelictShip = {
            name: shipName,
            shipModel: `${shipDetails.name} (${shipDetails.modelCode})`,
            status: generationInfo.status,
            systems: generationInfo.systems,
            survivors: generationInfo.survivors,
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

    const handleOpenInManifest = useCallback(() => {
        if (derelictShip) {
            handleOpenDerelictManifest(derelictShip);
        }
    }, [derelictShip, handleOpenDerelictManifest]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-8">
            <GeneratorPanel
                ship={derelictShip}
                onGenerate={handleGenerateShip}
                onEnhance={handleEnhanceWithAI}
                onOpenInManifest={handleOpenInManifest}
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