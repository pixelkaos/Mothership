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
        <dt className="text-sm font-medium text-green-600 col-span-1">{label}</dt>
        <dd className="mt-1 text-sm text-green-300 sm:mt-0 col-span-2">{value || '...'}</dd>
    </div>
);

export const GeneratorPanel: React.FC<GeneratorPanelProps> = ({ ship, onGenerate, onEnhance, isLoading }) => {
    return (
        <div className="border-2 border-green-700/50 p-6 flex flex-col h-full bg-green-900/10">
            <h3 className="text-2xl font-bold text-green-400 mb-4 uppercase tracking-wider">System Parameters</h3>
            <div className="flex-grow overflow-y-auto">
                <dl className="divide-y divide-green-800/50">
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
                    className="flex-1 px-4 py-3 bg-green-800/50 border border-green-600 text-green-300 uppercase tracking-widest hover:bg-green-700/50 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {ship ? 'New Signal' : 'Scan for Signal'}
                </button>
                <button
                    onClick={onEnhance}
                    disabled={!ship || isLoading}
                    className="flex-1 px-4 py-3 bg-green-600/50 border border-green-400 text-green-200 uppercase tracking-widest hover:bg-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    {isLoading ? 'Processing...' : 'Enhance Signal'}
                </button>
            </div>
        </div>
    );
};