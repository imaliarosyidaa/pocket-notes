<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DropdownMenuItem } from "@nuxt/ui";
import HomeStats from "~/components/home/HomeStats.vue";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { format, isValid, parseISO, isSameDay } from "date-fns";
import { useLocalStorage } from "@vueuse/core";

const items = [
  [
    { label: "New mail", icon: "i-lucide-send", to: "/inbox" },
    { label: "New customer", icon: "i-lucide-user-plus", to: "/customers" },
  ],
] satisfies DropdownMenuItem[][];

const allTasks = useLocalStorage<any[]>("my-tasks-list", []);

const selectedDate = ref(today(getLocalTimeZone()));
// Helper konversi CalendarDate ke Date JS

const toJSDate = (date: any) => {
  if (!date) return new Date();
  return new Date(date.year, date.month - 1, date.day);
};

// 3. LOGIKA FILTER LIST (Berdasarkan tanggal yang diklik di kalender)
const tasksOnSelectedDate = computed(() => {
  const targetDate = toJSDate(selectedDate.value);
  return allTasks.value.filter((task) => {
    return isSameDay(new Date(task.deadline), targetDate);
  });
});

import type { Period, Range } from "../types";
import { sub } from "date-fns";

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end: new Date(),
});

const period = ref<Period>("daily");
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageGrid>
        <div class="lg:col-span-2 flex flex-col gap-2 lg:gap-6">
          <HomeStats :period="period" :range="range" />
          <HomeChart :period="period" :range="range" />
        </div>

        <div class="lg:col-span-1">
          <UPageCard>
            <UPageCard variant="naked">
              <UCalendar multiple v-model="selectedDate" />
            </UPageCard>
            <div class="mt-6 flex-1 overflow-y-auto">
              <div class="mb-4">
                <h3
                  class="font-bold text-sm text-gray-500 flex items-center gap-2 uppercase tracking-wider"
                >
                  <UIcon name="i-lucide-calendar-days" />
                  Task: {{ format(toJSDate(selectedDate), "dd MMM") }}
                </h3>
              </div>

              <div v-if="tasksOnSelectedDate.length > 0" class="space-y-2">
                <div
                  v-for="task in tasksOnSelectedDate"
                  :key="task.id"
                  class="p-3 rounded-lg border border-primary-100 dark:border-primary-900 bg-primary-50/30 dark:bg-primary-900/20 group relative"
                >
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold text-primary italic">{{
                      task.category || "No Category"
                    }}</span>
                  </div>
                  <p class="text-sm font-semibold">{{ task.taskName }}</p>
                </div>
              </div>

              <div v-else class="text-center py-8 opacity-40">
                <p class="text-xs italic">There are no Tasks on this date.</p>
              </div>
            </div>
          </UPageCard>
        </div>
      </UPageGrid>
    </template>
  </UDashboardPanel>
</template>
