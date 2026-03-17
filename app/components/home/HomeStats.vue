<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import type { Task, Period, Range } from "../../types";

const props = defineProps<{
  period: Period;
  range: Range;
}>();

// 1. Ambil data dari localStorage (Key-nya harus sama dengan yang kamu pakai sebelumnya)
const localTodo = useLocalStorage<Task[]>('my-tasks-list', []);

// 2. Hitung statistik secara reaktif
const stats = computed(() => {
  const total = localTodo.value.length;
  const completed = localTodo.value.filter(t => t.isCompleted).length;
  const pending = total - completed;

  // Hitung persentase penyelesaian untuk variasi (opsional)
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return [
    {
      title: "Total Tasks",
      icon: "i-lucide-clipboard-list",
      value: total,
      variation: total, // Kita gunakan total sebagai angka utama
      description: "Semua tugas tercatat",
      color: "primary"
    },
    {
      title: "Completed Tasks",
      icon: "i-lucide-check-circle",
      value: completed,
      variation: completionRate, // Di sini kita tampilkan % penyelesaian
      description: `${pending} tugas tersisa`,
      color: "success"
    }
  ];
});
</script>

<template>
  <UPageGrid class="lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: `p-2.5 rounded-full bg-${stat.color}/10 ring ring-inset ring-${stat.color}/25 flex-col`,
        title: 'font-normal text-muted text-xs uppercase',
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <UBadge
          v-if="stat.title === 'Completed Tasks'"
          color="success"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation }}% Selesai
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>