<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: "Komputasi Statistik",
    to: "/docs/getting-started",
    active: route.path.startsWith("/docs/getting-started"),
  },
  {
    label: "Tutorial",
    to: "/docs/components",
    active: route.path.startsWith("/docs/components"),
  },
  {
    label: "Artikel",
    to: "/docs/components",
    active: route.path.startsWith("/docs/components"),
  },
  {
    label: "About Us",
    to: "/about",
    active: route.path.startsWith("/about"),
  },
  {
    label: "Services",
    to: "/services",
    active: route.path.startsWith("/services"),
  },
  {
    label: "Contact Us",
    to: "/contactus",
    active: route.path.startsWith("/conatactus"),
  },
]);
</script>

<template>
  <UHeader>
    <template #title>
      <Logo class="h-6 w-auto" />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nuxt/ui"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>
