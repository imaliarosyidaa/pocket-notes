<script setup lang="ts">
import { format, parseISO, isValid } from "date-fns";
import type { Task } from "~/types";

const props = defineProps<{
  todo: Task;
  allTasks: Task[]; // Pastikan dipassing dari parent!
}>();

const emits = defineEmits(["close", "save"]);

// Reaktif terhadap perubahan todo atau allTasks
const children = computed(() => {
  if (!props.allTasks) return [];
  return props.allTasks.filter((t) => t.parentTaskId === props.todo.id);
});

const isDone = ref(props.todo.isCompleted);

// Update status lokal jika user ganti pilihan task di list kiri
watch(
  () => props.todo.id,
  () => {
    isDone.value = props.todo.isCompleted;
  },
);

// Kirim perubahan ke localStorage di parent HANYA jika nilainya berubah dari aslinya
watch(isDone, (newVal) => {
  // Cek apakah nilai baru berbeda dengan nilai yang ada di props
  // Ini mencegah "toast hantu" saat baru buka detail
  if (newVal !== props.todo.isCompleted) {
    emits("save", {
      id: props.todo.id,
      isCompleted: newVal,
    });
  }
});

const formattedDeadline = computed(() => {
  const date = parseISO(props.todo.deadline);
  return isValid(date) ? format(date, "dd MMMM yyyy") : props.todo.deadline;
});
</script>

<template>
  <UDashboardPanel id="inbox-2">
    <UDashboardNavbar :title="`Deadline: ${formattedDeadline}`">
      <template #leading>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')"
        />
      </template>
    </UDashboardNavbar>

    <div class="flex-1 p-6 overflow-y-auto">
      <div
        class="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 mb-8"
      >
        <UCheckbox v-model="isDone" size="xl" />
        <div>
          <h3
            class="text-xl font-bold transition-all"
            :class="[
              isDone
                ? 'line-through text-gray-400 italic'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ todo.taskName }}
          </h3>
          <UBadge v-if="todo.category" size="xs" variant="soft" class="mt-1">{{
            todo.category
          }}</UBadge>
        </div>
      </div>

      <div v-if="children.length > 0" class="space-y-4">
        <UDivider label="Sub-Task" icon="i-lucide-list-tree" />
        <div
          v-for="child in children"
          :key="child.id"
          class="flex items-center gap-3 pl-4 py-2 border-b border-gray-50 dark:border-gray-800"
        >
          <UIcon
            name="i-lucide-corner-down-right"
            class="text-gray-400 size-4"
          />
          <UCheckbox :model-value="child.isCompleted" disabled size="md" />
          <span
            class="text-sm"
            :class="{ 'line-through text-gray-400': child.isCompleted }"
          >
            {{ child.taskName }}
          </span>
        </div>
      </div>

      <div v-else class="text-center py-10 opacity-30">
        <p class="text-sm italic">Task ini tidak memiliki sub-Task.</p>
      </div>
    </div>
  </UDashboardPanel>
</template>
