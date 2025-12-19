import * as THREE from "three"
import { InputManager } from "./input-manager"
import { Player } from "./player"
import { Enemy } from "./enemy"
import { World } from "./world"
import { HUD } from "./hud"

/**
 * 메인 게임 클래스
 * 게임의 전체 로직, 렌더링, 업데이트를 관리
 */
export class Game {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private inputManager: InputManager
  private player: Player
  private world: World
  private hud: HUD
  private enemies: Enemy[] = []
  private animationId: number | null = null
  private lastTime = 0
  private isRunning = false

  // 게임 상태
  public score = 0
  public kills = 0

  constructor() {
    // Scene 초기화
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x87ceeb)
    this.scene.fog = new THREE.Fog(0x87ceeb, 0, 500)

    // Camera 초기화
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

    // Renderer 초기화
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 입력 관리자 초기화
    this.inputManager = new InputManager()

    // 월드 생성
    this.world = new World(this.scene)

    // 플레이어 초기화
    this.player = new Player(this.camera, this.inputManager, this.world)

    // HUD 초기화
    this.hud = new HUD(this.player)

    // 적 생성
    this.spawnEnemies(5)
  }

  /**
   * 게임 초기화 - DOM에 렌더러 추가 및 이벤트 리스너 등록
   */
  public init(): void {
    const container = document.getElementById("game-container")
    if (container) {
      container.appendChild(this.renderer.domElement)
    }

    // 윈도우 리사이즈 이벤트
    window.addEventListener("resize", this.onWindowResize.bind(this))
  }

  /**
   * 적 생성
   */
  private spawnEnemies(count: number): void {
    for (let i = 0; i < count; i++) {
      const enemy = new Enemy(this.scene, this.player)
      this.enemies.push(enemy)
    }
  }

  /**
   * 게임 시작
   */
  public start(): void {
    this.isRunning = true
    this.lastTime = performance.now()
    this.animate()
  }

  /**
   * 게임 루프 (requestAnimationFrame)
   */
  private animate = (): void => {
    if (!this.isRunning) return

    this.animationId = requestAnimationFrame(this.animate)

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000 // 초 단위로 변환
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()
  }

  /**
   * 게임 로직 업데이트
   */
  private update(deltaTime: number): void {
    // 플레이어 업데이트
    this.player.update(deltaTime)

    // 적 업데이트 및 충돌 검사
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      enemy.update(deltaTime)

      // 플레이어의 총알과 적의 충돌 검사
      if (this.player.checkShootHit(enemy.getPosition(), 1.5)) {
        enemy.takeDamage(25)
        if (enemy.isDead()) {
          this.kills++
          this.score += 100

          // 적 제거 및 리스폰
          setTimeout(() => {
            enemy.respawn()
          }, 3000)
        }
      }

      // 적의 공격 체크
      if (enemy.isAttacking()) {
        this.player.takeDamage(10)
        this.hud.showHitEffect()
      }
    }

    // HUD 업데이트
    this.hud.update(this.score, this.kills)
  }

  /**
   * 렌더링
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * 윈도우 리사이즈 핸들러
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * 게임 정리 및 리소스 해제
   */
  public destroy(): void {
    this.isRunning = false

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    // 입력 관리자 정리
    this.inputManager.destroy()

    // 플레이어 정리
    this.player.destroy()

    // 적 정리
    this.enemies.forEach((enemy) => enemy.destroy())
    this.enemies = []

    // HUD 정리
    this.hud.destroy()

    // Scene 정리
    this.scene.clear()

    // Renderer 정리
    const container = document.getElementById("game-container")
    if (container && this.renderer.domElement.parentElement) {
      container.removeChild(this.renderer.domElement)
    }
    this.renderer.dispose()

    // 이벤트 리스너 제거
    window.removeEventListener("resize", this.onWindowResize.bind(this))
  }
}
