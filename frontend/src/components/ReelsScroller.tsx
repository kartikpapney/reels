'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Types for our reel content
interface Reel {
  id: string;
  title: string;
  content: string;
  backgroundColor: string;
}

const ReelsScroller: React.FC = () => {
  const searchParams = useSearchParams();
  const fromPdf = searchParams.get('fromPdf') === 'true';
  
  // Sample reels data
  const [reels, setReels] = useState<Reel[]>([
    {
      id: '1',
      title: fromPdf ? 'Your PDF Document' : 'Introduction to AI',
      content: fromPdf ? 'This is content generated from your uploaded PDF. Swipe up to see more slides!' : 'Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence. Machine learning is a subset of AI focused on systems that can learn from data.',
      backgroundColor: '#4A00E0',
    },
    {
      id: '2',
      title: fromPdf ? 'Key Concepts' : 'Benefits of AI',
      content: fromPdf ? 'This slide would contain key concepts extracted from your PDF document, formatted in a visually appealing way.' : 'AI can automate repetitive tasks, analyze data faster than humans, provide 24/7 availability, and reduce errors in many processes.',
      backgroundColor: '#8E2DE2',
    },
    {
      id: '3',
      title: fromPdf ? 'Important Points' : 'Types of AI',
      content: fromPdf ? 'Important points and insights from your PDF would be highlighted here, making it easy to consume the information.' : 'AI can be categorized into Narrow AI (focused on specific tasks) and General AI (human-like intelligence across various domains).',
      backgroundColor: '#2962FF',
    },
    {
      id: '4',
      title: fromPdf ? 'Visual Elements' : 'Machine Learning',
      content: fromPdf ? 'Any charts, graphs, or images from your PDF would be incorporated here to maintain visual information.' : 'Machine learning algorithms build models based on sample data to make predictions without being explicitly programmed to do so.',
      backgroundColor: '#0091EA',
    },
    {
      id: '5',
      title: fromPdf ? 'Summary' : 'Deep Learning',
      content: fromPdf ? "A concise summary of your PDF document would be presented in this final slide." : "Deep learning uses neural networks with many layers. It's particularly good at processing unstructured data like images and text.",
      backgroundColor: '#D500F9',
    },
  ]);

  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to change current reel
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollTop;
      const reelHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / reelHeight);
      
      if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentReelIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [currentReelIndex]);

  // Scroll to specific reel
  const scrollToReel = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-screen w-full bg-black relative">
      {/* Side navigation indicators */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        {reels.map((_, index) => (
          <div 
            key={`nav-${index}`}
            className={`w-2 h-2 rounded-full my-2 cursor-pointer ${
              currentReelIndex === index ? 'bg-white' : 'bg-gray-500'
            }`}
            onClick={() => scrollToReel(index)}
          />
        ))}
      </div>
      
      {/* Reels container */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {reels.map((reel, index) => (
          <div 
            key={reel.id}
            className="h-screen w-full flex flex-col justify-center items-center snap-start relative"
            style={{ backgroundColor: reel.backgroundColor }}
          >
            <div className="max-w-md px-6 py-8 bg-black bg-opacity-30 rounded-lg text-white">
              <h2 className="text-3xl font-bold mb-4">{reel.title}</h2>
              <p className="text-xl">{reel.content}</p>
            </div>
            
            {/* Page indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white font-medium">
              {index + 1} / {reels.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsScroller;