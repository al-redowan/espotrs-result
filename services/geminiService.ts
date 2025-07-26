
import { GoogleGenAI } from "@google/genai";
import { RankedPlayer } from '../types';

let ai: GoogleGenAI | null = null;

if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

export const generateTournamentSummary = async (players: RankedPlayer[], matchCount: number): Promise<string> => {
    if (!ai) {
        return "API Key not configured. AI summary cannot be generated.";
    }

    const topPlayers = players.slice(0, 5); // Focus on top 5 for a concise summary
    const formattedResults = topPlayers.map(p => 
        `Rank ${p.rank}: ${p.name} (Total Points: ${p.totalPoints}, Total Kills: ${p.totalKills})`
    ).join('\n');

    const prompt = `
You are an energetic and hype e-sports commentator for the game Free Fire.
Based on the following overall tournament results from ${matchCount} ${matchCount > 1 ? 'matches' : 'match'}, write an exciting and brief summary (3-4 sentences).
Announce the champion in a dramatic way. Mention the runner-up and highlight the player with the most total kills if they are in the top 3.
Make it sound epic!

Overall Tournament Standings:
${formattedResults}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                topP: 0.95,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating summary with Gemini:", error);
        return "There was an error generating the AI summary. Please check the console for details.";
    }
};
