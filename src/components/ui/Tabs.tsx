import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/Button';

interface TabsContextType {
    activeValue: string;
    setActiveValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) throw new Error('Tabs components must be used within a <Tabs> provider.');
    return context;
};

const TabsComponent: React.FC<{ children: ReactNode; defaultValue: string }> = ({ children, defaultValue }) => {
    const [activeValue, setActiveValue] = useState(defaultValue);
    return (
        <TabsContext.Provider value={{ activeValue, setActiveValue }}>
            <div>{children}</div>
        </TabsContext.Provider>
    );
};

const List: React.FC<{ children: ReactNode }> = ({ children }) => (
    <div className="flex border-b border-secondary/50" role="tablist">
        {children}
    </div>
);

const Trigger: React.FC<{ children: ReactNode; value: string }> = ({ children, value }) => {
    const { activeValue, setActiveValue } = useTabs();
    const isActive = activeValue === value;
    return (
        <Button
            variant="tab"
            size="md"
            onClick={() => setActiveValue(value)}
            isActive={isActive}
            className="flex-1"
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-content-${value}`}
        >
            {children}
        </Button>
    );
};

const Content: React.FC<{ children: ReactNode; value: string }> = ({ children, value }) => {
    const { activeValue } = useTabs();
    return activeValue === value ? (
        <div role="tabpanel" id={`tab-content-${value}`} tabIndex={0}>
            {children}
        </div>
    ) : null;
};

const Tabs = Object.assign(TabsComponent, {
    List,
    Trigger,
    Content,
});


export { Tabs };
