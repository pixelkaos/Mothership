

import React, { useState } from 'react';
import type { NavigationView } from '../App';

interface HeaderProps {
    onShowTutorial: () => void;
    activeView: NavigationView | null;
    onSetView: (view: NavigationView | 'dice-roller' | 'character-sheet') => void;
    isCharacterLoaded: boolean;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children?: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => {
    const baseClasses = 'px-4 py-2 uppercase text-sm tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus';
    const activeClasses = 'bg-secondary text-background';
    const inactiveClasses = 'bg-transparent text-secondary hover:bg-secondary hover:text-background';
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
            {children}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ onShowTutorial, activeView, onSetView, isCharacterLoaded }) => {
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    return (
    <header className="relative text-center pb-4 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <button
            onClick={() => onSetView('home')}
            className="bg-transparent border-0 p-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus rounded-sm"
            aria-label="Go to home page"
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-widest uppercase text-primary transition-colors group-hover:text-primary-hover">
                MOTHERSHIP
            </h1>
            <h2 className="text-lg sm:text-xl text-foreground/80 tracking-[0.2em] mb-4 transition-colors group-hover:text-foreground">
                RPG COMPANION
            </h2>
        </button>
        
        <div className="flex justify-center border-y border-secondary/50">
            <NavButton label="Derelict Generator" isActive={activeView === 'derelict'} onClick={() => onSetView('derelict')} />
            <NavButton label="Character Hangar" isActive={activeView === 'character'} onClick={() => onSetView('character')} />
            <NavButton label="Rules" isActive={activeView === 'rules'} onClick={() => onSetView('rules')} />
            <div 
                className="relative"
                onMouseEnter={() => setIsToolsOpen(true)}
                onMouseLeave={() => setIsToolsOpen(false)}
            >
                <NavButton label="Tools" isActive={activeView === 'tools'} onClick={() => {}} />
                {isToolsOpen && (
                    <div className="absolute top-full left-0 w-full bg-background border border-t-0 border-secondary/50 shadow-lg z-20 animate-fadeIn">
                        <button 
                            onClick={() => onSetView('dice-roller')}
                            className="block w-full text-left px-4 py-2 uppercase text-sm tracking-widest transition-colors duration-200 text-secondary hover:bg-secondary hover:text-background"
                        >
                            Dice Roller
                        </button>
                        <button
                            onClick={() => onSetView('character-sheet')}
                            disabled={!isCharacterLoaded}
                            className="block w-full text-left px-4 py-2 uppercase text-sm tracking-widest transition-colors duration-200 text-secondary hover:bg-secondary hover:text-background disabled:text-muted disabled:bg-black/20 disabled:cursor-not-allowed"
                        >
                            Character Sheet
                        </button>
                    </div>
                )}
            </div>
        </div>

        <button
            onClick={onShowTutorial}
            className="absolute top-2 right-2 px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed disabled:border-secondary-hover disabled:text-secondary-hover/70 disabled:cursor-not-allowed"
        >
            How to Play
        </button>
    </header>
)};