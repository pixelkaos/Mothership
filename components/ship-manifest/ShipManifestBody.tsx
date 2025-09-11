
import React, { useCallback } from 'react';
import type { ShipManifestData } from '../../types';
import { set } from '../../utils/helpers';
import { DeckplanEditor } from '../DeckplanEditor';
import { TransponderPanel } from './TransponderPanel';
import { MegadamagePanel } from './MegadamagePanel';
import { StatsPanel } from './StatsPanel';
import { SystemsPanel } from './SystemsPanel';
import { CrewAndCargoPanel } from './CrewAndCargoPanel';

interface ShipManifestBodyProps {
    shipData: ShipManifestData;
    onUpdate: (data: ShipManifestData | null) => void;
}

export const ShipManifestBody: React.FC<ShipManifestBodyProps> = ({ shipData, onUpdate }) => {
    const handleUpdate = useCallback((path: string, value: any) => {
        const newShipData = JSON.parse(JSON.stringify(shipData));
        set(newShipData, path, value);
        onUpdate(newShipData);
    }, [shipData, onUpdate]);

    return (
        <div className="p-4 bg-[#e1e1e1] text-black font-tech border-t-2 border-primary/50 grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2.5fr] gap-4" style={{'textShadow': 'none'}}>
            {/* Col 1 */}
            <div className="flex flex-col gap-4">
                <TransponderPanel
                    identifier={shipData.identifier}
                    captain={shipData.captain}
                    modelInfo={shipData.modelInfo}
                    transponderOn={shipData.transponderOn}
                    onUpdate={handleUpdate}
                />
                <MegadamagePanel
                    megadamageLevel={shipData.megadamageLevel}
                    hullPoints={shipData.hullPoints}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-4">
                <StatsPanel
                    thrusters={shipData.stats.thrusters}
                    battle={shipData.stats.battle}
                    systems={shipData.stats.systems}
                    o2Remaining={shipData.o2Remaining}
                    onUpdate={handleUpdate}
                />
                <div className="border-4 border-black p-2 flex-grow flex flex-col">
                    <h3 className="text-center font-bold my-2">DECKPLAN</h3>
                    <DeckplanEditor 
                        deckplanData={shipData.deckplan} 
                        onUpdate={(newDeckplan) => handleUpdate('deckplan', newDeckplan)}
                    />
                </div>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-4">
                 <SystemsPanel data={shipData} onUpdate={handleUpdate} />
                 <CrewAndCargoPanel data={shipData} onUpdate={handleUpdate} />
            </div>
        </div>
    );
};
