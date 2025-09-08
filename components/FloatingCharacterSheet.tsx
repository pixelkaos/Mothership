


import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Character, CharacterSaveData } from '../types';

interface FloatingCharacterSheetProps {
    isVisible: boolean;
    onClose: () => void;
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
}

const SheetSection: React.FC<{ title: string; children: React.ReactNode; className?: string; titleAddon?: React.ReactNode }> = ({ title, children, className = '', titleAddon }) => (
    <div className={`border border-primary/30 p-4 bg-black/30 ${className}`}>
        <div className="flex justify-center items-center gap-2 mb-4">
            <h3 className="text-center font-bold text-muted uppercase text-sm tracking-wider">{title}</h3>
            {titleAddon}
        </div>
        {children}
    </div>
);

const LabeledInput: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div>
        <label className="text-xs uppercase text-muted tracking-wider">{label}</label>
        <input
            type="text"
            readOnly
            value={value}
            className="w-full bg-black/50 border border-muted p-2 mt-1 focus:ring-0 focus:outline-none focus:border-primary text-foreground"
        />
    </div>
);

const VitalDisplay: React.FC<{ label: string; current: number; max: number; currentLabel: string; maxLabel: string; }> = ({ label, current, max, currentLabel, maxLabel }) => (
    <div className="flex flex-col items-center text-center">
        <span className="text-primary uppercase text-sm font-bold tracking-wider mb-1">{label}</span>
        <div className="font-bold text-foreground">
            <span className="text-4xl">{current}</span>
            <span className="text-2xl text-muted"> / </span>
            <span className="text-4xl">{max}</span>
        </div>
         <div className="flex justify-between w-full mt-0.5 px-2">
            <span className="text-muted text-xs">{currentLabel}</span>
            <span className="text-muted text-xs">{maxLabel}</span>
        </div>
    </div>
);

const StatDisplay: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-2 border-primary/50 rounded-full flex items-center justify-center bg-black/30">
            <span className="text-primary font-bold text-3xl">{value}</span>
        </div>
        <span className="text-muted uppercase text-xs font-bold tracking-wider mt-2">{label}</span>
    </div>
);


export const FloatingCharacterSheet: React.FC<FloatingCharacterSheetProps> = ({ isVisible, onClose, characterData, onCharacterUpdate }) => {
    const character = characterData?.character ?? null;
    const allSkills = character ? [...character.skills.trained, ...character.skills.expert, ...character.skills.master] : [];

    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const rollerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!rollerRef.current || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea')) return;
        setIsDragging(true);
        const rect = rollerRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !rollerRef.current) return;
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        const rollerWidth = rollerRef.current.offsetWidth;
        const rollerHeight = rollerRef.current.offsetHeight;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + rollerWidth > window.innerWidth) newX = window.innerWidth - rollerWidth;
        if (newY + rollerHeight > window.innerHeight) newY = window.innerHeight - rollerHeight;
        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) setIsDragging(false);
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (character) {
            onCharacterUpdate({ ...character, notes: e.target.value });
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            ref={rollerRef}
            className="fixed w-full max-w-2xl z-40"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: isDragging ? 'none' : 'auto',
            }}
        >
             <div
                className="flex justify-between items-center px-3 py-2 bg-black/50 border border-b-0 border-primary/50 cursor-move"
                onMouseDown={handleMouseDown}
            >
                <h4 className="font-bold text-primary uppercase tracking-wider text-sm">In-Game Character Sheet</h4>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-primary/70 hover:text-primary" aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </button>
                    <button onClick={onClose} className="text-primary/70 hover:text-primary" aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            
            {!isMinimized && (
                <div className="p-4 bg-background border border-primary/50 text-foreground space-y-4">
                     {!character ? (
                        <div className="p-8 text-center text-muted">
                            <p className="font-bold">No Character Loaded</p>
                            <p className="text-sm">Please load or create a character from the Character Hangar.</p>
                        </div>
                    ) : (
                        <>
                            {/* Top Section */}
                            <div className="flex gap-4">
                                <div className="w-32 h-32 flex-shrink-0 border border-primary/50">
                                     {character.portrait ? <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black/50 flex items-center justify-center text-muted text-xs">NO SIGNAL</div>}
                                </div>
                                <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 content-start">
                                    <div className="col-span-2"><LabeledInput label="Name" value={character.name} /></div>
                                    <LabeledInput label="Pronouns" value={character.pronouns} />
                                    <LabeledInput label="Class" value={character.class?.name || 'N/A'} />
                                </div>
                            </div>
                            
                            {/* Status Report */}
                             <SheetSection title="Status Report">
                                <div className="flex justify-around items-start py-2">
                                    <VitalDisplay label="Health" current={character.health.current} max={character.health.max} currentLabel="Current" maxLabel="Max" />
                                    <VitalDisplay label="Wounds" current={character.wounds.current} max={character.wounds.max} currentLabel="Current" maxLabel="Max" />
                                    <VitalDisplay label="Stress" current={character.stress.current} max={character.stress.minimum} currentLabel="Current" maxLabel="Min" />
                                </div>
                            </SheetSection>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SheetSection title="Stats" titleAddon={<div className="text-muted hover:text-primary cursor-pointer" title="Lock/Unlock Stats"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>}>
                                    <div className="flex justify-around py-2">
                                        <StatDisplay label="Strength" value={character.stats.strength} />
                                        <StatDisplay label="Speed" value={character.stats.speed} />
                                        <StatDisplay label="Intellect" value={character.stats.intellect} />
                                        <StatDisplay label="Combat" value={character.stats.combat} />
                                    </div>
                                </SheetSection>
                                <SheetSection title="Saves" titleAddon={<div className="text-muted hover:text-primary cursor-pointer" title="Lock/Unlock Saves"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>}>
                                    <div className="flex justify-around py-2">
                                        <StatDisplay label="Sanity" value={character.saves.sanity} />
                                        <StatDisplay label="Fear" value={character.saves.fear} />
                                        <StatDisplay label="Body" value={character.saves.body} />
                                    </div>
                                </SheetSection>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SheetSection title="Skills">
                                     <div className="max-h-32 overflow-y-auto bg-black/30 p-2 text-sm space-y-1">
                                        {allSkills.length > 0 ? allSkills.map(skill => <div key={skill} className="bg-black/50 p-2">{skill}</div>) : <p className="text-muted text-center italic p-4">No skills learned.</p>}
                                    </div>
                                </SheetSection>

                                <SheetSection title="Equipment">
                                    <div className="max-h-32 overflow-y-auto bg-black/30 p-2 text-sm space-y-1">
                                        {[character.equipment.loadout, ...character.equipment.inventory].filter(Boolean).length > 0 ? (
                                             [character.equipment.loadout, ...character.equipment.inventory].filter(Boolean).map((item, index) => <div key={index} className="bg-black/50 p-2">{item}</div>)
                                        ) : <p className="text-muted text-center italic p-4">No equipment.</p>}
                                    </div>
                                </SheetSection>
                            </div>

                             <SheetSection title="Notes">
                                <textarea 
                                    className="w-full h-24 bg-black/50 border border-muted p-2 focus:ring-0 focus:outline-none focus:border-primary text-foreground resize-y" 
                                    value={character.notes}
                                    onChange={handleNotesChange}
                                    placeholder="Session notes, character thoughts, etc."
                                ></textarea>
                            </SheetSection>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};