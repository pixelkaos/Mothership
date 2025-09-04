import React, { useState } from 'react';
import { Header } from './components/Header';
import { DerelictGeneratorView } from './views/DerelictGeneratorView';
import { CharacterCreatorView } from './views/CharacterCreatorView';
import { TutorialModal } from './components/TutorialModal';
import { TooltipProvider } from './components/Tooltip';

export type View = 'derelict' | 'character';

const App: React.FC = () => {
    const [view, setView] = useState<View>('derelict');
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-black text-green-400 p-4 sm:p-6 md:p-8 flex flex-col">
                <Header
                    activeView={view}
                    onSetView={setView}
                    onShowTutorial={() => setIsTutorialOpen(true)}
                />
                {isTutorialOpen && <TutorialModal onClose={() => setIsTutorialOpen(false)} />}
                
                <main className="flex-grow mt-6">
                    {view === 'derelict' && <DerelictGeneratorView />}
                    {view === 'character' && <CharacterCreatorView />}
                </main>
                
                 <footer className="text-center text-xs text-green-700 mt-8">
                    <p>Mothership Sci-Fi Horror RPG is a trademark of Tuesday Knight Games. This is an unofficial fan-made tool.</p>
                </footer>
            </div>
        </TooltipProvider>
    );
};

export default App;
