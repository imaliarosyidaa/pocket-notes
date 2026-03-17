<script setup lang="ts">
import type { Mail } from '~/types'
import EditorToolbar from '../editor/EditorToolbar.vue';

const props = defineProps<{
  mail: Mail
}>()

const emits = defineEmits(['close', 'save'])

// State lokal untuk menampung ketikan di editor
// Kita isi awalnya dengan body dari mail yang dipilih
const editContent = ref(props.mail.body)

// Penting: Jika user ganti pilihan catatan saat editor terbuka, update isinya
watch(() => props.mail.id, (newId) => {
  editContent.value = props.mail.body
})

const handleSave = () => {
  // Kirim ID dan konten terbaru ke parent
  emits('save', {
    id: props.mail.id,
    body: editContent.value
  })
}
</script>

<template>
  <UDashboardPanel id="inbox-2">
    <UDashboardNavbar :title="mail.subject" :toggle="false">
      <template #leading>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="-ms-1.5"
          @click="emits('close')"
        />
      </template>

      <template #right>
        <UTooltip text="Save Content">
          <UButton
            icon="i-lucide-save"
            color="primary"
            variant="subtle"
            @click="handleSave"
          />
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
      <EditorToolbar v-model="editContent" />
    </div>
  </UDashboardPanel>
</template>