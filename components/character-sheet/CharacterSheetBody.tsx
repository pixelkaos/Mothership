
import React, { useCallback } from 'react';
import type { Character, CharacterSaveData } from '../../types';
import { CharacterSummary } from './CharacterSummary';
import { VitalsPanel } from './VitalsPanel';
import { CharacterStatsPanel } from './CharacterStatsPanel';
import { SkillsAndEquipmentPanel } from './SkillsAndEquipmentPanel';
import { NotesPanel } from './NotesPanel';


interface CharacterSheetBodyProps {
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
}

export const CharacterSheetBody: React.FC<CharacterSheetBodyProps> = ({ characterData, onCharacterUpdate, onRollRequest }) => {
    const character = characterData?.character ?? null;
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (character) {
            onCharacterUpdate({ ...character, notes: e.target.value });
        }
    };

    const handleEquipmentUpdate = useCallback((source: 'loadout' | 'inventory', index: number, newValue: string) => {
        if (!character) return;
        const newCharacter = JSON.parse(JSON.stringify(character));

        if (source === 'loadout') {
            const loadoutItems = newCharacter.equipment.loadout.split(',').map((i: string) => i.trim());
            if (index < loadoutItems.length) {
                loadoutItems[index] = newValue;
                newCharacter.equipment.loadout = loadoutItems.join(', ');
            }
        } else { // source === 'inventory'
            if (index < newCharacter.equipment.inventory.length) {
                newCharacter.equipment.inventory[index] = newValue;
            }
        }
        onCharacterUpdate(newCharacter);
    }, [character, onCharacterUpdate]);

    return (
        <div className="p-4 text-foreground space-y-4">
            {!character ? (
                <div className="p-8 text-center text-muted">
                    <p className="font-bold">No Character Loaded</p>
                    <p className="text-sm">Please load or create a character from the Character Hangar.</p>
                </div>
            ) : (
                <>
                    <CharacterSummary character={character} />
                    <VitalsPanel character={character} />
                    <CharacterStatsPanel character={character} onRollRequest={onRollRequest} />
                    <SkillsAndEquipmentPanel character={character} onEquipmentUpdate={handleEquipmentUpdate} />
                    <NotesPanel notes={character.notes} onNotesChange={handleNotesChange} />
                </>
            )}
        </div>
    );
};
