import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { View, NavigationView } from '@/App';
import { usePanels } from '@/context/PanelsContext';

interface NavigationContextType {
    view: View;
    setView: (view: View) => void;
    activeNav: NavigationView;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
    return context;
};

const getActiveNav = (currentView: View, openPanelIds: string[]): NavigationView => {
    const hasToolsOpen = openPanelIds.some(id => ['dice-roller', 'character-sheet', 'ship-manifest'].includes(id));
    
    if (hasToolsOpen) {
        return 'tools';
    }

    if (['derelict', 'character', 'rules', 'shipyard', 'home'].includes(currentView)) {
        return currentView as NavigationView;
    }
    return 'home';
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<View>('home');
    const { openPanelIds } = usePanels();

    const activeNav = useMemo(() => getActiveNav(view, openPanelIds), [view, openPanelIds]);

    const value = { view, setView, activeNav };

    return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};
