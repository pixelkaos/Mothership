import React from 'react';

interface CardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    action: React.ReactNode;
    onClick: () => void;
}

export const Card: React.FC<CardProps> = ({ title, description, icon, action, onClick }) => (
    <div
        className="border border-primary/50 p-6 flex flex-col items-center text-center bg-black/30 h-full group transition-all duration-300 hover:bg-primary/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 cursor-pointer"
        onClick={onClick}
    >
        <div className="w-20 h-20 text-primary mb-4 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className="text-2xl font-bold text-primary uppercase tracking-wider">{title}</h3>
        <p className="text-muted text-sm my-4 flex-grow">{description}</p>
        {action}
    </div>
);
