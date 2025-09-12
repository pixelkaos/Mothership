import React from 'react';
import type { ShipManifestData } from '@/types';

type CrewAndCargoPanelProps = {
    data: Pick<ShipManifestData, 'crew' | 'upgrades' | 'cargo' | 'repairs'>;
    onUpdate: (path: string, value: any) => void;
}

const TextArea: React.FC<{ path: string; value: string; onUpdate: (path: string, value: string) => void; className?: string }> = ({ path, value, onUpdate, className }) => (
    <textarea
        value={value || ''}
        onChange={e => onUpdate(path, e.target.value)}
        className={`w-full bg-transparent border-none focus:ring-0 p-1 leading-loose ${className}`}
        style={{ backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em' }}
    />
);

const SplitInput: React.FC<{ path: string; value1: number; value2: number; onUpdate: (path: string, value: any) => void; key1: string; key2: string; className?: string }> = ({ path, value1, value2, onUpdate, key1, key2, className }) => (
    <div className={`border-2 border-black rounded-full flex items-center p-1 mx-auto my-2 w-32 ${className}`}>
        <input type="number" value={value1 || ''} onChange={e => onUpdate(`${path}.${key1}`, parseInt(e.target.value) || 0)} className="w-1/2 text-center bg-transparent border-none focus:ring-0"/>
        <div className="w-px h-6 bg-black transform rotate-45"></div>
        <input type="number" value={value2 || ''} onChange={e => onUpdate(`${path}.${key2}`, parseInt(e.target.value) || 0)} className="w-1/2 text-center bg-transparent border-none focus:ring-0"/>
    </div>
);


export const CrewAndCargoPanel: React.FC<CrewAndCargoPanelProps> = ({ data, onUpdate }) => {
    return (
        <div className="border-4 border-black p-2 flex-grow flex flex-col">
            <h3 className="text-center">CREW</h3>
            <SplitInput path="crew" value1={data.crew.current} value2={data.crew.max} onUpdate={onUpdate} key1="current" key2="max" className="w-48" />
            <TextArea path="crew.list" value={data.crew.list} onUpdate={onUpdate} className="flex-grow" />
            
            <div className="grid grid-cols-2 mt-4">
                <div>
                    <h3 className="text-center">UPGRADES</h3>
                    <SplitInput path="upgrades" value1={data.upgrades.installed} value2={data.upgrades.max} onUpdate={onUpdate} key1="installed" key2="max" />
                </div>
                <div><h3 className="text-center">CARGO</h3></div>
            </div>
            <div className="grid grid-cols-2 flex-grow">
                <TextArea path="upgrades.list" value={data.upgrades.list} onUpdate={onUpdate} />
                <TextArea path="cargo" value={data.cargo} onUpdate={onUpdate} />
            </div>

            <h3 className="text-center">REPAIRS</h3>
            <div className="grid grid-cols-2 flex-grow">
                <TextArea path="repairs.minor" value={data.repairs.minor} onUpdate={onUpdate} />
                <TextArea path="repairs.major" value={data.repairs.major} onUpdate={onUpdate} />
            </div>
            <div className="flex justify-between px-2 text-xs">
                <label>Minor</label>
                <label>Major</label>
            </div>
        </div>
    );
};
