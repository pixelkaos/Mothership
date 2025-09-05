import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Character, CharacterClass, CharacterSaveData, ClassName, SkillDefinition, Stat, ShopItem } from '../../types';
import { ALL_SKILLS, CLASSES_DATA, TRINKETS, PATCHES, SCIENTIST_SKILL_CHOICES, PRONOUNS, SHOP_ITEMS } from '../../constants';
import { set } from '../../utils/helpers';
import { SkillSelector } from '../SkillSelector';
import { useTooltip } from '../Tooltip';
import { CharacterRoller } from '../CharacterRoller';
import { generateCharacterPortrait, generateCharacterBackstory } from '../../services/geminiService';


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

interface CharacterManifestProps {
  characterData: CharacterSaveData | null;
  onCharacterUpdate: (character: CharacterSaveData | null) => void;
}

const FormattedBackstory: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split('\n').map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-secondary tracking-wide uppercase mt-4 mb-2">{trimmedLine.substring(4)}</h3>;
        }
        if (trimmedLine.startsWith('* ')) {
            const content = trimmedLine.substring(2);
            const styledContent = content.replace(/\*\*(.*?):\*\*/g, '<strong class="text-primary font-bold">$1:</strong>');
            return <li key={index} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: styledContent }} />;
        }
        if (trimmedLine) {
            return <p key={index} className="mt-2">{trimmedLine}</p>;
        }
        return null;
    });

    const groupedParts: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    parts.forEach((part, index) => {
        if (part && part.type === 'li') {
            currentList.push(part);
        } else {
            if (currentList.length > 0) {
                groupedParts.push(<ul key={`ul-${index}`} className="space-y-1">{currentList}</ul>);
                currentList = [];
            }
            if (part) {
                groupedParts.push(part);
            }
        }
    });

    if (currentList.length > 0) {
        groupedParts.push(<ul key="ul-end" className="space-y-1">{currentList}</ul>);
    }

    return <div>{groupedParts}</div>;
};


export const StatInput: React.FC<{
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

export const SplitStatInput: React.FC<{
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

const ShopAndInventory: React.FC<{
    character: Character;
    onCharacterUpdate: (newCharacter: Character) => void;
}> = ({ character, onCharacterUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { showTooltip, hideTooltip } = useTooltip();

    const handleBuyItem = (item: ShopItem) => {
        if (character.credits >= item.price) {
            const newCharacter = JSON.parse(JSON.stringify(character));
            newCharacter.credits -= item.price;
            newCharacter.equipment.inventory.push(item.name);
            onCharacterUpdate(newCharacter);
        }
    };

    const handleDropItem = (itemIndex: number) => {
        const newCharacter = JSON.parse(JSON.stringify(character));
        newCharacter.equipment.inventory.splice(itemIndex, 1);
        onCharacterUpdate(newCharacter);
    };

    if (!isOpen) {
        return (
            <div className="border border-primary/30 p-4">
                <button onClick={() => setIsOpen(true)} className="w-full text-left text-sm uppercase tracking-wider text-muted hover:text-primary">
                    <h3 className="inline">Shop & Inventory</h3> <span className="text-xs">[Click to Open]</span>
                </button>
            </div>
        );
    }
    
    return (
        <div className="border border-primary/30 p-4">
            <button onClick={() => setIsOpen(false)} className="w-full text-left text-sm uppercase tracking-wider text-muted hover:text-primary mb-4">
                <h3 className="inline">Shop & Inventory</h3> <span className="text-xs">[Click to Close]</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory */}
                <div>
                    <h4 className="text-lg font-bold text-secondary mb-2">Inventory</h4>
                    <div className="bg-black/30 p-2 min-h-[200px] max-h-96 overflow-y-auto">
                        {character.equipment.inventory.length > 0 ? (
                            <ul className="space-y-1">
                                {character.equipment.inventory.map((itemName, index) => (
                                    <li key={`${itemName}-${index}`} className="flex justify-between items-center bg-black/50 p-2 text-sm">
                                        <span>{itemName}</span>
                                        <button onClick={() => handleDropItem(index)} className="text-negative/80 hover:text-negative text-xs">[Drop]</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted text-center italic p-4">Inventory is empty.</p>
                        )}
                    </div>
                </div>

                {/* Shop */}
                <div>
                    <h4 className="text-lg font-bold text-secondary mb-2">Purchase Gear</h4>
                     <div className="bg-black/30 p-2 min-h-[200px] max-h-96 overflow-y-auto">
                        <ul className="space-y-1">
                            {SHOP_ITEMS.map(item => {
                                const canAfford = character.credits >= item.price;
                                return (
                                <li key={item.name} className="flex justify-between items-center bg-black/50 p-2 text-sm"
                                     onMouseEnter={(e) => showTooltip(
                                        <div>
                                            <h5 className="font-bold text-secondary">{item.name}</h5>
                                            <p className="text-foreground">{item.description}</p>
                                        </div>, e
                                    )}
                                    onMouseLeave={hideTooltip}
                                >
                                    <span className="flex-1">{item.name}</span>
                                    <span className="text-primary/80 font-mono w-20 text-right">{item.price.toLocaleString()}cr</span>
                                    <button 
                                        onClick={() => handleBuyItem(item)}
                                        disabled={!canAfford}
                                        className="ml-4 px-2 py-1 text-xs uppercase transition-colors border border-primary text-primary hover:bg-primary hover:text-background disabled:border-muted/50 disabled:text-muted/50 disabled:cursor-not-allowed"
                                    >Buy</button>
                                </li>
                            )})}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const CharacterManifest: React.FC<CharacterManifestProps> = ({ characterData, onCharacterUpdate }) => {
    if (!characterData) {
        // This should not happen if used correctly within CharacterCreatorView, but it's a good fallback.
        return <div>Error: No character data provided to manifest.</div>;
    }

    // Deconstruct saveData to manage state locally for edits.
    const [char, setChar] = useState<Character>(characterData.character);
    const [baseStats, setBaseStats] = useState(characterData.baseStats);
    const [baseSaves, setBaseSaves] = useState(characterData.baseSaves);
    const [androidPenalty, setAndroidPenalty] = useState<Stat | null>(characterData.androidPenalty);
    const [scientistBonus, setScientistBonus] = useState<Stat | null>(characterData.scientistBonus);
    
    const [isCustomPronoun, setIsCustomPronoun] = useState(false);
    const [isGeneratingPortrait, setIsGeneratingPortrait] = useState(false);
    const [isEditingBackstory, setIsEditingBackstory] = useState(false);

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
            if (newState.position) lastPositionRef.current = newState.position;
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
                stats[stat as keyof typeof stats] += mod;
            }
            for (const [save, mod] of Object.entries(classData.saves_mods)) {
                saves[save as keyof typeof saves] += mod;
            }
            if (classData.name === 'Android' && androidPenalty) stats[androidPenalty] -= 10;
            if (classData.name === 'Scientist' && scientistBonus) stats[scientistBonus] += 5;
        }
        return { finalStats: stats, finalSaves: saves, finalMaxWounds: maxWounds };
    }, [char.class, baseStats, baseSaves, androidPenalty, scientistBonus]);

    const finalCharacter = useMemo<Character>(() => ({
        ...char,
        stats: finalStats,
        saves: finalSaves,
        wounds: { ...char.wounds, max: finalMaxWounds },
    }), [char, finalStats, finalSaves, finalMaxWounds]);

    // Update parent state whenever local state changes
    useEffect(() => {
        onCharacterUpdate({
            character: finalCharacter,
            baseStats,
            baseSaves,
            androidPenalty,
            scientistBonus,
        });
    }, [finalCharacter, baseStats, baseSaves, androidPenalty, scientistBonus, onCharacterUpdate]);
    
    // Sync local state if props change from outside (e.g., loading a new character)
    useEffect(() => {
        if (characterData) {
            setChar(characterData.character);
            setBaseStats(characterData.baseStats);
            setBaseSaves(characterData.baseSaves);
            setAndroidPenalty(characterData.androidPenalty);
            setScientistBonus(characterData.scientistBonus);
        }
    }, [characterData]);


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

        if (statType === 'stats') setBaseStats(prev => ({...prev, [statName]: numValue}));
        else if (statType === 'saves') setBaseSaves(prev => ({...prev, [statName]: numValue}));
        else {
            setChar(prevChar => {
                const newChar = JSON.parse(JSON.stringify(prevChar));
                set(newChar, path, numValue);
                if (path === 'health.max') {
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
        setChar(prev => ({ ...prev, skills: newSkills }));
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

    const handleGeneratePortrait = useCallback(async () => {
        if (!finalCharacter.class) {
            alert("Please select a class before generating a portrait.");
            return;
        }
        setIsGeneratingPortrait(true);
        try {
            let prompt = `A vibrant cyberpunk illustration in a comic book anime style of a Mothership RPG character. A ${finalCharacter.class.name}.`;
            if (finalCharacter.pronouns) prompt += ` Pronouns: ${finalCharacter.pronouns}.`;
            const topSkills = [...finalCharacter.skills.master, ...finalCharacter.skills.expert, ...finalCharacter.skills.trained].slice(0, 3);
            if (topSkills.length > 0) prompt += ` Key Skills: ${topSkills.join(', ')}.`;
            if (finalCharacter.equipment.trinket) prompt += ` They are holding a ${finalCharacter.equipment.trinket}.`;
            prompt += ` Art Style: Bold colors, defined line art, high contrast, dramatic neon lighting. Bust shot.`;
            const imageUrl = await generateCharacterPortrait(prompt);
            setChar(c => ({...c, portrait: imageUrl}));
        } catch (error) {
            console.error(error);
            alert("Failed to generate portrait. Please try again.");
        } finally {
            setIsGeneratingPortrait(false);
        }
    }, [finalCharacter]);

    const handleUploadPortrait = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Please upload an image under 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') setChar(c => ({ ...c, portrait: result }));
            else alert('Failed to read the image file.');
        };
        reader.onerror = () => alert('Error reading file.');
        reader.readAsDataURL(file);
        if (event.target) event.target.value = '';
    }, []);

    const handleSaveCharacter = useCallback(() => {
        const saveData: CharacterSaveData = { character: finalCharacter, baseStats, baseSaves, androidPenalty, scientistBonus };
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
    
    const tertiarySelectionClasses = (isSelected: boolean) => {
        const base = 'flex-1 p-2 text-center uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus';
        if (isSelected) return `${base} bg-tertiary text-background border border-tertiary`;
        return `${base} bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed active:border-tertiary-pressed`;
    }

    return (
        <div>
            <div className="border border-primary/50 p-6 bg-black/30 space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-3xl font-bold text-primary uppercase tracking-wider">
                        <span className="block">Character</span>
                        <span className="block">Manifest</span>
                    </h2>
                    <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto sm:min-w-[280px]">
                         <button 
                            onClick={() => onCharacterUpdate(null)}
                            className="px-4 py-3 text-sm uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed"
                        >
                            Back to Hangar
                        </button>
                        <button 
                            onClick={handleSaveCharacter}
                            className="flex-1 px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed"
                        >
                            Export Character
                        </button>
                    </div>
                </div>
                
                <div className="border border-primary/30 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1 space-y-2">
                        <div className="aspect-square w-full bg-black/50 border border-muted flex items-center justify-center relative overflow-hidden">
                            {char.portrait ? <img src={char.portrait} alt="Character Portrait" className="w-full h-full object-cover" /> : (
                                <div className="text-center text-muted p-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                    <p className="text-xs mt-2">Profile Picture</p>
                                </div>
                            )}
                             {isGeneratingPortrait && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4">
                                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <p className="mt-2 text-primary/80 animate-pulse text-xs">RENDERING PORTRAIT...</p>
                                </div>
                            )}
                        </div>
                         <button onClick={handleGeneratePortrait} disabled={isGeneratingPortrait || !char.class} className="w-full px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed disabled:border-secondary/50 disabled:text-secondary/50 disabled:cursor-not-allowed">
                            {isGeneratingPortrait ? 'Generating...' : 'Generate Picture'}
                         </button>
                         <label className="block w-full text-center px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed cursor-pointer">
                            Upload Picture
                            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleUploadPortrait} />
                        </label>
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-4">
                         <input type="text" placeholder="Name" className="bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" onChange={e => setChar(c => ({...c, name: e.target.value}))} value={char.name} />
                         <div className="flex gap-2">
                            <select className={`bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary transition-all duration-200 ${isCustomPronoun ? 'w-1/2' : 'w-full'}`} value={isCustomPronoun ? 'custom' : char.pronouns} onChange={(e) => { e.target.value === 'custom' ? (setIsCustomPronoun(true), setChar(c => ({ ...c, pronouns: '' }))) : (setIsCustomPronoun(false), setChar(c => ({ ...c, pronouns: e.target.value }))) }}>
                                <option value="" disabled>Select Pronouns</option>
                                {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
                                <option value="custom">Custom...</option>
                            </select>
                            {isCustomPronoun && <input type="text" placeholder="Enter pronouns" className="w-1/2 bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary" value={char.pronouns} onChange={e => setChar(c => ({ ...c, pronouns: e.target.value }))} aria-label="Custom pronouns" />}
                        </div>
                        <div className="flex-grow bg-black/50 border border-muted p-2 focus-within:border-primary min-h-[100px] resize-y overflow-auto relative transition-colors">
                            {char.backstory && !isEditingBackstory ? (
                                <>
                                    <FormattedBackstory text={char.backstory} />
                                    <button onClick={() => setIsEditingBackstory(true)} className="absolute top-1 right-1 px-2 py-1 text-xs uppercase tracking-widest transition-colors duration-200 bg-muted/50 text-foreground hover:bg-secondary hover:text-background" aria-label="Edit backstory">Edit</button>
                                </>
                            ) : (
                                <>
                                    <textarea placeholder="Character Story" className="w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none" onChange={e => setChar(c => ({...c, backstory: e.target.value}))} value={char.backstory} />
                                    {isEditingBackstory && <button onClick={() => setIsEditingBackstory(false)} className="absolute top-1 right-1 px-2 py-1 text-xs uppercase tracking-widest transition-colors duration-200 bg-primary text-background hover:bg-primary-hover" aria-label="Save backstory">Save</button>}
                                </>
                            )}
                        </div>
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
                            {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => <button key={stat} onClick={() => setAndroidPenalty(stat)} className={tertiarySelectionClasses(androidPenalty === stat)}>{stat}</button>)}
                        </div>
                    </div>
                )}

                {char.class?.name === 'Scientist' && (
                    <div className="border border-primary/30 p-4">
                        <h4 className="text-sm uppercase tracking-wider mb-2 text-secondary">Scientist Bonus (+5)</h4>
                        <p className="text-xs text-muted mb-3">Scientists have a particular field of expertise. Choose one stat to improve by 5.</p>
                        <div className="flex gap-4">
                            {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => <button key={stat} onClick={() => setScientistBonus(stat)} className={tertiarySelectionClasses(scientistBonus === stat)}>{stat}</button>)}
                        </div>
                    </div>
                )}
                
                <div className="border border-primary/30 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Select Your Class</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CLASSES_DATA.map(classData => {
                            const isSelected = char.class?.name === classData.name;
                            const buttonClasses = isSelected ? 'bg-tertiary text-background border border-tertiary' : 'bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background';
                            return <button key={classData.name} onClick={() => handleSelectClass(classData.name as ClassName)} className={`p-4 text-left transition-colors ${buttonClasses}`}><h4 className="font-bold text-lg uppercase text-secondary">{classData.name}</h4><p className="text-xs text-muted mt-2">Trauma: {classData.trauma_response}</p></button>;
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="border border-primary/30 p-4">
                         <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Vitals</h3>
                         <div className="flex justify-around items-center">
                            <SplitStatInput label="Health" id="health" currentValue={char.health.current} maxValue={char.health.max} onCurrentChange={(e) => handleFieldChange('health.current', e.target.value)} onMaxChange={(e) => handleFieldChange('health.max', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Health']} onRollRequestCurrent={char.class ? () => handleRollRequest('save', 'body') : undefined} onRollRequestMax={() => handleRollRequest('creation', 'health.max')} />
                         </div>
                    </div>
                    <div className="border border-primary/30 p-4">
                         <h3 className="text-sm uppercase tracking-wider mb-4 text-center text-muted">Condition</h3>
                         <div className="flex justify-around items-center gap-4">
                            <SplitStatInput label="Wounds" id="wounds" currentValue={char.wounds.current} maxValue={finalMaxWounds} onCurrentChange={(e) => handleFieldChange('wounds.current', e.target.value)} onMaxChange={() => {}} tooltipContent={STAT_DESCRIPTIONS['Wounds']} isMaxReadOnly={true} onRollRequestCurrent={() => handleRollRequest('wound', 'wound')} />
                            <StatInput id="stress.current" label="Stress" value={char.stress.current} onChange={(e) => handleFieldChange('stress.current', e.target.value)} tooltipContent={STAT_DESCRIPTIONS['Stress']} onRollRequest={() => handleRollRequest('panic', 'panic')} />
                         </div>
                    </div>
                </div>
                
                <div className="border border-primary/30 p-4">
                    <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Skills</h3>
                    {char.class ? <SkillSelector characterClass={char.class} allSkills={ALL_SKILLS} selectedSkills={char.skills} onSkillsChange={handleSkillsChange} /> : <p className="text-xs text-muted">Select a class to see available skills.</p>}
                </div>

                <div className="border border-primary/30 p-4">
                     <h3 className="text-sm uppercase tracking-wider mb-4 text-muted">Equipment</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong className="text-primary/80">Loadout:</strong> {char.equipment.loadout || '...'}</p>
                        <p><strong className="text-primary/80">Trinket:</strong> {char.equipment.trinket || '...'}</p>
                        <p><strong className="text-primary/80">Patch:</strong> {char.equipment.patch || '...'}</p>
                        <div className="flex items-center gap-2">
                            <strong className="text-primary/80">Credits:</strong>
                            <input type="number" className="bg-black/50 border border-muted p-1 w-24 focus:ring-0 focus:outline-none focus:border-primary" value={char.credits || ''} onChange={e => handleFieldChange('credits', e.target.value)} placeholder="0" />
                        </div>
                    </div>
                </div>
                <ShopAndInventory character={finalCharacter} onCharacterUpdate={setChar} />
            </div>
             
            <CharacterRoller character={finalCharacter} onUpdate={handleRollerUpdate} isVisible={rollerState.isVisible} isMinimized={rollerState.isMinimized} initialPosition={rollerState.position} onStateChange={handleRollerStateChange} activeCheck={rollerState.activeCheck} onApplyRoll={handleApplyRoll} />
        </div>
    );
};