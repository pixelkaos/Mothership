
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { RollResult, Character, Stat, Save } from '../types';
import { parseAndRoll } from '../utils/dice';

type DiceScreen = 'main' | 'stat' | 'save' | 'damage' | 'wound' | 'other' | 'creation';

interface HistoryEntry extends RollResult {
    name: string;
    timestamp: number;
    success?: boolean;
    target?: number;
    isCritical?: boolean;
}

type Advantage = 'none' | 'adv' | 'disadv';

const getSkillBonus = (skillName: string, character: Character): number => {
    if (character.skills.master.includes(skillName)) return 20;
    if (character.skills.expert.includes(skillName)) return 15;
    if (character.skills.trained.includes(skillName)) return 10;
    return 0;
};

const CREATION_ROLLS_MAP: { [key: string]: { name: string, formula: string } } = {
    'strength': { name: 'Strength', formula: '2d10+25' },
    'speed': { name: 'Speed', formula: '2d10+25' },
    'intellect': { name: 'Intellect', formula: '2d10+25' },
    'combat': { name: 'Combat', formula: '2d10+25' },
    'sanity': { name: 'Sanity', formula: '2d10+10' },
    'fear': { name: 'Fear', formula: '2d10+10' },
    'body': { name: 'Body', formula: '2d10+10' },
    'health.max': { name: 'Max Health', formula: '1d10+10' },
    'credits': { name: 'Credits', formula: '2d10*10'},
};

interface CharacterRollerProps {
    character: Character;
    onUpdate: (updatedCharacter: Character) => void;
    isVisible: boolean;
    isMinimized: boolean;
    initialPosition: { x: number, y: number };
    onStateChange: (newState: { isVisible?: boolean; isMinimized?: boolean; position?: { x: number; y: number }; activeCheck?: null }) => void;
    activeCheck: { type: 'stat' | 'save' | 'wound' | 'panic' | 'creation', name: string } | null;
    onApplyRoll: (path: string, value: number) => void;
}

export const CharacterRoller: React.FC<CharacterRollerProps> = ({ character, onUpdate, isVisible, isMinimized, initialPosition, onStateChange, activeCheck, onApplyRoll }) => {
    const [screen, setScreen] = useState<DiceScreen>('main');
    const [result, setResult] = useState<HistoryEntry | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [creationResult, setCreationResult] = useState<RollResult | null>(null);

    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [advantage, setAdvantage] = useState<Advantage>('none');
    
    // --- Floating Window Logic ---
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const rollerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPosition(initialPosition);
    }, [initialPosition]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!rollerRef.current || e.target !== e.currentTarget) return;
        setIsDragging(true);
        const rect = rollerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !rollerRef.current) return;
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        const rollerWidth = rollerRef.current.offsetWidth;
        const rollerHeight = rollerRef.current.offsetHeight;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rollerWidth > window.innerWidth) newX = window.innerWidth - rollerWidth;
        if (newY + rollerHeight > window.innerHeight) newY = window.innerHeight - rollerHeight;

        setPosition({ x: newX, y: newY });
    }, [isDragging]);
    
    const positionRef = useRef(position);
    positionRef.current = position;

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onStateChange({ position: positionRef.current });
        }
    }, [isDragging, onStateChange]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    // --- End Floating Window Logic ---
    
    const resetCheckState = useCallback(() => {
        setSelectedTarget(null);
        setSelectedSkills([]);
        setAdvantage('none');
    }, []);
    
    const addToHistory = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
        const newEntry = { ...entry, timestamp: Date.now() };
        setHistory(prev => [newEntry, ...prev].slice(0, 10));
        setResult(newEntry);

        let newChar = JSON.parse(JSON.stringify(character));
        let needsUpdate = false;

        // Gain stress on any failure
        if (entry.success === false && (entry.name.includes('Save') || entry.name.includes('Check'))) {
            newChar.stress.current = Math.min(20, newChar.stress.current + 1);
            needsUpdate = true;
        }

        // On Critical Failure, make a panic check
        if(entry.isCritical && entry.success === false) {
             const panicRoll = parseAndRoll('1d20');
             const panicSuccess = panicRoll.total > newChar.stress.current;
             const panicEntry: HistoryEntry = { ...panicRoll, name: 'Panic Check (Crit Fail)', success: panicSuccess, target: newChar.stress.current, timestamp: Date.now() + 1 };
             setHistory(prev => [panicEntry, ...prev].slice(0,10));
             if(!panicSuccess) {
                // You can add logic here to show the panic table result if needed.
             }
        }

        if (needsUpdate) onUpdate(newChar);

    }, [character, onUpdate]);

    const handleSimpleRoll = useCallback((name: string, formula: string, adv: Advantage = 'none') => {
        let roll1 = parseAndRoll(formula);
        let finalRoll = roll1;
        
        if (adv !== 'none') {
            const roll2 = parseAndRoll(formula);
            if (adv === 'adv') {
                finalRoll = roll1.total < roll2.total ? roll1 : roll2;
            } else {
                finalRoll = roll1.total > roll2.total ? roll1 : roll2;
            }
             finalRoll.formula = `${formula.replace('1d', '2d')} (${adv})`;
        }
        
        const isPanicCheck = name === 'Panic';
        const panicSuccess = isPanicCheck ? finalRoll.total > character.stress.current : undefined;
        
        addToHistory({
            name,
            total: finalRoll.total,
            rolls: finalRoll.rolls,
            modifier: finalRoll.modifier,
            formula: finalRoll.formula,
            success: panicSuccess,
            target: isPanicCheck ? character.stress.current : undefined
        });
        setAdvantage('none');
        setScreen('main');
    }, [addToHistory, character.stress.current]);
    
    useEffect(() => {
        if (activeCheck) {
            if (activeCheck.type === 'creation') {
                setScreen('creation');
            } else if (activeCheck.type === 'stat' || activeCheck.type === 'save') {
                setScreen(activeCheck.type);
                setSelectedTarget(activeCheck.name);
            } else if (activeCheck.type === 'wound') {
                setScreen('wound');
            } else if (activeCheck.type === 'panic') {
                handleSimpleRoll('Panic', '1d20');
                onStateChange({ activeCheck: null });
            }
        } else {
            if (isVisible) {
                 setScreen('main');
                 resetCheckState();
            }
        }
        
        if (activeCheck?.type !== 'creation') {
            setCreationResult(null);
        }

    }, [activeCheck, isVisible, resetCheckState, handleSimpleRoll, onStateChange]);
    
    const handleCheckRoll = (type: 'stat' | 'save') => {
        if (!character || !selectedTarget) return;

        const targetValue = type === 'stat' 
            ? character.stats[selectedTarget as Stat] 
            : character.saves[selectedTarget as Save];
        
        const skillBonus = selectedSkills.reduce((acc, skillName) => acc + getSkillBonus(skillName, character), 0);
        const finalTarget = targetValue + skillBonus;
        
        let roll1 = parseAndRoll('1d100');
        let finalRoll = roll1;

        if (advantage !== 'none') {
            const roll2 = parseAndRoll('1d100');
            if (advantage === 'adv') {
                finalRoll = roll1.total < roll2.total ? roll1 : roll2;
            } else { // disadv
                finalRoll = roll1.total > roll2.total ? roll1 : roll2;
            }
            finalRoll.formula = `2d100 (${advantage})`;
        }
        
        const tens = Math.floor(finalRoll.total / 10);
        const ones = finalRoll.total % 10;
        
        const isSuccess = finalRoll.total < finalTarget;
        const isCritical = (tens === ones && finalRoll.total !== 100) || finalRoll.total === 0 || finalRoll.total === 99;
        
        addToHistory({
            name: `${selectedTarget.toUpperCase()} ${type === 'stat' ? 'Check' : 'Save'}`,
            total: finalRoll.total,
            rolls: finalRoll.rolls,
            modifier: 0,
            formula: finalRoll.formula,
            success: isSuccess,
            target: finalTarget,
            isCritical: isCritical
        });

        resetCheckState();
        setScreen('main');
    };
    
    const allCharacterSkills = useMemo(() => {
        if (!character) return [];
        return [
            ...character.skills.trained.map(name => ({ name, bonus: 10 })),
            ...character.skills.expert.map(name => ({ name, bonus: 15 })),
            ...character.skills.master.map(name => ({ name, bonus: 20 }))
        ].sort((a,b) => a.name.localeCompare(b.name));
    }, [character]);

    const renderResult = () => (
        <div className="relative flex-1 flex flex-col items-center justify-center p-4 border border-primary/50 min-h-[240px]">
             {result && <button onClick={() => setResult(null)} className="absolute top-4 right-4 text-muted hover:text-primary" aria-label="Clear Result">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>}
            {result ? (
                <>
                    <span className="text-9xl font-bold text-foreground">{result.total}</span>
                    <div className="w-1/4 h-px bg-primary/50 my-4" />
                    {result.target !== undefined && (
                         <span className={`text-2xl font-bold uppercase tracking-wider ${result.success ? 'text-positive' : 'text-negative'}`}>
                            {result.isCritical && 'CRITICAL '}{result.success ? 'Success' : 'Failure'}
                        </span>
                    )}
                    <span className="text-sm text-muted mt-2">
                        {result.name}
                        {result.target !== undefined && ` vs ${result.target}`}
                         ({result.rolls.join(', ')})
                    </span>
                </>
            ) : (
                <span className="text-9xl font-bold text-muted/30">00</span>
            )}
        </div>
    );

    const tertiarySelectionClasses = (isSelected: boolean) => {
        const base = 'py-2 uppercase transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus';
        if (isSelected) {
            return `${base} bg-tertiary text-background border border-tertiary`;
        }
        return `${base} bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed`;
    }

    const renderCheckScreen = (type: 'stat' | 'save') => {
        if (!character) return null;
        const targets = type === 'stat' ? character.stats : character.saves;
        return (
            <div className="w-full mx-auto flex flex-col">
                <h3 className="text-xl font-bold tracking-wider text-center uppercase text-primary">{type} Check</h3>
                <div className="flex justify-around my-4">
                    {Object.entries(targets).map(([key, value]) => (
                        <button key={key} onClick={() => setSelectedTarget(key)} className="flex flex-col items-center group">
                            <span className={`w-16 h-16 flex items-center justify-center text-2xl font-bold border transition-colors ${selectedTarget === key ? 'bg-primary text-background border-primary' : 'bg-black/20 text-foreground border-muted group-hover:bg-muted/20'}`}>{value}</span>
                            <span className="text-xs uppercase mt-2 tracking-wider text-muted">{key}</span>
                        </button>
                    ))}
                </div>
                <hr className="border-primary/50" />
                <div className="my-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {allCharacterSkills.map(({name, bonus}) => (
                        <button key={name} onClick={() => setSelectedSkills(p => p.includes(name) ? p.filter(s => s !== name) : [...p, name])} className={`p-2 text-xs text-left flex items-center justify-between transition-colors ${selectedSkills.includes(name) ? 'bg-primary/20 text-primary' : 'bg-black/20 text-foreground hover:bg-muted/20'}`}>
                            <span className="font-bold bg-muted text-background px-1 mr-2">+{bonus}</span>
                            <span className="flex-1 uppercase text-ellipsis overflow-hidden whitespace-nowrap">{name}</span>
                        </button>
                    ))}
                </div>
                <hr className="border-primary/50" />
                <div className="my-3 grid grid-cols-2 gap-3">
                    <button onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={tertiarySelectionClasses(advantage === 'adv')}>Advantage</button>
                    <button onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={tertiarySelectionClasses(advantage === 'disadv')}>Disadvantage</button>
                </div>
                 <button 
                    onClick={() => handleCheckRoll(type)} 
                    disabled={!selectedTarget} 
                    className="w-full mt-2 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-hover disabled:text-background/70 disabled:cursor-not-allowed"
                >
                    Roll
                </button>
                <button onClick={() => { setScreen('main'); resetCheckState(); onStateChange({ activeCheck: null }); }} className="mt-4 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Back</button>
            </div>
        );
    };

    const renderCreationScreen = () => {
        if (!activeCheck || activeCheck.type !== 'creation') return null;

        const statKey = activeCheck.name.includes('.') ? activeCheck.name.split('.')[1] : activeCheck.name;
        const rollInfo = CREATION_ROLLS_MAP[statKey] || CREATION_ROLLS_MAP[activeCheck.name];

        if (!rollInfo) {
            return (
                 <div className="w-full mx-auto flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold tracking-wider uppercase text-negative">Error</h3>
                    <p className="text-muted mt-4">Invalid character roll request for "{activeCheck.name}".</p>
                    <button onClick={() => onStateChange({ activeCheck: null })} className="mt-8 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Back</button>
                </div>
            )
        }
        
        const handleRoll = () => {
            const res = parseAndRoll(rollInfo.formula);
            setCreationResult(res);
        }

        return (
            <div className="w-full mx-auto flex flex-col text-center">
                <h3 className="text-xl font-bold tracking-wider uppercase text-primary">Character Roll</h3>
                <p className="text-muted mt-2">Roll to determine your base <strong className="text-secondary">{rollInfo.name}</strong> score.</p>
                
                <div className="my-6">
                    <button 
                        onClick={handleRoll}
                        className="w-full py-4 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed"
                    >
                        Roll {rollInfo.formula}
                    </button>
                </div>

                {creationResult && (
                    <div className="border-t border-primary/50 pt-4 space-y-4">
                        <p className="text-7xl font-bold text-primary">{creationResult.total}</p>
                        <p className="text-xs text-muted">
                            ({creationResult.rolls.join(' + ')}{creationResult.modifier !== 0 ? `) ${creationResult.modifier > 0 ? '+' : '-'} ${Math.abs(creationResult.modifier)}` : ')'}
                        </p>
                        <button
                            onClick={() => onApplyRoll(activeCheck.name, creationResult.total)}
                            className="w-full mt-2 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed"
                        >
                            Apply to Character
                        </button>
                    </div>
                )}
                 <button onClick={() => { onStateChange({ isVisible: false, activeCheck: null }); }} className="mt-4 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Close</button>
            </div>
        )
    }

    const renderSimpleRollScreen = (title: string, buttons: {name: string, formula: string}[], showAdvantage: boolean) => (
         <div className="w-full mx-auto flex flex-col">
            <h3 className="text-xl font-bold tracking-wider text-center uppercase text-primary">{title}</h3>
            <hr className="border-primary/50 my-4" />
            <div className="space-y-3 flex-grow">
                {buttons.map(({name, formula}) => (
                     <button 
                        key={name} 
                        onClick={() => handleSimpleRoll(name, formula, showAdvantage ? advantage: 'none')} 
                        className="w-full py-4 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed"
                     >
                        {name} <span className="font-normal normal-case text-primary">({formula})</span>
                     </button>
                ))}
            </div>
            {showAdvantage && (
                <>
                    <hr className="border-primary/50 my-3" />
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={tertiarySelectionClasses(advantage === 'adv')}>Advantage</button>
                        <button onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={tertiarySelectionClasses(advantage === 'disadv')}>Disadvantage</button>
                    </div>
                </>
            )}
            <button onClick={() => {setScreen('main'); setAdvantage('none'); onStateChange({ activeCheck: null });}} className="mt-4 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Back</button>
        </div>
    );
    

    const renderMainScreen = () => (
         <div className="flex flex-col space-y-4">
            {renderResult()}
             <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setScreen('stat')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">STAT</button>
                    <button onClick={() => setScreen('save')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">SAVE</button>
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                    <button onClick={() => setScreen('damage')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">DAMAGE</button>
                    <button onClick={() => handleSimpleRoll('Dice', '1d100')} className="w-20 h-20 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed">DICE</button>
                    <button onClick={() => setScreen('wound')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">WOUND</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleSimpleRoll('Panic', '1d20')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">PANIC</button>
                    <button onClick={() => setScreen('other')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">OTHER</button>
                </div>
            </div>
             <div className="mt-auto pt-2">
                <div className="bg-background text-foreground border border-primary/50">
                    <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className="w-full flex justify-between items-center p-3 text-left font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors" aria-expanded={isHistoryVisible}>
                        <span>Roll History</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isHistoryVisible && (
                        <div className="p-3 border-t border-primary/50">
                            {history.length === 0 ? <p className="text-sm text-muted text-center italic py-2">No rolls yet.</p> : (
                                <>
                                    <ul className="space-y-2 text-sm max-h-32 overflow-y-auto pr-2">
                                        {history.map(entry => (
                                            <li key={entry.timestamp} className="flex justify-between items-center bg-black/20 p-2">
                                                <div>
                                                    <span className="font-bold text-foreground">{entry.name}</span>
                                                    <span className="text-muted ml-2">({entry.formula}) {entry.target && `vs ${entry.target}`}</span>
                                                </div>
                                                <span className={`text-lg font-bold ${entry.success === true ? 'text-positive' : entry.success === false ? 'text-negative' : 'text-foreground'}`}>{entry.total}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => setHistory([])} className="w-full mt-3 py-1 text-xs text-center text-muted hover:text-primary uppercase tracking-wider font-semibold">Clear History</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const screens: Record<DiceScreen, React.ReactNode> = {
        main: renderMainScreen(),
        stat: renderCheckScreen('stat'),
        save: renderCheckScreen('save'),
        creation: renderCreationScreen(),
        damage: renderSimpleRollScreen('Damage Roll', [{name: 'Unarmed', formula: '1d10'}], false),
        wound: renderSimpleRollScreen('Wound Roll', [
            { name: 'Blunt Force', formula: '1d10' },
            { name: 'Bleeding', formula: '1d10' },
            { name: 'Gunshot', formula: '1d10' },
            { name: 'Fire & Explosives', formula: '1d10' },
            { name: 'Gore & Massive', formula: '1d10' }
        ], true),
        other: renderSimpleRollScreen('Other Rolls', [
            { name: 'Rest Save', formula: '1d100' },
        ], false),
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={rollerRef}
            className="fixed w-96 bg-background border border-primary/80 shadow-2xl shadow-primary/20 z-50 text-sm"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: isDragging ? 'none' : 'auto',
            }}
        >
            <div
                className="flex justify-between items-center p-2 bg-black/30 cursor-move border-b border-primary/50"
                onMouseDown={handleMouseDown}
            >
                <h4 className="font-bold text-primary uppercase tracking-wider">
                    {screen === 'creation' ? 'Creation Roll' : 'Dice Roller'}
                </h4>
                <div className="flex items-center space-x-2">
                    <button onClick={() => onStateChange({ isMinimized: !isMinimized })} className="text-primary/70 hover:text-primary" aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </button>
                    <button onClick={() => onStateChange({ isVisible: false })} className="text-primary/70 hover:text-primary" aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {!isMinimized && (
                 <div className="p-4 bg-black/30">
                     {screens[screen]}
                 </div>
            )}
        </div>
    );
};
