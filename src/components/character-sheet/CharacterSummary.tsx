
import React from 'react';
import type { Character } from '@/types';
import { ReadOnlyField } from '@/components/character-sheet/ReadOnlyField';

interface CharacterSummaryProps {
    character: Character;
}

export const CharacterSummary: React.FC<CharacterSummaryProps> = ({ character }) => (
    <div className="flex gap-4">
        <div className="w-32 h-32 flex-shrink-0 border border-primary/50">
            {character.portrait ? (
                <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-black/50 flex items-center justify-center text-muted text-xs">NO SIGNAL</div>
            )}
        </div>
        <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 content-start">
            <div className="col-span-2"><ReadOnlyField label="Name" value={character.name} /></div>
            <ReadOnlyField label="Pronouns" value={character.pronouns} />
            <ReadOnlyField label="Class" value={character.class?.name || 'N/A'} />
        </div>
    </div>
);
