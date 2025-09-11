import React from 'react';
import { Button } from './Button';
import { DropdownMenu } from './ui/DropdownMenu';
import { useNavigation } from '../context/NavigationContext';
import { useUIState } from '../context/UIStateContext';
import { useCharacter } from '../context/CharacterContext';
import { useShip } from '../context/ShipContext';
import { usePanels, PanelId } from '../context/PanelsContext';
import type { View, NavigationView } from '../App';

export const Header: React.FC = () => {
    const { activeNav, setView } = useNavigation();
    const { openTutorial } = useUIState();
    const { isCharacterLoaded } = useCharacter();
    const { isShipManifestLoaded } = useShip();
    const panels = usePanels();
    
    const handleSetView = (targetView: NavigationView | PanelId) => {
        if (targetView === 'dice-roller' || targetView === 'character-sheet' || targetView === 'ship-manifest') {
            const panelState = panels.getState(targetView);
            
            if (targetView === 'character-sheet' && !isCharacterLoaded) return;
            if (targetView === 'ship-manifest' && !isShipManifestLoaded) return;

            panelState.isOpen ? panels.close(targetView) : panels.open(targetView);
            return;
        }
        
        if (targetView === 'tools') return; // 'tools' is for display state, not a view itself.
        setView(targetView as View);
    };

    const navButtonClasses = (isActive: boolean) => `py-2 px-4 rounded-none ${isActive ? 'bg-secondary text-background hover:bg-secondary' : 'text-secondary hover:bg-secondary hover:text-background'}`;

    return (
    <header className="relative text-center pb-4 pt-4 sm:pt-6 md:pt-8 px-4 sm:px-6 md:px-8">
        <button
            onClick={() => setView('home')}
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
            <Button variant="ghost" size="sm" onClick={() => setView('derelict')} className={navButtonClasses(activeNav === 'derelict')} aria-current={activeNav === 'derelict' ? 'page' : undefined}>
                Derelict Generator
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('shipyard')} className={navButtonClasses(activeNav === 'shipyard')} aria-current={activeNav === 'shipyard' ? 'page' : undefined}>
                Shipyard
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('character')} className={navButtonClasses(activeNav === 'character')} aria-current={activeNav === 'character' ? 'page' : undefined}>
                Character Hangar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setView('rules')} className={navButtonClasses(activeNav === 'rules')} aria-current={activeNav === 'rules' ? 'page' : undefined}>
                Rules
            </Button>
            <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                     <Button variant="ghost" size="sm" className={navButtonClasses(activeNav === 'tools')}>
                        Tools
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item onSelect={() => handleSetView('dice-roller')}>
                        Dice Roller
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => handleSetView('character-sheet')} disabled={!isCharacterLoaded}>
                        Character Sheet
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={() => handleSetView('ship-manifest')} disabled={!isShipManifestLoaded}>
                        Ship Manifest
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu>
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
