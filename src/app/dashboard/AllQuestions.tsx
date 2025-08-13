"use client";

import React, { useState, useEffect, FC, forwardRef } from 'react';
// Assuming Tailwind CSS is configured for these classes

// ============================================================================
// 1. TYPE DEFINITIONS
// ============================================================================

interface IconProps {
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  as?: 'input' | 'textarea';
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

// This should match the structure of your 'questions' table in PostgreSQL
interface Question {
  id: number; // Assuming 'id' is a number (e.g., SERIAL PRIMARY KEY)
  question_text: string;
  code_snippet: string;
  explanation: string;
  options: { [key: string]: string }; // Assuming 'options' is a JSONB column
  correct_answers: string[]; // Assuming 'correct_answers' is a TEXT[] column
  topics: string[]; // Assuming 'topics' is a TEXT[] column
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  question_type: 'MCQ' | 'MSQ' | 'Fill in the blank';
  language: string;
  created_at: string; // Assuming 'created_at' is a TIMESTAMP column
}

type NotificationType = { type: 'success' | 'error'; message: string; } | null;


// ============================================================================
// 2. UI COMPONENTS (Self-contained for portability)
// ============================================================================

const TrashIcon: FC<IconProps> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const LightInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({ label, as = "input", id, ...props }, ref) => {
  const Component = as;
  const baseClasses = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm text-gray-800";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {/* FIX: Correctly type the ref to fix the 'any' error */}
<Component id={id} {...props} ref={ref as React.Ref<HTMLInputElement & HTMLTextAreaElement>} className={Component === 'textarea' ? `${baseClasses} min-h-[120px] resize-y` : baseClasses} />    </div>
  );
});
LightInput.displayName = 'LightInput';

const LightSelect = ({ label, id, children, ...props }: SelectProps) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <select id={id} {...props} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm text-gray-800">
      {children}
    </select>
  </div>
);

const Notification = ({ notification, onDismiss }: { notification: NotificationType, onDismiss: () => void }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(onDismiss, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification, onDismiss]);

    if (!notification) return null;
    return (
      <div className={`fixed top-5 right-5 w-full max-w-sm p-4 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'} animate-fade-in-down z-50`}>
        <div className="flex items-start justify-between">
          <p className="flex-grow">{notification.message}</p>
          <button onClick={onDismiss} className="ml-4 text-xl font-bold leading-none">&times;</button>
        </div>
      </div>
    );
};

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

export default function AllQuestions() {
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationType>(null);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [languageFilter, setLanguageFilter] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    // Fetch questions from the API route
    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError(null);
            // Calling the new GET API route
            const response = await fetch('/api/questions/all-questions');
            if (!response.ok) {
                throw new Error('Failed to fetch questions from the server.');
            }
            const data = await response.json();
            setAllQuestions(data.questions);
            setFilteredQuestions(data.questions);
        } catch (err: unknown) { // FIX: Use unknown to safely handle the error type
            // Safely check and cast the error to get the message
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setLoading(false);
        }
    };
    
    // Delete a question via the API route
    const deleteQuestion = async (id: number) => {
        // Optimistically update UI
        setAllQuestions(prev => prev.filter(q => q.id !== id));

        try {
            // Calling the new DELETE API route
            const response = await fetch(`/api/questions/all-questions?id=${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the question.');
            }
            setNotification({ type: 'success', message: 'Question deleted successfully!' });
        } catch (err: unknown) { // FIX: Use unknown to safely handle the error type
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during deletion.';
            setNotification({ type: 'error', message: errorMessage });
            // Re-fetch to revert the optimistic update on failure
            fetchQuestions();
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        // FIX: Change 'let' to 'const' as the variable is not reassigned
        const result = allQuestions.filter(q =>
            q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (languageFilter ? q.language === languageFilter : true) &&
            (difficultyFilter ? q.difficulty === difficultyFilter : true)
        );
        setFilteredQuestions(result);
    }, [searchTerm, languageFilter, difficultyFilter, allQuestions]);
    
    return (
      <div className="animate-fade-in p-6 bg-gray-100 min-h-screen">
        <Notification notification={notification} onDismiss={() => setNotification(null)} />
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">All Questions</h1>
            <p className="text-gray-600 mt-2">Browse, search, and manage all questions in your database.</p>
          </header>

          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LightInput 
                label="Search Questions" 
                placeholder="Enter keywords..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <LightSelect 
                label="Filter by Language" 
                value={languageFilter} 
                onChange={(e) => setLanguageFilter(e.target.value)}
              >
                <option value="">All Languages</option>
                {[...new Set(allQuestions.map(q => q.language))].sort().map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </LightSelect>
              <LightSelect 
                label="Filter by Difficulty" 
                value={difficultyFilter} 
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Hard">Hard</option>
              </LightSelect>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
            {loading ? (
              <p className="p-6 text-center text-gray-500">Loading questions from database...</p>
            ) : error ? (
              <p className="p-6 text-center text-red-500">{error}</p>
            ) : (
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Question</th>
                    <th scope="col" className="px-6 py-3">Language</th>
                    <th scope="col" className="px-6 py-3">Difficulty</th>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                    <tr key={q.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 max-w-sm truncate" title={q.question_text}>{q.question_text}</td>
                      <td className="px-6 py-4">{q.language}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            q.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>{q.difficulty}</span>
                      </td>
                      <td className="px-6 py-4">{q.question_type}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="font-medium text-indigo-600 hover:underline mr-4">Edit</button>
                        <button onClick={() => deleteQuestion(q.id)} className="font-medium text-red-600 hover:underline"><TrashIcon className="w-4 h-4 inline-block" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-gray-500">No questions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
};