
import React from 'react';
import type { View } from '../App';

interface HeaderProps {
    onShowTutorial: () => void;
    activeView: View;
    onSetView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    const activeClasses = 'bg-primary/20 text-primary';
    const inactiveClasses = 'text-foreground/70 hover:bg-primary/10 hover:text-foreground';
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 uppercase text-sm tracking-widest transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ onShowTutorial, activeView, onSetView }) => (
    <header className="relative text-center pb-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-widest uppercase text-primary">
            MOTHERSHIP
        </h1>
        <h2 className="text-lg sm:text-xl text-foreground/80 tracking-[0.2em] mb-4">
            RPG COMPANION
        </h2>
        
        <div className="flex justify-center border-y border-primary/50">
            <NavButton label="Derelict Generator" isActive={activeView === 'derelict'} onClick={() => onSetView('derelict')} />
            <NavButton label="Character Hangar" isActive={activeView === 'character'} onClick={() => onSetView('character')} />
        </div>

        <button
            onClick={onShowTutorial}
            className="absolute top-2 right-2 px-3 py-2 border border-primary/50 text-primary/80 uppercase text-xs tracking-widest hover:bg-primary/20 hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
        >
            How to Play
        </button>
    </header>
);