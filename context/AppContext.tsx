
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { View, NavigationView } from '../App';
import type { Character, CharacterSaveData, DerelictShip, ShipData, ShipManifestData } from '../types';
import { SHIP_DATA } from '../data/shipData';

interface AppContextType {
    view: View;
    setView: (view: View) => void;
    activeNav: NavigationView | null;
    
    isTutorialOpen: boolean;
    openTutorial: () => void;
    closeTutorial: () => void;

    clearActiveDiceCheck: () => void;
    activeDiceCheck: { type: 'stat' | 'save', name: string } | null;

    activeCharacterData: CharacterSaveData | null;
    setActiveCharacterData: React.Dispatch<React.SetStateAction<CharacterSaveData | null>>;
    handleCharacterUpdate: (updatedCharacter: Character) => void;
    isCharacterLoaded: boolean;

    activeShipManifest: ShipManifestData | null;
    setActiveShipManifest: React.Dispatch<React.SetStateAction<ShipManifestData | null>>;
    handleOpenDerelictManifest: (shipData: DerelictShip) => void;
    handleOpenShipyardManifest: (shipData: ShipData) => void;
    isShipManifestLoaded: boolean;

    handleSetView: (targetView: NavigationView | 'dice-roller' | 'character-sheet' | 'ship-manifest') => void;

    panelStack: string[];
    bringPanelToFront: (panelId: string) => void;
    openPanels: Set<string>;
    // FIX: Updated 'openPanel' type to accept an optional 'check' object for pre-populating the dice roller.
    openPanel: (panelId: string, check?: { type: 'stat' | 'save', name: string } | null) => void;
    closePanel: (panelId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const getActiveNav = (currentView: View): NavigationView | null => {
    if (['derelict', 'character', 'rules', 'shipyard'].includes(currentView)) {
        return currentView as NavigationView;
    }
    return null;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<View>('home');
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
    
    const [activeCharacterData, setActiveCharacterData] = useState<CharacterSaveData | null>(null);
    const [activeShipManifest, setActiveShipManifest] = useState<ShipManifestData | null>(null);
    const [activeDiceCheck, setActiveDiceCheck] = useState<{ type: 'stat' | 'save', name: string } | null>(null);

    // Panel Management
    const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
    const [panelStack, setPanelStack] = useState<string[]>([]);
    
    const bringPanelToFront = useCallback((panelId: string) => {
        setPanelStack(prev => [panelId, ...prev.filter(p => p !== panelId)]);
    }, []);
    
    const openPanel = useCallback((panelId: string, check?: { type: 'stat' | 'save', name: string } | null) => {
        if (check) {
            setActiveDiceCheck(check);
        }
        setOpenPanels(prev => new Set(prev).add(panelId));
        bringPanelToFront(panelId);
    }, [bringPanelToFront]);

    const closePanel = useCallback((panelId: string) => {
        setOpenPanels(prev => {
            const newSet = new Set(prev);
            newSet.delete(panelId);
            return newSet;
        });
        setPanelStack(prev => prev.filter(p => p !== panelId));
        if (panelId === 'dice-roller') {
            setActiveDiceCheck(null);
        }
    }, []);

    const activeNav = getActiveNav(view);
    const isCharacterLoaded = activeCharacterData !== null;
    const isShipManifestLoaded = activeShipManifest !== null;

    const openTutorial = useCallback(() => setIsTutorialOpen(true), []);
    const closeTutorial = useCallback(() => setIsTutorialOpen(false), []);

    const clearActiveDiceCheck = useCallback(() => {
        setActiveDiceCheck(null);
    }, []);

    const handleSetView = useCallback((targetView: NavigationView | 'dice-roller' | 'character-sheet' | 'ship-manifest') => {
        if (targetView === 'dice-roller') {
            openPanels.has('dice-roller') ? closePanel('dice-roller') : openPanel('dice-roller');
            return;
        }
        if (targetView === 'character-sheet') {
            if (isCharacterLoaded) openPanels.has('character-sheet') ? closePanel('character-sheet') : openPanel('character-sheet');
            return;
        }
        if (targetView === 'ship-manifest') {
            if(isShipManifestLoaded) openPanels.has('ship-manifest') ? closePanel('ship-manifest') : openPanel('ship-manifest');
            return;
        }
        if (targetView === 'tools') return;
        setView(targetView as View);
    }, [isCharacterLoaded, isShipManifestLoaded, openPanels, openPanel, closePanel]);

    const handleCharacterUpdate = useCallback((updatedCharacter: Character) => {
        setActiveCharacterData(prevData => {
            if (prevData) {
                return { ...prevData, character: updatedCharacter };
            }
            return null;
        });
    }, []);
    
    const handleOpenDerelictManifest = useCallback((shipData: DerelictShip) => {
        const shipModelName = shipData.shipModel.split(' (')[0];
        const shipDetails = SHIP_DATA.find(s => s.name === shipModelName);
        
        const newManifest: ShipManifestData = {
            identifier: shipData.name, captain: '', modelInfo: shipData.shipModel, transponderOn: true,
            stats: { thrusters: shipDetails?.stats.thrusters ?? 1, battle: shipDetails?.stats.weapons ?? 1, systems: shipDetails?.stats.systems ?? 1 },
            o2Remaining: 100, fuel: { current: shipDetails?.fuel ?? 0, max: shipDetails?.fuel ?? 10 }, warpCores: 0, cryopods: shipDetails?.cryopods ?? 0,
            escapePods: parseInt(shipDetails?.escape_pods ?? '0'), weapons: { base: shipDetails?.stats.base_weapons ?? shipDetails?.stats.weapons ?? 1, total: shipDetails?.stats.weapons ?? 1 },
            megadamage: { base: 0, total: 0 }, hardpoints: { installed: parseInt(shipDetails?.hardpoints.split('/')[0] ?? '0'), max: parseInt(shipDetails?.hardpoints.split('/')[1] ?? '0') },
            hullPoints: 0, megadamageLevel: 0, deckplan: {},
            upgrades: { installed: 0, max: parseInt(shipDetails?.upgrades.split('/')[1] ?? '0'), list: ''},
            cargo: `Notable Cargo: ${shipData.cargo}\nPotential Salvage: ${shipData.salvage}`,
            repairs: { minor: `Cause of Ruination: ${shipData.causeOfRuination}\nAnomaly: ${shipData.weirdTrait}`, major: '' },
            crew: { current: 0, max: shipDetails?.crew ?? 0, list: `Survivors: ${shipData.survivors}` }
        };

        setActiveShipManifest(newManifest);
        openPanel('ship-manifest');
    }, [openPanel]);

    const handleOpenShipyardManifest = useCallback((shipData: ShipData) => {
        const newManifest: ShipManifestData = {
            identifier: shipData.name, captain: '', modelInfo: `${shipData.name} (${shipData.modelCode})`, transponderOn: true,
            stats: { thrusters: shipData.stats.thrusters, battle: shipData.stats.weapons, systems: shipData.stats.systems },
            o2Remaining: 100, fuel: { current: shipData.fuel, max: shipData.fuel }, warpCores: 0, cryopods: shipData.cryopods,
            escapePods: parseInt(shipData.escape_pods.split(' ')[0]) || 0,
            weapons: { base: shipData.stats.base_weapons ?? shipData.stats.weapons, total: shipData.stats.weapons },
            megadamage: { base: 0, total: 0 }, hardpoints: { installed: parseInt(shipData.hardpoints.split('/')[0]), max: parseInt(shipData.hardpoints.split('/')[1]) },
            hullPoints: 0, megadamageLevel: 0, deckplan: {},
            upgrades: { installed: parseInt(shipData.upgrades.split('/')[0]), max: parseInt(shipData.upgrades.split('/')[1]), list: ''},
            cargo: '', repairs: { minor: shipData.notes || '', major: '' }, crew: { current: 0, max: shipData.crew, list: '' }
        };
        setActiveShipManifest(newManifest);
        openPanel('ship-manifest');
    }, [openPanel]);

    const value = {
        view, setView, activeNav,
        isTutorialOpen, openTutorial, closeTutorial,
        clearActiveDiceCheck, activeDiceCheck,
        activeCharacterData, setActiveCharacterData, handleCharacterUpdate, isCharacterLoaded,
        activeShipManifest, setActiveShipManifest, handleOpenDerelictManifest, handleOpenShipyardManifest, isShipManifestLoaded,
        handleSetView,
        panelStack, bringPanelToFront,
        openPanels, openPanel, closePanel,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
