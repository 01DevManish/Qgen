"use client";

import React, { useState, useEffect, FC, useCallback } from 'react';

// --- Type Definitions ---
interface IconProps {
    className: string;
}
interface TestSummary {
    test_id: number;
    name: string;
    description: string;
    duration_minutes: number;
    question_count: string; 
    created_at: string;
}
interface Question {
    question_id: number;
    question_text: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    language: string;
}
interface TestDetails extends TestSummary {
    questions: Question[];
}
type NotificationType = { type: 'success' | 'error'; message: string; } | null;

// --- Helper Components & Icons ---
const EditIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const SearchIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const PlusIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LANGUAGES: string[] = ["JavaScript", "Python", "Java", "C++", "C", "SQL", "Go", "TypeScript", "HTML/CSS"];

const Notification: FC<{ notification: NotificationType, setNotification: (notif: NotificationType) => void }> = ({ notification, setNotification }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;
    return (
        <div className={`fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-down`}>
            <p>{notification.message}</p>
        </div>
    );
};

// --- Main AllTests Component ---
export default function AllTests() {
    const [tests, setTests] = useState<TestSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTest, setSelectedTest] = useState<TestDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState<NotificationType>(null);

    const fetchAllTests = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/tests');
            if (!response.ok) throw new Error('Failed to fetch tests.');
            const data = await response.json();
            setTests(data);
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllTests();
    }, [fetchAllTests]);

    const handleEditClick = async (testId: number) => {
        const url = `/api/tests/${testId}`;
        // DEBUG: Log the exact URL being requested to the browser console
        console.log(`Attempting to fetch from: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `Failed to fetch test details. Status: ${response.status}` }));
                throw new Error(errorData.error);
            }
            const data = await response.json();
            setSelectedTest(data);
            setIsModalOpen(true);
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred.' });
        }
    };

    const handleDeleteTest = async (testId: number) => {
        if (!window.confirm('Are you sure you want to delete this test permanently?')) return;
        try {
            const response = await fetch(`/api/tests/${testId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to delete the test.' }));
                throw new Error(errorData.error);
            }
            setNotification({ type: 'success', message: 'Test deleted successfully.' });
            fetchAllTests();
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'An unknown error occurred.' });
        }
    };

    return (
        <>
            <Notification notification={notification} setNotification={setNotification} />
            <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <main className="container mx-auto max-w-7xl">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-500">Test Management</h1>
                        <p className="text-gray-400 mt-3 max-w-2xl mx-auto">View, update, and delete all created tests.</p>
                    </header>

                    {isLoading ? (
                        <p className="text-center text-gray-400">Loading tests...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tests.map(test => (
                                <div key={test.test_id} className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-rose-400">{test.name}</h2>
                                        <p className="text-gray-400 mt-2 text-sm line-clamp-2">{test.description}</p>
                                        <div className="mt-4 text-xs text-gray-500">
                                            <span>Questions: {test.question_count}</span> | <span>Time: {test.duration_minutes} min</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center mt-6 gap-2">
                                        <button onClick={() => handleDeleteTest(test.test_id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleEditClick(test.test_id)} className="flex items-center px-4 py-2 bg-rose-600 rounded-lg font-semibold hover:bg-rose-700 transition-all duration-200 shadow-md text-sm">
                                            <EditIcon className="w-4 h-4 mr-2" />
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
            {isModalOpen && selectedTest && (
                <EditTestModal
                    test={selectedTest}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={() => {
                        setIsModalOpen(false);
                        fetchAllTests();
                    }}
                    setNotification={setNotification}
                />
            )}
        </>
    );
}

// --- EditTestModal Component ---
const EditTestModal: FC<{ test: TestDetails, onClose: () => void, onUpdate: () => void, setNotification: (n: NotificationType) => void }> = ({ test, onClose, onUpdate, setNotification }) => {
    const [details, setDetails] = useState({ name: test.name, description: test.description, duration_minutes: test.duration_minutes });
    const [questions, setQuestions] = useState<Question[]>(test.questions);
    const [foundQuestions, setFoundQuestions] = useState<Question[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [filters, setFilters] = useState({ language: test.questions[0]?.language || 'JavaScript', difficulty: 'Any' });

    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/tests/${test.test_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details),
            });
            if (!response.ok) throw new Error('Failed to save changes.');
            setNotification({ type: 'success', message: 'Test details updated.' });
            onUpdate();
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Save failed.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveQuestion = async (questionId: number) => {
        try {
            const response = await fetch(`/api/tests/${test.test_id}/questions`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId }),
            });
            if (!response.ok) throw new Error('Failed to remove question.');
            setQuestions(prev => prev.filter(q => q.question_id !== questionId));
            setNotification({ type: 'success', message: 'Question removed.' });
        } catch (err) {
            setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Removal failed.' });
        }
    };
    
    const handleFindQuestions = async () => {
        const params = new URLSearchParams({ language: filters.language, limit: '20' });
        if (filters.difficulty !== 'Any') {
            params.append('difficulty', filters.difficulty);
        }

        const response = await fetch(`/api/questions/find?${params.toString()}`);
        const data = await response.json();
        const newQuestions = data.filter((fq: Question) => !questions.some(q => q.question_id === fq.question_id));
        setFoundQuestions(newQuestions);
        if(newQuestions.length === 0) {
            setNotification({ type: 'error', message: 'No new questions found with these filters.' });
        }
    };

    const handleAddQuestion = async (questionId: number) => {
        try {
            const response = await fetch(`/api/tests/${test.test_id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionIds: [questionId] }),
            });
             if (!response.ok) throw new Error('Failed to add question.');
            const addedQuestion = foundQuestions.find(q => q.question_id === questionId);
            if(addedQuestion) {
                setQuestions(prev => [...prev, addedQuestion]);
                setFoundQuestions(prev => prev.filter(q => q.question_id !== questionId));
            }
            setNotification({ type: 'success', message: 'Question added.' });
        } catch (err) {
             setNotification({ type: 'error', message: err instanceof Error ? err.message : 'Add failed.' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-rose-400">Edit Test</h2>
                </header>

                <main className="p-6 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Side */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-3 text-gray-300">Test Details</h3>
                            <div className="space-y-4">
                                <input name="name" value={details.name} onChange={handleDetailChange} className="w-full p-2 bg-gray-700 rounded" placeholder="Test Name" />
                                <textarea name="description" value={details.description} onChange={handleDetailChange} className="w-full p-2 bg-gray-700 rounded min-h-[80px]" placeholder="Description" />
                                <input name="duration_minutes" type="number" value={details.duration_minutes} onChange={handleDetailChange} className="w-full p-2 bg-gray-700 rounded" placeholder="Duration (minutes)" />
                            </div>
                        </section>
                        <section>
                            <h3 className="text-lg font-semibold mb-3 text-gray-300">Current Questions ({questions.length})</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {questions.map(q => (
                                    <div key={q.question_id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded">
                                        <p className="text-sm text-gray-200 flex-grow">{q.question_text}</p>
                                        <button onClick={() => handleRemoveQuestion(q.question_id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-6">
                        <section>
                             <h3 className="text-lg font-semibold mb-3 text-gray-300">Add Questions</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                                <select name="language" value={filters.language} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded">
                                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                                <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded">
                                    <option>Any</option><option>Easy</option><option>Moderate</option><option>Hard</option>
                                </select>
                                <button onClick={handleFindQuestions} className="sm:col-span-2 w-full flex items-center justify-center p-2 bg-blue-600 rounded font-semibold hover:bg-blue-700 transition-colors">
                                    <SearchIcon className="w-4 h-4 mr-2"/> Find Questions
                                </button>
                             </div>
                        </section>
                        {foundQuestions.length > 0 && (
                             <section>
                                <h3 className="text-lg font-semibold mb-3 text-gray-300">Found Questions</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {foundQuestions.map(q => (
                                        <div key={q.question_id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded">
                                            <p className="text-sm text-gray-200 flex-grow">{q.question_text}</p>
                                            <button onClick={() => handleAddQuestion(q.question_id)} className="p-1 text-gray-400 hover:text-green-400"><PlusIcon className="w-5 h-5"/></button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </main>

                <footer className="p-6 border-t border-gray-700 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded font-semibold hover:bg-gray-700">Cancel</button>
                    <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-2 bg-rose-600 rounded font-semibold hover:bg-rose-700 disabled:bg-rose-800">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
