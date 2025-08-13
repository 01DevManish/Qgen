"use client"; // This is required to use hooks like useRouter

import React from 'react'
import { useRouter } from 'next/navigation'; // Import useRouter for client-side navigation

function Page() {
  const router = useRouter();

  const handleRedirect = () => {
    // Redirect to the dashboard page
    router.push('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <button 
          onClick={handleRedirect}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Page;
