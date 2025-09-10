import React, { useState, useMemo, useCallback } from 'react';

const DECKPLAN_ICONS = [
    { name: 'Airlock', svg: <path d="M20 4L4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
    { name: 'Cabin', svg: <path d="M5 18v-9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9m-14-9V6h10v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
    { name: 'Cargo', svg: <><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>},
    { name: 'Command', svg: <path d="M12 6l-7 12h14l-7-12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/> },
    { name: 'Comms', svg: <><path d="M6 18a10 10 0 0 1 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 14a6 6 0 0 1 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M6 10a2 2 0 0 1 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { name: 'Computer', svg: <><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></> },
    { name: 'Cryo', svg: <><path d="M12 4v16M5.07 7.5l13.86 9M5.07 16.5l13.86-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></> },
    { name: 'Docking', svg: <><path d="M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></> },
    { name: 'Door', svg: <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
    { name: 'Duct Access', svg: <><path d="M4 8h16m-16 4h16m-16 4h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { name: 'Galley', svg: <><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><path d="M5 7V4h3m8 3V4h-3M5 17v3h3m8-3v3h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></> },
    { name: 'Gravity', svg: <><path d="M8 5v10l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 5v10l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></> },
    { name: 'Hangar', svg: <><path d="M7 17l2-4 2 4h-4zm5 0l2-4 2 4h-4zm5 0l2-4 2 4h-4z" fill="currentColor" /></> },
    { name: 'Hardpoint', svg: <><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/><path d="M12 5v2m0 10v2m-7-7h2m10 0h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M7 7V4h2m6 3V4h-2M7 17v3h2m6-3v3h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></> },
    { name: 'Jump Drive', svg: <path d="M5 5l14 14m0-14l-14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
    { name: 'Ladderway', svg: <><path d="M8 4v16m8-16v16M8 9h8m-8 6h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { name: 'Life Support', svg: <path d="M6 18v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 1-2-2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/> },
    { name: 'Maint.', svg: <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M12 4v2m0 12v2m8-10h-2M6 12H4m11.19-5.19l-1.41 1.41M7.22 16.78l-1.41 1.41m0-11.36l1.41 1.41M16.78 16.78l-1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { name: 'Medbay', svg: <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
    { name: 'Power', svg: <g transform="scale(0.85) translate(1.7, 1.7)"><circle cx="12" cy="12" r="3" fill="currentColor" /><path d="M12,2 A10,10 0 0 0 3.34,7 l8.66,5 l -8.66,5 A10,10 0 0 0 12,22 A10,10 0 0 0 20.66,17 l-8.66,-5 l 8.66,-5 A10,10 0 0 0 12,2" fill="currentColor" clipRule="evenodd" mask="url(#mask-power)"/></g> },
    { name: 'Scanners', svg: <><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="1" fill="currentColor" /></> },
    { name: 'Terminal', svg: <path d="M7 10h2m4 0h2m-10 4h2m4 0h2m-10 4h2m4 0h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/> },
    { name: 'Unpressurized Area', svg: <></> },
    { name: 'Warning', svg: <><path d="M12 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="17" r="1.2" fill="currentColor" /></> },
];

interface DeckplanEditorProps {
    deckplanData: Record<string, string | null>;
    onUpdate: (newDeckplanData: Record<string, string | null>) => void;
}

const GRID_ROWS = 20;
const GRID_COLS = 20;

export const DeckplanEditor: React.FC<DeckplanEditorProps> = ({ deckplanData, onUpdate }) => {
    const [selectedIcon, setSelectedIcon] = useState<string | null>('Airlock');

    const handleCellClick = useCallback((row: number, col: number) => {
        const key = `${row}-${col}`;
        const newDeckplan = { ...deckplanData };

        if (selectedIcon === 'Eraser') {
            delete newDeckplan[key];
        } else if (newDeckplan[key] === selectedIcon) {
            delete newDeckplan[key];
        } else {
            newDeckplan[key] = selectedIcon;
        }
        onUpdate(newDeckplan);
    }, [deckplanData, selectedIcon, onUpdate]);

    const gridCells = useMemo(() => {
        return Array.from({ length: GRID_ROWS }, (_, row) => (
            <div key={row} className="flex flex-shrink-0">
                {Array.from({ length: GRID_COLS }, (_, col) => {
                    const key = `${row}-${col}`;
                    const iconName = deckplanData[key];
                    const icon = iconName ? DECKPLAN_ICONS.find(i => i.name === iconName) : null;
                    return (
                        <button
                            key={key}
                            onClick={() => handleCellClick(row, col)}
                            className="w-6 h-6 border-r border-b border-black/20 flex-shrink-0 flex items-center justify-center hover:bg-black/10 transition-colors"
                            aria-label={`Deckplan cell ${row}, ${col}. Current: ${iconName || 'Empty'}`}
                        >
                            {icon && (
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                                    <defs>
                                        <mask id="mask-power">
                                            <rect x="0" y="0" width="24" height="24" fill="white" />
                                            <circle cx="12" cy="12" r="3" fill="black" />
                                        </mask>
                                    </defs>
                                    {icon.svg}
                                </svg>
                            )}
                        </button>
                    );
                })}
            </div>
        ));
    }, [deckplanData, handleCellClick]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow bg-white border-t border-l border-black/20 relative overflow-auto">
                <div className="absolute top-0 left-0">
                    {gridCells}
                </div>
            </div>
            <div className="flex-shrink-0 mt-2 p-1 bg-gray-200 border-t-2 border-black">
                <div className="grid grid-cols-5 gap-0.5">
                    {[...DECKPLAN_ICONS, { name: 'Eraser', svg: <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2"/> }].map(icon => (
                        <button
                            key={icon.name}
                            onClick={() => setSelectedIcon(icon.name)}
                            className={`p-1 border-2 ${selectedIcon === icon.name ? 'border-black bg-white' : 'border-transparent hover:bg-white'}`}
                            title={icon.name}
                            aria-pressed={selectedIcon === icon.name}
                        >
                            <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto" fill="none">
                                {icon.svg}
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
