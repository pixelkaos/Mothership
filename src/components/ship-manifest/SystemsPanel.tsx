import React from 'react';
import type { ShipManifestData } from '@/types';

type SystemsPanelProps = {
    data: Pick<ShipManifestData, 'fuel' | 'warpCores' | 'cryopods' | 'escapePods' | 'weapons' | 'megadamage' | 'hardpoints'>;
    onUpdate: (path: string, value: any) => void;
}

const SplitInput: React.FC<{ path: string; value1: number; value2: number; onUpdate: (path: string, value: any) => void; key1: string; key2: string; }> = ({ path, value1, value2, onUpdate, key1, key2 }) => (
    <div className="border-2 border-black rounded-full flex items-center p-1">
        <input type="number" value={value1 || ''} onChange={e => onUpdate(`${path}.${key1}`, parseInt(e.target.value) || 0)} className="w-1/2 text-center bg-transparent border-none focus:ring-0"/>
        <div className="w-px h-6 bg-black transform rotate-45"></div>
        <input type="number" value={value2 || ''} onChange={e => onUpdate(`${path}.${key2}`, parseInt(e.target.value) || 0)} className="w-1/2 text-center bg-transparent border-none focus:ring-0"/>
    </div>
);

const SingleInput: React.FC<{ path: string; value: number; onUpdate: (path: string, value: any) => void; }> = ({ path, value, onUpdate }) => (
    <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto">
        <input type="number" value={value || ''} onChange={e => onUpdate(path, parseInt(e.target.value) || 0)} className="w-10 text-center bg-transparent border-none focus:ring-0"/>
    </div>
);

export const SystemsPanel: React.FC<SystemsPanelProps> = ({ data, onUpdate }) => {
    return (
        <>
            <div className="border-4 border-black p-2">
                <div className="flex gap-4 mb-2">
                    <div className="flex-1">
                        <h3 className="text-center">FUEL</h3>
                        <SplitInput path="fuel" value1={data.fuel.current} value2={data.fuel.max} onUpdate={onUpdate} key1="current" key2="max" />
                    </div>
                    <div className="flex-1 text-center">
                        <h3 className="mb-1">WARP CORES</h3>
                        <SingleInput path="warpCores" value={data.warpCores} onUpdate={onUpdate} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 text-center">
                        <h3 className="mb-1">CRYOPODS</h3>
                        <SingleInput path="cryopods" value={data.cryopods} onUpdate={onUpdate} />
                    </div>
                    <div className="flex-1 text-center">
                        <h3 className="mb-1">ESCAPE PODS</h3>
                        <SingleInput path="escapePods" value={data.escapePods} onUpdate={onUpdate} />
                    </div>
                </div>
            </div>
            <div className="border-4 border-black p-2 flex gap-2">
                <div className="flex-1">
                    <h3 className="text-center">WEAPONS</h3>
                    <SplitInput path="weapons" value1={data.weapons.base} value2={data.weapons.total} onUpdate={onUpdate} key1="base" key2="total" />
                    <div className="flex justify-between px-2 text-xs"><label>Base</label><label>Total</label></div>
                </div>
                <div className="flex-1">
                    <h3 className="text-center">MEGADAMAGE</h3>
                    <SplitInput path="megadamage" value1={data.megadamage.base} value2={data.megadamage.total} onUpdate={onUpdate} key1="base" key2="total" />
                    <div className="flex justify-between px-2 text-xs"><label>Base</label><label>Total</label></div>
                </div>
                <div className="flex-1">
                    <h3 className="text-center">HARDPOINTS</h3>
                    <SplitInput path="hardpoints" value1={data.hardpoints.installed} value2={data.hardpoints.max} onUpdate={onUpdate} key1="installed" key2="max" />
                    <div className="flex justify-between px-2 text-xs"><label>Installed</label><label>Maximum</label></div>
                </div>
            </div>
        </>
    );
};
