
import React, { useState, useEffect } from 'react';

interface AILogDisplayProps {
    description: string;
    isLoading: boolean;
    error: string;
}

const TypingEffect: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText('');
        if (!text) return;
        
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(intervalId);
            }
        }, 10);

        return () => clearInterval(intervalId);
    }, [text]);

    return (
        <div className="whitespace-pre-wrap leading-relaxed text-green-300">
            {displayedText}
            <span className="animate-pulse">_</span>
        </div>
    );
}

export const AILogDisplay: React.FC<AILogDisplayProps> = ({ description, isLoading, error }) => {
    return (
        <div className="border-2 border-green-700/50 p-6 flex flex-col bg-green-900/10">
            <h3 className="text-2xl font-bold text-green-400 mb-4 uppercase tracking-wider">AI Gamemaster Report</h3>
            <div className="flex-grow overflow-y-auto p-2 bg-black/30 custom-scrollbar">
                {isLoading && (
                     <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-green-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                             <p className="mt-4 text-green-500 animate-pulse">DECRYPTING TRANSMISSION...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-full text-center text-red-500">
                        <div>
                            <p className="font-bold text-lg">[TRANSMISSION ERROR]</p>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                {!isLoading && !error && !description && (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-green-600">Awaiting input... Stand by for AI analysis.</p>
                     </div>
                )}
                {!isLoading && !error && description && (
                    <TypingEffect text={description} />
                )}
            </div>
        </div>
    );
};
