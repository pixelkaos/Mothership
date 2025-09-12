import React from 'react';
import { Button } from '@/components/Button';

interface EquipmentItemProps {
    item: {
        value: string;
        source: 'loadout' | 'inventory';
        index: number;
    };
    onUpdate: (source: 'loadout' | 'inventory', index: number, newValue: string) => void;
    layout?: 'row' | 'grid';
}

export const EquipmentItem: React.FC<EquipmentItemProps> = ({ item, onUpdate, layout = 'row' }) => {
    // Regex for (xN) format, e.g., Stimpak (x5)
    const xRegex = /(.*?) ?\(x(\d+)\)/;
    // Regex for (N unit) format, e.g., Pulse Rifle (3 mags)
    const unitRegex = /(.*?) ?\((\d+)\s+(mags?|rounds?|charges?|doses?|shots?)\)/i;
    // Regex for armor points, e.g., Standard Battle Dress (AP 7)
    const apRegex = /(.*?) ?\((?:AP|ap)\s*(\d+)\)/;

    const xMatch = item.value.match(xRegex);
    const apMatch = !xMatch ? item.value.match(apRegex) : null;
    const unitMatch = !xMatch && !apMatch ? item.value.match(unitRegex) : null; // Prevent double-matching

    const match = xMatch || apMatch || unitMatch;

    if (!match) {
        if (layout === 'grid') {
            return <>
                <div className="font-semibold text-foreground">{item.value}</div>
                <div className="text-muted text-sm">—</div>
                <div className="flex justify-end" />
            </>;
        }
        return <div className="bg-black/50 p-2">{item.value}</div>;
    }

    const namePart = match[1].trim();
    const quantityPart = parseInt(match[2], 10);
    const isXType = !!xMatch;
    const isAPType = !!apMatch;
    const unitPart = isXType ? '' : (isAPType ? 'AP' : match[3]);

    const handleUpdateQuantity = (newQuantity: number) => {
        let newValue: string;
        if (isXType) {
            newValue = `${namePart} (x${newQuantity})`;
        } else if (isAPType) {
            newValue = `${namePart} (AP ${newQuantity})`;
        } else {
            newValue = `${namePart} (${newQuantity} ${unitPart})`;
        }
        onUpdate(item.source, item.index, newValue);
    };

    const handleDecrement = () => {
        if (quantityPart > 0) {
            handleUpdateQuantity(quantityPart - 1);
        }
    };
    
    const handleIncrement = () => {
        handleUpdateQuantity(quantityPart + 1);
    };

    if (layout === 'grid') {
        return (
            <>
                <div className="font-semibold text-foreground text-md leading-tight">{namePart}</div>
                <div className="font-mono text-center w-24">{quantityPart} {unitPart}</div>
                <div className="flex items-center gap-2 justify-end">
                    <Button variant="tertiary" size="sm" onClick={handleDecrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Decrease ${namePart} quantity`}>-</Button>
                    <Button variant="tertiary" size="sm" onClick={handleIncrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Increase ${namePart} quantity`}>+</Button>
                </div>
            </>
        );
    }

    return (
        <div className="bg-black/50 p-2 flex justify-between items-center text-sm">
            <span>{namePart}</span>
            <div className="flex items-center gap-2">
                <Button variant="tertiary" size="sm" onClick={handleDecrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Decrease ${namePart} quantity`}>-</Button>
                <span className="font-mono w-20 text-center">{quantityPart} {unitPart}</span>
                <Button variant="tertiary" size="sm" onClick={handleIncrement} className="px-2 py-1 h-6 w-6 rounded-sm" aria-label={`Increase ${namePart} quantity`}>+</Button>
            </div>
        </div>
    );
};
