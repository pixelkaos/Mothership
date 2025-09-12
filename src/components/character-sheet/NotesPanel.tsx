
import React from 'react';
import { Panel } from '@/components/ui/Panel';
import { Textarea } from '@/components/ui/Textarea';

interface NotesPanelProps {
    notes: string;
    onNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onNotesChange }) => (
    <Panel title="Notes">
        <Textarea 
            className="w-full h-24 resize-y" 
            value={notes}
            onChange={onNotesChange}
            placeholder="Session notes, character thoughts, etc."
        />
    </Panel>
);
