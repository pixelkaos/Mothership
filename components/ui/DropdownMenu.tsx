import React, { useState, useContext, createContext, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '../Button';

interface DropdownMenuContextType {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    triggerRef: React.RefObject<HTMLButtonElement>;
    menuRef: React.RefObject<HTMLDivElement>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

const useDropdownMenu = () => {
    const context = useContext(DropdownMenuContext);
    if (!context) {
        throw new Error('useDropdownMenu must be used within a DropdownMenu provider');
    }
    return context;
};

const DropdownMenuComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
            menuRef.current && !menuRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, triggerRef, menuRef }}>
            <div className="relative inline-block">{children}</div>
        </DropdownMenuContext.Provider>
    );
};

const Trigger: React.FC<{ children: React.ReactElement, asChild?: boolean }> = ({ children, asChild = true }) => {
    const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();
    const id = React.useId();
    
    const handleToggle = () => setIsOpen(prev => !prev);

    if (asChild) {
        // FIX: Cast `children` to `any` to allow cloning with `ref` and `onClick`, a common workaround for `asChild` patterns with TypeScript.
        return React.cloneElement(children as any, {
            ref: triggerRef,
            onClick: (e: React.MouseEvent) => {
                children.props.onClick?.(e);
                handleToggle();
            },
            'aria-haspopup': 'menu',
            'aria-expanded': isOpen,
            'aria-controls': isOpen ? id : undefined,
        });
    }

    return (
        <Button
            ref={triggerRef}
            onClick={handleToggle}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={isOpen ? id : undefined}
        >
            {children}
        </Button>
    );
};

const Content: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isOpen, menuRef } = useDropdownMenu();
    const id = React.useId();

    return isOpen ? (
        <div
            id={id}
            ref={menuRef}
            role="menu"
            className="absolute top-full left-0 min-w-full bg-background border border-t-0 border-secondary/50 shadow-lg z-20 animate-fadeIn py-1"
        >
            {children}
        </div>
    ) : null;
};

const Item: React.FC<{ children: ReactNode; onSelect?: () => void; disabled?: boolean }> = ({ children, onSelect, disabled }) => {
    const { setIsOpen } = useDropdownMenu();

    const handleSelect = () => {
        if (disabled) return;
        onSelect?.();
        setIsOpen(false);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSelect}
            disabled={disabled}
            className="block w-full text-left justify-start px-4 text-secondary hover:bg-secondary hover:text-background disabled:text-muted disabled:bg-black/20 rounded-none"
            role="menuitem"
        >
            {children}
        </Button>
    );
};

// FIX: Use Object.assign to correctly attach sub-components to the main DropdownMenu component.
const DropdownMenu = Object.assign(DropdownMenuComponent, {
    Trigger,
    Content,
    Item,
});


export { DropdownMenu };
