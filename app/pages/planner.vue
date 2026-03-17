<script setup lang="ts">
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
} from "@internationalized/date";
import { format, isValid, parseISO, isSameDay } from "date-fns";
import { useLocalStorage } from "@vueuse/core";

// 1. PENYIMPANAN LOKAL
const items = ref(["Work", "Personal", "Wishlist", "Birtday", "Study"]);
const value = ref("Work");
const allTasks = useLocalStorage<any[]>("my-tasks-list", []);

// 2. STATE TANGGAL (Single Date, bukan Range)
const selectedDate = ref(today(getLocalTimeZone()));

// State Form
const state = reactive({
  taskName: "",
  category: "",
  parentTask: null as any,
});

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

const existingTasks = computed(() => allTasks.value.map((t) => t.taskName));

const onCreateCategory = (query: string) => {
  const newCategory = { label: query, value: query };
  categories.value.push(newCategory);
  state.category = query;
};

// 4. SIMPAN DATA
const saveTask = () => {
  if (!state.taskName) return;

  const newTask = {
    id: Date.now(),
    taskName: state.taskName,
    category: state.category,
    parentTaskId: state.parentTask?.id || null,
    deadline: toJSDate(selectedDate.value).toISOString(),
    createdAt: new Date().toISOString(),
  };

  allTasks.value.unshift(newTask);

  // Reset Form
  state.taskName = "";
  state.parentTask = null;

  useToast().add({
    title: "Task saved successfully.",
    description: `Deadline: ${format(toJSDate(selectedDate.value), "dd MMMM yyyy")}`,
    color: "success",
  });
};

const deleteTask = (id: number) => {
  allTasks.value = allTasks.value.filter((t) => t.id !== id);
};
</script>

<template>
  <UDashboardPanel
    id="calendar-panel"
    :default-size="30"
    :min-size="25"
    :max-size="35"
    resizable
  >
    <UDashboardNavbar title="Select Date" />
    <div class="p-4 flex flex-col h-full overflow-hidden">
      <UCard :ui="{ body: 'p-2' }">
        <UCalendar v-model="selectedDate" class="w-full" />
      </UCard>

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
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="xs"
                @click="deleteTask(task.id)"
              />
            </div>
            <p class="text-sm font-semibold">{{ task.taskName }}</p>
          </div>
        </div>

        <div v-else class="text-center py-8 opacity-40">
          <p class="text-xs italic">There are no Tasks on this date.</p>
        </div>
      </div>
    </div>
  </UDashboardPanel>

  <UDashboardPanel id="form-panel">
    <UDashboardNavbar title="Add New Task" :toggle="false">
      <template #right>
        <UButton
          v-if="selectedDate"
          icon="i-lucide-save"
          label="Save Task"
          color="primary"
          @click="saveTask"
        />
      </template>
    </UDashboardNavbar>

    <div
      v-if="selectedDate"
      class="flex-1 p-4 sm:p-8 overflow-y-auto max-w-2xl mx-auto w-full"
    >
      <div
        class="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center gap-4"
      >
        <div
          class="bg-primary text-white p-3 rounded-lg text-center min-w-[60px]"
        >
          <span class="block text-xs uppercase">{{
            format(toJSDate(selectedDate), "MMM")
          }}</span>
          <span class="block text-xl font-bold leading-none">{{
            format(toJSDate(selectedDate), "dd")
          }}</span>
        </div>
        <div>
          <h4 class="font-bold text-lg">Deadline Task</h4>
          <p class="text-sm text-gray-500">
            {{ format(toJSDate(selectedDate), "EEEE, dd MMMM yyyy") }}
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <UFormField label="Task Name" required>
          <UInput
            v-model="state.taskName"
            placeholder="Enter task name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Category">
            <USelectMenu
              v-model="state.category"
              :items="items"
              placeholder="Select Category"
              creatable
              @create="onCreateCategory"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Sub-Task (Child) From">
            <USelectMenu
              v-model="state.parentTask"
              :items="existingTasks"
              placeholder="Select Parent Task (Optional)"
              by="id"
              searchable
            />
          </UFormField>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center opacity-30">
        <UIcon name="i-lucide-calendar-plus" class="size-20 mb-4" />
        <p>Pilih tanggal di kalender untuk menambah Task</p>
      </div>
    </div>
  </UDashboardPanel>
</template>
