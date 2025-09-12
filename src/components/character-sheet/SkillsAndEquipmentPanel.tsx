
import React, { useMemo } from 'react';
import type { Character } from '@/types';
import { Panel } from '@/components/ui/Panel';
import { EquipmentItem } from '@/components/character-sheet/EquipmentItem';

interface SkillsAndEquipmentPanelProps {
    character: Character;
    onEquipmentUpdate: (source: 'loadout' | 'inventory', index: number, newValue: string) => void;
}

export const SkillsAndEquipmentPanel: React.FC<SkillsAndEquipmentPanelProps> = ({ character, onEquipmentUpdate }) => {
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

    return (
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
                                onUpdate={onEquipmentUpdate}
                            />
                        ))
                    ) : <p className="text-muted text-center italic p-4">No equipment.</p>}
                </div>
            </Panel>
        </div>
    );
};
