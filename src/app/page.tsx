'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing with progress
    const intervalId = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(intervalId);
          return 95;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      // Here you would normally upload the file to your backend
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(intervalId);
      setUploadProgress(100);
      
      // Wait a bit to show 100% complete
      setTimeout(() => {
        // In a real app, you'd redirect to the reels page after processing
        router.push('/reels');
      }, 500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('There was an error processing your PDF');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="px-8 py-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            PDF to Reels
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Transform your PDF documents into scrollable video reels
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label 
                htmlFor="pdf-upload" 
                className="block w-full border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center cursor-pointer hover:bg-indigo-50 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <svg 
                    className="w-12 h-12 text-indigo-500 mb-3" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                  <p className="text-sm text-gray-500">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF only (max 10MB)</p>
                </div>
                <input 
                  id="pdf-upload" 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </label>
            </div>
            
            {isLoading && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  {uploadProgress < 100 ? 'Processing...' : 'Complete!'}
                </p>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              disabled={!file || isLoading}
            >
              {isLoading ? 'Processing...' : 'Generate Reels'}
            </button>
          </form>
          
          {/* Quick demo link - for development purposes */}
          <div className="mt-4 text-center">
            <Link href="/reels" className="text-sm text-indigo-600 hover:underline">
              View demo reels
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}