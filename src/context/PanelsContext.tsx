
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';

export type PanelId = 'dice-roller' | 'character-sheet' | 'ship-manifest' | 'gm-chat';

export type PanelState = {
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  zIndex: number;
};

// The store holds state that should be persisted.
type PanelsStore = Record<PanelId, Omit<PanelState, 'zIndex' | 'isOpen'>>;

export interface PanelsContextValue {
  getState: (id: PanelId) => PanelState;
  open: (id: PanelId) => void;
  close: (id: PanelId) => void;
  minimize: (id: PanelId) => void;
  restore: (id: PanelId) => void;
  setPosition: (id: PanelId, pos: { x: number; y: number }) => void;
  bringToFront: (id: PanelId) => void;
  toggleMinimize: (id: PanelId) => void;
  openPanelIds: PanelId[];
}

const PanelsContext = createContext<PanelsContextValue | undefined>(undefined);

export const usePanels = () => {
    const context = useContext(PanelsContext);
    if (!context) {
        throw new Error('usePanels must be used within a PanelsProvider');
    }
    return context;
};

const PANEL_IDS: PanelId[] = ['dice-roller', 'character-sheet', 'ship-manifest', 'gm-chat'];

const INITIAL_POSITIONS: Record<PanelId, { x: number; y: number }> = {
    'dice-roller': { x: window.innerWidth / 2 - 224, y: 100 },
    'character-sheet': { x: 100, y: 100 },
    'ship-manifest': { x: 50, y: 50 },
    'gm-chat': { x: Math.max(24, window.innerWidth - 420), y: 120 },
};

const getInitialStore = (): PanelsStore => {
    const store: Partial<PanelsStore> = {};
    PANEL_IDS.forEach(id => {
        try {
            const savedState = localStorage.getItem(`panel-state-${id}`);
            if (savedState) {
                const { position, isMinimized } = JSON.parse(savedState);
                store[id] = { isMinimized, position };
            } else {
                throw new Error('No saved state');
            }
        } catch (error) {
            store[id] = {
                isMinimized: false,
                position: INITIAL_POSITIONS[id],
            };
        }
    });
    return store as PanelsStore;
};

export const PanelsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [store, setStore] = useState<PanelsStore>(getInitialStore);
    const [openPanels, setOpenPanels] = useState<Set<PanelId>>(new Set());
    const [stack, setStack] = useState<PanelId[]>([]);

    useEffect(() => {
        PANEL_IDS.forEach(id => {
            const { position, isMinimized } = store[id];
            try {
                localStorage.setItem(`panel-state-${id}`, JSON.stringify({ position, isMinimized }));
            } catch (error) {
                console.error(`Failed to save state for panel ${id}:`, error);
            }
        });
    }, [store]);

    const bringToFront = useCallback((id: PanelId) => {
        setStack(currentStack => [id, ...currentStack.filter(panelId => panelId !== id)]);
    }, []);

    const open = useCallback((id: PanelId) => {
        setOpenPanels(prev => new Set(prev).add(id));
        bringToFront(id);
    }, [bringToFront]);

    const close = useCallback((id: PanelId) => {
        setOpenPanels(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        setStack(currentStack => currentStack.filter(panelId => panelId !== id));
    }, []);
    
    const minimize = useCallback((id: PanelId) => {
        setStore(s => ({ ...s, [id]: { ...s[id], isMinimized: true } }));
    }, []);

    const restore = useCallback((id: PanelId) => {
        setStore(s => ({ ...s, [id]: { ...s[id], isMinimized: false } }));
    }, []);

    const toggleMinimize = useCallback((id: PanelId) => {
        setStore(s => ({ ...s, [id]: { ...s[id], isMinimized: !s[id].isMinimized } }));
    }, []);

    const setPosition = useCallback((id: PanelId, pos: { x: number; y: number }) => {
        setStore(s => ({ ...s, [id]: { ...s[id], position: pos } }));
    }, []);

    const getState = useCallback((id: PanelId): PanelState => {
        const panelState = store[id];
        const zIndex = stack.length - stack.indexOf(id) + 40;
        return { 
            ...panelState,
            isOpen: openPanels.has(id),
            zIndex: openPanels.has(id) ? zIndex : -1,
        };
    }, [store, stack, openPanels]);
    
    const openPanelIds = useMemo(() => Array.from(openPanels), [openPanels]);

    const value = useMemo(() => ({
        getState,
        open,
        close,
        minimize,
        restore,
        setPosition,
        bringToFront,
        toggleMinimize,
        openPanelIds,
    }), [getState, open, close, minimize, restore, setPosition, bringToFront, toggleMinimize, openPanelIds]);

    return <PanelsContext.Provider value={value}>{children}</PanelsContext.Provider>;
};
