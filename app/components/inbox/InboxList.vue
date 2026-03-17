<script setup lang="ts">
import { format, isToday } from "date-fns";
import type { Mail } from "~/types";

const props = defineProps<{
  mails: Mail[];
}>();

// 1. Definisikan emit untuk memberi tahu parent jika ada data yang dihapus
const emit = defineEmits(["delete"]);

const mailsRefs = ref<Record<number, Element | null>>({});
const selectedMail = defineModel<Mail | null>();

watch(selectedMail, () => {
  if (!selectedMail.value) return;
  const ref = mailsRefs.value[selectedMail.value.id];
  if (ref) ref.scrollIntoView({ block: "nearest" });
});

// 2. Fungsi untuk menangani penghapusan
const onDelete = (mail: Mail) => {
  // Jika mail yang dihapus sedang dipilih, batalkan seleksi
  if (selectedMail.value?.id === mail.id) {
    selectedMail.value = null;
  }
  emit("delete", mail.id);
};

// 3. Ubah dropdownItems menjadi fungsi agar bisa menerima context ID mail
const getDropdownItems = (mail: Mail) => [
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error" as const, // Beri warna merah agar user waspada
      onSelect: () => onDelete(mail), // Jalankan fungsi hapus saat dipilih
    },
  ],
];

defineShortcuts({
  arrowdown: () => {
    const index = props.mails.findIndex((m) => m.id === selectedMail.value?.id);
    if (index === -1) selectedMail.value = props.mails[0];
    else if (index < props.mails.length - 1)
      selectedMail.value = props.mails[index + 1];
  },
  arrowup: () => {
    const index = props.mails.findIndex((m) => m.id === selectedMail.value?.id);
    if (index === -1) selectedMail.value = props.mails[props.mails.length - 1];
    else if (index > 0) selectedMail.value = props.mails[index - 1];
  },
});
</script>

<template>
  <div class="overflow-y-auto divide-y divide-default h-full">
    <div
      v-for="(mail, index) in mails"
      :key="mail.id"
      :ref="
        (el) => {
          mailsRefs[mail.id] = el as Element | null;
        }
      "
    >
      <div
        class="p-4 sm:pl-6 sm:pr-2 text-sm cursor-pointer border-l-2 transition-colors relative"
        :class="[
          mail.unread ? 'text-highlighted' : 'text-toned',
          selectedMail && selectedMail.id === mail.id
            ? 'border-primary bg-primary/10'
            : 'border-bg hover:border-primary hover:bg-primary/5',
        ]"
        @click="selectedMail = mail"
      >
        <div
          class="flex items-center justify-between"
          :class="[mail.unread && 'font-semibold']"
        >
          <div class="flex items-center gap-3 truncate pr-4">
            {{ mail.subject || "(No Subject)" }}
            <UChip v-if="mail.unread" />
          </div>

          <div class="items-center flex gap-2 shrink-0">
            <span class="text-xs text-dimmed">
              {{
                isToday(new Date(mail.date))
                  ? format(new Date(mail.date), "HH:mm")
                  : format(new Date(mail.date), "dd MMM")
              }}
            </span>

            <UDropdownMenu :items="getDropdownItems(mail)">
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
        <p class="text-dimmed line-clamp-1 mt-1">
          {{ mail.body || "No content..." }}
        </p>
      </div>
    </div>
  </div>
</template>
