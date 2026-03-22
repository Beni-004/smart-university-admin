import { GoogleGenAI } from "@google/genai";
import { UNIVERSITY_SCHEMA } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSQL(prompt: string): Promise<{ sql: string; explanation: string }> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are an expert SQL generator for a university database.
    Schema:
    ${UNIVERSITY_SCHEMA}
    
    Return ONLY a JSON object with two fields:
    - "sql": The valid SQL query.
    - "explanation": A brief explanation of what the query does.
    
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || '{}');
    return {
      sql: result.sql || '-- No SQL generated',
      explanation: result.explanation || 'Query executed successfully.'
    };
  } catch (error) {
    console.error("Error generating SQL:", error);
    return {
      sql: '-- Error generating SQL',
      explanation: 'Sorry, I encountered an error while processing your request.'
    };
  }
}
