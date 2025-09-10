import React, { useState } from 'react';
import { Header } from './components/Header';
import { DerelictGeneratorView } from './views/DerelictGeneratorView';
import { CharacterCreatorView } from './views/CharacterCreatorView';
import { RulesView } from './views/RulesView';
import { HomeView } from './views/HomeView';
import { FloatingDiceRoller } from './components/FloatingDiceRoller';
import { TutorialModal } from './components/TutorialModal';
import { TooltipProvider } from './components/Tooltip';
import type { Character, CharacterSaveData, DerelictShip, ShipData, ShipManifestData } from './types';
import { FloatingCharacterSheet } from './components/FloatingCharacterSheet';
import { FloatingShipManifest } from './components/FloatingShipManifest';
import { ShipyardView } from './views/ShipyardView';
import { SHIP_DATA } from './data/shipData';

export type NavigationView = 'derelict' | 'character' | 'rules' | 'tools' | 'home' | 'shipyard';
export type View = 'home' | 'derelict' | 'character' | 'rules' | 'shipyard';

const getActiveNav = (currentView: View): NavigationView | null => {
    if (currentView === 'derelict' || currentView === 'character' || currentView === 'rules' || currentView === 'shipyard') {
        return currentView;
    }
    return null;
};


const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    
    // Character state
    const [activeCharacterData, setActiveCharacterData] = useState<CharacterSaveData | null>(null);
    const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState<boolean>(false);

    // Ship Manifest state
    const [activeShipManifest, setActiveShipManifest] = useState<ShipManifestData | null>(null);
    const [isShipManifestOpen, setIsShipManifestOpen] = useState<boolean>(false);

    // Dice Roller state
    const [isDiceRollerOpen, setIsDiceRollerOpen] = useState<boolean>(false);
    
    const activeNav = getActiveNav(view);

    const handleSetView = (targetView: NavigationView | 'dice-roller' | 'character-sheet' | 'ship-manifest') => {
        if (targetView === 'dice-roller') {
            setIsDiceRollerOpen(prev => !prev);
            return;
        }
        if (targetView === 'character-sheet') {
            if (activeCharacterData) setIsCharacterSheetOpen(prev => !prev);
            return;
        }
        if (targetView === 'ship-manifest') {
            if(activeShipManifest) setIsShipManifestOpen(prev => !prev);
            return;
        }
        if (targetView === 'tools') return; // "Tools" is a category, not a view itself.
        setView(targetView as View);
    };

    const handleCharacterUpdate = (updatedCharacter: Character) => {
        if (activeCharacterData) {
            setActiveCharacterData(prevData => ({
                ...(prevData as CharacterSaveData),
                character: updatedCharacter,
            }));
        }
    };
    
    const handleOpenManifest = (shipData: DerelictShip) => {
        const shipModelName = shipData.shipModel.split(' (')[0];
        const shipDetails = SHIP_DATA.find(s => s.name === shipModelName);
        
        const newManifest: ShipManifestData = {
            identifier: shipData.name,
            captain: '',
            modelInfo: shipData.shipModel,
            transponderOn: true,
            stats: {
                thrusters: shipDetails?.stats.thrusters ?? 1,
                battle: shipDetails?.stats.weapons ?? 1,
                systems: shipDetails?.stats.systems ?? 1,
            },
            o2Remaining: 100,
            fuel: { current: shipDetails?.fuel ?? 0, max: shipDetails?.fuel ?? 10 },
            warpCores: 0,
            cryopods: shipDetails?.cryopods ?? 0,
            escapePods: parseInt(shipDetails?.escape_pods ?? '0'),
            weapons: { base: shipDetails?.stats.base_weapons ?? shipDetails?.stats.weapons ?? 1, total: shipDetails?.stats.weapons ?? 1 },
            megadamage: { base: 0, total: 0 },
            hardpoints: { installed: parseInt(shipDetails?.hardpoints.split('/')[0] ?? '0'), max: parseInt(shipDetails?.hardpoints.split('/')[1] ?? '0') },
            hullPoints: 0,
            megadamageLevel: 0,
            deckplan: {},
            upgrades: { installed: 0, max: parseInt(shipDetails?.upgrades.split('/')[1] ?? '0'), list: ''},
            cargo: `Notable Cargo: ${shipData.cargo}\nPotential Salvage: ${shipData.salvage}`,
            repairs: { minor: `Cause of Ruination: ${shipData.causeOfRuination}\nAnomaly: ${shipData.weirdTrait}`, major: '' },
            crew: { current: 0, max: shipDetails?.crew ?? 0, list: `Survivors: ${shipData.survivors}` }
        };

        setActiveShipManifest(newManifest);
        setIsShipManifestOpen(true);
    };

    const handleOpenShipyardManifest = (shipData: ShipData) => {
        const newManifest: ShipManifestData = {
            identifier: shipData.name,
            captain: '',
            modelInfo: `${shipData.name} (${shipData.modelCode})`,
            transponderOn: true,
            stats: {
                thrusters: shipData.stats.thrusters,
                battle: shipData.stats.weapons,
                systems: shipData.stats.systems,
            },
            o2Remaining: 100,
            fuel: { current: shipData.fuel, max: shipData.fuel },
            warpCores: 0,
            cryopods: shipData.cryopods,
            escapePods: parseInt(shipData.escape_pods.split(' ')[0]) || 0,
            weapons: { base: shipData.stats.base_weapons ?? shipData.stats.weapons, total: shipData.stats.weapons },
            megadamage: { base: 0, total: 0 },
            hardpoints: { installed: parseInt(shipData.hardpoints.split('/')[0]), max: parseInt(shipData.hardpoints.split('/')[1]) },
            hullPoints: 0,
            megadamageLevel: 0,
            deckplan: {},
            upgrades: { installed: parseInt(shipData.upgrades.split('/')[0]), max: parseInt(shipData.upgrades.split('/')[1]), list: ''},
            cargo: '',
            repairs: { minor: shipData.notes || '', major: '' },
            crew: { current: 0, max: shipData.crew, list: '' }
        };
        setActiveShipManifest(newManifest);
        setIsShipManifestOpen(true);
    };


    return (
        <TooltipProvider>
            <div className="min-h-screen flex flex-col">
                <Header
                    activeView={isDiceRollerOpen || isCharacterSheetOpen || isShipManifestOpen ? 'tools' : activeNav}
                    onSetView={handleSetView}
                    onShowTutorial={() => setIsTutorialOpen(true)}
                    isCharacterLoaded={activeCharacterData !== null}
                    isShipManifestLoaded={activeShipManifest !== null}
                />

                {isTutorialOpen && <TutorialModal onClose={() => setIsTutorialOpen(false)} />}
                
                <FloatingDiceRoller
                    isVisible={isDiceRollerOpen}
                    onClose={() => setIsDiceRollerOpen(false)}
                    characterData={activeCharacterData}
                />

                <FloatingCharacterSheet
                    isVisible={isCharacterSheetOpen}
                    onClose={() => setIsCharacterSheetOpen(false)}
                    characterData={activeCharacterData}
                    onCharacterUpdate={handleCharacterUpdate}
                />

                <FloatingShipManifest
                    isVisible={isShipManifestOpen}
                    onClose={() => setIsShipManifestOpen(false)}
                    shipData={activeShipManifest}
                    onUpdate={setActiveShipManifest}
                />
                
                <main className={`flex-grow ${view === 'home' ? '' : 'p-4 sm:p-6 md:p-8 mt-6'}`}>
                    {view === 'home' && <HomeView onSetView={handleSetView} />}
                    {view === 'derelict' && <DerelictGeneratorView onOpenManifest={handleOpenManifest} />}
                    {view === 'character' && (
                        <CharacterCreatorView 
                            characterData={activeCharacterData} 
                            onCharacterUpdate={setActiveCharacterData}
                            onOpenSheet={() => setIsCharacterSheetOpen(true)}
                        />
                    )}
                    {view === 'rules' && <RulesView />}
                    {view === 'shipyard' && <ShipyardView onOpenShipyardManifest={handleOpenShipyardManifest} />}
                </main>
                
                <footer className="text-center text-xs text-muted mt-8 p-4">
                    <p>Mothership Sci-Fi Horror RPG is a trademark of Tuesday Knight Games. This is an unofficial fan-made tool.</p>
                </footer>
            </div>
        </TooltipProvider>
    );
};

export default App;