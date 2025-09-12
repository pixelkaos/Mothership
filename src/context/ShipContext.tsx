import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { DerelictShip, ShipData, ShipManifestData } from '@/types';
import { SHIP_DATA } from '@/data/shipData';
import { usePanels } from '@/context/PanelsContext';

interface ShipContextType {
    activeShipManifest: ShipManifestData | null;
    setActiveShipManifest: React.Dispatch<React.SetStateAction<ShipManifestData | null>>;
    handleOpenDerelictManifest: (shipData: DerelictShip) => void;
    handleOpenShipyardManifest: (shipData: ShipData) => void;
    isShipManifestLoaded: boolean;
}

const ShipContext = createContext<ShipContextType | undefined>(undefined);

export const useShip = () => {
    const context = useContext(ShipContext);
    if (!context) throw new Error('useShip must be used within a ShipProvider');
    return context;
};

export const ShipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeShipManifest, setActiveShipManifest] = useState<ShipManifestData | null>(null);
    const { open } = usePanels();
    
    const isShipManifestLoaded = useMemo(() => activeShipManifest !== null, [activeShipManifest]);

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
        open('ship-manifest');
    }, [open]);

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
        open('ship-manifest');
    }, [open]);


    const value = {
        activeShipManifest,
        setActiveShipManifest,
        handleOpenDerelictManifest,
        handleOpenShipyardManifest,
        isShipManifestLoaded,
    };

    return <ShipContext.Provider value={value}>{children}</ShipContext.Provider>;
};
