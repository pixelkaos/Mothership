import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface TutorialModalProps {
    onClose: () => void;
}

const TUTORIAL_PAGES = 3;

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "To succeed at a Strength Check with a Strength of 35, you need to roll...",
        options: ["Over 35 on a d100", "35 or less on a d100", "Exactly 35 on a d100"],
        correctAnswerIndex: 1
    },
    {
        question: "You have Disadvantage on a roll. You roll a 24 and a 68. Which result do you use?",
        options: ["24", "68", "You add them together"],
        correctAnswerIndex: 1
    },
    {
        question: "You have 5 Stress. To pass a Panic Check, what do you need to roll on a 1d20?",
        options: ["5 or less", "Exactly 5", "6 or more"],
        correctAnswerIndex: 2
    }
];

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    const [page, setPage] = useState(1);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleSubmitQuiz = () => {
        setShowResults(true);
    };

    const score = answers.reduce((acc, answer, index) => {
        return acc + (answer === QUIZ_QUESTIONS[index].correctAnswerIndex ? 1 : 0);
    }, 0);

    const renderPageContent = () => {
        switch (page) {
            case 1:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 uppercase tracking-wider">Welcome to Mothership</h3>
                        <p className="mb-4 text-foreground leading-relaxed">
                            Mothership is a sci-fi horror RPG where you and your crew try to survive in the most inhospitable environment in the universe: outer space. You'll excavate dangerous derelict spacecraft, explore strange unknown worlds, and examine the horrors that encroach upon your every move. This tool helps you generate derelict ships and create story hooks for your adventures.
                        </p>
                        <h4 className="text-xl font-bold text-primary mb-2 uppercase">Character Creation Basics</h4>
                        <ol className="list-decimal list-inside text-foreground space-y-2">
                            <li><strong className="text-primary">Stats:</strong> Roll 2d10+25 for your four Stats: Strength, Speed, Intellect, and Combat.</li>
                            <li><strong className="text-primary">Saves:</strong> Roll 2d10+10 for your Saves: Sanity, Fear, and Body.</li>
                            <li><strong className="text-primary">Class:</strong> Pick from Teamster, Android, Scientist, or Marine. Each class adjusts stats/saves and provides unique skills.</li>
                            <li><strong className="text-primary">Health:</strong> Your Maximum Health is equal to 1d10+10.</li>
                            <li><strong className="text-primary">Final Touches:</strong> Select your bonus skills, roll for your starting equipment, trinket, and patch. You start with 2d10x10 Credits and 2 Stress. You're ready to play!</li>
                        </ol>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 uppercase tracking-wider">Playing Mothership</h3>
                        <div className="space-y-4 text-foreground leading-relaxed">
                            <div>
                                <h4 className="text-xl font-bold text-primary mb-1 uppercase">Checks & Saves</h4>
                                <p>When the outcome of an action is uncertain, you make a **Stat Check**. To succeed, roll a d100 (two d10s, for a result of 00-99) and get a result **equal to or less than** your Stat. **Saves** work the same way to resist danger. A roll of 90-99 is always a failure.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-primary mb-1 uppercase">Advantage & Disadvantage</h4>
                                <p>**Advantage (+):** Roll d100 twice and take the better (lower) result. **Disadvantage (-):** Roll d100 twice and take the worse (higher) result.</p>
                            </div>
                             <div>
                                <h4 className="text-xl font-bold text-primary mb-1 uppercase">Criticals</h4>
                                <p>Rolling doubles (11, 22, 33, etc.) on a d100 is a **Critical**. A successful Critical is a Critical Success. A failed Critical is a Critical Failure, and you must make a Panic Check. A roll of 00 is always a Critical Success, and 99 is always a Critical Failure.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-primary mb-1 uppercase">Stress & Panic</h4>
                                <p>Failing saves and witnessing horrors increases your **Stress**. When the Warden calls for a **Panic Check**, you roll a **1d20 (the Panic Die)**. If the roll is **greater than** your current Stress, you keep your cool. If it's **less than or equal to** your Stress, you panic and consult the Panic Effect Table.</p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-4 uppercase tracking-wider">Basic Training Test</h3>
                        <div className="space-y-6">
                            {QUIZ_QUESTIONS.map((q, i) => (
                                <div key={i}>
                                    <p className="mb-2 text-primary">{i + 1}. {q.question}</p>
                                    <div className="space-y-1">
                                        {q.options.map((option, j) => {
                                            const isCorrect = j === q.correctAnswerIndex;
                                            const isSelected = answers[i] === j;
                                            let bgColor = 'bg-black/20';
                                            if (showResults) {
                                                if (isCorrect) bgColor = 'bg-positive/30';
                                                else if (isSelected && !isCorrect) bgColor = 'bg-negative/30';
                                            }
                                            return (
                                                <label key={j} className={`block p-2 border border-muted cursor-pointer ${bgColor} transition-colors`}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${i}`}
                                                        className="mr-2 accent-primary"
                                                        checked={isSelected}
                                                        onChange={() => !showResults && handleAnswerChange(i, j)}
                                                        disabled={showResults}
                                                    />
                                                    {option}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            {showResults ? (
                                <p className={`text-xl ${score === QUIZ_QUESTIONS.length ? 'text-positive' : 'text-primary'}`}>
                                    You scored {score} out of {QUIZ_QUESTIONS.length}. {score === QUIZ_QUESTIONS.length ? "Excellent work, Marine!" : "Back to the simulator, recruit."}
                                </p>
                            ) : (
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="px-4 py-3 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-hover disabled:text-background/70 disabled:cursor-not-allowed"
                                >
                                    Submit Answers
                                </button>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="w-full max-w-4xl max-h-[90vh] bg-background border border-primary shadow-2xl shadow-primary/20 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-primary/50 overflow-y-auto">
                    {renderPageContent()}
                </div>
                <div className="flex justify-between items-center p-4 bg-black/50">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-primary text-primary hover:bg-primary hover:text-background active:bg-primary-pressed active:border-primary-pressed disabled:border-primary-hover disabled:text-primary-hover/70 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    <span className="text-muted">Page {page} of {TUTORIAL_PAGES}</span>
                    {page < TUTORIAL_PAGES ? (
                        <button
                            onClick={() => setPage(p => Math.min(TUTORIAL_PAGES, p + 1))}
                            className="px-4 py-2 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-transparent border border-primary text-primary hover:bg-primary hover:text-background active:bg-primary-pressed active:border-primary-pressed disabled:border-primary-hover disabled:text-primary-hover/70 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    ) : (
                         <button
                            onClick={onClose}
                            className="px-4 py-2 uppercase tracking-widest transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-focus bg-primary text-background hover:bg-primary-hover active:bg-primary-pressed disabled:bg-primary-hover disabled:text-background/70 disabled:cursor-not-allowed"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};