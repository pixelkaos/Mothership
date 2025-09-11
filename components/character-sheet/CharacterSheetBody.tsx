
import React, { useMemo, useCallback } from 'react';
import type { Character, CharacterSaveData } from '../../types';
import { Panel } from '../ui/Panel';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { VitalDisplay } from './VitalDisplay';
import { StatDisplay } from './StatDisplay';
import { EquipmentItem } from './EquipmentItem';
import { Textarea } from '../ui/Textarea';

interface CharacterSheetBodyProps {
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
}

const ReadOnlyField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <Field label={label}>
        <Input readOnly value={value} />
    </Field>
);

export const CharacterSheetBody: React.FC<CharacterSheetBodyProps> = ({ characterData, onCharacterUpdate, onRollRequest }) => {
    const character = characterData?.character ?? null;
    
    const allSkills = useMemo(() => {
        if (!character) return [];
        return [...character.skills.trained, ...character.skills.expert, ...character.skills.master];
    }, [character]);
    
    const allEquipment = useMemo(() => {
        if (!character) return [];
        const loadoutItems = character.equipment.loadout
            ? character.equipment.loadout.split(',').map((item, index) => ({
                  value: item.trim(),
                  source: 'loadout' as const,
                  index,
              }))
            : [];
        const inventoryItems = character.equipment.inventory.map((item, index) => ({
            value: item.trim(),
            source: 'inventory' as const,
            index,
        }));
        return [...loadoutItems, ...inventoryItems].filter(item => item.value);
    }, [character]);

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
                    {/* Top Section */}
                    <div className="flex gap-4">
                        <div className="w-32 h-32 flex-shrink-0 border border-primary/50">
                             {character.portrait ? <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black/50 flex items-center justify-center text-muted text-xs">NO SIGNAL</div>}
                        </div>
                        <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 content-start">
                            <div className="col-span-2"><ReadOnlyField label="Name" value={character.name} /></div>
                            <ReadOnlyField label="Pronouns" value={character.pronouns} />
                            <ReadOnlyField label="Class" value={character.class?.name || 'N/A'} />
                        </div>
                    </div>
                    
                    {/* Status Report */}
                     <Panel title="Status Report">
                        <div className="flex justify-around items-start py-2">
                            <VitalDisplay label="Health" current={character.health.current} max={character.health.max} currentLabel="Current" maxLabel="Max" />
                            <VitalDisplay label="Wounds" current={character.wounds.current} max={character.wounds.max} currentLabel="Current" maxLabel="Max" />
                            <VitalDisplay label="Stress" current={character.stress.current} max={character.stress.minimum} currentLabel="Current" maxLabel="Min" />
                        </div>
                    </Panel>

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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Panel title="Skills">
                             <div className="max-h-32 overflow-y-auto bg-black/30 p-2 text-sm space-y-1">
                                {allSkills.length > 0 ? allSkills.map(skill => <div key={skill} className="bg-black/50 p-2">{skill}</div>) : <p className="text-muted text-center italic p-4">No skills learned.</p>}
                            </div>
                        </Panel>

                        <Panel title="Equipment">
                            <div className="max-h-32 overflow-y-auto bg-black/30 p-2 text-sm space-y-1">
                                {allEquipment.length > 0 ? (
                                    allEquipment.map((item) => (
                                        <EquipmentItem
                                            key={`${item.source}-${item.index}-${item.value}`}
                                            item={item}
                                            onUpdate={handleEquipmentUpdate}
                                        />
                                    ))
                                ) : <p className="text-muted text-center italic p-4">No equipment.</p>}
                            </div>
                        </Panel>
                    </div>

                     <Panel title="Notes">
                        <Textarea 
                            className="w-full h-24 resize-y" 
                            value={character.notes}
                            onChange={handleNotesChange}
                            placeholder="Session notes, character thoughts, etc."
                        ></Textarea>
                    </Panel>
                </>
            )}
        </div>
    );
};
