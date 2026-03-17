export default defineNuxtConfig({
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY
  },
  modules: ["@nuxt/ui", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
});
