
import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { CharacterSaveData } from '../../types';
import { initialSaveData, getSkillAndPrerequisites } from '../../utils/character';
import { set } from '../../utils/helpers';
import { ALL_SKILLS } from '../../constants';
import { CharacterRoller } from '../CharacterRoller';
import { Button } from '../Button';
import { Step1Stats } from './wizard-steps/Step1Stats';
import { Step2Class } from './wizard-steps/Step2Class';
import { Step3Vitals } from './wizard-steps/Step3Vitals';
import { Step4Skills } from './wizard-steps/Step4Skills';
import { Step5Equipment } from './wizard-steps/Step5Equipment';
import { Step6Style } from './wizard-steps/Step6Style';
import { Step7Manifest } from './wizard-steps/Step7Manifest';


const STEPS = [
    { id: 1, name: 'Stats & Saves' },
    { id: 2, name: 'Class' },
    { id: 3, name: 'Vitals & Condition' },
    { id: 4, name: 'Skills' },
    { id: 5, name: 'Equipment' },
    { id: 6, name: 'Style' },
    { id: 7, name: 'Manifest' }
];

const Stepper: React.FC<{ currentStep: number; steps: typeof STEPS, onGoToStep: (step: number) => void }> = ({ currentStep, steps, onGoToStep }) => {
    return (
        <nav className="mb-8" aria-label="Character creation steps">
            <ol className="flex items-center justify-center gap-2 sm:gap-4">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    return (
                        <li key={step.id} className="relative flex-1">
                            <div className="flex items-center text-sm">
                                <button
                                    onClick={() => isCompleted && onGoToStep(step.id)}
                                    disabled={!isCompleted}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                                        isCurrent ? 'bg-primary text-background' : isCompleted ? 'bg-primary/50 text-background hover:bg-primary/80' : 'bg-muted/30 text-muted'
                                    }`}
                                >
                                    {step.id}
                                </button>
                                <p className={`ml-2 hidden text-xs sm:block font-medium uppercase tracking-wider ${isCurrent || isCompleted ? 'text-primary' : 'text-muted'}`}>{step.name}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`absolute top-1/2 -right-1/2 w-full h-0.5 transform -translate-y-1/2 ${isCompleted ? 'bg-primary/50' : 'bg-muted/30'}`} />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

const WizardControls: React.FC<{
    onBack: () => void;
    onNext: () => void;
    onFinish: () => void;
    isBackDisabled: boolean;
    isNextDisabled: boolean;
    isLastStep: boolean;
}> = ({ onBack, onNext, onFinish, isBackDisabled, isNextDisabled, isLastStep }) => (
    <div className="mt-8 flex justify-between border-t border-primary/50 pt-6">
        <Button
            variant="secondary"
            onClick={onBack}
            disabled={isBackDisabled}
        >
            Back
        </Button>
        <Button
            onClick={isLastStep ? onFinish : onNext}
            disabled={isNextDisabled}
        >
            {isLastStep ? 'Finalize Character' : 'Next'}
        </Button>
    </div>
);

// --- WIZARD COMPONENT ---
export const CharacterWizard: React.FC<{
    onComplete: (data: CharacterSaveData) => void;
    onExit: () => void;
}> = ({ onComplete, onExit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [saveData, setSaveData] = useState<CharacterSaveData>(JSON.parse(JSON.stringify(initialSaveData)));
    
    const [rollerState, setRollerState] = useState({
        isVisible: false,
        isMinimized: false,
        position: { x: window.innerWidth - 420, y: 100 },
        activeCheck: null as { type: 'stat' | 'save' | 'wound' | 'panic' | 'creation', name: string } | null,
    });
    const lastPositionRef = useRef(rollerState.position);

    const handleRollerStateChange = useCallback((newState: Partial<typeof rollerState>) => {
        setRollerState(prev => {
            const updatedState = { ...prev, ...newState };
            if (newState.position) lastPositionRef.current = newState.position;
            if (newState.isVisible === false) {
                lastPositionRef.current = prev.position;
                updatedState.activeCheck = null;
            }
            return updatedState;
        });
    }, []);

    const handleRollRequest = useCallback((type: 'creation', name: string) => {
        setRollerState(prev => ({
            ...prev,
            isVisible: true,
            isMinimized: false,
            position: lastPositionRef.current,
            activeCheck: { type, name },
        }));
    }, []);


    const updateData = useCallback((path: string, value: any) => {
        setSaveData(prev => {
            const newSaveData = JSON.parse(JSON.stringify(prev));
            set(newSaveData, path, value);
            return newSaveData;
        });
    }, []);

     const handleApplyRoll = useCallback((path: string, value: number) => {
        const newPath = path.replace('stats.', 'baseStats.').replace('saves.', 'baseSaves.').replace('health.max', 'character.health.max');
        updateData(newPath, value);
        if (path === 'health.max') {
            updateData('character.health.current', value);
        }
        setRollerState(prev => ({ ...prev, activeCheck: null, isVisible: false }));
    }, [updateData]);
    
    // --- Validation Logic ---
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
                // This is a simplified check. A more robust implementation would check skill point counts.
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

    const handleNext = () => {
        // Class change invalidates skills
        if (currentStep === 2) {
            const classData = saveData.character.class;
            if (classData) {
                let startingSkills = classData.starting_skills || [];
                // Special handling for Scientist starting skills from master skill choice
                if (classData.name === 'Scientist' && saveData.scientistMasterSkill) {
                    const skillChain = getSkillAndPrerequisites(saveData.scientistMasterSkill);
                    // Filter out duplicates that might be in the chain
                    startingSkills = [...new Set([...startingSkills, ...skillChain])];
                }
                updateData('character.skills', {
                    trained: startingSkills.filter(s => {
                        const skillDef = ALL_SKILLS.find(sk => sk.name === s);
                        return skillDef && skillDef.tier === 'trained';
                    }),
                    expert: startingSkills.filter(s => {
                        const skillDef = ALL_SKILLS.find(sk => sk.name === s);
                        return skillDef && skillDef.tier === 'expert';
                    }),
                    master: startingSkills.filter(s => {
                        const skillDef = ALL_SKILLS.find(sk => sk.name === s);
                        return skillDef && skillDef.tier === 'master';
                    })
                });
            }
        }
        setCurrentStep(s => Math.min(s + 1, STEPS.length));
    };
    const handleBack = () => setCurrentStep(s => Math.max(s - 1, 1));
    const handleGoToStep = (step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
        }
    };

    return (
        <div className="max-w-4xl mx-auto border border-primary/50 p-6 sm:p-8 bg-black/30">
            <Stepper currentStep={currentStep} steps={STEPS} onGoToStep={handleGoToStep} />
            <div className="min-h-[400px]">
                {/* Render current step's component */}
                {currentStep === 1 && <Step1Stats saveData={saveData} onUpdate={updateData} onRollRequest={handleRollRequest} />}
                {currentStep === 2 && <Step2Class saveData={saveData} onUpdate={updateData} />}
                {currentStep === 3 && <Step3Vitals saveData={saveData} onUpdate={updateData} onRollRequest={handleRollRequest} />}
                {currentStep === 4 && <Step4Skills saveData={saveData} onUpdate={updateData} />}
                {currentStep === 5 && <Step5Equipment saveData={saveData} onUpdate={updateData} />}
                {currentStep === 6 && <Step6Style saveData={saveData} onUpdate={updateData} />}
                {currentStep === 7 && <Step7Manifest saveData={saveData} onGoToStep={handleGoToStep}/>}
            </div>
            <WizardControls
                onBack={handleBack}
                onNext={handleNext}
                onFinish={() => onComplete(saveData)}
                isBackDisabled={currentStep === 1}
                isNextDisabled={!isStepComplete}
                isLastStep={currentStep === STEPS.length}
            />
            <CharacterRoller
                character={saveData.character}
                onUpdate={() => {}} // Not needed for creation
                isVisible={rollerState.isVisible}
                isMinimized={rollerState.isMinimized}
                initialPosition={rollerState.position}
                onStateChange={handleRollerStateChange}
                activeCheck={rollerState.activeCheck}
                onApplyRoll={handleApplyRoll}
            />
        </div>
    );
};
