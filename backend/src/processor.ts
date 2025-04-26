// @ts-ignore
import EPub from 'epub';

/**
 * Process an EPUB file and extract content in reels format
 * @param filePath - Path to the EPUB file
 * @param fileName - Original name of the file
 * @returns Processed EPUB data
 */
export async function processEpub(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const epub = new EPub(filePath);

        epub.on('error', (err) => {
            console.error('Error loading EPUB:', err);
            reject(err);
        });

        epub.on('end', () => {
            const reels: string[] = [];
            const chapters = epub.flow || [];
            const chapterPromises = chapters.map((chapter, index) => {
                return new Promise<void>((resolveChapter, rejectChapter) => {
                    epub.getChapter(chapter.id, (err, text) => {
                        if (err) {
                            console.error(`Error loading chapter ${index + 1}:`, err);
                            //  Reject the *inner* promise for this chapter.
                            rejectChapter(err);
                            return;
                        }
                        if (text) {
                            const cleanedText = text.replace(/<[^>]*>/g, '');
                            reels[index] = cleanedText; // Store in the correct index!
                            resolveChapter();
                        } else {
                            reels[index] = "";
                            resolveChapter();
                        }
                    });
                });
            });

            // Use Promise.all to wait for all chapters to load.
            Promise.all(chapterPromises)
                .then(() => {
                    resolve(reels.join(" "));
                })
                .catch((err) => {
                    //  If any chapter promise rejects, this catch will be called.
                    reject(err); // Reject the *outer* promise.
                });
        });

        epub.parse();
    });
}
