import React from 'react';
import type { DerelictShip } from '../types';
import { Button } from './Button';
import { Panel } from './ui/Panel';

interface GeneratorPanelProps {
    ship: DerelictShip | null;
    onGenerate: () => void;
    onEnhance: () => void;
    onOpenInManifest: () => void;
    isLoading: boolean;
}

const ShipDataRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="py-space-2 grid grid-cols-3 gap-space-4">
        <dt className="text-sm font-medium text-primary/80 col-span-1">{label}</dt>
        <dd className="mt-1 text-sm text-foreground sm:mt-0 col-span-2 font-mono">{value || '...'}</dd>
    </div>
);

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ ship, onGenerate, onEnhance, onOpenInManifest, isLoading }) => {
    return (
        <Panel title="System Parameters" className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">
                <dl className="divide-y divide-primary/50">
                    <ShipDataRow label="IDENTIFIER" value={ship?.name} />
                    <ShipDataRow label="MODEL" value={ship?.shipModel} />
                    <ShipDataRow label="STATUS" value={ship?.status} />
                    <ShipDataRow label="SYSTEMS" value={ship?.systems} />
                    <ShipDataRow label="SURVIVORS" value={ship?.survivors} />
                    <ShipDataRow label="RUINATION" value={ship?.causeOfRuination} />
                    <ShipDataRow label="ANOMALY" value={ship?.weirdTrait} />
                    <ShipDataRow label="CARGO" value={ship?.cargo} />
                    <ShipDataRow label="SALVAGE" value={ship?.salvage} />
                </dl>
            </div>
            <div className="mt-space-6 space-y-space-4">
                 <Button
                    variant="secondary"
                    onClick={onOpenInManifest}
                    disabled={!ship || isLoading}
                    className="w-full"
                >
                    Open in Manifest
                </Button>
                <div className="flex flex-col sm:flex-row gap-space-4">
                    <Button
                        variant="tertiary"
                        onClick={onGenerate}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {ship ? 'New Signal' : 'Scan for Signal'}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onEnhance}
                        disabled={!ship || isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Processing...' : 'Enhance Signal'}
                    </Button>
                </div>
            </div>
        </Panel>
    );
};