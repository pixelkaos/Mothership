import React, { useState } from 'react';
import { SHIP_DATA, SHIP_UPGRADES, SHIP_WEAPONS } from '../data/shipData';
import type { ShipData, ShipUpgrade, ShipWeapon } from '../types';
import { useShip } from '../context/ShipContext';
import { Button } from '../components/Button';
import { Panel } from '../components/ui/Panel';
import { Tabs } from '../components/ui/Tabs';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-space-2 bg-black/30 border border-muted/50 text-center">
        <span className="text-2xl sm:text-3xl font-bold text-primary">{value}</span>
        <span className="text-xs uppercase tracking-wider text-muted mt-space-1">{label}</span>
    </div>
);

const DetailRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-space-4 py-space-2 border-b border-muted/30">
        <dt className="col-span-1 font-bold text-secondary/80">{label}</dt>
        <dd className="col-span-2 text-foreground">{value || 'N/A'}</dd>
    </div>
);

const UpgradesTable: React.FC<{ upgrades: ShipUpgrade[] }> = ({ upgrades }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-primary uppercase bg-black/50">
                <tr>
                    <th scope="col" className="p-space-3">Name</th>
                    <th scope="col" className="p-space-3">Cost</th>
                    <th scope="col" className="p-space-3">Install Time</th>
                    <th scope="col" className="p-space-3">Description</th>
                </tr>
            </thead>
            <tbody>
                {upgrades.map((item, index) => (
                    <tr key={index} className="border-b border-muted/30">
                        <td className="p-space-3 font-bold">{item.name}</td>
                        <td className="p-space-3 font-mono">{item.cost}</td>
                        <td className="p-space-3 font-mono">{item.install}</td>
                        <td className="p-space-3 text-muted">{item.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const WeaponsTable: React.FC<{ weapons: ShipWeapon[] }> = ({ weapons }) => (
     <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-primary uppercase bg-black/50">
                <tr>
                    <th scope="col" className="p-space-3">Weapon</th>
                    <th scope="col" className="p-space-3">Cost</th>
                    <th scope="col" className="p-space-3">Bonus</th>
                    <th scope="col" className="p-space-3">Description</th>
                </tr>
            </thead>
            <tbody>
                {weapons.map((item, index) => (
                    <tr key={index} className="border-b border-muted/30">
                        <td className="p-space-3 font-bold">{item.name}</td>
                        <td className="p-space-3 font-mono">{item.cost}</td>
                        <td className="p-space-3 font-mono text-center">{item.bonus}</td>
                        <td className="p-space-3 text-muted">{item.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const ShipyardView: React.FC = () => {
    const { handleOpenShipyardManifest } = useShip();
    const [selectedShip, setSelectedShip] = useState<ShipData>(SHIP_DATA[0]);

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-left mb-space-8">
                <h2 className="text-4xl font-bold leading-tight text-primary uppercase tracking-wider">Shipyard</h2>
                <p className="text-muted text-sm mt-space-2">Database of vessels, upgrades, and weapons from the Shipbreaker's Toolkit.</p>
            </div>

            <Tabs defaultValue="ships">
                <Tabs.List>
                    <Tabs.Trigger value="ships">Vessel Manifests</Tabs.Trigger>
                    <Tabs.Trigger value="upgrades">Upgrades</Tabs.Trigger>
                    <Tabs.Trigger value="weapons">Weapons</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="ships">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-8 mt-space-8">
                        <aside className="lg:col-span-1 max-h-[80vh] overflow-y-auto pr-space-2">
                            <ul className="space-y-space-2">
                                {SHIP_DATA.map(ship => (
                                    <li key={ship.name}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedShip(ship)}
                                            className={`w-full text-left p-space-3 border normal-case justify-start ${selectedShip.name === ship.name ? 'bg-primary/20 border-primary' : 'bg-black/30 border-muted/50 hover:bg-muted/20 hover:border-muted'}`}
                                        >
                                            <div>
                                                <h4 className="font-bold text-primary">{ship.name}</h4>
                                                <p className="text-xs text-muted">{ship.modelCode}</p>
                                            </div>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </aside>
                        <main className="lg:col-span-2">
                            {selectedShip && (
                                <Panel
                                    title={selectedShip.name}
                                    actions={
                                        <Button
                                            size="sm"
                                            onClick={() => handleOpenShipyardManifest(selectedShip)}
                                            className="whitespace-nowrap"
                                        >
                                            Open in Manifest
                                        </Button>
                                    }
                                >
                                    <p className="text-secondary tracking-widest">{selectedShip.modelCode}</p>

                                    <p className="text-sm text-foreground my-space-6">{selectedShip.description}</p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-space-4 mb-space-6">
                                        <StatBox label="Thrusters" value={selectedShip.stats.thrusters} />
                                        <StatBox label="Systems" value={selectedShip.stats.systems} />
                                        <StatBox label="Weapons" value={selectedShip.stats.weapons} />
                                    </div>

                                    <dl>
                                        <DetailRow label="Cost" value={selectedShip.cost} />
                                        <DetailRow label="Crew" value={selectedShip.crew} />
                                        <DetailRow label="Cryopods" value={selectedShip.cryopods} />
                                        <DetailRow label="Fuel Capacity" value={selectedShip.fuel} />
                                        <DetailRow label="Escape Pods" value={selectedShip.escape_pods} />
                                        <DetailRow label="Hardpoints" value={selectedShip.hardpoints} />
                                        <DetailRow label="Megadamage" value={selectedShip.megadamage} />
                                        <DetailRow label="Upgrades" value={selectedShip.upgrades} />
                                        {selectedShip.notes && <DetailRow label="Notes" value={selectedShip.notes} />}
                                    </dl>
                                </Panel>
                            )}
                        </main>
                    </div>
                </Tabs.Content>
                <Tabs.Content value="upgrades">
                    <div className="mt-space-8">
                        <h3 className="text-2xl font-semibold text-primary mb-space-4">Minor Upgrades</h3>
                        <UpgradesTable upgrades={SHIP_UPGRADES.filter(u => u.type === 'Minor')} />
                        <h3 className="text-2xl font-semibold text-primary mt-space-8 mb-space-4">Major Upgrades</h3>
                        <UpgradesTable upgrades={SHIP_UPGRADES.filter(u => u.type === 'Major')} />
                    </div>
                </Tabs.Content>
                 <Tabs.Content value="weapons">
                    <div className="mt-space-8">
                         <h3 className="text-2xl font-semibold text-primary mb-space-4">Ship-to-Ship Weapon Systems</h3>
                        <WeaponsTable weapons={SHIP_WEAPONS} />
                    </div>
                </Tabs.Content>
            </Tabs>
        </div>
    );
};