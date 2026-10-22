// The hero's 3D "scam radar": metallic coins (money) and red diamonds (red flags)
// float over a radar floor whose sweeping beam lights up every red flag it passes.
// The pointer pushes nearby pieces away and tilts the camera. Plain three.js,
// loaded on demand by HeroScene.
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  RingGeometry,
  Scene,
  Timer,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const COIN_COUNT = 28
const FLAG_COUNT = 8
const FLOOR_Y = -2.6
const RADAR_RADIUS = 10.5
const BEAM_WIDTH = Math.PI / 5
const BEAM_SPEED = 0.55 // radians per second
const PUSH_RADIUS = 2.6

// Small seeded random generator so the layout is the same on every visit.
function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function circlePoints(radius, segments = 96) {
  const points = []
  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2
    points.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
  }
  return new Float32BufferAttribute(points, 3)
}

export class RadarScene {
  constructor(container, { animate = true } = {}) {
    this.container = container
    this.animate = animate
    this.items = []
    this.ndc = new Vector2()
    this.pointerActive = false
    this.pointerWorld = new Vector3(99, 99, 0)
    this.visible = true
    this.raycaster = new Raycaster()
    this.pointerPlane = new Plane(new Vector3(0, 0, 1), 0)
    this.timer = new Timer()
    this.timer.connect(document)

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.scene = new Scene()
    const pmrem = new PMREMGenerator(renderer)
    const room = new RoomEnvironment()
    this.environment = pmrem.fromScene(room, 0.04).texture
    this.scene.environment = this.environment
    room.dispose()
    pmrem.dispose()

    this.camera = new PerspectiveCamera(32, 1, 0.1, 100)
    this.cameraBase = new Vector3(0, 3.4, 15)
    this.camera.position.copy(this.cameraBase)
    this.lookTarget = new Vector3(0, -0.4, 0)

    this.scene.add(new AmbientLight(0x9fb4d9, 0.35))
    const key = new DirectionalLight(0xffffff, 1.8)
    key.position.set(4, 8, 6)
    this.scene.add(key)
    const rim = new PointLight(0x2dd4bf, 60, 30, 2)
    rim.position.set(-6, 1.5, -4)
    this.scene.add(rim)

    this.buildField()
    this.buildRadar()

    this.tick = this.tick.bind(this)
    this.handlePointerMove = this.handlePointerMove.bind(this)
    this.handlePointerLeave = () => {
      this.pointerActive = false
    }
    if (animate) {
      container.addEventListener('pointermove', this.handlePointerMove)
      container.addEventListener('pointerleave', this.handlePointerLeave)
    }

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(container)
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      this.updateLoop()
    })
    this.visibilityObserver.observe(container)
    this.resize()
    this.updateLoop()
  }

  buildField() {
    const random = seededRandom(7)
    const coinGeometry = new CylinderGeometry(0.62, 0.62, 0.13, 48)
    const edgeGeometry = new TorusGeometry(0.62, 0.075, 10, 48)
    const flagGeometry = new OctahedronGeometry(0.56, 0)
    const coinMaterials = [
      new MeshStandardMaterial({ color: 0x1fd1b9, metalness: 0.9, roughness: 0.22 }),
      new MeshStandardMaterial({ color: 0x1a2c50, metalness: 0.75, roughness: 0.3 }),
      new MeshStandardMaterial({ color: 0xdfe8f5, metalness: 0.2, roughness: 0.28 }),
    ]
    this.sharedResources = [coinGeometry, edgeGeometry, flagGeometry, ...coinMaterials]

    // Spread pieces out, keeping a minimum gap between them.
    const placed = []
    const place = () => {
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const candidate = new Vector3(-7.5 + random() * 15, -1.7 + random() * 4.4, -3.5 + random() * 5.5)
        if (placed.every((point) => point.distanceTo(candidate) > 1.25)) {
          placed.push(candidate)
          return candidate
        }
      }
      const fallback = new Vector3(-7.5 + random() * 15, -1.7 + random() * 4.4, -3.5 + random() * 5.5)
      placed.push(fallback)
      return fallback
    }

    for (let index = 0; index < COIN_COUNT + FLAG_COUNT; index += 1) {
      const isFlag = index < FLAG_COUNT
      let object
      let material = null
      if (isFlag) {
        material = new MeshStandardMaterial({
          color: 0xd03b3b,
          metalness: 0.25,
          roughness: 0.32,
          emissive: 0xff2d2d,
          emissiveIntensity: 0.1,
        })
        object = new Mesh(flagGeometry, material)
        object.scale.set(1, 1.35, 1)
      } else {
        const coinMaterial = coinMaterials[index % coinMaterials.length]
        object = new Group()
        object.add(new Mesh(coinGeometry, coinMaterial))
        const edge = new Mesh(edgeGeometry, coinMaterial)
        edge.rotation.x = Math.PI / 2
        object.add(edge)
      }
      const base = place()
      object.position.copy(base)
      object.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
      this.scene.add(object)
      this.items.push({
        object,
        material,
        isFlag,
        base,
        offset: new Vector3(),
        velocity: new Vector3(),
        spin: new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.9),
        phase: random() * Math.PI * 2,
        glow: 0,
      })
    }
  }

  buildRadar() {
    const radar = new Group()
    radar.position.y = FLOOR_Y
    const ringMaterial = new LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.2 })
    const axisMaterial = new LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.1 })
    this.sharedResources.push(ringMaterial, axisMaterial)

    for (const radius of [2.6, 5.2, 7.8, RADAR_RADIUS]) {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', circlePoints(radius))
      radar.add(new LineLoop(geometry, ringMaterial))
    }
    for (const [x, z] of [
      [RADAR_RADIUS, 0],
      [0, RADAR_RADIUS],
    ]) {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([-x, 0, -z, x, 0, z], 3))
      radar.add(new Line(geometry, axisMaterial))
    }

    // The beam: a flat sector plus a bright leading edge, turning around the y axis.
    this.beam = new Group()
    const sector = new Mesh(
      new RingGeometry(0.2, RADAR_RADIUS, 64, 1, 0, BEAM_WIDTH),
      new MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.16,
        side: DoubleSide,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    sector.rotation.x = -Math.PI / 2
    this.beam.add(sector)
    const edgeGeometry = new BufferGeometry()
    edgeGeometry.setAttribute(
      'position',
      new Float32BufferAttribute([0, 0.01, 0, Math.cos(BEAM_WIDTH) * RADAR_RADIUS, 0.01, -Math.sin(BEAM_WIDTH) * RADAR_RADIUS], 3),
    )
    this.beam.add(new Line(edgeGeometry, new LineBasicMaterial({ color: 0x46ecd5, transparent: true, opacity: 0.7 })))
    this.beam.rotation.y = 0.4
    radar.add(this.beam)
    this.scene.add(radar)
  }

  handlePointerMove(event) {
    const box = this.container.getBoundingClientRect()
    this.ndc.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1)
    this.pointerActive = true
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.container
    if (!width || !height) return
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    // Pull the camera back on narrow screens so the whole field stays in frame.
    this.cameraBase.z = this.camera.aspect < 1.4 ? 15 + (1.4 - this.camera.aspect) * 13 : 15
    this.camera.updateProjectionMatrix()
    if (!this.running) this.renderStill()
  }

  updateLoop() {
    const shouldRun = this.animate && this.visible
    if (shouldRun === this.running) return
    this.running = shouldRun
    this.renderer.setAnimationLoop(shouldRun ? this.tick : null)
  }

  // Is this flag inside the beam's sector right now?
  inBeam(position) {
    const angle = Math.atan2(-position.z, position.x)
    const relative = (((angle - this.beam.rotation.y) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    return relative <= BEAM_WIDTH
  }

  renderStill() {
    this.camera.position.copy(this.cameraBase)
    this.camera.lookAt(this.lookTarget)
    for (const item of this.items) {
      if (!item.isFlag) continue
      item.material.emissiveIntensity = this.inBeam(item.object.position) ? 2.2 : 0.1
    }
    this.renderer.render(this.scene, this.camera)
  }

  tick(time) {
    this.timer.update(time)
    const dt = Math.min(this.timer.getDelta(), 1 / 30)
    const elapsed = this.timer.getElapsed()

    this.beam.rotation.y = (0.4 + elapsed * BEAM_SPEED) % (Math.PI * 2)

    if (this.pointerActive) {
      this.raycaster.setFromCamera(this.ndc, this.camera)
      this.raycaster.ray.intersectPlane(this.pointerPlane, this.pointerWorld)
    }

    for (const item of this.items) {
      const { object, base, offset, velocity, spin } = item
      // Push away from the pointer, then spring back home.
      if (this.pointerActive) {
        const dx = object.position.x - this.pointerWorld.x
        const dy = object.position.y - this.pointerWorld.y
        const distance = Math.hypot(dx, dy)
        if (distance < PUSH_RADIUS && distance > 0.001) {
          const force = (1 - distance / PUSH_RADIUS) ** 2 * 26 * dt
          velocity.x += (dx / distance) * force
          velocity.y += (dy / distance) * force
          velocity.z += force * 0.45
        }
      }
      velocity.addScaledVector(offset, -8 * dt).multiplyScalar(1 - Math.min(1, 3.4 * dt))
      offset.addScaledVector(velocity, dt)

      object.position.set(
        base.x + offset.x,
        base.y + offset.y + Math.sin(elapsed * 0.7 + item.phase) * 0.18,
        base.z + offset.z,
      )
      const boost = 1 + velocity.length() * 1.5
      object.rotation.x += spin.x * dt * boost
      object.rotation.y += spin.y * dt * boost
      object.rotation.z += spin.z * dt * boost

      if (item.isFlag) {
        item.glow = this.inBeam(object.position) ? 1 : Math.max(0, item.glow - dt * 0.7)
        item.material.emissiveIntensity = 0.1 + item.glow * 2.4
        const scale = 1 + item.glow * 0.12
        object.scale.set(scale, 1.35 * scale, scale)
      }
    }

    const targetX = this.pointerActive ? this.ndc.x * 1.6 : 0
    const targetY = this.pointerActive ? this.ndc.y * 0.8 : 0
    this.camera.position.x += (this.cameraBase.x + targetX - this.camera.position.x) * Math.min(1, dt * 2.5)
    this.camera.position.y += (this.cameraBase.y + targetY - this.camera.position.y) * Math.min(1, dt * 2.5)
    this.camera.position.z = this.cameraBase.z
    this.camera.lookAt(this.lookTarget)

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    this.resizeObserver.disconnect()
    this.visibilityObserver.disconnect()
    this.container.removeEventListener('pointermove', this.handlePointerMove)
    this.container.removeEventListener('pointerleave', this.handlePointerLeave)
    this.timer.dispose()
    this.scene.traverse((object) => {
      object.geometry?.dispose()
      if (object.material && !this.sharedResources.includes(object.material)) object.material.dispose()
    })
    for (const resource of this.sharedResources) resource.dispose()
    this.environment.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
