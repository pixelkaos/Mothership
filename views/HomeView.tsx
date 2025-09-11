import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { Button } from '../components/Button';
import { Card } from '../components/ui/Card';

export const HomeView: React.FC = () => {
    const { setView } = useNavigation();

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-space-10 px-space-4 sm:px-space-6 md:px-space-8">
            <div className="text-center mb-12 animate-fadeIn">
                 <p className="text-secondary tracking-widest animate-pulse">
                    // SURVIVAL IS NOT GUARANTEED //
                </p>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-space-8">
                <div className="animate-slideInUp" style={{ animationDelay: '200ms' }}>
                    <Card
                        title="Derelict Generator"
                        description="Scan the void for drifting hulks. Generate random derelict ships, complete with their class, status, cargo, and a grim cause of their ruination."
                        visualContent={
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.042A5.25 5.25 0 017.5 15h-3.388a2.25 2.25 0 01-1.995-3.184l1.414-2.828a2.25 2.25 0 013.99-1.816l.12-1.08a2.25 2.25 0 012.25-1.995h1.5a2.25 2.25 0 012.25 1.995l.12 1.08a2.25 2.25 0 013.99 1.816l1.414 2.828a2.25 2.25 0 01-1.995 3.184h-3.388a5.25 5.25 0 01-.788.042l-2.022-2.022a3 3 0 00-4.242 0l-2.022 2.022z" />
                                <path d="M11.25 12.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" fill="currentColor"/>
                                <path d="M15.75 12.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" fill="currentColor"/>
                            </svg>
                        }
                        onClick={() => setView('derelict')}
                        action={
                            <Button tabIndex={-1} className="w-full mt-auto">
                                Access Terminal
                            </Button>
                        }
                    />
                </div>
                 <div className="animate-slideInUp" style={{ animationDelay: '400ms' }}>
                    <Card
                        title="Character Hangar"
                        description="Your life is cheap, make a new one. Create a new character from scratch, load a veteran, or quickly generate a random recruit for the meat grinder."
                        visualContent={
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        onClick={() => setView('character')}
                        action={
                            <Button tabIndex={-1} className="w-full mt-auto">
                                Access Terminal
                            </Button>
                        }
                    />
                </div>
                 <div className="animate-slideInUp" style={{ animationDelay: '600ms' }}>
                    <Card
                        title="Rules Database"
                        description="Access the Mothership player-facing rules. A searchable database for quick reference on checks, combat, stress, panic, and survival."
                        visualContent={
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                        }
                        onClick={() => setView('rules')}
                        action={
                            <Button tabIndex={-1} className="w-full mt-auto">
                                Access Terminal
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    );
};