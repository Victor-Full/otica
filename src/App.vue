<script setup lang="ts">
// O navbar fica isolado para facilitar manutenção e testes responsivos.
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <!-- Estrutura mínima da aplicação nesta etapa: apenas o navbar em contexto real. -->
  <AppNavbar />

  <!-- Área neutra usada para validar contraste, posição fixa e links internos. -->
  <main id="inicio" class="navbar-test-area" tabindex="-1">
    <p>Ótica Visual</p>
    <h1>Teste isolado do navbar</h1>
  </main>
</template>

<style scoped>
/* Cenário temporário de teste; será substituído pelo primeiro módulo da página. */
.navbar-test-area {
  min-height: 120vh;
  padding: clamp(5rem, 10vw, 8rem) var(--page-gutter);
  background:
    radial-gradient(circle at 75% 15%, rgb(142 218 207 / 18%), transparent 28rem),
    var(--color-surface);
}

.navbar-test-area p {
  margin-bottom: 0.5rem;
  color: var(--color-brand-600);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.navbar-test-area h1 {
  max-width: 14ch;
  color: var(--color-brand-900);
  font-size: clamp(2rem, 6vw, 4.5rem);
  line-height: 1.05;
}
</style>
