
import React from 'react';
import { StepProps } from './Step1Stats';
import { SkillSelector } from '../../SkillSelector';
import type { Character } from '../../../types';
import { getSkillAndPrerequisites } from '../../../utils/character';

export const Step4Skills: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character, scientistMasterSkill } = saveData;
    if (!character.class) return <p className="text-muted text-center">Go back and select a class to continue.</p>;
    
    const handleScientistMasterSkillChange = (skillName: string | null) => {
        onUpdate('scientistMasterSkill', skillName);

        let newSkills: Character['skills'] = { trained: [], expert: [], master: [] };
        if (skillName) {
            const newChain = getSkillAndPrerequisites(skillName);
            newSkills.master.push(newChain[0]);
            newSkills.expert.push(newChain[1]);
            newSkills.trained.push(newChain[2]);
        }
        
        // This wipes any chosen bonus skill, which is acceptable UX when changing a core skill branch.
        // The user can re-select their bonus skill afterwards.
        onUpdate('character.skills', newSkills);
    };

    return (
        <div>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Skill Selection</h2><p className="text-muted mt-2">Spend your skill points based on your chosen class.</p></div>
            <SkillSelector 
                characterClass={character.class} 
                selectedSkills={character.skills} 
                onSkillsChange={skills => onUpdate('character.skills', skills)}
                scientistMasterSkill={scientistMasterSkill}
                onScientistMasterSkillChange={handleScientistMasterSkillChange}
            />
        </div>
    );
};
