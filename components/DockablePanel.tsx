
import React, { useRef, ReactNode, useCallback, useEffect } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Button } from './Button';
import { useDockablePanel } from '../hooks/useDockablePanel';
import type { PanelId } from '../context/PanelsContext';

interface DockablePanelProps {
    title: string;
    children: ReactNode;
    className?: string;
    id: PanelId;
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
    title,
    children,
    className = '',
    id,
}) => {
    const { state, close, minimize, restore, bringToFront, setPosition } = useDockablePanel(id);
    const panelRef = useRef<HTMLDivElement>(null);
    
    const { position: draggablePosition, isDragging, handleMouseDown } = useDraggable(state.position, panelRef);

    useEffect(() => {
        setPosition(draggablePosition);
    }, [draggablePosition, setPosition]);

    const handleHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        bringToFront();
        handleMouseDown(e);
    }, [bringToFront, handleMouseDown]);
    
    if (!state.isOpen) {
        return null;
    }

    return (
        <div
            ref={panelRef}
            className={`fixed bg-background border border-primary/80 shadow-2xl shadow-primary/20 flex flex-col rounded-lg overflow-hidden ${className}`}
            style={{
                left: `${state.position.x}px`,
                top: `${state.position.y}px`,
                userSelect: isDragging ? 'none' : 'auto',
                zIndex: state.zIndex,
            }}
            role="dialog"
            aria-modal={!state.isMinimized}
            aria-labelledby={`panel-title-${id}`}
            onMouseDown={bringToFront}
        >
            <header
                className="flex justify-between items-center p-2 bg-black/30 cursor-move border-b border-primary/50"
                onMouseDown={handleHeaderMouseDown}
            >
                <h2 id={`panel-title-${id}`} className="font-bold text-primary uppercase tracking-wider text-sm pl-2">
                    {title}
                </h2>
                <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => (state.isMinimized ? restore() : minimize())} aria-label={state.isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {state.isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={close} aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
            </header>
            
            {!state.isMinimized && (
                <div className="bg-black/30 overflow-y-auto">
                    {children}
                </div>
            )}
        </div>
    );
};
