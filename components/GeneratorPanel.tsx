
import React from 'react';
import type { DerelictShip } from '../types';

interface GeneratorPanelProps {
    ship: DerelictShip | null;
    onGenerate: () => void;
    onEnhance: () => void;
    isLoading: boolean;
}

const ShipDataRow: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="py-2 grid grid-cols-3 gap-4">
        <dt className="text-sm font-medium text-primary/80 col-span-1">{label}</dt>
        <dd className="mt-1 text-sm text-foreground sm:mt-0 col-span-2">{value || '...'}</dd>
    </div>
);

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ ship, onGenerate, onEnhance, isLoading }) => {
    return (
        <div className="border border-primary/50 p-6 flex flex-col h-full bg-black/30">
            <h3 className="text-2xl font-bold text-primary mb-4 uppercase tracking-wider">System Parameters</h3>
            <div className="flex-grow overflow-y-auto">
                <dl className="divide-y divide-primary/50">
                    <ShipDataRow label="IDENTIFIER" value={ship?.name} />
                    <ShipDataRow label="CLASS" value={ship?.shipClass} />
                    <ShipDataRow label="STATUS" value={ship?.status} />
                    <ShipDataRow label="SYSTEMS" value={ship?.systems} />
                    <ShipDataRow label="SURVIVORS" value={ship?.survivors} />
                    <ShipDataRow label="RUINATION" value={ship?.causeOfRuination} />
                    <ShipDataRow label="ANOMALY" value={ship?.weirdTrait} />
                    <ShipDataRow label="CARGO" value={ship?.cargo} />
                    <ShipDataRow label="SALVAGE" value={ship?.salvage} />
                </dl>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-primary text-primary uppercase tracking-widest hover:bg-primary/20 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {ship ? 'New Signal' : 'Scan for Signal'}
                </button>
                <button
                    onClick={onEnhance}
                    disabled={!ship || isLoading}
                    className="flex-1 px-4 py-3 bg-primary text-background uppercase tracking-widest hover:bg-primary-dark focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? 'Processing...' : 'Enhance Signal'}
                </button>
            </div>
        </div>
    );
};