<script setup lang="ts">
// Cada seção é um módulo independente, com estilos e ciclo de vida próprios.
import AppNavbar from './components/AppNavbar.vue'
import HomeHero from './components/HomeHero.vue'
</script>

<template>
  <AppNavbar />
  <main>
    <HomeHero />
  </main>
</template>
