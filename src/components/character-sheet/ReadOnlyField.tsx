
import React from 'react';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';

export const ReadOnlyField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <Field label={label}>
        <Input readOnly value={value} />
    </Field>
);
