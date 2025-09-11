
import React from 'react';
import type { ShipManifestData } from '../types';
import { DockablePanel } from './DockablePanel';
import { ShipManifestBody } from './ship-manifest/ShipManifestBody';

interface FloatingShipManifestProps {
    shipData: ShipManifestData | null;
    onUpdate: (data: ShipManifestData | null) => void;
}

export const FloatingShipManifest: React.FC<FloatingShipManifestProps> = (props) => {
    const { shipData } = props;

    if (!shipData) {
        return null;
    }

    return (
        <DockablePanel
            title="Ship Manifest"
            initialPosition={{ x: 50, y: 50 }}
            className="w-full max-w-5xl"
            panelId="ship-manifest"
        >
            <ShipManifestBody 
                shipData={shipData} 
                onUpdate={props.onUpdate} 
            />
        </DockablePanel>
    );
};