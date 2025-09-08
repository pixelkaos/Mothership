

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DerelictGeneratorView } from './views/DerelictGeneratorView';
import { CharacterCreatorView } from './views/CharacterCreatorView';
import { RulesView } from './views/RulesView';
import { HomeView } from './views/HomeView';
import { FloatingDiceRoller } from './components/FloatingDiceRoller';
import { TutorialModal } from './components/TutorialModal';
import { TooltipProvider } from './components/Tooltip';
import type { CharacterSaveData } from './types';
import { FloatingCharacterSheet } from './components/FloatingCharacterSheet';

export type NavigationView = 'derelict' | 'character' | 'rules' | 'tools' | 'home';
export type View = 'home' | 'derelict' | 'character' | 'rules';

const getActiveNav = (currentView: View): NavigationView | null => {
    if (currentView === 'derelict' || currentView === 'character' || currentView === 'rules') {
        return currentView;
    }
    return null;
};


const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    const [activeCharacterData, setActiveCharacterData] = useState<CharacterSaveData | null>(null);
    const [isDiceRollerOpen, setIsDiceRollerOpen] = useState<boolean>(false);
    const [isCharacterSheetOpen, setIsCharacterSheetOpen] = useState<boolean>(false);
    
    const activeNav = getActiveNav(view);

    const handleSetView = (targetView: NavigationView | 'dice-roller' | 'character-sheet') => {
        if (targetView === 'dice-roller') {
            setIsDiceRollerOpen(prev => !prev);
            return;
        }
        if (targetView === 'character-sheet') {
            if (activeCharacterData) {
                setIsCharacterSheetOpen(prev => !prev);
            }
            return;
        }
        if (targetView === 'tools') return; // "Tools" is a category, not a view itself.
        setView(targetView as View);
    };


    return (
        <TooltipProvider>
            <div className="min-h-screen flex flex-col">
                <Header
                    activeView={isDiceRollerOpen || isCharacterSheetOpen ? 'tools' : activeNav}
                    onSetView={handleSetView}
                    onShowTutorial={() => setIsTutorialOpen(true)}
                    isCharacterLoaded={activeCharacterData !== null}
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
                />
                
                <main className={`flex-grow ${view === 'home' ? '' : 'p-4 sm:p-6 md:p-8 mt-6'}`}>
                    {view === 'home' && <HomeView onSetView={handleSetView} />}
                    {view === 'derelict' && <DerelictGeneratorView />}
                    {view === 'character' && (
                        <CharacterCreatorView 
                            characterData={activeCharacterData} 
                            onCharacterUpdate={setActiveCharacterData}
                            onOpenSheet={() => setIsCharacterSheetOpen(true)}
                        />
                    )}
                    {view === 'rules' && <RulesView />}
                </main>
                
                <footer className="text-center text-xs text-muted mt-8 p-4">
                    <p>Mothership Sci-Fi Horror RPG is a trademark of Tuesday Knight Games. This is an unofficial fan-made tool.</p>
                </footer>
            </div>
        </TooltipProvider>
    );
};

export default App;