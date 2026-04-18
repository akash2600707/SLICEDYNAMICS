import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

type Props = {
  file: File
  height?: number
}

export default function STLViewer({ file, height = 300 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const mount = mountRef.current
    const width = mount.clientWidth || 400

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x111118)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Grid
    const grid = new THREE.GridHelper(10, 20, 0x2a2a38, 0x2a2a38)
    scene.add(grid)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5)
    dirLight.position.set(5, 8, 5)
    dirLight.castShadow = true
    scene.add(dirLight)
    const fillLight = new THREE.DirectionalLight(0xf97316, 0.3)
    fillLight.position.set(-5, -3, -5)
    scene.add(fillLight)

    // Parse STL
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const geometry = parseSTL(buffer)
        geometry.computeVertexNormals()
        geometry.center()

        // Scale to fit
        const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry))
        const size = new THREE.Vector3()
        box.getSize(size)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 3 / maxDim
        geometry.scale(scale, scale, scale)

        const material = new THREE.MeshPhongMaterial({
          color: 0xf97316,
          specular: 0x333333,
          shininess: 40,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        scene.add(mesh)

        camera.position.set(0, 2, 6)
        camera.lookAt(0, 0, 0)

        setLoading(false)

        // Rotation animation
        let isDragging = false
        let prevX = 0
        let prevY = 0
        let rotX = 0
        let rotY = 0

        renderer.domElement.addEventListener('mousedown', (e) => {
          isDragging = true
          prevX = e.clientX
          prevY = e.clientY
        })
        window.addEventListener('mouseup', () => { isDragging = false })
        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return
          const dx = e.clientX - prevX
          const dy = e.clientY - prevY
          rotY += dx * 0.01
          rotX += dy * 0.01
          mesh.rotation.y = rotY
          mesh.rotation.x = rotX
          prevX = e.clientX
          prevY = e.clientY
        })

        const animate = () => {
          frameRef.current = requestAnimationFrame(animate)
          if (!isDragging) {
            mesh.rotation.y += 0.005
          }
          renderer.render(scene, camera)
        }
        animate()

      } catch {
        setError('Failed to parse STL file. Please ensure it\'s a valid binary or ASCII STL.')
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)

    return () => {
      cancelAnimationFrame(frameRef.current)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [file, height])

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111118', zIndex: 10,
          gap: 10, color: 'var(--color-text-muted)',
        }}>
          <div className="loading-spinner" />
          <span style={{ fontSize: '0.9rem' }}>Loading 3D preview…</span>
        </div>
      )}
      {error && (
        <div style={{
          height,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#111118', color: 'var(--color-error)',
          fontSize: '0.85rem', padding: 24, textAlign: 'center',
        }}>
          {error}
        </div>
      )}
      <div ref={mountRef} style={{ height }} />

      {!loading && !error && (
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          display: 'flex', gap: 6,
        }}>
          {[RotateCcw, ZoomIn, ZoomOut].map((Icon, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '5px 7px',
              cursor: 'pointer',
              display: 'flex',
            }}>
              <Icon size={14} color="var(--color-text-muted)" />
            </div>
          ))}
        </div>
      )}
      {!loading && !error && (
        <p style={{
          position: 'absolute', bottom: 10, left: 10,
          fontSize: '0.7rem', color: 'var(--color-text-subtle)',
          background: 'rgba(0,0,0,0.5)',
          padding: '3px 8px',
          borderRadius: 4,
        }}>
          Drag to rotate
        </p>
      )}
    </div>
  )
}

// ============================================================
// Minimal STL Parser (binary + ASCII support)
// ============================================================
function parseSTL(buffer: ArrayBuffer): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()

  // Detect ASCII vs binary
  const headerBytes = new Uint8Array(buffer, 0, Math.min(80, buffer.byteLength))
  const header = String.fromCharCode(...headerBytes)
  const isBinary = !header.trimStart().startsWith('solid') || isBinarySTL(buffer)

  if (isBinary) {
    const view = new DataView(buffer)
    const numTriangles = view.getUint32(80, true)
    const vertices: number[] = []
    const normals: number[] = []

    for (let i = 0; i < numTriangles; i++) {
      const offset = 84 + i * 50
      const nx = view.getFloat32(offset, true)
      const ny = view.getFloat32(offset + 4, true)
      const nz = view.getFloat32(offset + 8, true)

      for (let v = 0; v < 3; v++) {
        const vOffset = offset + 12 + v * 12
        vertices.push(view.getFloat32(vOffset, true))
        vertices.push(view.getFloat32(vOffset + 4, true))
        vertices.push(view.getFloat32(vOffset + 8, true))
        normals.push(nx, ny, nz)
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  } else {
    // ASCII fallback — basic
    const text = new TextDecoder().decode(buffer)
    const vertices: number[] = []
    const vertexRegex = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g
    let match: RegExpExecArray | null
    while ((match = vertexRegex.exec(text)) !== null) {
      vertices.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]))
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  }

  return geometry
}

function isBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false
  const view = new DataView(buffer)
  const numTriangles = view.getUint32(80, true)
  return buffer.byteLength === 84 + numTriangles * 50
}
