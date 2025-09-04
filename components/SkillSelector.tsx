
import React, { useMemo, useCallback } from 'react';
import type { CharacterClass, SkillDefinition, Character, SkillTier } from '../types';
import { ALL_SKILLS, SCIENTIST_SKILL_CHOICES } from '../constants';
import { useTooltip } from './Tooltip';

interface SkillSelectorProps {
    characterClass: CharacterClass;
    allSkills: SkillDefinition[];
    selectedSkills: Character['skills'];
    onSkillsChange: (newSkills: Character['skills']) => void;
}

// Memoize categorized skills outside component for performance
const skillMap = new Map(ALL_SKILLS.map(s => [s.name, s]));
const categorizedSkills = (() => {
    const tiers: Record<SkillTier, SkillDefinition[]> = { trained: [], expert: [], master: [] };
    for (const skill of ALL_SKILLS) {
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
            tiers.trained.push(skill);
        } else {
            const isMaster = skill.prerequisites.some(pName => {
                const prereq = skillMap.get(pName);
                return prereq?.prerequisites && prereq.prerequisites.length > 0;
            });
            if (isMaster) {
                tiers.master.push(skill);
            } else {
                tiers.expert.push(skill);
            }
        }
    }
    return tiers;
})();

const BASE_SKILLS = { trained: 2, expert: 1, master: 0 };

export const SkillSelector: React.FC<SkillSelectorProps> = ({ characterClass, allSkills, selectedSkills, onSkillsChange }) => {
    const { showTooltip, hideTooltip } = useTooltip();

    const isFlexibleClass = characterClass.name === 'Marine' || characterClass.name === 'Android';
    const isScientist = characterClass.name === 'Scientist';
    
    // All skills selected by the Scientist from their special choice list.
    const scientistChoiceSelections = useMemo(() => {
        if (!isScientist) return [];
        return selectedSkills.trained.filter(s => SCIENTIST_SKILL_CHOICES.includes(s));
    }, [isScientist, selectedSkills.trained]);

    // The first 3 skills selected from the choice list, which are the mandatory starting skills.
    const scientistMandatoryPicks = useMemo(() => {
        // Since array operations like filter and push preserve order, this will correctly
        // identify the first 3 skills chosen from the list as the mandatory ones.
        return scientistChoiceSelections.slice(0, 3);
    }, [scientistChoiceSelections]);

    // Calculate flexible class skill usage at the top level to avoid calling a hook in a loop.
    const { totalTrainedSelected, totalExpertSelected, bonusTrainedUsed, bonusExpertUsed, hasChosenTrainedBonus, hasChosenExpertBonus } = useMemo(() => {
        if (!isFlexibleClass) return { totalTrainedSelected: 0, totalExpertSelected: 0, bonusTrainedUsed: 0, bonusExpertUsed: 0, hasChosenTrainedBonus: false, hasChosenExpertBonus: false };
        
        const nonStartingTrained = selectedSkills.trained.filter(s => !characterClass.starting_skills.includes(s));
        const totalTrained = nonStartingTrained.length;
        const totalExpert = selectedSkills.expert.length;
        
        const baseTrainedUsed = Math.min(totalTrained, BASE_SKILLS.trained);
        const bonusTrained = totalTrained - baseTrainedUsed;

        const baseExpertUsed = Math.min(totalExpert, BASE_SKILLS.expert);
        const bonusExpert = totalExpert - baseExpertUsed;

        return {
            totalTrainedSelected: totalTrained,
            totalExpertSelected: totalExpert,
            bonusTrainedUsed: bonusTrained,
            bonusExpertUsed: bonusExpert,
            hasChosenTrainedBonus: bonusTrained > 0,
            hasChosenExpertBonus: bonusExpert > 0,
        };
    }, [isFlexibleClass, selectedSkills, characterClass.starting_skills]);
    
    const bonusSkillTextNode = useMemo(() => {
        if (isFlexibleClass) {
            return (
                <>
                    As a {characterClass.name}, you get a bonus choice of an additional <strong className="text-secondary">{`1 Expert`}</strong> OR <strong className="text-secondary">{`2 Trained`}</strong> skills.
                </>
            );
        }

        const { trained, expert, master } = characterClass.bonus_skills;
        const parts: React.ReactNode[] = [];
        if (master > 0) parts.push(<strong key="master" className="text-secondary">{master} Master</strong>);
        if (expert > 0) parts.push(<strong key="expert" className="text-secondary">{expert} Expert</strong>);
        if (trained > 0) parts.push(<strong key="trained" className="text-secondary">{trained} Trained</strong>);

        if (parts.length === 0) {
            return `As a ${characterClass.name}, you receive no additional bonus skill points.`;
        }

        // FIX: Explicitly specify the generic type for `reduce` to fix a type inference issue where `acc` was not being recognized as an array.
        const joinedParts = parts.reduce<React.ReactNode[]>((acc, part, index) => {
            if (index === 0) return [part];
            if (index === parts.length - 1) return [...acc, ' & ', part];
            return [...acc, ', ', part];
        }, []);
        
        return <>As a {characterClass.name}, you get a bonus of {joinedParts} skill points.</>;
    }, [characterClass.name, characterClass.bonus_skills, isFlexibleClass]);

    const handleSkillToggle = useCallback((skill: SkillDefinition, tier: SkillTier) => {
        const isSelected = selectedSkills[tier].includes(skill.name);
        let newSkills = { ...selectedSkills };

        if (isSelected) {
            // Deselect and cascade
            const deselectWithCascade = (skillNameToRemove: string, currentSkills: Character['skills']): Character['skills'] => {
                const updatedSkills = {
                    trained: currentSkills.trained.filter(s => s !== skillNameToRemove),
                    expert: currentSkills.expert.filter(s => s !== skillNameToRemove),
                    master: currentSkills.master.filter(s => s !== skillNameToRemove),
                };
                
                const children = allSkills.filter(s => s.prerequisites?.includes(skillNameToRemove));
                let finalSkills = updatedSkills;
                for (const child of children) {
                    if ([...currentSkills.expert, ...currentSkills.master].includes(child.name)) {
                        finalSkills = deselectWithCascade(child.name, finalSkills);
                    }
                }
                return finalSkills;
            };
            newSkills = deselectWithCascade(skill.name, selectedSkills);

        } else {
            // Select
            newSkills[tier] = [...newSkills[tier], skill.name];
        }

        onSkillsChange(newSkills);
    }, [selectedSkills, allSkills, onSkillsChange]);

    if (isScientist && scientistChoiceSelections.length < 3) {
        return (
            <div>
                <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">
                    Select 3 Starting Fields ({scientistChoiceSelections.length}/3)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SCIENTIST_SKILL_CHOICES.map(skillName => {
                        const skill = allSkills.find(s => s.name === skillName)!;
                        const isSelected = scientistChoiceSelections.includes(skillName);
                        const canSelect = !isSelected;
                        
                        return (
                            <button
                                key={skillName}
                                onClick={() => canSelect && handleSkillToggle(skill, 'trained')}
                                onMouseEnter={(e) => showTooltip(
                                    <div>
                                        <h5 className="font-bold text-secondary">{skill.name}</h5>
                                        <p className="text-foreground">{skill.description}</p>
                                    </div>,
                                    e
                                )}
                                onMouseLeave={hideTooltip}
                                className={`p-2 border text-left text-xs transition-colors ${isSelected ? 'bg-primary text-background border-primary' : 'bg-transparent border-tertiary text-tertiary hover:bg-tertiary hover:text-background'}`}
                            >
                                {skillName}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
             <div className="mb-3 p-2 border border-secondary/30 bg-black/20 text-center text-sm">
                <p className="text-foreground">
                    <strong className="uppercase tracking-wider">Skill Points:</strong> Every class gets a base of <strong className="text-secondary">2 Trained</strong> & <strong className="text-secondary">1 Expert</strong> skill.
                </p>
                <p className="text-xs text-muted">{bonusSkillTextNode}</p>
            </div>
            {Object.entries(categorizedSkills).map(([tier, skillsInTier]) => {
                const tierKey = tier as SkillTier;
                
                let startingSkillsInTier = characterClass.starting_skills.filter(s => skillsInTier.some(sts => sts.name === s));
                 if (isScientist) {
                    startingSkillsInTier = scientistMandatoryPicks;
                }
                const selectedInTier = selectedSkills[tierKey].filter(s => !startingSkillsInTier.includes(s));
                const selectedInTierCount = selectedInTier.length;

                return (
                    <div key={tier}>
                        <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">
                            {tier} Skills
                            <span className="ml-4 text-muted text-xs">
                                {isFlexibleClass ? (
                                    tierKey === 'trained' ? `Base: ${Math.min(totalTrainedSelected, 2)}/2 | Bonus: ${bonusTrainedUsed}/2` :
                                    tierKey === 'expert' ? `Base: ${Math.min(totalExpertSelected, 1)}/1 | Bonus: ${bonusExpertUsed}/1` :
                                    `Selected: ${selectedInTierCount}`
                                ) : (
                                    `Skill Points: ${selectedInTierCount} / ${BASE_SKILLS[tierKey] + characterClass.bonus_skills[tierKey]}`
                                )}
                            </span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {skillsInTier.map(skill => {
                                const isStarting = startingSkillsInTier.includes(skill.name);
                                const isSelected = selectedSkills[tierKey].includes(skill.name);
                                const allSelectedLowerSkills = [...selectedSkills.trained, ...selectedSkills.expert];
                                const prereqsMet = skill.prerequisites?.every(p => allSelectedLowerSkills.includes(p)) ?? true;
                                const isLocked = !prereqsMet;
                                
                                let limitReached = false;
                                if (isFlexibleClass) {
                                    if (tierKey === 'trained') {
                                        limitReached = totalTrainedSelected >= (BASE_SKILLS.trained + 2) || (totalTrainedSelected >= BASE_SKILLS.trained && hasChosenExpertBonus);
                                    } else if (tierKey === 'expert') {
                                        limitReached = totalExpertSelected >= (BASE_SKILLS.expert + 1) || (totalExpertSelected >= BASE_SKILLS.expert && hasChosenTrainedBonus);
                                    } else { // Master
                                        limitReached = selectedInTierCount >= (BASE_SKILLS.master + characterClass.bonus_skills.master);
                                    }
                                } else { // Standard classes
                                    limitReached = selectedInTierCount >= (BASE_SKILLS[tierKey] + characterClass.bonus_skills[tierKey]);
                                }

                                const canSelect = !isSelected && !isLocked && !limitReached;
                                const canDeselect = isSelected && !isStarting;

                                let buttonClasses = '';
                                if (isStarting) buttonClasses = 'bg-tertiary text-background/70 border-tertiary cursor-default';
                                else if (isSelected) buttonClasses = 'bg-primary text-background border-primary';
                                else if (isLocked) buttonClasses = 'bg-black/30 border-muted/50 text-muted cursor-not-allowed';
                                else buttonClasses += 'bg-transparent border-tertiary text-tertiary hover:bg-tertiary hover:text-background';

                                return (
                                    <div
                                        key={skill.name}
                                        onMouseEnter={(e) => showTooltip(
                                            <div className="text-left">
                                                <h5 className="font-bold text-lg text-secondary">{skill.name}</h5>
                                                {isStarting && (
                                                    <p className="text-xs text-secondary italic mb-2">
                                                        This is a mandatory starting skill for your class.
                                                    </p>
                                                )}
                                                <p className="text-sm text-foreground mb-2">{skill.description}</p>
                                                {skill.effects && (
                                                     <p className="text-sm text-foreground mb-2">
                                                        <strong className="text-primary">Effect:</strong> {skill.effects}
                                                    </p>
                                                )}
                                                {skill.prerequisites && skill.prerequisites.length > 0 && (
                                                    <p className="text-xs text-muted mt-2">
                                                        <strong className="text-secondary">Requires:</strong> {skill.prerequisites.join(', ')}
                                                    </p>
                                                )}
                                            </div>,
                                            e
                                        )}
                                        onMouseLeave={hideTooltip}
                                    >
                                        <button
                                            onClick={() => (canSelect || canDeselect) && handleSkillToggle(skill, tierKey)}
                                            disabled={isLocked || (isSelected && !canDeselect) || (!isSelected && !canSelect)}
                                            className={`w-full p-2 border text-left text-xs transition-colors ${buttonClasses}`}
                                        >
                                            {skill.name}
                                            {isStarting && <span className="text-muted text-xs"> (Class)</span>}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};