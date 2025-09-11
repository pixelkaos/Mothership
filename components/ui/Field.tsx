import React, { ReactNode, useId } from 'react';

interface FieldProps {
    label: string;
    children: ReactNode;
    className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, children, className }) => {
    const id = useId();
    const childWithId = React.isValidElement(children) ? React.cloneElement(children as React.ReactElement, { id } as { id: string }) : children;
    
    return (
        <div className={className}>
            <label htmlFor={id} className="text-sm text-muted block mb-1">{label}</label>
            {childWithId}
        </div>
    );
};