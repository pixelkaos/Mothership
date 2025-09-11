
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { RollResult, Character, Stat, Save, CharacterSaveData } from '../../types';
import { parseAndRoll } from '../../utils/dice';
import { useAppContext } from '../../context/AppContext';
import { ResultDisplay } from './ResultDisplay';
import { ActionPanel } from './ActionPanel';
import { HistoryList } from './HistoryList';
import { CheckPanel } from './CheckPanel';
import { SimpleRollPanel } from './SimpleRollPanel';

type DiceScreen = 'main' | 'stat' | 'save' | 'damage' | 'wound' | 'other';

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

interface DiceRollerBodyProps {
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const DiceRollerBody: React.FC<DiceRollerBodyProps> = ({ characterData, activeCheck, onCharacterUpdate }) => {
    const character = characterData?.character ?? null;
    const { clearActiveDiceCheck } = useAppContext();
    const [screen, setScreen] = useState<DiceScreen>('main');
    const [result, setResult] = useState<HistoryEntry | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [advantage, setAdvantage] = useState<Advantage>('none');
    
    useEffect(() => {
        if (activeCheck && (activeCheck.type === 'stat' || activeCheck.type === 'save')) {
            setScreen(activeCheck.type);
            setSelectedTarget(activeCheck.name);
        }
    }, [activeCheck]);
    
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

        if (entry.success === false && (entry.name.includes('Save') || entry.name.includes('Check'))) {
            newChar.stress.current = Math.min(20, newChar.stress.current + 1);
            needsUpdate = true;
        }

        if(entry.isCritical && entry.success === false) {
             const panicRoll = parseAndRoll('1d20');
             const panicSuccess = panicRoll.total > newChar.stress.current;
             const panicEntry: HistoryEntry = { ...panicRoll, name: 'Panic Check (Crit Fail)', success: panicSuccess, target: newChar.stress.current, timestamp: Date.now() + 1, isCritical: false };
             setHistory(prev => [panicEntry, ...prev].slice(0,10));
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
        if (finalRoll.total === 0) isSuccess = true;
        else if (finalRoll.total === 99) isSuccess = false;
        else if (finalRoll.total >= 90) isSuccess = false;
        else isSuccess = finalRoll.total <= finalTarget;
        
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
            if (adv === 'adv') {
                finalRoll = roll1.total < roll2.total ? roll1 : roll2;
            } else {
                finalRoll = roll1.total > roll2.total ? roll1 : roll2;
            }
             finalRoll.formula = `${formula.replace('1d', '2d')} (${adv})`;
        }
        
        addToHistory({ name, ...finalRoll });
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
    
    const renderContent = () => {
        switch (screen) {
            case 'stat':
            case 'save':
                if (!character) {
                    return (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <h3 className="text-lg text-primary">No Active Character</h3>
                            <p className="text-muted mt-2 text-sm">Load a character in the Hangar to use character-specific rolls.</p>
                            <button onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-4 text-muted hover:text-primary">Back</button>
                        </div>
                    );
                }
                return <CheckPanel 
                            type={screen}
                            character={character}
                            allCharacterSkills={allCharacterSkills}
                            selectedTarget={selectedTarget}
                            onSelectedTargetChange={setSelectedTarget}
                            selectedSkills={selectedSkills}
                            onSelectedSkillsChange={setSelectedSkills}
                            advantage={advantage}
                            onAdvantageChange={setAdvantage}
                            onRoll={() => handleCheckRoll(screen)}
                            onBack={() => { setScreen('main'); resetCheckState(); }}
                        />
            case 'damage':
                return <SimpleRollPanel title="Damage Roll" buttons={[{name: 'Unarmed', formula: '1d10'}]} showAdvantage={false} onRoll={handleSimpleRoll} onBack={() => setScreen('main')} />;
            case 'wound':
                 return <SimpleRollPanel title="Wound Roll" buttons={[
                        { name: 'Blunt Force', formula: '1d10' },
                        { name: 'Bleeding', formula: '1d10' },
                        { name: 'Gunshot', formula: '1d10' },
                        { name: 'Fire & Explosives', formula: '1d10' },
                        { name: 'Gore & Massive', formula: '1d10' }
                    ]} showAdvantage={true} onRoll={handleSimpleRoll} onBack={() => setScreen('main')} />;
            case 'other':
                return <SimpleRollPanel title="Other Rolls" buttons={[
                        { name: 'Rest Save', formula: '1d100' },
                        { name: 'Death Save', formula: '1d10' }
                    ]} showAdvantage={false} onRoll={handleSimpleRoll} onBack={() => setScreen('main')} />;
            case 'main':
            default:
                return (
                    <div className="w-full">
                        <div className="flex flex-col space-y-4">
                            <ResultDisplay result={result} onClear={() => setResult(null)} />
                            <ActionPanel onNavigate={setScreen} onSimpleRoll={(name, formula) => handleSimpleRoll(name, formula, 'none')} isCharacterLoaded={!!character} />
                        </div>
                        <HistoryList history={history} onClear={() => setHistory([])} />
                    </div>
                );
        }
    }

    return (
        <div className="p-4">
            {renderContent()}
        </div>
    );
};
