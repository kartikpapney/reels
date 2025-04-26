"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processEpub = processEpub;
// @ts-ignore
const epub_1 = __importDefault(require("epub"));
/**
 * Process an EPUB file and extract content in reels format
 * @param filePath - Path to the EPUB file
 * @param fileName - Original name of the file
 * @returns Processed EPUB data
 */
async function processEpub(filePath) {
    return new Promise((resolve, reject) => {
        const epub = new epub_1.default(filePath);
        epub.on('error', (err) => {
            console.error('Error loading EPUB:', err);
            reject(err);
        });
        epub.on('end', () => {
            const reels = [];
            const chapters = epub.flow || [];
            const chapterPromises = chapters.map((chapter, index) => {
                return new Promise((resolveChapter, rejectChapter) => {
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
                        }
                        else {
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
