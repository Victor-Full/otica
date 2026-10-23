# Ótica Visual

Site desenvolvido por módulos com Vue 3, TypeScript e Vite.

## Desenvolvimento

Use Node.js `24.22.1` (LTS), registrado em `.nvmrc`. O `package.json` aceita
essa versão e atualizações posteriores da linha 24, para receber novas correções.
Essa versão inclui as [correções de segurança de outubro de 2026](https://nodejs.org/en/blog/release/v24.22.1).
No PowerShell, `npm.cmd` evita o bloqueio de scripts do `npm.ps1`.

```powershell
npm.cmd ci
npm.cmd run dev
```

## Validação e produção

```powershell
npm.cmd run type-check
npm.cmd run build
npm.cmd run preview
npm.cmd run test:e2e
```

O build executa a checagem de tipos e gera o site em `dist/`.
O comando `preview` permite conferir esse resultado localmente.

## Estrutura atual

- `src/components/AppNavbar.vue`: navegação responsiva, marca e botão de contato.
- `src/App.vue`: composição dos módulos da página.
- `src/components/HomeHero.vue`: Home em tela inteira, rolagem local e imagem alternativa sem animação.
- `src/features/home/eyewearScene.ts`: modelo ilustrativo em Three.js e descarte dos recursos gráficos.
- `src/assets/base.css`: cores da marca, tipografia e estilos globais de acessibilidade.
- `src/assets/main.css`: entrada dos estilos da aplicação.
- `images/logo.png`: símbolo original utilizado no navbar e como favicon.
- `images/logoOtica.png`: versão completa original da marca, preservada como referência.
- `images/home/`: imagens geradas de referência e apresentação da armação.
- `docs/home-visual-references.md`: pesquisa visual, decisões, fontes e prompts das imagens.

## Conferência visual do módulo

Validar desktop e mobile: encaixe dos links, hover, foco por teclado, abertura e
fechamento do menu, tecla Escape e transparência durante a rolagem. O menu compacto
é usado abaixo de 1250 px. As seções futuras ainda não foram implementadas; seus
destinos no menu estão reservados e o botão de contato aponta para `#contato`.

## Home 3D

A armação preta arredondada é ilustrativa e construída em código, inspirada nas
imagens fornecidas pelo usuário. O canvas ocupa a tela inteira, atrás do navbar,
com apenas pequenos indicadores de rolagem. A rolagem nativa gira o modelo, retira
os parafusos e separa hastes e lentes da frente. Subir reverte a desmontagem;
o palco fixo termina junto com a seção `#inicio`.

O módulo Three.js é carregado separadamente, quando a Home entra na tela. A cena
renderiza sob demanda e limita a densidade e a área do canvas. O ambiente de reflexos
é calculado localmente, sem HDR externo. Movimento reduzido ou ausência de WebGL usam
a imagem gerada `eyewear-assembled.jpg`, mantendo a navegação disponível.
O descarte de geometrias, materiais, ambiente, observadores e eventos acompanha o ciclo de vida do módulo.

Os testes Playwright cobrem cinco tamanhos/orientações, canvas em tela inteira,
rolagem nos dois sentidos, limite da Home, ausência de WebGL, mudança de preferência
de movimento e navegação mobile.
As capturas de cada execução ficam em `test-results/`, ignorado pelo Git.
No Windows, os testes usam o Chrome instalado; em outros ambientes, instale o navegador
com `npx playwright install chromium`, ou defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Referência técnica: [renderização sob demanda no Three.js](https://threejs.org/manual/pages/rendering-on-demand.html).
