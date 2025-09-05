import React, { useState, useRef, useCallback } from 'react';
import type { CharacterSaveData } from '../../types';
import { generateRandomRecruit } from '../../utils/character';
import { PREGENERATED_CHARACTERS } from './pregeneratedCharacters';

interface CharacterHangarProps {
    onStartNew: () => void;
    onCharacterReady: (data: CharacterSaveData) => void;
}

const PregeneratedCharacterCard: React.FC<{
    character: CharacterSaveData['character'];
    description: string;
    onSelect: () => void;
}> = ({ character, description, onSelect }) => {
    return (
        <div className="border border-primary/50 flex flex-col bg-black/30 h-full group overflow-hidden">
            <div className="aspect-square w-full bg-black/50 relative">
                <img src={character.portrait} alt={`${character.name} portrait`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4 flex flex-col flex-grow text-left">
                <h3 className="text-xl font-bold text-primary uppercase tracking-wider">{character.name}</h3>
                <p className="text-sm text-secondary">{character.class?.name} | Skills</p>
                <p className="text-xs text-foreground/80 mt-2">Stats | Saves | Vitals</p>
                <p className="text-muted text-sm my-4 flex-grow">{description}</p>
                <button
                    onClick={onSelect}
                    className="w-full mt-auto px-4 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed"
                >
                    Load Saved Character
                </button>
            </div>
        </div>
    );
};


export const CharacterHangar: React.FC<CharacterHangarProps> = ({ onStartNew, onCharacterReady }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateRandom = async () => {
        setIsGenerating(true);
        try {
            const data = await generateRandomRecruit();
            onCharacterReady(data);
        } catch (error) {
            console.error("Failed to generate random recruit:", error);
            alert("An error occurred while generating the character. Please check the console and try again.");
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
            } catch (error: any) {
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
            <div className="flex justify-between items-start mb-4 text-left">
                <h2 className="text-3xl font-bold text-primary uppercase tracking-wider">Character Hangar</h2>
                <p className="text-muted text-sm max-w-xs text-right hidden sm:block">
                    This is the central hub for managing your crew. Create a new character from scratch, load a previous one, or pick from a list of seasoned veterans ready for action.
                </p>
            </div>
            
            <h3 className="text-2xl font-bold text-secondary uppercase tracking-wider mb-6 text-left">Build your own Character</h3>
            <div className="space-y-6">
                <div className="border border-primary/50 p-6 flex flex-col md:flex-row gap-6 bg-black/30">
                    <div className="flex-shrink-0 w-full md:w-1/3 aspect-[16/9] bg-black/50 border border-muted/50 flex items-center justify-center">
                        <span className="text-muted text-lg tracking-widest">// VISUAL FEED //</span>
                    </div>
                    <div className="flex flex-col text-left flex-grow">
                        <h4 className="text-xl font-bold text-primary uppercase tracking-wider">Start with a fresh Character</h4>
                        <p className="text-muted text-sm my-4 flex-grow">Create your character step-by-step using the guided wizard. Define your stats, class, skills, and background to build a unique persona.</p>
                        <button onClick={onStartNew} className="mt-auto w-full md:w-auto md:self-start px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed">Start Fresh Character</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-primary/50 p-6 flex flex-col bg-black/30 text-left">
                        <div className="w-full aspect-[16/9] bg-black/50 border border-muted/50 flex items-center justify-center mb-4">
                            <span className="text-muted text-lg tracking-widest">// VISUAL FEED //</span>
                        </div>
                        <h4 className="text-xl font-bold text-primary uppercase tracking-wider">Already built a Character</h4>
                        <p className="text-muted text-sm my-4 flex-grow">Import a previously saved character file (.json) to continue their journey. Your progress and stats will be fully restored.</p>
                        <label className="cursor-pointer text-center mt-auto w-full px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed">
                            Load Saved Character
                            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadCharacter} />
                        </label>
                    </div>
                    <div className="border border-primary/50 p-6 flex flex-col bg-black/30 text-left">
                        <div className="w-full aspect-[16/9] bg-black/50 border border-muted/50 flex items-center justify-center mb-4">
                            <span className="text-muted text-lg tracking-widest">// VISUAL FEED //</span>
                        </div>
                        <h4 className="text-xl font-bold text-primary uppercase tracking-wider">I'm Feeling Lucky</h4>
                        <p className="text-muted text-sm my-4 flex-grow">Let the AI Warden generate a complete, ready-to-play character with a unique portrait, backstory, and a full set of stats and skills.</p>
                        <button onClick={handleGenerateRandom} disabled={isGenerating} className="mt-auto w-full px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary/50 disabled:text-background/70 disabled:cursor-not-allowed">
                            {isGenerating ? 'Generating...' : 'Generate Random'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center my-12">
                <div className="flex-grow h-px bg-primary/30"></div>
                <span className="px-8 text-primary uppercase text-2xl font-bold">Or</span>
                <div className="flex-grow h-px bg-primary/30"></div>
            </div>

            <h3 className="text-2xl font-bold text-secondary uppercase tracking-wider mb-6 text-left">Choose a Pre-Generated Recruit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {PREGENERATED_CHARACTERS.map((charInfo) => (
                    <PregeneratedCharacterCard
                        key={charInfo.data.character.name}
                        character={charInfo.data.character}
                        description={charInfo.shortDescription}
                        onSelect={() => onCharacterReady(charInfo.data)}
                    />
                ))}
            </div>
        </div>
    );
};
