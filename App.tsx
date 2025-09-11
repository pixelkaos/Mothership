
import React from 'react';
import { Header } from './components/Header';
import { DerelictGeneratorView } from './views/DerelictGeneratorView';
import { CharacterCreatorView } from './views/CharacterCreatorView';
import { RulesView } from './views/RulesView';
import { HomeView } from './views/HomeView';
import { FloatingDiceRoller } from './components/FloatingDiceRoller';
import { TutorialModal } from './components/TutorialModal';
import { TooltipProvider } from './components/Tooltip';
import { FloatingCharacterSheet } from './components/FloatingCharacterSheet';
import { FloatingShipManifest } from './components/FloatingShipManifest';
import { ShipyardView } from './views/ShipyardView';
import { useAppContext } from './context/AppContext';

export type View = 'home' | 'derelict' | 'character' | 'rules' | 'shipyard';
export type NavigationView = 'derelict' | 'character' | 'rules' | 'tools' | 'home' | 'shipyard';


const App: React.FC = () => {
    const {
        view,
        isTutorialOpen,
        closeTutorial,
        activeCharacterData,
        activeDiceCheck,
        handleCharacterUpdate,
        activeShipManifest,
        setActiveShipManifest,
    } = useAppContext();

    return (
        <TooltipProvider>
            <div className="min-h-screen flex flex-col">
                <Header />

                {isTutorialOpen && <TutorialModal onClose={closeTutorial} />}
                
                <FloatingDiceRoller
                    characterData={activeCharacterData}
                    activeCheck={activeDiceCheck}
                    onCharacterUpdate={handleCharacterUpdate}
                />

                <FloatingCharacterSheet
                    characterData={activeCharacterData}
                    onCharacterUpdate={handleCharacterUpdate}
                />

                <FloatingShipManifest
                    shipData={activeShipManifest}
                    onUpdate={setActiveShipManifest}
                />
                
                <main className={`flex-grow ${view === 'home' ? '' : 'p-4 sm:p-6 md:p-8 mt-6'}`}>
                    {view === 'home' && <HomeView />}
                    {view === 'derelict' && <DerelictGeneratorView />}
                    {view === 'character' && <CharacterCreatorView />}
                    {view === 'rules' && <RulesView />}
                    {view === 'shipyard' && <ShipyardView />}
                </main>
                
                <footer className="text-center text-xs text-muted mt-8 p-4">
                    <p>Mothership Sci-Fi Horror RPG is a trademark of Tuesday Knight Games. This is an unofficial fan-made tool.</p>
                </footer>
            </div>
        </TooltipProvider>
    );
};

export default App;