import React, { useRef, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useDraggable } from '@/hooks/useDraggable';
import { IconButton } from '@/components/ui/IconButton';
import { useDockablePanel } from '@/hooks/useDockablePanel';
import { usePanels, PanelId } from '@/context/PanelsContext';

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
    const { getState, openPanelIds } = usePanels();
    const panelRef = useRef<HTMLDivElement>(null);
    
    const SAFE_MARGIN = 24; // top/bottom padding to avoid edge jitter
    const { position: draggablePosition, isDragging, handleMouseDown } = useDraggable(state.position, panelRef, { margin: SAFE_MARGIN });

    const isActive = useMemo(() => {
        if (openPanelIds.length === 0 || !state.isOpen) return false;
        const maxZIndex = Math.max(...openPanelIds.map(panelId => getState(panelId).zIndex));
        return state.zIndex === maxZIndex;
    }, [openPanelIds, getState, state.zIndex, state.isOpen]);

    useEffect(() => {
        setPosition(draggablePosition);
    }, [draggablePosition, setPosition]);

    // Keep panel fully within viewport on open and when the window resizes.
    useEffect(() => {
        const clampIntoViewport = () => {
            if (!panelRef.current) return;
            const margin = SAFE_MARGIN;
            const rect = panelRef.current.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let x = state.position.x;
            let y = state.position.y;
            if (rect.width > vw - margin * 2) {
                x = margin; // too wide; anchor to margin
            } else {
                x = Math.max(margin, Math.min(x, vw - rect.width - margin));
            }
            if (rect.height > vh - margin * 2) {
                y = margin; // too tall; show header by pinning to margin
            } else {
                y = Math.max(margin, Math.min(y, vh - rect.height - margin));
            }
            if (x !== state.position.x || y !== state.position.y) {
                setPosition({ x, y });
            }
        };
        if (state.isOpen && !state.isMinimized) {
            // Run after render so dimensions are available
            setTimeout(clampIntoViewport, 0);
        }
        window.addEventListener('resize', clampIntoViewport);
        return () => window.removeEventListener('resize', clampIntoViewport);
    }, [state.isOpen, state.isMinimized, state.position.x, state.position.y, setPosition]);

    const handleHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        bringToFront();
        handleMouseDown(e);
    }, [bringToFront, handleMouseDown]);
    
    if (!state.isOpen) {
        return null;
    }

    const shadowClass = isActive
        ? 'shadow-elev2 shadow-primary/20'
        : 'shadow-elev1 shadow-black/50';

    return (
        <div
            ref={panelRef}
            className={`fixed bg-background border border-primary/80 flex flex-col rounded-lg overflow-hidden transition-[box-shadow] duration-200 ease-standard max-h-[calc(100vh-48px)] ${shadowClass} ${className}`}
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
                <div className="flex items-center gap-x-1">
                    <IconButton size="sm" onClick={() => (state.isMinimized ? restore() : minimize())} aria-label={state.isMinimized ? "Expand" : "Minimize"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {state.isMinimized ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />}
                        </svg>
                    </IconButton>
                    <IconButton size="sm" onClick={close} aria-label="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </IconButton>
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
