import React, { createContext, useState, useContext, ReactNode, useRef, useCallback } from 'react';

// --- Context Definition ---
interface TooltipContextType {
    showTooltip: (content: ReactNode, e: React.MouseEvent) => void;
    hideTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
    const context = useContext(TooltipContext);
    if (!context) {
        throw new Error('useTooltip must be used within a TooltipProvider');
    }
    return context;
};

// --- State Store ---
type TooltipState = {
    isVisible: boolean;
    content: ReactNode | null;
    position: { x: number; y: number };
};

// --- Provider Component ---
export const TooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<TooltipState>({
        isVisible: false,
        content: null,
        position: { x: 0, y: 0 },
    });
    const hoverTimeout = useRef<number | null>(null);

    const showTooltip = useCallback((newContent: ReactNode, e: React.MouseEvent) => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        const { clientX, clientY } = e;

        hoverTimeout.current = window.setTimeout(() => {
            const margin = 15;
            let x = clientX + margin;
            let y = clientY + margin;

            if (x + 320 > window.innerWidth) { // Assumes max-w-xs (320px)
                x = clientX - 320 - margin;
            }
            if (y + 200 > window.innerHeight) { // Assumes max height
                y = clientY - 200 - margin;
            }
             if (y < 0) y = margin;


            setState({
                content: newContent,
                position: { x, y },
                isVisible: true,
            });
        }, 700); // Delay before showing
    }, []);

    const hideTooltip = useCallback(() => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        setState(s => ({ ...s, isVisible: false }));
    }, []);

    const value = { showTooltip, hideTooltip };

    return (
        <TooltipContext.Provider value={value}>
            {children}
            <TooltipDisplay {...state} />
        </TooltipContext.Provider>
    );
};


// --- Display Component (private to this module) ---
const TooltipDisplay: React.FC<TooltipState> = ({ isVisible, content, position }) => {
    if (!isVisible || !content) {
        return null;
    }

    return (
        <div
            className="fixed z-[999] p-3 bg-black border-2 border-green-500 text-green-300 text-sm rounded-md shadow-lg shadow-green-900/50 max-w-xs pointer-events-none transition-opacity duration-200"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                opacity: isVisible ? 1 : 0,
            }}
            role="tooltip"
        >
            {content}
        </div>
    );
};
