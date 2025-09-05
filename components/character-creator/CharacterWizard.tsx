
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Character, CharacterSaveData, ClassName, Stat, CharacterClass } from '../../types';
import { initialSaveData } from '../../utils/character';
import { set } from '../../utils/helpers';
import { rollDice } from '../../utils/dice';
import { ALL_SKILLS, CLASSES_DATA, LOADOUTS, PATCHES, PRONOUNS, SCIENTIST_SKILL_CHOICES, TRINKETS } from '../../constants';
import { SplitStatInput, StatInput } from './CharacterManifest';
import { SkillSelector } from '../SkillSelector';
import { generateCharacterBackstory, generateCharacterPortrait } from '../../services/geminiService';

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
        <button
            onClick={onBack}
            disabled={isBackDisabled}
            className="px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed disabled:border-secondary/50 disabled:text-secondary/50 disabled:cursor-not-allowed"
        >
            Back
        </button>
        <button
            onClick={isLastStep ? onFinish : onNext}
            disabled={isNextDisabled}
            className="px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary/50 disabled:text-background/70 disabled:cursor-not-allowed"
        >
            {isLastStep ? 'Finalize Character' : 'Next'}
        </button>
    </div>
);

// --- WIZARD COMPONENT ---
export const CharacterWizard: React.FC<{
    onComplete: (data: CharacterSaveData) => void;
    onExit: () => void;
}> = ({ onComplete, onExit }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [saveData, setSaveData] = useState<CharacterSaveData>(JSON.parse(JSON.stringify(initialSaveData)));

    const updateData = useCallback((path: string, value: any) => {
        setSaveData(prev => {
            const newSaveData = JSON.parse(JSON.stringify(prev));
            set(newSaveData, path, value);
            return newSaveData;
        });
    }, []);
    
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
                updateData('character.skills', {
                    trained: classData.starting_skills || [],
                    expert: [],
                    master: []
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
    
    // Auto-roll equipment for selected loadout
    useEffect(() => {
        if(saveData.character.equipment.loadout) {
            updateData('character.equipment.trinket', TRINKETS[Math.floor(Math.random() * TRINKETS.length)]);
            updateData('character.equipment.patch', PATCHES[Math.floor(Math.random() * PATCHES.length)]);
            updateData('character.credits', rollDice('5d10') * 10);
        }
    }, [saveData.character.equipment.loadout]);

    return (
        <div className="max-w-4xl mx-auto border border-primary/50 p-6 sm:p-8 bg-black/30">
            <Stepper currentStep={currentStep} steps={STEPS} onGoToStep={handleGoToStep} />
            <div className="min-h-[400px]">
                {/* Render current step's component */}
                {currentStep === 1 && <Step1Stats saveData={saveData} onUpdate={updateData} />}
                {currentStep === 2 && <Step2Class saveData={saveData} onUpdate={updateData} />}
                {currentStep === 3 && <Step3Vitals saveData={saveData} onUpdate={updateData} />}
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
        </div>
    );
};


// --- STEP COMPONENTS ---
type StepProps = { saveData: CharacterSaveData; onUpdate: (path: string, value: any) => void; };

const Step1Stats: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const handleRollAll = () => {
        onUpdate('baseStats.strength', rollDice('2d10+25'));
        onUpdate('baseStats.speed', rollDice('2d10+25'));
        onUpdate('baseStats.intellect', rollDice('2d10+25'));
        onUpdate('baseStats.combat', rollDice('2d10+25'));
        onUpdate('baseSaves.sanity', rollDice('2d10+10'));
        onUpdate('baseSaves.fear', rollDice('2d10+10'));
        onUpdate('baseSaves.body', rollDice('2d10+10'));
    };
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Stats & Saves</h2>
                <p className="text-muted mt-2">Roll your base stats and saves. These will be modified by your class later.</p>
                <button onClick={handleRollAll} className="mt-4 px-4 py-2 text-sm uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background">Roll All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-primary/30 p-4"><h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Stats (2d10+25)</h3><div className="flex justify-around">
                    <StatInput id="bs.str" label="Strength" value={saveData.baseStats.strength} onChange={e => onUpdate('baseStats.strength', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="bs.spd" label="Speed" value={saveData.baseStats.speed} onChange={e => onUpdate('baseStats.speed', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="bs.int" label="Intellect" value={saveData.baseStats.intellect} onChange={e => onUpdate('baseStats.intellect', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="bs.com" label="Combat" value={saveData.baseStats.combat} onChange={e => onUpdate('baseStats.combat', parseInt(e.target.value))} tooltipContent="" />
                </div></div>
                <div className="border border-primary/30 p-4"><h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Saves (2d10+10)</h3><div className="flex justify-around">
                    <StatInput id="sv.san" label="Sanity" value={saveData.baseSaves.sanity} onChange={e => onUpdate('baseSaves.sanity', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="sv.fer" label="Fear" value={saveData.baseSaves.fear} onChange={e => onUpdate('baseSaves.fear', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="sv.bdy" label="Body" value={saveData.baseSaves.body} onChange={e => onUpdate('baseSaves.body', parseInt(e.target.value))} tooltipContent="" />
                </div></div>
            </div>
        </div>
    );
};

const Step2Class: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const handleSelectClass = (c: CharacterClass) => {
        onUpdate('character.class', c);
        if (c.name !== 'Android') onUpdate('androidPenalty', null);
        if (c.name !== 'Scientist') onUpdate('scientistBonus', null);
    };
    const tertiarySelectionClasses = (isSelected: boolean) => isSelected ? 'bg-tertiary text-background border border-tertiary' : 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background';
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Class Selection</h2><p className="text-muted mt-2">Your class determines your role, special abilities, and how you handle trauma.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CLASSES_DATA.map(classData => <button key={classData.name} onClick={() => handleSelectClass(classData)} className={`p-4 text-left transition-colors ${saveData.character.class?.name === classData.name ? tertiarySelectionClasses(true) : tertiarySelectionClasses(false)}`}><h4 className="font-bold text-lg uppercase text-secondary">{classData.name}</h4><p className="text-xs text-muted mt-2">Trauma: {classData.trauma_response}</p></button>)}
            </div>
            {saveData.character.class?.name === 'Android' && (<div className="border border-primary/30 p-4"><h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Android Penalty (-10)</h4><p className="text-xs text-muted mb-3">Choose one stat to reduce by 10.</p><div className="flex gap-4">
                {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => <button key={stat} onClick={() => onUpdate('androidPenalty', stat)} className={`flex-1 p-2 uppercase ${tertiarySelectionClasses(saveData.androidPenalty === stat)}`}>{stat}</button>)}
            </div></div>)}
            {saveData.character.class?.name === 'Scientist' && (<div className="border border-primary/30 p-4"><h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Scientist Bonus (+5)</h4><p className="text-xs text-muted mb-3">Choose one stat to improve by 5.</p><div className="flex gap-4">
                {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => <button key={stat} onClick={() => onUpdate('scientistBonus', stat)} className={`flex-1 p-2 uppercase ${tertiarySelectionClasses(saveData.scientistBonus === stat)}`}>{stat}</button>)}
            </div></div>)}
        </div>
    );
};

const Step3Vitals: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const char = saveData.character;
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Vitals & Condition</h2><p className="text-muted mt-2">Determine your starting health and condition. You can roll for max health or enter a value.</p></div>
            <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                <div className="flex flex-col items-center"><h3 className="text-sm uppercase tracking-wider mb-2 text-muted">Max Health (1d10+10)</h3>
                    <div className="flex items-center gap-2">
                        <input type="number" className="w-24 bg-transparent border border-muted p-2 text-center text-2xl focus:border-primary focus:ring-0" value={char.health.max || ''} onChange={e => onUpdate('character.health.max', parseInt(e.target.value))} />
                        <button onClick={() => { const val = rollDice('1d10+10'); onUpdate('character.health.max', val); onUpdate('character.health.current', val); }} className="px-3 py-2 text-xs uppercase tracking-widest border border-secondary text-secondary hover:bg-secondary hover:text-background">Roll</button>
                    </div>
                </div>
                <div className="flex gap-8">
                    <StatInput id="wounds" label="Wounds" value={char.wounds.current} onChange={e => onUpdate('character.wounds.current', parseInt(e.target.value))} tooltipContent="" />
                    <StatInput id="stress" label="Stress" value={char.stress.current} onChange={e => onUpdate('character.stress.current', parseInt(e.target.value))} tooltipContent="" />
                </div>
            </div>
        </div>
    );
};

const Step4Skills: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character } = saveData;
    if (!character.class) return <p className="text-muted text-center">Go back and select a class to continue.</p>;
    return (
        <div>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Skill Selection</h2><p className="text-muted mt-2">Spend your skill points based on your chosen class.</p></div>
            <SkillSelector characterClass={character.class} allSkills={ALL_SKILLS} selectedSkills={character.skills} onSkillsChange={skills => onUpdate('character.skills', skills)} />
        </div>
    );
};

const Step5Equipment: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { equipment, credits } = saveData.character;
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Equipment</h2><p className="text-muted mt-2">Choose a starting loadout. Your trinket, patch, and credits will be assigned.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LOADOUTS.map(loadout => {
                    const name = loadout.split(':')[0];
                    return <button key={name} onClick={() => onUpdate('character.equipment.loadout', loadout)} className={`p-4 border text-left transition-colors ${equipment.loadout === loadout ? 'bg-primary text-background border-primary' : 'bg-transparent border-tertiary text-tertiary hover:bg-tertiary hover:text-background'}`}>
                        <h4 className="font-bold text-lg uppercase text-secondary">{name}</h4>
                        <p className="text-xs text-muted mt-2">{loadout.split(': ')[1]}</p>
                    </button>
                })}
            </div>
            {equipment.loadout && <div className="text-center border-t border-primary/50 pt-6 mt-6 space-y-2 text-sm">
                <p><strong className="text-primary/80">Trinket:</strong> {equipment.trinket}</p>
                <p><strong className="text-primary/80">Patch:</strong> {equipment.patch}</p>
                <p><strong className="text-primary/80">Credits:</strong> {credits}</p>
            </div>}
        </div>
    );
};

const Step6Style: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character } = saveData;
    const [isGenerating, setIsGenerating] = useState(false);
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const backstory = await generateCharacterBackstory(character);
            onUpdate('character.backstory', backstory);
            let prompt = `A vibrant cyberpunk illustration of a Mothership RPG character. A ${character.class?.name}. Pronouns: ${character.pronouns}.`;
            const imageUrl = await generateCharacterPortrait(prompt);
            onUpdate('character.portrait', imageUrl);
        } catch(e) {
            alert("AI generation failed. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Character Style</h2><p className="text-muted mt-2">Define your character's identity. Use the AI to generate a portrait and backstory based on your choices.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <input type="text" placeholder="Name" className="w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" value={character.name} onChange={e => onUpdate('character.name', e.target.value)} />
                    <select className="w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" value={character.pronouns} onChange={e => onUpdate('character.pronouns', e.target.value)}>
                        <option value="" disabled>Select Pronouns</option>
                        {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <textarea placeholder="Backstory (or let the AI write one!)" rows={8} className="w-full bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" value={character.backstory} onChange={e => onUpdate('character.backstory', e.target.value)} />
                </div>
                <div className="flex flex-col items-center gap-4">
                    <div className="aspect-square w-48 bg-black/50 border border-muted flex items-center justify-center relative overflow-hidden">
                        {character.portrait ? <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover"/> : <span className="text-muted text-xs">No Portrait</span>}
                        {isGenerating && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-primary animate-pulse">Generating...</div>}
                    </div>
                    <button onClick={handleGenerate} disabled={isGenerating} className="w-48 px-4 py-2 text-sm uppercase border border-secondary text-secondary hover:bg-secondary hover:text-background disabled:opacity-50">AI Generate</button>
                </div>
            </div>
        </div>
    );
};

const Step7Manifest: React.FC<{saveData: CharacterSaveData, onGoToStep: (step: number) => void}> = ({ saveData, onGoToStep }) => {
    const { character } = saveData;
    const EditButton = ({step}: {step: number}) => <button onClick={() => onGoToStep(step)} className="text-xs text-secondary hover:text-primary">[Edit]</button>;
    return (
        <div>
            <div className="text-center mb-6"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Final Manifest</h2><p className="text-muted mt-2">Review your character. You can go back to any previous step to make changes.</p></div>
            <div className="space-y-4 text-sm">
                <p><strong>Name:</strong> {character.name} ({character.pronouns}) <EditButton step={6} /></p>
                <p><strong>Class:</strong> {character.class?.name} <EditButton step={2} /></p>
                <p><strong>Stats:</strong> Str {character.stats.strength}, Spd {character.stats.speed}, Int {character.stats.intellect}, Com {character.stats.combat} <EditButton step={1} /></p>
                <p><strong>Saves:</strong> Sanity {character.saves.sanity}, Fear {character.saves.fear}, Body {character.saves.body} <EditButton step={1} /></p>
                <p><strong>Health:</strong> {character.health.current}/{character.health.max} | <strong>Wounds:</strong> {character.wounds.current}/{character.wounds.max} | <strong>Stress:</strong> {character.stress.current} <EditButton step={3} /></p>
                <p><strong>Skills ({character.skills.trained.length + character.skills.expert.length + character.skills.master.length}):</strong> {[...character.skills.trained, ...character.skills.expert, ...character.skills.master].join(', ')} <EditButton step={4} /></p>
                <p><strong>Equipment:</strong> {character.equipment.loadout.split(':')[0]} Loadout, {character.equipment.trinket}, {character.equipment.patch}, {character.credits}c <EditButton step={5} /></p>
            </div>
        </div>
    );
};
