import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ShipManifestData } from '../types';
import { set } from '../utils/helpers';
import { DeckplanEditor } from './DeckplanEditor';

interface FloatingShipManifestProps {
    isVisible: boolean;
    onClose: () => void;
    shipData: ShipManifestData | null;
    onUpdate: (data: ShipManifestData | null) => void;
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

export const FloatingShipManifest: React.FC<FloatingShipManifestProps> = ({ isVisible, onClose, shipData, onUpdate }) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const manifestRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!manifestRef.current || (e.target as HTMLElement).closest('button, input, textarea, select')) return;
        setIsDragging(true);
        const rect = manifestRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !manifestRef.current) return;
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        setPosition({ x: newX, y: newY });
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) setIsDragging(false);
    }, [isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    const handleUpdate = useCallback((path: string, value: any) => {
        if (!shipData) return;
        const newShipData = JSON.parse(JSON.stringify(shipData));
        set(newShipData, path, value);
        onUpdate(newShipData);
    }, [shipData, onUpdate]);

    if (!isVisible || !shipData) {
        return null;
    }

    const Input = ({ path, ...props }: { path: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
        <input {...props} value={path.split('.').reduce((o, i) => o[i], shipData) || ''} onChange={e => handleUpdate(path, e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)} />
    );
    const TextArea = ({ path, ...props }: { path: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
         <textarea {...props} value={path.split('.').reduce((o, i) => o[i], shipData) || ''} onChange={e => handleUpdate(path, e.target.value)} />
    );

    return (
        <div ref={manifestRef} className="fixed w-full max-w-5xl z-40" style={{ left: `${position.x}px`, top: `${position.y}px`, userSelect: isDragging ? 'none' : 'auto' }}>
             <div className="flex justify-between items-center px-3 py-2 bg-black/80 border border-b-0 border-foreground cursor-move" onMouseDown={handleMouseDown}>
                <h4 className="font-bold text-foreground uppercase tracking-wider text-sm">Ship Manifest</h4>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-foreground/70 hover:text-primary" aria-label={isMinimized ? "Expand" : "Minimize"}>...</button>
                    <button onClick={onClose} className="text-foreground/70 hover:text-primary" aria-label="Close">X</button>
                </div>
            </div>
            
            {!isMinimized && (
            <div className="p-4 bg-[#e1e1e1] text-black font-tech border-4 border-black grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2.5fr] gap-4" style={{'textShadow': 'none'}}>
                {/* Col 1 */}
                <div className="flex flex-col gap-4">
                    {/* Transponder */}
                    <div className="bg-black text-white p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold tracking-widest text-primary">MOTHERSHIP®</h2>
                        </div>
                         <h3 className="text-sm tracking-[0.2em]">SHIP MANIFEST</h3>
                        <div className="flex justify-between items-center border-y-2 border-white py-1">
                            <label className="uppercase tracking-widest">Transponder</label>
                             <div className="flex items-center gap-2">
                                <label htmlFor="transponder-on" className={`px-2 py-0.5 text-xs ${shipData.transponderOn ? 'bg-white text-black' : ''}`}>ON</label>
                                <input type="radio" id="transponder-on" name="transponder" checked={shipData.transponderOn} onChange={() => handleUpdate('transponderOn', true)} className="hidden"/>
                                <label htmlFor="transponder-off" className={`px-2 py-0.5 text-xs ${!shipData.transponderOn ? 'bg-white text-black' : ''}`}>OFF</label>
                                <input type="radio" id="transponder-off" name="transponder" checked={!shipData.transponderOn} onChange={() => handleUpdate('transponderOn', false)} className="hidden"/>
                            </div>
                        </div>
                        <Input path="identifier" placeholder="Ship Identifier" className="bg-white text-black p-2"/>
                        <Input path="captain" placeholder="Captain" className="bg-white text-black p-2"/>
                        <TextArea path="modelInfo" placeholder="Make / Model / Jump / Class / Type" rows={3} className="bg-white text-black p-2"/>
                    </div>

                    {/* Megadamage */}
                    <div className="border-4 border-black p-2 flex-grow flex flex-col">
                        <h3 className="text-center font-bold my-2">MEGADAMAGE</h3>
                        <div className="flex-grow space-y-2 text-sm">
                            {MEGADAMAGE_EFFECTS.map((effect, index) => (
                                <div key={index} className={`flex gap-2 items-start p-1 ${shipData.megadamageLevel === index ? 'bg-black text-white' : ''}`}>
                                    <span className="font-bold w-6 text-center">{index.toString().padStart(2,'0')}</span>
                                    <p className="flex-1 text-xs">{effect}</p>
                                </div>
                            ))}
                        </div>
                         <div className="border-4 border-black p-2 mt-4">
                            <h3 className="text-center font-bold">HULL POINTS</h3>
                            <Input type="number" path="hullPoints" className="w-full text-center bg-transparent border-none focus:ring-0 text-xl font-bold"/>
                        </div>
                    </div>
                </div>

                {/* Col 2 */}
                <div className="flex flex-col gap-4">
                    {/* Stats & Saves */}
                    <div className="border-4 border-black p-2 flex flex-col items-center">
                         <h3 className="text-center font-bold my-2">STATS & SAVES</h3>
                         <div className="space-y-4 my-4">
                            <div className="text-center"><div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center"><Input type="number" path="stats.thrusters" className="text-4xl font-bold w-16 text-center bg-transparent border-none focus:ring-0"/></div><label className="mt-1 block">THRUSTERS</label></div>
                             <div className="text-center"><div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center"><Input type="number" path="stats.battle" className="text-4xl font-bold w-16 text-center bg-transparent border-none focus:ring-0"/></div><label className="mt-1 block">BATTLE</label></div>
                            <div className="text-center"><div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center"><Input type="number" path="stats.systems" className="text-4xl font-bold w-16 text-center bg-transparent border-none focus:ring-0"/></div><label className="mt-1 block">SYSTEMS</label></div>
                            <div className="text-center"><div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center"><Input type="number" path="o2Remaining" className="text-4xl font-bold w-16 text-center bg-transparent border-none focus:ring-0"/></div><label className="mt-1 block">O2 REMAINING</label></div>
                         </div>
                    </div>
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
                     <div className="border-4 border-black p-2">
                        <div className="flex gap-4 mb-2">
                            <div className="flex-1"><h3 className="text-center">FUEL</h3><div className="border-2 border-black rounded-full flex items-center p-1"><Input path="fuel.current" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="fuel.max" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div></div>
                            <div className="flex-1 text-center"><h3 className="mb-1">WARP CORES</h3><div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto"><Input path="warpCores" type="number" className="w-10 text-center bg-transparent border-none focus:ring-0"/></div></div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 text-center"><h3 className="mb-1">CRYOPODS</h3><div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto"><Input path="cryopods" type="number" className="w-10 text-center bg-transparent border-none focus:ring-0"/></div></div>
                            <div className="flex-1 text-center"><h3 className="mb-1">ESCAPE PODS</h3><div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto"><Input path="escapePods" type="number" className="w-10 text-center bg-transparent border-none focus:ring-0"/></div></div>
                        </div>
                     </div>
                      <div className="border-4 border-black p-2 flex gap-2">
                            <div className="flex-1"><h3 className="text-center">WEAPONS</h3><div className="border-2 border-black rounded-full flex items-center p-1"><Input path="weapons.base" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="weapons.total" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div><div className="flex justify-between px-2 text-xs"><label>Base</label><label>Total</label></div></div>
                            <div className="flex-1"><h3 className="text-center">MEGADAMAGE</h3><div className="border-2 border-black rounded-full flex items-center p-1"><Input path="megadamage.base" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="megadamage.total" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div><div className="flex justify-between px-2 text-xs"><label>Base</label><label>Total</label></div></div>
                            <div className="flex-1"><h3 className="text-center">HARDPOINTS</h3><div className="border-2 border-black rounded-full flex items-center p-1"><Input path="hardpoints.installed" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="hardpoints.max" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div><div className="flex justify-between px-2 text-xs"><label>Installed</label><label>Maximum</label></div></div>
                     </div>
                     <div className="border-4 border-black p-2 flex-grow flex flex-col">
                        <h3 className="text-center">CREW</h3>
                        <div className="border-2 border-black rounded-full flex items-center p-1 mx-auto my-2 w-48"><Input path="crew.current" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="crew.max" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div>
                        <TextArea path="crew.list" className="w-full flex-grow bg-transparent border-none focus:ring-0 p-1 leading-loose" style={{backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em'}}/>
                     </div>
                     <div className="border-4 border-black p-2 flex-grow flex flex-col">
                        <div className="grid grid-cols-2">
                           <div><h3 className="text-center">UPGRADES</h3><div className="border-2 border-black rounded-full flex items-center p-1 mx-auto my-2 w-32"><Input path="upgrades.installed" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/><div className="w-px h-6 bg-black transform rotate-45"></div><Input path="upgrades.max" type="number" className="w-1/2 text-center bg-transparent border-none focus:ring-0"/></div></div>
                           <div><h3 className="text-center">CARGO</h3></div>
                        </div>
                        <div className="grid grid-cols-2 flex-grow">
                             <TextArea path="upgrades.list" className="w-full h-full bg-transparent border-none focus:ring-0 p-1 leading-loose" style={{backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em'}}/>
                              <TextArea path="cargo" className="w-full h-full bg-transparent border-none focus:ring-0 p-1 leading-loose" style={{backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em'}}/>
                        </div>
                         <h3 className="text-center">REPAIRS</h3>
                         <div className="grid grid-cols-2 flex-grow">
                              <TextArea path="repairs.minor" className="w-full h-full bg-transparent border-none focus:ring-0 p-1 leading-loose" style={{backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em'}}/>
                               <TextArea path="repairs.major" className="w-full h-full bg-transparent border-none focus:ring-0 p-1 leading-loose" style={{backgroundImage: 'linear-gradient(black 1px, transparent 1px)', backgroundSize: '100% 1.5em'}}/>
                         </div>
                         <div className="flex justify-between px-2 text-xs"><label>Minor</label><label>Major</label></div>
                     </div>
                </div>
            </div>
            )}
        </div>
    );
};