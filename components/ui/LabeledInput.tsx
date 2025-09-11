import React from 'react';

interface LabeledInputProps {
    label: string;
    value: string | number;
}

export const LabeledInput: React.FC<LabeledInputProps> = ({ label, value }) => (
    <div>
        <label className="text-xs uppercase text-muted tracking-wider">{label}</label>
        <input
            type="text"
            readOnly
            value={value}
            className="w-full bg-black/50 border border-muted p-2 mt-1 focus:ring-0 focus:outline-none focus:border-primary text-foreground"
        />
    </div>
);
