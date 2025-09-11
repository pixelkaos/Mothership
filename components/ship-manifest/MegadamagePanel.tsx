import React from 'react';

interface MegadamagePanelProps {
    megadamageLevel: number;
    hullPoints: number;
    onUpdate: (path: string, value: number) => void;
}

const MEGADAMAGE_EFFECTS = [
    "ALL SYSTEMS NORMAL. 5x5. Ready to ride.",
    "EMERGENCY FUEL LEAK. Every time you spend fuel, you spend 1 more.",
    "WEAPONS OFFLINE. Automatically fail Battle Checks.",
    "NAVIGATION OFFLINE. Cannot make Thruster Checks. 10% chance all navigation data wiped.",
    "FIRE ON DECK. Fire spreads rapidly throughout ship's interior. Toxic and corrosive (10 DMG/round) atmosphere.",
    "HULL BREACH. All aboard make a Body Save or take 1 Wound (Explosion). Critical Failure = violently sucked into space.",
    "LIFE SUPPORT SYSTEMS OFFLINE. Oxygen limited to 1d10 x Crew Capacity.",
    "RADIATION LEAK. Radiation level increases every 2d10 minutes.",
    "DEAD IN THE WATER. All systems offline, emergency power only.",
    "ABANDON SHIP! Ship is destroyed in 1d10 minutes."
];

export const MegadamagePanel: React.FC<MegadamagePanelProps> = ({ megadamageLevel, hullPoints, onUpdate }) => {
    return (
        <div className="border-4 border-black p-2 flex-grow flex flex-col">
            <h3 className="text-center font-bold my-2">MEGADAMAGE</h3>
            <div className="flex-grow space-y-2 text-sm">
                {MEGADAMAGE_EFFECTS.map((effect, index) => (
                    <div key={index} className={`flex gap-2 items-start p-1 ${megadamageLevel === index ? 'bg-black text-white' : ''}`}>
                        <span className="font-bold w-6 text-center">{index.toString().padStart(2,'0')}</span>
                        <p className="flex-1 text-xs">{effect}</p>
                    </div>
                ))}
            </div>
            <div className="border-4 border-black p-2 mt-4">
                <h3 className="text-center font-bold">HULL POINTS</h3>
                <input
                    type="number"
                    value={hullPoints}
                    onChange={e => onUpdate('hullPoints', parseInt(e.target.value) || 0)}
                    className="w-full text-center bg-transparent border-none focus:ring-0 text-xl font-bold"
                />
            </div>
        </div>
    );
};