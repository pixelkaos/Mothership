
import React from 'react';
import type { ShipManifestData } from '@/types';
import { DockablePanel } from '@/components/DockablePanel';
import { ShipManifestBody } from '@/components/ship-manifest/ShipManifestBody';

interface FloatingShipManifestProps {
    shipData: ShipManifestData | null;
    onUpdate: (data: ShipManifestData | null) => void;
}

export const FloatingShipManifest: React.FC<FloatingShipManifestProps> = (props) => {
    const { shipData } = props;

    return (
        <DockablePanel
            title="Ship Manifest"
            className="w-full max-w-5xl"
            id="ship-manifest"
        >
            {shipData && <ShipManifestBody 
                shipData={shipData} 
                onUpdate={props.onUpdate} 
            />}
        </DockablePanel>
    );
};
