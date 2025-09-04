import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Character, CharacterClass, ClassName, SkillDefinition, SkillTier, Stat } from '../types';
import { ALL_SKILLS, CLASSES_DATA, LOADOUTS, TRINKETS, PATCHES, SCIENTIST_SKILL_CHOICES, FIRST_NAMES, LAST_NAMES, PRONOUNS } from '../constants';
import { rollDice } from '../utils/dice';
import { DiceRoller } from '../components/DiceRoller';
import { set } from '../utils/helpers';
import { SkillSelector } from '../components/SkillSelector';
import { useTooltip } from '../components/Tooltip';


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

const DICE_SUGGESTIONS: { [key: string]: string } = {
    'stats.strength': '2d10+25',
    'stats.speed': '2d10+25',
    'stats.intellect': '2d10+25',
    'stats.combat': '2d10+25',
    'saves.sanity': '2d10+10',
    'saves.fear': '2d10+10',
    'saves.body': '2d10+10',
    'health.max': '1d10+10',
    'credits': '2d10*10',
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

const StatInput: React.FC<{
    label: string;
    id: string;
    value: number;
    baseValue?: number;
    onFocus: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tooltipContent: React.ReactNode;
}> = ({ label, id, value, baseValue, onFocus, onChange, tooltipContent }) => {
    const { showTooltip, hideTooltip } = useTooltip();
    
    const fullTooltipContent = useMemo(() => {
        const baseRollInfo = (baseValue !== undefined && value !== baseValue && baseValue !== 0)
            ? <p className="text-xs text-yellow-400 mt-2 italic">The number in brackets is your base roll before class modifiers.</p>
            : null;

        return (
            <>
                {tooltipContent}
                {baseRollInfo}
            </>
        );
    }, [tooltipContent, baseValue, value]);

    return (
        <div 
            className="flex flex-col items-center"
            onMouseEnter={(e) => showTooltip(fullTooltipContent, e)}
            onMouseLeave={hideTooltip}
        >
            <label htmlFor={id} className="text-xs uppercase text-green-500 cursor-pointer">{label}</label>
            <div className="relative">
                 <input
                    id={id}
                    type="number"
                    className="w-16 h-16 bg-black/50 border-2 border-green-600 rounded-full text-center text-2xl font-bold text-green-300 mt-1 focus:ring-green-400 focus:outline-none focus:border-green-400 appearance-none"
                    value={value || ''}
                    onFocus={onFocus}
                    onChange={onChange}
                    placeholder="0"
                />
                 {baseValue !== undefined && value !== baseValue && baseValue !== 0 && (
                    <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs mt-1 ${value > baseValue ? 'text-green-400' : 'text-red-400'}`}>
                        ({baseValue})
                    </span>
                )}
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


export const CharacterCreatorView: React.FC = () => {
    const [char, setChar] = useState<Character>(initialCharacter);
    const [baseStats, setBaseStats] = useState(initialCharacter.stats);
    const [baseSaves, setBaseSaves] = useState(initialCharacter.saves);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [androidPenalty, setAndroidPenalty] = useState<Stat | null>(null);
    const [scientistBonus, setScientistBonus] = useState<Stat | null>(null);

    const { showTooltip, hideTooltip } = useTooltip();

    const [diceRollerState, setDiceRollerState] = useState(() => {
        const initialX = window.innerWidth - 320; // 288px width + 32px padding
        const initialY = window.innerHeight - 450;
        return {
            isVisible: false,
            isMinimized: false,
            position: {
                x: Math.max(16, initialX),
                y: Math.max(16, initialY),
            },
        };
    });
    
    // Reactive calculation of stats, saves, and wounds
    useEffect(() => {
        const classData = char.class;

        let newStats = { ...baseStats };
        let newSaves = { ...baseSaves };
        let newMaxWounds = 2; // Base wounds for all classes

        if (classData) {
            newMaxWounds += classData.max_wounds_mod;

            // Apply static mods from constants
            for (const [stat, mod] of Object.entries(classData.stats_mods)) {
                if (newStats[stat as keyof typeof newStats] !== undefined) {
                    newStats[stat as keyof typeof newStats] += mod;
                }
            }
            for (const [save, mod] of Object.entries(classData.saves_mods)) {
                if (newSaves[save as keyof typeof newSaves] !== undefined) {
                    newSaves[save as keyof typeof newSaves] += mod;
                }
            }

            // Apply dynamic, user-selected mods
            if (classData.name === 'Android' && androidPenalty) {
                newStats[androidPenalty] -= 10;
            }
            if (classData.name === 'Scientist' && scientistBonus) {
                newStats[scientistBonus] += 5;
            }
        }
        
        setChar(c => ({
            ...c,
            stats: newStats,
            saves: newSaves,
            wounds: { ...c.wounds, max: newMaxWounds },
        }));

    }, [char.class, baseStats, baseSaves, androidPenalty, scientistBonus]);


    const handleDiceRollerStateChange = useCallback((newState: Partial<typeof diceRollerState>) => {
        setDiceRollerState(prev => ({ ...prev, ...newState }));
    }, []);

    const handleInputFocus = (fieldName: string) => {
        setActiveField(fieldName);
        setDiceRollerState(prev => ({ ...prev, isVisible: true }));
    };

    const handleFieldChange = (path: string, value: string) => {
        const numValue = parseInt(value, 10) || 0;
        const [statType, statName] = path.split('.');

        if (statType === 'stats') {
            setBaseStats(prev => ({...prev, [statName]: numValue}));
        } else if (statType === 'saves') {
            setBaseSaves(prev => ({...prev, [statName]: numValue}));
        } else {
            // Handle other fields like health, credits, etc.
            setChar(prevChar => {
                const newChar = { ...prevChar };
                set(newChar, path, numValue);
                if (path === 'health.max') {
                    set(newChar, 'health.current', numValue);
                }
                return newChar;
            });
        }
    };
    
    const handleApplyRoll = useCallback((result: number) => {
        if (activeField) {
           handleFieldChange(activeField, result.toString());
        }
    }, [activeField]);
    
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
        
        // Set all the base data and choices. The useEffect will compute the final stats.
        setBaseStats(newBaseStats);
        setBaseSaves(newBaseSaves);
        setAndroidPenalty(chosenAndroidPenalty);
        setScientistBonus(chosenScientistBonus);
        
        setChar(c => ({
            ...c,
            name: newName,
            pronouns: newPronouns,
            class: randomClass,
            health: { current: maxHealth, max: maxHealth },
            equipment: newEquipment,
            credits: newCredits,
            skills: newSkills,
        }));
    }, []);

    const suggestedRoll = useMemo(() => {
        if (!activeField) return null;
        return DICE_SUGGESTIONS[activeField] || null;
    }, [activeField]);

    return (
        <div className="border-2 border-green-700/50 p-6 bg-green-900/10 space-y-6">
            <div className="flex justify-between items-start">
                <h2 className="text-3xl font-bold text-green-400 uppercase tracking-wider">New Character Manifest</h2>
                <button 
                    onClick={handleFullCharacterRoll}
                    className="px-4 py-2 bg-green-600/50 border border-green-400 text-green-200 uppercase tracking-widest hover:bg-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                    Generate Random Recruit
                </button>
            </div>
            
            <div className="border border-green-800/50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" placeholder="Character Name" className="bg-black/50 border border-green-700 p-2 focus:ring-green-400 focus:outline-none" onChange={e => setChar(c => ({...c, name: e.target.value}))} value={char.name} />
                 <input type="text" placeholder="Pronouns" className="bg-black/50 border border-green-700 p-2 focus:ring-green-400 focus:outline-none" onChange={e => setChar(c => ({...c, pronouns: e.target.value}))} value={char.pronouns} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-green-800/50 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-center">Stats</h3>
                    <div className="flex justify-around">
                        <StatInput id="stats.strength" label="Strength" value={char.stats.strength} baseValue={baseStats.strength} onFocus={() => handleInputFocus('stats.strength')} onChange={(e) => handleFieldChange('stats.strength', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Strength']} />
                        <StatInput id="stats.speed" label="Speed" value={char.stats.speed} baseValue={baseStats.speed} onFocus={() => handleInputFocus('stats.speed')} onChange={(e) => handleFieldChange('stats.speed', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Speed']} />
                        <StatInput id="stats.intellect" label="Intellect" value={char.stats.intellect} baseValue={baseStats.intellect} onFocus={() => handleInputFocus('stats.intellect')} onChange={(e) => handleFieldChange('stats.intellect', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Intellect']} />
                        <StatInput id="stats.combat" label="Combat" value={char.stats.combat} baseValue={baseStats.combat} onFocus={() => handleInputFocus('stats.combat')} onChange={(e) => handleFieldChange('stats.combat', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Combat']} />
                    </div>
                </div>
                 <div className="border border-green-800/50 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-center">Saves</h3>
                    <div className="flex justify-around">
                        <StatInput id="saves.sanity" label="Sanity" value={char.saves.sanity} baseValue={baseSaves.sanity} onFocus={() => handleInputFocus('saves.sanity')} onChange={(e) => handleFieldChange('saves.sanity', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Sanity']} />
                        <StatInput id="saves.fear" label="Fear" value={char.saves.fear} baseValue={baseSaves.fear} onFocus={() => handleInputFocus('saves.fear')} onChange={(e) => handleFieldChange('saves.fear', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Fear']} />
                        <StatInput id="saves.body" label="Body" value={char.saves.body} baseValue={baseSaves.body} onFocus={() => handleInputFocus('saves.body')} onChange={(e) => handleFieldChange('saves.body', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Body']} />
                    </div>
                </div>
            </div>

             <div className="border border-green-800/50 p-4">
                <h3 className="text-sm uppercase tracking-wider mb-4">Select Your Class</h3>
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

                        return (
                            <button 
                                key={classData.name} 
                                onClick={() => handleSelectClass(classData.name as ClassName)} 
                                className={`p-4 border-2 text-left transition-colors ${char.class?.name === classData.name ? 'border-green-300 bg-green-500/20' : 'border-green-700 hover:bg-green-700/20'}`}
                                onMouseEnter={(e) => showTooltip(
                                    <div className="text-left space-y-2">
                                        <h5 className="font-bold text-lg text-green-200 uppercase">{classData.name}</h5>
                                        <p className="text-sm text-green-400">{classData.description}</p>
                                        
                                        {(hasStatMods || hasSaveMods || classData.max_wounds_mod > 0 || classData.name === 'Android' || classData.name === 'Scientist') && (
                                            <div>
                                                <h6 className="text-xs uppercase text-green-400 tracking-wider">Modifiers</h6>
                                                <ul className="list-disc list-inside text-sm text-green-400">
                                                    {statMods.map(([stat, mod]) => <li key={stat} className="capitalize">{stat}: {mod > 0 ? '+' : ''}{mod}</li>)}
                                                    {saveMods.map(([save, mod]) => <li key={save} className="capitalize">{save}: {mod > 0 ? '+' : ''}{mod}</li>)}
                                                    {classData.name === 'Android' && <li>-10 to one Stat of your choice</li>}
                                                    {classData.name === 'Scientist' && <li>+5 to one Stat of your choice</li>}
                                                    {classData.max_wounds_mod > 0 && <li>Wounds: +{classData.max_wounds_mod}</li>}
                                                </ul>
                                            </div>
                                        )}

                                        <div>
                                            <h6 className="text-xs uppercase text-green-400 tracking-wider">Total Skills</h6>
                                            <p className="text-sm text-green-400">{totalSkillsText}</p>
                                        </div>

                                        {isScientist && (
                                            <div>
                                                <h6 className="text-xs uppercase text-green-400 tracking-wider">Starting Skills</h6>
                                                <p className="text-sm text-green-400">Select 3 skills from: {SCIENTIST_SKILL_CHOICES.join(', ')}.</p>
                                            </div>
                                        )}

                                        <p className="text-xs text-green-500"><strong className="text-green-300">Trauma:</strong> {classData.trauma_response}</p>
                                    </div>,
                                    e
                                )}
                                onMouseLeave={hideTooltip}
                            >
                                <h4 className="font-bold text-lg uppercase text-green-300">{classData.name}</h4>
                                <p className="text-xs text-green-500 mt-2">Trauma: {classData.trauma_response}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {char.class?.name === 'Android' && (
                <div className="border border-green-800/50 p-4">
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-green-300">Android Penalty (-10)</h4>
                    <p className="text-xs text-green-500 mb-3">Androids have a specific operational flaw. Choose one stat to reduce by 10.</p>
                    <div className="flex gap-4">
                        {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => (
                            <button
                                key={stat}
                                onClick={() => setAndroidPenalty(stat)}
                                className={`flex-1 p-2 border-2 text-center uppercase tracking-widest transition-colors ${androidPenalty === stat ? 'border-green-300 bg-green-500/20' : 'border-green-700 hover:bg-green-700/20'}`}
                            >
                                {stat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {char.class?.name === 'Scientist' && (
                <div className="border border-green-800/50 p-4">
                    <h4 className="text-sm uppercase tracking-wider mb-2 text-green-300">Scientist Bonus (+5)</h4>
                    <p className="text-xs text-green-500 mb-3">Scientists have a particular field of expertise. Choose one stat to improve by 5.</p>
                    <div className="flex gap-4">
                        {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => (
                            <button
                                key={stat}
                                onClick={() => setScientistBonus(stat)}
                                className={`flex-1 p-2 border-2 text-center uppercase tracking-widest transition-colors ${scientistBonus === stat ? 'border-green-300 bg-green-500/20' : 'border-green-700 hover:bg-green-700/20'}`}
                            >
                                {stat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border border-green-800/50 p-4">
                     <h3 className="text-sm uppercase tracking-wider mb-4 text-center">Vitals</h3>
                     <div className="flex justify-around items-center">
                        <StatInput id="health.max" label="Health" value={char.health.max} onFocus={() => handleInputFocus('health.max')} onChange={(e) => handleFieldChange('health.max', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Health']} />
                        <StatInput id="wounds.max" label="Wounds" value={char.wounds.max} onFocus={() => { /* Wounds are calculated */ }} onChange={(e) => handleFieldChange('wounds.max', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Wounds']} />
                     </div>
                </div>
                <div className="border border-green-800/50 p-4">
                     <h3 className="text-sm uppercase tracking-wider mb-4 text-center">Condition</h3>
                     <div className="flex justify-around items-center">
                        <StatInput id="stress.current" label="Stress" value={char.stress.current} onFocus={() => { setActiveField(null); /* No rolling for stress */ }} onChange={(e) => handleFieldChange('stress.current', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Stress']} />
                        <p className="text-xs text-green-500 max-w-xs">Stress starts at 2. When you fail a save, it increases. When you Panic, you roll 2d10. If it's under your Stress, bad things happen.</p>
                     </div>
                </div>
            </div>
            
            <div className="border border-green-800/50 p-4">
                 <h3 className="text-sm uppercase tracking-wider mb-4">Equipment</h3>
                <div className="space-y-2 text-sm">
                    <p><strong className="text-green-500">Loadout:</strong> {char.equipment.loadout || '...'}</p>
                    <p><strong className="text-green-500">Trinket:</strong> {char.equipment.trinket || '...'}</p>
                    <p><strong className="text-green-500">Patch:</strong> {char.equipment.patch || '...'}</p>
                    <div className="flex items-center gap-2">
                        <strong className="text-green-500">Credits:</strong>
                        <input
                            type="number"
                            className="bg-black/50 border border-green-700 p-1 w-24 focus:ring-green-400 focus:outline-none"
                            value={char.credits || ''}
                            onFocus={() => handleInputFocus('credits')}
                            onChange={e => handleFieldChange('credits', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-green-800/50 p-4">
                <h3 className="text-sm uppercase tracking-wider mb-4">Skills</h3>
                {char.class ? (
                    <SkillSelector 
                        characterClass={char.class}
                        allSkills={ALL_SKILLS}
                        selectedSkills={char.skills}
                        onSkillsChange={handleSkillsChange}
                    />
                ) : (
                    <p className="text-xs text-green-500">Select a class to see available skills.</p>
                )}
            </div>
            
            <DiceRoller
                activeField={activeField}
                suggestedRoll={suggestedRoll}
                onApplyResult={handleApplyRoll}
                isVisible={diceRollerState.isVisible}
                isMinimized={diceRollerState.isMinimized}
                initialPosition={diceRollerState.position}
                onStateChange={handleDiceRollerStateChange}
            />
        </div>
    );
};
