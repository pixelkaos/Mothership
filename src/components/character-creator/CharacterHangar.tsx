import React, { useState, useRef, useCallback } from 'react';
import type { CharacterSaveData } from '@/types';
import { generateRandomRecruit } from '@/utils/character';
import { PREGENERATED_CHARACTERS } from '@/components/character-creator/pregeneratedCharacters';
import { Button } from '@/components/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface CharacterHangarProps {
    onStartNew: () => void;
    onCharacterReady: (data: CharacterSaveData) => void;
}

export const CharacterHangar: React.FC<CharacterHangarProps> = ({ onStartNew, onCharacterReady }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateRandom = async () => {
        setIsGenerating(true);
        try {
            const data = await generateRandomRecruit();
            onCharacterReady(data);
        } catch (error: any) {
            console.error("Failed to generate random recruit:", error);
            const msg = error?.message || 'An error occurred while generating the character.';
            alert(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLoadCharacter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('File content is not a string.');
                
                const data: CharacterSaveData = JSON.parse(text);
                if (!data.character || !data.baseStats || !data.baseSaves) throw new Error('Invalid character file format.');
                
                onCharacterReady(data);
            } catch (error: any)
{
                alert(`Error loading character file: ${error.message}`);
            } finally {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    }, [onCharacterReady]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-8 text-left">
                <div>
                    <h2 className="text-4xl font-bold leading-tight text-primary uppercase tracking-wider">Character</h2>
                    <h2 className="text-4xl font-bold leading-tight text-primary uppercase tracking-wider">Hangar</h2>
                </div>
                <p className="text-muted text-sm max-w-xs text-right hidden sm:block mt-2">
                   Create, load, or generate a character for the Mothership Sci-Fi Horror RPG. Your life is cheap—make a new one.
                </p>
            </div>
            
            <div className="space-y-12">
                {/* Build Your Own Section */}
                <div>
                    <h3 className="text-2xl font-semibold text-secondary uppercase tracking-wider text-left mb-6">Build your own Character</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Card
                                visualContent={<span className="text-muted text-lg tracking-widest">STEP-BY-STEP CREATION</span>}
                                title="New Recruit"
                                description="Go through a guided process to build a character from the ground up, making every choice yourself."
                                action={<Button onClick={onStartNew} className="mt-auto w-full">Start Fresh Character</Button>}
                            />
                        </div>

                        <Card
                            visualContent={<span className="text-muted text-lg tracking-widest">LOAD FROM FILE</span>}
                            title="Load Manifest"
                            description="Import a previously saved character file (.json) to continue your session or make edits."
                            action={
                                <Button as="label" onClick={() => fileInputRef.current?.click()} className="cursor-pointer text-center mt-auto w-full">
                                    Load Saved Character
                                    <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadCharacter} />
                                </Button>
                            }
                        />

                        <Card
                            visualContent={<span className="text-muted text-lg tracking-widest">AI-ASSISTED RANDOM</span>}
                            title="Random Recruit"
                            description="Instantly generate a complete, ready-to-play character with random stats, gear, and an AI-generated portrait and backstory."
                            action={
                                <Button onClick={handleGenerateRandom} disabled={isGenerating} className="cursor-pointer text-center mt-auto w-full">
                                    {isGenerating ? 'Generating...' : 'Generate Random'}
                                </Button>
                            }
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="flex items-center">
                    <div className="flex-grow h-px bg-primary/30"></div>
                    <span className="px-8 text-primary uppercase text-2xl font-bold">OR</span>
                    <div className="flex-grow h-px bg-primary/30"></div>
                </div>

                {/* Pre-Generated Section */}
                <div>
                    <h3 className="text-2xl font-semibold text-secondary uppercase tracking-wider text-left mb-6">Choose a Pre-Generated Recruit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PREGENERATED_CHARACTERS.map((charInfo) => (
                           <Card
                                key={charInfo.data.character.name}
                                visualContent={
                                    <img src={charInfo.data.character.portrait} alt={`${charInfo.data.character.name} portrait`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                }
                                title={charInfo.data.character.name}
                                description={
                                    <>
                                        <p className="text-sm text-secondary">{charInfo.data.character.class?.name}</p>
                                        <p className="text-muted text-sm mt-2">{charInfo.shortDescription}</p>
                                    </>
                                }
                                action={
                                    <Button onClick={() => onCharacterReady(charInfo.data)} className="w-full">
                                        Load This Character
                                    </Button>
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
