import React from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface TransponderPanelProps {
    identifier: string;
    captain: string;
    modelInfo: string;
    transponderOn: boolean;
    onUpdate: (path: string, value: any) => void;
}

export const TransponderPanel: React.FC<TransponderPanelProps> = ({
    identifier, captain, modelInfo, transponderOn, onUpdate
}) => {
    return (
        <div className="bg-black text-white p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-widest text-primary">MOTHERSHIP®</h2>
            </div>
            <h3 className="text-sm tracking-[0.2em]">SHIP MANIFEST</h3>
            <div className="flex justify-between items-center border-y-2 border-white py-1">
                <label className="uppercase tracking-widest">Transponder</label>
                <div className="flex items-center gap-2">
                    <label htmlFor="transponder-on" className={`px-2 py-0.5 text-xs ${transponderOn ? 'bg-white text-black' : ''}`}>ON</label>
                    <input type="radio" id="transponder-on" name="transponder" checked={transponderOn} onChange={() => onUpdate('transponderOn', true)} className="hidden"/>
                    <label htmlFor="transponder-off" className={`px-2 py-0.5 text-xs ${!transponderOn ? 'bg-white text-black' : ''}`}>OFF</label>
                    <input type="radio" id="transponder-off" name="transponder" checked={!transponderOn} onChange={() => onUpdate('transponderOn', false)} className="hidden"/>
                </div>
            </div>
            <Input value={identifier} onChange={e => onUpdate('identifier', e.target.value)} placeholder="Ship Identifier" className="bg-white text-black p-2"/>
            <Input value={captain} onChange={e => onUpdate('captain', e.target.value)} placeholder="Captain" className="bg-white text-black p-2"/>
            <Textarea value={modelInfo} onChange={e => onUpdate('modelInfo', e.target.value)} placeholder="Make / Model / Jump / Class / Type" rows={3} className="bg-white text-black p-2"/>
        </div>
    );
};