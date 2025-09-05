
import React from 'react';
import type { NavigationView, View } from '../App';

interface HeaderProps {
    onShowTutorial: () => void;
    activeView: NavigationView;
    onSetView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    const baseClasses = 'px-4 py-2 uppercase text-sm tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus';
    const activeClasses = 'bg-secondary text-background';
    const inactiveClasses = 'bg-transparent text-secondary hover:bg-secondary hover:text-background';
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ onShowTutorial, activeView, onSetView }) => (
    <header className="relative text-center pb-4">
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
        </div>

        <button
            onClick={onShowTutorial}
            className="absolute top-2 right-2 px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-background active:bg-secondary-pressed active:border-secondary-pressed disabled:border-secondary-hover disabled:text-secondary-hover/70 disabled:cursor-not-allowed"
        >
            How to Play
        </button>
    </header>
);
