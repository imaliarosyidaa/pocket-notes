<script setup lang="ts">
import { format, isToday, parseISO, isValid } from "date-fns";
import type { Task } from "~/types";

const props = defineProps<{
  todo: Task[];
}>();

const emit = defineEmits(["delete", "edit"]);

// Refs untuk auto-scroll
const todoRefs = ref<Record<number, Element | null>>({});
const selectedTodo = defineModel<Task | null>();

// Sinkronisasi scroll saat item dipilih
watch(selectedTodo, () => {
  if (!selectedTodo.value) return;
  const el = todoRefs.value[selectedTodo.value.id];
  if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
});

// Helper untuk format tanggal deadline
const formatDeadline = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (!isValid(date)) return "Tanpa Tanggal";
  if (isToday(date)) return `Hari ini, ${format(date, "HH:mm")}`;
  return format(date, "dd MMM yyyy");
};

defineShortcuts({
  arrowdown: () => {
    const index = props.todo.findIndex((t) => t.id === selectedTodo.value?.id);
    if (index === -1) selectedTodo.value = props.todo[0];
    else if (index < props.todo.length - 1)
      selectedTodo.value = props.todo[index + 1];
  },
  arrowup: () => {
    const index = props.todo.findIndex((t) => t.id === selectedTodo.value?.id);
    if (index === -1) selectedTodo.value = props.todo[props.todo.length - 1];
    else if (index > 0) selectedTodo.value = props.todo[index - 1];
  },
});

// Fungsi Dropdown per baris
const getDropdownItems = (item: Task) => [
  [
    {
      label: "Edit Task",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit", item),
    },
  ],
  [
    {
      label: "Hapus",
      icon: "i-lucide-trash",
      color: "error" as const,
      onSelect: () => {
        if (selectedTodo.value?.id === item.id) selectedTodo.value = null;
        emit("delete", item.id);
      },
    },
  ],
];
</script>

<template>
  <div
    class="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 h-full"
  >
    <div
      v-if="todo.length != 0"
      v-for="item in todo"
      :key="item.id"
      :ref="
        (el) => {
          todoRefs[item.id] = el as Element | null;
        }
      "
    >
      <div
        class="p-4 sm:pl-6 sm:pr-2 text-sm cursor-pointer border-l-2 transition-all relative"
        :class="[
          selectedTodo?.id === item.id
            ? 'border-primary bg-primary-50 dark:bg-primary-900/10'
            : 'border-transparent hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50',
        ]"
        @click="selectedTodo = item"
      >
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-1 truncate pr-4">
            <div class="flex items-center gap-2">
              <span
                class="font-semibold text-gray-900 dark:text-white truncate"
              >
                {{ item.taskName || "(Tanpa Nama Task)" }}
              </span>

              <UBadge
                v-if="item.category"
                size="xs"
                variant="subtle"
                color="primary"
                class="capitalize"
              >
                {{ item.category }}
              </UBadge>
            </div>

            <div class="flex items-center gap-3 text-[11px] text-gray-500">
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-calendar" class="size-3" />
                {{ formatDeadline(item.deadline) }}
              </span>

              <span
                v-if="item.parentTaskId"
                class="flex items-center gap-1 text-primary italic"
              >
                <UIcon name="i-lucide-git-merge" class="size-3" />
                Sub-Task
              </span>
            </div>
          </div>

          <div class="items-center flex gap-2 shrink-0">
            <UDropdownMenu :items="getDropdownItems(item)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="xs"
                @click.stop
              />
            </UDropdownMenu>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="todo.length === 0"
      class="p-12 text-center flex flex-col items-center gap-2"
    >
      <UIcon name="i-lucide-clipboard-check" class="size-10 text-gray-300" />
      <p class="text-gray-400 italic text-sm">Tidak ada Task yang ditemukan.</p>
    </div>
  </div>
</template>
