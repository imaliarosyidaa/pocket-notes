import { GoogleGenAI } from "@google/genai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);
  const { videoUrl } = body;
  console.log("DEBUG VIDEO URL:", videoUrl);

  const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const contents = [
      {
        fileData: {
          fileUri: videoUrl,
        },
      },
      { text: "Mohon rangkum video tersebut dari awal sampai akhir dan jangan memberikan kalimat pembuka serta hilangkan kalimat penutup" },
    ];

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
    });

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("DEBUG RESPONSE GEMINI:", response);
    return {
      success: true,
      summary: response,
    };
  } catch (error: any) {
    console.error("DEBUG ERROR GEMINI:", error.message);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Gagal menghubungi Gemini AI",
    });
  }
});
