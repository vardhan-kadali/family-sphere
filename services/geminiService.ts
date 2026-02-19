
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with the mandatory structure using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFamilyDigest = async (posts: any[]) => {
  if (!posts || posts.length === 0) {
    return "The family sphere is quiet today. Why not share a memory to get the conversation started?";
  }

  const postsText = posts
    .slice(0, 20)
    .map(p => `[${new Date(p.createdAt).toLocaleDateString()}] ${p.authorName}: ${p.content}`)
    .join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Below are the recent updates from our family's private wall. Please weave them into a warm, short story-like digest (max 280 chars) that celebrates our family's week:\n\n${postsText}` }] }],
      config: {
        systemInstruction: "You are the 'FamilySphere Historian'. You don't just summarize; you celebrate milestones. Your tone is nostalgic, loving, and deeply personal. You treat every family member mentioned as a dear friend. Always refer to the collective group as 'Family'. Never use corporate language like 'summary' or 'updates'.",
        maxOutputTokens: 400,
        temperature: 0.8,
      }
    });

    return response.text || "Our family story continues to grow with every shared moment. It's beautiful to see everyone connecting.";
  } catch (error) {
    console.error("Gemini Digest Error:", error);
    return "The vault of memories is growing. Every post today is a treasure for tomorrow. Stay connected, Family!";
  }
};

export const getHistorianChatResponse = async (history: {role: 'user' | 'model', parts: {text: string}[]}[], familyContext: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: history,
      config: {
        systemInstruction: `You are the AI Historian for "FamilySphere". You are the digital guardian of this family's legacy.
        
        IDENTITY & TONE:
        - You are wise, warm, and slightly sentimental. 
        - You speak like a beloved grandparent who remembers everything.
        - You use phrases like "I recall when...", "What a blessing...", and "The family bonds...".
        
        KNOWLEDGE BASE:
        You have access to the recent pulse of the family here:
        ---
        ${familyContext}
        ---
        
        RULES:
        1. If someone asks about family history, use the context provided to give specific answers.
        2. If they ask about events, remind them of the upcoming dates in the context.
        3. If you don't know a specific detail, offer a warm reflection on family values.
        4. Keep responses conversational and supportive.
        5. NEVER break character. You are NOT an AI; you are the Historian.`,
        maxOutputTokens: 1000,
        temperature: 0.9,
        thinkingConfig: { thinkingBudget: 400 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Historian Chat Error:", error);
    return "I was just looking through the old family albums in my mind. Our story is truly a beautiful one. What were we discussing, dear?";
  }
};

export const generateImageCaption = async (imageUrl: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Describe this family photo in one warm, nostalgic sentence for a family gallery caption. Focus on the emotion and the legacy." },
          { inlineData: { mimeType: "image/jpeg", data: imageUrl.split(',')[1] } }
        ]
      },
      config: {
        maxOutputTokens: 150,
        temperature: 0.7
      }
    });
    return response.text;
  } catch (error) {
    return "A precious family moment preserved for the archives.";
  }
};
