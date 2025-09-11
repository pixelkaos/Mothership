import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './Button';

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children?: React.ReactNode;
}> = ({ label, isActive, onClick }) => {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={`py-2 px-4 rounded-none ${isActive ? 'bg-secondary text-background hover:bg-secondary' : 'text-secondary hover:bg-secondary hover:text-background'}`}
        >
            {label}
        </Button>
    );
};

export const Header: React.FC = () => {
    const { activeNav, handleSetView, openTutorial, isCharacterLoaded, isShipManifestLoaded, isDiceRollerOpen, isCharacterSheetOpen, isShipManifestOpen } = useAppContext();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    
    const activeView = isDiceRollerOpen || isCharacterSheetOpen || isShipManifestOpen ? 'tools' : activeNav;

    return (
    <header className="relative text-center pb-4 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <button
            onClick={() => handleSetView('home')}
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
            <NavButton label="Derelict Generator" isActive={activeView === 'derelict'} onClick={() => handleSetView('derelict')} />
            <NavButton label="Shipyard" isActive={activeView === 'shipyard'} onClick={() => handleSetView('shipyard')} />
            <NavButton label="Character Hangar" isActive={activeView === 'character'} onClick={() => handleSetView('character')} />
            <NavButton label="Rules" isActive={activeView === 'rules'} onClick={() => handleSetView('rules')} />
            <div 
                className="relative"
                onMouseEnter={() => setIsToolsOpen(true)}
                onMouseLeave={() => setIsToolsOpen(false)}
            >
                <NavButton label="Tools" isActive={activeView === 'tools'} onClick={() => {}} />
                {isToolsOpen && (
                    <div className="absolute top-full left-0 w-full bg-background border border-t-0 border-secondary/50 shadow-lg z-20 animate-fadeIn">
                        <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetView('dice-roller')}
                            className="block w-full text-left justify-start px-4 text-secondary hover:bg-secondary hover:text-background rounded-none"
                        >
                            Dice Roller
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetView('character-sheet')}
                            disabled={!isCharacterLoaded}
                            className="block w-full text-left justify-start px-4 text-secondary hover:bg-secondary hover:text-background disabled:text-muted disabled:bg-black/20 rounded-none"
                        >
                            Character Sheet
                        </Button>
                         <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetView('ship-manifest')}
                            disabled={!isShipManifestLoaded}
                            className="block w-full text-left justify-start px-4 text-secondary hover:bg-secondary hover:text-background disabled:text-muted disabled:bg-black/20 rounded-none"
                        >
                            Ship Manifest
                        </Button>
                    </div>
                )}
            </div>
        </div>

        <Button
            variant="secondary"
            size="sm"
            onClick={openTutorial}
            className="absolute top-2 right-2"
        >
            How to Play
        </Button>
    </header>
)};