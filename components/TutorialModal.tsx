import React, { useState } from 'react';
import type { QuizQuestion } from '../types';

interface TutorialModalProps {
    onClose: () => void;
}

const TUTORIAL_PAGES = 3;

const QUIZ_QUESTIONS: QuizQuestion[] = [
    {
        question: "To succeed at a Strength Check with a Strength of 35, you need to roll...",
        options: ["Over 35 on a d%", "35 or under on a d%", "A 3 or a 5 on a d10"],
        correctAnswerIndex: 1
    },
    {
        question: "You have Disadvantage on a roll. You roll a 24 and a 68. Which result do you use?",
        options: ["24", "68", "You add them together"],
        correctAnswerIndex: 1
    },
    {
        question: "You have 5 Stress. To pass a Panic Check, what do you need to roll on 2d10?",
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
                        <h3 className="text-2xl font-bold text-green-300 mb-4 uppercase tracking-wider">Welcome to Mothership</h3>
                        <p className="mb-4 text-green-400 leading-relaxed">
                            Mothership is a sci-fi horror RPG where you and your crew try to survive in the most inhospitable environment in the universe: outer space. You'll excavate dangerous derelict spacecraft, explore strange unknown worlds, and examine the horrors that encroach upon your every move. This tool helps you generate derelict ships and create story hooks for your adventures.
                        </p>
                        <h4 className="text-xl font-bold text-green-300 mb-2 uppercase">Character Creation Basics</h4>
                        <ol className="list-decimal list-inside text-green-400 space-y-2">
                            <li><strong className="text-green-200">Stats:</strong> Roll 2d10+25 for your four Stats: Strength, Speed, Intellect, and Combat.</li>
                            <li><strong className="text-green-200">Saves:</strong> Roll 2d10+10 for your Saves: Sanity, Fear, and Body. Armor is determined by gear.</li>
                            <li><strong className="text-green-200">Class:</strong> Pick from Teamster, Android, Scientist, or Marine. Each class adjusts stats/saves and provides unique skills.</li>
                            <li><strong className="text-green-200">Health:</strong> Your Maximum Health is equal to 1d10+10.</li>
                            <li><strong className="text-green-200">Final Touches:</strong> Spend skill points, pick your starting equipment, and give your character a name. You're ready to play!</li>
                        </ol>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-green-300 mb-4 uppercase tracking-wider">Playing Mothership</h3>
                        <div className="space-y-4 text-green-400 leading-relaxed">
                            <div>
                                <h4 className="text-xl font-bold text-green-300 mb-1 uppercase">Checks & Saves</h4>
                                <p>When the outcome of an action is uncertain, you make a **Stat Check**. To succeed, roll a d% (two d10s, for a result of 00-99) and get a result **equal to or under** your Stat. **Saves** work the same way to resist danger.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-green-300 mb-1 uppercase">Advantage & Disadvantage</h4>
                                <p>**Advantage:** Roll d% twice and take the better (usually lower) result. **Disadvantage:** Roll d% twice and take the worse (usually higher) result.</p>
                            </div>
                             <div>
                                <h4 className="text-xl font-bold text-green-300 mb-1 uppercase">Criticals</h4>
                                <p>Rolling doubles (11, 22, 33, etc.) on a d% is a **Critical**. A successful Critical means extra good things happen. A failed Critical means extra bad things happen.</p>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-green-300 mb-1 uppercase">Stress & Panic</h4>
                                <p>Failing saves and witnessing horrors increases your **Stress**. When the GM calls for a **Panic Check**, you roll 2d10. If the roll is **greater than** your current Stress, you're fine. If it's **equal to or less than** your Stress, you panic and must roll on the Panic Effect Table.</p>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-green-300 mb-4 uppercase tracking-wider">Basic Training Test</h3>
                        <div className="space-y-6">
                            {QUIZ_QUESTIONS.map((q, i) => (
                                <div key={i}>
                                    <p className="mb-2 text-green-300">{i + 1}. {q.question}</p>
                                    <div className="space-y-1">
                                        {q.options.map((option, j) => {
                                            const isCorrect = j === q.correctAnswerIndex;
                                            const isSelected = answers[i] === j;
                                            let bgColor = 'bg-green-800/20';
                                            if (showResults) {
                                                if (isCorrect) bgColor = 'bg-green-500/50';
                                                else if (isSelected && !isCorrect) bgColor = 'bg-red-500/50';
                                            }
                                            return (
                                                <label key={j} className={`block p-2 border border-green-700 cursor-pointer ${bgColor} transition-colors`}>
                                                    <input
                                                        type="radio"
                                                        name={`question-${i}`}
                                                        className="mr-2"
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
                                <p className="text-xl text-green-200">
                                    You scored {score} out of {QUIZ_QUESTIONS.length}. {score === QUIZ_QUESTIONS.length ? "Excellent work, Marine!" : "Back to the simulator, recruit."}
                                </p>
                            ) : (
                                <button
                                    onClick={handleSubmitQuiz}
                                    className="px-6 py-2 bg-green-600/50 border border-green-400 text-green-200 uppercase tracking-widest hover:bg-green-500/50"
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
            <div className="w-full max-w-4xl max-h-[90vh] bg-black border-4 border-green-700/80 shadow-2xl shadow-green-900/50 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b-2 border-green-700/80 overflow-y-auto">
                    {renderPageContent()}
                </div>
                <div className="flex justify-between items-center p-4 bg-black/50">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-green-800/50 border border-green-600 text-green-300 uppercase tracking-widest hover:bg-green-700/50 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-green-500">Page {page} of {TUTORIAL_PAGES}</span>
                    {page < TUTORIAL_PAGES ? (
                        <button
                            onClick={() => setPage(p => Math.min(TUTORIAL_PAGES, p + 1))}
                            className="px-4 py-2 bg-green-800/50 border border-green-600 text-green-300 uppercase tracking-widest hover:bg-green-700/50"
                        >
                            Next
                        </button>
                    ) : (
                         <button
                            onClick={onClose}
                            className="px-4 py-2 bg-green-600/80 border border-green-400 text-green-100 uppercase tracking-widest hover:bg-green-500/80"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};