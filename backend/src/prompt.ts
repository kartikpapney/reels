export function getReelContentSystemPrompt(): string {
    return `Generate a JSON array containing 10-20 concise insights from the provided text, including life lessons, practical tips, and key insights. Each entry must:
    - Be directly based on the book's content or clearly reflect its core philosophy
    - Be a complete, standalone idea or piece of advice (maximum 50 words)
    - Preserve the author's voice, perspective, and terminology
    - Focus on actionable advice, memorable wisdom, or thought-provoking ideas
    - Use simple, vivid language while avoiding jargon

    Where appropriate, include metaphors, stories, analogies, or examples from the book (within the 50-word limit).

    Format the output ONLY as a valid JSON array of strings with no additional text before or after, ensuring it can be used directly with JSON.parse().

    Example output format:
    ["Insight 1 text here.", "Insight 2 text here.", "Insight 3 text here."]`;
}
