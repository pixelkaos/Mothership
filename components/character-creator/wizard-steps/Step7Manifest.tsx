
import React, { useMemo } from 'react';
import type { CharacterSaveData, CharacterStats, CharacterSaves } from '../../../types';
import { Button } from '../../Button';

interface Step7ManifestProps {
    saveData: CharacterSaveData;
    onGoToStep: (step: number) => void;
}

export const Step7Manifest: React.FC<Step7ManifestProps> = ({ saveData, onGoToStep }) => {
    const { character, baseStats, baseSaves, androidPenalty, scientistBonus } = saveData;
    
    const { finalStats, finalSaves, finalMaxWounds } = useMemo(() => {
        const classData = character.class;
        let stats: CharacterStats = { ...baseStats };
        let saves: CharacterSaves = { ...baseSaves };
        let maxWounds = 2; // Base wounds

        if (classData) {
            maxWounds += classData.max_wounds_mod || 0;

            for (const [stat, mod] of Object.entries(classData.stats_mods || {})) {
                stats[stat as keyof typeof stats] += mod;
            }
            for (const [save, mod] of Object.entries(classData.saves_mods || {})) {
                saves[save as keyof typeof saves] += mod;
            }

            if (classData.name === 'Android' && androidPenalty) {
                stats[androidPenalty] -= 10;
            }
            if (classData.name === 'Scientist' && scientistBonus) {
                stats[scientistBonus] += 5;
            }
        }
        return { finalStats: stats, finalSaves: saves, finalMaxWounds: maxWounds };
    }, [character.class, baseStats, baseSaves, androidPenalty, scientistBonus]);
    
    const allSkills = [...(character.skills.trained || []), ...(character.skills.expert || []), ...(character.skills.master || [])].filter(Boolean);

    const EditButton = ({step}: {step: number}) => <Button variant="ghost" size="sm" onClick={() => onGoToStep(step)} className="ml-2 text-xs text-secondary hover:text-primary">[Edit]</Button>;
    
    return (
        <div>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Final Manifest</h2><p className="text-muted mt-2">Review your character. You can go back to any previous step to make changes.</p></div>
            <dl className="divide-y divide-primary/50 bg-black/30 p-4 text-sm">
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Name</dt><dd className="col-span-2">{character.name || 'N/A'} ({character.pronouns || 'N/A'}) <EditButton step={6} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Class</dt><dd className="col-span-2">{character.class?.name || 'N/A'} <EditButton step={2} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Stats</dt><dd className="col-span-2">Str {finalStats.strength}, Spd {finalStats.speed}, Int {finalStats.intellect}, Com {finalStats.combat} <EditButton step={1} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Saves</dt><dd className="col-span-2">Sanity {finalSaves.sanity}, Fear {finalSaves.fear}, Body {finalSaves.body} <EditButton step={1} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Vitals</dt><dd className="col-span-2">HP: {character.health.current}/{character.health.max} | Wounds: {character.wounds.current}/{finalMaxWounds} | Stress: {character.stress.current} <EditButton step={3} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Skills ({allSkills.length})</dt><dd className="col-span-2">{allSkills.join(', ') || 'None selected'} <EditButton step={4} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Equipment</dt><dd className="col-span-2">{character.equipment.loadout || 'None selected'}. Trinket: {character.equipment.trinket || 'N/A'}. Patch: {character.equipment.patch || 'N/A'}. <EditButton step={5} /></dd></div>
                <div className="py-2 grid grid-cols-3 gap-4"><dt className="font-bold text-primary/80">Credits</dt><dd className="col-span-2">{character.credits}cr <EditButton step={5} /></dd></div>
            </dl>
        </div>
    );
};
