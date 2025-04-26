import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL_NAME = "gpt-4o-mini"; // or "gpt-3.5-turbo"
const TEMPERATURE = 0.7;
const MAX_TOKENS = 10000;

/**
 * Function to get OpenAI result using LangChain
 * @param apiKey - Your OpenAI Platform API Key
 * @param prompt - The prompt you want to send
 * @returns Generated result as a string
 */
export async function getOpenAIResult(systemPrompt: string, userPrompt: string): Promise<string> {
    if(process.env.GENERATE_REELS === "false") return ""
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            {
                role: "user",
                content: userPrompt,
            },
        ],
        model: MODEL_NAME,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
    });

    return completion.choices[0]?.message?.content || "";
}
