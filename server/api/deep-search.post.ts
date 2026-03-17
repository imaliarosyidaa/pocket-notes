import { GoogleGenAI } from "@google/genai";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);
  const { query } = body;
  console.log("DEBUG QUERY:", query);

  const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

  try {
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`;
    const res = await $fetch(arxivUrl);

    const prompt = `
      Berikut adalah data mentah dari database jurnal:
      ${res}

      Tolong ekstrak 5 penelitian terbaik. Berikan output dalam format JSON array yang berisi:
      - title (Judul penelitian)
      - authors (Nama-nama penulis)
      - year (Tahun terbit)
      - summary (Ringkasan 1 kalimat dalam Bahasa Indonesia)
      - link (Link langsung ke PDF atau halaman paper)

      ATURAN KETAT:
        1. JANGAN PERNAH mengarang link URL. Gunakan hanya URL yang ada di data mentah di atas.
        2. Jika judul paper di atas tidak ada yang relevan dengan "${query}", katakan "Data tidak ditemukan".
        3. Ambil field <title>, <author>, dan link <url> yang benar-benar tertulis di data mentah.
        4. Terjemahkan ringkasan (<summary>) ke Bahasa Indonesia yang formal.
      
      ATURAN: Hanya berikan JSON, tanpa teks pembuka/penutup.
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    console.log("DEBUG RESPONSE GEMINI:", response);
    return {
      success: true,
      data: JSON.parse(response),
    };
  } catch (error: any) {
    console.error("DEBUG ERROR GEMINI:", error.message);

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Gagal menghubungi Gemini AI",
    });
  }
});
