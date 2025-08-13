"use client";

import React, { useState, useEffect, FC } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User, signOut, Auth } from 'firebase/auth';
import Image from 'next/image'; // Import the Next.js Image component
import CreateQuestions from './CreateQuestions';
import {
    NavItem,
    PageComponent,
    CreateTestIcon,
    CreateQuestionsIcon,
    AllQuestionsIcon,
    HistoryIcon,
    SettingsIcon,
    MenuIcon,
    LogoutIcon
} from './components';
import Allquestions from './AllQuestions'; 
import CreateTest from './CreateTest';
import AllTests from './AllTest';

// ============================================================================
// 1. CONFIGURATION & SETUP
// ============================================================================

const firebaseConfig = {
    apiKey: "AIzaSyDZtRV7ZgsgrhwnjntaNAf0dqBUEmYtQgE",
    authDomain: "preploner.firebaseapp.com",
    projectId: "preploner",
    storageBucket: "preploner.firebasestorage.app",
    messagingSenderId: "104475352938",
    appId: "1:104475352938:web:5e0a7376605bc5a0d08f13",
    measurementId: "G-KFK5JLGWEB"
};

let app: FirebaseApp;
let auth: Auth;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// ============================================================================
// 2. PLACEHOLDER & LOGIN COMPONENTS
// ============================================================================


const History = () => <PageComponent title="History" />;
const Settings = () => <PageComponent title="Settings" />;

const Login = () => {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try { await signInWithPopup(auth, provider); }
        catch (error) { console.error("Error during sign-in:", error); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-10 bg-white rounded-xl shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-indigo-700 mb-2">Welcome!</h1>
                <p className="text-gray-600 mb-8">Please sign in to access your dashboard.</p>
                <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <Image
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        width={24} // Corresponds to w-6
                        height={24} // Corresponds to h-6
                        className="bg-white p-1 rounded-full"
                    />
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// 3. DASHBOARD COMPONENT
// ============================================================================

const Dashboard: FC<{ user: User }> = ({ user }) => {
    const [activePage, setActivePage] = useState('Create Questions');
    const [expanded, setExpanded] = useState(true);

    const handleLogout = async () => {
        try { await signOut(auth); }
        catch (error) { console.error("Error signing out:", error); }
    };
    
    const pageComponents: { [key: string]: React.ReactNode } = {
        'Create Test': <CreateTest />,
        'Create Questions': <CreateQuestions />,
        'All Questions': <Allquestions />,
        'All Test': <AllTests/>,
        'History': <History />,
        'Settings': <Settings />,
    };

    const navItems = [
        { name: 'Create Test', icon: <CreateTestIcon className="h-6 w-6" /> },
        { name: 'Create Questions', icon: <CreateQuestionsIcon className="h-6 w-6" /> },
        { name: 'All Questions', icon: <AllQuestionsIcon className="h-6 w-6" /> },
        { name: 'All Test', icon: <CreateTestIcon className="h-6 w-6" /> },
        { name: 'History', icon: <HistoryIcon className="h-6 w-6" /> },
        { name: 'Settings', icon: <SettingsIcon className="h-6 w-6" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="flex">
                <aside className="h-screen sticky top-0">
                    <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                        <div className="p-4 pb-2 flex justify-between items-center">
                            <h1 className={`overflow-hidden transition-all font-bold text-2xl text-indigo-700 ${expanded ? "w-40" : "w-0"}`}>Dashboard</h1>
                            <button onClick={() => setExpanded(curr => !curr)} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100"><MenuIcon className="h-6 w-6 text-gray-700" /></button>
                        </div>
                        <ul className="flex-1 px-3">
                            {navItems.map((item) => <NavItem key={item.name} text={item.name} icon={item.icon} active={activePage === item.name} expanded={expanded} onClick={() => setActivePage(item.name)} />)}
                        </ul>
                        <div className="border-t flex p-3 items-center">
                            <Image
                                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=E0E7FF&color=4F46E5`}
                                alt="User avatar"
                                width={40} // Corresponds to w-10
                                height={40} // Corresponds to h-10
                                className="rounded-md"
                                quality={75}
                            />
                            <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-40 ml-3" : "w-0"}`}>
                                <div className="leading-4">
                                    <h4 className="font-semibold text-gray-800 truncate">{user.displayName}</h4>
                                    <span className="text-xs text-gray-600 truncate">{user.email}</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="p-2 rounded-lg bg-gray-50 hover:bg-red-100 ml-auto"><LogoutIcon className="h-6 w-6 text-gray-700 hover:text-red-600"/></button>
                        </div>
                    </nav>
                </aside>
                <main className="flex-1 p-6 sm:p-10">
                    {pageComponents[activePage]}
                </main>
            </div>
        </div>
    );
};

// ============================================================================
// 4. APP ENTRY POINT
// ============================================================================

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) { setLoading(false); return; };
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Loading Dashboard...</div>;
    }

    return user ? <Dashboard user={user} /> : <Login />;
}
