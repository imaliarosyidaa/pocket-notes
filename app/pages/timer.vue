<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'

// Konfigurasi waktu (dalam detik)
const WORK_TIME = 25 * 60
const BREAK_TIME = 5 * 60

const timeLeft = ref(WORK_TIME)
const isWorking = ref(true)
const isActive = ref(false)

// Format waktu dari detik ke MM:SS
const displayTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Hitung persentase untuk UProgress
const progress = computed(() => {
  const total = isWorking.value ? WORK_TIME : BREAK_TIME
  return ((total - timeLeft.value) / total) * 100
})

// Logika Timer menggunakan VueUse
const { pause, resume } = useIntervalFn(() => {
  if (timeLeft.value > 0) {
    timeLeft.value--
  } else {
    toggleMode()
    // Optional: Tambahkan suara notifikasi di sini
  }
}, 1000, { immediate: false })

const toggleTimer = () => {
  isActive.value = !isActive.value
  if (isActive.value) resume()
  else pause()
}

const resetTimer = () => {
  pause()
  isActive.value = false
  timeLeft.value = isWorking.value ? WORK_TIME : BREAK_TIME
}

const toggleMode = () => {
  isWorking.value = !isWorking.value
  resetTimer()
}
</script>

<template>
  <UContainer class="py-12 flex justify-center">
    <UCard class="w-full max-w-md text-center shadow-xl">
      <template #header>
        <div class="flex justify-center gap-2">
          <UBadge :color="isWorking ? 'primary' : 'emerald'" variant="subtle" size="lg">
            {{ isWorking ? 'Focus Session' : 'Short Break' }}
          </UBadge>
        </div>
      </template>

      <div class="py-8">
        <h1 class="text-7xl font-mono font-bold tracking-tighter text-gray-900 dark:text-white mb-6">
          {{ displayTime }}
        </h1>
        
        <UProgress :value="progress" :color="isWorking ? 'primary' : 'emerald'" class="mb-8" />

        <div class="flex items-center justify-center gap-4">
          <UButton
            :icon="isActive ? 'i-lucide-pause' : 'i-lucide-play'"
            size="xl"
            :color="isWorking ? 'primary' : 'emerald'"
            class="rounded-full p-4"
            @click="toggleTimer"
          />
          
          <UButton
            icon="i-lucide-refresh-cw"
            size="xl"
            color="gray"
            variant="ghost"
            class="rounded-full p-4"
            @click="resetTimer"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <UButton
            variant="link"
            color="gray"
            label="Switch to Break"
            v-if="isWorking"
            @click="toggleMode"
          />
          <UButton
            variant="link"
            color="gray"
            label="Switch to Work"
            v-else
            @click="toggleMode"
          />
          
          <p class="text-xs text-gray-400 font-medium italic">
            Stay focused, you got this!
          </p>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>