"use client";

import React, { useState, useEffect, FC } from 'react';

// --- Type Definitions ---
interface IconProps {
    className: string;
}
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
interface FetchedQuestion {
    question_id: number;
    question_text: string;
    language: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
}
interface TestDetails {
    name: string;
    description: string;
    durationInMinutes: number;
}
type NotificationType = { type: 'success' | 'error'; message: string; } | null;
type TopicsByLanguageType = { [key: string]: string[]; };

// --- Helper Components & Data ---
const SearchIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const ClipboardListIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M9 12l2 2 4-4" /></svg>;

const Input: FC<InputProps> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <input id={id} {...props} className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm" />
    </div>
);

const Textarea: FC<TextareaProps> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <textarea id={id} {...props} className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm min-h-[100px] resize-y" />
    </div>
);

const Select: FC<SelectProps> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <select id={id} {...props} className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm">
            {children}
        </select>
    </div>
);

const Notification: FC<{ notification: NotificationType, setNotification: (notif: NotificationType) => void }> = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;
    const isError = notification.type === 'error';
    return (
        <div className={`fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-down`}>
            <p>{notification.message}</p>
        </div>
    );
};

// Reusing topics from CreateQuestions for consistent filtering
const LANGUAGES: string[] = ["JavaScript", "Python", "Java", "C++", "C", "SQL", "Go", "TypeScript", "HTML/CSS"];
const TOPICS_BY_LANGUAGE: TopicsByLanguageType = {
    "JavaScript": ["Closures", "Prototypes", "Promises & Async/Await", "Event Loop", "Hoisting", "`this` Keyword", "ES6 Features", "Map, Filter, Reduce", "DOM Manipulation", "Web APIs", "Error Handling", "Node.js Basics", "Express.js", "Testing with Jest", "Data Structures", "Algorithms"],
    "Python": ["Data Types", "Lists, Tuples, Dictionaries", "List Comprehensions", "Functions & Lambdas", "Decorators", "OOP", "Exception Handling", "File I/O", "Modules & Packages", "Flask/Django Basics", "Pandas", "NumPy", "Data Structures", "Algorithms"],
    "Java": ["Classes & Objects", "Inheritance & Polymorphism", "Interfaces", "Generics", "Lambda Expressions", "Streams API", "Collections Framework", "Exception Handling", "Concurrency", "JDBC", "Spring Framework Basics", "JPA/Hibernate", "Unit Testing (JUnit)", "Design Patterns"],
    "C++": ["Pointers & References", "Classes & Objects", "Inheritance & Virtual Functions", "Templates", "STL Containers", "STL Algorithms", "Smart Pointers", "RAII", "Move Semantics", "Lambda Expressions", "Concurrency", "Memory Management"],
    "C": ["Pointers", "Arrays & Strings", "Structs & Unions", "Dynamic Memory Allocation", "Function Pointers", "File I/O", "Preprocessor Macros", "Bitwise Operations", "Makefiles"],
    "SQL": ["SELECT & WHERE", "Aggregate Functions", "GROUP BY & HAVING", "JOINs", "Subqueries", "CTEs", "Window Functions", "Indexes", "Transactions", "Normalization"],
    "Go": ["Packages", "Structs & Methods", "Interfaces", "Error Handling", "Goroutines", "Channels", "Concurrency Patterns", "Testing", "JSON Marshaling", "Web Servers"],
    "TypeScript": ["Basic Types", "Interfaces vs. Types", "Generics", "Enums", "Utility Types", "Type Guards", "Modules & Namespaces", "Decorators", "Integration with React"],
    "HTML/CSS": ["Semantic HTML", "HTML Forms", "Accessibility (ARIA)", "CSS Selectors & Specificity", "Box Model", "CSS Grid", "CSS Flexbox", "Responsive Design", "CSS Variables", "Animations"]
};

// --- Main CreateTest Component ---
export default function CreateTest() {
    const [filter, setFilter] = useState({
        language: 'JavaScript',
        topic: '',
        difficulty: 'Any',
        limit: 15,
    });
    const [testDetails, setTestDetails] = useState<TestDetails>({ name: '', description: '', durationInMinutes: 60 });
    const [fetchedQuestions, setFetchedQuestions] = useState<FetchedQuestion[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [notification, setNotification] = useState<NotificationType>(null);

    useEffect(() => {
        // Jab bhi language badle, topic ko reset karein
        setFilter(f => ({ ...f, topic: '' }));
    }, [filter.language]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter(prev => ({ ...prev, [name]: value }));
    };
    
    const handleTestDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTestDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectQuestion = (questionId: number) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            newSet.has(questionId) ? newSet.delete(questionId) : newSet.add(questionId);
            return newSet;
        });
    };

    const handleFetchQuestions = async () => {
        setIsLoading(true);
        setNotification(null);
        setFetchedQuestions([]);
        setSelectedQuestionIds(new Set());

        const params = new URLSearchParams({
            language: filter.language,
            limit: String(filter.limit)
        });
        if (filter.topic) params.append('topic', filter.topic);
        if (filter.difficulty !== 'Any') params.append('difficulty', filter.difficulty);

        try {
            const response = await fetch(`/api/questions/find?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to fetch questions.');
            
            setFetchedQuestions(data);
            setNotification({ type: data.length > 0 ? 'success' : 'error', message: `${data.length} questions found matching your criteria.` });
            
        } catch (err: unknown) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : "An unknown error occurred." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCreateTest = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!testDetails.name.trim() || !testDetails.description.trim()) {
            setNotification({ type: 'error', message: 'Test Name and Description are required.' });
            return;
        }
        if (selectedQuestionIds.size === 0) {
            setNotification({ type: 'error', message: 'Please select at least one question.' });
            return;
        }

        setIsCreating(true);
        setNotification(null);
        
        try {
             const payload = { ...testDetails, questionIds: Array.from(selectedQuestionIds) };
            const response = await fetch('/api/tests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to create the test.');

            setNotification({ type: 'success', message: result.message });
            setTestDetails({ name: '', description: '', durationInMinutes: 60 });
            setFetchedQuestions([]);
            setSelectedQuestionIds(new Set());

        } catch (err: unknown) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : "An unknown error occurred." });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <Notification notification={notification} setNotification={setNotification} />
            <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <main className="container mx-auto max-w-6xl">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Test Builder Pro</h1>
                        <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Design and build custom tests by selecting from a vast library of questions.</p>
                    </header>
                    
                    <form onSubmit={handleCreateTest} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* --- Left Column: Filters & Test Details --- */}
                        <div className="lg:col-span-4 space-y-8">
                             {/* Filter Section */}
                            <section className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                                <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-gray-600 pb-3">1. Find Questions</h2>
                                <div className="space-y-4">
                                    <Select label="Language" name="language" value={filter.language} onChange={handleFilterChange}>
                                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                    </Select>
                                    <Select label="Topic (Optional)" name="topic" value={filter.topic} onChange={handleFilterChange}>
                                        <option value="">All Topics</option>
                                        {(TOPICS_BY_LANGUAGE[filter.language] || []).map(t => <option key={t} value={t}>{t}</option>)}
                                    </Select>
                                     <Select label="Difficulty" name="difficulty" value={filter.difficulty} onChange={handleFilterChange}>
                                        <option>Any</option><option>Easy</option><option>Moderate</option><option>Hard</option>
                                    </Select>
                                    <Input label="Max Questions to Find" name="limit" type="number" value={filter.limit} onChange={handleFilterChange} min="5" max="50" />
                                    <button type="button" onClick={handleFetchQuestions} disabled={isLoading} className="w-full h-12 flex items-center justify-center px-6 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-500/50 disabled:cursor-not-allowed shadow-md">
                                        <SearchIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                        {isLoading ? 'Searching...' : 'Find Questions'}
                                    </button>
                                </div>
                            </section>

                            {/* Test Details Section */}
                            <section className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                                <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-gray-600 pb-3">2. Test Details</h2>
                                <div className="space-y-4">
                                    <Input label="Test Name" name="name" type="text" placeholder="e.g., Advanced JavaScript Quiz" value={testDetails.name} onChange={handleTestDetailsChange} required />
                                    <Textarea label="Test Description" name="description" placeholder="A brief about what this test covers..." value={testDetails.description} onChange={handleTestDetailsChange} required />
                                    <Input label="Time Limit (minutes)" name="durationInMinutes" type="number" value={testDetails.durationInMinutes} onChange={handleTestDetailsChange} min="1" required />
                                </div>
                            </section>
                        </div>
                        
                        {/* --- Right Column: Question Selection --- */}
                        <div className="lg:col-span-8">
                            <section className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 min-h-full">
                                <h2 className="text-xl font-bold text-blue-400 mb-4 border-b border-gray-600 pb-3">3. Select Questions ({selectedQuestionIds.size} selected)</h2>
                                {fetchedQuestions.length > 0 ? (
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                        {fetchedQuestions.map(q => (
                                            <label key={q.question_id} htmlFor={`q-${q.question_id}`} className="flex items-center p-3 bg-gray-700/60 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors border-l-4 border-transparent has-[:checked]:border-green-500 has-[:checked]:bg-gray-700">
                                                <input type="checkbox" id={`q-${q.question_id}`} checked={selectedQuestionIds.has(q.question_id)} onChange={() => handleSelectQuestion(q.question_id)} className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-green-500 focus:ring-green-600" />
                                                <p className="ml-4 text-gray-200 flex-grow">{q.question_text}</p>
                                                <span className={`ml-4 px-2 py-1 text-xs font-bold rounded-full ${q.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' : q.difficulty === 'Moderate' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{q.difficulty}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <p>Questions will appear here after searching.</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* --- Submit Button --- */}
                        {fetchedQuestions.length > 0 && (
                             <div className="lg:col-span-12 text-center pt-4">
                                <button type="submit" disabled={isCreating || selectedQuestionIds.size === 0} className="w-full sm:w-auto flex items-center justify-center px-10 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:bg-green-500/50 disabled:cursor-not-allowed">
                                    <ClipboardListIcon className={`w-6 h-6 mr-3 ${isCreating ? 'animate-pulse' : ''}`} />
                                    {isCreating ? 'Creating Test...' : `Create Test with ${selectedQuestionIds.size} Questions`}
                                </button>
                            </div>
                        )}
                    </form>
                </main>
            </div>
        </>
    );
}