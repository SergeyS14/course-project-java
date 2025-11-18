<template>
  <div class="min-h-screen bg-gray-50 flex">
    <Sidebar />
    <main class="flex-1 lg:ml-64 min-h-screen overflow-x-hidden">
      <div class="container mx-auto px-4 py-8 max-w-full">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'
</script>

