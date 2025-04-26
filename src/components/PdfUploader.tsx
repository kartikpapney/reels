'use client';

import { Document, Page, pdfjs } from 'react-pdf';

// Set up the pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface PdfPage {
  pageNumber: number;
  text: string;
  title?: string;
}

export interface PdfContent {
  fileName: string;
  totalPages: number;
  pages: PdfPage[];
}

/**
 * Extracts text content from a PDF file
 */
export async function extractPdfContent(file: File): Promise<PdfContent> {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const totalPages = pdf.numPages;
      const pages: PdfPage[] = [];
      
      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text from the page
        const pageText = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        
        // Try to identify a title (first line or bold text)
        let pageTitle: string | undefined;
        
        // Simple heuristic: first line might be a title if it's short
        const firstLineMatch = pageText.match(/^(.+?)[\.\?\!]\s/);
        if (firstLineMatch && firstLineMatch[1].length < 100) {
          pageTitle = firstLineMatch[1].trim();
        }
        
        pages.push({
          pageNumber: pageNum,
          text: pageText,
          title: pageTitle
        });
      }
      
      resolve({
        fileName: file.name,
        totalPages,
        pages
      });
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      reject(new Error('Failed to process PDF file'));
    }
  });
}

/**
 * Splits PDF content into reel-sized chunks
 */
export function convertPdfToReels(pdfContent: PdfContent): { title: string; content: string; }[] {
  const reels: { title: string; content: string }[] = [];
  const maxContentLength = 250; // Characters per reel
  
  // Create title reel
  reels.push({
    title: 'Document',
    content: pdfContent.fileName.replace('.pdf', '')
  });
  
  // Process each page
  pdfContent.pages.forEach((page) => {
    // Use page title if available, otherwise create one
    const pageTitle = page.title || `Page ${page.pageNumber}`;
    
    // Split content into chunks that fit in a reel
    const text = page.text.trim();
    
    if (text.length <= maxContentLength) {
      // Page content fits in a single reel
      reels.push({
        title: pageTitle,
        content: text
      });
    } else {
      // Split into multiple reels
      // Try to split by sentences or paragraphs for better readability
      const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
      
      let currentChunk = '';
      let currentTitle = pageTitle;
      let chunkCount = 1;
      
      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length <= maxContentLength) {
          currentChunk += sentence;
        } else {
          // Current chunk is full, save it
          if (currentChunk) {
            reels.push({
              title: currentTitle,
              content: currentChunk.trim()
            });
          }
          
          // Start a new chunk
          currentChunk = sentence;
          chunkCount++;
          currentTitle = `${pageTitle} (part ${chunkCount})`;
        }
      });
      
      // Add the final chunk if not empty
      if (currentChunk) {
        reels.push({
          title: currentTitle,
          content: currentChunk.trim()
        });
      }
    }
  });
  
  // Add summary reel
  reels.push({
    title: 'Summary',
    content: `Document: ${pdfContent.fileName}\nPages: ${pdfContent.totalPages}\nReels created: ${reels.length}`
  });
  
  return reels;
}

/**
 * Generates background colors for reels
 */
export function generateReelBackgrounds(count: number): string[] {
  // Array of gradient colors
  const gradients = [
    '#4A00E0', // Purple
    '#8E2DE2', // Violet
    '#2962FF', // Blue
    '#0091EA', // Light Blue
    '#00B0FF', // Cyan
    '#D500F9', // Pink
    '#651FFF', // Deep Purple
    '#304FFE', // Indigo
    '#00BFA5', // Teal
    '#00C853', // Green
  ];
  
  const backgrounds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    backgrounds.push(gradients[i % gradients.length]);
  }
  
  return backgrounds;
}