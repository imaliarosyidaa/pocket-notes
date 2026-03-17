<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  breakpointsTailwind,
  useBreakpoints,
  useLocalStorage,
} from "@vueuse/core";
import type { Mail } from "~/types";

// 1. DATABASE LOKAL (Browser Storage)
const localMails = useLocalStorage<Mail[]>("my-notes-storage", []);

// 2. STATE UI
const selectedMail = ref<Mail | null>(null);
const toast = useToast();

// 3. RESPONSIVITAS (Mobile vs Desktop)
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

// Mengontrol Slideover di Mobile
const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value;
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null;
    }
  },
});

// 4. LOGIKA CRUD (Create, Read, Update, Delete)

// TAMBAH CATATAN
const addNewMail = () => {
  const newId =
    localMails.value.length > 0
      ? Math.max(...localMails.value.map((m) => m.id)) + 1
      : 1;

  const newMail: Mail = {
    id: newId,
    unread: true,
    from: {
      id: 99,
      name: "Local Note",
      email: "personal@storage.com",
      status: "subscribed",
      location: "Offline Storage",
    },
    subject: "Catatan Baru " + newId,
    body: "",
    date: new Date().toISOString(),
  };

  localMails.value.unshift(newMail);
  selectedMail.value = newMail;

  toast.add({
    title: "Catatan Dibuat",
    icon: "i-lucide-plus",
    color: "primary",
  });
};

// UPDATE / SIMPAN CATATAN
const updateLocalData = (payload: { id: number; body: string }) => {
  const index = localMails.value.findIndex((m) => m.id === payload.id);

  if (index !== -1) {
    // Update array di LocalStorage
    localMails.value[index] = {
      ...localMails.value[index],
      body: payload.body,
      date: new Date().toISOString(),
    };

    // Update state aktif agar UI detail sinkron
    if (selectedMail.value?.id === payload.id) {
      selectedMail.value = { ...localMails.value[index] };
    }

    toast.add({
      title: "Saved",
      description: "Changes saved!",
      icon: "i-lucide-save",
      color: "success",
    });
  }
};

// HAPUS CATATAN
const handleDelete = (id: number) => {
  const index = localMails.value.findIndex((m) => m.id === id);
  if (index !== -1) {
    localMails.value.splice(index, 1);

    // Jika yang dihapus sedang dibuka, tutup panelnya
    if (selectedMail.value?.id === id) {
      selectedMail.value = null;
    }

    toast.add({
      title: "Deleted",
      description: "The note has been removed",
      icon: "i-lucide-trash",
      color: "error",
    });
  }
};

// Watcher untuk membersihkan seleksi jika data hilang (misal dari tab lain)
watch(
  localMails,
  (newList) => {
    if (
      selectedMail.value &&
      !newList.find((m) => m.id === selectedMail.value?.id)
    ) {
      selectedMail.value = null;
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
    <UDashboardNavbar title="My Notes">
      <template #leading>
        <UDashboardSidebarCollapse />
      </template>

      <template #right>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          label="Add New"
          size="sm"
          @click="addNewMail"
        />
      </template>
    </UDashboardNavbar>

    <InboxList
      v-model="selectedMail"
      :mails="localMails"
      @delete="handleDelete"
    />
  </UDashboardPanel>

  <InboxMail
    v-if="selectedMail && !isMobile"
    :mail="selectedMail"
    @close="selectedMail = null"
    @save="updateLocalData"
  />

  <div
    v-else-if="!selectedMail"
    class="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900/50"
  >
    <div class="text-center">
      <UIcon
        name="i-lucide-notebook-pen"
        class="size-16 text-gray-400 mb-4 mx-auto"
      />
      <p class="text-gray-500 font-medium">Pilih catatan atau buat baru</p>
    </div>
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
      <template #content>
        <div class="h-full flex flex-col">
          <InboxMail
            v-if="selectedMail"
            :mail="selectedMail"
            @close="selectedMail = null"
            @save="updateLocalData"
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
