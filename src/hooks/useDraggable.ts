import { useState, useCallback, useRef, useEffect } from 'react';

type DraggableOptions = {
  margin?: number; // optional viewport margin to keep around the element
};

export const useDraggable = (
  initialPosition: { x: number; y: number },
  nodeRef: React.RefObject<HTMLElement>,
  options?: DraggableOptions
) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const margin = options?.margin ?? 0;

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
        const maxX = window.innerWidth - nodeWidth - margin;
        const maxY = window.innerHeight - nodeHeight - margin;

        if (nodeWidth + margin * 2 > window.innerWidth) {
            newX = margin; // too wide, anchor to margin
        } else {
            if (newX < margin) newX = margin;
            if (newX > maxX) newX = Math.max(margin, maxX);
        }

        if (nodeHeight + margin * 2 > window.innerHeight) {
            newY = margin; // too tall, keep header visible
        } else {
            if (newY < margin) newY = margin;
            if (newY > maxY) newY = Math.max(margin, maxY);
        }

        setPosition({ x: newX, y: newY });
    }, [isDragging, nodeRef, margin]);
    
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
