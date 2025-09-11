import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface UIStateContextType {
    isTutorialOpen: boolean;
    openTutorial: () => void;
    closeTutorial: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (!context) throw new Error('useUIState must be used within a UIStateProvider');
    return context;
};

export const UIStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    const openTutorial = useCallback(() => setIsTutorialOpen(true), []);
    const closeTutorial = useCallback(() => setIsTutorialOpen(false), []);

    const value = { isTutorialOpen, openTutorial, closeTutorial };

    return <UIStateContext.Provider value={value}>{children}</UIStateContext.Provider>;
};
