import React, { useMemo, useCallback } from 'react';
import type { CharacterClass, SkillDefinition, Character, SkillTier } from '../types';
import { ALL_SKILLS } from '../constants';
import { useTooltip } from './Tooltip';
import { getSkillAndPrerequisites } from '../../utils/character';

interface SkillSelectorProps {
    characterClass: CharacterClass;
    selectedSkills: Character['skills'];
    scientistMasterSkill: string | null;
    onSkillsChange: (newSkills: Character['skills']) => void;
    onScientistMasterSkillChange: (skillName: string | null) => void;
}

export const SkillSelector: React.FC<SkillSelectorProps> = ({ characterClass, selectedSkills, scientistMasterSkill, onSkillsChange, onScientistMasterSkillChange }) => {
    const { showTooltip, hideTooltip } = useTooltip();

    const handleSkillToggle = useCallback((skillName: string, tier: SkillTier) => {
        let newSkills = JSON.parse(JSON.stringify(selectedSkills));
        const isSelected = newSkills[tier].includes(skillName);

        if (isSelected) {
            // Deselect and cascade
            const deselectWithCascade = (skillNameToRemove: string, currentSkills: Character['skills']): Character['skills'] => {
                const updatedSkills = {
                    trained: currentSkills.trained.filter(s => s !== skillNameToRemove),
                    expert: currentSkills.expert.filter(s => s !== skillNameToRemove),
                    master: currentSkills.master.filter(s => s !== skillNameToRemove),
                };
                
                const children = ALL_SKILLS.filter(s => s.prerequisites?.includes(skillNameToRemove));
                let finalSkills = updatedSkills;
                for (const child of children) {
                    if ([...currentSkills.expert, ...currentSkills.master].includes(child.name)) {
                        finalSkills = deselectWithCascade(child.name, finalSkills);
                    }
                }
                return finalSkills;
            };
            newSkills = deselectWithCascade(skillName, newSkills);

        } else {
            // Select
            newSkills[tier] = [...newSkills[tier], skillName];
        }

        onSkillsChange(newSkills);
    }, [selectedSkills, onSkillsChange]);


    const renderSkillButton = (skill: SkillDefinition) => {
        const { name, tier, prerequisites } = skill;
        const isStarting = characterClass.starting_skills.includes(name) || (scientistMasterSkill && getSkillAndPrerequisites(scientistMasterSkill).includes(name));
        const isSelected = selectedSkills[tier].includes(name);

        const allSelectedLowerTiers = [...selectedSkills.trained, ...selectedSkills.expert];
        const prereqsMet = tier === 'trained' || prerequisites?.every(p => allSelectedLowerTiers.includes(p));

        const isLocked = !prereqsMet && !isSelected;
        const canDeselect = isSelected && !isStarting;

        // Determine limits
        let bonusTrainedUsed = 0, bonusExpertUsed = 0;
        let limitReached = false;

        if (characterClass.name === 'Marine' || characterClass.name === 'Android') {
            const bonusSkills = characterClass.bonus_skills.choice!;
            const nonStartingTrained = selectedSkills.trained.filter(s => !characterClass.starting_skills.includes(s));
            const nonStartingExpert = selectedSkills.expert.filter(s => !characterClass.starting_skills.includes(s));
            
            const hasChosenExpert = nonStartingExpert.length > 0;
            const trainedSlotsUsed = nonStartingTrained.length;

            if (tier === 'expert' && hasChosenExpert) limitReached = true;
            if (tier === 'trained' && trainedSlotsUsed >= bonusSkills.trained) limitReached = true;
            if (tier === 'expert' && trainedSlotsUsed > 0) limitReached = true;
            if (tier === 'trained' && hasChosenExpert) limitReached = true;
        } else {
            const bonusSkills = characterClass.bonus_skills.fixed!;
            const nonStartingTrained = selectedSkills.trained.filter(s => !characterClass.starting_skills.includes(s) && !(scientistMasterSkill && getSkillAndPrerequisites(scientistMasterSkill).includes(s)));
            const nonStartingExpert = selectedSkills.expert.filter(s => !characterClass.starting_skills.includes(s) && !(scientistMasterSkill && getSkillAndPrerequisites(scientistMasterSkill).includes(s)));
            if (tier === 'trained' && nonStartingTrained.length >= bonusSkills.trained) limitReached = true;
            if (tier === 'expert' && nonStartingExpert.length >= bonusSkills.expert) limitReached = true;
        }

        const canSelect = !isSelected && !isLocked && !limitReached;

        let buttonClasses = '';
        if (isStarting) buttonClasses = 'bg-tertiary text-background/70 border-tertiary cursor-default';
        else if (isSelected) buttonClasses = 'bg-primary text-background border-primary';
        else if (isLocked) buttonClasses = 'bg-black/30 border-muted/50 text-muted cursor-not-allowed';
        else buttonClasses += 'bg-transparent border-tertiary text-tertiary hover:bg-tertiary hover:text-background';

        return (
            <div key={name} onMouseEnter={(e) => showTooltip(
                <div className="text-left">
                    <h5 className="font-bold text-lg text-secondary">{name}</h5>
                    {isStarting && <p className="text-xs text-secondary italic mb-2">This is a mandatory starting skill for your class.</p>}
                    <p className="text-sm text-foreground mb-2">{skill.description}</p>
                    {prerequisites && <p className="text-xs text-muted mt-2"><strong className="text-secondary">Requires:</strong> {prerequisites.join(', ')}</p>}
                </div>, e
            )} onMouseLeave={hideTooltip}>
                <button onClick={() => (canSelect || canDeselect) && handleSkillToggle(name, tier)} disabled={isLocked || (isSelected && !canDeselect) || (!isSelected && !canSelect)} className={`w-full p-2 border text-left text-xs transition-colors ${buttonClasses}`}>
                    {name}
                    {isStarting && <span className="text-muted text-xs"> (Class)</span>}
                </button>
            </div>
        );
    }
    
    if (characterClass.name === 'Scientist') {
        const masterSkills = ALL_SKILLS.filter(s => s.tier === 'master');
        return (
             <div>
                <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Scientist Starting Field</h4>
                <p className="text-xs text-muted mb-3">As a Scientist, you begin with deep knowledge in one area. Select a Master skill; you will automatically gain its prerequisite Expert and Trained skills.</p>
                <select 
                    value={scientistMasterSkill || ''} 
                    onChange={e => onScientistMasterSkillChange(e.target.value)}
                    className="w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary mb-4"
                >
                    <option value="" disabled>-- Select a Master Skill --</option>
                    {masterSkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                {scientistMasterSkill && <p className="text-xs text-positive text-center mb-4">You have gained: {getSkillAndPrerequisites(scientistMasterSkill).join(', ')}</p>}
                <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Bonus Skill</h4>
                 <p className="text-xs text-muted mb-3">You also get one additional Trained skill of your choice.</p>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {ALL_SKILLS.filter(s => s.tier === 'trained').map(renderSkillButton)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="mb-3 p-2 border border-secondary/30 bg-black/20 text-center text-sm">
                <p className="text-foreground">
                    <strong className="uppercase tracking-wider">Bonus Skills</strong>
                </p>
                {characterClass.name === 'Marine' || characterClass.name === 'Android' ? (
                    <p className="text-xs text-muted">Choose either 1 Expert OR 2 Trained skills.</p>
                ) : (
                    <p className="text-xs text-muted">You get 1 bonus Trained skill and 1 bonus Expert skill.</p>
                )}
            </div>
            {(['trained', 'expert', 'master'] as SkillTier[]).map(tier => (
                <div key={tier}>
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">{tier} Skills</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {ALL_SKILLS.filter(s => s.tier === tier).map(renderSkillButton)}
                    </div>
                </div>
            ))}
        </div>
    );
};
