// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ProcessedPDF {
    fileName: string;
    totalPages: number;
    reels: string[];
}

/**
 * Upload and process a PDF file
 * @param file PDF file to process
 * @param onProgress Progress callback function
 * @returns Processed PDF data
 */
export async function processPDF(file: File, onProgress?: (progress: number) => void): Promise<ProcessedPDF> {
    // Create FormData with the file
    const formData = new FormData();
    formData.append("pdf", file);

    try {
        // Simulated progress for better UX
        let progressInterval: NodeJS.Timeout | null = null;

        if (onProgress) {
            let progress = 0;
            progressInterval = setInterval(() => {
                progress += 5;
                if (progress <= 90) {
                    onProgress(progress);
                }
            }, 300);
        }

        // Upload the file to the backend
        const response = await fetch(`${API_URL}/process-pdf`, {
            method: "POST",
            body: formData,
        });

        // Clean up progress interval
        if (progressInterval) {
            clearInterval(progressInterval);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to process PDF");
        }

        // Set progress to 100% on success
        if (onProgress) {
            onProgress(100);
        }

        return await response.json();
    } catch (error) {
        console.error("Error processing PDF:", error);
        throw error;
    }
}
