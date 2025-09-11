import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Character, CharacterSaveData } from '../types';
import { Button } from './Button';

interface FloatingCharacterSheetProps {
    isVisible: boolean;
    onClose: () => void;
    characterData: CharacterSaveData | null;
    onCharacterUpdate: (character: Character) => void;
    onRollRequest: (type: 'stat' | 'save', name: string) => void;
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

const StatDisplay: React.FC<{ label: string; value: number; onClick?: () => void; }> = ({ label, value, onClick }) => (
    <div className={`flex flex-col items-center ${onClick ? 'cursor-pointer group' : ''}`} onClick={onClick}>
        <div className={`w-16 h-16 border-2 border-primary/50 rounded-full flex items-center justify-center bg-black/30 transition-colors ${onClick ? 'group-hover:bg-primary/20 group-hover:border-primary' : ''}`}>
            <span className="text-primary font-bold text-3xl">{value}</span>
        </div>
        <span className="text-muted uppercase text-xs font-bold tracking-wider mt-2">{label}</span>
    </div>
);


// Helper component for individual equipment items with consumable tracking
const EquipmentItem = ({ item, onUpdate }: { 
    item: { value: string; source: 'loadout' | 'inventory'; index: number };
    onUpdate: (source: 'loadout' | 'inventory', index: number, newValue: string) => void;
}) => {
    // Regex for (xN) format, e.g., Stimpak (x5)
    const xRegex = /(.*?) ?\(x(\d+)\)/;
    // Regex for (N unit) format, e.g., Pulse Rifle (3 mags)
    const unitRegex = /(.*?) ?\((\d+)\s+(mags?|rounds?|charges?|doses?|shots?)\)/i;

    const xMatch = item.value.match(xRegex);
    const unitMatch = !xMatch ? item.value.match(unitRegex) : null; // Prevent double-matching

    const match = xMatch || unitMatch;

    if (!match) {
        return <div className="bg-black/50 p-2">{item.value}</div>;
    }

    const namePart = match[1].trim();
    const quantityPart = parseInt(match[2], 10);
    const isXType = !!xMatch;
    const unitPart = isXType ? '' : match[3];

    const handleUpdateQuantity = (newQuantity: number) => {
        let newValue: string;
        if (isXType) {
            newValue = `${namePart} (x${newQuantity})`;
        } else {
            newValue = `${namePart} (${newQuantity} ${unitPart})`;
        }
        onUpdate(item.source, item.index, newValue);
    };

    const handleDecrement = () => {
        if (quantityPart > 0) {
            handleUpdateQuantity(quantityPart - 1);
        }
    };
    
    const handleIncrement = () => {
        handleUpdateQuantity(quantityPart + 1);
    };

    return (
        <div className="bg-black/50 p-2 flex justify-between items-center text-sm">
            <span>{namePart}</span>
            <div className="flex items-center gap-2">
                <Button variant="tertiary" size="sm" onClick={handleDecrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Decrease ${namePart} quantity`}>-</Button>
                <span className="font-mono w-20 text-center">{quantityPart} {unitPart}</span>
                <Button variant="tertiary" size="sm" onClick={handleIncrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Increase ${namePart} quantity`}>+</Button>
            </div>
        </div>
    );
};


export const FloatingCharacterSheet: React.FC<FloatingCharacterSheetProps> = ({ isVisible, onClose, characterData, onCharacterUpdate, onRollRequest }) => {
    const character = characterData?.character ?? null;
    const allSkills = character ? [...character.skills.trained, ...character.skills.expert, ...character.skills.master] : [];
    
    const allEquipment = useMemo(() => {
        if (!character) return [];
        const loadoutItems = character.equipment.loadout
            ? character.equipment.loadout.split(',').map((item, index) => ({
                  value: item.trim(),
                  source: 'loadout' as const,
                  index,
              }))
            : [];
        const inventoryItems = character.equipment.inventory.map((item, index) => ({
            value: item.trim(),
            source: 'inventory' as const,
            index,
        }));
        return [...loadoutItems, ...inventoryItems].filter(item => item.value);
    }, [character]);

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
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
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
                                <SheetSection title="Stats">
                                    <div className="flex justify-around py-2">
                                        <StatDisplay label="Strength" value={character.stats.strength} onClick={() => onRollRequest('stat', 'strength')} />
                                        <StatDisplay label="Speed" value={character.stats.speed} onClick={() => onRollRequest('stat', 'speed')} />
                                        <StatDisplay label="Intellect" value={character.stats.intellect} onClick={() => onRollRequest('stat', 'intellect')} />
                                        <StatDisplay label="Combat" value={character.stats.combat} onClick={() => onRollRequest('stat', 'combat')} />
                                    </div>
                                </SheetSection>
                                <SheetSection title="Saves">
                                    <div className="flex justify-around py-2">
                                        <StatDisplay label="Sanity" value={character.saves.sanity} onClick={() => onRollRequest('save', 'sanity')} />
                                        <StatDisplay label="Fear" value={character.saves.fear} onClick={() => onRollRequest('save', 'fear')} />
                                        <StatDisplay label="Body" value={character.saves.body} onClick={() => onRollRequest('save', 'body')} />
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
                                        {allEquipment.length > 0 ? (
                                            allEquipment.map((item) => (
                                                <EquipmentItem
                                                    key={`${item.source}-${item.index}-${item.value}`}
                                                    item={item}
                                                    onUpdate={handleEquipmentUpdate}
                                                />
                                            ))
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