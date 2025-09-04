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
    if (character.skills.master.includes(skillName)) return 15; // Per mockups
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
        <div className="relative flex-1 flex flex-col items-center justify-center p-4 border border-gray-300 rounded-2xl">
             {result && <button onClick={() => setResult(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black" aria-label="Clear Result">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>}
            {result ? (
                <>
                    <span className="text-9xl font-sans font-bold text-black">{result.total}</span>
                    <div className="w-1/4 h-px bg-gray-300 my-4" />
                    {result.target !== undefined && (
                         <span className={`text-2xl font-bold uppercase tracking-wider ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                            {result.success ? 'Success' : 'Failure'}
                        </span>
                    )}
                    <span className="text-sm text-gray-500 mt-2">
                        {result.name}
                        {result.target !== undefined && ` vs ${result.target}`}
                         ({result.rolls.join(', ')})
                    </span>
                </>
            ) : (
                <span className="text-9xl font-sans font-bold text-gray-200">00</span>
            )}
        </div>
    );

    const renderCheckScreen = (type: 'stat' | 'save') => {
        if (!character) return null;
        const targets = type === 'stat' ? character.stats : character.saves;
        return (
            <div className="w-full max-w-sm mx-auto h-full flex flex-col p-4 bg-white text-black font-sans rounded-lg">
                <h3 className="text-xl font-bold tracking-wider text-center uppercase text-black">{type} Check</h3>
                <div className="flex justify-around my-4">
                    {Object.entries(targets).map(([key, value]) => (
                        <button key={key} onClick={() => setSelectedTarget(key)} className="flex flex-col items-center group">
                            <span className={`w-16 h-16 flex items-center justify-center text-2xl font-bold border rounded-2xl transition-colors ${selectedTarget === key ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 group-hover:bg-gray-200'}`}>{value}</span>
                            <span className="text-xs uppercase mt-2 tracking-wider text-gray-500">{key}</span>
                        </button>
                    ))}
                </div>
                <hr className="border-gray-200" />
                <div className="my-3 grid grid-cols-2 gap-2 flex-grow overflow-y-auto p-1">
                    {allCharacterSkills.map(({name, bonus}) => (
                        <button key={name} onClick={() => setSelectedSkills(p => p.includes(name) ? p.filter(s => s !== name) : [...p, name])} className={`p-2 text-xs text-left flex items-center justify-between rounded-md transition-colors ${selectedSkills.includes(name) ? 'bg-black text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                            <span className="font-bold bg-gray-200 text-black rounded-sm px-1 mr-2">+{bonus}</span>
                            <span className="flex-1 uppercase text-ellipsis overflow-hidden whitespace-nowrap">{name}</span>
                        </button>
                    ))}
                </div>
                <hr className="border-gray-200" />
                <div className="my-3 grid grid-cols-2 gap-3">
                    <button onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={`py-2 border rounded-lg uppercase transition-colors ${advantage === 'adv' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'}`}>Advantage</button>
                    <button onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={`py-2 border rounded-lg uppercase transition-colors ${advantage === 'disadv' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'}`}>Disadvantage</button>
                </div>
                <button onClick={() => handleCheckRoll(type)} disabled={!selectedTarget} className="w-full mt-2 py-3 bg-black text-white font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed">Roll</button>
                <button onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-4 text-gray-500 uppercase tracking-widest text-sm font-semibold hover:text-black">Back</button>
            </div>
        );
    };

    const renderSimpleRollScreen = (title: string, buttons: {name: string, formula: string}[], showAdvantage: boolean) => (
         <div className="w-full max-w-sm mx-auto h-full flex flex-col p-4 bg-white text-black font-sans rounded-lg">
            <h3 className="text-xl font-bold tracking-wider text-center uppercase text-black">{title}</h3>
            <hr className="border-gray-200 my-4" />
            <div className="space-y-3 flex-grow">
                {buttons.map(({name, formula}) => (
                     <button key={name} onClick={() => handleSimpleRoll(name, formula, showAdvantage ? advantage: 'none')} className="w-full py-4 bg-black text-white font-bold uppercase tracking-wider rounded-xl hover:bg-gray-800">{name} <span className="font-normal normal-case text-gray-300">({formula})</span></button>
                ))}
            </div>
            {showAdvantage && (
                <>
                    <hr className="border-gray-200 my-3" />
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setAdvantage(p => p === 'adv' ? 'none' : 'adv')} className={`py-2 border rounded-lg uppercase transition-colors ${advantage === 'adv' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'}`}>Advantage</button>
                        <button onClick={() => setAdvantage(p => p === 'disadv' ? 'none' : 'disadv')} className={`py-2 border rounded-lg uppercase transition-colors ${advantage === 'disadv' ? 'bg-black text-white border-black' : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'}`}>Disadvantage</button>
                    </div>
                </>
            )}
            <button onClick={() => {setScreen('main'); setAdvantage('none');}} className="mt-4 text-gray-500 uppercase tracking-widest text-sm font-semibold hover:text-black">Back</button>
        </div>
    );

    const renderMainScreen = () => (
         <div className="w-full max-w-sm mx-auto h-[90vh] max-h-[800px]">
            <div className="flex flex-col h-full bg-white text-black font-sans rounded-lg shadow-2xl p-4 space-y-4">
                {renderResult()}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setScreen('stat')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">STAT</button>
                        <button onClick={() => setScreen('save')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">SAVE</button>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                        <button onClick={() => setScreen('damage')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">DAMAGE</button>
                        <button onClick={() => handleSimpleRoll('Dice', '1d100')} className="w-20 h-20 bg-white border-4 border-gray-100 rounded-full flex items-center justify-center text-black font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">DICE</button>
                        <button onClick={() => setScreen('wound')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">WOUND</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleSimpleRoll('Panic', '2d10')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">PANIC</button>
                        <button onClick={() => setScreen('other')} className="py-6 bg-gray-100 text-black font-bold uppercase tracking-wider rounded-2xl hover:bg-gray-200 transition-colors">OTHER</button>
                    </div>
                </div>
            </div>
            <div className="mt-4 bg-white text-black font-sans rounded-lg shadow-lg border border-gray-200">
                <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className="w-full flex justify-between items-center p-3 text-left font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors" aria-expanded={isHistoryVisible}>
                    <span>Roll History</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isHistoryVisible && (
                    <div className="p-3 border-t border-gray-200">
                        {history.length === 0 ? <p className="text-sm text-gray-500 text-center italic py-2">No rolls yet.</p> : (
                            <>
                                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                                    {history.map(entry => (
                                        <li key={entry.timestamp} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <div>
                                                <span className="font-bold text-gray-800">{entry.name}</span>
                                                <span className="text-gray-500 ml-2">({entry.formula}) {entry.target && `vs ${entry.target}`}</span>
                                            </div>
                                            <span className={`text-lg font-bold ${entry.success === true ? 'text-green-600' : entry.success === false ? 'text-red-600' : 'text-black'}`}>{entry.total}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setHistory([])} className="w-full mt-3 py-1 text-xs text-center text-gray-500 hover:text-black uppercase tracking-wider font-semibold">Clear History</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
    
    if (!character) {
        return (
            <div className="flex items-center justify-center h-full text-center p-8 bg-gray-100 rounded-lg">
                <div>
                    <h3 className="text-2xl text-black">No Active Character</h3>
                    <p className="text-gray-600 mt-2">Please go to the Character Hangar to create or load a character before using the dice roller.</p>
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
        <div className="flex items-center justify-center h-full bg-gray-200 p-4">
            {screens[screen]}
        </div>
    );
};
