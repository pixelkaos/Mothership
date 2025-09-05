
import React, { useState, useRef, useCallback } from 'react';
import type { CharacterSaveData } from '../../types';
import { generateRandomRecruit } from '../../utils/character';

interface CharacterHangarProps {
    onStartNew: () => void;
    onCharacterReady: (data: CharacterSaveData) => void;
}

const HangarButton: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
}> = ({ title, description, icon, onClick, disabled, children }) => (
    <div className="border border-primary/50 p-6 flex flex-col items-center text-center bg-black/30 h-full">
        <div className="w-16 h-16 text-primary mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-primary uppercase tracking-wider">{title}</h3>
        <p className="text-muted text-sm my-4 flex-grow">{description}</p>
        {onClick && (
            <button
                onClick={onClick}
                disabled={disabled}
                className="w-full mt-auto px-4 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-hover disabled:text-background/70 disabled:cursor-not-allowed"
            >
                {disabled ? 'Generating...' : title}
            </button>
        )}
        {children}
    </div>
);

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
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wider mb-2">Character Hangar</h2>
            <p className="text-muted mb-8">Create, load, or randomly generate a new recruit for your next mission.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HangarButton
                    title="Start Character"
                    description="Build your character from scratch in a guided step-by-step process."
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.25l-.648-1.688a4.5 4.5 0 01-2.322-2.322L11.25 18l1.688-.648a4.5 4.5 0 012.322-2.322L17.25 13.5l.648 1.688a4.5 4.5 0 012.322 2.322L21.75 18l-1.688.648a4.5 4.5 0 01-2.322 2.322z" /></svg>
                    }
                    onClick={onStartNew}
                />
                <HangarButton
                    title="Load Character"
                    description="Import a character file (.json) you previously saved to continue your journey."
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" /></svg>
                    }
                >
                    <label className="w-full mt-auto px-4 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed cursor-pointer">
                        Load Character
                        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadCharacter} />
                    </label>
                </HangarButton>
                <HangarButton
                    title="Random Recruit"
                    description="Let the AI generate a complete, ready-to-play character with a unique portrait and backstory."
                    icon={
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-2.474-1.99-1.99_1.565-1.955L13.684 16.6zm5.67-4.163L18.407 14.25m-1.295-1.295l-3.85-3.85a1.5 1.5 0 00-2.121 0l-3.85 3.85a1.5 1.5 0 000 2.121l3.85 3.85a1.5 1.5 0 002.121 0l3.85-3.85a1.5 1.5 0 000-2.121z" /></svg>
                    }
                    onClick={handleGenerateRandom}
                    disabled={isGenerating}
                />
            </div>
        </div>
    );
};
