
import React, { useState, useRef, ReactNode, useCallback } from 'react';
import { useDraggable } from '../hooks/useDraggable';
import { Button } from './Button';
import { useAppContext } from '../context/AppContext';

interface DockablePanelProps {
    title: string;
    children: ReactNode;
    isVisible: boolean;
    onClose: () => void;
    initialPosition: { x: number; y: number };
    className?: string;
    panelId: string;
}

export const DockablePanel: React.FC<DockablePanelProps> = ({
    title,
    children,
    isVisible,
    onClose,
    initialPosition,
    className = '',
    panelId,
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const { position, handleMouseDown: handleDragMouseDown, isDragging } = useDraggable(initialPosition, panelRef);
    const { panelStack, bringPanelToFront } = useAppContext();

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        bringPanelToFront(panelId);
        handleDragMouseDown(e);
    }, [bringPanelToFront, panelId, handleDragMouseDown]);

    const zIndex = 40 + panelStack.indexOf(panelId);
    
    if (!isVisible) {
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
            aria-labelledby="panel-title"
        >
            <header
                className="flex justify-between items-center p-2 bg-black/30 cursor-move border-b border-primary/50"
                onMouseDown={handleMouseDown}
            >
                <h2 id="panel-title" className="font-bold text-primary uppercase tracking-wider text-sm pl-2">
                    {title}
                </h2>
                <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} aria-label={isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
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
