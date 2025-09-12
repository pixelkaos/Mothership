
import React, { useMemo } from 'react';
import type { Character, SkillTier } from '@/types';
import { Panel } from '@/components/ui/Panel';
import { EquipmentItem } from '@/components/character-sheet/EquipmentItem';
import { ALL_SKILLS } from '@/constants/rules';

interface SkillsAndEquipmentPanelProps {
    character: Character;
    onEquipmentUpdate: (source: 'loadout' | 'inventory', index: number, newValue: string) => void;
    onCharacterUpdate: (character: Character) => void;
}

export const SkillsAndEquipmentPanel: React.FC<SkillsAndEquipmentPanelProps> = ({ character, onEquipmentUpdate, onCharacterUpdate }) => {
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

    const getTier = (name: string): SkillTier | null => {
        if (character.skills.master.includes(name)) return 'master';
        if (character.skills.expert.includes(name)) return 'expert';
        if (character.skills.trained.includes(name)) return 'trained';
        return null;
    };

    const canLevelUp = (name: string): { nextTier: SkillTier | null; options: string[] } => {
        const tier = getTier(name);
        if (!tier || tier === 'master') return { nextTier: null, options: [] };
        const nextTier: SkillTier = tier === 'trained' ? 'expert' : 'master';
        const owned = new Set([...character.skills.trained, ...character.skills.expert, ...character.skills.master]);
        const options = ALL_SKILLS
            .filter(s => s.tier === nextTier && Array.isArray(s.prerequisites) && s.prerequisites.includes(name))
            .filter(s => s.prerequisites!.every(p => owned.has(p)))
            .map(s => s.name)
            // avoid duplicates and already owned
            .filter(opt => !owned.has(opt));
        return { nextTier, options };
    };

    const handleLevelUp = (name: string) => {
        const { nextTier, options } = canLevelUp(name);
        if (!nextTier || options.length === 0) return;
        let chosen = options[0];
        if (options.length > 1) {
            const input = window.prompt(`Choose next ${nextTier} skill for ${name} by typing exact name:\n- ${options.join('\n- ')}`, options[0]);
            if (!input) return;
            if (!options.includes(input)) {
                alert('Invalid selection.');
                return;
            }
            chosen = input;
        }
        const updated: Character = JSON.parse(JSON.stringify(character));
        if (nextTier === 'expert') {
            if (!updated.skills.expert.includes(chosen)) updated.skills.expert.push(chosen);
        } else if (nextTier === 'master') {
            if (!updated.skills.master.includes(chosen)) updated.skills.master.push(chosen);
        }
        if (!updated.skillProgress) updated.skillProgress = {};
        updated.skillProgress[name] = 0; // reset marks after level-up
        onCharacterUpdate(updated);
    };

    const renderSkillRow = (name: string) => {
        const tier = getTier(name);
        const label = tier ? (tier === 'trained' ? 'Trained' : tier === 'expert' ? 'Expert' : 'Master') : '';
        const marks = character.skillProgress?.[name] ?? 0;
        const { options } = canLevelUp(name);
        const eligible = marks >= 3 && options.length > 0;
        return (
            <>
                <div className="font-extrabold text-foreground text-lg leading-tight">{name}</div>
                <div className="flex items-center gap-2">
                    <span className="text-primary uppercase tracking-wider">{label}</span>
                    <div className="flex items-center gap-1" aria-label={`${marks} advancement marks`}>
                        {[0,1,2].map(i => (
                            <span key={i} className={`w-3 h-3 rounded-full ${i < marks ? 'bg-primary' : 'bg-primary/20'}`} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => handleLevelUp(name)}
                        disabled={!eligible}
                        className={`px-4 py-2 rounded-lg border transition-colors ${eligible ? 'border-primary text-primary hover:bg-primary/10' : 'border-muted text-muted cursor-not-allowed'}`}
                        title={eligible ? `Level up to: ${options.join(', ')}` : 'Earn 3 marks and meet prerequisites to level up'}
                    >
                        Level Up
                    </button>
                </div>
            </>
        );
    };

    const tCount = character.skills.trained.length;
    const eCount = character.skills.expert.length;
    const mCount = character.skills.master.length;
    const pad2 = (n: number) => n.toString().padStart(2, '0');

    // Armor Points and Credits indicator (sum of all (AP N) across loadout/inventory)
    const apRegex = /\((?:AP|ap)\s*(\d+)\)/;
    const apFromLoadout = character.equipment.loadout
        ? character.equipment.loadout.split(',').reduce((sum, raw) => {
            const m = raw.match(apRegex); return sum + (m ? parseInt(m[1], 10) : 0);
        }, 0)
        : 0;
    const apFromInventory = character.equipment.inventory.reduce((sum, raw) => {
        const m = raw.match(apRegex); return sum + (m ? parseInt(m[1], 10) : 0);
    }, 0);
    const apTotal = apFromLoadout + apFromInventory;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Panel
                title="Skills"
                actions={
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-extrabold text-foreground">T:<span className="ml-1 inline-block min-w-[1.5ch] text-foreground/90">{pad2(tCount)}</span></span>
                        <span className="font-extrabold text-foreground">E:<span className="ml-1 inline-block min-w-[1.5ch] text-foreground/90">{pad2(eCount)}</span></span>
                        <span className="font-extrabold text-foreground">M:<span className="ml-1 inline-block min-w-[1.5ch] text-foreground/90">{pad2(mCount)}</span></span>
                    </div>
                }
            >
                <div className="max-h-64 overflow-y-auto bg-black/30 p-3 text-sm">
                    {allSkills.length > 0 ? (
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-2">
                            {allSkills.map(renderSkillRow)}
                        </div>
                    ) : (
                        <p className="text-muted text-center italic p-4">No skills learned.</p>
                    )}
                </div>
            </Panel>

            <Panel
                title="Equipment"
                actions={
                    <div className="flex items-center gap-4 text-sm">
                        <span className="font-extrabold text-foreground">AP:<span className="ml-1 inline-block min-w-[1.5ch] text-foreground/90">{pad2(apTotal)}</span></span>
                        <span className="font-extrabold text-foreground">Cr:<span className="ml-1 inline-block min-w-[3ch] text-foreground/90">{character.credits}</span></span>
                    </div>
                }
            >
                <div className="max-h-64 overflow-y-auto bg-black/30 p-3 text-sm">
                    {allEquipment.length > 0 ? (
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-2">
                            {allEquipment.map((item) => (
                                <EquipmentItem
                                    key={`${item.source}-${item.index}-${item.value}`}
                                    item={item}
                                    onUpdate={onEquipmentUpdate}
                                    layout="grid"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted text-center italic p-4">No equipment.</p>
                    )}
                </div>
            </Panel>
        </div>
    );
};
