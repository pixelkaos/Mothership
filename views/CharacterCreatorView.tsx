

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Character, CharacterClass, CharacterSaveData, ClassName, SkillDefinition, SkillTier, Stat } from '../types';
import { ALL_SKILLS, CLASSES_DATA, LOADOUTS, TRINKETS, PATCHES, SCIENTIST_SKILL_CHOICES, FIRST_NAMES, LAST_NAMES, PRONOUNS } from '../constants';
import { rollDice } from '../utils/dice';
import { set } from '../utils/helpers';
import { SkillSelector } from '../components/SkillSelector';
import { useTooltip } from '../components/Tooltip';
import { CharacterRoller } from '../components/CharacterRoller';


const initialCharacter: Character = {
    name: '',
    pronouns: '',
    notes: '',
    stats: { strength: 0, speed: 0, intellect: 0, combat: 0 },
    saves: { sanity: 0, fear: 0, body: 0 },
    class: null,
    health: { current: 0, max: 0 },
    wounds: { current: 0, max: 2 },
    stress: { current: 2, minimum: 2 },
    skills: { trained: [], expert: [], master: [] },
    equipment: { loadout: '', trinket: '', patch: '' },
    credits: 0,
};

const STAT_DESCRIPTIONS: { [key: string]: React.ReactNode } = {
    'Strength': "Represents physical power, lifting capacity, and melee damage. Crucial for Body Saves and physically demanding tasks.",
    'Speed': "Determines agility, reaction time, and movement. Important for avoiding hazards, acting quickly, and piloting.",
    'Intellect': "Measures problem-solving, technical skills, and knowledge. Key for tasks involving computers, science, and resisting mental strain (Sanity Saves).",
    'Combat': "Governs accuracy and effectiveness with ranged weaponry and military tactics. A high Combat stat makes you a deadly shot.",
    'Sanity': "Your ability to rationalize and withstand psychological horrors. When this save fails, you gain Stress. Governs resistance to mental trauma.",
    'Fear': "Your courage and ability to act under pressure. When this save fails, you gain Stress. A low Fear Save makes you more likely to Panic.",
    'Body': "Represents physical resilience and endurance. Governs resistance to pain, poison, disease, and physical trauma.",
    'Health': "Your physical well-being. When this reaches zero, you take a Wound. Wounds are serious injuries that can kill you.",
    'Wounds': "The number of critical injuries you can sustain before dying. All characters start with a base of 2.",
    'Stress': "Your accumulated anxiety and terror. The higher your Stress, the more likely you are to Panic when things go wrong."
};

interface CharacterCreatorViewProps {
  characterData: CharacterSaveData | null;
  onCharacterUpdate: (character: CharacterSaveData | null) => void;
}

const StatInput: React.FC<{
    label: string;
    id: string;
    value: number;
    baseValue?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipContent: React.ReactNode;
    onRollRequest?: () => void;
}> = ({ label, id, value, baseValue, onChange, tooltipContent, onRollRequest }) => {
    const { showTooltip, hideTooltip } = useTooltip();
    
    const fullTooltipContent = useMemo(() => {
        const baseRollInfo = (baseValue !== undefined && value !== baseValue && baseValue !== 0)
            ? <p className="text-xs text-secondary mt-2 italic">The number in brackets is your base roll before class modifiers.</p>
            : null;

        const rollPrompt = onRollRequest ? <p className="text-xs text-primary mt-2 italic">Click anywhere on this component to open the dice roller.</p> : null;

        return (
            <>
                {tooltipContent}
                {baseRollInfo}
                {rollPrompt}
            </>
        );
    }, [tooltipContent, baseValue, value, onRollRequest]);

    const commonClasses = `w-20 h-12 bg-transparent border border-muted text-center text-2xl font-bold text-foreground mt-1 focus:ring-0 focus:outline-none focus:border-primary appearance-none transition-colors group-hover:border-primary`;

    return (
        <div 
            className={`flex flex-col items-center group ${onRollRequest ? 'cursor-pointer' : ''}`}
            onMouseEnter={(e) => showTooltip(fullTooltipContent, e)}
            onMouseLeave={hideTooltip}
            onClick={onRollRequest}
        >
            <span id={`${id}-label`} className="text-xs uppercase text-muted">{label}</span>
            <div className="relative">
                 <input
                    id={id}
                    aria-labelledby={`${id}-label`}
                    type="number"
                    className={commonClasses}
                    value={value || ''}
                    onChange={onChange}
                    placeholder=" "
                    onClick={onRollRequest}
                />
                 {(!value || value === 0) && onRollRequest && (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute inset-0 m-auto h-6 w-6 text-primary/50 pointer-events-none group-hover:text-primary transition-colors">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                )}
                 {baseValue !== undefined && value !== baseValue && baseValue !== 0 && (
                    <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs mt-1 ${value > baseValue ? 'text-positive' : 'text-negative'}`}>
                        ({baseValue})
                    </span>
                )}
            </div>
        </div>
    );
};

const SplitStatInput: React.FC<{
    label: string;
    id: string;
    currentValue: number;
    maxValue: number;
    onCurrentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipContent: React.ReactNode;
    isMaxReadOnly?: boolean;
    onRollRequestCurrent?: () => void;
    onRollRequestMax?: () => void;
}> = ({ label, id, currentValue, maxValue, onCurrentChange, onMaxChange, tooltipContent, isMaxReadOnly = false, onRollRequestCurrent, onRollRequestMax }) => {
    const { showTooltip, hideTooltip } = useTooltip();
    
    const fullTooltipContent = (
        <>
            {tooltipContent}
            {(onRollRequestCurrent || onRollRequestMax) && (
                 <p className="text-xs text-primary mt-2 italic">Click a value to open the dice roller for it or type to edit.</p>
            )}
        </>
    );

    return (
        <div 
            className="flex flex-col items-center group"
            onMouseEnter={(e) => showTooltip(fullTooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            <span id={`${id}-label`} className="text-xs uppercase text-muted mb-1">{label}</span>
            <div className="relative flex items-center w-48 h-16 bg-transparent border border-muted rounded-full group-hover:border-primary transition-colors px-4 overflow-hidden">
                {/* Current Value Input */}
                <input
                    id={`${id}-current`}
                    aria-label={`${label} Current`}
                    type="number"
                    className={`w-1/2 bg-transparent text-center text-3xl font-bold text-foreground focus:ring-0 focus:outline-none appearance-none z-10 ${onRollRequestCurrent ? 'cursor-pointer' : ''}`}
                    value={currentValue || ''}
                    onChange={onCurrentChange}
                    onClick={onRollRequestCurrent}
                    placeholder="0"
                />
                
                {/* Separator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[125%] w-1 bg-muted transform rotate-[25deg] group-hover:bg-primary transition-colors"></div>

                {/* Max Value Input */}
                <input
                    id={`${id}-max`}
                    aria-label={`${label} Maximum`}
                    type="number"
                    className={`w-1/2 bg-transparent text-center text-3xl font-bold text-foreground focus:ring-0 focus:outline-none appearance-none z-10 ${onRollRequestMax ? 'cursor-pointer' : ''} ${isMaxReadOnly ? 'cursor-default' : ''}`}
                    value={maxValue || ''}
                    onChange={onMaxChange}
                    onClick={onRollRequestMax}
                    placeholder="0"
                    readOnly={isMaxReadOnly}
                />
            </div>
             <div className="flex justify-between w-48 mt-1 px-4">
                <span className="text-xs text-muted">Current</span>
                <span className="text-xs text-muted">Maximum</span>
            </div>
        </div>
    );
};


const autoSelectSkills = (characterClass: CharacterClass, allSkills: SkillDefinition[]): Character['skills'] => {
    const BASE_SKILLS = { trained: 2, expert: 1, master: 0 };
    const skillMap = new Map(allSkills.map(s => [s.name, s]));
    
    // Categorize skills by tier
    const categorizedSkills: Record<SkillTier, SkillDefinition[]> = { trained: [], expert: [], master: [] };
    for (const skill of allSkills) {
        if (!skill.prerequisites || skill.prerequisites.length === 0) {
            categorizedSkills.trained.push(skill);
        } else {
            const isMaster = skill.prerequisites.some(pName => {
                const prereq = skillMap.get(pName);
                return prereq?.prerequisites && prereq.prerequisites.length > 0;
            });
            if (isMaster) {
                categorizedSkills.master.push(skill);
            } else {
                categorizedSkills.expert.push(skill);
            }
        }
    }

    let selectedSkills: Character['skills'] = {
        trained: [...characterClass.starting_skills],
        expert: [],
        master: [],
    };

    // Special handling for Scientist starting picks
    if (characterClass.name === 'Scientist') {
        const availableScientistSkills = [...SCIENTIST_SKILL_CHOICES];
        for (let i = 0; i < 3; i++) {
            if (availableScientistSkills.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableScientistSkills.length);
            const skillToAdd = availableScientistSkills.splice(randomIndex, 1)[0];
            selectedSkills.trained.push(skillToAdd);
        }
    }
    
    const isFlexibleClass = characterClass.name === 'Marine' || characterClass.name === 'Android';

    if (isFlexibleClass) {
        // Add base skills first
        let availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
        for (let i = 0; i < BASE_SKILLS.trained; i++) {
            if (availableTrained.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableTrained.length);
            selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
        }
        
        let availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
        if (availableExpert.length > 0) {
             const randomIndex = Math.floor(Math.random() * availableExpert.length);
             selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
        }

        // Then add flexible bonus
        if (Math.random() < 0.5) { // Choose 1 Expert
            availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
            if (availableExpert.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableExpert.length);
                selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
            }
        } else { // Choose 2 Trained
            availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
            for (let i = 0; i < 2; i++) {
                if (availableTrained.length === 0) break;
                const randomIndex = Math.floor(Math.random() * availableTrained.length);
                selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
            }
        }
    } else {
        // Handle standard skill selection for other classes
        const totalSkillsToSelect = {
            trained: BASE_SKILLS.trained + characterClass.bonus_skills.trained,
            expert: BASE_SKILLS.expert + characterClass.bonus_skills.expert,
            master: BASE_SKILLS.master + characterClass.bonus_skills.master,
        };

        let availableTrained = categorizedSkills.trained.filter(s => !selectedSkills.trained.includes(s.name));
        for (let i = 0; i < totalSkillsToSelect.trained; i++) {
            if (availableTrained.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableTrained.length);
            selectedSkills.trained.push(availableTrained.splice(randomIndex, 1)[0].name);
        }
        
        let availableExpert = categorizedSkills.expert.filter(s => !selectedSkills.expert.includes(s.name) && s.prerequisites?.every(p => selectedSkills.trained.includes(p)));
        for (let i = 0; i < totalSkillsToSelect.expert; i++) {
            if (availableExpert.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableExpert.length);
            selectedSkills.expert.push(availableExpert.splice(randomIndex, 1)[0].name);
        }
        
        const allSelectedLowerSkills = [...selectedSkills.trained, ...selectedSkills.expert];
        let availableMaster = categorizedSkills.master.filter(s => !selectedSkills.master.includes(s.name) && s.prerequisites?.every(p => allSelectedLowerSkills.includes(p)));
        for (let i = 0; i < totalSkillsToSelect.master; i++) {
            if (availableMaster.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableMaster.length);
            selectedSkills.master.push(availableMaster.splice(randomIndex, 1)[0].name);
        }
    }
    
    return selectedSkills;
};


export const CharacterCreatorView: React.FC<CharacterCreatorViewProps> = ({ characterData, onCharacterUpdate }) => {
    const [char, setChar] = useState<Character>(characterData?.character || initialCharacter);
    const [baseStats, setBaseStats] = useState(characterData?.baseStats || initialCharacter.stats);
    const [baseSaves, setBaseSaves] = useState(characterData?.baseSaves || initialCharacter.saves);
    const [androidPenalty, setAndroidPenalty] = useState<Stat | null>(characterData?.androidPenalty || null);
    const [scientistBonus, setScientistBonus] = useState<Stat | null>(characterData?.scientistBonus || null);
    const [isCustomPronoun, setIsCustomPronoun] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showTooltip, hideTooltip } = useTooltip();

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
            if (newState.position) {
                lastPositionRef.current = newState.position;
            }
            if (newState.isVisible === false) {
                lastPositionRef.current = prev.position;
                updatedState.activeCheck = null; 
            }
            return updatedState;
        });
    }, []);

    const handleRollRequest = useCallback((type: 'stat' | 'save' | 'wound' | 'panic' | 'creation', name: string) => {
        setRollerState(prev => ({
            ...prev,
            isVisible: true,
            isMinimized: false,
            position: lastPositionRef.current,
            activeCheck: { type, name },
        }));
    }, []);

    const { finalStats, finalSaves, finalMaxWounds } = useMemo(() => {
        const classData = char.class;
        let stats = { ...baseStats };
        let saves = { ...baseSaves };
        let maxWounds = 2;

        if (classData) {
            maxWounds += classData.max_wounds_mod;

            for (const [stat, mod] of Object.entries(classData.stats_mods)) {
                if (stats[stat as keyof typeof stats] !== undefined) {
                    stats[stat as keyof typeof stats] += mod;
                }
            }
            for (const [save, mod] of Object.entries(classData.saves_mods)) {
                if (saves[save as keyof typeof saves] !== undefined) {
                    saves[save as keyof typeof saves] += mod;
                }
            }

            if (classData.name === 'Android' && androidPenalty) {
                stats[androidPenalty] -= 10;
            }
            if (classData.name === 'Scientist' && scientistBonus) {
                stats[scientistBonus] += 5;
            }
        }

        return { finalStats: stats, finalSaves: saves, finalMaxWounds: maxWounds };
    }, [char.class, baseStats, baseSaves, androidPenalty, scientistBonus]);

    const finalCharacter = useMemo<Character>(() => ({
        ...char,
        stats: finalStats,
        saves: finalSaves,
        wounds: { ...char.wounds, max: finalMaxWounds },
    }), [char, finalStats, finalSaves, finalMaxWounds]);


    // Propagate all local state changes up to the parent App component.
    useEffect(() => {
        const hasData = finalCharacter.name || finalCharacter.class || Object.values(baseStats).some(v => v > 0) || Object.values(baseSaves).some(v => v > 0) || finalCharacter.health.max > 0;
        if (hasData) {
            onCharacterUpdate({
                character: finalCharacter,
                baseStats,
                baseSaves,
                androidPenalty,
                scientistBonus,
            });
        } else {
            onCharacterUpdate(null);
        }
    }, [finalCharacter, baseStats, baseSaves, androidPenalty, scientistBonus, onCharacterUpdate]);

    useEffect(() => {
        if (char.pronouns && !PRONOUNS.includes(char.pronouns)) {
            setIsCustomPronoun(true);
        } else {
            setIsCustomPronoun(false);
        }
    }, [char.pronouns]);


    const handleRollerUpdate = useCallback((updatedCharacter: Character) => {
        setChar(updatedCharacter);
    }, []);

    const handleFieldChange = useCallback((path: string, value: string) => {
        const numValue = parseInt(value, 10) || 0;
        const [statType, statName] = path.split('.');

        if (statType === 'stats') {
            setBaseStats(prev => ({...prev, [statName]: numValue}));
        } else if (statType === 'saves') {
            setBaseSaves(prev => ({...prev, [statName]: numValue}));
        } else {
            setChar(prevChar => {
                const newChar = JSON.parse(JSON.stringify(prevChar));
                set(newChar, path, numValue);
                if (path === 'health.max') {
                    // Only set current to max if current is higher than new max or 0
                    if (newChar.health.current > numValue || newChar.health.current === 0) {
                        set(newChar, 'health.current', numValue);
                    }
                }
                return newChar;
            });
        }
    }, []);
    
    const handleApplyRoll = useCallback((path: string, value: number) => {
        handleFieldChange(path, String(value));
        setRollerState(prev => ({ ...prev, activeCheck: null }));
    }, [handleFieldChange]);

    const handleSkillsChange = useCallback((newSkills: Character['skills']) => {
        setChar(prev => ({
            ...prev,
            skills: newSkills
        }));
    }, []);

    const handleSelectClass = useCallback((className: ClassName) => {
        const classData = CLASSES_DATA.find(c => c.name === className)!;
        setAndroidPenalty(null);
        setScientistBonus(null);

        setChar(c => ({
            ...c,
            class: c.class?.name === className ? null : classData,
            skills: classData.starting_skills ? { trained: classData.starting_skills, expert: [], master: [] } : { trained: [], expert: [], master: [] }
        }));
    }, []);


    const handleFullCharacterRoll = useCallback(() => {
        const randomClass = CLASSES_DATA[Math.floor(Math.random() * CLASSES_DATA.length)];

        const newBaseStats = {
            strength: rollDice('2d10+25'),
            speed: rollDice('2d10+25'),
            intellect: rollDice('2d10+25'),
            combat: rollDice('2d10+25'),
        };
        const newBaseSaves = {
            sanity: rollDice('2d10+10'),
            fear: rollDice('2d10+10'),
            body: rollDice('2d10+10'),
        };
        
        let chosenAndroidPenalty: Stat | null = null;
        if (randomClass.name === 'Android') {
            const penaltyOptions: Stat[] = ['strength', 'speed', 'intellect', 'combat'];
            chosenAndroidPenalty = penaltyOptions[Math.floor(Math.random() * penaltyOptions.length)];
        }
        
        let chosenScientistBonus: Stat | null = null;
        if (randomClass.name === 'Scientist') {
            const bonusOptions: Stat[] = ['strength', 'speed', 'intellect', 'combat'];
            chosenScientistBonus = bonusOptions[Math.floor(Math.random() * bonusOptions.length)];
        }
        
        const newSkills = autoSelectSkills(randomClass, ALL_SKILLS);
        const maxHealth = rollDice('1d10+10');
        const newEquipment = {
            loadout: LOADOUTS[Math.floor(Math.random() * LOADOUTS.length)],
            trinket: TRINKETS[Math.floor(Math.random() * TRINKETS.length)],
            patch: PATCHES[Math.floor(Math.random() * PATCHES.length)],
        };
        const newCredits = rollDice('2d10') * 10;
        const newName = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
        const newPronouns = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
        
        const newChar = {
            ...initialCharacter,
            name: newName,
            pronouns: newPronouns,
            class: randomClass,
            health: { current: maxHealth, max: maxHealth },
            equipment: newEquipment,
            credits: newCredits,
            skills: newSkills,
        };
        
        setBaseStats(newBaseStats);
        setBaseSaves(newBaseSaves);
        setAndroidPenalty(chosenAndroidPenalty);
        setScientistBonus(chosenScientistBonus);
        setChar(newChar);

    }, []);

    const handleSaveCharacter = useCallback(() => {
        const saveData: CharacterSaveData = {
            character: finalCharacter,
            baseStats,
            baseSaves,
            androidPenalty,
            scientistBonus,
        };

        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = finalCharacter.name.replace(/ /g, '_') || 'mothership_character';
        a.href = url;
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [finalCharacter, baseStats, baseSaves, androidPenalty, scientistBonus]);

    const handleLoadCharacter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('File content is not a string.');
                }
                const data: CharacterSaveData = JSON.parse(text);

                if (!data.character || !data.baseStats || !data.baseSaves) {
                    throw new Error('Invalid character file format.');
                }

                setChar(data.character);
                setBaseStats(data.baseStats);
                setBaseSaves(data.baseSaves);
                setAndroidPenalty(data.androidPenalty ?? null);
                setScientistBonus(data.scientistBonus ?? null);

            } catch (error: any) {
                alert(`Error loading character file: ${error.message}`);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    }, []);

    const tertiarySelectionClasses = (isSelected: boolean) => {
        const base = 'flex-1 p-2 text-center uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus';
        if (isSelected) {
            return `${base} bg-tertiary text-background border border-tertiary`;
        }
        return `${base} bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed active:border-tertiary-pressed`;
    }

    return (
        <div>
            <div className="border border-primary/50 p-6 bg-black/30 space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <h2 className="text-3xl font-bold text-primary uppercase tracking-wider">Character Manifest</h2>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleSaveCharacter}
                            className="px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed disabled:border-secondary-hover disabled:text-secondary-hover/70 disabled:cursor-not-allowed"
                        >
                            Save Character
                        </button>
                        <label className="px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed disabled:border-secondary-hover disabled:text-secondary-hover/70 disabled:cursor-not-allowed cursor-pointer">
                            Load Character
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleLoadCharacter}
                            />
                        </label>
                        <button 
                            onClick={handleFullCharacterRoll}
                            className="px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-hover disabled:text-background/70 disabled:cursor-not-allowed"
                        >
                            Generate Random Recruit
                        </button>
                    </div>
                </div>
                
                <div className="border border-primary/30 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Character Name" className="bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" onChange={e => setChar(c => ({...c, name: e.target.value}))} value={char.name} />
                     <div className="flex gap-2">
                        <select
                            className={`bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary transition-all duration-200 ${isCustomPronoun ? 'w-1/2' : 'w-full'}`}
                            value={isCustomPronoun ? 'custom' : char.pronouns}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'custom') {
                                    setIsCustomPronoun(true);
                                    setChar(c => ({ ...c, pronouns: '' }));
                                } else {
                                    setIsCustomPronoun(false);
                                    setChar(c => ({ ...c, pronouns: value }));
                                }
                            }}
                        >
                            <option value="" disabled>Select Pronouns...</option>
                            {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                            <option value="custom">Custom...</option>
                        </select>
                        {isCustomPronoun && (
                            <input
                                type="text"
                                placeholder="Enter pronouns"
                                className="w-1/2 bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary"
                                value={char.pronouns}
                                onChange={e => setChar(c => ({ ...c, pronouns: e.target.value }))}
                                aria-label="Custom pronouns"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-primary/30 p-4">
                        <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Stats</h3>
                        <div className="flex justify-around">
                            <StatInput id="stats.strength" label="Strength" value={finalStats.strength} baseValue={baseStats.strength} onChange={(e) => handleFieldChange('stats.strength', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Strength']} onRollRequest={char.class ? () => handleRollRequest('stat', 'strength') : () => handleRollRequest('creation', 'stats.strength')} />
                            <StatInput id="stats.speed" label="Speed" value={finalStats.speed} baseValue={baseStats.speed} onChange={(e) => handleFieldChange('stats.speed', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Speed']} onRollRequest={char.class ? () => handleRollRequest('stat', 'speed') : () => handleRollRequest('creation', 'stats.speed')} />
                            <StatInput id="stats.intellect" label="Intellect" value={finalStats.intellect} baseValue={baseStats.intellect} onChange={(e) => handleFieldChange('stats.intellect', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Intellect']} onRollRequest={char.class ? () => handleRollRequest('stat', 'intellect') : () => handleRollRequest('creation', 'stats.intellect')} />
                            <StatInput id="stats.combat" label="Combat" value={finalStats.combat} baseValue={baseStats.combat} onChange={(e) => handleFieldChange('stats.combat', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Combat']} onRollRequest={char.class ? () => handleRollRequest('stat', 'combat') : () => handleRollRequest('creation', 'stats.combat')} />
                        </div>
                    </div>
                     <div className="border border-primary/30 p-4">
                        <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Saves</h3>
                        <div className="flex justify-around">
                            <StatInput id="saves.sanity" label="Sanity" value={finalSaves.sanity} baseValue={baseSaves.sanity} onChange={(e) => handleFieldChange('saves.sanity', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Sanity']} onRollRequest={char.class ? () => handleRollRequest('save', 'sanity') : () => handleRollRequest('creation', 'saves.sanity')} />
                            <StatInput id="saves.fear" label="Fear" value={finalSaves.fear} baseValue={baseSaves.fear} onChange={(e) => handleFieldChange('saves.fear', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Fear']} onRollRequest={char.class ? () => handleRollRequest('save', 'fear') : () => handleRollRequest('creation', 'saves.fear')} />
                            <StatInput id="saves.body" label="Body" value={finalSaves.body} baseValue={baseSaves.body} onChange={(e) => handleFieldChange('saves.body', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Body']} onRollRequest={char.class ? () => handleRollRequest('save', 'body') : () => handleRollRequest('creation', 'saves.body')} />
                        </div>
                    </div>
                </div>
                
                {char.class?.name === 'Android' && (
                    <div className="border border-primary/30 p-4">
                        <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Android Penalty (-10)</h4>
                        <p className="text-xs text-muted mb-3">Androids have a specific operational flaw. Choose one stat to reduce by 10.</p>
                        <div className="flex gap-4">
                            {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => (
                                <button
                                    key={stat}
                                    onClick={() => setAndroidPenalty(stat)}
                                    className={tertiarySelectionClasses(androidPenalty === stat)}
                                >
                                    {stat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {char.class?.name === 'Scientist' && (
                    <div className="border border-primary/30 p-4">
                        <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Scientist Bonus (+5)</h4>
                        <p className="text-xs text-muted mb-3">Scientists have a particular field of expertise. Choose one stat to improve by 5.</p>
                        <div className="flex gap-4">
                            {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => (
                                <button
                                    key={stat}
                                    onClick={() => setScientistBonus(stat)}
                                    className={tertiarySelectionClasses(scientistBonus === stat)}
                                >
                                    {stat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="border border-primary/30 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Select Your Class</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CLASSES_DATA.map(classData => {
                            const isScientist = classData.name === 'Scientist';
                            const isFlexible = classData.name === 'Marine' || classData.name === 'Android';
                            const statMods = Object.entries(classData.stats_mods);
                            const saveMods = Object.entries(classData.saves_mods);
                            const hasStatMods = statMods.length > 0;
                            const hasSaveMods = saveMods.length > 0;
                            
                            const BASE_SKILLS = { trained: 2, expert: 1, master: 0 };
                            let totalSkillsText;
                            if (isFlexible) {
                                totalSkillsText = "4 Trained, 1 Expert OR 2 Trained, 2 Expert";
                            } else {
                                const trainedTotal = BASE_SKILLS.trained + classData.bonus_skills.trained;
                                const expertTotal = BASE_SKILLS.expert + classData.bonus_skills.expert;
                                const masterTotal = BASE_SKILLS.master + classData.bonus_skills.master;
                                const parts = [];
                                if (masterTotal > 0) parts.push(`${masterTotal} Master`);
                                if (expertTotal > 0) parts.push(`${expertTotal} Expert`);
                                if (trainedTotal > 0) parts.push(`${trainedTotal} Trained`);
                                totalSkillsText = parts.join(', ');
                            }
                             const isSelected = char.class?.name === classData.name;
                            const buttonClasses = isSelected 
                                ? 'bg-tertiary text-background border border-tertiary' 
                                : 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed';

                            return (
                                <button 
                                    key={classData.name} 
                                    onClick={() => handleSelectClass(classData.name as ClassName)} 
                                    className={`p-4 text-left transition-colors ${buttonClasses}`}
                                    onMouseEnter={(e) => showTooltip(
                                        <div className="text-left space-y-2">
                                            <h5 className="font-bold text-lg text-secondary uppercase">{classData.name}</h5>
                                            <p className="text-sm text-foreground">{classData.description}</p>
                                            
                                            {(hasStatMods || hasSaveMods || classData.max_wounds_mod > 0 || classData.name === 'Android' || classData.name === 'Scientist') && (
                                                <div>
                                                    <h6 className="text-xs uppercase text-primary tracking-wider">Modifiers</h6>
                                                    <ul className="list-disc list-inside text-sm text-foreground">
                                                        {statMods.map(([stat, mod]) => <li key={stat} className="capitalize">{stat}: {mod > 0 ? '+' : ''}{mod}</li>)}
                                                        {saveMods.map(([save, mod]) => <li key={save} className="capitalize">{save}: {mod > 0 ? '+' : ''}{mod}</li>)}
                                                        {classData.name === 'Android' && <li>-10 to one Stat of your choice</li>}
                                                        {classData.name === 'Scientist' && <li>+5 to one Stat of your choice</li>}
                                                        {classData.max_wounds_mod > 0 && <li>Wounds: +{classData.max_wounds_mod}</li>}
                                                    </ul>
                                                </div>
                                            )}

                                            <div>
                                                <h6 className="text-xs uppercase text-primary tracking-wider">Total Skills</h6>
                                                <p className="text-sm text-foreground">{totalSkillsText}</p>
                                            </div>

                                            {isScientist && (
                                                <div>
                                                    <h6 className="text-xs uppercase text-primary tracking-wider">Starting Skills</h6>
                                                    <p className="text-sm text-foreground">Select 3 skills from: {SCIENTIST_SKILL_CHOICES.join(', ')}.</p>
                                                </div>
                                            )}

                                            <p className="text-xs text-muted"><strong className="text-secondary">Trauma:</strong> {classData.trauma_response}</p>
                                        </div>,
                                        e
                                    )}
                                    onMouseLeave={hideTooltip}
                                >
                                    <h4 className="font-bold text-lg uppercase text-secondary">{classData.name}</h4>
                                    <p className="text-xs text-muted mt-2">Trauma: {classData.trauma_response}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="border border-primary/30 p-4">
                         <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Vitals</h3>
                         <div className="flex justify-around items-center">
                            <SplitStatInput
                                label="Health"
                                id="health"
                                currentValue={char.health.current}
                                maxValue={char.health.max}
                                onCurrentChange={(e) => handleFieldChange('health.current', e.target.value)}
                                onMaxChange={(e) => handleFieldChange('health.max', e.target.value)}
                                tooltipContent={STAT_DESCRIPTIONS['Health']}
                                onRollRequestCurrent={char.class ? () => handleRollRequest('save', 'body') : undefined}
                                onRollRequestMax={() => handleRollRequest('creation', 'health.max')}
                            />
                         </div>
                    </div>
                    <div className="border border-primary/30 p-4">
                         <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Condition</h3>
                         <div className="flex justify-around items-center gap-4">
                            <SplitStatInput
                                label="Wounds"
                                id="wounds"
                                currentValue={char.wounds.current}
                                maxValue={finalMaxWounds}
                                onCurrentChange={(e) => handleFieldChange('wounds.current', e.target.value)}
                                onMaxChange={() => {}} // Read-only
                                tooltipContent={STAT_DESCRIPTIONS['Wounds']}
                                isMaxReadOnly={true}
                                onRollRequestCurrent={() => handleRollRequest('wound', 'wound')}
                            />
                            <StatInput id="stress.current" label="Stress" value={char.stress.current} onChange={(e) => handleFieldChange('stress.current', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Stress']} onRollRequest={() => handleRollRequest('panic', 'panic')} />
                         </div>
                    </div>
                </div>
                
                <div className="border border-primary/30 p-4">
                     <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Equipment</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong className="text-primary/80">Loadout:</strong> {char.equipment.loadout || '...'}</p>
                        <p><strong className="text-primary/80">Trinket:</strong> {char.equipment.trinket || '...'}</p>
                        <p><strong className="text-primary/80">Patch:</strong> {char.equipment.patch || '...'}</p>
                        <div className="flex items-center gap-2">
                            <strong className="text-primary/80">Credits:</strong>
                            <input
                                type="number"
                                className="bg-black/50 border border-muted p-1 w-24 focus:ring-0 focus:outline-none focus:border-primary"
                                value={char.credits || ''}
                                onChange={e => handleFieldChange('credits', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-primary/30 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Skills</h3>
                    {char.class ? (
                        <SkillSelector 
                            characterClass={char.class}
                            allSkills={ALL_SKILLS}
                            selectedSkills={char.skills}
                            onSkillsChange={handleSkillsChange}
                        />
                    ) : (
                        <p className="text-xs text-muted">Select a class to see available skills.</p>
                    )}
                </div>
            </div>
             
            <CharacterRoller 
                character={finalCharacter} 
                onUpdate={handleRollerUpdate}
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