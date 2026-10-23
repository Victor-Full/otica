<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
// Símbolo original separado do nome para controlar a proporção da marca em cada tela.
import brandSymbol from '../../images/logo.png'

// Fonte única dos links: evita repetição e simplifica futuras alterações de ordem ou texto.
const navigationItems = [
  { label: 'Início', href: '#inicio' },
  { label: 'Atendimento em domicílio', href: '#atendimento-domicilio' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Onde atendemos', href: '#regioes-atendidas' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Sobre nós', href: '#sobre' },
]

// Estado exclusivo da navegação mobile.
const isMenuOpen = ref(false)

// Controla apenas a transparência do fundo; logo e links permanecem sempre nítidos.
const navbarBackgroundAlpha = ref('0.92')
let scrollAnimationFrame: number | undefined

function closeMenu() {
  isMenuOpen.value = false
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

// Fecha o menu por teclado, melhorando a navegação assistiva.
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

// Evita manter o estado mobile aberto ao redimensionar para desktop.
function handleDesktopChange(event: MediaQueryListEvent) {
  if (event.matches) closeMenu()
}

// Reduz gradualmente a opacidade durante os primeiros 400 px de rolagem.
function updateNavbarTransparency() {
  if (scrollAnimationFrame !== undefined) return

  scrollAnimationFrame = window.requestAnimationFrame(() => {
    const scrollProgress = Math.min(window.scrollY / 400, 1)
    const alpha = 0.92 - scrollProgress * 0.22
    navbarBackgroundAlpha.value = alpha.toFixed(2)
    scrollAnimationFrame = undefined
  })
}

const desktopMedia = window.matchMedia('(min-width: 1250px)')

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  desktopMedia.addEventListener('change', handleDesktopChange)
  window.addEventListener('scroll', updateNavbarTransparency, { passive: true })
  updateNavbarTransparency()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape)
  desktopMedia.removeEventListener('change', handleDesktopChange)
  window.removeEventListener('scroll', updateNavbarTransparency)

  if (scrollAnimationFrame !== undefined) {
    window.cancelAnimationFrame(scrollAnimationFrame)
  }
})
</script>

<template>
  <!-- Cabeçalho semântico e fixo para manter a navegação sempre disponível. -->
  <header
    class="site-header"
    :style="{ '--navbar-background-alpha': navbarBackgroundAlpha }"
  >
    <nav class="navbar" aria-label="Navegação principal">
      <!-- A marca completa funciona também como atalho para o início da página. -->
      <a class="navbar__brand" href="#inicio" aria-label="Ótica Visual — ir para o início" @click="closeMenu">
        <img :src="brandSymbol" alt="" width="500" height="500" />
        <!-- O nome acompanha o tamanho do símbolo e permanece nítido em qualquer densidade. -->
        <span class="navbar__brand-name" aria-hidden="true">
          <span class="navbar__brand-optica">Ótica</span>
          <span class="navbar__brand-visual">VISUAL</span>
        </span>
      </a>

      <!-- Controle do menu exibido apenas em telas menores. -->
      <button
        class="navbar__toggle"
        type="button"
        :aria-expanded="isMenuOpen"
        aria-controls="primary-navigation"
        :aria-label="isMenuOpen ? 'Fechar menu' : 'Abrir menu'"
        @click="toggleMenu"
      >
        <svg v-if="!isMenuOpen" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>

      <!-- A mesma lista atende desktop e mobile, reduzindo código e inconsistências. -->
      <div id="primary-navigation" class="navbar__panel" :class="{ 'navbar__panel--open': isMenuOpen }">
        <ul class="navbar__links">
          <li v-for="item in navigationItems" :key="item.href">
            <a :href="item.href" :data-label="item.label" @click="closeMenu">
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>

        <!-- Ação principal separada da navegação para ganhar destaque visual. -->
        <a class="navbar__contact" href="#contato" @click="closeMenu">Fale conosco</a>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* Barra principal: leve transparência e sombra discreta dão separação sem pesar. */
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  border-bottom: 1px solid rgb(12 105 94 / 10%);
  background: rgb(255 255 255 / var(--navbar-background-alpha, 0.92));
  box-shadow: 0 0.5rem 2rem rgb(9 76 68 / 7%);
  backdrop-filter: blur(14px);
  transition:
    background-color 120ms linear,
    box-shadow 180ms ease;
}

.navbar {
  position: relative;
  display: flex;
  min-height: 5rem;
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--page-gutter);
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

/* A proporção da imagem original é preservada, evitando distorções da marca. */
.navbar__brand {
  --brand-symbol-size: 3.5rem;
  display: inline-flex;
  flex: 0 0 auto;
  border-radius: 0.5rem;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
}

.navbar__brand img {
  display: block;
  width: var(--brand-symbol-size);
  height: var(--brand-symbol-size);
  object-fit: contain;
}

/* As duas linhas somam cerca de 90% da altura do símbolo, sem esticar a imagem. */
.navbar__brand-name {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.navbar__brand-optica {
  color: var(--color-brand-800);
  font-size: calc(var(--brand-symbol-size) * 0.45);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.navbar__brand-visual {
  color: var(--color-brand-500);
  font-size: calc(var(--brand-symbol-size) * 0.47);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: 0.015em;
}

/* Lista horizontal usada em telas amplas. */
.navbar__panel {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__links {
  display: flex;
  margin: 0;
  padding: 0;
  align-items: center;
  gap: clamp(0.65rem, 1vw, 1rem);
  list-style: none;
}

.navbar__links a {
  position: relative;
  display: inline-grid;
  padding-block: 0.7rem;
  color: var(--color-brand-900);
  font-size: clamp(0.9rem, 1.05vw, 1rem);
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  transition: color 180ms ease;
}

/* Reserva a largura do peso 600 para que o hover não desloque os demais links. */
.navbar__links a::before {
  grid-area: 1 / 1;
  visibility: hidden;
  font-weight: 600;
  content: attr(data-label);
}

.navbar__links a > span {
  grid-area: 1 / 1;
}

.navbar__links a:hover,
.navbar__links a:focus-visible {
  color: var(--color-brand-500);
  font-weight: 600;
}

/* Sublinhado animado reforça o hover sem adicionar fundo ao link. */
.navbar__links a::after {
  position: absolute;
  right: 0;
  bottom: 0.35rem;
  left: 0;
  height: 2px;
  border-radius: 999px;
  background: var(--color-brand-500);
  content: '';
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 180ms ease;
}

.navbar__links a:hover::after,
.navbar__links a:focus-visible::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Botão de contato com contraste alto e dimensão confortável para clique. */
.navbar__contact {
  display: inline-flex;
  min-height: 2.75rem;
  padding: 0.75rem 1.15rem;
  border: 1px solid var(--color-brand-800);
  border-radius: 999px;
  align-items: center;
  justify-content: center;
  color: var(--color-surface);
  background: var(--color-brand-800);
  box-shadow: 0 0.5rem 1.25rem rgb(12 105 94 / 18%);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.navbar__contact:hover,
.navbar__contact:focus-visible {
  color: var(--color-brand-900);
  background: var(--color-brand-200);
  box-shadow: 0 0.75rem 1.5rem rgb(12 105 94 / 24%);
  transform: translateY(-2px);
}

/* O botão mobile é oculto no desktop. */
.navbar__toggle {
  display: none;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border: 1px solid var(--color-brand-200);
  border-radius: 0.75rem;
  color: var(--color-brand-800);
  background: var(--color-surface);
  cursor: pointer;
  place-items: center;
}

.navbar__toggle svg {
  width: 1.45rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

/* Menu compacto: painel independente, confortável para toque e leitura. */
@media (max-width: 1249px) {
  .navbar {
    min-height: 4.5rem;
  }

  .navbar__brand {
    --brand-symbol-size: 3rem;
  }

  .navbar__toggle {
    display: grid;
  }

  .navbar__panel {
    position: absolute;
    top: calc(100% + 1px);
    right: var(--page-gutter);
    left: var(--page-gutter);
    visibility: hidden;
    max-height: 0;
    border: 1px solid rgb(12 105 94 / 12%);
    border-radius: 0 0 1rem 1rem;
    background: var(--color-surface);
    box-shadow: 0 1.25rem 2.5rem rgb(9 76 68 / 12%);
    opacity: 0;
    overflow: hidden;
    align-items: stretch;
    flex-direction: column;
    gap: 0;
    transform: translateY(-0.5rem);
    transition:
      max-height 280ms ease,
      opacity 180ms ease,
      transform 180ms ease,
      visibility 180ms;
  }

  .navbar__panel--open {
    visibility: visible;
    max-height: 35rem;
    opacity: 1;
    transform: translateY(0);
  }

  .navbar__links {
    width: 100%;
    padding: 0.75rem;
    align-items: stretch;
    flex-direction: column;
    gap: 0.125rem;
  }

  .navbar__links a {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.75rem 0.875rem;
    border-radius: 0.625rem;
    align-items: center;
    font-size: 1.05rem;
  }

  .navbar__links a::after {
    display: none;
  }

  .navbar__contact {
    margin: 0 0.75rem 0.75rem;
  }
}

/* Respeita usuários que preferem reduzir animações. */
@media (prefers-reduced-motion: reduce) {
  .navbar__panel,
  .navbar__links a::after,
  .navbar__contact {
    transition: none;
  }
}
</style>
