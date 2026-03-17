<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  breakpointsTailwind,
  useBreakpoints,
  useLocalStorage,
} from "@vueuse/core";
import type { Task } from "~/types";

// 1. DATA PERSISTENCE (LocalStorage)
// Pastikan interface Task sudah memiliki properti isCompleted: boolean dan parentTaskId: number | null
const localTodo = useLocalStorage<Task[]>('my-tasks-list', [])

const selectedTodo = ref<Task | null>(null);
const toast = useToast();

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

// Mengontrol State Panel (Slideover untuk Mobile)
const isMailPanelOpen = computed({
  get() {
    return !!selectedTodo.value;
  },
  set(value: boolean) {
    if (!value) {
      selectedTodo.value = null;
    }
  },
});

// 2. LOGIKA UPDATE (Simpan perubahan status atau body dari Content)
const updateLocalData = (payload: Partial<Task> & { id: number }) => {
  const index = localTodo.value.findIndex((t) => t.id === payload.id);

  if (index !== -1) {
    // Update data di array utama (Spread payload agar dinamis bisa update body atau isCompleted)
    localTodo.value[index] = {
      ...localTodo.value[index],
      ...payload
    };

    // Sinkronkan state yang sedang terpilih agar detail view di kanan ikut update
    if (selectedTodo.value?.id === payload.id) {
      selectedTodo.value = { ...localTodo.value[index] };
    }

    toast.add({
      title: "Berhasil diperbarui",
      icon: "i-lucide-check-circle",
      color: "success",
    });
  }
};

// 3. LOGIKA DELETE (Diterima dari emit di TodoList)
const deleteData = (id: number) => {
  const index = localTodo.value.findIndex(t => t.id === id);
  if (index !== -1) {
    localTodo.value.splice(index, 1);
    if (selectedTodo.value?.id === id) {
      selectedTodo.value = null;
    }
    toast.add({
      title: "Dihapus",
      description: "Tugas telah dihapus selamanya.",
      color: "error"
    });
  }
};

// Watcher untuk handle jika data dihapus (sinkronisasi antar tab/window)
watch(
  localTodo,
  (newList) => {
    if (
      selectedTodo.value &&
      !newList.find((t) => t.id === selectedTodo.value?.id)
    ) {
      selectedTodo.value = null;
    }
  },
  { deep: true },
);
</script>

<template>
  <UDashboardPanel
    id="inbox-1"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <UDashboardNavbar title="My Tasks">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>
    </UDashboardNavbar>

    <TodoList
      v-model="selectedTodo"
      :todo="localTodo"
      @delete="deleteData"
    />
  </UDashboardPanel>

  <TodoListContent
    v-if="selectedTodo && !isMobile"
    :todo="selectedTodo"
    :all-tasks="localTodo"
    @close="selectedTodo = null"
    @save="updateLocalData"
  />

  <div
    v-else-if="!selectedTodo"
    class="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900/50"
  >
    <div class="text-center">
      <UIcon
        name="i-lucide-clipboard-list"
        class="size-16 text-gray-400 mb-4 mx-auto"
      />
      <p class="text-gray-500 font-medium">Pilih tugas untuk melihat detail</p>
    </div>
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
      <template #content>
        <div class="h-full flex flex-col">
          <TodoListContent
            v-if="selectedTodo"
            :todo="selectedTodo"
            :all-tasks="localTodo"
            @close="selectedTodo = null"
            @save="updateLocalData"
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>