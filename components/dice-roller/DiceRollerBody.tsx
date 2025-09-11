
import React from 'react';
import type { Character, CharacterSaveData } from '../../types';
import { ResultDisplay } from './ResultDisplay';
import { ActionPanel } from './ActionPanel';
import { HistoryList } from './HistoryList';
import { CheckPanel } from './CheckPanel';
import { SimpleRollPanel } from './SimpleRollPanel';
import { useDiceRoller } from '../../hooks/useDiceRoller';

// FIX: Change `character` prop type to `CharacterSaveData | null` to match what `FloatingDiceRoller` provides.
interface DiceRollerBodyProps {
    characterData: CharacterSaveData | null;
    activeCheck?: { type: 'stat' | 'save', name: string } | null;
    onCharacterUpdate?: (character: Character) => void;
}

export const DiceRollerBody: React.FC<DiceRollerBodyProps> = (props) => {
    const { state, handlers } = useDiceRoller(props);
    const { 
        screen, result, history, selectedTarget, selectedSkills, 
        advantage, character, allCharacterSkills 
    } = state;
    const { 
        setScreen, setResult, setHistory, setSelectedTarget, 
        setSelectedSkills, setAdvantage, handleCheckRoll, 
        handleSimpleRoll, resetCheckState 
    } = handlers;
    
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