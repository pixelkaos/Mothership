import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../Button';
import { Panel } from './Panel';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    footer?: ReactNode;
    className?: string;
}

const focusableElementsSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, footer, className = '' }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedElement = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }

        if (event.key === 'Tab') {
            const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(focusableElementsSelector);
            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (!event.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }

            if (event.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedElement.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            
            setTimeout(() => {
                modalRef.current?.querySelector<HTMLElement>(focusableElementsSelector)?.focus();
            }, 100);

        } else {
            document.removeEventListener('keydown', handleKeyDown);
            previouslyFocusedElement.current?.focus();
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-modal p-4 animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <Panel
                ref={modalRef}
                tone="raised"
                className={`flex flex-col max-h-[90vh] p-0 ${className}`}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <header className="p-4 border-b border-primary/50 flex justify-between items-center flex-shrink-0">
                        <h2 id="modal-title" className="text-xl font-bold text-primary">{title}</h2>
                        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                    </header>
                )}
                <div className="flex-grow overflow-y-auto p-4">
                    {children}
                </div>
                {footer && (
                    <footer className="flex justify-between items-center p-4 bg-black/50 border-t border-primary/50 flex-shrink-0">
                        {footer}
                    </footer>
                )}
            </Panel>
        </div>,
        document.body
    );
};