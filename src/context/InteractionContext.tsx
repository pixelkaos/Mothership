import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { usePanels } from '@/context/PanelsContext';

interface InteractionContextType {
    activeDiceCheck: { type: 'stat' | 'save', name: string } | null;
    requestDiceRoll: (check: { type: 'stat' | 'save', name: string }) => void;
    clearActiveDiceCheck: () => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

export const useInteraction = () => {
    const context = useContext(InteractionContext);
    if (!context) throw new Error('useInteraction must be used within an InteractionProvider');
    return context;
};

export const InteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeDiceCheck, setActiveDiceCheck] = useState<{ type: 'stat' | 'save', name: string } | null>(null);
    const { open } = usePanels();
    
    const requestDiceRoll = useCallback((check: { type: 'stat' | 'save', name: string }) => {
        setActiveDiceCheck(check);
        open('dice-roller');
    }, [open]);
    
    const clearActiveDiceCheck = useCallback(() => setActiveDiceCheck(null), []);

    const value = { activeDiceCheck, requestDiceRoll, clearActiveDiceCheck };

    return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
};
