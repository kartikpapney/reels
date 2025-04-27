// src/app/layout.tsx
import './styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reels',
  description: 'Consume better content than Insta Reels',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add PDF.js CDN for PDF processing */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js"></script>
      </head>
      
      <body className={inter.className}>
      <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}