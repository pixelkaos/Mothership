import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { RollResult, Character, Stat, Save, CharacterSaveData } from '../types';
import { parseAndRoll } from '../utils/dice';
import { useAppContext } from '../context/AppContext';
import { Button } from './Button';

type DiceScreen = 'main' | 'stat' | 'save' | 'damage' | 'wound' | 'other' | 'custom';

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

interface FloatingDiceRollerProps {
    isVisible: boolean;
    onClose: () => void;
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const FloatingDiceRoller: React.FC<FloatingDiceRollerProps> = ({ isVisible, onClose, characterData, activeCheck, onCharacterUpdate }) => {
    const character = characterData?.character ?? null;
    const { clearActiveDiceCheck } = useAppContext();
    const [screen, setScreen] = useState<DiceScreen>('main');
    const [result, setResult] = useState<HistoryEntry | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [advantage, setAdvantage] = useState<Advantage>('none');
    
    useEffect(() => {
        if (activeCheck && (activeCheck.type === 'stat' || activeCheck.type === 'save')) {
            setScreen(activeCheck.type);
            setSelectedTarget(activeCheck.name);
            setIsMinimized(false); // Ensure roller is visible
        }
    }, [activeCheck]);

    // Floating Window Logic
    const [position, setPosition] = useState({ x: window.innerWidth / 2 - 224, y: 100 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const rollerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Only drag by the header bar
        if (!rollerRef.current || (e.target as HTMLElement).closest('button')) return;
        
        setIsDragging(true);
        const rect = rollerRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

    const handleMouseUp = useCallback(() => {
        if (isDragging) setIsDragging(false);
    }, [isDragging]);

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
    // End Floating Window Logic
    
    const resetCheckState = useCallback(() => {
        setSelectedTarget(null);
        setSelectedSkills([]);
        setAdvantage('none');
        clearActiveDiceCheck();
    }, [clearActiveDiceCheck]);

    const addToHistory = useCallback((entry: Omit<HistoryEntry, 'timestamp'>) => {
        const newEntry = { ...entry, timestamp: Date.now() };
        setHistory(prev => [newEntry, ...prev].slice(0, 10));
        setResult(newEntry);

        if (!character || !onCharacterUpdate) return;

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
             const panicEntry: HistoryEntry = { ...panicRoll, name: 'Panic Check (Crit Fail)', success: panicSuccess, target: newChar.stress.current, timestamp: Date.now() + 1, isCritical: false };
             setHistory(prev => [panicEntry, ...prev].slice(0,10));
             if(!panicSuccess) {
                // In a real game, you'd roll on the panic table here.
                // For now, we just record the failed check.
             }
        }

        if (needsUpdate) onCharacterUpdate(newChar);
    }, [character, onCharacterUpdate]);
    
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
            let roll2 = parseAndRoll('1d100');
            
            const originalRolls = { roll1: finalRoll, roll2 };
            if (advantage === 'adv') {
                finalRoll = finalRoll.total < roll2.total ? originalRolls.roll1 : originalRolls.roll2;
            } else { // disadv
                finalRoll = finalRoll.total > roll2.total ? originalRolls.roll1 : originalRolls.roll2;
            }
            finalRoll.formula = `2d100 (${advantage})`;
        }

        const tens = Math.floor(finalRoll.total / 10);
        const ones = finalRoll.total % 10;
        const isCritical = (tens === ones && finalRoll.total > 0) || finalRoll.total === 0 || finalRoll.total === 99;

        let isSuccess;
        if (finalRoll.total === 0) {
            isSuccess = true;
        } else if (finalRoll.total === 99) {
            isSuccess = false;
        } else if (finalRoll.total >= 90) {
            isSuccess = false;
        } else {
            isSuccess = finalRoll.total <= finalTarget;
        }
        
        addToHistory({
            name: `${selectedTarget.toUpperCase()} ${type === 'stat' ? 'Check' : 'Save'}`,
            total: finalRoll.total,
            rolls: finalRoll.rolls,
            modifier: 0,
            formula: finalRoll.formula,
            success: isSuccess,
            target: finalTarget,
            isCritical: isCritical,
        });

        resetCheckState();
        setScreen('main');
    };
    
    const handleSimpleRoll = (name: string, formula: string, adv: Advantage = 'none') => {
        let roll1 = parseAndRoll(formula);
        let finalRoll = roll1;
        
        if (adv !== 'none') {
            const roll2 = parseAndRoll(formula);
            if (adv === 'adv') { // Lower is better for wounds
                finalRoll = roll1.total < roll2.total ? roll1 : roll2;
            } else {
                finalRoll = roll1.total > roll2.total ? roll1 : roll2;
            }
             finalRoll.formula = `${formula.replace('1d', '2d')} (${adv})`;
        }
        
        addToHistory({
            name,
            total: finalRoll.total,
            rolls: finalRoll.rolls,
            modifier: finalRoll.modifier,
            formula: finalRoll.formula,
        });
        setAdvantage('none');
        setScreen('main');
    }

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
             {result && (
                <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="absolute top-2 right-2" aria-label="Clear Result">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </Button>
            )}
            {result ? (
                <>
                    <span className="text-9xl font-bold text-foreground">{result.total}</span>
                    <div className="w-1/4 h-px bg-primary/50 my-4" />
                    {result.target !== undefined && (
                         <span className={`text-2xl font-bold uppercase tracking-wider ${result.success ? 'text-positive' : 'text-negative'}`}>
                            {result.isCritical && 'CRITICAL '}
                            {result.success ? 'Success' : 'Failure'}
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

    const renderCheckScreen = (type: 'stat' | 'save') => {
        if (!character) return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h3 className="text-lg text-primary">No Active Character</h3>
                <p className="text-muted mt-2 text-sm">Load a character in the Hangar to use character-specific rolls.</p>
                <Button variant="ghost" onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-4">Back</Button>
            </div>
        );

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
                    <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={advantage === 'adv' ? 'bg-tertiary text-background' : ''}>Advantage</Button>
                    <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={advantage === 'disadv' ? 'bg-tertiary text-background' : ''}>Disadvantage</Button>
                </div>
                <Button
                    onClick={() => handleCheckRoll(type)} 
                    disabled={!selectedTarget} 
                    className="w-full mt-2"
                >
                    Roll
                </Button>
                <Button variant="ghost" onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-4">Back</Button>
            </div>
        );
    };

    const renderSimpleRollScreen = (title: string, buttons: {name: string, formula: string}[], showAdvantage: boolean) => (
         <div className="w-full mx-auto flex flex-col">
            <h3 className="text-xl font-bold tracking-wider text-center uppercase text-primary">{title}</h3>
            <hr className="border-primary/50 my-4" />
            <div className="space-y-3 flex-grow">
                {buttons.map(({name, formula}) => (
                     <Button
                        key={name} 
                        variant="secondary"
                        onClick={() => handleSimpleRoll(name, formula, showAdvantage ? advantage: 'none')} 
                        className="w-full"
                     >
                        {name} <span className="font-normal normal-case text-primary">({formula})</span>
                     </Button>
                ))}
            </div>
            {showAdvantage && (
                <>
                    <hr className="border-primary/50 my-3" />
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={advantage === 'adv' ? 'bg-tertiary text-background' : ''}>Advantage</Button>
                        <Button variant="tertiary" size="sm" onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={advantage === 'disadv' ? 'bg-tertiary text-background' : ''}>Disadvantage</Button>
                    </div>
                </>
            )}
            <Button variant="ghost" onClick={() => {setScreen('main'); setAdvantage('none');}} className="mt-4">Back</Button>
        </div>
    );

    const renderMainScreen = () => (
         <div className="w-full">
            <div className="flex flex-col bg-black/30 space-y-4">
                {renderResult()}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="tertiary" size="lg" disabled={!character} onClick={() => setScreen('stat')}>STAT</Button>
                        <Button variant="tertiary" size="lg" disabled={!character} onClick={() => setScreen('save')}>SAVE</Button>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                        <Button variant="tertiary" size="lg" onClick={() => setScreen('damage')}>DAMAGE</Button>
                        <Button variant="primary" onClick={() => handleSimpleRoll('Dice', '1d100')} className="w-20 h-20 rounded-md">DICE</Button>
                        <Button variant="tertiary" size="lg" onClick={() => setScreen('wound')}>WOUND</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="tertiary" size="lg" onClick={() => handleSimpleRoll('Panic', '1d20')}>PANIC</Button>
                        <Button variant="tertiary" size="lg" onClick={() => setScreen('other')}>OTHER</Button>
                    </div>
                </div>
            </div>
            <div className="mt-4 border border-primary/50 bg-black/30">
                <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className="w-full flex justify-between items-center p-3 text-left font-bold uppercase tracking-wider hover:bg-primary/10 transition-colors" aria-expanded={isHistoryVisible}>
                    <span>Roll History</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isHistoryVisible && (
                    <div className="p-3 border-t border-primary/50">
                        {history.length === 0 ? <p className="text-sm text-muted text-center italic py-2">No rolls yet.</p> : (
                            <>
                                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                                    {history.map(entry => (
                                        <li key={entry.timestamp} className="flex justify-between items-center bg-black/30 p-2">
                                            <div>
                                                <span className="font-bold text-foreground">{entry.name}</span>
                                                <span className="text-muted ml-2">({entry.formula}) {entry.target && `vs ${entry.target}`}</span>
                                            </div>
                                            <span className={`text-lg font-bold ${entry.success === true ? 'text-positive' : entry.success === false ? 'text-negative' : 'text-foreground'}`}>{entry.total}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="ghost" size="sm" onClick={() => setHistory([])} className="w-full mt-3">Clear History</Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
    
    const screens: Record<DiceScreen, React.ReactNode> = {
        main: renderMainScreen(),
        stat: renderCheckScreen('stat'),
        save: renderCheckScreen('save'),
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
            { name: 'Death Save', formula: '1d10' }
        ], false),
        custom: <div>Custom roller coming soon!</div>
    }

    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={rollerRef}
            className="fixed w-full max-w-md bg-background border border-primary/80 shadow-2xl shadow-primary/20 z-50"
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
                <h4 className="font-bold text-primary uppercase tracking-wider">Dice Roller</h4>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
            </div>
            
            {!isMinimized && (
                 <div className="border-t border-primary/50 bg-black/30 p-4">
                     {screens[screen]}
                 </div>
            )}
        </div>
    );
};