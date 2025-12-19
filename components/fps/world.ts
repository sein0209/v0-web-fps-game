import * as THREE from "three"

interface Collider {
  min: THREE.Vector3
  max: THREE.Vector3
}

/**
 * 월드 클래스
 * 맵, 조명, 장애물 생성 및 관리
 */
export class World {
  private scene: THREE.Scene
  private colliders: Collider[] = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.createLighting()
    this.createGround()
    this.createWalls()
    this.createObstacles()
  }

  /**
   * 조명 생성
   */
  private createLighting(): void {
    // 환경광
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    // 태양광 (Directional Light)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1)
    sunLight.position.set(50, 100, 50)
    sunLight.castShadow = true
    sunLight.shadow.camera.left = -50
    sunLight.shadow.camera.right = 50
    sunLight.shadow.camera.top = 50
    sunLight.shadow.camera.bottom = -50
    sunLight.shadow.camera.near = 0.1
    sunLight.shadow.camera.far = 200
    sunLight.shadow.mapSize.width = 2048
    sunLight.shadow.mapSize.height = 2048
    this.scene.add(sunLight)
  }

  /**
   * 바닥 생성
   */
  private createGround(): void {
    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x6b8e23,
      roughness: 0.8,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  /**
   * 벽 생성
   */
  private createWalls(): void {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })

    // 경계 벽들
    const walls = [
      { pos: [0, 2.5, -50], size: [100, 5, 1] }, // 뒤
      { pos: [0, 2.5, 50], size: [100, 5, 1] }, // 앞
      { pos: [-50, 2.5, 0], size: [1, 5, 100] }, // 왼쪽
      { pos: [50, 2.5, 0], size: [1, 5, 100] }, // 오른쪽
    ]

    walls.forEach((wall) => {
      const geometry = new THREE.BoxGeometry(...(wall.size as [number, number, number]))
      const mesh = new THREE.Mesh(geometry, wallMaterial)
      mesh.position.set(...(wall.pos as [number, number, number]))
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)

      // 충돌 박스 추가
      const halfSize = new THREE.Vector3(wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2)
      const pos = new THREE.Vector3(...(wall.pos as [number, number, number]))
      this.colliders.push({
        min: pos.clone().sub(halfSize),
        max: pos.clone().add(halfSize),
      })
    })
  }

  /**
   * 장애물 생성
   */
  private createObstacles(): void {
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 })

    const obstacles = [
      { pos: [10, 1.5, 10], size: [3, 3, 3] },
      { pos: [-15, 1.5, -15], size: [4, 3, 4] },
      { pos: [20, 1, -20], size: [2, 2, 2] },
      { pos: [-25, 2, 15], size: [5, 4, 3] },
      { pos: [15, 1.5, -10], size: [3, 3, 3] },
      { pos: [-10, 2, 20], size: [4, 4, 2] },
    ]

    obstacles.forEach((obstacle) => {
      const geometry = new THREE.BoxGeometry(...(obstacle.size as [number, number, number]))
      const mesh = new THREE.Mesh(geometry, obstacleMaterial)
      mesh.position.set(...(obstacle.pos as [number, number, number]))
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)

      // 충돌 박스 추가
      const halfSize = new THREE.Vector3(obstacle.size[0] / 2, obstacle.size[1] / 2, obstacle.size[2] / 2)
      const pos = new THREE.Vector3(...(obstacle.pos as [number, number, number]))
      this.colliders.push({
        min: pos.clone().sub(halfSize),
        max: pos.clone().add(halfSize),
      })
    })
  }

  /**
   * 충돌체 목록 가져오기
   */
  public getColliders(): Collider[] {
    return this.colliders
  }
}
