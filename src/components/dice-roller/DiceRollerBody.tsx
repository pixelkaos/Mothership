import React from 'react';
import type { Character, CharacterSaveData } from '@/types';
import { ResultDisplay } from '@/components/dice-roller/ResultDisplay';
import { ActionPanel } from '@/components/dice-roller/ActionPanel';
import { HistoryList } from '@/components/dice-roller/HistoryList';
import { CheckPanel } from '@/components/dice-roller/CheckPanel';
import { SimpleRollPanel } from '@/components/dice-roller/SimpleRollPanel';
import { useDiceRoller } from '@/hooks/useDiceRoller';

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
        setScreen, setSelectedTarget, 
        setSelectedSkills, setAdvantage, handleCheckRoll, 
        handleSimpleRoll, resetCheckState, clearResult,
        clearHistory, handleBasicSimpleRoll
    } = handlers;
    
    const renderContent = () => {
        switch (screen) {
            case 'stat':
            case 'save':
                if (!character) {
                    return (
                        <div className="flex flex-col items-center justify-center h-full text-center p-space-8">
                            <h3 className="text-lg text-primary">No Active Character</h3>
                            <p className="text-muted mt-space-2 text-sm">Load a character in the Hangar to use character-specific rolls.</p>
                            <button onClick={() => { setScreen('main'); resetCheckState(); }} className="mt-space-4 text-muted hover:text-primary">Back</button>
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
                        <div className="flex flex-col space-y-space-4">
                            <ResultDisplay result={result} onClear={clearResult} />
                            <ActionPanel onNavigate={setScreen} onSimpleRoll={handleBasicSimpleRoll} isCharacterLoaded={!!character} />
                        </div>
                        <HistoryList history={history} onClear={clearHistory} />
                    </div>
                );
        }
    }

    return (
        <div className="p-space-4">
            {renderContent()}
        </div>
    );
};
