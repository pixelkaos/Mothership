import React from 'react';
import { Button } from '@/components/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { useNavigation } from '@/context/NavigationContext';
import { useUIState } from '@/context/UIStateContext';
import { useCharacter } from '@/context/CharacterContext';
import { useShip } from '@/context/ShipContext';
import { usePanels, PanelId } from '@/context/PanelsContext';
import { OllamaStatusBadge } from '@/components/OllamaStatusBadge';
import { testStoryModel } from '@/services/geminiService';
import type { View, NavigationView } from '@/App';

export const Header: React.FC = () => {
    const { activeNav, setView } = useNavigation();
    const { openTutorial } = useUIState();
    const { isCharacterLoaded } = useCharacter();
    const { isShipManifestLoaded } = useShip();
    const panels = usePanels();
    
    const handleSetView = (targetView: NavigationView | PanelId) => {
        if (targetView === 'dice-roller' || targetView === 'character-sheet' || targetView === 'ship-manifest' || targetView === 'gm-chat') {
            const panelState = panels.getState(targetView);
            
            if (targetView === 'character-sheet' && !isCharacterLoaded) return;
            if (targetView === 'ship-manifest' && !isShipManifestLoaded) return;

            panelState.isOpen ? panels.close(targetView) : panels.open(targetView);
            return;
        }
        
        if (targetView === 'tools') return; // 'tools' is for display state, not a view itself.
        setView(targetView as View);
    };

    return (
    <header className="relative text-center pb-space-4 pt-space-4 sm:pt-space-6 md:pt-space-8 px-space-4 sm:px-space-6 md:px-space-8">
        <button
            onClick={() => setView('home')}
            className="bg-transparent border-0 p-0 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus rounded-radius-sm"
            aria-label="Go to home page"
        >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-widest uppercase text-primary transition-colors group-hover:opacity-90">
                MOTHERSHIP
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground/80 tracking-[0.2em] mb-space-4 transition-colors group-hover:text-foreground">
                RPG COMPANION
            </h2>
        </button>
        
        <div className="flex justify-center border-y border-secondary/50">
            <Button variant="nav" size="sm" onClick={() => setView('derelict')} isActive={activeNav === 'derelict'} aria-current={activeNav === 'derelict' ? 'page' : undefined}>
                Derelict Generator
            </Button>
            <Button variant="nav" size="sm" onClick={() => setView('shipyard')} isActive={activeNav === 'shipyard'} aria-current={activeNav === 'shipyard' ? 'page' : undefined}>
                Shipyard
            </Button>
            <Button variant="nav" size="sm" onClick={() => setView('character')} isActive={activeNav === 'character'} aria-current={activeNav === 'character' ? 'page' : undefined}>
                Character Hangar
            </Button>
            <Button variant="nav" size="sm" onClick={() => setView('rules')} isActive={activeNav === 'rules'} aria-current={activeNav === 'rules' ? 'page' : undefined}>
                Rules
            </Button>
            <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                     <Button variant="nav" size="sm" isActive={activeNav === 'tools'}>
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
                    <DropdownMenu.Item onSelect={() => handleSetView('gm-chat')}>
                        GM Chat
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onSelect={async () => {
                        try {
                            const out = await testStoryModel();
                            alert(`Story AI test response: ${out.substring(0, 200)}`);
                        } catch (e: any) {
                            alert(`Story AI test failed: ${e?.message || 'Unknown error'}`);
                        }
                    }}>
                        Test Story AI
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu>
        </div>

        <div className="absolute top-space-2 right-space-2 flex items-center">
        <OllamaStatusBadge />
        <Button
            variant="secondary"
            size="sm"
            onClick={openTutorial}
            className="ml-2"
        >
            How to Play
        </Button>
        </div>
    </header>
)};
