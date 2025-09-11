
import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

interface DockablePanelOptions {
    id: string;
    initialPosition: { x: number; y: number };
}

/**
 * Manages the state and behavior of a dockable panel.
 *
 * This hook centralizes logic for visibility (open/closed), position, and minimized state.
 * It syncs with the global AppContext for panel registration and z-index management.
 * State (position and minimized) is persisted to localStorage.
 *
 * @param {DockablePanelOptions} options - The configuration for the panel.
 * @param {string} options.id - A unique ID for the panel, used for state persistence.
 * @param {object} options.initialPosition - The panel's default position if none is saved.
 * @returns An object containing the panel's state and memoized action handlers.
 */
export const useDockablePanel = ({ id, initialPosition }: DockablePanelOptions) => {
    const { openPanels, openPanel, closePanel, bringPanelToFront: bringToFrontInContext } = useAppContext();
    
    const getInitialState = useCallback(() => {
        try {
            const savedPosition = localStorage.getItem(`panel-${id}-position`);
            const savedMinimized = localStorage.getItem(`panel-${id}-minimized`);
            return {
                position: savedPosition ? JSON.parse(savedPosition) : initialPosition,
                isMinimized: savedMinimized ? JSON.parse(savedMinimized) : false,
            };
        } catch (error) {
            console.error('Failed to parse localStorage item for panel state:', error);
            return { position: initialPosition, isMinimized: false };
        }
    }, [id, initialPosition]);

    const [position, setPosition] = useState(getInitialState().position);
    const [isMinimized, setIsMinimized] = useState(getInitialState().isMinimized);

    useEffect(() => {
        try {
            localStorage.setItem(`panel-${id}-position`, JSON.stringify(position));
        } catch (error) { console.error('Failed to save position to localStorage:', error); }
    }, [id, position]);

    useEffect(() => {
        try {
            localStorage.setItem(`panel-${id}-minimized`, JSON.stringify(isMinimized));
        } catch (error) { console.error('Failed to save minimized state to localStorage:', error); }
    }, [id, isMinimized]);

    const isOpen = openPanels.has(id);
    
    const open = useCallback(() => openPanel(id), [openPanel, id]);
    const close = useCallback(() => closePanel(id), [closePanel, id]);
    const toggleMinimize = useCallback(() => setIsMinimized(p => !p), []);
    const bringToFront = useCallback(() => bringToFrontInContext(id), [bringToFrontInContext, id]);
    
    return {
        isOpen,
        isMinimized,
        position,
        open,
        close,
        toggleMinimize,
        setPosition,
        bringToFront,
    };
};
