'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePDFProcessor } from '@/lib/pdf-processor';
import styles from './PDFUploader.module.css';

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();
  const { processPDFFile, isProcessing, progress, error } = usePDFProcessor();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert('Please select a valid PDF file');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }
    
    const result = await processPDFFile(file);
    
    if (result) {
      // Store the processed data in sessionStorage so we can access it in the reels page
      sessionStorage.setItem('pdfReels', JSON.stringify(result));
      
      // Navigate to the reels page
      router.push('/reels?fromPdf=true');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.uploaderCard}>
        <h1 className={styles.title}>PDF to Reels</h1>
        <p className={styles.subtitle}>Transform your PDF documents into scrollable video reels</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.dropzone} onClick={() => document.getElementById('file-input')?.click()}>
            <input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
              disabled={isProcessing}
            />
            
            <div className={styles.uploadIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.icon}>
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            {file ? (
              <div className={styles.fileInfo}>
                <p className={styles.fileName}>{file.name}</p>
                <p className={styles.fileSize}>{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <p className={styles.uploadText}>Click to upload a PDF or drag and drop</p>
            )}
          </div>
          
          {isProcessing && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressText}>{progress === 100 ? 'Processing complete!' : `Processing... ${progress}%`}</p>
            </div>
          )}
          
          {error && <p className={styles.errorText}>{error}</p>}
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!file || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Generate Reels'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}