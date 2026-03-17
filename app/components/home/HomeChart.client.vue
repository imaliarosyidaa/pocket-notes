<script setup lang="ts">
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isSameDay,
  isSameWeek,
  isSameMonth,
} from "date-fns";
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip,
} from "@unovis/vue";
import { useLocalStorage } from "@vueuse/core";
import type { Period, Range, Task } from "~/types";

const cardRef = useTemplateRef<HTMLElement | null>("cardRef");

const props = defineProps<{
  period: Period;
  range: Range;
}>();

type DataRecord = {
  date: Date;
  amount: number;
};

const { width } = useElementSize(cardRef);
// 1. Ambil data asli dari LocalStorage
const localTodo = useLocalStorage<Task[]>("my-tasks-list", []);

const data = ref<DataRecord[]>([]);

// 2. Filter & Hitung Tugas per Periode
watch(
  [() => props.period, () => props.range, localTodo],
  () => {
    // Generate rentang tanggal berdasarkan interval yang dipilih
    const dates = (
      {
        daily: eachDayOfInterval,
        weekly: eachWeekOfInterval,
        monthly: eachMonthOfInterval,
      } as Record<Period, typeof eachDayOfInterval>
    )[props.period](props.range);

    data.value = dates.map((date) => {
      // Hitung berapa banyak tugas yang dibuat/deadline pada tanggal ini
      const count = localTodo.value.filter((task) => {
        const taskDate = new Date(task.createdAt); // Bisa diganti ke task.deadline jika ingin grafik deadline

        if (props.period === "daily") return isSameDay(taskDate, date);
        if (props.period === "weekly") return isSameWeek(taskDate, date);
        if (props.period === "monthly") return isSameMonth(taskDate, date);
        return false;
      }).length;

      return { date, amount: count };
    });
  },
  { immediate: true, deep: true },
);

const x = (_: DataRecord, i: number) => i;
const y = (d: DataRecord) => d.amount;

const totalTasks = computed(() =>
  data.value.reduce((acc: number, { amount }) => acc + amount, 0),
);

// Formatter angka biasa (bukan currency)
const formatInt = (value: number) => Math.round(value).toString();

const formatDate = (date: Date): string => {
  return {
    daily: format(date, "d MMM"),
    weekly: format(date, "d MMM"),
    monthly: format(date, "MMM yyy"),
  }[props.period];
};

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return "";
  }
  return formatDate(data.value[i].date);
};

const template = (d: DataRecord) => `${formatDate(d.date)}: ${d.amount} Tugas`;
</script>

<template>
  <UCard
    ref="cardRef"
    :ui="{ root: 'overflow-visible', body: '!px-0 !pt-0 !pb-3' }"
  >
    <template #header>
      <div class="flex items-end justify-between">
        <div>
          <p
            class="text-xs text-muted uppercase mb-1.5 font-bold tracking-wider"
          >
            Task Activity
          </p>
          <p class="text-3xl text-highlighted font-semibold">
            {{ totalTasks }}
            <span class="text-sm font-normal text-muted">Tugas</span>
          </p>
        </div>
        <div class="text-right pb-1">
          <UBadge variant="subtle" color="primary"
            >Periode: {{ period }}</UBadge
          >
        </div>
      </div>
    </template>

    <VisXYContainer
      :data="data"
      :padding="{ top: 40 }"
      class="h-80"
      :width="width"
    >
      <VisLine :x="x" :y="y" color="var(--ui-primary)" />
      <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />

      <VisCrosshair color="var(--ui-primary)" :template="template" />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
/* Style tetap sama untuk konsistensi tema Nuxt UI */
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);
  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);
  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
