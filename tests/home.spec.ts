import { expect, test } from '@playwright/test'

test('monta, desmonta, remonta e encerra a animação na Home', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('.home__scene')).toHaveClass(/home__scene--ready/)
  await expect(page.locator('#inicio')).toHaveAttribute('data-stage', '0')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  // O canvas é o fundo inteiro da Home, inclusive atrás do cabeçalho.
  const canvasBounds = await page.locator('.home__canvas').boundingBox()
  const viewport = page.viewportSize()!
  expect(canvasBounds?.width).toBe(viewport.width)
  expect(canvasBounds?.height).toBe(viewport.height)
  const assembled = await page.locator('.home__canvas').screenshot()
  await page.screenshot({ path: testInfo.outputPath('home-montada.png') })

  await page.locator('#inicio').evaluate((element) => {
    window.scrollTo({ top: (element.clientHeight - innerHeight) * 0.45, behavior: 'instant' })
  })
  await expect(page.locator('#inicio')).toHaveAttribute('data-stage', '1')
  await page.screenshot({ path: testInfo.outputPath('home-intermediaria.png') })

  // A geometria real da seção determina a rolagem, incluindo os diferentes tamanhos mobile.
  await page.locator('#inicio').evaluate((element) => {
    window.scrollTo({ top: element.getBoundingClientRect().top + scrollY + element.clientHeight - innerHeight, behavior: 'instant' })
  })
  await expect(page.locator('#inicio')).toHaveAttribute('data-stage', '2')
  const exploded = await page.locator('.home__canvas').screenshot()
  expect(exploded.equals(assembled)).toBe(false)
  await page.screenshot({ path: testInfo.outputPath('home-desmontada.png') })

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(page.locator('#inicio')).toHaveAttribute('data-stage', '0')

  // Simula o próximo módulo apenas no teste para verificar a saída do palco fixo.
  await page.locator('#inicio').evaluate((element) => {
    const next = document.createElement('section')
    next.style.height = '200vh'
    next.textContent = 'Próximo módulo — apenas no teste'
    element.after(next)
    window.scrollTo({ top: element.offsetTop + element.clientHeight + 20, behavior: 'instant' })
  })
  await expect.poll(() => page.locator('.home__sticky').evaluate((element) => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(80)
  expect(errors).toEqual([])
})

test('movimento reduzido mantém a Home legível sem carregar Three.js', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.locator('#inicio')).toHaveClass(/home--static/)
  await expect(page.locator('.home__fallback')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const menu = page.getByRole('button', { name: 'Abrir menu' })
  if (await menu.isVisible()) await menu.click()
  await expect(page.getByRole('link', { name: 'Fale conosco', exact: true })).toBeVisible()
  if (await page.getByRole('button', { name: 'Fechar menu' }).isVisible()) await page.keyboard.press('Escape')
  await expect(page.locator('.home__fallback')).toHaveJSProperty('naturalWidth', 1672)
  expect(requests.some((url) => /eyewearScene|three\.module/.test(url))).toBe(false)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  // A preferência pode mudar com a página aberta sem exigir recarregamento.
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.home__scene')).toHaveClass(/home__scene--ready/)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#inicio')).toHaveClass(/home--static/)
  await expect(page.locator('.home__fallback')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.home__scene')).toHaveClass(/home__scene--ready/)
})

test('sem WebGL exibe alternativa e mantém o navbar utilizável', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type.includes('webgl')) return null
      return Reflect.apply(original, this, [type, ...args])
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('#inicio')).toHaveClass(/home--static/)
  await expect(page.locator('.home__fallback')).toBeVisible()
  const toggle = page.getByRole('button', { name: 'Abrir menu' })
  if (await toggle.isVisible()) {
    await toggle.click()
    await expect(page.getByRole('link', { name: 'Sobre nós', exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  } else {
    await expect(page.getByRole('link', { name: 'Sobre nós', exact: true })).toBeVisible()
  }
})
