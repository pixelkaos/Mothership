import React from 'react';
import type { CharacterSaveData, CharacterClass, CharacterStats, CharacterSaves } from '@/types';
import { CLASSES_DATA } from '@/constants/rules';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/Button';
import { StepProps } from '@/components/character-creator/wizard-steps/Step1Stats';

export const Step2Class: React.FC<StepProps> = ({ saveData, onUpdate }) => {
    const { character, baseStats, baseSaves, androidPenalty, scientistBonus } = saveData;
    
    const handleSelectClass = (c: CharacterClass) => {
        onUpdate('character.class', c);
        if (c.name !== 'Android') onUpdate('androidPenalty', null);
        if (c.name !== 'Scientist') onUpdate('scientistBonus', null);

        const traumaNote = `Trauma Response: ${c.trauma_response}`;
        const existingNotes = saveData.character.notes || '';
        const traumaRegex = /^Trauma Response: .*\n*(\r\n)*/;
        const userNotes = existingNotes.replace(traumaRegex, '').trim();
        const newNotes = userNotes ? `${traumaNote}\n\n${userNotes}` : traumaNote;
        onUpdate('character.notes', newNotes);
    };

    const StatRow: React.FC<{ label: string; base: number; modifier: number }> = ({ label, base, modifier }) => (
        <div className="grid grid-cols-4 items-center text-center py-1.5">
            <span className="text-left font-bold uppercase tracking-wider text-sm">{label}</span>
            <span className="text-muted">{base}</span>
            <span className={modifier > 0 ? 'text-positive' : modifier < 0 ? 'text-danger' : 'text-muted'}>
                {modifier > 0 ? `+${modifier}` : modifier !== 0 ? modifier : '—'}
            </span>
            <span className="font-bold text-primary text-lg">{base + modifier}</span>
        </div>
    );
    
    const calculateModifier = (type: 'stat' | 'save', name: string) => {
        if (!character.class) return 0;
        let mod = 0;
        if (type === 'stat') {
            mod = character.class.stats_mods[name as keyof CharacterStats] || 0;
            if (character.class.name === 'Android' && androidPenalty === name) {
                mod -= 10;
            }
            if (character.class.name === 'Scientist' && scientistBonus === name) {
                mod += 5;
            }
        } else {
             mod = character.class.saves_mods[name as keyof CharacterSaves] || 0;
        }
        return mod;
    };
    
    return (
        <div className="space-y-space-6">
            <div className="text-center"><h2 className="text-2xl font-semibold text-primary uppercase tracking-wider">Class Selection</h2><p className="text-sm text-muted mt-space-2">Your class determines your role, special abilities, and how you handle trauma.</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4">
                {CLASSES_DATA.map(classData => {
                    const isSelected = saveData.character.class?.name === classData.name;
                    return (
                        <Button 
                            key={classData.name} 
                            variant="tertiary" 
                            size="sm"
                            onClick={() => handleSelectClass(classData)} 
                            className={`p-space-4 h-full text-left normal-case items-start ${isSelected ? 'bg-tertiary text-background' : ''}`}
                        >
                            <div>
                                <h4 className="font-bold text-lg uppercase text-secondary">{classData.name}</h4>
                                <p className="text-xs text-muted mt-space-2">Trauma: {classData.trauma_response}</p>
                            </div>
                        </Button>
                    );
                })}
            </div>
            {saveData.character.class?.name === 'Android' && (
                <Panel title="Android Penalty (-10)">
                    <p className="text-xs text-muted mb-space-3 text-center">Choose one stat to reduce by 10.</p>
                    <div className="flex gap-space-4">
                        {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => 
                            <Button 
                                key={stat}
                                variant="tertiary"
                                size="sm"
                                onClick={() => onUpdate('androidPenalty', stat)}
                                className={`flex-1 flex flex-col items-center justify-center p-space-3 normal-case ${saveData.androidPenalty === stat ? 'bg-tertiary text-background' : ''}`}
                            >
                                <span className="uppercase text-sm tracking-wider">{stat}</span>
                                <span className="font-bold text-2xl mt-space-1">{saveData.baseStats[stat]}</span>
                            </Button>
                        )}
                    </div>
                </Panel>
            )}
            {saveData.character.class?.name === 'Scientist' && (
                <Panel title="Scientist Bonus (+5)">
                    <p className="text-xs text-muted mb-space-3 text-center">Choose one stat to improve by 5.</p>
                    <div className="flex gap-space-4">
                         {(['strength', 'speed', 'intellect', 'combat'] as const).map(stat => 
                            <Button 
                                key={stat}
                                variant="tertiary"
                                size="sm"
                                onClick={() => onUpdate('scientistBonus', stat)}
                                className={`flex-1 flex flex-col items-center justify-center p-space-3 normal-case ${saveData.scientistBonus === stat ? 'bg-tertiary text-background' : ''}`}
                            >
                                <span className="uppercase text-sm tracking-wider">{stat}</span>
                                <span className="font-bold text-2xl mt-space-1">{saveData.baseStats[stat]}</span>
                            </Button>
                        )}
                    </div>
                </Panel>
            )}

            {character.class && (
                <div className="mt-space-8 border-t border-primary/50 pt-space-6">
                    <h3 className="text-lg font-bold text-primary uppercase tracking-wider text-center mb-space-4">Stat & Save Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-8 gap-y-space-4 max-w-2xl mx-auto bg-black/30 p-space-4">
                        <div>
                             <div className="grid grid-cols-4 items-center text-center py-1.5 border-b border-muted/30 mb-space-2">
                                <span className="text-left font-bold uppercase tracking-wider text-xs text-muted">Stat</span>
                                <span className="text-xs text-muted">Base</span>
                                <span className="text-xs text-muted">Mod</span>
                                <span className="text-xs text-muted">Final</span>
                            </div>
                            <StatRow label="Strength" base={baseStats.strength} modifier={calculateModifier('stat', 'strength')} />
                            <StatRow label="Speed" base={baseStats.speed} modifier={calculateModifier('stat', 'speed')} />
                            <StatRow label="Intellect" base={baseStats.intellect} modifier={calculateModifier('stat', 'intellect')} />
                            <StatRow label="Combat" base={baseStats.combat} modifier={calculateModifier('stat', 'combat')} />
                        </div>
                        <div>
                             <div className="grid grid-cols-4 items-center text-center py-1.5 border-b border-muted/30 mb-space-2">
                                <span className="text-left font-bold uppercase tracking-wider text-xs text-muted">Save / Vital</span>
                                <span className="text-xs text-muted">Base</span>
                                <span className="text-xs text-muted">Mod</span>
                                <span className="text-xs text-muted">Final</span>
                            </div>
                            <StatRow label="Sanity" base={baseSaves.sanity} modifier={calculateModifier('save', 'sanity')} />
                            <StatRow label="Fear" base={baseSaves.fear} modifier={calculateModifier('save', 'fear')} />
                            <StatRow label="Body" base={baseSaves.body} modifier={calculateModifier('save', 'body')} />
                            <div className="col-span-4 my-space-2 border-t border-muted/30"></div>
                            <StatRow label="Wounds" base={2} modifier={character.class?.max_wounds_mod || 0} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
