import { useState, useCallback, useRef, useEffect } from 'react';

export const useDraggable = (initialPosition: { x: number; y: number }, nodeRef: React.RefObject<HTMLElement>) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (!nodeRef.current) return;
        
        // Prevent drag on interactive elements inside the handle
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, textarea')) {
            return;
        }

        setIsDragging(true);
        const rect = nodeRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        e.preventDefault();
    }, [nodeRef]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !nodeRef.current) return;
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;

        const nodeWidth = nodeRef.current.offsetWidth;
        const nodeHeight = nodeRef.current.offsetHeight;
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + nodeWidth > window.innerWidth) newX = window.innerWidth - nodeWidth;
        if (newY + nodeHeight > window.innerHeight) newY = window.innerHeight - nodeHeight;

        setPosition({ x: newX, y: newY });
    }, [isDragging, nodeRef]);
    
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        handleMouseDown,
        isDragging,
    };
};
