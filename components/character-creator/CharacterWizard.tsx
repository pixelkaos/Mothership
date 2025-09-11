import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Character, CharacterSaveData, ClassName, Stat, CharacterClass, CharacterStats, CharacterSaves } from '../../types';
import { initialSaveData, getSkillAndPrerequisites } from '../../utils/character';
import { set } from '../../utils/helpers';
import { rollDice } from '../../utils/dice';
import { ALL_SKILLS, CLASSES_DATA, STARTING_EQUIPMENT_TABLES, PATCHES, PRONOUNS, TRINKETS, FIRST_NAMES, LAST_NAMES } from '../../constants';
import { SplitStatInput, StatInput } from './CharacterManifest';
import { SkillSelector } from '../SkillSelector';
import { generateCharacterBackstory, generateCharacterPortrait } from '../../services/geminiService';
import { CharacterRoller } from '../CharacterRoller';
import { Button } from '../Button';

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


// --- STEP COMPONENTS ---
type StepProps = { 
    saveData: CharacterSaveData; 
    onUpdate: (path: string, value: any) => void; 
    onRollRequest?: (type: 'creation', name: string) => void;
};

const Step1Stats: React.FC<StepProps> = ({ saveData, onUpdate, onRollRequest }) => {
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
                <Button variant="secondary" size="sm" onClick={handleRollAll} className="mt-4">Roll All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-primary/30 p-4"><h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Stats (2d10+25)</h3><div className="flex justify-around">
                    <StatInput id="bs.str" label="Strength" value={saveData.baseStats.strength} onChange={e => onUpdate('baseStats.strength', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.strength') : undefined} />
                    <StatInput id="bs.spd" label="Speed" value={saveData.baseStats.speed} onChange={e => onUpdate('baseStats.speed', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.speed') : undefined} />
                    <StatInput id="bs.int" label="Intellect" value={saveData.baseStats.intellect} onChange={e => onUpdate('baseStats.intellect', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.intellect') : undefined} />
                    <StatInput id="bs.com" label="Combat" value={saveData.baseStats.combat} onChange={e => onUpdate('baseStats.combat', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'stats.combat') : undefined} />
                </div></div>
                <div className="border border-primary/30 p-4"><h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Saves (2d10+10)</h3><div className="flex justify-around">
                    <StatInput id="sv.san" label="Sanity" value={saveData.baseSaves.sanity} onChange={e => onUpdate('baseSaves.sanity', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.sanity') : undefined} />
                    <StatInput id="sv.fer" label="Fear" value={saveData.baseSaves.fear} onChange={e => onUpdate('baseSaves.fear', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.fear') : undefined} />
                    <StatInput id="sv.bdy" label="Body" value={saveData.baseSaves.body} onChange={e => onUpdate('baseSaves.body', parseInt(e.target.value))} tooltipContent="" onRollRequest={onRollRequest ? () => onRollRequest('creation', 'saves.body') : undefined} />
                </div></div>
            </div>
        </div>
    );
};

const Step2Class: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character, baseStats, baseSaves, androidPenalty, scientistBonus } = saveData;
    
    const handleSelectClass = (c: CharacterClass) => {
        onUpdate('character.class', c);
        if (c.name !== 'Android') onUpdate('androidPenalty', null);
        if (c.name !== 'Scientist') onUpdate('scientistBonus', null);

        const traumaNote = `Trauma Response: ${c.trauma_response}`;
        const existingNotes = saveData.character.notes || '';
        const traumaRegex = /^Trauma Response: .*\n*(\r\n)*/;
        const userNotes = existingNotes.replace(traumaRegex, '').trim();
        const newNotes = userNotes ? `${traumaNote}\n\n${userNotes}` : traumaNote;
        onUpdate('character.notes', newNotes);
    };

    const StatRow: React.FC<{ label: string; base: number; modifier: number }> = ({ label, base, modifier }) => (
        <div className="grid grid-cols-4 items-center text-center py-1.5">
            <span className="text-left font-bold uppercase tracking-wider text-sm">{label}</span>
            <span className="text-muted">{base}</span>
            <span className={modifier > 0 ? 'text-positive' : modifier < 0 ? 'text-negative' : 'text-muted'}>
                {modifier > 0 ? `+${modifier}` : modifier !== 0 ? modifier : '—'}
            </span>
            <span className="font-bold text-primary text-lg">{base + modifier}</span>
        </div>
    );
    
    const calculateModifier = (type: 'stat' | 'save', name: string) => {
        if (!character.class) return 0;
        let mod = 0;
        if (type === 'stat') {
            mod = character.class.stats_mods[name as keyof CharacterStats] || 0;
            if (character.class.name === 'Android' && androidPenalty === name) {
                mod -= 10;
            }
            if (character.class.name === 'Scientist' && scientistBonus === name) {
                mod += 5;
            }
        } else {
             mod = character.class.saves_mods[name as keyof CharacterSaves] || 0;
        }
        return mod;
    };
    
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Class Selection</h2><p className="text-muted mt-2">Your class determines your role, special abilities, and how you handle trauma.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {CLASSES_DATA.map(classData => {
                    const isSelected = saveData.character.class?.name === classData.name;
                    return (
                        <Button 
                            key={classData.name} 
                            variant="tertiary" 
                            size="sm"
                            onClick={() => handleSelectClass(classData)} 
                            className={`p-4 h-full text-left normal-case items-start ${isSelected ? 'bg-tertiary text-background' : ''}`}
                        >
                            <div>
                                <h4 className="font-bold text-lg uppercase text-secondary">{classData.name}</h4>
                                <p className="text-xs text-muted mt-2">Trauma: {classData.trauma_response}</p>
                            </div>
                        </Button>
                    );
                })}
            </div>
            {saveData.character.class?.name === 'Android' && (<div className="border border-primary/30 p-4"><h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Android Penalty (-10)</h4><p className="text-xs text-muted mb-3">Choose one stat to reduce by 10.</p><div className="flex gap-4">
                {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => 
                    <Button 
                        key={stat}
                        variant="tertiary"
                        size="sm"
                        onClick={() => onUpdate('androidPenalty', stat)}
                        className={`flex-1 flex flex-col items-center justify-center p-3 normal-case ${saveData.androidPenalty === stat ? 'bg-tertiary text-background' : ''}`}
                    >
                        <span className="uppercase text-sm tracking-wider">{stat}</span>
                        <span className="font-bold text-2xl mt-1">{saveData.baseStats[stat]}</span>
                    </Button>
                )}
            </div></div>)}
            {saveData.character.class?.name === 'Scientist' && (<div className="border border-primary/30 p-4"><h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Scientist Bonus (+5)</h4><p className="text-xs text-muted mb-3">Choose one stat to improve by 5.</p><div className="flex gap-4">
                 {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => 
                    <Button 
                        key={stat}
                        variant="tertiary"
                        size="sm"
                        onClick={() => onUpdate('scientistBonus', stat)}
                        className={`flex-1 flex flex-col items-center justify-center p-3 normal-case ${saveData.scientistBonus === stat ? 'bg-tertiary text-background' : ''}`}
                    >
                        <span className="uppercase text-sm tracking-wider">{stat}</span>
                        <span className="font-bold text-2xl mt-1">{saveData.baseStats[stat]}</span>
                    </Button>
                )}
            </div></div>)}

            {character.class && (
                <div className="mt-8 border-t border-primary/50 pt-6">
                    <h3 className="text-lg font-bold text-primary uppercase tracking-wider text-center mb-4">Stat & Save Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-2xl mx-auto bg-black/30 p-4">
                        <div>
                             <div className="grid grid-cols-4 items-center text-center py-1.5 border-b border-muted/30 mb-2">
                                <span className="text-left font-bold uppercase tracking-wider text-xs text-muted">Stat</span>
                                <span className="text-xs text-muted">Base</span>
                                <span className="text-xs text-muted">Mod</span>
                                <span className="text-xs text-muted">Final</span>
                            </div>
                            <StatRow label="Strength" base={baseStats.strength} modifier={calculateModifier('stat', 'strength')} />
                            <StatRow label="Speed" base={baseStats.speed} modifier={calculateModifier('stat', 'speed')} />
                            <StatRow label="Intellect" base={baseStats.intellect} modifier={calculateModifier('stat', 'intellect')} />
                            <StatRow label="Combat" base={baseStats.combat} modifier={calculateModifier('stat', 'combat')} />
                        </div>
                        <div>
                             <div className="grid grid-cols-4 items-center text-center py-1.5 border-b border-muted/30 mb-2">
                                <span className="text-left font-bold uppercase tracking-wider text-xs text-muted">Save / Vital</span>
                                <span className="text-xs text-muted">Base</span>
                                <span className="text-xs text-muted">Mod</span>
                                <span className="text-xs text-muted">Final</span>
                            </div>
                            <StatRow label="Sanity" base={baseSaves.sanity} modifier={calculateModifier('save', 'sanity')} />
                            <StatRow label="Fear" base={baseSaves.fear} modifier={calculateModifier('save', 'fear')} />
                            <StatRow label="Body" base={baseSaves.body} modifier={calculateModifier('save', 'body')} />
                            <div className="col-span-4 my-2 border-t border-muted/30"></div>
                            <StatRow label="Wounds" base={2} modifier={character.class?.max_wounds_mod || 0} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Step3Vitals: React.FC<StepProps> = ({ saveData, onUpdate, onRollRequest }) => {
    const char = saveData.character;
    const maxWounds = 2 + (char.class?.max_wounds_mod || 0);
    
    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Vitals & Condition</h2><p className="text-muted mt-2">Determine your starting health and condition. You can roll for max health or enter a value.</p></div>
            <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                 <StatInput
                    id="health.max"
                    label="Max Health (1d10+10)"
                    value={char.health.max}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onUpdate('character.health.max', val);
                        onUpdate('character.health.current', val);
                    }}
                    tooltipContent="Your maximum health. Current health will be set to this value."
                    onRollRequest={onRollRequest ? () => onRollRequest('creation', 'health.max') : undefined}
                />
                <div className="flex gap-8">
                    <SplitStatInput
                        label="Wounds"
                        id="wounds"
                        currentValue={char.wounds.current}
                        maxValue={maxWounds}
                        onCurrentChange={e => onUpdate('character.wounds.current', parseInt(e.target.value))}
                        onMaxChange={() => {}} // Read-only
                        isMaxReadOnly={true}
                        tooltipContent="The number of critical injuries you can sustain before dying. Maximum is based on your class."
                    />
                    <StatInput id="stress" label="Stress" value={char.stress.current} onChange={e => onUpdate('character.stress.current', parseInt(e.target.value))} tooltipContent="Your accumulated anxiety. Starts at 2." />
                </div>
            </div>
        </div>
    );
};

const Step4Skills: React.FC<StepProps> = ({ saveData, onUpdate }) => {
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

const Step5Equipment: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { equipment, credits, class: charClass } = saveData.character;

    const handleRollLoadout = () => {
        if (!charClass) return;
        const equipmentTable = STARTING_EQUIPMENT_TABLES[charClass.name];
        const rolledEquipment = equipmentTable[Math.floor(Math.random() * equipmentTable.length)];
        onUpdate('character.equipment.loadout', rolledEquipment);
        onUpdate('character.equipment.trinket', TRINKETS[Math.floor(Math.random() * TRINKETS.length)]);
        onUpdate('character.equipment.patch', PATCHES[Math.floor(Math.random() * PATCHES.length)]);
        onUpdate('character.credits', rollDice('5d10'));
    };

    const handleTakeCredits = () => {
        if (!charClass) return;
        onUpdate('character.equipment.loadout', 'Custom Gear Selection');
        onUpdate('character.equipment.trinket', TRINKETS[Math.floor(Math.random() * TRINKETS.length)]);
        onUpdate('character.equipment.patch', PATCHES[Math.floor(Math.random() * PATCHES.length)]);
        onUpdate('character.credits', rollDice('5d10*10'));
    };

    const handleReset = () => {
        onUpdate('character.equipment.loadout', '');
        onUpdate('character.equipment.trinket', '');
        onUpdate('character.equipment.patch', '');
        onUpdate('character.credits', 0);
    };

    if (!charClass) {
        return <p className="text-muted text-center">Go back and select a class to see equipment options.</p>;
    }

    if (equipment.loadout) {
        return (
            <div className="space-y-6 text-center">
                 <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Equipment Manifest</h2>
                 <div className="text-center border border-primary/50 pt-6 mt-6 space-y-2 text-sm bg-black/30 p-4">
                    <p className="text-lg text-foreground">{equipment.loadout}</p>
                    <div className="pt-4 mt-4 border-t border-muted/50 flex flex-col sm:flex-row justify-around gap-2">
                        <p><strong className="text-primary/80">Trinket:</strong> {equipment.trinket}</p>
                        <p><strong className="text-primary/80">Patch:</strong> {equipment.patch}</p>
                        <p><strong className="text-primary/80">Credits:</strong> {credits}</p>
                    </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleReset} className="mt-4">
                    Reset Choice
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Starting Equipment</h2>
                <p className="text-muted mt-2 max-w-2xl mx-auto">Choose how to equip your character. You can either take a pre-rolled package with some pocket money, or a larger starting fund to buy your own gear from the ship's store later.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-primary/50 p-6 flex flex-col text-center bg-black/30 h-full">
                    <h3 className="text-xl font-bold text-secondary uppercase tracking-wider">Option 1: Roll for Loadout</h3>
                    <p className="text-muted text-sm my-4 flex-grow">Receive a random, class-specific equipment package. You'll be ready for action immediately. Also includes a random trinket, patch, and pocket money.</p>
                    <p className="font-bold text-primary mb-4">Credits: 5d10</p>
                    <Button onClick={handleRollLoadout} className="w-full mt-auto">
                        Roll Loadout
                    </Button>
                </div>
                <div className="border border-primary/50 p-6 flex flex-col text-center bg-black/30 h-full">
                    <h3 className="text-xl font-bold text-secondary uppercase tracking-wider">Option 2: Purchase Gear</h3>
                    <p className="text-muted text-sm my-4 flex-grow">Forgo the random package for a substantial starting fund. You'll need to purchase all your gear, from armor to weapons. Also includes a random trinket and patch.</p>
                    <p className="font-bold text-primary mb-4">Credits: 5d10 x 10</p>
                     <Button onClick={handleTakeCredits} className="w-full mt-auto">
                        Take Credits
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Step6Style: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character } = saveData;
    const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
    const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);

    const handleRandomizeIdentity = async () => {
        setIsGeneratingIdentity(true);
        try {
            const randomFirstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
            const randomLastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
            const randomName = `${randomFirstName} ${randomLastName}`;
            const randomPronouns = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
            
            onUpdate('character.name', randomName);
            onUpdate('character.pronouns', randomPronouns);
            
            const tempCharacterForBackstory = { ...character, name: randomName, pronouns: randomPronouns };
            const backstory = await generateCharacterBackstory(tempCharacterForBackstory);
            onUpdate('character.backstory', backstory);
        } catch(e) {
            alert("AI identity generation failed. Please try again.");
        } finally {
            setIsGeneratingIdentity(false);
        }
    };
    
    const handleGeneratePortrait = async () => {
        setIsGeneratingPortrait(true);
        try {
            let prompt = `A vibrant cyberpunk illustration in a comic book anime style of a Mothership RPG character. A ${character.class?.name}. Pronouns: ${character.pronouns}.`;
            const imageUrl = await generateCharacterPortrait(prompt);
            onUpdate('character.portrait', imageUrl);
        } catch(e) {
            alert("AI portrait generation failed. Please try again.");
        } finally {
            setIsGeneratingPortrait(false);
        }
    };
    
    const handleUploadPortrait = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                onUpdate('character.portrait', e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <div className="text-center"><h2 className="text-2xl font-bold text-primary uppercase tracking-wider">Character Style</h2><p className="text-muted mt-2">Define your character's identity. Use the AI to generate a portrait and backstory based on your choices.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                    <div className="text-right -mb-2">
                        <Button variant="secondary" size="sm" onClick={handleRandomizeIdentity} disabled={isGeneratingIdentity}>
                            {isGeneratingIdentity ? 'Generating...' : 'Randomize Identity'}
                        </Button>
                    </div>
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
                        {(isGeneratingIdentity || isGeneratingPortrait) && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-primary animate-pulse">{isGeneratingPortrait ? 'Rendering...' : 'Writing...'}</div>}
                    </div>
                     <Button variant="secondary" size="sm" onClick={handleGeneratePortrait} disabled={isGeneratingPortrait} className="w-48">
                        {isGeneratingPortrait ? 'Generating...' : 'Generate Portrait'}
                    </Button>
                    <Button as="label" variant="tertiary" size="sm" className="w-48 cursor-pointer">
                        Upload Portrait
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadPortrait} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Step7Manifest: React.FC<{saveData: CharacterSaveData, onGoToStep: (step: number) => void}> = ({ saveData, onGoToStep }) => {
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