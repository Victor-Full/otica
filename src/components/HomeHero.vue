<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { EyewearScene } from '../features/home/eyewearScene'
import assembledPoster from '../../images/home/eyewear-assembled.jpg'

const section = ref<HTMLElement>()
const sceneHost = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const progress = ref(0)
const sceneReady = ref(false)
const reducedMotion = ref(false)
const unavailable = ref(false)
const stage = computed(() => progress.value < 0.18 ? 0 : progress.value < 0.64 ? 1 : 2)
const stageNames = ['Armação', 'Estrutura', 'Cada detalhe']

let scene: EyewearScene | undefined
let observer: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let media: MediaQueryList | undefined
let animationFrame: number | undefined
let visible = false
let loading = false
let destroyed = false
let generation = 0

// O progresso usa só a distância da Home; nenhuma outra seção controla o modelo.
function scheduleUpdate() {
  if (animationFrame !== undefined || destroyed || document.hidden) return
  animationFrame = requestAnimationFrame(() => {
    animationFrame = undefined
    if (!visible || !section.value || !sceneHost.value) return
    const rect = section.value.getBoundingClientRect()
    const distance = Math.max(1, rect.height - sceneHost.value.clientHeight)
    progress.value = reducedMotion.value || unavailable.value ? 0 : Math.min(1, Math.max(0, -rect.top / distance))
    scene?.setProgress(progress.value)
  })
}

function releaseScene() {
  generation++
  scene?.dispose()
  scene = undefined
  sceneReady.value = false
}

// A foto gerada cobre o carregamento; o Three.js é importado somente quando necessário.
async function loadScene() {
  if (loading || scene || destroyed || reducedMotion.value || unavailable.value) return
  const currentGeneration = generation
  loading = true
  try {
    const { createEyewearScene } = await import('../features/home/eyewearScene')
    if (destroyed || currentGeneration !== generation || !canvas.value || !sceneHost.value) return
    scene = createEyewearScene(canvas.value, sceneHost.value, () => {
      unavailable.value = true
      progress.value = 0
      releaseScene()
    })
    scene.resize()
    scene.setProgress(progress.value)
    sceneReady.value = true
  } catch {
    unavailable.value = true
    progress.value = 0
    releaseScene()
  } finally {
    loading = false
    if (!destroyed && currentGeneration !== generation && visible && !reducedMotion.value && !unavailable.value) void loadScene()
  }
}

function handleMotionChange() {
  reducedMotion.value = media?.matches ?? false
  if (reducedMotion.value) {
    releaseScene()
    progress.value = 0
  } else if (visible) {
    void loadScene()
  }
  scheduleUpdate()
}

function handleVisibility() {
  if (!document.hidden) scheduleUpdate()
}

onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = media.matches
  media.addEventListener('change', handleMotionChange)
  observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible) {
      void loadScene()
      scheduleUpdate()
    }
  })
  if (section.value) observer.observe(section.value)
  resizeObserver = new ResizeObserver(() => {
    scene?.resize()
    scheduleUpdate()
  })
  if (sceneHost.value) resizeObserver.observe(sceneHost.value)
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
  document.addEventListener('visibilitychange', handleVisibility)
})

// Descarte completo permite entrar e sair deste módulo sem acumular recursos gráficos.
onBeforeUnmount(() => {
  destroyed = true
  observer?.disconnect()
  resizeObserver?.disconnect()
  media?.removeEventListener('change', handleMotionChange)
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  document.removeEventListener('visibilitychange', handleVisibility)
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame)
  releaseScene()
})
</script>

<template>
  <!-- Canvas de fundo em tela inteira, preso somente à extensão da seção Início. -->
  <section id="inicio" ref="section" class="home" :class="{ 'home--static': reducedMotion || unavailable }" aria-labelledby="home-title" :data-stage="stage">
    <h1 id="home-title" class="home__sr-only">Ótica Visual — um novo olhar em cada detalhe</h1>
    <div class="home__sticky">
      <figure class="home__figure" aria-label="Armação preta arredondada em três dimensões. A rolagem revela as hastes, retira os parafusos e separa as lentes da frente.">
        <div ref="sceneHost" class="home__scene" :class="{ 'home__scene--ready': sceneReady }">
          <!-- A sombra difusa acompanha o enquadramento sem custo de shadow maps na GPU. -->
          <div class="home__shadow" aria-hidden="true" :style="{ opacity: 0.18 - progress * 0.1 }"></div>
          <img class="home__fallback" :src="assembledPoster" width="1672" height="941" alt="" decoding="async" fetchpriority="high">
          <canvas ref="canvas" class="home__canvas" aria-hidden="true"></canvas>
        </div>
        <figcaption class="home__sr-only">Frente de acetato preto, duas lentes, duas hastes e dois parafusos de dobradiça. Modelo ilustrativo inspirado nas referências da marca.</figcaption>
      </figure>

      <!-- Interface mínima para orientar a rolagem sem disputar espaço com os óculos. -->
      <div class="home__topline" aria-hidden="true"><span>VISUAL</span><span>UM NOVO OLHAR</span></div>
      <div class="home__footer">
        <div class="home__chapter" aria-hidden="true"><span>0{{ stage + 1 }}</span><span class="home__divider"></span><span>{{ stageNames[stage] }}</span></div>
        <div class="home__progress" aria-hidden="true"><span :style="{ transform: `scaleX(${progress})` }"></span></div>
        <p class="home__scroll">{{ reducedMotion || unavailable ? 'Armação em perspectiva' : progress > 0.96 ? 'Role para cima para remontar ↑' : 'Role para explorar ↓' }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* A margem compensa o navbar no fluxo; a cena ocupa inclusive o fundo do cabeçalho. */
.home {
  --navbar-height: 80px;
  position: relative;
  height: 300svh;
  margin-top: calc(-1 * var(--navbar-height));
  background: #eeefeb;
  color: #23463e;
}
.home__sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  height: 100dvh;
  overflow: clip;
  isolation: isolate;
  background: radial-gradient(ellipse at 48% 36%, #fafbf8 0%, #eeefeb 65%, #e1e5df 100%);
}

/* Sem colunas, cartões ou limites de largura: o produto é o plano de fundo da Home. */
.home__figure,
.home__scene,
.home__canvas,
.home__fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}
.home__canvas { display: block; opacity: 0; pointer-events: none; }
.home__fallback { display: block; object-fit: contain; background: #eeefeb; }
.home__scene--ready .home__canvas { opacity: 1; }
.home__scene--ready .home__fallback { visibility: hidden; }
.home__shadow {
  position: absolute;
  left: 15%;
  bottom: 17%;
  width: 70%;
  height: 5%;
  border-radius: 50%;
  background: radial-gradient(ellipse, #28342c, transparent 70%);
  filter: blur(18px);
  pointer-events: none;
}

/* Pequenas legendas ficam acima do canvas, com área livre no centro da tela. */
.home__topline {
  position: absolute;
  top: calc(var(--navbar-height) + 1.75rem);
  inset-inline: var(--page-gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #60746a;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  pointer-events: none;
}
.home__topline > span:first-child { font-weight: 700; }
.home__footer {
  position: absolute;
  right: var(--page-gutter);
  bottom: max(1.75rem, env(safe-area-inset-bottom));
  left: var(--page-gutter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  pointer-events: none;
}
.home__chapter { display: flex; min-width: 10rem; align-items: center; gap: 0.85rem; font-size: 0.8rem; }
.home__chapter > span:first-child { color: #72837a; font-size: 0.7rem; font-variant-numeric: tabular-nums; }
.home__divider { width: 1.5rem; height: 1px; background: #9cac9f; }
.home__scroll { min-width: 14rem; margin: 0; text-align: right; font-size: 0.75rem; color: #52685b; }
.home__progress { flex: 1; max-width: 20rem; height: 2px; background: #c9d2c9; }
.home__progress > span { display: block; height: 100%; background: var(--color-brand-800); transform-origin: left; }

/* Conteúdo semântico acessível, enquanto o foco visual desta etapa é somente a animação. */
.home__sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.home--static { height: 100svh; height: 100dvh; }
.home--static .home__sticky { position: relative; }

/* A câmera também se adapta à orientação; o layout preserva toda a largura no mobile. */
@media (max-width: 1249px) { .home { --navbar-height: 72px; } }
@media (max-width: 760px) {
  .home { height: 270svh; }
  .home__topline { top: calc(var(--navbar-height) + 1.25rem); font-size: 0.55rem; }
  .home__footer { bottom: max(1.5rem, env(safe-area-inset-bottom)); flex-wrap: wrap; gap: 0.85rem; }
  .home__chapter { min-width: 0; gap: 0.6rem; font-size: 0.75rem; }
  .home__scroll { min-width: 0; font-size: 0.65rem; }
  .home__progress { flex: 0 0 100%; max-width: none; order: 3; }
  .home__shadow { bottom: 24%; }
  .home--static { height: 100svh; height: 100dvh; }
}
@media (max-height: 500px) {
  .home__topline { display: none; }
  .home__footer { bottom: 0.75rem; }
}
@media (prefers-reduced-motion: reduce) {
  .home { height: 100svh; height: 100dvh; }
  .home__sticky { position: relative; }
}
</style>
