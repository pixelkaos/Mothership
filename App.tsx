

import React, { useState } from 'react';
import { Header } from './components/Header';
import { DerelictGeneratorView } from './views/DerelictGeneratorView';
import { CharacterCreatorView } from './views/CharacterCreatorView';
import { RulesView } from './views/RulesView';
import { HomeView } from './views/HomeView';
import { TutorialModal } from './components/TutorialModal';
import { TooltipProvider } from './components/Tooltip';
import type { CharacterSaveData } from './types';

export type NavigationView = 'derelict' | 'character' | 'rules';
export type View = 'home' | NavigationView;

const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    const [activeCharacterData, setActiveCharacterData] = useState<CharacterSaveData | null>(null);


    return (
        <TooltipProvider>
            <div className={`min-h-screen flex flex-col ${view === 'home' ? '' : 'p-4 sm:p-6 md:p-8'}`}>
                {view !== 'home' && (
                    <Header
                        activeView={view as NavigationView}
                        onSetView={setView}
                        onShowTutorial={() => setIsTutorialOpen(true)}
                    />
                )}
                {isTutorialOpen && <TutorialModal onClose={() => setIsTutorialOpen(false)} />}
                
                <main className={`flex-grow ${view !== 'home' ? 'mt-6' : ''}`}>
                    {view === 'home' && <HomeView onSetView={setView} />}
                    {view === 'derelict' && <DerelictGeneratorView />}
                    {view === 'character' && <CharacterCreatorView characterData={activeCharacterData} onCharacterUpdate={setActiveCharacterData} />}
                    {view === 'rules' && <RulesView />}
                </main>
                
                 {view !== 'home' && (
                    <footer className="text-center text-xs text-muted mt-8">
                        <p>Mothership Sci-Fi Horror RPG is a trademark of Tuesday Knight Games. This is an unofficial fan-made tool.</p>
                    </footer>
                 )}
            </div>
        </TooltipProvider>
    );
};

export default App;