import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Button } from '../Button';

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

// FIX: Renamed component to avoid conflict before Object.assign
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
            variant="secondary"
            size="md"
            onClick={() => setActiveValue(value)}
            className={`flex-1 rounded-b-none border-b-0 ${isActive ? 'bg-secondary text-background' : 'bg-transparent text-secondary hover:bg-secondary/20'}`}
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

// FIX: Use Object.assign to attach sub-components for the correct component composition pattern.
const Tabs = Object.assign(TabsComponent, {
    List,
    Trigger,
    Content,
});


export { Tabs };