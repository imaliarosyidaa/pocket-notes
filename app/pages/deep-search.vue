<template>
  <UDashboardPanel id="deep-search">
    <template #header>
      <UDashboardNavbar title="Deep Search" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right> </template>
      </UDashboardNavbar>
    </template>

    <template #body class="w-max">
      <div>
        <UCard>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-heroicons-light-bulb" class="text-red-500" />
              Input Keyword
            </h3>
            <div class="flex gap-2">
              <UInput
                v-model="searchQuery"
                placeholder="Example: Event Driven Architecture with Kafka..."
                class="flex-1"
                icon="i-lucide-search"
              />
              <UButton
                icon="i-heroicons-sparkles"
                @click="startResearch"
                :loading="isLoading"
                >Search Research</UButton
              >
            </div>
            <p v-if="errorMsg" class="text-red-500 text-sm italic">
              {{ errorMsg }}
            </p>
          </div>
        </UCard>

        <div v-if="papers.length" class="grid gap-4">
          <UCard v-for="(paper, index) in papers" :key="index">
            <template #header>
              <div class="flex justify-between items-start">
                <h4
                  class="font-bold text-lg text-primary-600 dark:text-primary-400"
                >
                  {{ paper.title }}
                </h4>
                <UBadge color="gray" variant="solid">{{ paper.year }}</UBadge>
              </div>
            </template>

            <p class="text-sm text-gray-500 mb-2 italic">{{ paper.authors }}</p>
            <p class="text-sm line-clamp-3">{{ paper.summary }}</p>

            <template #footer>
              <UButton
                :to="paper.link"
                target="_blank"
                icon="i-lucide-external-link"
                variant="ghost"
                label="Buka Paper / PDF"
                block
              />
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const searchQuery = ref("");
const papers = ref([]);
const isLoading = ref(false);
const errorMsg = ref("");

const startResearch = async () => {
  if (searchQuery.value.trim() === "") {
    errorMsg.value = "Please enter a search keyword";
    return;
  }

  isLoading.value = true;
  try {
    const res = await $fetch("/api/deep-search", {
      method: "POST",
      body: { query: searchQuery.value },
    });
    papers.value = res.data || [];
    console.log("DEBUG PAPERS:", papers.value);
  } finally {
    isLoading.value = false;
  }
};
</script>
