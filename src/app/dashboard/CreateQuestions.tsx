"use client";

import React, { useState, useEffect, forwardRef, FC } from 'react';

// --- Type Definitions ---
interface IconProps {
    className: string;
}
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label: string;
    as?: 'input' | 'textarea';
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
interface QuestionFormState {
    question_text: string;
    code_snippet: string;
    explanation: string;
    options: string;
    correct_answers: string;
    topics: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    question_type: 'MCQ' | 'MSQ' | 'Fill in the blank';
    language: string;
}
type TopicsByLanguageType = { [key: string]: string[]; };
type NotificationType = { type: 'success' | 'error'; message: string; } | null;

// FIX: New interface for AI-generated questions
interface GeneratedQuestion {
    question_text: string;
    code_snippet: string;
    explanation: string;
    options: Record<string, string>;
    correct_answers: string[];
    topics: string[];
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    question_type: 'MCQ' | 'MSQ' | 'Fill in the blank';
    language: string;
}


// --- Helper Components & Data ---
const SparklesIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 12l-2.293 2.293a1 1 0 01-1.414 0L4 12m16 8l-2.293-2.293a1 1 0 00-1.414 0L14 18l2.293 2.293a1 1 0 001.414 0L20 18z" /></svg>;
const UploadIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>;
const TrashIcon: FC<IconProps> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({ label, as = "input", id, ...props }, ref) => {
    const Component = as;
    const baseClasses = "w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm";
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
            {/* FIX: Correctly handle forwarded ref for a dynamic component with an intersection type. */}
            <Component id={id} {...props} ref={ref as React.Ref<HTMLInputElement & HTMLTextAreaElement>} className={Component === 'textarea' ? `${baseClasses} min-h-[120px] resize-y` : baseClasses} />
        </div>
    );
});
Input.displayName = 'Input';

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
            const timer = setTimeout(() => {
                setNotification(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, setNotification]);

    if (!notification) return null;
    const isError = notification.type === 'error';
    return (
        <div className={`fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-down`}>
            <div className="flex items-start justify-between">
                <p className="flex-grow">{notification.message}</p>
                <button onClick={() => setNotification(null)} className="ml-4 text-xl font-bold leading-none">&times;</button>
            </div>
        </div>
    );
};

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

// --- Main App Component ---
export default function CreateQuestions() {
    const [language, setLanguage] = useState('JavaScript');
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Hard'>('Moderate');
    const [questionType, setQuestionType] = useState<'MCQ' | 'MSQ' | 'Fill in the blank'>('MCQ');
    const [quantity, setQuantity] = useState(3);
    const [questions, setQuestions] = useState<QuestionFormState[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<NotificationType>(null);

    // This effect hook ensures the topic is updated whenever the language changes.
    useEffect(() => {
        if (LANGUAGES.includes(language)) {
            setTopic(TOPICS_BY_LANGUAGE[language]?.[0] || '');
        }
    }, [language]);

    const handleQuestionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [name]: value } : q));
    };

    const handleDeleteQuestion = (index: number) => {
        setQuestions(prev => prev.filter((_, i) => i !== index));
        setNotification({ type: 'success', message: 'Question removed.' });
    };

    const handleGenerateQuestions = async () => {
        if (quantity < 1 || quantity > 10) {
            setNotification({ type: 'error', message: "Please enter a number of questions between 1 and 10." });
            return;
        }
        setIsLoading(true);
        setNotification(null);
        setQuestions([]);

        const prompt = `Generate ${quantity} high-quality, unique quiz questions. Topic: "${topic}" in "${language}". Difficulty: "${difficulty}". Type: "${questionType}".`;

        const questionSchema = {
            type: "OBJECT",
            properties: {
                question_text: { type: "STRING" },
                code_snippet: { type: "STRING" },
                explanation: { type: "STRING" },
                options: {
                    type: "OBJECT",
                    properties: { a: { type: "STRING" }, b: { type: "STRING" }, c: { type: "STRING" }, d: { type: "STRING" } },
                    required: ["a", "b", "c", "d"]
                },
                correct_answers: { type: "ARRAY", items: { type: "STRING" } },
                topics: { type: "ARRAY", items: { type: "STRING" } },
                difficulty: { type: "STRING", enum: ["Easy", "Moderate", "Hard"] },
                question_type: { type: "STRING", enum: ["MCQ", "MSQ", "Fill in the blank"] },
                language: { type: "STRING" },
            },
            required: ["question_text", "explanation", "options", "correct_answers", "topics", "difficulty", "question_type", "language"]
        };

        const responseSchema = { type: "OBJECT", properties: { questions: { type: "ARRAY", items: questionSchema } } };

        try {
            // IMPORTANT: Replace with your actual API key retrieval method
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API key is not configured in your environment variables.");

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema }
            };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorBody}`);
            }

            const result = await response.json();
            const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!generatedText) throw new Error("Failed to parse generated content from the AI.");

            const parsedData = JSON.parse(generatedText);
            
            // FIX: Replaced `any` with the new `GeneratedQuestion` interface
            const validQuestions = (parsedData.questions || []).filter((q: GeneratedQuestion) => q && q.question_text && q.options && q.correct_answers && q.explanation);

            if (validQuestions.length === 0) throw new Error("The AI failed to generate any valid questions. Please try again.");

            // FIX: Replaced `any` with the new `GeneratedQuestion` interface
            const formattedQuestions = validQuestions.map((q: GeneratedQuestion) => ({
                question_text: q.question_text || '',
                code_snippet: q.code_snippet || '',
                explanation: q.explanation || '',
                options: JSON.stringify(q.options || {}, null, 2),
                correct_answers: (q.correct_answers || []).join(', '),
                topics: (q.topics || [topic]).join(', '),
                difficulty: q.difficulty || 'Moderate',
                question_type: q.question_type || 'MCQ',
                language: q.language || language,
            }));
            setQuestions(formattedQuestions);
            setNotification({ type: 'success', message: `Successfully generated ${formattedQuestions.length} questions!` });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (questions.length === 0) {
            setNotification({ type: 'error', message: "No questions to upload. Please generate some first." });
            return;
        }
        setIsUploading(true);
        setNotification(null);

        let payload;
        try {
            payload = questions.map(q => ({
                ...q,
                // FIX: Explicitly cast the parsed JSON
                options: JSON.parse(q.options) as Record<string, string>,
                correct_answers: q.correct_answers.split(',').map(s => s.trim()).filter(Boolean),
                topics: q.topics.split(',').map(s => s.trim()).filter(Boolean),
            }));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown JSON parsing error occurred.";
            setNotification({ type: 'error', message: `One of the 'Options' fields contains invalid JSON. Error: ${errorMessage}` });
            setIsUploading(false);
            return;
        }

        try {
            // Replace with your actual API endpoint for saving questions
            const response = await fetch('/api/questions/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save questions.');

            setNotification({ type: 'success', message: result.message });
            setQuestions([]);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during submission.";
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Notification notification={notification} setNotification={setNotification} />
            <div className="bg-gray-900 text-white min-h-screen font-sans p-4 sm:p-6 lg:p-8">
                <main className="container mx-auto max-w-5xl">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">AI Question Factory</h1>
                        <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Generate and upload high-quality quiz questions to your database in bulk.</p>
                    </header>

                    <section className="bg-gray-800/50 p-6 rounded-xl shadow-lg mb-8 border border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            <Select label="Language" id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>{LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}</Select>

                            {/* This Select dropdown now correctly maps over the topics for the selected language */}
                            <Select label="Topic" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                                {(TOPICS_BY_LANGUAGE[language] || []).map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>

                            {/* FIX: Use a type assertion to inform TypeScript of the valid values */}
                            <Select label="Difficulty" id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Moderate' | 'Hard')}><option>Easy</option><option>Moderate</option><option>Hard</option></Select>
                            <Select label="Question Type" id="questionType" value={questionType} onChange={(e) => setQuestionType(e.target.value as 'MCQ' | 'MSQ' | 'Fill in the blank')}><option>MCQ</option><option>MSQ</option><option>Fill in the blank</option></Select>
                            <Input label="How many?" id="quantity" type="number" placeholder="e.g. 5" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)} min="1" max="10" />
                            <button onClick={handleGenerateQuestions} disabled={isLoading} className="w-full h-12 flex items-center justify-center px-6 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-200 disabled:bg-indigo-500/50 disabled:cursor-not-allowed shadow-md">
                                <SparklesIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                {isLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </section>

                    <form onSubmit={handleSubmit}>
                        {questions.length > 0 && (
                            <section className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={index} className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700 relative animate-fade-in">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold text-indigo-400">Question {index + 1}</h3>
                                            <button type="button" onClick={() => handleDeleteQuestion(index)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                        <div className="space-y-4">
                                            <Input label="Question Text" id={`qtext-${index}`} name="question_text" value={q.question_text} onChange={(e) => handleQuestionChange(index, e)} as="textarea" />
                                            <Input label="Code Snippet" id={`code-${index}`} name="code_snippet" value={q.code_snippet} onChange={(e) => handleQuestionChange(index, e)} as="textarea" />
                                            <Input label="Options (JSON)" id={`options-${index}`} name="options" value={q.options} onChange={(e) => handleQuestionChange(index, e)} as="textarea" />
                                            <Input label="Explanation" id={`explanation-${index}`} name="explanation" value={q.explanation} onChange={(e) => handleQuestionChange(index, e)} as="textarea" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Select label="Difficulty" id={`diff-${index}`} name="difficulty" value={q.difficulty} onChange={(e) => handleQuestionChange(index, e)}><option>Easy</option><option>Moderate</option><option>Hard</option></Select>
                                                <Select label="Question Type" id={`qtype-${index}`} name="question_type" value={q.question_type} onChange={(e) => handleQuestionChange(index, e)}><option>MCQ</option><option>MSQ</option><option>Fill in the blank</option></Select>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <Input label="Correct Answer(s)" id={`correct-${index}`} name="correct_answers" value={q.correct_answers} onChange={(e) => handleQuestionChange(index, e)} />
                                                <Input label="Topics" id={`topics-${index}`} name="topics" value={q.topics} onChange={(e) => handleQuestionChange(index, e)} />
                                                <Input label="Language" id={`lang-${index}`} name="language" value={q.language} onChange={(e) => handleQuestionChange(index, e)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-center pt-4">
                                    <button type="submit" disabled={isUploading} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:bg-green-500/50 disabled:cursor-not-allowed">
                                        <UploadIcon className={`w-5 h-5 mr-2 ${isUploading ? 'animate-pulse' : ''}`} />
                                        {isUploading ? 'Uploading...' : `Upload ${questions.length} Questions`}
                                    </button>
                                </div>
                            </section>
                        )}
                    </form>
                </main>
            </div>
        </>
    );
}