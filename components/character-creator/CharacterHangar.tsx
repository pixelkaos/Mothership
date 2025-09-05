import React, { useState, useRef, useCallback } from 'react';
import type { CharacterSaveData } from '../../types';
import { generateRandomRecruit } from '../../utils/character';
import { PREGENERATED_CHARACTERS } from './pregeneratedCharacters';

interface CharacterHangarProps {
    onStartNew: () => void;
    onCharacterReady: (data: CharacterSaveData) => void;
}

const SmallHangarCard: React.FC<{
    visualContent: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    buttonText: string;
    onButtonClick: () => void;
    isButtonDisabled?: boolean;
    isButtonALabel?: boolean;
    children?: React.ReactNode;
}> = ({ visualContent, title, description, buttonText, onButtonClick, isButtonDisabled = false, isButtonALabel = false, children }) => {
    
    const ButtonComponent = isButtonALabel ? 'label' : 'button';
    
    return (
        <div className="border border-primary/50 flex flex-col bg-black/30 group overflow-hidden h-full">
            <div className="w-full aspect-video bg-black/50 relative border-b border-muted/50 flex items-center justify-center overflow-hidden">
                {visualContent}
            </div>
            <div className="p-6 flex flex-col text-left flex-grow">
                <div className="flex-grow">
                    {title}
                    {description}
                </div>
                <ButtonComponent
                    onClick={onButtonClick}
                    disabled={isButtonDisabled}
                    className="cursor-pointer text-center mt-auto w-full px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary/50 disabled:text-background/70 disabled:cursor-not-allowed"
                >
                    {buttonText}
                    {children}
                </ButtonComponent>
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
                    <h2 className="text-4xl font-bold text-primary uppercase tracking-wider">Character</h2>
                    <h2 className="text-4xl font-bold text-primary uppercase tracking-wider">Hangar</h2>
                </div>
                <p className="text-muted text-sm max-w-xs text-right hidden sm:block mt-2">
                    Infotext that explains the page and give information on what the user can expect on this page.
                </p>
            </div>
            
            <div className="space-y-12">
                {/* Build Your Own Section */}
                <div>
                    <h3 className="text-2xl font-bold text-secondary uppercase tracking-wider text-left mb-6">Build your own Character</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 border border-primary/50 flex flex-col bg-black/30 text-left overflow-hidden h-full">
                           <div className="w-full aspect-video bg-black/50 border-b border-muted/50 flex items-center justify-center">
                                <span className="text-muted text-lg tracking-widest">Space for suitable visual</span>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h4 className="text-xl font-bold text-primary uppercase tracking-wider">Start with a fresh Character</h4>
                                    <p className="text-muted text-sm mt-2">Infotext that explains the function and what the user can expect.</p>
                                </div>
                                <button onClick={onStartNew} className="mt-auto w-full px-6 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed">Start Fresh Character</button>
                            </div>
                        </div>

                        <SmallHangarCard
                            visualContent={<span className="text-muted text-lg tracking-widest">Space for suitable visual</span>}
                            title={<h4 className="text-xl font-bold text-primary uppercase tracking-wider">Already built a Character</h4>}
                            description={<p className="text-muted text-sm mt-2">Infotext that explains the the function and what the user can expect.</p>}
                            buttonText="Load Saved Character"
                            onButtonClick={() => fileInputRef.current?.click()}
                            isButtonALabel={true}
                        >
                            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadCharacter} />
                        </SmallHangarCard>

                        <SmallHangarCard
                            visualContent={<span className="text-muted text-lg tracking-widest">Space for suitable visual</span>}
                            title={<h4 className="text-xl font-bold text-primary uppercase tracking-wider">I'm Feeling Lucky</h4>}
                            description={<p className="text-muted text-sm mt-2">Infotext that explains the function and what the user can expect.</p>}
                            buttonText={isGenerating ? 'Generating...' : 'Generate Random'}
                            onButtonClick={handleGenerateRandom}
                            isButtonDisabled={isGenerating}
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
                    <h3 className="text-2xl font-bold text-secondary uppercase tracking-wider text-left mb-6">Choose a Pre-Generated Recruit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {PREGENERATED_CHARACTERS.map((charInfo) => (
                           <SmallHangarCard
                                key={charInfo.data.character.name}
                                visualContent={
                                    <img src={charInfo.data.character.portrait} alt={`${charInfo.data.character.name} portrait`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                }
                                title={
                                    <h3 className="text-xl font-bold text-primary uppercase tracking-wider">{charInfo.data.character.name}</h3>
                                }
                                description={
                                    <>
                                        <p className="text-sm text-secondary">{charInfo.data.character.class?.name} | Skills</p>
                                        <p className="text-xs text-muted/80">Stats | Saves | Vitals</p>
                                        <p className="text-muted text-sm mt-2">{charInfo.shortDescription}</p>
                                    </>
                                }
                                buttonText="Load Saved Character"
                                onButtonClick={() => onCharacterReady(charInfo.data)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};