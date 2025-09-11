
import React from 'react';
import type { ShipManifestData } from '../types';
import { DockablePanel } from './DockablePanel';
import { ShipManifestBody } from './ship-manifest/ShipManifestBody';

interface FloatingShipManifestProps {
    isVisible: boolean;
    onClose: () => void;
    shipData: ShipManifestData | null;
    onUpdate: (data: ShipManifestData | null) => void;
}

export const FloatingShipManifest: React.FC<FloatingShipManifestProps> = (props) => {
    const { isVisible, shipData } = props;

    if (!isVisible || !shipData) {
        return null;
    }

    return (
        <DockablePanel
            title="Ship Manifest"
            isVisible={isVisible}
            onClose={props.onClose}
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
