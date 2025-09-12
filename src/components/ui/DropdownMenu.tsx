import React, { useState, useContext, createContext, useRef, useEffect, useCallback, ReactNode } from 'react';
import { Button } from '@/components/Button';

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
    
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

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
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
        }
    };

    if (asChild) {
        const childOnClick = (children.props as any).onClick;
        const childOnKeyDown = (children.props as any).onKeyDown;

        return React.cloneElement(children as any, {
            ref: triggerRef,
            onClick: (e: React.MouseEvent) => {
                childOnClick?.(e);
                handleToggle();
            },
             onKeyDown: (e: React.KeyboardEvent) => {
                childOnKeyDown?.(e);
                handleKeyDown(e);
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
            onKeyDown={handleKeyDown}
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

    useEffect(() => {
        if (isOpen) {
            const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])');
            firstItem?.focus();
        }
    }, [isOpen, menuRef]);

    const handleContentKeyDown = (e: React.KeyboardEvent) => {
        const { key } = e;
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
        
        e.preventDefault();
        const items = Array.from(
            menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') || []
        );
        if (items.length === 0) return;

        const activeIndex = items.findIndex(item => item === document.activeElement);
        let nextIndex = -1;

        if (key === 'ArrowDown') {
            nextIndex = (activeIndex + 1) % items.length;
        } else if (key === 'ArrowUp') {
            nextIndex = (activeIndex - 1 + items.length) % items.length;
        } else if (key === 'Home') {
            nextIndex = 0;
        } else if (key === 'End') {
            nextIndex = items.length - 1;
        }
        
        if (nextIndex !== -1) {
            items[nextIndex]?.focus();
        }
    };

    return isOpen ? (
        <div
            id={id}
            ref={menuRef}
            role="menu"
            className="absolute top-full left-0 min-w-full bg-black/20 border border-primary/30 shadow-elev2 z-menu animate-fadeIn py-1 rounded-lg"
            onKeyDown={handleContentKeyDown}
        >
            {children}
        </div>
    ) : null;
};

const Item: React.FC<{ children: ReactNode; onSelect?: () => void; disabled?: boolean }> = ({ children, onSelect, disabled }) => {
    const { setIsOpen, triggerRef } = useDropdownMenu();

    const handleSelect = () => {
        if (disabled) return;
        onSelect?.();
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleSelect}
            disabled={disabled}
            className="block w-full text-left justify-start px-4 text-secondary hover:bg-secondary/20 active:bg-secondary/30 disabled:text-muted disabled:bg-black/20 rounded-none"
            role="menuitem"
            tabIndex={-1} // Items are focused programmatically
        >
            {children}
        </Button>
    );
};

const DropdownMenu = Object.assign(DropdownMenuComponent, {
    Trigger,
    Content,
    Item,
});

export { DropdownMenu };
