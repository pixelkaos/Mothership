
import { useState, useMemo, useCallback } from 'react';
import type { CharacterSaveData } from '@/types';
import { initialSaveData, getSkillAndPrerequisites } from '@/utils/character';
import { set } from '@/utils/helpers';
import { ALL_SKILLS } from '@/constants/rules';

/**
 * Manages the state and logic for the multi-step character creation wizard.
 *
 * This hook encapsulates the current step, all temporary character data,
 * step validation logic, and navigation handlers. It provides a stable API
 * with memoized callbacks for the wizard component to consume, keeping the
 * UI component clean and focused on rendering.
 *
 * @returns An object containing the wizard's state and memoized action handlers.
 */
export const useCharacterWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [saveData, setSaveData] = useState<CharacterSaveData>(JSON.parse(JSON.stringify(initialSaveData)));

    const updateData = useCallback((path: string, value: any) => {
        setSaveData(prev => {
            const newSaveData = JSON.parse(JSON.stringify(prev));
            set(newSaveData, path, value);
            return newSaveData;
        });
    }, []);

    const isStepComplete = useMemo(() => {
        switch (currentStep) {
            case 1:
                const { baseStats, baseSaves } = saveData;
                return Object.values(baseStats).every(v => v > 0) && Object.values(baseSaves).every(v => v > 0);
            case 2:
                const { character, androidPenalty, scientistBonus } = saveData;
                if (!character.class) return false;
                if (character.class.name === 'Android' && !androidPenalty) return false;
                if (character.class.name === 'Scientist' && !scientistBonus) return false;
                return true;
            case 3:
                return saveData.character.health.max > 0;
            case 4:
                return saveData.character.class !== null;
            case 5:
                return saveData.character.equipment.loadout !== '';
            case 6:
                return saveData.character.name !== '' && saveData.character.pronouns !== '';
            case 7:
                return true;
            default:
                return false;
        }
    }, [currentStep, saveData]);

    const handleNext = useCallback(() => {
        if (currentStep === 2) {
            const classData = saveData.character.class;
            if (classData) {
                let startingSkills = classData.starting_skills || [];
                if (classData.name === 'Scientist' && saveData.scientistMasterSkill) {
                    const skillChain = getSkillAndPrerequisites(saveData.scientistMasterSkill);
                    startingSkills = [...new Set([...startingSkills, ...skillChain])];
                }
                updateData('character.skills', {
                    trained: startingSkills.filter(s => ALL_SKILLS.find(sk => sk.name === s)?.tier === 'trained'),
                    expert: startingSkills.filter(s => ALL_SKILLS.find(sk => sk.name === s)?.tier === 'expert'),
                    master: startingSkills.filter(s => ALL_SKILLS.find(sk => sk.name === s)?.tier === 'master'),
                });
            }
        }
        setCurrentStep(s => Math.min(s + 1, 7));
    }, [currentStep, saveData, updateData]);

    const handleBack = useCallback(() => {
        setCurrentStep(s => Math.max(s - 1, 1));
    }, []);

    const handleGoToStep = useCallback((step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
        }
    }, [currentStep]);
    
    return {
        state: {
            currentStep,
            saveData,
            isStepComplete,
        },
        handlers: {
            updateData,
            handleNext,
            handleBack,
            handleGoToStep,
            setSaveData,
        },
    };
};
