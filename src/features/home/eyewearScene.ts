import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'

export interface EyewearScene {
  setProgress: (progress: number) => void
  resize: () => void
  dispose: () => void
}

interface MovingPart {
  object: THREE.Object3D
  origin: THREE.Vector3
  destination: THREE.Vector3
  rotation: THREE.Euler
  start: number
  end: number
}

// Interpolação contínua, reversível e sem temporizadores: tudo depende da rolagem local.
function phase(progress: number, start: number, end: number) {
  const t = THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1)
  return t * t * (3 - 2 * t)
}

export function createEyewearScene(canvas: HTMLCanvasElement, host: HTMLElement, onContextLost: () => void): EyewearScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  // Perspectiva ortográfica de produto: evita deformar os aros nas bordas da tela.
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 80)
  const model = new THREE.Group()
  scene.add(model)

  // Reflexos de estúdio calculados uma vez, sem baixar HDRs ou texturas de terceiros.
  const room = new RoomEnvironment()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(room, 0.04, 0.1, 100, { size: 128 })
  scene.environment = environment.texture
  room.dispose()
  pmrem.dispose()
  scene.add(new THREE.HemisphereLight(0xffffff, 0xadafa6, 1.7))
  const key = new THREE.DirectionalLight(0xffffff, 2.4)
  key.position.set(-3, 5, 6)
  const rimLight = new THREE.DirectionalLight(0xe2eee9, 2)
  rimLight.position.set(4, 2, -4)
  scene.add(key, rimLight)

  // Acetato preto com camada de brilho, metal prateado e lentes levemente fumê.
  const acetate = new THREE.MeshPhysicalMaterial({ color: 0x101213, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.11, envMapIntensity: 0.85 })
  const silver = new THREE.MeshStandardMaterial({ color: 0xd8d9d4, roughness: 0.23, metalness: 0.95, envMapIntensity: 1.2 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x242627, roughness: 0.45, metalness: 0.5 })
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xc0d0c8, roughness: 0.055, metalness: 0, clearcoat: 1,
    clearcoatRoughness: 0.04, transparent: true, opacity: 0.24,
    side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.4,
  })
  const materials = [acetate, silver, dark, glass]
  const geometries = new Set<THREE.BufferGeometry>()
  const parts: MovingPart[] = []
  const front = new THREE.Group()
  model.add(front)

  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material) {
    geometries.add(geometry)
    return new THREE.Mesh(geometry, material)
  }

  // Une os vértices das superfícies curvas para evitar reflexos triangulados no acetato.
  function polishedGeometry(geometry: THREE.BufferGeometry, planarCaps = false) {
    geometry.deleteAttribute('normal')
    geometry.deleteAttribute('uv')
    const smooth = mergeVertices(geometry, 0.0001)
    smooth.computeVertexNormals()
    // As faces planas mantêm normais uniformes; só as bordas recebem arredondamento.
    // Isso impede que os triângulos da tampa apareçam nos reflexos do material brilhante.
    if (planarCaps && smooth.index) {
      const positions = smooth.getAttribute('position')
      const normals = smooth.getAttribute('normal')
      for (const group of smooth.groups) {
        if (group.materialIndex !== 0) continue
        for (let i = group.start; i < group.start + group.count; i++) {
          const vertex = smooth.index.getX(i)
          normals.setXYZ(vertex, 0, 0, positions.getZ(vertex) > 0 ? 1 : -1)
        }
      }
    }
    geometry.dispose()
    return smooth
  }

  function register(object: THREE.Object3D, destination: THREE.Vector3, rotation: THREE.Euler, start: number, end: number) {
    model.add(object)
    parts.push({ object, origin: object.position.clone(), destination, rotation, start, end })
  }

  // Silhueta contínua panto: a ponte em fechadura pertence à frente, não se solta.
  const outline = new THREE.Shape()
  outline.moveTo(0, 0.66)
  outline.bezierCurveTo(0.28, 0.68, 0.38, 0.92, 0.95, 1.02)
  outline.bezierCurveTo(1.55, 1.18, 2.1, 0.95, 2.35, 0.8)
  outline.bezierCurveTo(2.53, 0.7, 2.73, 0.75, 2.85, 0.73)
  outline.lineTo(2.85, 0.42)
  outline.bezierCurveTo(2.65, 0.4, 2.5, 0.35, 2.47, 0.12)
  outline.bezierCurveTo(2.4, -0.78, 1.9, -1.17, 1.32, -1.12)
  outline.bezierCurveTo(0.71, -1.12, 0.42, -0.66, 0.36, -0.14)
  outline.bezierCurveTo(0.33, 0.08, 0.2, 0.1, 0.3, 0.3)
  outline.bezierCurveTo(0.4, 0.53, -0.4, 0.53, -0.3, 0.3)
  outline.bezierCurveTo(-0.2, 0.1, -0.33, 0.08, -0.36, -0.14)
  outline.bezierCurveTo(-0.42, -0.66, -0.71, -1.12, -1.32, -1.12)
  outline.bezierCurveTo(-1.9, -1.17, -2.4, -0.78, -2.47, 0.12)
  outline.bezierCurveTo(-2.5, 0.35, -2.65, 0.4, -2.85, 0.42)
  outline.lineTo(-2.85, 0.73)
  outline.bezierCurveTo(-2.73, 0.75, -2.53, 0.7, -2.35, 0.8)
  outline.bezierCurveTo(-2.1, 0.95, -1.55, 1.18, -0.95, 1.02)
  outline.bezierCurveTo(-0.38, 0.92, -0.28, 0.68, 0, 0.66)
  outline.closePath()

  function lensShape(side: number, scale = 1) {
    const lens = new THREE.Shape()
    lens.moveTo(0, 0.9)
    lens.bezierCurveTo(0.6, 0.92, 0.98, 0.6, 1, 0.15)
    lens.bezierCurveTo(1.02, -0.4, 0.55, -0.92, 0, -0.95)
    lens.bezierCurveTo(-0.55, -0.94, -0.9, -0.58, -0.91, -0.05)
    lens.bezierCurveTo(-0.97, 0.5, -0.65, 0.88, 0, 0.9)
    return new THREE.Shape(lens.getPoints(32).map((point) => new THREE.Vector2(side * point.x * scale, point.y * scale)))
  }

  for (const side of [-1, 1]) {
    const points = lensShape(side).getPoints().map((point) => new THREE.Vector2(point.x + side * 1.36, point.y - 0.05))
    outline.holes.push(new THREE.Path(points))
  }
  const faceGeometry = new THREE.ExtrudeGeometry(outline, { depth: 0.22, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.045, bevelSegments: 4, curveSegments: 32 })
  faceGeometry.translate(0, 0, -0.11)
  front.add(mesh(polishedGeometry(faceGeometry, true), acetate))

  // Hastes de seção achatada e espessura real, com ponteiras curvadas atrás das orelhas.
  function templeGeometry(side: number) {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0.12)
    shape.lineTo(2.15, 0.08)
    shape.bezierCurveTo(2.6, 0.07, 2.7, -0.3, 2.95, -0.58)
    shape.bezierCurveTo(3.15, -0.8, 3.2, -1.05, 2.98, -0.92)
    shape.bezierCurveTo(2.65, -0.75, 2.55, -0.15, 2.23, -0.14)
    shape.lineTo(0, -0.12)
    shape.closePath()
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 24 })
    geometry.translate(0, 0, -0.06)
    geometry.rotateY(Math.PI / 2)
    const points = geometry.getAttribute('position')
    for (let i = 0; i < points.count; i++) {
      const length = -points.getZ(i)
      points.setX(i, points.getX(i) + side * (0.08 * Math.sin(length) - Math.max(0, length - 2) * 0.16))
    }
    return polishedGeometry(geometry)
  }

  // Geometria reutilizada nos dois pinos decorativos frontais, sem marcas de terceiros.
  const pinShape = new THREE.Shape()
  pinShape.moveTo(-0.12, -0.045)
  pinShape.lineTo(0.08, -0.045)
  pinShape.quadraticCurveTo(0.15, 0, 0.08, 0.045)
  pinShape.lineTo(-0.12, 0.045)
  pinShape.quadraticCurveTo(-0.15, 0, -0.12, -0.045)
  const pinGeometry = new THREE.ExtrudeGeometry(pinShape, { depth: 0.025, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 12 })
  const barrelGeometry = new THREE.CylinderGeometry(0.063, 0.063, 0.08, 20)

  for (const side of [-1, 1]) {
    const pin = mesh(pinGeometry, silver)
    pin.position.set(side * 2.63, 0.57, 0.16)
    pin.scale.x = side
    front.add(pin)
    const mount = mesh(new THREE.BoxGeometry(0.13, 0.17, 0.22), silver)
    mount.position.set(side * 2.72, 0.52, -0.2)
    front.add(mount)

    // Duas metades intercaladas da dobradiça e um parafuso com fenda e rosca visível.
    for (const y of [-0.09, 0.09]) {
      const barrel = mesh(barrelGeometry, silver)
      barrel.position.set(side * 2.72, 0.52 + y, -0.31)
      front.add(barrel)
    }
    const temple = new THREE.Group()
    temple.position.set(side * 2.72, 0.52, -0.31)
    temple.add(mesh(templeGeometry(side), acetate), mesh(barrelGeometry, silver))
    register(temple, new THREE.Vector3(side * 3.6, 0.95, -0.9), new THREE.Euler(0.12, side * -0.13, side * 0.06), 0.36, 0.94)

    const screw = new THREE.Group()
    screw.position.set(side * 2.72, 0.55, -0.31)
    screw.add(mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.3, 16), silver))
    const head = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 24), silver)
    head.position.y = 0.17
    screw.add(head)
    const slot = mesh(new THREE.BoxGeometry(0.084, 0.003, 0.014), dark)
    slot.position.y = 0.189
    screw.add(slot)
    for (let thread = 0; thread < 6; thread++) {
      const ring = mesh(new THREE.TorusGeometry(0.029, 0.006, 4, 12), silver)
      ring.rotation.x = Math.PI / 2
      ring.position.y = -0.12 + thread * 0.04
      screw.add(ring)
    }
    register(screw, new THREE.Vector3(side * 2.85, 1.65, -0.31), new THREE.Euler(0, Math.PI * 4, 0), 0.18, 0.55)

    const geometry = new THREE.ExtrudeGeometry(lensShape(side, 0.985), { depth: 0.035, bevelEnabled: true, bevelSize: 0.009, bevelThickness: 0.009, bevelSegments: 2, curveSegments: 24 })
    const positions = geometry.getAttribute('position')
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, positions.getZ(i) + 0.045 * (1 - positions.getX(i) ** 2 - positions.getY(i) ** 2))
    }
    const lens = mesh(polishedGeometry(geometry), glass)
    lens.position.set(side * 1.36, -0.05, -0.035)
    register(lens, new THREE.Vector3(side * 1.56, -0.65, 1.6), new THREE.Euler(-0.12, side * 0.15, 0), 0.43, 1)
  }

  let progress = 0
  let aspect = 1
  let portrait = false
  let disposed = false
  const bounds = new THREE.Box3()
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()

  function render() {
    if (disposed) return
    const turn = phase(progress, 0.02, 0.75)
    model.rotation.set(0.06 + turn * 0.27, -0.06 - turn * 0.48, portrait ? -0.6 + turn * 0.14 : -0.025 + turn * 0.06)
    for (const part of parts) {
      const t = phase(progress, part.start, part.end)
      part.object.position.lerpVectors(part.origin, part.destination, t)
      part.object.rotation.set(part.rotation.x * t, part.rotation.y * t, part.rotation.z * t)
    }
    // Enquadramento automático mantém todos os componentes visíveis, montados ou separados.
    model.updateMatrixWorld(true)
    bounds.setFromObject(model)
    bounds.getSize(size)
    bounds.getCenter(center)
    const viewHeight = Math.max(size.y / 0.67, size.x / (aspect * 0.9))
    camera.left = -viewHeight * aspect / 2
    camera.right = viewHeight * aspect / 2
    camera.top = viewHeight / 2
    camera.bottom = -viewHeight / 2
    camera.position.set(center.x, center.y + viewHeight * 0.02, center.z + 20)
    camera.lookAt(center.x, center.y + viewHeight * 0.02, center.z)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  function resize() {
    if (disposed) return
    const { width, height } = host.getBoundingClientRect()
    if (width <= 0 || height <= 0) return
    aspect = width / height
    portrait = aspect < 0.85
    // DPR e área total limitados: o canvas agora cobre a tela inteira.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, portrait ? 1.5 : 1.75, Math.sqrt(3_000_000 / (width * height)))
    renderer.setPixelRatio(Math.max(0.75, pixelRatio))
    renderer.setSize(width, height, false)
    render()
  }

  function handleContextLost(event: Event) {
    event.preventDefault()
    onContextLost()
  }
  canvas.addEventListener('webglcontextlost', handleContextLost)

  return {
    resize,
    setProgress(value) {
      progress = THREE.MathUtils.clamp(value, 0, 1)
      render()
    },
    dispose() {
      if (disposed) return
      disposed = true
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      environment.dispose()
      renderer.dispose()
    },
  }
}
