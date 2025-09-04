
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
    const activeClasses = 'bg-green-700/50 text-green-200';
    const inactiveClasses = 'bg-green-900/20 text-green-500 hover:bg-green-800/40';
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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-widest uppercase text-green-400">
            MOTHERSHIP
        </h1>
        <h2 className="text-lg sm:text-xl text-green-500 tracking-[0.2em] mb-4">
            RPG COMPANION
        </h2>
        
        <div className="flex justify-center border-y-2 border-green-700">
            <NavButton label="Derelict Generator" isActive={activeView === 'derelict'} onClick={() => onSetView('derelict')} />
            <NavButton label="Character Hangar" isActive={activeView === 'character'} onClick={() => onSetView('character')} />
        </div>

        <button
            onClick={onShowTutorial}
            className="absolute top-2 right-2 px-3 py-2 bg-green-800/50 border border-green-600 text-green-300 uppercase text-xs tracking-widest hover:bg-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
        >
            How to Play
        </button>
    </header>
);
