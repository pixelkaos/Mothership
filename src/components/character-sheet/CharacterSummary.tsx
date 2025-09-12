
import React, { useState } from 'react';
import type { Character } from '@/types';
import { ReadOnlyField } from '@/components/character-sheet/ReadOnlyField';
import { Modal } from '@/components/ui/Modal';

interface CharacterSummaryProps {
    character: Character;
}

export const CharacterSummary: React.FC<CharacterSummaryProps> = ({ character }) => {
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const hasPortrait = !!character.portrait;

    return (
        <div className="flex gap-4">
            <button
                type="button"
                className={`w-32 h-32 flex-shrink-0 border border-primary/50 ${hasPortrait ? 'cursor-zoom-in' : ''}`}
                onClick={() => hasPortrait && setIsViewerOpen(true)}
                aria-label={hasPortrait ? 'View portrait fullscreen' : 'No portrait available'}
                disabled={!hasPortrait}
            >
                {hasPortrait ? (
                    <img src={character.portrait} alt="Portrait" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-black/50 flex items-center justify-center text-muted text-xs">NO SIGNAL</div>
                )}
            </button>
            <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-2 content-start">
                <div className="col-span-2"><ReadOnlyField label="Name" value={character.name} /></div>
                <ReadOnlyField label="Pronouns" value={character.pronouns} />
                <ReadOnlyField label="Class" value={character.class?.name || 'N/A'} />
            </div>

            <Modal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                title={character.name && character.name.trim() ? character.name : 'Portrait'}
                className="max-w-5xl w-full"
            >
                {hasPortrait ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <img
                            src={character.portrait}
                            alt={character.name ? `Portrait of ${character.name}` : 'Full portrait'}
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                ) : (
                    <p className="text-muted">No portrait available.</p>
                )}
            </Modal>
        </div>
    );
};
