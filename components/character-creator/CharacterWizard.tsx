
import React, { useState, useCallback, useRef } from 'react';
import type { CharacterSaveData } from '../../types';
import { CharacterRoller } from '../CharacterRoller';
import { Button } from '../Button';
import { useCharacterWizard } from '../../hooks/useCharacterWizard';
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
            {isLastStep ? 'Finalize Character' : 'Finish'}
        </Button>
    </div>
);

// --- WIZARD COMPONENT ---
export const CharacterWizard: React.FC<{
    onComplete: (data: CharacterSaveData) => void;
    onExit: () => void;
}> = ({ onComplete, onExit }) => {
    const { state, handlers } = useCharacterWizard();
    const { currentStep, saveData, isStepComplete } = state;
    const { updateData, handleNext, handleBack, handleGoToStep } = handlers;
    
    const [rollerState, setRollerState] = useState({
        isVisible: false,
        isMinimized: false,
        position: { x: window.innerWidth - 420, y: 100 },
        activeCheck: null as { type: 'creation', name: string } | null,
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

    const handleApplyRoll = useCallback((path: string, value: number) => {
        const newPath = path.replace('stats.', 'baseStats.').replace('saves.', 'baseSaves.').replace('health.max', 'character.health.max');
        updateData(newPath, value);
        if (path === 'health.max') {
            updateData('character.health.current', value);
        }
        setRollerState(prev => ({ ...prev, activeCheck: null, isVisible: false }));
    }, [updateData]);

    return (
        <div className="max-w-4xl mx-auto border border-primary/50 p-6 sm:p-8 bg-black/30">
            <Stepper currentStep={currentStep} steps={STEPS} onGoToStep={handleGoToStep} />
            <div className="min-h-[400px]">
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
                onUpdate={() => {}} 
                isVisible={rollerState.isVisible}
                isMinimized={rollerState.isMinimized}
                initialPosition={rollerState.position}
                onStateChange={handleRollerStateChange}
                activeCheck={rollerState.activeCheck as any}
                onApplyRoll={handleApplyRoll}
            />
        </div>
    );
};