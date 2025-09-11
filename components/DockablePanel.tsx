
import React, { useRef, ReactNode, useCallback, useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Button } from './Button';
import { useAppContext } from '../context/AppContext';
import { useDockablePanel } from '../hooks/useDockablePanel';

interface DockablePanelProps {
    title: string;
    children: ReactNode;
    initialPosition: { x: number; y: number };
    className?: string;
    panelId: string;
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
    title,
    children,
    initialPosition,
    className = '',
    panelId,
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    
    const { 
        isOpen, 
        isMinimized, 
        position, 
        setPosition, 
        close, 
        toggleMinimize, 
        bringToFront 
    } = useDockablePanel({ id: panelId, initialPosition });
    
    const { position: draggablePosition, isDragging, handleMouseDown } = useDraggable(position, panelRef);

    useEffect(() => {
        setPosition(draggablePosition);
    }, [draggablePosition, setPosition]);

    const { panelStack } = useAppContext();
    const zIndex = 40 + (panelStack.length - panelStack.indexOf(panelId));

    const handleHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        bringToFront();
        handleMouseDown(e);
    }, [bringToFront, handleMouseDown]);
    
    if (!isOpen) {
        return null;
    }

    return (
        <div
            ref={panelRef}
            className={`fixed bg-background border border-primary/80 shadow-2xl shadow-primary/20 flex flex-col ${className}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                userSelect: isDragging ? 'none' : 'auto',
                zIndex: zIndex,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`panel-title-${panelId}`}
        >
            <header
                className="flex justify-between items-center p-2 bg-black/30 cursor-move border-b border-primary/50"
                onMouseDown={handleHeaderMouseDown}
            >
                <h2 id={`panel-title-${panelId}`} className="font-bold text-primary uppercase tracking-wider text-sm pl-2">
                    {title}
                </h2>
                <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={toggleMinimize} aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={close} aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
            </header>
            
            {!isMinimized && (
                <div className="bg-black/30 overflow-y-auto">
                    {children}
                </div>
            )}
        </div>
    );
};