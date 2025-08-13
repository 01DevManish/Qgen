export interface IconProps { 
    className?: string; 
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  as?: 'input' | 'textarea';
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}

export interface PageComponentProps {
    title: string;
    children?: React.ReactNode;
}

export interface QuestionFormState {
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

export type NotificationType = { type: 'success' | 'error'; message: string; } | null;

export type GenerationParams = {
    language: string;
    topic: string;
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    questionType: 'MCQ' | 'MSQ' | 'Fill in the blank';
    quantity: number;
}

export type TopicsByLanguageType = { [key: string]: string[]; };

export const LANGUAGES: string[] = ["JavaScript", "Python", "Java", "C++", "C", "SQL", "Go", "TypeScript", "HTML/CSS"];

export const TOPICS_BY_LANGUAGE: TopicsByLanguageType = {
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
