import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import formidable from 'formidable';
import fs from 'node:fs';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const form = formidable({ 
    uploadDir: './tmp',
    keepExtensions: true 
  });

  if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

  const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const [fields, files] = await form.parse(event.node.req);
    const audioFile = files.file?.[0];

    if (!audioFile) {
      throw createError({ statusCode: 400, message: "File tidak ditemukan" });
    }

    const temporaryPath = audioFile.filepath;

    const myfile = await genAI.files.upload({
      file: temporaryPath,
      config: { mimeType: "audio/mp3" },
    });

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: createUserContent([
        createPartFromUri(myfile.uri || "/", myfile.mimeType || "audio/mp3"),
        "Generate a transcript of the speech.",
      ]),
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
