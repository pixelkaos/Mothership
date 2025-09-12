import React, { useCallback } from 'react';
import type { ShipManifestData } from '@/types';
import { set } from '@/utils/helpers';
import { DeckplanEditor } from '@/components/DeckplanEditor';
import { Panel } from '@/components/ui/Panel';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/Button';
import { Switch } from '@/components/ui/Switch';
import { StatInput } from '@/components/ui/StatInput';
import { SplitStatInput } from '@/components/ui/SplitStatInput';


interface ShipManifestBodyProps {
    shipData: ShipManifestData;
    onUpdate: (data: ShipManifestData | null) => void;
}

const MEGADAMAGE_EFFECTS = [
    "ALL SYSTEMS NORMAL", "EMERGENCY FUEL LEAK", "WEAPONS OFFLINE",
    "NAVIGATION OFFLINE", "FIRE ON DECK", "HULL BREACH",
    "LIFE SUPPORT OFFLINE", "RADIATION LEAK", "DEAD IN THE WATER",
    "ABANDON SHIP!"
];

export const ShipManifestBody: React.FC<ShipManifestBodyProps> = ({ shipData, onUpdate }) => {
    const handleUpdate = useCallback((path: string, value: any) => {
        const newShipData = JSON.parse(JSON.stringify(shipData));
        set(newShipData, path, value);
        onUpdate(newShipData);
    }, [shipData, onUpdate]);

    return (
        <div className="p-space-4 space-y-space-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-4">
                {/* Column 1 */}
                <div className="space-y-space-4">
                    <Panel title="Transponder & Identity">
                        <div className="space-y-space-3">
                            <Field label="Transponder Status">
                                <Switch
                                  checked={shipData.transponderOn}
                                  onCheckedChange={(val) => handleUpdate('transponderOn', val)}
                                  aria-label="Transponder"
                                />
                            </Field>
                            <Field label="Ship Identifier"><Input value={shipData.identifier} onChange={e => handleUpdate('identifier', e.target.value)} /></Field>
                            <Field label="Captain"><Input value={shipData.captain} onChange={e => handleUpdate('captain', e.target.value)} /></Field>
                            <Field label="Model Info"><Textarea value={shipData.modelInfo} onChange={e => handleUpdate('modelInfo', e.target.value)} rows={2}/></Field>
                        </div>
                    </Panel>
                    <Panel title="Core Stats">
                        <div className="flex justify-around py-space-2">
                            <StatInput id="thrusters" label="Thrusters" value={shipData.stats.thrusters} onChange={(e) => handleUpdate('stats.thrusters', parseInt(e.target.value))} tooltipContent="Governs ship speed and maneuverability." />
                            <StatInput id="battle" label="Battle" value={shipData.stats.battle} onChange={(e) => handleUpdate('stats.battle', parseInt(e.target.value))} tooltipContent="Determines combat effectiveness and weapons accuracy." />
                            <StatInput id="systems" label="Systems" value={shipData.stats.systems} onChange={(e) => handleUpdate('stats.systems', parseInt(e.target.value))} tooltipContent="Represents the power and efficiency of onboard electronics, scanners, and defenses." />
                        </div>
                    </Panel>
                     <Panel title="Personnel & Quarters">
                        <SplitStatInput label="Crew" id="crew" currentValue={shipData.crew.current} maxValue={shipData.crew.max} onCurrentChange={(e) => handleUpdate('crew.current', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('crew.max', parseInt(e.target.value))} tooltipContent="Current and maximum crew capacity." />
                        <Field label="Crew Manifest"><Textarea className="h-24" value={shipData.crew.list} onChange={(e) => handleUpdate('crew.list', e.target.value)} /></Field>
                    </Panel>
                </div>

                {/* Column 2 */}
                <div className="space-y-space-4">
                     <Panel title="Hull & Damage">
                        <div className="space-y-space-4">
                             <SplitStatInput label="Hull Points" id="hull" currentValue={shipData.hullPoints} maxValue={2} onCurrentChange={(e) => handleUpdate('hullPoints', parseInt(e.target.value))} onMaxChange={() => {}} tooltipContent="Ship's structural integrity. Can be improved with upgrades." isMaxReadOnly/>
                             <StatInput label="Megadamage" id="megadamage" value={shipData.megadamageLevel} onChange={(e) => handleUpdate('megadamageLevel', parseInt(e.target.value))} tooltipContent="Catastrophic damage level. Each point corresponds to a severe system failure." />
                            <div className="space-y-space-1 text-xs max-h-48 overflow-y-auto">
                                {MEGADAMAGE_EFFECTS.map((effect, index) => (
                                    <div key={index} className={`flex gap-space-2 items-start p-space-1 rounded-sm ${shipData.megadamageLevel === index ? 'bg-danger text-background' : 'bg-black/20'}`}>
                                        <span className="font-bold w-6 text-center">{index}</span>
                                        <p className="flex-1">{effect}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Defenses & Payload">
                        <div className="space-y-space-4">
                            <SplitStatInput label="Weapons" id="weapons" currentValue={shipData.weapons.base} maxValue={shipData.weapons.total} onCurrentChange={(e) => handleUpdate('weapons.base', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('weapons.total', parseInt(e.target.value))} tooltipContent="Base weapon power vs. total power including upgrades." />
                            <SplitStatInput label="Megadamage" id="megadamage" currentValue={shipData.megadamage.base} maxValue={shipData.megadamage.total} onCurrentChange={(e) => handleUpdate('megadamage.base', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('megadamage.total', parseInt(e.target.value))} tooltipContent="Base vs. total megadamage output." />
                            <SplitStatInput label="Hardpoints" id="hardpoints" currentValue={shipData.hardpoints.installed} maxValue={shipData.hardpoints.max} onCurrentChange={(e) => handleUpdate('hardpoints.installed', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('hardpoints.max', parseInt(e.target.value))} tooltipContent="Installed weapon/module hardpoints vs. ship's maximum." />
                        </div>
                    </Panel>
                </div>

                {/* Column 3 */}
                <div className="space-y-space-4">
                    <Panel title="Propulsion & Power">
                        <div className="space-y-space-4">
                             <SplitStatInput label="Fuel" id="fuel" currentValue={shipData.fuel.current} maxValue={shipData.fuel.max} onCurrentChange={(e) => handleUpdate('fuel.current', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('fuel.max', parseInt(e.target.value))} tooltipContent="Current and maximum fuel units." />
                             <div className="flex justify-around">
                                <StatInput label="Warp Cores" id="warpcores" value={shipData.warpCores} onChange={(e) => handleUpdate('warpCores', parseInt(e.target.value))} tooltipContent="Power source for Jump Drives." />
                                <StatInput label="Cryopods" id="cryo" value={shipData.cryopods} onChange={(e) => handleUpdate('cryopods', parseInt(e.target.value))} tooltipContent="Number of long-term stasis pods." />
                                <StatInput label="Escape Pods" id="escape" value={shipData.escapePods} onChange={(e) => handleUpdate('escapePods', parseInt(e.target.value))} tooltipContent="Number of available escape pods." />
                             </div>
                        </div>
                    </Panel>
                     <Panel title="Upgrades & Cargo">
                        <SplitStatInput label="Upgrades" id="upgrades" currentValue={shipData.upgrades.installed} maxValue={shipData.upgrades.max} onCurrentChange={(e) => handleUpdate('upgrades.installed', parseInt(e.target.value))} onMaxChange={(e) => handleUpdate('upgrades.max', parseInt(e.target.value))} tooltipContent="Installed upgrades vs. ship's maximum." />
                        <Field label="Installed Upgrades"><Textarea className="h-20" value={shipData.upgrades.list} onChange={(e) => handleUpdate('upgrades.list', e.target.value)} /></Field>
                        <Field label="Cargo Manifest"><Textarea className="h-20" value={shipData.cargo} onChange={(e) => handleUpdate('cargo', e.target.value)} /></Field>
                    </Panel>
                    <Panel title="Repairs & Notes">
                        <Field label="Minor Repairs / Notes"><Textarea className="h-20" value={shipData.repairs.minor} onChange={(e) => handleUpdate('repairs.minor', e.target.value)} /></Field>
                        <Field label="Major Repairs"><Textarea className="h-20" value={shipData.repairs.major} onChange={(e) => handleUpdate('repairs.major', e.target.value)} /></Field>
                    </Panel>
                </div>
            </div>
             <Panel title="Deckplan" className="h-[500px] flex flex-col">
                <DeckplanEditor 
                    deckplanData={shipData.deckplan} 
                    onUpdate={(newDeckplan) => handleUpdate('deckplan', newDeckplan)}
                />
            </Panel>
        </div>
    );
};
