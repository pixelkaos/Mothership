

import React from 'react';
import { StepProps } from './Step1Stats';
import { STARTING_EQUIPMENT_TABLES, TRINKETS, PATCHES } from '../../../constants';
import { rollDice } from '../../../utils/dice';
import { Panel } from '../../ui/Panel';
import { Button } from '../../Button';

export const Step5Equipment: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { equipment, credits, class: charClass } = saveData.character;

    const handleRollLoadout = () => {
        if (!charClass) return;
        const equipmentTable = STARTING_EQUIPMENT_TABLES[charClass.name];
        const rolledEquipment = equipmentTable[Math.floor(Math.random() * equipmentTable.length)];
        onUpdate('character.equipment.loadout', rolledEquipment);
        onUpdate('character.equipment.trinket', TRINKETS[Math.floor(Math.random() * TRINKETS.length)]);
        onUpdate('character.equipment.patch', PATCHES[Math.floor(Math.random() * PATCHES.length)]);
        onUpdate('character.credits', rollDice('5d10'));
    };

    const handleTakeCredits = () => {
        if (!charClass) return;
        onUpdate('character.equipment.loadout', 'Custom Gear Selection');
        onUpdate('character.equipment.trinket', TRINKETS[Math.floor(Math.random() * TRINKETS.length)]);
        onUpdate('character.equipment.patch', PATCHES[Math.floor(Math.random() * PATCHES.length)]);
        onUpdate('character.credits', rollDice('5d10*10'));
    };

    const handleReset = () => {
        onUpdate('character.equipment.loadout', '');
        onUpdate('character.equipment.trinket', '');
        onUpdate('character.equipment.patch', '');
        onUpdate('character.credits', 0);
    };

    if (!charClass) {
        return <p className="text-muted text-center">Go back and select a class to see equipment options.</p>;
    }

    if (equipment.loadout) {
        return (
            <div className="space-y-6 text-center">
                 <h2 className="text-2xl font-semibold text-primary uppercase tracking-wider">Equipment Manifest</h2>
                 <div className="text-center border border-primary/50 pt-6 mt-6 space-y-2 text-sm bg-black/30 p-4">
                    <p className="text-lg text-foreground">{equipment.loadout}</p>
                    <div className="pt-4 mt-4 border-t border-muted/50 flex flex-col sm:flex-row justify-around gap-2">
                        <p><strong className="text-primary/80">Trinket:</strong> {equipment.trinket}</p>
                        <p><strong className="text-primary/80">Patch:</strong> {equipment.patch}</p>
                        <p><strong className="text-primary/80">Credits:</strong> {credits}</p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleReset} className="mt-4">
                    Reset Choice
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-primary uppercase tracking-wider">Starting Equipment</h2>
                <p className="text-sm text-muted mt-2 max-w-2xl mx-auto">Choose how to equip your character. You can either take a pre-rolled package with some pocket money, or a larger starting fund to buy your own gear from the ship's store later.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel title="Option 1: Roll for Loadout" className="text-center flex flex-col">
                    <p className="text-muted text-sm my-4 flex-grow">Receive a random, class-specific equipment package. You'll be ready for action immediately. Also includes a random trinket, patch, and pocket money.</p>
                    <p className="font-bold text-primary mb-4">Credits: 5d10</p>
                    <Button onClick={handleRollLoadout} className="w-full mt-auto">
                        Roll Loadout
                    </Button>
                </Panel>
                <Panel title="Option 2: Purchase Gear" className="text-center flex flex-col">
                    <p className="text-muted text-sm my-4 flex-grow">Forgo the random package for a substantial starting fund. You'll need to purchase all your gear, from armor to weapons. Also includes a random trinket and patch.</p>
                    <p className="font-bold text-primary mb-4">Credits: 5d10 x 10</p>
                     <Button onClick={handleTakeCredits} className="w-full mt-auto">
                        Take Credits
                    </Button>
                </Panel>
            </div>
        </div>
    );
};