<script setup lang="ts">
const videoUrl = ref("");
const summary = ref("");
const isLoading = ref(false);
const errorMsg = ref("");

const handleSummarize = async () => {
  if (
    !videoUrl.value.includes("youtube.com") &&
    !videoUrl.value.includes("youtu.be")
  ) {
    errorMsg.value = "Please enter a valid YouTube URL";
    return;
  }

  isLoading.value = true;
  summary.value = "";
  errorMsg.value = "";

  try {
    const { data, error } = await useFetch("/api/summarize", {
      method: "POST",
      body: { videoUrl: videoUrl.value },
    });
    if (error.value) throw new Error(error.value.statusMessage);

    if (data.value) {
      summary.value =
        data.value.summary || "oke, tapi tidak ada ringkasan yang dihasilkan.";
      console.log("Berhasil menangkap teks:", summary.value);
    }

    const sum = summary.value;
  } catch (err: any) {
    errorMsg.value = err.message || "Terjadi kesalahan sistem";
  } finally {
    isLoading.value = false;
  }
};

const toast = useToast();

const copySummary = () => {
  if (!summary.value) return;
  navigator.clipboard.writeText(summary.value);
  toast.add({
    title: "Copy successfully!",
    description: "The summary has been copied to your clipboard.",
    icon: "i-lucide-check-circle",
    color: "primary",
  });
};

// const selectedFile = ref<File | null>(null);
// const isFileSelected = computed(() => !!selectedFile.value);
// const isLoadingAudio = ref(false);
// const errorMsgAudio = ref("");
// const processingStatus = ref("");

// const handleSummarizeAudio = async () => {
//   errorMsgAudio.value = "";

//   isLoadingAudio.value = true;
//   processingStatus.value = "Sedang mengirim file ke server...";
//   if (selectedFile.value) {
//     isLoadingAudio.value = true;
//     const formData = new FormData();
//     formData.append("file", selectedFile.value);

//     try {
//       processingStatus.value = "AI sedang membaca isi audio kamu...";
//       const response = await $fetch("/api/speech-to-text", {
//         method: "POST",
//         body: formData,
//       });

//       processingStatus.value = "Hampir selesai...";
//       summary.value = response.summary;
//     } catch (err) {
//       errorMsgAudio.value = "Gagal upload audio";
//     } finally {
//       isLoadingAudio.value = false;
//     }
//   }
// };
</script>

<template>
  <UDashboardPanel id="tools">
    <template #header>
      <UDashboardNavbar title="Summarizer" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right> </template>
      </UDashboardNavbar>
    </template>

    <template #body class="w-max">
      <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"> -->
      <div>
        <UCard>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-play-circle" class="text-red-500" />
              Input Video
            </h3>
            <div class="flex gap-2">
              <UInput
                v-model="videoUrl"
                placeholder="Paste YouTube URL here (ex: https://www.youtube.com/watch?v=...)"
                icon="i-heroicons-link"
                class="flex-1"
                :disabled="isLoading"
              />
              <UButton
                :loading="isLoading"
                color="primary"
                icon="i-heroicons-sparkles"
                @click="handleSummarize"
              >
                Summarize Now
              </UButton>
            </div>
            <p v-if="errorMsg" class="text-red-500 text-sm italic">
              {{ errorMsg }}
            </p>
          </div>
        </UCard>

        <!-- <UCard>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex-1 items-center gap-2 flex">
              <UIcon name="i-heroicons-play-circle" class="text-red-500" />
              Input Audio
            </h3>

            <div class="flex flex-col md:flex-row gap-2">
              <UInput
                type="file"
                accept="audio/*,video/*"
                icon="i-lucide-mic"
                class="w-full"
                :disabled="isLoadingAudio"
              />

              <UButton
                :loading="isLoadingAudio"
                color="primary"
                icon="i-heroicons-sparkles"
                @click="handleSummarizeAudio"
              >
                Summarize Now
              </UButton>
            </div>

            <p v-if="errorMsgAudio" class="text-red-500 text-sm italic">
              {{ errorMsgAudio }}
            </p>
          </div>
        </UCard> -->
      </div>

      <div v-if="isLoading" class="space-y-4">
        <USkeleton class="h-4 w-[250px]" />
        <USkeleton class="h-12 w-full" />
        <USkeleton class="h-12 w-full" />
      </div>

      <div v-if="summary" class="animate-fade-in">
        <UCard class="prose dark:prose-invert max-w-none">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-primary">Hasil Rangkuman</span>
            </div>
          </template>

          <div v-html="summary" class="whitespace-pre-wrap"></div>
        </UCard>
      </div>

      <div
        v-if="!summary && !isLoading"
        class="flex flex-col items-center justify-center py-20 text-gray-400"
      >
        <UIcon
          name="i-heroicons-document-text"
          class="w-16 h-16 mb-4 opacity-20"
        />
        <p>There are no summarized videos yet. Enter the link above!</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
