import React, { useCallback } from 'react';
import type { Character, CharacterSaveData } from '@/types';
import { CharacterSummary } from '@/components/character-sheet/CharacterSummary';
import { VitalsPanel } from '@/components/character-sheet/VitalsPanel';
import { CharacterStatsPanel } from '@/components/character-sheet/CharacterStatsPanel';
import { SkillsAndEquipmentPanel } from '@/components/character-sheet/SkillsAndEquipmentPanel';
import { NotesPanel } from '@/components/character-sheet/NotesPanel';
import { Tabs } from '@/components/ui/Tabs';
import { Panel } from '@/components/ui/Panel';


interface CharacterSheetBodyProps {
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
}

export const CharacterSheetBody: React.FC<CharacterSheetBodyProps> = ({ characterData, onCharacterUpdate, onRollRequest }) => {
    const character = characterData?.character ?? null;
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (character) {
            onCharacterUpdate({ ...character, notes: e.target.value });
        }
    };

    const handleEquipmentUpdate = useCallback((source: 'loadout' | 'inventory', index: number, newValue: string) => {
        if (!character) return;
        const newCharacter = JSON.parse(JSON.stringify(character));

        if (source === 'loadout') {
            const loadoutItems = newCharacter.equipment.loadout.split(',').map((i: string) => i.trim());
            if (index < loadoutItems.length) {
                loadoutItems[index] = newValue;
                newCharacter.equipment.loadout = loadoutItems.join(', ');
            }
        } else { // source === 'inventory'
            if (index < newCharacter.equipment.inventory.length) {
                newCharacter.equipment.inventory[index] = newValue;
            }
        }
        onCharacterUpdate(newCharacter);
    }, [character, onCharacterUpdate]);

    const renderBackstory = (text: string) => {
        if (!text || !text.trim()) {
            return <p className="text-sm text-muted">No backstory available.</p>;
        }
        // Lightweight formatter similar to CharacterManifest's FormattedBackstory
        const parts = text.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('### ')) {
                return <h3 key={`h3-${index}`} className="text-lg font-semibold text-secondary tracking-wide uppercase mt-3 mb-2">{trimmed.substring(4)}</h3>;
            }
            if (trimmed.startsWith('* ')) {
                const content = trimmed.substring(2);
                const styled = content.replace(/\*\*(.*?):\*\*/g, '<strong class="text-primary font-bold">$1:</strong>');
                return <li key={`li-${index}`} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: styled }} />;
            }
            if (trimmed) {
                return <p key={`p-${index}`} className="mt-2">{trimmed}</p>;
            }
            return null;
        });
        // Group list items into ULs
        const grouped: React.ReactNode[] = [];
        let current: React.ReactNode[] = [];
        parts.forEach((node, idx) => {
            // @ts-ignore runtime check for type
            if (node && (node as any).type === 'li') {
                current.push(node as React.ReactNode);
            } else {
                if (current.length > 0) {
                    grouped.push(<ul key={`ul-${idx}`} className="space-y-1">{current}</ul>);
                    current = [];
                }
                if (node) grouped.push(node);
            }
        });
        if (current.length > 0) grouped.push(<ul key="ul-end" className="space-y-1">{current}</ul>);
        return <div>{grouped}</div>;
    };

    return (
        <div className="p-space-4 text-foreground">
            {!character ? (
                <div className="p-space-8 text-center text-muted">
                    <p className="font-bold">No Character Loaded</p>
                    <p className="text-sm">Please load or create a character from the Character Hangar.</p>
                </div>
            ) : (
                <Tabs defaultValue="stats">
                    <Tabs.List>
                        <Tabs.Trigger value="stats">Stats</Tabs.Trigger>
                        <Tabs.Trigger value="story">Story</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="stats">
                        <div className="space-y-space-4 mt-space-4">
                            <CharacterSummary character={character} />
                            <VitalsPanel character={character} />
                            <CharacterStatsPanel character={character} onRollRequest={onRollRequest} />
                            <SkillsAndEquipmentPanel character={character} onEquipmentUpdate={handleEquipmentUpdate} onCharacterUpdate={onCharacterUpdate} />
                        </div>
                    </Tabs.Content>

                    <Tabs.Content value="story">
                        <div className="space-y-space-4 mt-space-4">
                            <Panel title="Backstory" className="max-h-[40vh] min-h-[160px] overflow-y-auto">
                                {renderBackstory(character.backstory)}
                            </Panel>
                            <NotesPanel notes={character.notes} onNotesChange={handleNotesChange} />
                        </div>
                    </Tabs.Content>
                </Tabs>
            )}
        </div>
    );
};
