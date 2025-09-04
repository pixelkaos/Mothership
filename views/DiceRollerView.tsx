
import React, { useState, useCallback, useMemo } from 'react';
import type { RollResult, Character, Stat, Save } from '../types';
import { parseAndRoll } from '../utils/dice';

type DiceScreen = 'main' | 'stat' | 'save' | 'damage' | 'wound' | 'other' | 'custom';

interface HistoryEntry extends RollResult {
    name: string;
    timestamp: number;
    success?: boolean;
    target?: number;
}

type Advantage = 'none' | 'adv' | 'disadv';

const getSkillBonus = (skillName: string, character: Character): number => {
    if (character.skills.master.includes(skillName)) return 15;
    if (character.skills.expert.includes(skillName)) return 15;
    if (character.skills.trained.includes(skillName)) return 10;
    return 0;
};

interface DiceRollerViewProps {
    character: Character | null;
}

export const DiceRollerView: React.FC<DiceRollerViewProps> = ({ character }) => {
    const [screen, setScreen] = useState<DiceScreen>('main');
    const [result, setResult] = useState<HistoryEntry | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    // State for Stat/Save checks
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [advantage, setAdvantage] = useState<Advantage>('none');
    
    const resetCheckState = useCallback(() => {
        setSelectedTarget(null);
        setSelectedSkills([]);
        setAdvantage('none');
    }, []);

    const addToHistory = (entry: Omit<HistoryEntry, 'timestamp'>) => {
        const newEntry = { ...entry, timestamp: Date.now() };
        setHistory(prev => [newEntry, ...prev].slice(0, 10));
        setResult(newEntry);
    };
    
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

        const isSuccess = finalRoll.total <= finalTarget;
        
        addToHistory({
            name: `${selectedTarget.toUpperCase()} ${type === 'stat' ? 'Check' : 'Save'}`,
            total: finalRoll.total,
            rolls: finalRoll.rolls,
            modifier: 0,
            formula: finalRoll.formula,
            success: isSuccess,
            target: finalTarget,
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
            ...character.skills.master.map(name => ({ name, bonus: 15 }))
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
                <button onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-4 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Back</button>
            </div>
        );
    };

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
            <button onClick={() => {setScreen('main'); setAdvantage('none');}} className="mt-4 text-muted uppercase tracking-widest text-sm font-semibold hover:text-primary">Back</button>
        </div>
    );

    const renderMainScreen = () => (
         <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col border border-primary/50 bg-black/30 p-4 space-y-4">
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
                        <button onClick={() => handleSimpleRoll('Panic', '2d10')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">PANIC</button>
                        <button onClick={() => setScreen('other')} className="py-6 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-tertiary text-tertiary hover:bg-tertiary hover:text-background active:bg-tertiary-pressed">OTHER</button>
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
                                <button onClick={() => setHistory([])} className="w-full mt-3 py-1 text-xs text-center text-muted hover:text-primary uppercase tracking-wider font-semibold">Clear History</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
    
    if (!character) {
        return (
            <div className="flex items-center justify-center h-full text-center p-8">
                <div className="border border-primary/50 bg-black/30 p-8">
                    <h3 className="text-2xl text-primary">No Active Character</h3>
                    <p className="text-muted mt-2">Please go to the Character Hangar to create or load a character before using the dice roller.</p>
                </div>
            </div>
        )
    }

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
            { name: 'Death Save', formula: '1d100' }
        ], false),
        custom: <div>Custom roller coming soon!</div>
    }

    return (
        <div className="flex items-center justify-center h-full p-4">
             <div className="w-full max-w-md mx-auto">
                <div className="border border-primary/50 bg-black/30 p-4">
                     {screens[screen]}
                </div>
             </div>
        </div>
    );
};