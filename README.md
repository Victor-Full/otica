# Ótica Visual

Site desenvolvido por módulos com Vue 3, TypeScript e Vite.

## Desenvolvimento

Use Node.js `^22.18.0` ou `>=24.12.0`, conforme o `package.json`.
No PowerShell, `npm.cmd` evita o bloqueio de scripts do `npm.ps1`.

```powershell
npm.cmd install
npm.cmd run dev
```

## Validação e produção

```powershell
npm.cmd run type-check
npm.cmd run build
npm.cmd run preview
```

O build executa a checagem de tipos e gera o site em `dist/`.
O comando `preview` permite conferir esse resultado localmente.

## Estrutura atual

- `src/components/AppNavbar.vue`: navegação responsiva, marca e botão de contato.
- `src/App.vue`: composição da página e cenário temporário para testar o navbar e a rolagem.
- `src/assets/base.css`: cores da marca, tipografia e estilos globais de acessibilidade.
- `src/assets/main.css`: entrada dos estilos da aplicação.
- `images/logo.png`: símbolo original utilizado no navbar e como favicon.
- `images/logoOtica.png`: versão completa original da marca, preservada como referência.

## Conferência visual do módulo

Validar desktop e mobile: encaixe dos links, hover, foco por teclado, abertura e
fechamento do menu, tecla Escape e transparência durante a rolagem. O menu compacto
é usado abaixo de 1250 px. As seções futuras ainda não foram implementadas; seus
destinos no menu estão reservados e o botão de contato aponta para `#contato`.
