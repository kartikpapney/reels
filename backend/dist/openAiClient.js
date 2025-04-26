"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenAIResult = getOpenAIResult;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
const MODEL_NAME = "gpt-4o-mini"; // or "gpt-3.5-turbo"
const TEMPERATURE = 0.7;
const MAX_TOKENS = 10000;
/**
 * Function to get OpenAI result using LangChain
 * @param apiKey - Your OpenAI Platform API Key
 * @param prompt - The prompt you want to send
 * @returns Generated result as a string
 */
async function getOpenAIResult(systemPrompt, userPrompt) {
    if (process.env.GENERATE_REELS === "false")
        return "";
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
